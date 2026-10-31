from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.models.user import User
from app.services.live_ops_service import LiveOpsService
from app.api.deps import get_current_user

router = APIRouter(tags=["Day-of Live Operations"])

class VendorStatusUpdateRequest(BaseModel):
    status: str # Expected, Arrived, Late, No Show
    notes: Optional[str] = None

class IssueCreateRequest(BaseModel):
    title: str
    severity: str = "Medium" # Low, Medium, High, Emergency
    description: Optional[str] = None
    assigned_to_id: Optional[str] = None
    issue_id: Optional[str] = None

class IssueResolveRequest(BaseModel):
    resolution_notes: str

# WebSocket Connection Manager for live ops
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, wedding_id: str, websocket: WebSocket):
        await websocket.accept()
        if wedding_id not in self.active_connections:
            self.active_connections[wedding_id] = []
        self.active_connections[wedding_id].append(websocket)

    def disconnect(self, wedding_id: str, websocket: WebSocket):
        if wedding_id in self.active_connections:
            if websocket in self.active_connections[wedding_id]:
                self.active_connections[wedding_id].remove(websocket)

    async def broadcast(self, wedding_id: str, message: dict):
        if wedding_id in self.active_connections:
            for connection in self.active_connections[wedding_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    pass

manager = ConnectionManager()

@router.get("/weddings/{wedding_id}/live-ops")
def get_live_ops(
    wedding_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        LiveOpsService.seed_default_live_ops_if_empty(db, wedding_id)
        return LiveOpsService.get_live_ops_summary(db, wedding_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/weddings/{wedding_id}/live-ops/checkins/{checkin_id}/status")
async def update_vendor_checkin_status(
    wedding_id: str,
    checkin_id: str,
    data: VendorStatusUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        checkin = LiveOpsService.update_vendor_status(db, checkin_id, data.status, data.notes)
        # Broadcast update over WebSocket
        await manager.broadcast(wedding_id, {
            "type": "VENDOR_CHECKIN_UPDATED",
            "checkin_id": checkin.id,
            "status": checkin.status,
            "arrived_time": checkin.arrived_time.isoformat() if checkin.arrived_time else None
        })
        return {
            "id": checkin.id,
            "status": checkin.status,
            "arrived_time": checkin.arrived_time.isoformat() if checkin.arrived_time else None
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/weddings/{wedding_id}/live-ops/checkins/{checkin_id}/token")
def create_vendor_arrival_link(
    wedding_id: str,
    checkin_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        st = LiveOpsService.create_vendor_checkin_token(db, checkin_id)
        return {
            "message": "Vendor mobile arrival link generated.",
            "arrival_link": f"/vendor-checkin/{st.token}",
            "token": st.token,
            "expires_at": st.expires_at.isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Public vendor arrival endpoint (Mobile friendly, no login required)
@router.post("/live-ops/public/vendor-checkin/{token}")
async def vendor_public_arrival(token: str, db: Session = Depends(get_db)):
    try:
        result = LiveOpsService.vendor_mobile_checkin(db, token)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/weddings/{wedding_id}/live-ops/run-late-check")
def trigger_late_check(
    wedding_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Run the 1-minute late arrival detection job."""
    flagged = LiveOpsService.run_minute_late_vendor_check(db)
    return {"message": "Late arrival scan complete", "vendors_flagged_late": flagged}

@router.post("/weddings/{wedding_id}/live-ops/issues")
async def create_or_update_issue(
    wedding_id: str,
    data: IssueCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        issue = LiveOpsService.create_or_update_issue(
            db=db,
            wedding_id=wedding_id,
            title=data.title,
            severity=data.severity,
            description=data.description,
            assigned_to_id=data.assigned_to_id,
            issue_id=data.issue_id
        )
        await manager.broadcast(wedding_id, {
            "type": "ISSUE_REPORTED",
            "issue_id": issue.id,
            "title": issue.title,
            "severity": issue.severity,
            "status": issue.status
        })
        return {
            "id": issue.id,
            "title": issue.title,
            "severity": issue.severity,
            "status": issue.status
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/weddings/{wedding_id}/live-ops/issues/{issue_id}/resolve")
async def resolve_issue(
    wedding_id: str,
    issue_id: str,
    data: IssueResolveRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        issue = LiveOpsService.resolve_issue(db, issue_id, data.resolution_notes)
        await manager.broadcast(wedding_id, {
            "type": "ISSUE_RESOLVED",
            "issue_id": issue.id,
            "status": "Resolved"
        })
        return {"id": issue.id, "status": issue.status, "resolved_at": issue.resolved_at.isoformat()}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.websocket("/ws/live-ops/{wedding_id}")
async def live_ops_websocket(websocket: WebSocket, wedding_id: str):
    await manager.connect(wedding_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Echo heartbeat or client ping
            await websocket.send_json({"type": "PONG", "message": "Connection active"})
    except WebSocketDisconnect:
        manager.disconnect(wedding_id, websocket)

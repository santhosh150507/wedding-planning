from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.models.user import User
from app.models.wedding import Wedding, WeddingEvent
from app.models.task import Task
from app.services.wedding_service import WeddingService
from app.services.task_engine_service import TaskEngineService
from app.api.deps import get_current_user

router = APIRouter(prefix="/weddings", tags=["Wedding Management"])

class ConvertEnquiryRequest(BaseModel):
    enquiry_id: str

class TaskCreateRequest(BaseModel):
    title: str
    description: Optional[str] = None
    priority: str = "Medium"
    status: str = "To Plan"
    assigned_to_id: Optional[str] = None
    due_date: str

class TaskUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    assigned_to_id: Optional[str] = None
    due_date: Optional[str] = None

class EventCreateRequest(BaseModel):
    title: str
    venue: str
    event_date: str
    start_time: str
    end_time: str
    dress_code: Optional[str] = None
    description: Optional[str] = None

@router.get("")
def list_weddings(
    search: Optional[str] = None,
    status: Optional[str] = None,
    planner_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve wedding directory with progress percentage and financial summary."""
    return WeddingService.get_weddings_directory(
        db=db,
        search=search,
        status=status,
        planner_id=planner_id
    )

@router.post("/convert")
def convert_enquiry(
    data: ConvertEnquiryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Convert confirmed enquiry to dedicated wedding workspace and seed instant plan."""
    try:
        wedding = WeddingService.convert_enquiry_to_wedding(
            db=db,
            enquiry_id=data.enquiry_id,
            user_id=current_user.id
        )
        return {
            "success": True,
            "wedding_id": wedding.id,
            "wedding_number": wedding.wedding_number,
            "couple_title": wedding.couple_title,
            "status": wedding.status
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{wedding_id}")
def get_wedding_workspace(
    wedding_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve comprehensive wedding workspace across all 10 tabs with gatekeeper enforcement."""
    try:
        return WeddingService.get_wedding_workspace(db, wedding_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/{wedding_id}/tasks")
def get_wedding_tasks(
    wedding_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tasks = db.query(Task).filter(Task.wedding_id == wedding_id).order_by(Task.due_date.asc()).all()
    return [
        {
            "id": t.id,
            "title": t.title,
            "description": t.description,
            "status": t.status,
            "priority": t.priority,
            "due_date": t.due_date.isoformat(),
            "assigned_to_name": t.assigned_to.full_name if t.assigned_to else "Unassigned",
            "assigned_to_id": t.assigned_to_id
        }
        for t in tasks
    ]

@router.post("/{wedding_id}/tasks")
def create_wedding_task(
    wedding_id: str,
    data: TaskCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from datetime import datetime
    task = Task(
        wedding_id=wedding_id,
        title=data.title,
        description=data.description,
        priority=data.priority,
        status=data.status,
        assigned_to_id=data.assigned_to_id,
        due_date=datetime.fromisoformat(data.due_date.replace("Z", "+00:00"))
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return {"id": task.id, "title": task.title, "status": task.status}

@router.patch("/{wedding_id}/tasks/{task_id}")
def update_task_status(
    wedding_id: str,
    task_id: str,
    data: TaskUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(Task.id == task_id, Task.wedding_id == wedding_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if data.status:
        task.status = data.status
    if data.priority:
        task.priority = data.priority
    if data.assigned_to_id:
        task.assigned_to_id = data.assigned_to_id

    db.commit()
    return {"id": task.id, "status": task.status, "priority": task.priority}

@router.get("/{wedding_id}/events")
def get_wedding_events(
    wedding_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    events = db.query(WeddingEvent).filter(WeddingEvent.wedding_id == wedding_id).order_by(WeddingEvent.event_date.asc()).all()
    return [
        {
            "id": e.id,
            "title": e.title,
            "venue": e.venue,
            "event_date": e.event_date.isoformat(),
            "start_time": e.start_time,
            "end_time": e.end_time,
            "dress_code": e.dress_code,
            "description": e.description
        }
        for e in events
    ]

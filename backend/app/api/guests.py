from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.models.user import User
from app.services.guest_service import GuestService
from app.api.deps import get_current_user

router = APIRouter(prefix="/weddings/{wedding_id}/guests", tags=["Guest Management"])

class GuestCreateRequest(BaseModel):
    full_name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    category: str = "Friend"
    expected_party_size: int = 1
    rsvp_status: str = "Invited"
    dietary_preference: str = "Vegetarian"
    table_number: Optional[str] = None
    notes: Optional[str] = None

class GuestUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    category: Optional[str] = None
    expected_party_size: Optional[int] = None
    rsvp_status: Optional[str] = None
    dietary_preference: Optional[str] = None
    table_number: Optional[str] = None
    actual_checked_in_count: Optional[int] = None
    notes: Optional[str] = None

class WalkinRequest(BaseModel):
    guest_id: str
    walkin_count: int

@router.get("")
def list_guests(
    wedding_id: str,
    search: Optional[str] = None,
    rsvp_status: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    guests = GuestService.get_guests(
        db=db,
        wedding_id=wedding_id,
        search=search,
        rsvp_status=rsvp_status,
        category=category
    )
    return [
        {
            "id": g.id,
            "wedding_id": g.wedding_id,
            "full_name": g.full_name,
            "phone": g.phone,
            "email": g.email,
            "category": g.category,
            "expected_party_size": g.expected_party_size,
            "rsvp_status": g.rsvp_status,
            "dietary_preference": g.dietary_preference,
            "table_number": g.table_number,
            "actual_checked_in_count": g.actual_checked_in_count,
            "additional_walkin_count": g.additional_walkin_count,
            "notes": g.notes
        }
        for g in guests
    ]

@router.get("/statistics")
def get_guest_stats(
    wedding_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return GuestService.get_guest_statistics(db, wedding_id)

@router.post("")
def create_guest(
    wedding_id: str,
    data: GuestCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    guest = GuestService.add_guest(
        db=db,
        wedding_id=wedding_id,
        full_name=data.full_name,
        phone=data.phone,
        email=data.email,
        category=data.category,
        expected_party_size=data.expected_party_size,
        rsvp_status=data.rsvp_status,
        dietary_preference=data.dietary_preference,
        table_number=data.table_number,
        notes=data.notes
    )
    return {"id": guest.id, "full_name": guest.full_name, "rsvp_status": guest.rsvp_status}

@router.post("/import-csv")
async def import_guests_csv(
    wedding_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    contents = await file.read()
    csv_text = contents.decode("utf-8-sig", errors="ignore")
    try:
        return GuestService.import_guests_csv(
            db=db,
            wedding_id=wedding_id,
            csv_content=csv_text,
            user_id=current_user.id
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/walkin")
def record_walkin(
    wedding_id: str,
    data: WalkinRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        g = GuestService.record_walkin(db, wedding_id, data.guest_id, data.walkin_count)
        return {"id": g.id, "additional_walkins": g.additional_walkin_count, "actual_checked_in": g.actual_checked_in_count}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

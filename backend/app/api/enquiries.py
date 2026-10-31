from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.enquiry import Enquiry
from app.schemas.enquiry import (
    EnquiryPublicCreate,
    EnquiryInternalCreate,
    EnquiryUpdate,
    EnquiryResponse,
    EnquiryPublicConfirmation,
    EnquiryNoteCreate,
    EnquiryNoteResponse,
    ConsultationCreate,
    ConsultationResponse
)
from app.services.enquiry_service import EnquiryService
from app.api.deps import get_current_user

router = APIRouter(prefix="/enquiries", tags=["Enquiry CRM"])

def map_enquiry_to_response(enq: Enquiry) -> EnquiryResponse:
    three_days_ago = datetime.utcnow() - timedelta(days=3)
    is_inactive = bool(enq.last_activity_at and enq.last_activity_at < three_days_ago and enq.status not in ["Confirmed", "Lost"])
    
    return EnquiryResponse(
        id=enq.id,
        enquiry_number=enq.enquiry_number,
        bride_name=enq.bride_name,
        groom_name=enq.groom_name,
        email=enq.email,
        phone=enq.phone,
        preferred_date=enq.preferred_date,
        alternative_date=enq.alternative_date,
        destination=enq.destination,
        venue_preference=enq.venue_preference,
        guest_count=enq.guest_count,
        function_count=enq.function_count,
        functions_requested=enq.functions_requested or [],
        theme_preference=enq.theme_preference,
        budget_max=float(enq.budget_max),
        package_type=enq.package_type,
        catering_preferences=enq.catering_preferences,
        decor_preferences=enq.decor_preferences,
        additional_notes=enq.additional_notes,
        source=enq.source,
        status=enq.status,
        assigned_planner_id=enq.assigned_planner_id,
        assigned_planner_name=enq.assigned_planner.full_name if enq.assigned_planner else None,
        last_activity_at=enq.last_activity_at,
        follow_up_date=enq.follow_up_date,
        is_inactive_3_days=is_inactive,
        notes_count=len(enq.notes) if enq.notes else 0,
        created_at=enq.created_at,
        updated_at=enq.updated_at
    )

@router.post("/public", response_model=EnquiryPublicConfirmation)
def submit_public_enquiry(data: EnquiryPublicCreate, db: Session = Depends(get_db)):
    """Public website enquiry submission endpoint. Does not require login."""
    enquiry = EnquiryService.create_public_enquiry(db, data)
    return EnquiryPublicConfirmation(
        enquiry_number=enquiry.enquiry_number,
        message="Thank you for choosing The Royal Knot. Our senior wedding concierge will reach out within 24 hours.",
        submitted_at=enquiry.created_at
    )

@router.get("", response_model=List[EnquiryResponse])
def list_enquiries(
    search: Optional[str] = None,
    status: Optional[str] = None,
    destination: Optional[str] = None,
    assigned_planner_id: Optional[str] = None,
    only_inactive: bool = False,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve all enquiries with filters, pagination, and inactivity alerts."""
    enquiries, _ = EnquiryService.get_enquiries(
        db=db,
        search=search,
        status=status,
        destination=destination,
        assigned_planner_id=assigned_planner_id,
        only_inactive=only_inactive,
        page=page,
        page_size=page_size
    )
    return [map_enquiry_to_response(e) for e in enquiries]

@router.post("", response_model=EnquiryResponse)
def create_internal_enquiry(
    data: EnquiryInternalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create enquiry manually from internal channels (Call, WhatsApp, Referral, etc.)"""
    enquiry = EnquiryService.create_internal_enquiry(db, data, current_user.id)
    return map_enquiry_to_response(enquiry)

@router.get("/{enquiry_id}", response_model=EnquiryResponse)
def get_enquiry_detail(
    enquiry_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    enquiry = EnquiryService.get_enquiry_by_id(db, enquiry_id)
    if not enquiry:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    return map_enquiry_to_response(enquiry)

@router.patch("/{enquiry_id}", response_model=EnquiryResponse)
def update_enquiry(
    enquiry_id: str,
    data: EnquiryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    enquiry = EnquiryService.update_enquiry(db, enquiry_id, data, current_user.id)
    if not enquiry:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    return map_enquiry_to_response(enquiry)

@router.delete("/{enquiry_id}")
def delete_enquiry(
    enquiry_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Soft delete enquiry so no historical lead is ever permanently lost."""
    success = EnquiryService.soft_delete_enquiry(db, enquiry_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    return {"message": "Enquiry archived successfully (soft deleted)"}

@router.post("/{enquiry_id}/notes", response_model=EnquiryNoteResponse)
def add_enquiry_note(
    enquiry_id: str,
    data: EnquiryNoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    note = EnquiryService.add_note(db, enquiry_id, current_user.id, data.content)
    if not note:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    return EnquiryNoteResponse(
        id=note.id,
        enquiry_id=note.enquiry_id,
        author_id=note.author_id,
        author_name=current_user.full_name,
        content=note.content,
        created_at=note.created_at
    )

@router.get("/{enquiry_id}/notes", response_model=List[EnquiryNoteResponse])
def get_enquiry_notes(
    enquiry_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    enquiry = EnquiryService.get_enquiry_by_id(db, enquiry_id)
    if not enquiry:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    return [
        EnquiryNoteResponse(
            id=n.id,
            enquiry_id=n.enquiry_id,
            author_id=n.author_id,
            author_name=n.author.full_name if n.author else "Staff",
            content=n.content,
            created_at=n.created_at
        )
        for n in enquiry.notes
    ]

@router.post("/{enquiry_id}/consultations", response_model=ConsultationResponse)
def schedule_enquiry_consultation(
    enquiry_id: str,
    data: ConsultationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    consultation = EnquiryService.schedule_consultation(
        db, enquiry_id, current_user.id, data.scheduled_at, data.meeting_type, data.notes
    )
    if not consultation:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    return ConsultationResponse.model_validate(consultation)

@router.get("/{enquiry_id}/consultations", response_model=List[ConsultationResponse])
def get_enquiry_consultations(
    enquiry_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    enquiry = EnquiryService.get_enquiry_by_id(db, enquiry_id)
    if not enquiry:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    return [ConsultationResponse.model_validate(c) for c in enquiry.consultations]

from datetime import datetime, timedelta
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc, func
from app.models.enquiry import Enquiry, EnquiryNote, Consultation
from app.models.user import User
from app.models.activity import ActivityLog
from app.schemas.enquiry import EnquiryPublicCreate, EnquiryInternalCreate, EnquiryUpdate

def generate_enquiry_number(db: Session) -> str:
    current_year = datetime.utcnow().year
    prefix = f"RK-ENQ-{current_year}-"
    
    # Find latest enquiry number for current year
    latest = db.query(Enquiry).filter(Enquiry.enquiry_number.like(f"{prefix}%")).order_by(desc(Enquiry.enquiry_number)).first()
    
    if latest and latest.enquiry_number:
        try:
            last_seq = int(latest.enquiry_number.split("-")[-1])
            new_seq = last_seq + 1
        except (ValueError, IndexError):
            new_seq = 1
    else:
        new_seq = 1
        
    return f"{prefix}{new_seq:04d}"

class EnquiryService:
    @staticmethod
    def create_public_enquiry(db: Session, data: EnquiryPublicCreate) -> Enquiry:
        enquiry_number = generate_enquiry_number(db)
        
        enquiry = Enquiry(
            enquiry_number=enquiry_number,
            bride_name=data.bride_name,
            groom_name=data.groom_name,
            email=data.email,
            phone=data.phone,
            preferred_date=data.preferred_date,
            alternative_date=data.alternative_date,
            destination=data.destination,
            venue_preference=data.venue_preference,
            guest_count=data.guest_count,
            function_count=data.function_count,
            functions_requested=data.functions_requested,
            theme_preference=data.theme_preference,
            budget_max=data.budget_max,
            package_type=data.package_type,
            catering_preferences=data.catering_preferences,
            decor_preferences=data.decor_preferences,
            additional_notes=data.additional_notes,
            source="Website",
            status="New",
            last_activity_at=datetime.utcnow()
        )
        db.add(enquiry)
        db.commit()
        db.refresh(enquiry)
        
        # Log activity
        log = ActivityLog(
            enquiry_id=enquiry.id,
            action="ENQUIRY_CREATED",
            details={
                "enquiry_number": enquiry.enquiry_number,
                "bride": enquiry.bride_name,
                "groom": enquiry.groom_name,
                "source": "Website"
            }
        )
        db.add(log)
        db.commit()
        return enquiry

    @staticmethod
    def create_internal_enquiry(db: Session, data: EnquiryInternalCreate, creator_id: str) -> Enquiry:
        enquiry_number = generate_enquiry_number(db)
        
        enquiry = Enquiry(
            enquiry_number=enquiry_number,
            bride_name=data.bride_name,
            groom_name=data.groom_name,
            email=data.email,
            phone=data.phone,
            preferred_date=data.preferred_date,
            alternative_date=data.alternative_date,
            destination=data.destination,
            venue_preference=data.venue_preference,
            guest_count=data.guest_count,
            function_count=data.function_count,
            functions_requested=data.functions_requested,
            theme_preference=data.theme_preference,
            budget_max=data.budget_max,
            package_type=data.package_type,
            catering_preferences=data.catering_preferences,
            decor_preferences=data.decor_preferences,
            additional_notes=data.additional_notes,
            source=data.source,
            status=data.status or "New",
            assigned_planner_id=data.assigned_planner_id,
            last_activity_at=datetime.utcnow()
        )
        db.add(enquiry)
        db.commit()
        db.refresh(enquiry)
        
        log = ActivityLog(
            user_id=creator_id,
            enquiry_id=enquiry.id,
            action="ENQUIRY_CREATED_INTERNAL",
            details={"enquiry_number": enquiry.enquiry_number, "source": data.source}
        )
        db.add(log)
        db.commit()
        return enquiry

    @staticmethod
    def get_enquiries(
        db: Session,
        search: Optional[str] = None,
        status: Optional[str] = None,
        destination: Optional[str] = None,
        assigned_planner_id: Optional[str] = None,
        only_inactive: bool = False,
        page: int = 1,
        page_size: int = 20
    ) -> Tuple[List[Enquiry], int]:
        # Always filter out soft-deleted
        query = db.query(Enquiry).filter(Enquiry.is_deleted == False)
        
        if search:
            search_fmt = f"%{search}%"
            query = query.filter(
                or_(
                    Enquiry.enquiry_number.ilike(search_fmt),
                    Enquiry.bride_name.ilike(search_fmt),
                    Enquiry.groom_name.ilike(search_fmt),
                    Enquiry.email.ilike(search_fmt),
                    Enquiry.phone.ilike(search_fmt),
                    Enquiry.venue_preference.ilike(search_fmt)
                )
            )
            
        if status and status != "All":
            query = query.filter(Enquiry.status == status)
            
        if destination and destination != "All":
            query = query.filter(Enquiry.destination == destination)
            
        if assigned_planner_id and assigned_planner_id != "All":
            query = query.filter(Enquiry.assigned_planner_id == assigned_planner_id)
            
        if only_inactive:
            three_days_ago = datetime.utcnow() - timedelta(days=3)
            query = query.filter(
                and_(
                    Enquiry.last_activity_at < three_days_ago,
                    Enquiry.status.notin_(["Confirmed", "Lost"])
                )
            )
            
        total = query.count()
        enquiries = query.order_by(desc(Enquiry.created_at)).offset((page - 1) * page_size).limit(page_size).all()
        return enquiries, total

    @staticmethod
    def get_enquiry_by_id(db: Session, enquiry_id: str) -> Optional[Enquiry]:
        return db.query(Enquiry).filter(Enquiry.id == enquiry_id, Enquiry.is_deleted == False).first()

    @staticmethod
    def update_enquiry(db: Session, enquiry_id: str, data: EnquiryUpdate, user_id: str) -> Optional[Enquiry]:
        enquiry = EnquiryService.get_enquiry_by_id(db, enquiry_id)
        if not enquiry:
            return None
            
        update_dict = data.model_dump(exclude_unset=True)
        for key, val in update_dict.items():
            setattr(enquiry, key, val)
            
        enquiry.last_activity_at = datetime.utcnow()
        db.commit()
        db.refresh(enquiry)
        
        log = ActivityLog(
            user_id=user_id,
            enquiry_id=enquiry.id,
            action="ENQUIRY_UPDATED",
            details=update_dict
        )
        db.add(log)
        db.commit()
        return enquiry

    @staticmethod
    def soft_delete_enquiry(db: Session, enquiry_id: str, user_id: str) -> bool:
        enquiry = EnquiryService.get_enquiry_by_id(db, enquiry_id)
        if not enquiry:
            return False
        enquiry.is_deleted = True
        enquiry.last_activity_at = datetime.utcnow()
        db.commit()
        
        log = ActivityLog(
            user_id=user_id,
            enquiry_id=enquiry.id,
            action="ENQUIRY_SOFT_DELETED",
            details={"enquiry_number": enquiry.enquiry_number}
        )
        db.add(log)
        db.commit()
        return True

    @staticmethod
    def add_note(db: Session, enquiry_id: str, author_id: str, content: str) -> Optional[EnquiryNote]:
        enquiry = EnquiryService.get_enquiry_by_id(db, enquiry_id)
        if not enquiry:
            return None
            
        note = EnquiryNote(
            enquiry_id=enquiry_id,
            author_id=author_id,
            content=content,
            created_at=datetime.utcnow()
        )
        db.add(note)
        enquiry.last_activity_at = datetime.utcnow()
        db.commit()
        db.refresh(note)
        
        log = ActivityLog(
            user_id=author_id,
            enquiry_id=enquiry.id,
            action="NOTE_ADDED",
            details={"preview": content[:60]}
        )
        db.add(log)
        db.commit()
        return note

    @staticmethod
    def schedule_consultation(db: Session, enquiry_id: str, user_id: str, scheduled_at: datetime, meeting_type: str, notes: Optional[str]) -> Optional[Consultation]:
        enquiry = EnquiryService.get_enquiry_by_id(db, enquiry_id)
        if not enquiry:
            return None
            
        consultation = Consultation(
            enquiry_id=enquiry_id,
            scheduled_at=scheduled_at,
            meeting_type=meeting_type,
            notes=notes,
            status="Scheduled",
            created_at=datetime.utcnow()
        )
        db.add(consultation)
        enquiry.status = "Consultation Scheduled"
        enquiry.last_activity_at = datetime.utcnow()
        enquiry.follow_up_date = scheduled_at
        db.commit()
        db.refresh(consultation)
        
        log = ActivityLog(
            user_id=user_id,
            enquiry_id=enquiry.id,
            action="CONSULTATION_SCHEDULED",
            details={"scheduled_at": str(scheduled_at), "type": meeting_type}
        )
        db.add(log)
        db.commit()
        return consultation

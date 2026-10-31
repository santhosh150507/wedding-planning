from datetime import datetime
import uuid
from sqlalchemy import Column, String, Integer, Numeric, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Enquiry(Base):
    __tablename__ = "enquiries"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    enquiry_number = Column(String(30), unique=True, nullable=False, index=True) # e.g. RK-ENQ-2026-0001
    
    bride_name = Column(String(100), nullable=False)
    groom_name = Column(String(100), nullable=False)
    email = Column(String(120), nullable=False, index=True)
    phone = Column(String(30), nullable=False)
    
    preferred_date = Column(DateTime, nullable=False)
    alternative_date = Column(DateTime, nullable=True)
    destination = Column(String(100), nullable=False, default="Jaipur") # Jaipur, Udaipur, Jodhpur, etc.
    venue_preference = Column(String(200), nullable=True)
    
    guest_count = Column(Integer, nullable=False, default=400)
    function_count = Column(Integer, nullable=False, default=4)
    functions_requested = Column(JSON, default=list) # ["Mehendi", "Haldi", "Sangeet", "Wedding", "Reception"]
    theme_preference = Column(String(200), nullable=True)
    
    budget_max = Column(Numeric(14, 2), nullable=False) # In INR
    package_type = Column(String(50), nullable=False, default="full_service") # full_service or partial_day_of
    
    catering_preferences = Column(Text, nullable=True)
    decor_preferences = Column(Text, nullable=True)
    additional_notes = Column(Text, nullable=True)
    
    source = Column(String(50), nullable=False, default="Website") # Website, Call, WhatsApp, Instagram, Referral
    status = Column(String(50), nullable=False, default="New") # New, Contacted, Consultation Scheduled, Proposal Sent, Negotiation, Confirmed, Lost
    
    assigned_planner_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    last_activity_at = Column(DateTime, default=datetime.utcnow)
    follow_up_date = Column(DateTime, nullable=True)
    
    is_deleted = Column(Boolean, default=False, nullable=False) # Soft delete only
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    assigned_planner = relationship("User", back_populates="assigned_enquiries", foreign_keys=[assigned_planner_id])
    notes = relationship("EnquiryNote", back_populates="enquiry", cascade="all, delete-orphan", order_by="desc(EnquiryNote.created_at)")
    consultations = relationship("Consultation", back_populates="enquiry", cascade="all, delete-orphan", order_by="desc(Consultation.scheduled_at)")
    proposals = relationship("Proposal", back_populates="enquiry", cascade="all, delete-orphan")
    contract = relationship("Contract", back_populates="enquiry", uselist=False)
    wedding = relationship("Wedding", back_populates="enquiry", uselist=False)

class EnquiryNote(Base):
    __tablename__ = "enquiry_notes"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    enquiry_id = Column(String(36), ForeignKey("enquiries.id"), nullable=False, index=True)
    author_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    enquiry = relationship("Enquiry", back_populates="notes")
    author = relationship("User", back_populates="enquiry_notes")

class Consultation(Base):
    __tablename__ = "consultations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    enquiry_id = Column(String(36), ForeignKey("enquiries.id"), nullable=False, index=True)
    scheduled_at = Column(DateTime, nullable=False)
    meeting_type = Column(String(50), default="Video Call") # Video Call, In-Person, Phone Call
    status = Column(String(50), default="Scheduled") # Scheduled, Completed, Cancelled, Rescheduled
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    enquiry = relationship("Enquiry", back_populates="consultations")

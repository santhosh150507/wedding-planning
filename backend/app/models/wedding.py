from datetime import datetime
import uuid
from sqlalchemy import Column, String, Integer, Numeric, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Wedding(Base):
    __tablename__ = "weddings"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    wedding_number = Column(String(50), unique=True, nullable=False, index=True) # e.g. RK-WED-2026-001
    enquiry_id = Column(String(36), ForeignKey("enquiries.id"), unique=True, nullable=True)
    
    couple_title = Column(String(150), nullable=False) # e.g. Aditi & Kabir
    bride_name = Column(String(100), nullable=False)
    groom_name = Column(String(100), nullable=False)
    primary_contact_name = Column(String(100), nullable=False)
    contact_phone = Column(String(30), nullable=False)
    contact_email = Column(String(120), nullable=False)
    
    wedding_date_start = Column(DateTime, nullable=False)
    wedding_date_end = Column(DateTime, nullable=False)
    destination = Column(String(100), nullable=False, default="Jaipur")
    venue_name = Column(String(200), nullable=False)
    
    expected_guest_count = Column(Integer, default=400)
    package_type = Column(String(50), default="full_service") # full_service or partial_day_of
    agreed_budget = Column(Numeric(14, 2), nullable=False) # In INR
    
    assigned_planner_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    status = Column(String(50), default="Planning") # Draft, Planning, Active, In Progress, Completed, Cancelled
    notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    enquiry = relationship("Enquiry", back_populates="wedding")
    contract = relationship("Contract", back_populates="wedding", uselist=False, foreign_keys="Contract.wedding_id")
    assigned_planner = relationship("User", foreign_keys=[assigned_planner_id])
    events = relationship("WeddingEvent", back_populates="wedding", cascade="all, delete-orphan", order_by="WeddingEvent.event_date")
    vendors = relationship("WeddingVendor", back_populates="wedding", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="wedding", cascade="all, delete-orphan")
    guests = relationship("Guest", back_populates="wedding", cascade="all, delete-orphan")
    payment_milestones = relationship("ClientPaymentMilestone", back_populates="wedding", cascade="all, delete-orphan")
    payments = relationship("ClientPayment", back_populates="wedding", cascade="all, delete-orphan")
    vendor_invoices = relationship("VendorInvoice", back_populates="wedding", cascade="all, delete-orphan")
    vendor_payments = relationship("VendorPayment", back_populates="wedding", cascade="all, delete-orphan")
    extra_charges = relationship("ExtraCharge", back_populates="wedding", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="wedding", cascade="all, delete-orphan")
    time_entries = relationship("TimeEntry", back_populates="wedding", cascade="all, delete-orphan")
    schedule_items = relationship("ScheduleItem", back_populates="wedding", cascade="all, delete-orphan")
    vendor_checkins = relationship("VendorCheckin", back_populates="wedding", cascade="all, delete-orphan")
    issues = relationship("WeddingDayIssue", back_populates="wedding", cascade="all, delete-orphan")

class WeddingEvent(Base):
    __tablename__ = "wedding_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    wedding_id = Column(String(36), ForeignKey("weddings.id"), nullable=False, index=True)
    title = Column(String(100), nullable=False) # Mehendi, Haldi, Sangeet, Wedding Ceremony, Reception
    venue = Column(String(200), nullable=False)
    event_date = Column(DateTime, nullable=False)
    start_time = Column(String(10), nullable=False) # e.g. "10:00 AM"
    end_time = Column(String(10), nullable=False) # e.g. "02:00 PM"
    dress_code = Column(String(100), nullable=True) # Royal Rajasthani, Pastel Festive, etc.
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    wedding = relationship("Wedding", back_populates="events")
    tasks = relationship("Task", back_populates="event")

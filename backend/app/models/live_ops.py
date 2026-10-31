from datetime import datetime
import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class ScheduleItem(Base):
    __tablename__ = "schedule_items"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    wedding_id = Column(String(36), ForeignKey("weddings.id"), nullable=False, index=True)
    event_id = Column(String(36), ForeignKey("wedding_events.id"), nullable=True)
    planned_time = Column(String(20), nullable=False) # e.g. "04:30 PM"
    activity_title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    owner_id = Column(String(36), ForeignKey("users.id"), nullable=True) # Staff responsible
    vendor_id = Column(String(36), ForeignKey("vendors.id"), nullable=True)
    status = Column(String(30), default="Pending") # Pending, In Progress, Completed, Delayed
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    wedding = relationship("Wedding", back_populates="schedule_items")
    owner = relationship("User")
    vendor = relationship("Vendor")

class VendorCheckin(Base):
    __tablename__ = "vendor_checkins"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    wedding_id = Column(String(36), ForeignKey("weddings.id"), nullable=False, index=True)
    vendor_id = Column(String(36), ForeignKey("vendors.id"), nullable=False, index=True)
    expected_time = Column(DateTime, nullable=False)
    arrived_time = Column(DateTime, nullable=True)
    status = Column(String(30), default="Expected") # Expected, Arrived, Late, No Show
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    wedding = relationship("Wedding", back_populates="vendor_checkins")
    vendor = relationship("Vendor", back_populates="checkins")

class WeddingDayIssue(Base):
    __tablename__ = "wedding_day_issues"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    wedding_id = Column(String(36), ForeignKey("weddings.id"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    severity = Column(String(20), default="Medium") # Low, Medium, High, Emergency
    assigned_to_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    status = Column(String(30), default="Open") # Open, In Progress, Resolved
    reported_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
    resolution_notes = Column(Text, nullable=True)

    wedding = relationship("Wedding", back_populates="issues")
    assigned_to = relationship("User")

from datetime import datetime
import uuid
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, JSON, Integer
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True, index=True) # None = Broadcast to all planners
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    link = Column(String(255), nullable=True)
    type = Column(String(50), default="info") # info, alert, warning, success
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    wedding_id = Column(String(36), ForeignKey("weddings.id"), nullable=True, index=True)
    enquiry_id = Column(String(36), ForeignKey("enquiries.id"), nullable=True, index=True)
    action = Column(String(100), nullable=False) # e.g. "ENQUIRY_CREATED", "STATUS_UPDATED", "NOTE_ADDED"
    details = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")

class Document(Base):
    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    wedding_id = Column(String(36), ForeignKey("weddings.id"), nullable=True, index=True)
    enquiry_id = Column(String(36), ForeignKey("enquiries.id"), nullable=True, index=True)
    title = Column(String(150), nullable=False)
    category = Column(String(50), default="General") # Contract, Invoice, Floor Plan, Menu, Moodboard
    file_url = Column(String(255), nullable=False)
    file_size = Column(Integer, default=0) # in bytes
    file_type = Column(String(50), default="application/pdf")
    uploaded_by_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

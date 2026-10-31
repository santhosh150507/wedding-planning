from datetime import datetime
import uuid
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, JSON, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class TaskTemplate(Base):
    __tablename__ = "task_templates"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    package_type = Column(String(50), nullable=False, default="full_service") # full_service or partial_day_of
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    default_priority = Column(String(20), default="Medium") # Low, Medium, High, Urgent
    role_assignee = Column(String(50), default="Wedding Planner") # Wedding Planner, Planning Staff, Finance Manager
    days_offset_from_wedding = Column(Integer, default=-60) # negative means days before wedding, positive after
    category = Column(String(50), default="General")
    created_at = Column(DateTime, default=datetime.utcnow)

    tasks = relationship("Task", back_populates="template")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    wedding_id = Column(String(36), ForeignKey("weddings.id"), nullable=False, index=True)
    template_task_id = Column(String(36), ForeignKey("task_templates.id"), nullable=True)
    event_id = Column(String(36), ForeignKey("wedding_events.id"), nullable=True)
    assigned_to_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(30), default="To Plan") # To Plan, In Progress, Done, Blocked
    priority = Column(String(20), default="Medium") # Low, Medium, High, Urgent
    
    start_date = Column(DateTime, nullable=True)
    due_date = Column(DateTime, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    
    comments = Column(JSON, default=list) # [{author, text, created_at}]
    attachments = Column(JSON, default=list) # [{name, url, uploaded_at}]
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Unique constraint to prevent duplicate cloning (Idempotent requirement)
    __table_args__ = (
        UniqueConstraint('wedding_id', 'template_task_id', name='uq_wedding_template_task'),
    )

    wedding = relationship("Wedding", back_populates="tasks")
    template = relationship("TaskTemplate", back_populates="tasks")
    event = relationship("WeddingEvent", back_populates="tasks")
    assigned_to = relationship("User")

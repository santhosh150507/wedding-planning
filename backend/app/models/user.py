from datetime import datetime
import uuid
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Numeric, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Role(Base):
    __tablename__ = "roles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(50), unique=True, nullable=False, index=True) # Super Admin, Administrator, Wedding Planner, Planning Staff, Finance Manager
    description = Column(String(255), nullable=True)
    permissions = Column(JSON, default=list) # List of permission keys
    created_at = Column(DateTime, default=datetime.utcnow)

    users = relationship("User", back_populates="role")

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(120), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=True)
    role_id = Column(String(36), ForeignKey("roles.id"), nullable=False)
    hourly_cost_rate = Column(Numeric(10, 2), default=0.00) # INR cost rate per hour
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    role = relationship("Role", back_populates="users")
    assigned_enquiries = relationship("Enquiry", back_populates="assigned_planner", foreign_keys="Enquiry.assigned_planner_id")
    enquiry_notes = relationship("EnquiryNote", back_populates="author")

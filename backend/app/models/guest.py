from datetime import datetime
import uuid
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Guest(Base):
    __tablename__ = "guests"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    wedding_id = Column(String(36), ForeignKey("weddings.id"), nullable=False, index=True)
    full_name = Column(String(120), nullable=False, index=True)
    phone = Column(String(30), nullable=True)
    email = Column(String(120), nullable=True)
    category = Column(String(50), default="Friend") # Bride Family, Groom Family, VIP, Friend, Corporate
    expected_party_size = Column(Integer, default=1)
    rsvp_status = Column(String(30), default="Invited") # Invited, Confirmed, Declined, Tentative
    dietary_preference = Column(String(100), default="Vegetarian") # Pure Vegetarian, Jain, Non-Vegetarian, Vegan
    table_number = Column(String(20), nullable=True)
    actual_checked_in_count = Column(Integer, default=0)
    additional_walkin_count = Column(Integer, default=0)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    wedding = relationship("Wedding", back_populates="guests")

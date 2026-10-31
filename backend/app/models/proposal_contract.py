from datetime import datetime
import uuid
from sqlalchemy import Column, String, Numeric, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Proposal(Base):
    __tablename__ = "proposals"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    enquiry_id = Column(String(36), ForeignKey("enquiries.id"), nullable=False, index=True)
    proposal_number = Column(String(50), unique=True, nullable=False)
    package_type = Column(String(50), nullable=False) # full_service or partial_day_of
    total_amount = Column(Numeric(14, 2), nullable=False)
    pricing_breakdown = Column(JSON, default=dict)
    scope_of_work = Column(Text, nullable=True)
    status = Column(String(50), default="Draft") # Draft, Sent, Accepted, Rejected
    created_at = Column(DateTime, default=datetime.utcnow)

    enquiry = relationship("Enquiry", back_populates="proposals")

class Contract(Base):
    __tablename__ = "contracts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    enquiry_id = Column(String(36), ForeignKey("enquiries.id"), nullable=False, unique=True, index=True)
    wedding_id = Column(String(36), ForeignKey("weddings.id"), nullable=True, unique=True)
    contract_number = Column(String(50), unique=True, nullable=False) # e.g. RK-CNT-2026-0001
    package_type = Column(String(50), nullable=False)
    total_amount = Column(Numeric(14, 2), nullable=False)
    terms_content = Column(Text, nullable=False)
    pdf_url = Column(String(255), nullable=True)
    
    status = Column(String(50), default="Draft") # Draft, Sent, Viewed, Signed, Rejected
    signed_at = Column(DateTime, nullable=True)
    signed_by_name = Column(String(100), nullable=True)
    signed_signature_image = Column(Text, nullable=True) # Base64 signature data
    signer_ip = Column(String(50), nullable=True)
    signer_user_agent = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    enquiry = relationship("Enquiry", back_populates="contract")
    wedding = relationship("Wedding", back_populates="contract", foreign_keys=[wedding_id])

class SigningToken(Base):
    __tablename__ = "signing_tokens"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    token = Column(String(64), unique=True, nullable=False, index=True)
    target_type = Column(String(50), nullable=False) # contract, vendor_rfq, vendor_checkin
    target_id = Column(String(36), nullable=False, index=True)
    recipient_email = Column(String(120), nullable=True)
    recipient_name = Column(String(100), nullable=True)
    expires_at = Column(DateTime, nullable=False)
    is_revoked = Column(Boolean, default=False)
    used_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

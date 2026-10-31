from datetime import datetime
import uuid
from sqlalchemy import Column, String, Numeric, Boolean, DateTime, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class ClientPaymentMilestone(Base):
    __tablename__ = "client_payment_milestones"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    wedding_id = Column(String(36), ForeignKey("weddings.id"), nullable=False, index=True)
    milestone_name = Column(String(100), nullable=False) # Booking Deposit, Advance Payment, Final Settlement
    percentage = Column(Float, nullable=False) # e.g. 25.0, 50.0, 25.0
    expected_amount = Column(Numeric(14, 2), nullable=False)
    due_date = Column(DateTime, nullable=False)
    status = Column(String(30), default="Pending") # Pending, Overdue, Paid
    created_at = Column(DateTime, default=datetime.utcnow)

    wedding = relationship("Wedding", back_populates="payment_milestones")
    payments = relationship("ClientPayment", back_populates="milestone")

class ClientPayment(Base):
    __tablename__ = "client_payments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    wedding_id = Column(String(36), ForeignKey("weddings.id"), nullable=False, index=True)
    milestone_id = Column(String(36), ForeignKey("client_payment_milestones.id"), nullable=True)
    amount = Column(Numeric(14, 2), nullable=False)
    payment_date = Column(DateTime, default=datetime.utcnow)
    payment_method = Column(String(50), default="Bank Transfer") # Bank Transfer, NEFT/RTGS, UPI, Cheque
    transaction_reference = Column(String(100), unique=True, nullable=False)
    receipt_pdf_url = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    wedding = relationship("Wedding", back_populates="payments")
    milestone = relationship("ClientPaymentMilestone", back_populates="payments")

class VendorInvoice(Base):
    __tablename__ = "vendor_invoices"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    wedding_id = Column(String(36), ForeignKey("weddings.id"), nullable=False, index=True)
    vendor_id = Column(String(36), ForeignKey("vendors.id"), nullable=False, index=True)
    invoice_number = Column(String(100), nullable=False)
    invoice_date = Column(DateTime, nullable=False)
    
    claimed_amount = Column(Numeric(14, 2), nullable=False) # Total billed by vendor
    agreed_baseline_amount = Column(Numeric(14, 2), nullable=False) # Original agreed amount
    variance_amount = Column(Numeric(14, 2), default=0.00) # claimed - agreed
    variance_status = Column(String(30), default="OK") # OK, Flagged
    
    status = Column(String(30), default="Pending") # Pending, Approved, Paid
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    wedding = relationship("Wedding", back_populates="vendor_invoices")
    vendor = relationship("Vendor", back_populates="invoices")
    payments = relationship("VendorPayment", back_populates="invoice")

class VendorPayment(Base):
    __tablename__ = "vendor_payments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    wedding_id = Column(String(36), ForeignKey("weddings.id"), nullable=False, index=True)
    vendor_invoice_id = Column(String(36), ForeignKey("vendor_invoices.id"), nullable=False)
    vendor_id = Column(String(36), ForeignKey("vendors.id"), nullable=False)
    amount = Column(Numeric(14, 2), nullable=False)
    payment_date = Column(DateTime, default=datetime.utcnow)
    transaction_reference = Column(String(100), unique=True, nullable=False)
    payment_method = Column(String(50), default="Bank Transfer")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    wedding = relationship("Wedding", back_populates="vendor_payments")
    invoice = relationship("VendorInvoice", back_populates="payments")
    vendor = relationship("Vendor", back_populates="payments")

class ExtraCharge(Base):
    __tablename__ = "extra_charges"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    wedding_id = Column(String(36), ForeignKey("weddings.id"), nullable=False, index=True)
    vendor_id = Column(String(36), ForeignKey("vendors.id"), nullable=True)
    category = Column(String(50), default="Catering") # Catering (extra plates), DJ (extra hours), Generator, etc.
    description = Column(String(255), nullable=False)
    unit_rate = Column(Numeric(10, 2), default=0.00)
    quantity = Column(Float, default=1.0)
    total_amount = Column(Numeric(14, 2), nullable=False)
    is_billable_to_client = Column(Boolean, default=True)
    added_to_client_bill = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    wedding = relationship("Wedding", back_populates="extra_charges")

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    wedding_id = Column(String(36), ForeignKey("weddings.id"), nullable=False, index=True)
    category = Column(String(50), nullable=False) # Travel, Logistics, Permissions, Staff Meals, Misc
    amount = Column(Numeric(14, 2), nullable=False)
    date = Column(DateTime, default=datetime.utcnow)
    vendor_name = Column(String(100), nullable=True)
    receipt_url = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    wedding = relationship("Wedding", back_populates="expenses")

class TimeEntry(Base):
    __tablename__ = "time_entries"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    wedding_id = Column(String(36), ForeignKey("weddings.id"), nullable=False, index=True)
    date = Column(DateTime, default=datetime.utcnow)
    hours = Column(Float, nullable=False)
    hourly_rate = Column(Numeric(10, 2), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    wedding = relationship("Wedding", back_populates="time_entries")
    user = relationship("User")

from datetime import datetime
import uuid
from sqlalchemy import Column, String, Numeric, Boolean, DateTime, ForeignKey, Text, JSON, Float
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class VendorCategory(Base):
    __tablename__ = "vendor_categories"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), unique=True, nullable=False) # Catering, Decoration, Photography, etc.
    code = Column(String(50), unique=True, nullable=False, index=True) # catering, decor, photography
    description = Column(String(255), nullable=True)

    vendors = relationship("Vendor", back_populates="category")

class Vendor(Base):
    __tablename__ = "vendors"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    category_id = Column(String(36), ForeignKey("vendor_categories.id"), nullable=False, index=True)
    business_name = Column(String(150), nullable=False, index=True)
    contact_person = Column(String(100), nullable=False)
    phone = Column(String(30), nullable=False)
    email = Column(String(120), nullable=False)
    address = Column(String(255), nullable=True)
    city = Column(String(100), default="Jaipur")
    gst_number = Column(String(50), nullable=True)
    
    rating = Column(Float, default=4.8) # 1.0 to 5.0
    on_time_percentage = Column(Float, default=95.0) # On-time arrival %
    bill_variance_percentage = Column(Float, default=2.0) # Historical variance %
    notes = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    category = relationship("VendorCategory", back_populates="vendors")
    quotations = relationship("VendorQuotation", back_populates="vendor")
    wedding_assignments = relationship("WeddingVendor", back_populates="vendor")
    invoices = relationship("VendorInvoice", back_populates="vendor")
    payments = relationship("VendorPayment", back_populates="vendor")
    checkins = relationship("VendorCheckin", back_populates="vendor")

class QuotationRequest(Base):
    __tablename__ = "quotation_requests"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    wedding_id = Column(String(36), ForeignKey("weddings.id"), nullable=False, index=True)
    category_id = Column(String(36), ForeignKey("vendor_categories.id"), nullable=False)
    title = Column(String(150), nullable=False)
    specifications = Column(Text, nullable=False)
    status = Column(String(50), default="Open") # Open, Closed, Awarded
    created_at = Column(DateTime, default=datetime.utcnow)

    wedding = relationship("Wedding")
    category = relationship("VendorCategory")
    quotations = relationship("VendorQuotation", back_populates="request", cascade="all, delete-orphan")

class VendorQuotation(Base):
    __tablename__ = "vendor_quotations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    quotation_request_id = Column(String(36), ForeignKey("quotation_requests.id"), nullable=False, index=True)
    vendor_id = Column(String(36), ForeignKey("vendors.id"), nullable=False, index=True)
    total_amount = Column(Numeric(14, 2), nullable=False)
    price_per_plate = Column(Numeric(10, 2), nullable=True) # for catering
    extra_hour_rate = Column(Numeric(10, 2), nullable=True)
    taxes = Column(Numeric(14, 2), default=0.00)
    inclusions = Column(Text, nullable=True)
    exclusions = Column(Text, nullable=True)
    status = Column(String(50), default="Submitted") # Submitted, Accepted, Closed - Not Selected
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    request = relationship("QuotationRequest", back_populates="quotations")
    vendor = relationship("Vendor", back_populates="quotations")
    line_items = relationship("QuotationLineItem", back_populates="quotation", cascade="all, delete-orphan")

class QuotationLineItem(Base):
    __tablename__ = "quotation_line_items"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    vendor_quotation_id = Column(String(36), ForeignKey("vendor_quotations.id"), nullable=False, index=True)
    item_name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    quantity = Column(Float, default=1.0)
    unit_rate = Column(Numeric(12, 2), default=0.00)
    total_price = Column(Numeric(14, 2), nullable=False)
    is_inclusion = Column(Boolean, default=True)

    quotation = relationship("VendorQuotation", back_populates="line_items")

class WeddingVendor(Base):
    __tablename__ = "wedding_vendors"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    wedding_id = Column(String(36), ForeignKey("weddings.id"), nullable=False, index=True)
    vendor_id = Column(String(36), ForeignKey("vendors.id"), nullable=False, index=True)
    category_id = Column(String(36), ForeignKey("vendor_categories.id"), nullable=False)
    accepted_quotation_id = Column(String(36), ForeignKey("vendor_quotations.id"), nullable=True)
    agreed_amount = Column(Numeric(14, 2), nullable=False)
    rate_card = Column(JSON, default=dict) # per-plate rate, extra-hour rate, overtime rules
    status = Column(String(50), default="Confirmed") # Confirmed, Contract Signed, Completed, Cancelled
    created_at = Column(DateTime, default=datetime.utcnow)

    wedding = relationship("Wedding", back_populates="vendors")
    vendor = relationship("Vendor", back_populates="wedding_assignments")

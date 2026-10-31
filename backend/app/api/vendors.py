from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.models.user import User
from app.models.vendor import (
    Vendor,
    VendorCategory,
    QuotationRequest,
    VendorQuotation,
    WeddingVendor
)
from app.models.proposal_contract import SigningToken
from app.services.vendor_rfq_service import VendorRFQService
from app.api.deps import get_current_user

router = APIRouter(prefix="/vendors", tags=["Vendor Management & RFQ Matrix"])

class VendorCreateRequest(BaseModel):
    category_id: str
    business_name: str
    contact_person: str
    phone: str
    email: str
    address: Optional[str] = None
    city: str = "Jaipur"
    gst_number: Optional[str] = None
    rating: float = 4.8
    notes: Optional[str] = None

class RFQCreateRequest(BaseModel):
    wedding_id: str
    category_id: str
    title: str
    specifications: str

class VendorQuoteSubmissionRequest(BaseModel):
    quotation_request_id: str
    vendor_id: str
    total_amount: float
    price_per_plate: Optional[float] = None
    extra_hour_rate: Optional[float] = None
    taxes: float = 0.0
    inclusions: str = ""
    exclusions: str = ""
    line_items: List[Dict[str, Any]] = []
    notes: Optional[str] = None

class SelectWinnerRequest(BaseModel):
    quotation_id: str

@router.get("/categories")
def list_categories(db: Session = Depends(get_db)):
    """List 12 standard vendor categories."""
    cats = db.query(VendorCategory).all()
    return [{"id": c.id, "name": c.name, "code": c.code, "description": c.description} for c in cats]

@router.get("")
def list_vendors(
    category_id: Optional[str] = None,
    city: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Vendor).filter(Vendor.is_active == True)
    if category_id and category_id != "All":
        query = query.filter(Vendor.category_id == category_id)
    if city and city != "All":
        query = query.filter(Vendor.city == city)
    if search:
        query = query.filter(Vendor.business_name.ilike(f"%{search}%"))

    vendors = query.all()
    return [
        {
            "id": v.id,
            "business_name": v.business_name,
            "contact_person": v.contact_person,
            "category_id": v.category_id,
            "category_name": v.category.name if v.category else "",
            "phone": v.phone,
            "email": v.email,
            "city": v.city,
            "rating": v.rating,
            "on_time_percentage": v.on_time_percentage,
            "bill_variance_percentage": v.bill_variance_percentage,
            "gst_number": v.gst_number,
            "notes": v.notes
        }
        for v in vendors
    ]

@router.post("")
def create_vendor(
    data: VendorCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    vendor = Vendor(
        category_id=data.category_id,
        business_name=data.business_name,
        contact_person=data.contact_person,
        phone=data.phone,
        email=data.email,
        address=data.address,
        city=data.city,
        gst_number=data.gst_number,
        rating=data.rating,
        notes=data.notes
    )
    db.add(vendor)
    db.commit()
    db.refresh(vendor)
    return {"id": vendor.id, "business_name": vendor.business_name}

# RFQ Endpoints
@router.post("/rfq")
def create_rfq(
    data: RFQCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        rfq = VendorRFQService.create_rfq(
            db=db,
            wedding_id=data.wedding_id,
            category_id=data.category_id,
            title=data.title,
            specifications=data.specifications,
            user_id=current_user.id
        )
        return {"id": rfq.id, "title": rfq.title, "status": rfq.status}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/rfq")
def list_rfqs(
    wedding_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(QuotationRequest)
    if wedding_id:
        query = query.filter(QuotationRequest.wedding_id == wedding_id)
    rfqs = query.all()
    return [
        {
            "id": r.id,
            "wedding_id": r.wedding_id,
            "title": r.title,
            "status": r.status,
            "category_id": r.category_id,
            "created_at": r.created_at.isoformat(),
            "quotes_count": len(r.quotations)
        }
        for r in rfqs
    ]

@router.get("/rfq/wedding/{wedding_id}")
def get_wedding_rfqs(
    wedding_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    rfqs = db.query(QuotationRequest).filter(QuotationRequest.wedding_id == wedding_id).all()
    return [
        {
            "id": r.id,
            "title": r.title,
            "status": r.status,
            "category_id": r.category_id,
            "created_at": r.created_at.isoformat(),
            "quotes_count": len(r.quotations)
        }
        for r in rfqs
    ]

@router.get("/rfq/{rfq_id}/compare")
def compare_rfq_quotes(
    rfq_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Side-by-side normalised quotation comparison matrix."""
    try:
        return VendorRFQService.compare_quotations(db, rfq_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/rfq/select-winner")
def award_quotation(
    data: SelectWinnerRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Execute atomic winner selection:
    1. Mark selected quote Accepted.
    2. Auto-close others as 'Closed - Not Selected'.
    3. Bind vendor to wedding with rate card.
    Roll back everything if any step fails.
    """
    try:
        wv = VendorRFQService.select_winning_quotation(
            db=db,
            quotation_id=data.quotation_id,
            user_id=current_user.id
        )
        return {
            "success": True,
            "message": "Quotation successfully awarded. Rate card bound to wedding.",
            "wedding_vendor_id": wv.id,
            "agreed_amount": float(wv.agreed_amount),
            "rate_card": wv.rate_card
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/rfq/submit-quote")
def submit_quote(
    data: VendorQuoteSubmissionRequest,
    db: Session = Depends(get_db)
):
    """Submit structured quotation line items (used by mobile vendor link or staff)."""
    quote = VendorRFQService.submit_vendor_quotation(
        db=db,
        quotation_request_id=data.quotation_request_id,
        vendor_id=data.vendor_id,
        total_amount=data.total_amount,
        price_per_plate=data.price_per_plate,
        extra_hour_rate=data.extra_hour_rate,
        taxes=data.taxes,
        inclusions=data.inclusions,
        exclusions=data.exclusions,
        line_items=data.line_items,
        notes=data.notes
    )
    return {"id": quote.id, "status": quote.status, "total_amount": float(quote.total_amount)}

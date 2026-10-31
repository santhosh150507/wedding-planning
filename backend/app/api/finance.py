from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.models.user import User
from app.services.finance_service import FinanceService
from app.api.deps import get_current_user

router = APIRouter(prefix="/weddings/{wedding_id}/finance", tags=["Financial Accounting & Reconciliation"])

class ClientPaymentRecordRequest(BaseModel):
    amount: float
    milestone_id: Optional[str] = None
    payment_method: str = "Bank Transfer"
    transaction_reference: str
    notes: Optional[str] = None

class VendorPaymentRecordRequest(BaseModel):
    vendor_invoice_id: str
    amount: float
    transaction_reference: str
    payment_method: str = "Bank Transfer"
    notes: Optional[str] = None

class VendorInvoiceSubmitRequest(BaseModel):
    vendor_id: str
    invoice_number: str
    claimed_amount: float
    agreed_baseline_amount: float
    notes: Optional[str] = None

class ExtraChargeCalculateRequest(BaseModel):
    vendor_id: str
    category: str = "Catering"
    extra_plates: int = 0
    extra_hours: float = 0.0

@router.get("")
def get_wedding_finance(
    wedding_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        return FinanceService.get_wedding_financials(db, wedding_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/client-payments")
def record_client_payment(
    wedding_id: str,
    data: ClientPaymentRecordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        payment = FinanceService.record_client_payment(
            db=db,
            wedding_id=wedding_id,
            amount=data.amount,
            milestone_id=data.milestone_id,
            payment_method=data.payment_method,
            transaction_reference=data.transaction_reference,
            notes=data.notes,
            user_id=current_user.id
        )
        return {
            "success": True,
            "payment_id": payment.id,
            "amount": float(payment.amount),
            "receipt_pdf_url": payment.receipt_pdf_url,
            "transaction_reference": payment.transaction_reference
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/vendor-payments")
def record_vendor_payment(
    wedding_id: str,
    data: VendorPaymentRecordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        payment = FinanceService.record_vendor_payment(
            db=db,
            wedding_id=wedding_id,
            vendor_invoice_id=data.vendor_invoice_id,
            amount=data.amount,
            transaction_reference=data.transaction_reference,
            payment_method=data.payment_method,
            notes=data.notes,
            user_id=current_user.id
        )
        return {
            "success": True,
            "payment_id": payment.id,
            "amount": float(payment.amount),
            "transaction_reference": payment.transaction_reference
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/vendor-invoices")
def submit_vendor_invoice(
    wedding_id: str,
    data: VendorInvoiceSubmitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        inv = FinanceService.submit_vendor_invoice(
            db=db,
            wedding_id=wedding_id,
            vendor_id=data.vendor_id,
            invoice_number=data.invoice_number,
            claimed_amount=data.claimed_amount,
            agreed_baseline_amount=data.agreed_baseline_amount,
            notes=data.notes
        )
        return {
            "id": inv.id,
            "invoice_number": inv.invoice_number,
            "variance_amount": float(inv.variance_amount),
            "variance_status": inv.variance_status,
            "status": inv.status
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/extra-charges")
def calculate_extra_charges(
    wedding_id: str,
    data: ExtraChargeCalculateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        charges = FinanceService.calculate_and_add_extra_charges(
            db=db,
            wedding_id=wedding_id,
            vendor_id=data.vendor_id,
            category=data.category,
            extra_plates=data.extra_plates,
            extra_hours=data.extra_hours,
            user_id=current_user.id
        )
        return [
            {
                "id": c.id,
                "description": c.description,
                "total_amount": float(c.total_amount),
                "is_billable_to_client": c.is_billable_to_client
            }
            for c in charges
        ]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

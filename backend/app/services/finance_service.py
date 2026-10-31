import os
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.units import inch

from app.models.finance import (
    ClientPaymentMilestone,
    ClientPayment,
    VendorInvoice,
    VendorPayment,
    ExtraCharge,
    Expense,
    TimeEntry
)
from app.models.wedding import Wedding
from app.models.vendor import Vendor, WeddingVendor
from app.models.activity import ActivityLog
from app.core.config import settings

class FinanceService:
    @staticmethod
    def get_wedding_financials(db: Session, wedding_id: str) -> Dict[str, Any]:
        wedding = db.query(Wedding).filter(Wedding.id == wedding_id).first()
        if not wedding:
            raise ValueError("Wedding not found")

        # 1. Client Milestones & Payments
        milestones = db.query(ClientPaymentMilestone).filter(
            ClientPaymentMilestone.wedding_id == wedding_id
        ).order_by(ClientPaymentMilestone.due_date.asc()).all()

        client_payments = db.query(ClientPayment).filter(
            ClientPayment.wedding_id == wedding_id
        ).order_by(ClientPayment.payment_date.desc()).all()

        total_contracted_budget = float(wedding.agreed_budget)
        total_client_received = float(sum(p.amount for p in client_payments))
        client_outstanding = max(0.0, total_contracted_budget - total_client_received)

        # 2. Extra Charges
        extra_charges = db.query(ExtraCharge).filter(
            ExtraCharge.wedding_id == wedding_id
        ).all()
        total_extras_billable = float(sum(ec.total_amount for ec in extra_charges if ec.is_billable_to_client))

        # 3. Vendor Invoices & Payments
        invoices = db.query(VendorInvoice).filter(
            VendorInvoice.wedding_id == wedding_id
        ).all()

        vendor_payments = db.query(VendorPayment).filter(
            VendorPayment.wedding_id == wedding_id
        ).order_by(VendorPayment.payment_date.desc()).all()

        total_vendor_claimed = float(sum(inv.claimed_amount for inv in invoices))
        total_vendor_paid = float(sum(vp.amount for vp in vendor_payments))
        vendor_outstanding = max(0.0, total_vendor_claimed - total_vendor_paid)

        # 4. Expenses & Time entries
        expenses = db.query(Expense).filter(Expense.wedding_id == wedding_id).all()
        total_expenses = float(sum(e.amount for e in expenses))

        time_entries = db.query(TimeEntry).filter(TimeEntry.wedding_id == wedding_id).all()
        total_team_cost = float(sum(float(te.hours) * float(te.hourly_rate) for te in time_entries))

        # 5. Settlement Checklist
        # Every vendor assigned must have an invoice and must be fully paid
        wedding_vendors = db.query(WeddingVendor).filter(WeddingVendor.wedding_id == wedding_id).all()
        checklist = []
        all_settled = True
        for wv in wedding_vendors:
            v_name = wv.vendor.business_name if wv.vendor else "Vendor"
            v_invoices = [inv for inv in invoices if inv.vendor_id == wv.vendor_id]
            has_invoice = len(v_invoices) > 0
            v_inv_total = sum(inv.claimed_amount for inv in v_invoices)
            v_paid_total = sum(vp.amount for vp in vendor_payments if vp.vendor_id == wv.vendor_id)
            is_fully_paid = has_invoice and (v_paid_total >= v_inv_total)
            if not is_fully_paid:
                all_settled = False

            checklist.append({
                "vendor_id": wv.vendor_id,
                "vendor_name": v_name,
                "category": wv.vendor.category.name if (wv.vendor and wv.vendor.category) else "General",
                "agreed_amount": float(wv.agreed_amount),
                "has_invoice": has_invoice,
                "total_invoiced": float(v_inv_total),
                "total_paid": float(v_paid_total),
                "is_fully_paid": is_fully_paid
            })

        return {
            "wedding_id": wedding_id,
            "couple_title": wedding.couple_title,
            "agreed_budget": total_contracted_budget,
            "total_client_received": total_client_received,
            "client_outstanding": client_outstanding,
            "total_extras_billable": total_extras_billable,
            "total_vendor_invoiced": total_vendor_claimed,
            "total_vendor_paid": total_vendor_paid,
            "vendor_outstanding": vendor_outstanding,
            "total_agency_expenses": total_expenses,
            "total_team_cost": total_team_cost,
            "is_all_settled": all_settled,
            "milestones": [
                {
                    "id": m.id,
                    "milestone_name": m.milestone_name,
                    "percentage": m.percentage,
                    "expected_amount": float(m.expected_amount),
                    "due_date": m.due_date.isoformat(),
                    "status": m.status
                }
                for m in milestones
            ],
            "client_payments": [
                {
                    "id": cp.id,
                    "amount": float(cp.amount),
                    "payment_date": cp.payment_date.isoformat(),
                    "payment_method": cp.payment_method,
                    "transaction_reference": cp.transaction_reference,
                    "receipt_pdf_url": cp.receipt_pdf_url,
                    "notes": cp.notes
                }
                for cp in client_payments
            ],
            "vendor_invoices": [
                {
                    "id": inv.id,
                    "invoice_number": inv.invoice_number,
                    "vendor_id": inv.vendor_id,
                    "vendor_name": inv.vendor.business_name if inv.vendor else "Vendor",
                    "invoice_date": inv.invoice_date.isoformat(),
                    "claimed_amount": float(inv.claimed_amount),
                    "agreed_baseline_amount": float(inv.agreed_baseline_amount),
                    "variance_amount": float(inv.variance_amount),
                    "variance_status": inv.variance_status,
                    "status": inv.status,
                    "total_paid_towards_invoice": float(sum(vp.amount for vp in inv.payments)) if inv.payments else 0.0
                }
                for inv in invoices
            ],
            "vendor_payments": [
                {
                    "id": vp.id,
                    "vendor_id": vp.vendor_id,
                    "vendor_name": vp.vendor.business_name if vp.vendor else "Vendor",
                    "amount": float(vp.amount),
                    "payment_date": vp.payment_date.isoformat(),
                    "transaction_reference": vp.transaction_reference,
                    "payment_method": vp.payment_method
                }
                for vp in vendor_payments
            ],
            "extra_charges": [
                {
                    "id": ec.id,
                    "category": ec.category,
                    "description": ec.description,
                    "quantity": ec.quantity,
                    "unit_rate": float(ec.unit_rate),
                    "total_amount": float(ec.total_amount),
                    "is_billable_to_client": ec.is_billable_to_client,
                    "added_to_client_bill": ec.added_to_client_bill
                }
                for ec in extra_charges
            ],
            "expenses": [
                {
                    "id": exp.id,
                    "category": exp.category,
                    "amount": float(exp.amount),
                    "date": exp.date.isoformat(),
                    "notes": exp.notes
                }
                for exp in expenses
            ],
            "settlement_checklist": checklist
        }

    @staticmethod
    def record_client_payment(
        db: Session,
        wedding_id: str,
        amount: float,
        milestone_id: Optional[str],
        payment_method: str,
        transaction_reference: str,
        notes: Optional[str],
        user_id: str
    ) -> ClientPayment:
        # Check duplicate transaction reference
        existing = db.query(ClientPayment).filter(
            ClientPayment.transaction_reference == transaction_reference
        ).first()
        if existing:
            raise ValueError(f"Duplicate payment reference: '{transaction_reference}' is already registered.")

        wedding = db.query(Wedding).filter(Wedding.id == wedding_id).first()
        if not wedding:
            raise ValueError("Wedding not found")

        # Generate receipt PDF
        receipt_filename = f"Receipt_{transaction_reference}.pdf"
        receipt_path = os.path.join(settings.UPLOAD_DIR, receipt_filename)
        FinanceService._generate_receipt_pdf(
            wedding=wedding,
            amount=amount,
            method=payment_method,
            tx_ref=transaction_reference,
            output_path=receipt_path
        )

        payment = ClientPayment(
            wedding_id=wedding_id,
            milestone_id=milestone_id,
            amount=amount,
            payment_date=datetime.utcnow(),
            payment_method=payment_method,
            transaction_reference=transaction_reference,
            receipt_pdf_url=f"/uploads/{receipt_filename}",
            notes=notes
        )
        db.add(payment)

        # If milestone specified, update status if paid in full
        if milestone_id:
            m = db.query(ClientPaymentMilestone).filter(ClientPaymentMilestone.id == milestone_id).first()
            if m:
                m_total_paid = float(sum(p.amount for p in m.payments)) + amount
                if m_total_paid >= float(m.expected_amount):
                    m.status = "Paid"

        db.commit()
        db.refresh(payment)

        log = ActivityLog(
            user_id=user_id,
            wedding_id=wedding_id,
            action="CLIENT_PAYMENT_RECORDED",
            details={"amount": amount, "reference": transaction_reference}
        )
        db.add(log)
        db.commit()
        return payment

    @staticmethod
    def record_vendor_payment(
        db: Session,
        wedding_id: str,
        vendor_invoice_id: str,
        amount: float,
        transaction_reference: str,
        payment_method: str = "Bank Transfer",
        notes: Optional[str] = None,
        user_id: Optional[str] = None
    ) -> VendorPayment:
        # 1. Prevent duplicate transaction reference
        existing = db.query(VendorPayment).filter(
            VendorPayment.transaction_reference == transaction_reference
        ).first()
        if existing:
            raise ValueError(f"Duplicate payment reference: '{transaction_reference}' has already been processed.")

        # 2. Fetch invoice and check overpayment
        invoice = db.query(VendorInvoice).filter(VendorInvoice.id == vendor_invoice_id).first()
        if not invoice:
            raise ValueError("Vendor invoice not found")

        current_total_paid = float(sum(vp.amount for vp in invoice.payments))
        claimed_max = float(invoice.claimed_amount)
        new_total = current_total_paid + amount

        if new_total > claimed_max + 0.01:
            excess = new_total - claimed_max
            raise ValueError(
                f"Payment rejected: Claimed invoice total is ₹{claimed_max:,.2f}. "
                f"Already paid ₹{current_total_paid:,.2f}. Attempting to pay ₹{amount:,.2f} "
                f"which exceeds the payable amount by ₹{excess:,.2f}."
            )

        payment = VendorPayment(
            wedding_id=wedding_id,
            vendor_invoice_id=vendor_invoice_id,
            vendor_id=invoice.vendor_id,
            amount=amount,
            payment_date=datetime.utcnow(),
            transaction_reference=transaction_reference,
            payment_method=payment_method,
            notes=notes
        )
        db.add(payment)

        # Update invoice status if fully settled
        if new_total >= claimed_max - 0.01:
            invoice.status = "Paid"

        db.commit()
        db.refresh(payment)

        if user_id:
            log = ActivityLog(
                user_id=user_id,
                wedding_id=wedding_id,
                action="VENDOR_PAYMENT_EXECUTED",
                details={"amount": amount, "invoice_id": vendor_invoice_id, "ref": transaction_reference}
            )
            db.add(log)
            db.commit()

        return payment

    @staticmethod
    def calculate_and_add_extra_charges(
        db: Session,
        wedding_id: str,
        vendor_id: str,
        category: str,
        extra_plates: int = 0,
        extra_hours: float = 0.0,
        user_id: Optional[str] = None
    ) -> List[ExtraCharge]:
        """
        Calculate extra charges dynamically from the accepted rate card bound in wedding_vendors.
        60 extra plates x Rs 4,500/plate
        2 extra hours x Rs 25,000/hour
        """
        wv = db.query(WeddingVendor).filter(
            WeddingVendor.wedding_id == wedding_id,
            WeddingVendor.vendor_id == vendor_id
        ).first()

        rate_card = wv.rate_card if wv and wv.rate_card else {}
        plate_rate = float(rate_card.get("price_per_plate") or 4500.0)
        hour_rate = float(rate_card.get("extra_hour_rate") or 25000.0)

        created = []
        if extra_plates > 0:
            total_plate_charge = extra_plates * plate_rate
            ec1 = ExtraCharge(
                wedding_id=wedding_id,
                vendor_id=vendor_id,
                category=category,
                description=f"Guest Walk-in Extras: {extra_plates} additional banqueting plates @ ₹{plate_rate:,.2f}",
                unit_rate=plate_rate,
                quantity=float(extra_plates),
                total_amount=total_plate_charge,
                is_billable_to_client=True,
                added_to_client_bill=True
            )
            db.add(ec1)
            created.append(ec1)

        if extra_hours > 0:
            total_hour_charge = extra_hours * hour_rate
            ec2 = ExtraCharge(
                wedding_id=wedding_id,
                vendor_id=vendor_id,
                category=category,
                description=f"Curfew Overtime: {extra_hours} extra hours @ ₹{hour_rate:,.2f}/hr",
                unit_rate=hour_rate,
                quantity=extra_hours,
                total_amount=total_hour_charge,
                is_billable_to_client=True,
                added_to_client_bill=True
            )
            db.add(ec2)
            created.append(ec2)

        db.commit()
        return created

    @staticmethod
    def submit_vendor_invoice(
        db: Session,
        wedding_id: str,
        vendor_id: str,
        invoice_number: str,
        claimed_amount: float,
        agreed_baseline_amount: float,
        notes: Optional[str] = None
    ) -> VendorInvoice:
        variance_amount = claimed_amount - agreed_baseline_amount
        # Flag if variance exceeds 5% of agreed baseline
        variance_status = "Flagged" if (agreed_baseline_amount > 0 and (variance_amount / agreed_baseline_amount) > 0.05) else "OK"

        inv = VendorInvoice(
            wedding_id=wedding_id,
            vendor_id=vendor_id,
            invoice_number=invoice_number,
            invoice_date=datetime.utcnow(),
            claimed_amount=claimed_amount,
            agreed_baseline_amount=agreed_baseline_amount,
            variance_amount=variance_amount,
            variance_status=variance_status,
            status="Approved" if variance_status == "OK" else "Pending",
            notes=notes
        )
        db.add(inv)
        db.commit()
        db.refresh(inv)
        return inv

    @staticmethod
    def _generate_receipt_pdf(wedding: Wedding, amount: float, method: str, tx_ref: str, output_path: str):
        c = canvas.Canvas(output_path, pagesize=letter)
        width, height = letter

        # Header
        c.setFillColor(colors.HexColor("#1A1F2C"))
        c.rect(0, height - 1.2 * inch, width, 1.2 * inch, stroke=0, fill=1)

        c.setFillColor(colors.HexColor("#FAF8F5"))
        c.setFont("Helvetica-Bold", 18)
        c.drawString(0.75 * inch, height - 0.7 * inch, "THE ROYAL KNOT")
        c.setFont("Helvetica", 10)
        c.drawString(0.75 * inch, height - 0.95 * inch, "OFFICIAL PAYMENT RECEIPT & TAX INVOICE ACKNOWLEDGEMENT")

        # Receipt Body
        c.setFillColor(colors.HexColor("#1A1F2C"))
        c.setFont("Helvetica-Bold", 14)
        c.drawString(0.75 * inch, height - 1.8 * inch, f"Receipt for {wedding.couple_title}")

        c.setFont("Helvetica", 10)
        c.drawString(0.75 * inch, height - 2.1 * inch, f"Wedding Number: {wedding.wedding_number}")
        c.drawString(0.75 * inch, height - 2.3 * inch, f"Destination: {wedding.destination} | Venue: {wedding.venue_name}")
        c.drawString(0.75 * inch, height - 2.5 * inch, f"Payment Date: {datetime.utcnow().strftime('%B %d, %Y')}")
        c.drawString(0.75 * inch, height - 2.7 * inch, f"Payment Method: {method}")
        c.drawString(0.75 * inch, height - 2.9 * inch, f"Transaction Ref: {tx_ref}")

        # Amount Box
        c.setFillColor(colors.HexColor("#F4EFEA"))
        c.rect(0.75 * inch, height - 3.8 * inch, 6.5 * inch, 0.7 * inch, fill=1, stroke=0)
        c.setFillColor(colors.HexColor("#1A1F2C"))
        c.setFont("Helvetica-Bold", 16)
        c.drawString(1.0 * inch, height - 3.45 * inch, f"AMOUNT RECEIVED: INR {amount:,.2f}")

        # Footer
        c.setFont("Helvetica-Oblique", 9)
        c.drawString(0.75 * inch, 0.75 * inch, "Thank you for trusting The Royal Knot. Curation with royal heritage and utmost discretion.")
        c.save()

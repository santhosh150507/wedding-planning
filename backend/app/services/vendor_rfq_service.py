from datetime import datetime, timedelta
import uuid
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.vendor import (
    Vendor,
    VendorCategory,
    QuotationRequest,
    VendorQuotation,
    QuotationLineItem,
    WeddingVendor
)
from app.models.wedding import Wedding
from app.models.proposal_contract import SigningToken
from app.models.activity import ActivityLog

class VendorRFQService:
    @staticmethod
    def create_rfq(
        db: Session,
        wedding_id: str,
        category_id: str,
        title: str,
        specifications: str,
        user_id: str
    ) -> QuotationRequest:
        wedding = db.query(Wedding).filter(Wedding.id == wedding_id).first()
        if not wedding:
            raise ValueError("Wedding not found")

        rfq = QuotationRequest(
            wedding_id=wedding_id,
            category_id=category_id,
            title=title,
            specifications=specifications,
            status="Open"
        )
        db.add(rfq)
        db.commit()
        db.refresh(rfq)

        log = ActivityLog(
            user_id=user_id,
            wedding_id=wedding_id,
            action="RFQ_CREATED",
            details={"title": title, "category_id": category_id}
        )
        db.add(log)
        db.commit()
        return rfq

    @staticmethod
    def create_vendor_quote_token(
        db: Session,
        quotation_request_id: str,
        vendor_id: str
    ) -> SigningToken:
        vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
        if not vendor:
            raise ValueError("Vendor not found")

        token_str = str(uuid.uuid4()).replace("-", "")
        expires_at = datetime.utcnow() + timedelta(days=14)

        token = SigningToken(
            token=token_str,
            target_type="vendor_rfq",
            target_id=quotation_request_id,
            recipient_email=vendor.email,
            recipient_name=vendor.contact_person,
            expires_at=expires_at
        )
        db.add(token)
        db.commit()
        db.refresh(token)
        return token

    @staticmethod
    def submit_vendor_quotation(
        db: Session,
        quotation_request_id: str,
        vendor_id: str,
        total_amount: float,
        price_per_plate: Optional[float],
        extra_hour_rate: Optional[float],
        taxes: float,
        inclusions: str,
        exclusions: str,
        line_items: List[Dict[str, Any]],
        notes: Optional[str] = None
    ) -> VendorQuotation:
        # Check if already submitted
        existing = db.query(VendorQuotation).filter(
            VendorQuotation.quotation_request_id == quotation_request_id,
            VendorQuotation.vendor_id == vendor_id
        ).first()

        if existing:
            # Update existing quote
            quote = existing
            quote.total_amount = total_amount
            quote.price_per_plate = price_per_plate
            quote.extra_hour_rate = extra_hour_rate
            quote.taxes = taxes
            quote.inclusions = inclusions
            quote.exclusions = exclusions
            quote.notes = notes
            quote.status = "Submitted"
            # Delete old line items
            db.query(QuotationLineItem).filter(QuotationLineItem.vendor_quotation_id == quote.id).delete()
        else:
            quote = VendorQuotation(
                quotation_request_id=quotation_request_id,
                vendor_id=vendor_id,
                total_amount=total_amount,
                price_per_plate=price_per_plate,
                extra_hour_rate=extra_hour_rate,
                taxes=taxes,
                inclusions=inclusions,
                exclusions=exclusions,
                notes=notes,
                status="Submitted"
            )
            db.add(quote)
            db.commit()
            db.refresh(quote)

        # Add line items
        for item in line_items:
            li = QuotationLineItem(
                vendor_quotation_id=quote.id,
                item_name=item["item_name"],
                description=item.get("description", ""),
                quantity=item.get("quantity", 1.0),
                unit_rate=item.get("unit_rate", 0.0),
                total_price=item["total_price"],
                is_inclusion=item.get("is_inclusion", True)
            )
            db.add(li)

        db.commit()
        db.refresh(quote)
        return quote

    @staticmethod
    def compare_quotations(db: Session, quotation_request_id: str) -> Dict[str, Any]:
        rfq = db.query(QuotationRequest).filter(QuotationRequest.id == quotation_request_id).first()
        if not rfq:
            raise ValueError("RFQ not found")

        quotes = db.query(VendorQuotation).filter(
            VendorQuotation.quotation_request_id == quotation_request_id
        ).all()

        wedding = rfq.wedding
        guest_count = wedding.expected_guest_count if wedding else 400

        normalized_quotes = []
        lowest_total = float('inf')
        winning_quote_id = None

        # Build list of common standard inclusions across quotes
        all_inclusions_set = set()
        for q in quotes:
            inc_list = [i.strip() for i in (q.inclusions or "").split("\n") if i.strip()]
            all_inclusions_set.update(inc_list)

        for q in quotes:
            v = q.vendor
            # Computed total based on per_plate or fixed total
            if q.price_per_plate and q.price_per_plate > 0:
                normalized_total = float(q.price_per_plate) * guest_count + float(q.taxes or 0.0)
            else:
                normalized_total = float(q.total_amount)

            if normalized_total < lowest_total:
                lowest_total = normalized_total
                winning_quote_id = q.id

            q_inclusions = [i.strip() for i in (q.inclusions or "").split("\n") if i.strip()]
            missing_inclusions = list(all_inclusions_set - set(q_inclusions))

            items_data = [
                {
                    "item_name": item.item_name,
                    "description": item.description,
                    "quantity": float(item.quantity),
                    "unit_rate": float(item.unit_rate),
                    "total_price": float(item.total_price),
                    "is_inclusion": item.is_inclusion
                }
                for item in q.line_items
            ]

            normalized_quotes.append({
                "quotation_id": q.id,
                "vendor_id": v.id,
                "vendor_name": v.business_name,
                "contact_person": v.contact_person,
                "vendor_rating": v.rating,
                "on_time_percentage": v.on_time_percentage,
                "bill_variance_percentage": v.bill_variance_percentage,
                "price_per_plate": float(q.price_per_plate) if q.price_per_plate else None,
                "extra_hour_rate": float(q.extra_hour_rate) if q.extra_hour_rate else None,
                "taxes": float(q.taxes),
                "total_amount": float(q.total_amount),
                "normalized_total_for_guests": normalized_total,
                "status": q.status,
                "inclusions": q_inclusions,
                "exclusions": [e.strip() for e in (q.exclusions or "").split("\n") if e.strip()],
                "missing_inclusions": missing_inclusions,
                "line_items": items_data,
                "notes": q.notes
            })

        return {
            "rfq_id": rfq.id,
            "rfq_title": rfq.title,
            "category_name": rfq.wedding.destination,
            "guest_count": guest_count,
            "rfq_status": rfq.status,
            "lowest_total_estimate": lowest_total if lowest_total != float('inf') else 0,
            "recommended_lowest_quote_id": winning_quote_id,
            "quotations": normalized_quotes
        }

    @staticmethod
    def select_winning_quotation(db: Session, quotation_id: str, user_id: str) -> WeddingVendor:
        """
        ATOMIC SELECTION (1 DB Transaction):
        1. Mark chosen quote as Accepted.
        2. Auto-close all competing quotes in that RFQ as 'Closed - Not Selected'.
        3. Bind winning vendor into wedding_vendors with rate card.
        4. Close RFQ status as 'Awarded'.
        """
        try:
            winning_quote = db.query(VendorQuotation).filter(VendorQuotation.id == quotation_id).first()
            if not winning_quote:
                raise ValueError("Quotation not found")

            rfq = winning_quote.request
            if not rfq:
                raise ValueError("Linked RFQ not found")

            # 1. Mark winner Accepted
            winning_quote.status = "Accepted"

            # 2. Auto-close all other quotes for this RFQ
            competing_quotes = db.query(VendorQuotation).filter(
                VendorQuotation.quotation_request_id == rfq.id,
                VendorQuotation.id != quotation_id
            ).all()

            for comp in competing_quotes:
                comp.status = "Closed - Not Selected"

            # 3. Create or update wedding_vendors
            rate_card = {
                "price_per_plate": float(winning_quote.price_per_plate) if winning_quote.price_per_plate else None,
                "extra_hour_rate": float(winning_quote.extra_hour_rate) if winning_quote.extra_hour_rate else None,
                "taxes": float(winning_quote.taxes),
                "agreed_inclusions": winning_quote.inclusions
            }

            # Remove existing vendor assignment for same category if any
            existing_wv = db.query(WeddingVendor).filter(
                WeddingVendor.wedding_id == rfq.wedding_id,
                WeddingVendor.category_id == rfq.category_id
            ).first()

            if existing_wv:
                wv = existing_wv
                wv.vendor_id = winning_quote.vendor_id
                wv.accepted_quotation_id = winning_quote.id
                wv.agreed_amount = winning_quote.total_amount
                wv.rate_card = rate_card
                wv.status = "Confirmed"
            else:
                wv = WeddingVendor(
                    wedding_id=rfq.wedding_id,
                    vendor_id=winning_quote.vendor_id,
                    category_id=rfq.category_id,
                    accepted_quotation_id=winning_quote.id,
                    agreed_amount=winning_quote.total_amount,
                    rate_card=rate_card,
                    status="Confirmed"
                )
                db.add(wv)

            # 4. Mark RFQ Awarded
            rfq.status = "Awarded"

            # Log audit trail
            log = ActivityLog(
                user_id=user_id,
                wedding_id=rfq.wedding_id,
                action="VENDOR_QUOTATION_AWARDED",
                details={
                    "rfq_id": rfq.id,
                    "winning_vendor_id": winning_quote.vendor_id,
                    "agreed_amount": float(winning_quote.total_amount),
                    "rate_card": rate_card
                }
            )
            db.add(log)

            # Atomic commit
            db.commit()
            db.refresh(wv)
            return wv
        except Exception as e:
            db.rollback()
            raise e

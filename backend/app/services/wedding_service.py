from datetime import datetime, timedelta
import uuid
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.enquiry import Enquiry
from app.models.wedding import Wedding, WeddingEvent
from app.models.proposal_contract import Contract
from app.models.finance import ClientPaymentMilestone, ClientPayment, VendorInvoice, VendorPayment, Expense, TimeEntry
from app.models.activity import ActivityLog
from app.services.task_engine_service import TaskEngineService

class WeddingService:
    @staticmethod
    def convert_enquiry_to_wedding(db: Session, enquiry_id: str, user_id: str) -> Wedding:
        enquiry = db.query(Enquiry).filter(Enquiry.id == enquiry_id).first()
        if not enquiry:
            raise ValueError("Enquiry not found")

        # Check if already converted
        existing_wedding = db.query(Wedding).filter(Wedding.enquiry_id == enquiry_id).first()
        if existing_wedding:
            return existing_wedding

        # Generate wedding number
        year = datetime.utcnow().year
        count = db.query(Wedding).count() + 1
        wedding_number = f"RK-WED-{year}-{count:03d}"

        # Determine budget from proposal, contract or enquiry
        agreed_budget = enquiry.budget_max
        contract = db.query(Contract).filter(Contract.enquiry_id == enquiry_id).first()
        if contract and contract.total_amount:
            agreed_budget = contract.total_amount

        wedding = Wedding(
            wedding_number=wedding_number,
            enquiry_id=enquiry_id,
            couple_title=f"{enquiry.bride_name} & {enquiry.groom_name}",
            bride_name=enquiry.bride_name,
            groom_name=enquiry.groom_name,
            primary_contact_name=f"{enquiry.groom_name}",
            contact_phone=enquiry.phone,
            contact_email=enquiry.email,
            wedding_date_start=enquiry.preferred_date,
            wedding_date_end=enquiry.preferred_date + timedelta(days=2),
            destination=enquiry.destination,
            venue_name=enquiry.venue_preference or f"Grand Heritage Palace, {enquiry.destination}",
            expected_guest_count=enquiry.guest_count,
            package_type=enquiry.package_type,
            agreed_budget=agreed_budget,
            assigned_planner_id=enquiry.assigned_planner_id or user_id,
            status="Planning",
            notes=enquiry.additional_notes
        )
        db.add(wedding)
        db.commit()
        db.refresh(wedding)

        # Link contract to wedding
        if contract:
            contract.wedding_id = wedding.id

        # Update enquiry status
        enquiry.status = "Confirmed"
        enquiry.last_activity_at = datetime.utcnow()

        # Seed default events from functions_requested
        default_times = [
            ("10:00 AM", "02:00 PM"),
            ("07:00 PM", "12:00 AM"),
            ("04:30 PM", "09:30 PM"),
            ("08:00 PM", "01:00 AM")
        ]
        functions = enquiry.functions_requested or ["Mehendi", "Sangeet", "Wedding", "Reception"]
        for idx, fn in enumerate(functions):
            st, et = default_times[idx % len(default_times)]
            day_offset = idx // 2
            ev = WeddingEvent(
                wedding_id=wedding.id,
                title=fn,
                venue=wedding.venue_name,
                event_date=wedding.wedding_date_start + timedelta(days=day_offset),
                start_time=st,
                end_time=et,
                dress_code="Royal Heritage Festive",
                description=f"Official {fn} ceremony for {wedding.couple_title}."
            )
            db.add(ev)
        db.commit()

        # Trigger Instant Plan engine (seeds 25+ tasks idempotently and payment milestones)
        TaskEngineService.generate_instant_plan(db, wedding.id, user_id)

        # Audit log
        log = ActivityLog(
            user_id=user_id,
            wedding_id=wedding.id,
            enquiry_id=enquiry_id,
            action="ENQUIRY_CONVERTED_TO_WEDDING",
            details={"wedding_number": wedding.wedding_number, "couple": wedding.couple_title}
        )
        db.add(log)
        db.commit()
        return wedding

    @staticmethod
    def get_weddings_directory(
        db: Session,
        search: Optional[str] = None,
        status: Optional[str] = None,
        planner_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        query = db.query(Wedding)
        if search:
            query = query.filter(Wedding.couple_title.ilike(f"%{search}%"))
        if status and status != "All":
            query = query.filter(Wedding.status == status)
        if planner_id and planner_id != "All":
            query = query.filter(Wedding.assigned_planner_id == planner_id)

        weddings = query.order_by(desc(Wedding.wedding_date_start)).all()
        result = []
        for w in weddings:
            # Calculate progress based on tasks completed
            total_tasks = len(w.tasks)
            completed_tasks = sum(1 for t in w.tasks if t.status == "Done")
            progress_pct = int((completed_tasks / total_tasks * 100)) if total_tasks > 0 else 15

            # Financial summary
            total_paid = float(sum(p.amount for p in w.payments)) if w.payments else 0.0
            budget_val = float(w.agreed_budget)
            payment_status = "Fully Settled" if total_paid >= budget_val and budget_val > 0 else "Partially Paid" if total_paid > 0 else "Deposit Pending"

            # Gatekeeper rule check: is contract signed?
            contract_signed = False
            if w.contract and w.contract.status == "Signed":
                contract_signed = True
            elif w.enquiry and w.enquiry.contract and w.enquiry.contract.status == "Signed":
                contract_signed = True

            result.append({
                "id": w.id,
                "wedding_number": w.wedding_number,
                "couple_title": w.couple_title,
                "bride_name": w.bride_name,
                "groom_name": w.groom_name,
                "wedding_date_start": w.wedding_date_start.isoformat(),
                "destination": w.destination,
                "venue_name": w.venue_name,
                "expected_guest_count": w.expected_guest_count,
                "package_type": w.package_type,
                "agreed_budget": budget_val,
                "assigned_planner_name": w.assigned_planner.full_name if w.assigned_planner else "Unassigned",
                "status": w.status,
                "progress_percentage": progress_pct,
                "total_paid": total_paid,
                "payment_status": payment_status,
                "is_contract_signed": contract_signed
            })
        return result

    @staticmethod
    def get_wedding_workspace(db: Session, wedding_id: str) -> Dict[str, Any]:
        wedding = db.query(Wedding).filter(Wedding.id == wedding_id).first()
        if not wedding:
            raise ValueError("Wedding workspace not found")

        # Gatekeeper rule: is contract signed?
        contract_signed = False
        contract_data = None
        if wedding.contract:
            contract_signed = wedding.contract.status == "Signed"
            contract_data = {
                "id": wedding.contract.id,
                "contract_number": wedding.contract.contract_number,
                "status": wedding.contract.status,
                "total_amount": float(wedding.contract.total_amount),
                "pdf_url": wedding.contract.pdf_url,
                "signed_at": wedding.contract.signed_at.isoformat() if wedding.contract.signed_at else None,
                "signed_by": wedding.contract.signed_by_name
            }
        elif wedding.enquiry and wedding.enquiry.contract:
            contract_signed = wedding.enquiry.contract.status == "Signed"
            contract_data = {
                "id": wedding.enquiry.contract.id,
                "contract_number": wedding.enquiry.contract.contract_number,
                "status": wedding.enquiry.contract.status,
                "total_amount": float(wedding.enquiry.contract.total_amount),
                "pdf_url": wedding.enquiry.contract.pdf_url,
                "signed_at": wedding.enquiry.contract.signed_at.isoformat() if wedding.enquiry.contract.signed_at else None,
                "signed_by": wedding.enquiry.contract.signed_by_name
            }

        # 10 Tabs Data Aggregation:
        return {
            "overview": {
                "id": wedding.id,
                "wedding_number": wedding.wedding_number,
                "couple_title": wedding.couple_title,
                "bride_name": wedding.bride_name,
                "groom_name": wedding.groom_name,
                "primary_contact_name": wedding.primary_contact_name,
                "contact_phone": wedding.contact_phone,
                "contact_email": wedding.contact_email,
                "wedding_date_start": wedding.wedding_date_start.isoformat(),
                "wedding_date_end": wedding.wedding_date_end.isoformat(),
                "destination": wedding.destination,
                "venue_name": wedding.venue_name,
                "expected_guest_count": wedding.expected_guest_count,
                "package_type": wedding.package_type,
                "agreed_budget": float(wedding.agreed_budget),
                "assigned_planner_name": wedding.assigned_planner.full_name if wedding.assigned_planner else "Unassigned",
                "assigned_planner_id": wedding.assigned_planner_id,
                "status": wedding.status,
                "notes": wedding.notes,
                "is_contract_signed": contract_signed
            },
            "contract": contract_data,
            "events": [
                {
                    "id": ev.id,
                    "title": ev.title,
                    "venue": ev.venue,
                    "event_date": ev.event_date.isoformat(),
                    "start_time": ev.start_time,
                    "end_time": ev.end_time,
                    "dress_code": ev.dress_code,
                    "description": ev.description
                }
                for ev in wedding.events
            ],
            "vendors": [
                {
                    "id": wv.id,
                    "vendor_id": wv.vendor_id,
                    "business_name": wv.vendor.business_name if wv.vendor else "Vendor",
                    "category": wv.vendor.category.name if (wv.vendor and wv.vendor.category) else "General",
                    "agreed_amount": float(wv.agreed_amount),
                    "rate_card": wv.rate_card,
                    "status": wv.status
                }
                for wv in wedding.vendors
            ] if contract_signed else [], # Locked if contract not signed!
            "gatekeeper_locked": not contract_signed,
            "tasks_count": len(wedding.tasks),
            "guests_count": len(wedding.guests),
            "total_revenue": float(sum(p.amount for p in wedding.payments)) if wedding.payments else 0.0,
            "total_vendor_expenses": float(sum(vp.amount for vp in wedding.vendor_payments)) if wedding.vendor_payments else 0.0
        }

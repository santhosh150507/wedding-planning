import csv
import io
from datetime import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.guest import Guest
from app.models.wedding import Wedding
from app.models.finance import ExtraCharge
from app.models.activity import ActivityLog

class GuestService:
    @staticmethod
    def get_guests(
        db: Session,
        wedding_id: str,
        search: Optional[str] = None,
        rsvp_status: Optional[str] = None,
        category: Optional[str] = None
    ) -> List[Guest]:
        query = db.query(Guest).filter(Guest.wedding_id == wedding_id)
        if search:
            query = query.filter(Guest.full_name.ilike(f"%{search}%"))
        if rsvp_status and rsvp_status != "All":
            query = query.filter(Guest.rsvp_status == rsvp_status)
        if category and category != "All":
            query = query.filter(Guest.category == category)
        return query.order_by(Guest.full_name.asc()).all()

    @staticmethod
    def add_guest(
        db: Session,
        wedding_id: str,
        full_name: str,
        phone: Optional[str] = None,
        email: Optional[str] = None,
        category: str = "Friend",
        expected_party_size: int = 1,
        rsvp_status: str = "Invited",
        dietary_preference: str = "Vegetarian",
        table_number: Optional[str] = None,
        notes: Optional[str] = None
    ) -> Guest:
        guest = Guest(
            wedding_id=wedding_id,
            full_name=full_name,
            phone=phone,
            email=email,
            category=category,
            expected_party_size=expected_party_size,
            rsvp_status=rsvp_status,
            dietary_preference=dietary_preference,
            table_number=table_number,
            notes=notes
        )
        db.add(guest)
        db.commit()
        db.refresh(guest)
        return guest

    @staticmethod
    def import_guests_csv(db: Session, wedding_id: str, csv_content: str, user_id: str) -> Dict[str, Any]:
        """
        Bulk import guests from CSV.
        Expected headers (case-insensitive):
        full_name (required), phone, email, category, party_size / expected_party_size,
        rsvp_status, dietary_preference, table_number, notes
        """
        wedding = db.query(Wedding).filter(Wedding.id == wedding_id).first()
        if not wedding:
            raise ValueError("Wedding not found")

        reader = csv.DictReader(io.StringIO(csv_content))
        imported_count = 0
        errors = []

        valid_rsvps = {"Invited", "Confirmed", "Declined", "Tentative"}
        valid_categories = {"Bride Family", "Groom Family", "VIP", "Friend", "Corporate", "Other"}

        row_num = 1
        for row in reader:
            row_num += 1
            # Normalize keys to lower case
            clean_row = {k.strip().lower(): (v.strip() if v else "") for k, v in row.items() if k}
            
            name = clean_row.get("full_name") or clean_row.get("name")
            if not name:
                errors.append(f"Row {row_num}: Missing full_name")
                continue

            phone = clean_row.get("phone", "")
            email = clean_row.get("email", "")
            cat = clean_row.get("category", "Friend")
            rsvp = clean_row.get("rsvp_status", "Invited")
            diet = clean_row.get("dietary_preference") or clean_row.get("diet", "Vegetarian")
            table = clean_row.get("table_number") or clean_row.get("table", "")
            notes = clean_row.get("notes", "")

            try:
                party_size = int(clean_row.get("party_size") or clean_row.get("expected_party_size") or "1")
            except ValueError:
                party_size = 1

            if rsvp.title() in valid_rsvps:
                rsvp = rsvp.title()
            else:
                rsvp = "Invited"

            guest = Guest(
                wedding_id=wedding_id,
                full_name=name,
                phone=phone,
                email=email,
                category=cat,
                expected_party_size=party_size,
                rsvp_status=rsvp,
                dietary_preference=diet,
                table_number=table,
                notes=notes
            )
            db.add(guest)
            imported_count += 1

        db.commit()

        # Audit
        log = ActivityLog(
            user_id=user_id,
            wedding_id=wedding_id,
            action="GUESTS_CSV_IMPORTED",
            details={"imported_count": imported_count, "errors_count": len(errors)}
        )
        db.add(log)
        db.commit()

        return {
            "success": True,
            "imported_count": imported_count,
            "errors": errors
        }

    @staticmethod
    def get_guest_statistics(db: Session, wedding_id: str) -> Dict[str, Any]:
        guests = db.query(Guest).filter(Guest.wedding_id == wedding_id).all()
        total_guests = len(guests)
        total_expected_heads = sum(g.expected_party_size for g in guests)
        confirmed_heads = sum(g.expected_party_size for g in guests if g.rsvp_status == "Confirmed")
        declined_heads = sum(g.expected_party_size for g in guests if g.rsvp_status == "Declined")
        tentative_heads = sum(g.expected_party_size for g in guests if g.rsvp_status in ("Tentative", "Invited"))
        actual_checked_in = sum(g.actual_checked_in_count for g in guests)
        additional_walkins = sum(g.additional_walkin_count for g in guests)

        dietary_breakdown: Dict[str, int] = {}
        for g in guests:
            diet = g.dietary_preference or "Vegetarian"
            dietary_breakdown[diet] = dietary_breakdown.get(diet, 0) + g.expected_party_size

        return {
            "total_parties": total_guests,
            "total_expected_heads": total_expected_heads,
            "confirmed_heads": confirmed_heads,
            "declined_heads": declined_heads,
            "tentative_heads": tentative_heads,
            "actual_checked_in": actual_checked_in,
            "additional_walkins": additional_walkins,
            "dietary_breakdown": dietary_breakdown
        }

    @staticmethod
    def record_walkin(db: Session, wedding_id: str, guest_id: str, walkin_count: int) -> Guest:
        guest = db.query(Guest).filter(Guest.id == guest_id, Guest.wedding_id == wedding_id).first()
        if not guest:
            raise ValueError("Guest not found")
        guest.additional_walkin_count += walkin_count
        guest.actual_checked_in_count += walkin_count
        db.commit()
        db.refresh(guest)
        return guest

from datetime import datetime, timedelta
import uuid
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from app.models.live_ops import ScheduleItem, VendorCheckin, WeddingDayIssue
from app.models.wedding import Wedding
from app.models.vendor import Vendor, WeddingVendor
from app.models.proposal_contract import SigningToken
from app.models.activity import ActivityLog

class LiveOpsService:
    @staticmethod
    def get_live_ops_summary(db: Session, wedding_id: str) -> Dict[str, Any]:
        wedding = db.query(Wedding).filter(Wedding.id == wedding_id).first()
        if not wedding:
            raise ValueError("Wedding not found")

        # 1. Timeline schedule items
        schedule_items = db.query(ScheduleItem).filter(
            ScheduleItem.wedding_id == wedding_id
        ).order_by(ScheduleItem.planned_time.asc()).all()

        # 2. Vendor check-ins
        checkins = db.query(VendorCheckin).filter(
            VendorCheckin.wedding_id == wedding_id
        ).order_by(VendorCheckin.expected_time.asc()).all()

        # 3. Issues
        issues = db.query(WeddingDayIssue).filter(
            WeddingDayIssue.wedding_id == wedding_id
        ).order_by(WeddingDayIssue.reported_at.desc()).all()

        # Calculate live stats
        total_vendors_expected = len(checkins)
        vendors_arrived = sum(1 for c in checkins if c.status == "Arrived")
        vendors_late = sum(1 for c in checkins if c.status == "Late")
        open_issues = sum(1 for i in issues if i.status in ("Open", "In Progress"))
        emergency_issues = sum(1 for i in issues if i.severity == "Emergency" and i.status != "Resolved")

        # Calculate downstream at-risk timeline items (items whose vendor is Late)
        late_vendor_ids = {c.vendor_id for c in checkins if c.status == "Late"}
        at_risk_schedule = [
            item.activity_title for item in schedule_items
            if item.vendor_id in late_vendor_ids and item.status != "Completed"
        ]

        return {
            "wedding_id": wedding_id,
            "couple_title": wedding.couple_title,
            "wedding_date": wedding.wedding_date_start.isoformat(),
            "venue_name": wedding.venue_name,
            "stats": {
                "total_vendors_expected": total_vendors_expected,
                "vendors_arrived": vendors_arrived,
                "vendors_late": vendors_late,
                "open_issues": open_issues,
                "emergency_issues": emergency_issues,
                "at_risk_items_count": len(at_risk_schedule)
            },
            "at_risk_items": at_risk_schedule,
            "timeline": [
                {
                    "id": item.id,
                    "planned_time": item.planned_time,
                    "activity_title": item.activity_title,
                    "description": item.description,
                    "status": item.status,
                    "owner_name": item.owner.full_name if item.owner else "Staff Coordinator",
                    "vendor_name": item.vendor.business_name if item.vendor else None,
                    "is_at_risk": item.vendor_id in late_vendor_ids if item.vendor_id else False
                }
                for item in schedule_items
            ],
            "vendor_checkins": [
                {
                    "id": c.id,
                    "vendor_id": c.vendor_id,
                    "business_name": c.vendor.business_name if c.vendor else "Vendor",
                    "category": c.vendor.category.name if (c.vendor and c.vendor.category) else "General",
                    "contact_person": c.vendor.contact_person if c.vendor else "",
                    "phone": c.vendor.phone if c.vendor else "",
                    "expected_time": c.expected_time.isoformat(),
                    "arrived_time": c.arrived_time.isoformat() if c.arrived_time else None,
                    "status": c.status, # Expected, Arrived, Late, No Show
                    "notes": c.notes
                }
                for c in checkins
            ],
            "issues": [
                {
                    "id": i.id,
                    "title": i.title,
                    "description": i.description,
                    "severity": i.severity, # Low, Medium, High, Emergency
                    "status": i.status, # Open, In Progress, Resolved
                    "assigned_to_name": i.assigned_to.full_name if i.assigned_to else "Lead Planner",
                    "reported_at": i.reported_at.isoformat(),
                    "resolved_at": i.resolved_at.isoformat() if i.resolved_at else None,
                    "resolution_notes": i.resolution_notes
                }
                for i in issues
            ]
        }

    @staticmethod
    def update_vendor_status(
        db: Session,
        checkin_id: str,
        status: str,
        notes: Optional[str] = None
    ) -> VendorCheckin:
        checkin = db.query(VendorCheckin).filter(VendorCheckin.id == checkin_id).first()
        if not checkin:
            raise ValueError("Vendor check-in record not found")

        checkin.status = status
        if status == "Arrived":
            checkin.arrived_time = datetime.utcnow()
        if notes:
            checkin.notes = notes

        db.commit()
        db.refresh(checkin)
        return checkin

    @staticmethod
    def create_vendor_checkin_token(db: Session, checkin_id: str) -> SigningToken:
        """Create a single-purpose mobile link for a vendor to click 'I have arrived' on-site."""
        checkin = db.query(VendorCheckin).filter(VendorCheckin.id == checkin_id).first()
        if not checkin:
            raise ValueError("Checkin not found")

        token_str = str(uuid.uuid4()).replace("-", "")
        expires_at = datetime.utcnow() + timedelta(days=2)

        token = SigningToken(
            token=token_str,
            target_type="vendor_checkin",
            target_id=checkin.id,
            recipient_email=checkin.vendor.email if checkin.vendor else "vendor@royalknot.in",
            recipient_name=checkin.vendor.business_name if checkin.vendor else "Vendor",
            expires_at=expires_at
        )
        db.add(token)
        db.commit()
        db.refresh(token)
        return token

    @staticmethod
    def vendor_mobile_checkin(db: Session, token: str) -> Dict[str, Any]:
        """Vendor taps 'I have arrived' on their mobile device without logging in."""
        st = db.query(SigningToken).filter(
            SigningToken.token == token,
            SigningToken.is_revoked == False,
            SigningToken.target_type == "vendor_checkin"
        ).first()

        if not st or st.expires_at < datetime.utcnow():
            raise ValueError("Invalid or expired vendor check-in link.")

        checkin = db.query(VendorCheckin).filter(VendorCheckin.id == st.target_id).first()
        if not checkin:
            raise ValueError("Check-in record not found")

        now = datetime.utcnow()
        checkin.status = "Arrived"
        checkin.arrived_time = now
        st.used_at = now
        db.commit()

        return {
            "success": True,
            "message": f"Welcome! {checkin.vendor.business_name if checkin.vendor else 'Vendor'} arrival recorded successfully at {now.strftime('%I:%M %p')}.",
            "arrived_time": now.isoformat()
        }

    @staticmethod
    def run_minute_late_vendor_check(db: Session) -> int:
        """
        Scheduled background task (APScheduler every 60 seconds):
        If now > expected_time + 15 min grace period and status == 'Expected',
        flags status as 'Late'.
        """
        now = datetime.utcnow()
        grace_period = timedelta(minutes=15)
        cutoff_time = now - grace_period

        late_checkins = db.query(VendorCheckin).filter(
            VendorCheckin.status == "Expected",
            VendorCheckin.expected_time < cutoff_time
        ).all()

        flagged_count = 0
        for c in late_checkins:
            c.status = "Late"
            flagged_count += 1

        if flagged_count > 0:
            db.commit()

        return flagged_count

    @staticmethod
    def create_or_update_issue(
        db: Session,
        wedding_id: str,
        title: str,
        severity: str,
        description: Optional[str] = None,
        assigned_to_id: Optional[str] = None,
        issue_id: Optional[str] = None
    ) -> WeddingDayIssue:
        if issue_id:
            issue = db.query(WeddingDayIssue).filter(WeddingDayIssue.id == issue_id).first()
            if not issue:
                raise ValueError("Issue not found")
            issue.title = title
            issue.severity = severity
            if description:
                issue.description = description
            if assigned_to_id:
                issue.assigned_to_id = assigned_to_id
        else:
            issue = WeddingDayIssue(
                wedding_id=wedding_id,
                title=title,
                description=description,
                severity=severity,
                assigned_to_id=assigned_to_id,
                status="Open",
                reported_at=datetime.utcnow()
            )
            db.add(issue)

        db.commit()
        db.refresh(issue)
        return issue

    @staticmethod
    def resolve_issue(db: Session, issue_id: str, resolution_notes: str) -> WeddingDayIssue:
        issue = db.query(WeddingDayIssue).filter(WeddingDayIssue.id == issue_id).first()
        if not issue:
            raise ValueError("Issue not found")
        issue.status = "Resolved"
        issue.resolved_at = datetime.utcnow()
        issue.resolution_notes = resolution_notes
        db.commit()
        db.refresh(issue)
        return issue

    @staticmethod
    def seed_default_live_ops_if_empty(db: Session, wedding_id: str):
        """Seed sample minute-by-minute timeline and vendor check-ins for demo wedding."""
        if db.query(ScheduleItem).filter(ScheduleItem.wedding_id == wedding_id).count() == 0:
            wedding = db.query(Wedding).filter(Wedding.id == wedding_id).first()
            now = datetime.utcnow()
            w_vendors = db.query(WeddingVendor).filter(WeddingVendor.wedding_id == wedding_id).all()

            # Schedule timeline
            items = [
                ("10:00 AM", "Poolside Haldi Floral Setup Inspection", "Check floral arches and organic haldi bowls", "Completed"),
                ("02:30 PM", "Baraat Vintage Fleet & Lake Shikara Staging", "Staging Rolls Royce and 12 shikaras at jetty", "In Progress"),
                ("04:00 PM", "Royal Groom Arrival & Welcome Shehnai Fanfare", "Manganiyar royal folk welcome at main archway", "Pending"),
                ("05:15 PM", "Varmala & Garland Exchange Ceremony", "Cold pyro waterfall trigger upon garland exchange", "Pending"),
                ("06:30 PM", "Vedic Vivah Sacred Pheras around Lotus Kund", "Pheras with classical Santoor and Flute score", "Pending"),
                ("08:30 PM", "Grand Palace Banquet & Imperial Reception", "Khansama silver cloche service commences", "Pending"),
                ("11:00 PM", "Royal Fireworks Display & Afterparty", "Palace rampart pyrotechnics", "Pending")
            ]
            for pt, at, desc, st in items:
                v_id = w_vendors[0].vendor_id if w_vendors else None
                db.add(ScheduleItem(
                    wedding_id=wedding_id,
                    planned_time=pt,
                    activity_title=at,
                    description=desc,
                    vendor_id=v_id,
                    status=st
                ))

            # Vendor arrivals
            for wv in w_vendors:
                v = wv.vendor
                if v:
                    db.add(VendorCheckin(
                        wedding_id=wedding_id,
                        vendor_id=v.id,
                        expected_time=now - timedelta(minutes=45), # In the past
                        status="Expected", # Will be caught by late check!
                        notes="Expected at main service gate"
                    ))
            db.commit()

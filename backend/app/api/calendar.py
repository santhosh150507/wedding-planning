from typing import Optional, List, Dict, Any
from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.models.wedding import Wedding, WeddingEvent
from app.models.task import Task
from app.models.finance import ClientPaymentMilestone
from app.models.enquiry import Consultation
from app.api.deps import get_current_user

router = APIRouter(prefix="/calendar", tags=["Calendar & Schedules"])

@router.get("/events")
def get_calendar_events(
    month: Optional[int] = None,
    year: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    events = []

    # 1. Wedding Dates
    weddings = db.query(Wedding).all()
    for w in weddings:
        events.append({
            "id": f"wed-{w.id}",
            "title": f"💍 {w.couple_title} Wedding",
            "event_type": "Wedding",
            "start_date": w.wedding_date_start.isoformat(),
            "end_date": w.wedding_date_end.isoformat(),
            "destination": w.destination,
            "venue": w.venue_name,
            "color": "#D4AF37", # Royal Gold
            "wedding_id": w.id
        })

    # 2. Ceremonies & Functions
    wedding_events = db.query(WeddingEvent).all()
    for we in wedding_events:
        events.append({
            "id": f"fn-{we.id}",
            "title": f"🎉 {we.title} – {we.wedding.couple_title if we.wedding else ''}",
            "event_type": "Ceremony",
            "start_date": we.event_date.isoformat(),
            "start_time": we.start_time,
            "end_time": we.end_time,
            "venue": we.venue,
            "dress_code": we.dress_code,
            "color": "#1B4332", # Emerald Green
            "wedding_id": we.wedding_id
        })

    # 3. Tasks Due
    tasks = db.query(Task).filter(Task.status != "Done").all()
    for t in tasks:
        events.append({
            "id": f"tsk-{t.id}",
            "title": f"📋 Due: {t.title}",
            "event_type": "Task Deadline",
            "start_date": t.due_date.isoformat(),
            "priority": t.priority,
            "status": t.status,
            "assignee": t.assigned_to.full_name if t.assigned_to else "Unassigned",
            "color": "#C53030" if t.priority == "Urgent" else "#DD6B20",
            "wedding_id": t.wedding_id
        })

    # 4. Payment Milestones Due
    milestones = db.query(ClientPaymentMilestone).filter(ClientPaymentMilestone.status != "Paid").all()
    for m in milestones:
        events.append({
            "id": f"pay-{m.id}",
            "title": f"💰 Due: {m.milestone_name} (₹{float(m.expected_amount):,.0f})",
            "event_type": "Payment Due",
            "start_date": m.due_date.isoformat(),
            "status": m.status,
            "color": "#2B6CB0", # Navy Blue
            "wedding_id": m.wedding_id
        })

    # 5. Client Consultations
    consultations = db.query(Consultation).filter(Consultation.status != "Completed").all()
    for c in consultations:
        events.append({
            "id": f"con-{c.id}",
            "title": f"🤝 Consultation: {c.enquiry.bride_name if c.enquiry else 'Client'}",
            "event_type": "Consultation",
            "start_date": c.scheduled_at.isoformat(),
            "meeting_type": c.meeting_type,
            "color": "#6B46C1" # Purple
        })

    return events

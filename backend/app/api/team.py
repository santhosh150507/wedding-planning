from typing import Optional, List, Dict, Any
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.models.user import User, Role
from app.models.wedding import Wedding
from app.models.task import Task
from app.models.finance import TimeEntry
from app.core.security import get_password_hash
from app.api.deps import get_current_user

router = APIRouter(prefix="/team", tags=["Team & Workload Management"])

class MemberCreateRequest(BaseModel):
    email: str
    password: str = "Royal@123"
    full_name: str
    phone: str
    role_name: str # Founder / Super Admin, Administrator, Wedding Planner, Planning Staff, Finance Manager
    hourly_cost_rate: float = 2000.0

class TimeEntryCreateRequest(BaseModel):
    user_id: str
    wedding_id: str
    hours: float
    notes: Optional[str] = None
    date: Optional[str] = None

@router.get("/members")
def list_team_members(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    users = db.query(User).filter(User.is_active == True).all()
    result = []
    for u in users:
        active_weddings = db.query(Wedding).filter(
            Wedding.assigned_planner_id == u.id,
            Wedding.status.in_(["Planning", "Active", "In Progress"])
        ).count()

        pending_tasks = db.query(Task).filter(
            Task.assigned_to_id == u.id,
            Task.status.in_(["To Plan", "In Progress"])
        ).count()

        result.append({
            "id": u.id,
            "full_name": u.full_name,
            "email": u.email,
            "phone": u.phone,
            "role": u.role.name if u.role else "Staff",
            "hourly_cost_rate": float(u.hourly_cost_rate) if u.hourly_cost_rate else 2000.0,
            "active_weddings_count": active_weddings,
            "pending_tasks_count": pending_tasks
        })
    return result

@router.post("/members")
def create_team_member(
    data: MemberCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists")

    role = db.query(Role).filter(Role.name == data.role_name).first()
    if not role:
        role = db.query(Role).first()

    user = User(
        email=data.email,
        hashed_password=get_password_hash(data.password),
        full_name=data.full_name,
        phone=data.phone,
        role_id=role.id,
        hourly_cost_rate=data.hourly_cost_rate,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"id": user.id, "full_name": user.full_name, "email": user.email}

@router.get("/time-entries")
def list_time_entries(
    wedding_id: Optional[str] = None,
    user_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(TimeEntry)
    if wedding_id:
        query = query.filter(TimeEntry.wedding_id == wedding_id)
    if user_id:
        query = query.filter(TimeEntry.user_id == user_id)
    entries = query.order_by(TimeEntry.date.desc()).all()
    return [
        {
            "id": te.id,
            "wedding_id": te.wedding_id,
            "couple_title": te.wedding.couple_title if te.wedding else "",
            "user_name": te.user.full_name if te.user else "Employee",
            "hours": float(te.hours),
            "hourly_rate": float(te.hourly_rate),
            "total_cost": float(te.hours) * float(te.hourly_rate),
            "date": te.date.isoformat(),
            "notes": te.notes
        }
        for te in entries
    ]

@router.post("/time-entries")
def create_time_entry(
    data: TimeEntryCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = db.query(User).filter(User.id == data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    hourly_rate = user.hourly_cost_rate or 2000.0
    date_val = datetime.fromisoformat(data.date.replace("Z", "+00:00")) if data.date else datetime.utcnow()

    entry = TimeEntry(
        wedding_id=data.wedding_id,
        user_id=data.user_id,
        hours=data.hours,
        hourly_rate=hourly_rate,
        notes=data.notes,
        date=date_val
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return {"id": entry.id, "hours": entry.hours, "cost": float(entry.hours) * float(hourly_rate)}

from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.models.user import User
from app.models.task import TaskTemplate
from app.models.vendor import VendorCategory
from app.services.task_engine_service import TaskEngineService
from app.api.deps import get_current_user

router = APIRouter(prefix="/settings", tags=["Agency Settings & Master Data"])

class TaskTemplateCreateRequest(BaseModel):
    package_type: str = "full_service"
    title: str
    description: Optional[str] = None
    category: str = "General"
    role_assignee: str = "Wedding Planner"
    default_priority: str = "Medium"
    days_offset_from_wedding: int = -30

@router.get("")
def get_agency_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    TaskEngineService.ensure_default_templates(db)
    tpl_count = db.query(TaskTemplate).count()
    cats = db.query(VendorCategory).all()

    return {
        "agency_profile": {
            "name": "The Royal Knot Private Limited",
            "tagline": "Curators of Haute Epoque Rajasthani Palatial Weddings",
            "cities": ["Jaipur", "Udaipur", "Jodhpur"],
            "registered_address": "Rambagh Palace Gate, Bhawani Singh Road, Jaipur, Rajasthan 302005",
            "gstin": "08AAACT0099K1Z4",
            "support_email": "concierge@royalknot.in",
            "concierge_phone": "+91 141 238 5700"
        },
        "task_templates_count": tpl_count,
        "vendor_categories": [{"id": c.id, "name": c.name, "code": c.code} for c in cats],
        "milestone_presets": [
            {"name": "Booking Deposit", "percentage": 25.0, "description": "Due within 7 days of signing contract"},
            {"name": "Advance Payment", "percentage": 50.0, "description": "Due 30 days prior to first event"},
            {"name": "Final Settlement", "percentage": 25.0, "description": "Due within 7 days post-event reconciliation"}
        ]
    }

@router.get("/task-templates")
def list_task_templates(
    package_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    TaskEngineService.ensure_default_templates(db)
    query = db.query(TaskTemplate)
    if package_type and package_type != "All":
        query = query.filter(TaskTemplate.package_type == package_type)
    templates = query.order_by(TaskTemplate.days_offset_from_wedding.asc()).all()
    return [
        {
            "id": t.id,
            "package_type": t.package_type,
            "title": t.title,
            "category": t.category,
            "role_assignee": t.role_assignee,
            "default_priority": t.default_priority,
            "days_offset_from_wedding": t.days_offset_from_wedding
        }
        for t in templates
    ]

@router.post("/task-templates")
def create_task_template(
    data: TaskTemplateCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tpl = TaskTemplate(
        package_type=data.package_type,
        title=data.title,
        description=data.description,
        category=data.category,
        role_assignee=data.role_assignee,
        default_priority=data.default_priority,
        days_offset_from_wedding=data.days_offset_from_wedding
    )
    db.add(tpl)
    db.commit()
    db.refresh(tpl)
    return {"id": tpl.id, "title": tpl.title}

from datetime import datetime, timedelta
import uuid
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.models.task import TaskTemplate, Task
from app.models.wedding import Wedding
from app.models.user import User
from app.models.finance import ClientPaymentMilestone
from app.models.activity import ActivityLog

DEFAULT_FULL_SERVICE_TEMPLATES = [
    {"title": "Finalize & execute palace venue contract", "days_offset": -180, "priority": "Urgent", "role": "Wedding Planner", "category": "Venue"},
    {"title": "Draft master wedding budget architecture", "days_offset": -170, "priority": "High", "role": "Finance Manager", "category": "Finance"},
    {"title": "Finalize royal wedding theme & spatial design", "days_offset": -150, "priority": "High", "role": "Wedding Planner", "category": "Design"},
    {"title": "Issue RFQ for palace floral scenography & mandap", "days_offset": -140, "priority": "High", "role": "Wedding Planner", "category": "Decor"},
    {"title": "Issue RFQ for royal khansama & banquet catering", "days_offset": -135, "priority": "Urgent", "role": "Wedding Planner", "category": "Catering"},
    {"title": "Compare caterer quotations & select winning caterer", "days_offset": -120, "priority": "Urgent", "role": "Wedding Planner", "category": "Catering"},
    {"title": "Confirm photography & cinematography director", "days_offset": -115, "priority": "Medium", "role": "Wedding Planner", "category": "Media"},
    {"title": "Contract celebrity DJ & royal folk artists", "days_offset": -105, "priority": "Medium", "role": "Wedding Planner", "category": "Entertainment"},
    {"title": "Design bespoke royal wedding invitation suite", "days_offset": -100, "priority": "Medium", "role": "Planning Staff", "category": "Stationary"},
    {"title": "Compile preliminary guest list (400+ guests)", "days_offset": -90, "priority": "High", "role": "Planning Staff", "category": "Guests"},
    {"title": "Send formal luxury invitations & RSVP dispatch", "days_offset": -75, "priority": "High", "role": "Planning Staff", "category": "Guests"},
    {"title": "Book chartered vehicle fleet & airport transfers", "days_offset": -60, "priority": "High", "role": "Planning Staff", "category": "Logistics"},
    {"title": "Reserve lake boats & vintage cars for Baraat", "days_offset": -50, "priority": "Medium", "role": "Planning Staff", "category": "Logistics"},
    {"title": "Audit advance client payment milestone (50%)", "days_offset": -35, "priority": "Urgent", "role": "Finance Manager", "category": "Finance"},
    {"title": "Conduct on-site food tasting & menu lock", "days_offset": -30, "priority": "High", "role": "Wedding Planner", "category": "Catering"},
    {"title": "Lock minute-by-minute day-of schedule", "days_offset": -20, "priority": "Urgent", "role": "Wedding Planner", "category": "Schedule"},
    {"title": "Verify all vendor contracts, riders & insurance", "days_offset": -15, "priority": "High", "role": "Finance Manager", "category": "Vendors"},
    {"title": "Confirm guest RSVP counts & dietary preferences", "days_offset": -14, "priority": "High", "role": "Planning Staff", "category": "Guests"},
    {"title": "Finalize guest seating & royal dining floor plan", "days_offset": -10, "priority": "Medium", "role": "Wedding Planner", "category": "FloorPlan"},
    {"title": "Conduct technical dry run: audio, lighting, power", "days_offset": -7, "priority": "High", "role": "Planning Staff", "category": "Production"},
    {"title": "Brief on-site shadow staff & assign radios", "days_offset": -3, "priority": "High", "role": "Wedding Planner", "category": "Operations"},
    {"title": "Prepare wedding-day emergency kit & protocol", "days_offset": -2, "priority": "Urgent", "role": "Planning Staff", "category": "Operations"},
    {"title": "Execute wedding-day live operations & arrival check-in", "days_offset": 0, "priority": "Urgent", "role": "Planning Staff", "category": "LiveOps"},
    {"title": "Audit vendor overtime & extra plate charges", "days_offset": 2, "priority": "High", "role": "Finance Manager", "category": "Finance"},
    {"title": "Reconcile vendor bills & generate settlement checklist", "days_offset": 5, "priority": "High", "role": "Finance Manager", "category": "Finance"},
    {"title": "Issue final client invoice & calculate net profit", "days_offset": 10, "priority": "Urgent", "role": "Finance Manager", "category": "Profitability"}
]

DEFAULT_DAY_OF_TEMPLATES = [
    {"title": "Audit existing vendor contracts & riders", "days_offset": -60, "priority": "High", "role": "Wedding Planner", "category": "Vendors"},
    {"title": "Review client floor plan & palace approvals", "days_offset": -45, "priority": "Medium", "role": "Wedding Planner", "category": "FloorPlan"},
    {"title": "Build minute-by-minute live timeline", "days_offset": -30, "priority": "Urgent", "role": "Wedding Planner", "category": "Schedule"},
    {"title": "Confirm vendor arrival windows & mobile check-in links", "days_offset": -14, "priority": "High", "role": "Planning Staff", "category": "Vendors"},
    {"title": "On-site rehearsal with bridal party", "days_offset": -2, "priority": "High", "role": "Wedding Planner", "category": "Operations"},
    {"title": "Manage day-of live timeline & late vendor alerts", "days_offset": 0, "priority": "Urgent", "role": "Planning Staff", "category": "LiveOps"},
    {"title": "Day-of vendor settlement & checklist sign-off", "days_offset": 3, "priority": "High", "role": "Finance Manager", "category": "Finance"}
]

class TaskEngineService:
    @staticmethod
    def ensure_default_templates(db: Session):
        """Seed template tasks if not already populated."""
        if db.query(TaskTemplate).count() == 0:
            for item in DEFAULT_FULL_SERVICE_TEMPLATES:
                db.add(TaskTemplate(
                    package_type="full_service",
                    title=item["title"],
                    days_offset_from_wedding=item["days_offset"],
                    default_priority=item["priority"],
                    role_assignee=item["role"],
                    category=item["category"]
                ))
            for item in DEFAULT_DAY_OF_TEMPLATES:
                db.add(TaskTemplate(
                    package_type="partial_day_of",
                    title=item["title"],
                    days_offset_from_wedding=item["days_offset"],
                    default_priority=item["priority"],
                    role_assignee=item["role"],
                    category=item["category"]
                ))
            db.commit()

    @staticmethod
    def generate_instant_plan(db: Session, wedding_id: str, user_id: str) -> List[Task]:
        """
        INSTANT PLAN ENGINE (Idempotent):
        1. Clones all template tasks relative to wedding date.
        2. Assigns owners by role.
        3. Generates payment milestones (Booking, Advance, Final).
        4. Running twice NEVER duplicates tasks (unique key wedding_id + template_task_id).
        """
        TaskEngineService.ensure_default_templates(db)
        wedding = db.query(Wedding).filter(Wedding.id == wedding_id).first()
        if not wedding:
            raise ValueError("Wedding not found")

        # Fetch templates for package
        pkg = "partial_day_of" if wedding.package_type == "partial_day_of" else "full_service"
        templates = db.query(TaskTemplate).filter(TaskTemplate.package_type == pkg).all()

        # Cache employees by role
        users = db.query(User).filter(User.is_active == True).all()
        role_user_map: Dict[str, str] = {}
        for u in users:
            if u.role:
                role_user_map[u.role.name] = u.id

        cloned_tasks = []
        for tpl in templates:
            # Check idempotency: does task already exist for this wedding & template?
            existing_task = db.query(Task).filter(
                Task.wedding_id == wedding_id,
                Task.template_task_id == tpl.id
            ).first()

            if not existing_task:
                # Calculate relative due date
                due_date = wedding.wedding_date_start + timedelta(days=tpl.days_offset_from_wedding)
                
                # Assign to appropriate team member by role
                assigned_user_id = role_user_map.get(tpl.role_assignee, wedding.assigned_planner_id or user_id)

                task = Task(
                    wedding_id=wedding.id,
                    template_task_id=tpl.id,
                    title=tpl.title,
                    description=f"Standard protocol deliverable for {tpl.category}.",
                    status="To Plan",
                    priority=tpl.default_priority,
                    assigned_to_id=assigned_user_id,
                    due_date=due_date
                )
                db.add(task)
                cloned_tasks.append(task)

        # Generate Staged Payment Milestones if not existing
        if db.query(ClientPaymentMilestone).filter(ClientPaymentMilestone.wedding_id == wedding_id).count() == 0:
            total_b = float(wedding.agreed_budget)
            m1 = ClientPaymentMilestone(
                wedding_id=wedding.id,
                milestone_name="Booking Deposit (25%)",
                percentage=25.0,
                expected_amount=total_b * 0.25,
                due_date=datetime.utcnow() + timedelta(days=7),
                status="Pending"
            )
            m2 = ClientPaymentMilestone(
                wedding_id=wedding.id,
                milestone_name="Advance Payment (50%)",
                percentage=50.0,
                expected_amount=total_b * 0.50,
                due_date=wedding.wedding_date_start - timedelta(days=30),
                status="Pending"
            )
            m3 = ClientPaymentMilestone(
                wedding_id=wedding.id,
                milestone_name="Final Settlement (25%)",
                percentage=25.0,
                expected_amount=total_b * 0.25,
                due_date=wedding.wedding_date_end + timedelta(days=7),
                status="Pending"
            )
            db.add_all([m1, m2, m3])

        db.commit()

        # Audit
        log = ActivityLog(
            user_id=user_id,
            wedding_id=wedding_id,
            action="INSTANT_PLAN_GENERATED",
            details={"package": pkg, "new_tasks_created": len(cloned_tasks)}
        )
        db.add(log)
        db.commit()

        return db.query(Task).filter(Task.wedding_id == wedding_id).all()

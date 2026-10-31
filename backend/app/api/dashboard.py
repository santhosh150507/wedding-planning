from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.schemas.dashboard import DashboardOverviewResponse
from app.services.dashboard_service import DashboardService
from app.api.deps import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard Overview"])

@router.get("/overview", response_model=DashboardOverviewResponse)
def get_dashboard_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve comprehensive agency overview, revenue/expense stats and reminders."""
    return DashboardService.get_overview(db)

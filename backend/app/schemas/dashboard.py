from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class MetricCard(BaseModel):
    title: str
    value: Any
    change_percentage: Optional[float] = None
    trend: Optional[str] = "neutral" # up, down, neutral
    prefix: Optional[str] = ""
    suffix: Optional[str] = ""

class RevenueMonthlyChartItem(BaseModel):
    month: str
    revenue: float
    expenses: float
    profit: float

class StatusDistributionItem(BaseModel):
    name: str
    count: int
    color: str

class ProfitabilityByWeddingItem(BaseModel):
    wedding_title: str
    revenue: float
    expenses: float
    profit: float
    margin: float

class DashboardOverviewResponse(BaseModel):
    # Top KPI counts
    total_weddings: int
    active_weddings: int
    upcoming_weddings: int
    completed_weddings: int
    new_enquiries: int
    confirmed_bookings: int
    
    # Financial totals in INR
    total_revenue: float
    total_expenses: float
    overall_profit: float
    profit_margin_percentage: float
    pending_client_payments: float
    pending_vendor_payments: float
    
    # Operational indicators
    upcoming_deadlines: int
    overdue_tasks: int
    flagged_inactive_enquiries: int
    
    # Charts
    monthly_financials: List[RevenueMonthlyChartItem]
    wedding_status_distribution: List[StatusDistributionItem]
    profitability_by_wedding: List[ProfitabilityByWeddingItem]
    
    # Activity and alerts
    recent_activities: List[Dict[str, Any]]
    follow_up_reminders: List[Dict[str, Any]]

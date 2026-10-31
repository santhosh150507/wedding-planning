from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, EmailStr, Field

class EnquiryPublicCreate(BaseModel):
    bride_name: str = Field(..., min_length=2, max_length=100)
    groom_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=8, max_length=25)
    
    preferred_date: datetime
    alternative_date: Optional[datetime] = None
    destination: str = Field(default="Jaipur", min_length=2, max_length=100)
    venue_preference: Optional[str] = None
    
    guest_count: int = Field(default=400, ge=10, le=5000)
    function_count: int = Field(default=4, ge=1, le=15)
    functions_requested: List[str] = Field(default=["Mehendi", "Haldi", "Sangeet", "Wedding", "Reception"])
    theme_preference: Optional[str] = None
    
    budget_max: float = Field(..., ge=500000) # Minimum 5 Lakhs INR for luxury wedding
    package_type: str = Field(default="full_service") # full_service or partial_day_of
    
    catering_preferences: Optional[str] = None
    decor_preferences: Optional[str] = None
    additional_notes: Optional[str] = None

class EnquiryInternalCreate(EnquiryPublicCreate):
    source: str = Field(default="Call") # Call, WhatsApp, Instagram, Referral, Website
    assigned_planner_id: Optional[str] = None
    status: str = Field(default="New")

class EnquiryUpdate(BaseModel):
    bride_name: Optional[str] = None
    groom_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    preferred_date: Optional[datetime] = None
    alternative_date: Optional[datetime] = None
    destination: Optional[str] = None
    venue_preference: Optional[str] = None
    guest_count: Optional[int] = None
    function_count: Optional[int] = None
    functions_requested: Optional[List[str]] = None
    theme_preference: Optional[str] = None
    budget_max: Optional[float] = None
    package_type: Optional[str] = None
    catering_preferences: Optional[str] = None
    decor_preferences: Optional[str] = None
    additional_notes: Optional[str] = None
    source: Optional[str] = None
    status: Optional[str] = None
    assigned_planner_id: Optional[str] = None
    follow_up_date: Optional[datetime] = None

class EnquiryNoteCreate(BaseModel):
    content: str = Field(..., min_length=1)

class EnquiryNoteResponse(BaseModel):
    id: str
    enquiry_id: str
    author_id: str
    author_name: Optional[str] = None
    content: str
    created_at: datetime

    class Config:
        from_attributes = True

class ConsultationCreate(BaseModel):
    scheduled_at: datetime
    meeting_type: str = "Video Call"
    notes: Optional[str] = None

class ConsultationResponse(BaseModel):
    id: str
    enquiry_id: str
    scheduled_at: datetime
    meeting_type: str
    status: str
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class EnquiryResponse(BaseModel):
    id: str
    enquiry_number: str
    bride_name: str
    groom_name: str
    email: str
    phone: str
    preferred_date: datetime
    alternative_date: Optional[datetime] = None
    destination: str
    venue_preference: Optional[str] = None
    guest_count: int
    function_count: int
    functions_requested: List[str]
    theme_preference: Optional[str] = None
    budget_max: float
    package_type: str
    catering_preferences: Optional[str] = None
    decor_preferences: Optional[str] = None
    additional_notes: Optional[str] = None
    source: str
    status: str
    assigned_planner_id: Optional[str] = None
    assigned_planner_name: Optional[str] = None
    last_activity_at: datetime
    follow_up_date: Optional[datetime] = None
    is_inactive_3_days: bool = False
    notes_count: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class EnquiryPublicConfirmation(BaseModel):
    enquiry_number: str
    message: str
    submitted_at: datetime

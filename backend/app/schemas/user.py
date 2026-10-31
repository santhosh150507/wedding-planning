from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr

class RoleBase(BaseModel):
    name: str
    description: Optional[str] = None
    permissions: List[str] = []

class RoleResponse(RoleBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None
    role_id: str
    hourly_cost_rate: float = 0.0

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    phone: Optional[str] = None
    role: RoleResponse
    hourly_cost_rate: float
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

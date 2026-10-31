from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, create_access_token
from app.models.user import User, Role
from app.schemas.user import UserLogin, TokenResponse, UserResponse, RoleResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication & Roles"])

@router.post("/login", response_model=TokenResponse)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Account is disabled")

    access_token = create_access_token(subject=user.id)
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.get("/me", response_model=UserResponse)
def read_current_user(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)

@router.get("/roles", response_model=List[RoleResponse])
def get_roles(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    roles = db.query(Role).all()
    return [RoleResponse.model_validate(r) for r in roles]

@router.get("/planners", response_model=List[UserResponse])
def get_planners(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    users = db.query(User).filter(User.is_active == True).all()
    return [UserResponse.model_validate(u) for u in users]

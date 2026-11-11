import sys
from pathlib import Path
from typing import Dict, Any, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.config import ACCESS_TOKEN_EXPIRE_MINUTES
from db.session import get_db
from models.database import User, Mentee, Mentor
from models.schemas import (
    UserRegisterRequest,
    UserLoginRequest,
    UserProfileUpdateRequest,
    TokenResponse,
    UserResponse,
)
from services.auth_service import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    require_roles,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


def _extract_user_profile(user: User) -> Optional[Dict[str, Any]]:
    """Helper to return role-specific profile dictionary."""
    if user.role == "mentee" and user.mentee_profile:
        return user.mentee_profile.to_dict()
    elif user.role == "mentor" and user.mentor_profile:
        return user.mentor_profile.to_dict()
    return None


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new platform user (Mentee, Mentor, or Administrator)",
)
def register(payload: UserRegisterRequest, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == payload.email.lower().strip()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"An account with email '{payload.email}' already exists.",
        )

    if payload.role == "mentee":
        if not payload.career_stage or not payload.career_interest:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Mentees must provide both 'career_stage' and 'career_interest'.",
            )
    elif payload.role == "mentor":
        if payload.experience_years is None or not payload.industry or not payload.expertise:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Mentors must provide 'experience_years', 'industry', and 'expertise'.",
            )

    password_hash = hash_password(payload.password)
    user = User(
        name=payload.name.strip(),
        email=payload.email.lower().strip(),
        password_hash=password_hash,
        role=payload.role,
    )
    db.add(user)
    db.flush()

    profile_data = None
    if payload.role == "mentee":
        mentee = Mentee(
            user_id=user.user_id,
            university=payload.university or "Strathmore University",
            career_stage=payload.career_stage,
            career_interest=payload.career_interest,
        )
        db.add(mentee)
        db.flush()
        profile_data = mentee.to_dict()
    elif payload.role == "mentor":
        mentor = Mentor(
            user_id=user.user_id,
            experience_years=payload.experience_years,
            industry=payload.industry,
            expertise=payload.expertise,
            is_verified=True,
        )
        db.add(mentor)
        db.flush()
        profile_data = mentor.to_dict()

    db.commit()
    db.refresh(user)

    token_claims = {
        "sub": str(user.user_id),
        "email": user.email,
        "name": user.name,
        "role": user.role,
    }
    access_token = create_access_token(token_claims)

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse(
            user_id=user.user_id,
            name=user.name,
            email=user.email,
            role=user.role,
            created_at=user.created_at.isoformat() if user.created_at else None,
            profile=profile_data,
        ),
    )


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Authenticate with email and password",
)
def login(payload: UserLoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower().strip()).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token_claims = {
        "sub": str(user.user_id),
        "email": user.email,
        "name": user.name,
        "role": user.role,
    }
    access_token = create_access_token(token_claims)
    profile_data = _extract_user_profile(user)

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse(
            user_id=user.user_id,
            name=user.name,
            email=user.email,
            role=user.role,
            created_at=user.created_at.isoformat() if user.created_at else None,
            profile=profile_data,
        ),
    )


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current authenticated user identity and profile",
)
def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse(
        user_id=current_user.user_id,
        name=current_user.name,
        email=current_user.email,
        role=current_user.role,
        created_at=current_user.created_at.isoformat() if current_user.created_at else None,
        profile=_extract_user_profile(current_user),
    )


@router.get(
    "/profile",
    response_model=UserResponse,
    summary="Get current user profile details",
)
def get_profile(current_user: User = Depends(get_current_user)):
    return get_me(current_user)


@router.put(
    "/profile",
    response_model=UserResponse,
    summary="Update current user profile details (Mentee or Mentor)",
)
def update_profile(
    payload: UserProfileUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user = db.query(User).filter(User.user_id == current_user.user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    if payload.name:
        user.name = payload.name.strip()

    if user.role == "mentee" and user.mentee_profile:
        if payload.university:
            user.mentee_profile.university = payload.university.strip()
        if payload.career_stage:
            user.mentee_profile.career_stage = payload.career_stage
        if payload.career_interest:
            user.mentee_profile.career_interest = payload.career_interest.strip()
    elif user.role == "mentor" and user.mentor_profile:
        if payload.experience_years is not None:
            user.mentor_profile.experience_years = float(payload.experience_years)
        if payload.industry:
            user.mentor_profile.industry = payload.industry.strip()
        if payload.expertise:
            user.mentor_profile.expertise = payload.expertise.strip()

    db.commit()
    db.refresh(user)

    return UserResponse(
        user_id=user.user_id,
        name=user.name,
        email=user.email,
        role=user.role,
        created_at=user.created_at.isoformat() if user.created_at else None,
        profile=_extract_user_profile(user),
    )


@router.get("/mentee-only", summary="RBAC test endpoint: Mentee access only")
def mentee_only_route(current_user: User = Depends(require_roles("mentee"))):
    return {
        "status": "success",
        "message": f"Welcome Mentee {current_user.name}. Access granted.",
        "role": current_user.role,
    }


@router.get("/mentor-only", summary="RBAC test endpoint: Mentor access only")
def mentor_only_route(current_user: User = Depends(require_roles("mentor"))):
    return {
        "status": "success",
        "message": f"Welcome Mentor {current_user.name}. Access granted.",
        "role": current_user.role,
    }


@router.get("/admin-only", summary="RBAC test endpoint: Administrator access only")
def admin_only_route(current_user: User = Depends(require_roles("administrator"))):
    return {
        "status": "success",
        "message": f"Welcome Administrator {current_user.name}. Access granted.",
        "role": current_user.role,
    }

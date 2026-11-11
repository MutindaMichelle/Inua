"""
INUA Mentorship Platform: Mentee Goal Progression Endpoints
Author: Michelle (Final Year Project - BICS Year 4, Strathmore University)
"""

import sys
from pathlib import Path
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from db.session import get_db
from models.database import User, Mentee, Goal
from models.schemas import GoalCreateRequest, GoalUpdateRequest, GoalResponse
from services.auth_service import get_current_user

router = APIRouter(prefix="/goals", tags=["Goal Progression"])


@router.get("", response_model=List[GoalResponse], summary="List developmental goals for current mentee")
def list_goals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == "mentee":
        mentee = db.query(Mentee).filter(Mentee.user_id == current_user.user_id).first()
        if not mentee:
            return []
        goals = db.query(Goal).filter(Goal.mentee_id == mentee.mentee_id).order_by(Goal.created_at.desc()).all()
    else:
        goals = db.query(Goal).order_by(Goal.created_at.desc()).all()

    return [GoalResponse(**g.to_dict()) for g in goals]


@router.post(
    "",
    response_model=GoalResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new developmental goal milestone",
)
def create_goal(
    payload: GoalCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    mentee = db.query(Mentee).filter(Mentee.user_id == current_user.user_id).first()
    if not mentee:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only mentees with an active profile can create developmental goals.",
        )

    goal = Goal(
        mentee_id=mentee.mentee_id,
        goal_title=payload.goal_title.strip(),
        progress_percentage=max(0, min(100, payload.progress_percentage)),
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return GoalResponse(**goal.to_dict())


@router.patch(
    "/{goal_id}",
    response_model=GoalResponse,
    summary="Update goal progress percentage or title",
)
def update_goal(
    goal_id: int,
    payload: GoalUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    goal = db.query(Goal).filter(Goal.goal_id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Goal #{goal_id} not found.")

    if current_user.role == "mentee":
        mentee = db.query(Mentee).filter(Mentee.user_id == current_user.user_id).first()
        if not mentee or goal.mentee_id != mentee.mentee_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this goal.")

    if payload.goal_title is not None:
        goal.goal_title = payload.goal_title.strip()
    if payload.progress_percentage is not None:
        goal.progress_percentage = max(0, min(100, int(payload.progress_percentage)))

    db.commit()
    db.refresh(goal)
    return GoalResponse(**goal.to_dict())


@router.delete(
    "/{goal_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a developmental goal",
)
def delete_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    goal = db.query(Goal).filter(Goal.goal_id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Goal #{goal_id} not found.")

    if current_user.role == "mentee":
        mentee = db.query(Mentee).filter(Mentee.user_id == current_user.user_id).first()
        if not mentee or goal.mentee_id != mentee.mentee_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this goal.")

    db.delete(goal)
    db.commit()
    return None

"""
INUA Mentorship Platform: Prediction Endpoints (FR-05, FR-06, IR-02)
Author: Michelle (Final Year Project - BICS Year 4, Strathmore University)
Requirements: FR-05 (Session Outcome Prediction), FR-06 (Explanation Generation), IR-02 (ML Integration)
"""

import sys
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from db.session import get_db
from models.database import User, PredictionRecord, MentorshipSession, Mentee, Mentor
from models.schemas import (
    PredictionCreateRequest,
    PredictionDetailResponse,
    StoredPredictionResponse,
)
from services.auth_service import get_current_user
from services.prediction_service import (
    predict_and_store_session,
    get_prediction_for_session,
    get_prediction_by_id,
)
from services.ml_service import MLService

router = APIRouter(tags=["Predictions"])


@router.post(
    "/predictions",
    response_model=PredictionDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Generate and persist mentorship session prediction (FR-05, FR-06)",
)
def create_prediction(
    payload: PredictionCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Connects the ML prediction pipeline to the API.

    - If `session_id` is supplied: extracts session dyad data, computes effectiveness,
      generates TreeSHAP local explanations, and stores the record in PostgreSQL.
    - If `session_features` is supplied without `session_id`: executes direct model inference.
    - Validates feature ranges and handles model execution errors safely.
    """
    model_name = payload.model_name or "XGBoost"

    if payload.session_id is not None:
        # Evaluate against existing session in DB and persist result
        result = predict_and_store_session(
            db=db,
            session_id=payload.session_id,
            model_name=model_name,
            custom_features=payload.session_features,
        )
        return PredictionDetailResponse(**result)

    elif payload.session_features is not None:
        # Ad-hoc evaluation without database persistence
        ml_service = MLService()
        try:
            pred_res = ml_service.predict_single(payload.session_features, model_name=model_name)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Model inference failed: {str(e)}",
            )

        return PredictionDetailResponse(
            prediction=pred_res.prediction,
            status=pred_res.status,
            effectiveness_probability=pred_res.effectiveness_probability,
            model_used=pred_res.model_used,
            recommendation=pred_res.recommendation,
            risk_factors=pred_res.risk_factors,
            feature_contributions=pred_res.feature_contributions,
        )

    else:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Must provide either 'session_id' or 'session_features' in request payload.",
        )


@router.get(
    "/predictions",
    response_model=List[StoredPredictionResponse],
    summary="List stored predictions accessible to current user",
)
def list_predictions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns stored prediction records based on user role:
    - Mentee: sees predictions for own sessions.
    - Mentor: sees predictions for own assigned sessions.
    - Administrator: sees all platform predictions.
    """
    query = db.query(PredictionRecord).join(MentorshipSession)

    if current_user.role == "mentee":
        mentee = db.query(Mentee).filter(Mentee.user_id == current_user.user_id).first()
        if not mentee:
            return []
        query = query.filter(MentorshipSession.mentee_id == mentee.mentee_id)

    elif current_user.role == "mentor":
        mentor = db.query(Mentor).filter(Mentor.user_id == current_user.user_id).first()
        if not mentor:
            return []
        query = query.filter(MentorshipSession.mentor_id == mentor.mentor_id)

    records = query.order_by(PredictionRecord.predicted_at.desc()).all()
    return [
        StoredPredictionResponse(
            prediction_id=r.prediction_id,
            session_id=r.session_id,
            effectiveness_label=r.effectiveness_label,
            probability=r.probability,
            model_version=r.model_version,
            predicted_at=r.predicted_at.isoformat() if r.predicted_at else None,
        )
        for r in records
    ]


@router.get(
    "/predictions/{prediction_id}",
    response_model=StoredPredictionResponse,
    summary="Get stored prediction record by ID",
)
def get_prediction(
    prediction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieves a specific prediction record with role access control."""
    record = get_prediction_by_id(db, prediction_id, current_user)
    return StoredPredictionResponse(
        prediction_id=record.prediction_id,
        session_id=record.session_id,
        effectiveness_label=record.effectiveness_label,
        probability=record.probability,
        model_version=record.model_version,
        predicted_at=record.predicted_at.isoformat() if record.predicted_at else None,
    )


@router.get(
    "/sessions/{session_id}/prediction",
    response_model=StoredPredictionResponse,
    summary="Get stored prediction for a specific session",
)
def get_session_prediction(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieves the prediction evaluation linked to a specific session."""
    record = get_prediction_for_session(db, session_id, current_user)
    return StoredPredictionResponse(
        prediction_id=record.prediction_id,
        session_id=record.session_id,
        effectiveness_label=record.effectiveness_label,
        probability=record.probability,
        model_version=record.model_version,
        predicted_at=record.predicted_at.isoformat() if record.predicted_at else None,
    )

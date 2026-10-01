"""
INUA Platform: Mentorship Prediction Endpoints
Author: Michelle (Final Year Project - BICS Year 4, Strathmore University)
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List

from models.schemas import (
    SessionPredictionRequest,
    SessionPredictionResponse,
    BatchPredictionRequest,
    BatchPredictionResponse,
)
from services.ml_service import MLService

router = APIRouter(prefix="/predict", tags=["Mentorship Effectiveness Prediction"])


def get_ml_service():
    return MLService()


@router.post("", response_model=SessionPredictionResponse)
def predict_mentorship_effectiveness(
    request: SessionPredictionRequest,
    ml_service: MLService = Depends(get_ml_service),
):
    """
    Evaluates a single mentorship interaction and returns ground-truth prediction (0/1),
    confidence score, qualitative diagnosis, and actionable intervention recommendations.
    """
    try:
        return ml_service.predict_single(request, model_name=request.model_name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/batch", response_model=BatchPredictionResponse)
def batch_predict_mentorship_effectiveness(
    request: BatchPredictionRequest,
    ml_service: MLService = Depends(get_ml_service),
):
    """
    Evaluates multiple mentorship sessions in a single API call.
    """
    try:
        return ml_service.predict_batch(request.sessions, model_name=request.model_name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/models")
def list_available_models(ml_service: MLService = Depends(get_ml_service)):
    """
    Lists all pre-warmed ensemble classifiers ready for inference.
    """
    return {
        "available_models": ml_service.get_loaded_models(),
        "default_model": "XGBoost",
        "description": "Select from Random Forest, AdaBoost, or XGBoost for custom benchmark comparison.",
    }

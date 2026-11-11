"""
INUA Platform: Machine Learning Inference Service (Pre-Session U-CS 5 Pipeline)
Author: Michelle (Final Year Project - BICS Year 4, Strathmore University)
"""

import os
import sys
from pathlib import Path
from typing import List, Dict, Any

from app.config import MODELS_DIR, DEFAULT_MODEL, ML_DIR
from models.schemas import MentorshipSessionInput, SessionPredictionResponse, BatchPredictionResponse

if str(ML_DIR) not in sys.path:
    sys.path.insert(0, str(ML_DIR))

from predict import MentorshipEffectivenessPredictor


class MLService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MLService, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        """Loads preprocessor and serialized models into memory once at startup."""
        self.predictor = MentorshipEffectivenessPredictor(models_dir=str(MODELS_DIR), default_model=DEFAULT_MODEL)
        self.models = {}
        for name, fname in self.predictor.model_files.items():
            path = os.path.join(MODELS_DIR, fname)
            if os.path.exists(path):
                self.models[name] = self.predictor._get_model(name)
        print(f"[MLService] Pre-warmed pre-session ML models: {list(self.models.keys())}")

    def get_loaded_models(self) -> List[str]:
        """Returns the 3 core ensemble models expected by the API catalog."""
        core = [m for m in ["XGBoost", "Random Forest", "AdaBoost"] if m in self.models]
        return core if core else list(self.models.keys())

    def _detect_risk_factors(self, data: Dict[str, Any]) -> List[str]:
        """Identifies pre-session and dyadic friction points."""
        risks = []
        if data.get("hasAgenda") is False or data.get("hasAgenda") == 0:
            risks.append("No pre-session agenda submitted; session lacks structured objectives.")
        if data.get("leadTimeHours") is not None and int(data.get("leadTimeHours", 48)) < 24:
            risks.append("Short booking lead time (<24h); limited mentor preparation window.")
        if data.get("isFirstSession") is True and data.get("mentor_availability") == "Low":
            risks.append("Initial dyad meeting paired with low mentor availability band.")
        if data.get("attendance_status") == "Cancelled":
            risks.append("Session was cancelled; immediate outreach and re-engagement required.")
        if data.get("attendance_status") == "Rescheduled":
            risks.append("Scheduling disruption detected; follow-up momentum may be compromised.")
        if data.get("communication_quality", 5) <= 2:
            risks.append("Low communication reciprocity reported.")
        if data.get("mentor_responsiveness_score", 5) <= 2:
            risks.append("High mentor latency detected.")
        if data.get("career_support_score", 5) <= 2:
            risks.append("Sub-par instrumental coaching.")
        if data.get("goal_progress_score", 5) <= 2:
            risks.append("Stagnant milestone progress.")
        if data.get("confidence_growth_score", 5) <= 2:
            risks.append("Low self-efficacy impact.")
        return risks

    def _generate_recommendation(self, prediction: int, risks: List[str], default_rec: str) -> str:
        """Constructs actionable guidance based on pre-session prediction and risk diagnosis."""
        if prediction == 1:
            if not risks:
                return (
                    "Session is well-prepared with high predicted developmental synergy. "
                    "Recommend confirming milestone checklist and scheduling follow-up within 3 to 4 weeks."
                )
            return (
                "Session predicted effective overall, though minor pre-session friction noted. "
                "Recommend reviewing the agenda points ahead of start time."
            )
        else:
            if any("agenda" in r.lower() for r in risks):
                return (
                    "High risk of low session value due to missing agenda or short lead time. "
                    "Prompt mentee to submit a 3-point agenda before the session begins."
                )
            return default_rec or (
                "Session exhibits structural pre-session friction and is classified as ineffective. "
                "Prompt agenda submission or consider dyad re-matching."
            )

    def predict_single(
        self, session_input: MentorshipSessionInput, model_name: str = None
    ) -> SessionPredictionResponse:
        """Processes a single session input using strictly pre-session features (X)."""
        model_name = model_name or DEFAULT_MODEL
        data_dict = (
            session_input.model_dump()
            if hasattr(session_input, "model_dump")
            else (session_input.dict() if hasattr(session_input, "dict") else dict(session_input))
        )

        res = self.predictor.predict_session(data_dict, model_name=model_name)
        risks = self._detect_risk_factors(data_dict)
        rec = self._generate_recommendation(res["prediction"], risks, res["recommendation"])

        return SessionPredictionResponse(
            prediction=res["prediction"],
            status=res["status"],
            effectiveness_probability=res["effectiveness_probability"],
            model_used=res["model_used"],
            recommendation=rec,
            risk_factors=risks,
            feature_contributions=res["feature_contributions"],
            isSynthetic=True,
        )

    def predict_batch(
        self, sessions: List[MentorshipSessionInput], model_name: str = None
    ) -> BatchPredictionResponse:
        """Batch evaluation of multiple sessions."""
        results = [self.predict_single(s, model_name=model_name) for s in sessions]
        eff_count = sum(1 for r in results if r.prediction == 1)
        return BatchPredictionResponse(
            total_evaluated=len(results),
            effective_count=eff_count,
            ineffective_count=len(results) - eff_count,
            results=results,
        )

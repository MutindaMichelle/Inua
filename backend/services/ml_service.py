"""
INUA Platform: Machine Learning Inference Service
Author: Michelle (Final Year Project - BICS Year 4, Strathmore University)
"""

import os
import joblib
import pandas as pd
import numpy as np
from typing import List, Dict, Any

from app.config import MODELS_DIR, DEFAULT_MODEL, AVAILABLE_MODELS
from models.schemas import MentorshipSessionInput, SessionPredictionResponse, BatchPredictionResponse


class MLService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MLService, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        """Loads preprocessor and serialized models into memory once at startup."""
        self.preprocessor_path = os.path.join(MODELS_DIR, "preprocessor.pkl")
        self.metadata_path = os.path.join(MODELS_DIR, "feature_metadata.pkl")

        if not os.path.exists(self.preprocessor_path):
            raise FileNotFoundError(f"Missing preprocessor at {self.preprocessor_path}. Train models first.")

        print("[MLService] Loading preprocessor and feature schema...")
        self.preprocessor = joblib.load(self.preprocessor_path)
        self.metadata = joblib.load(self.metadata_path)

        self.model_files = {
            "Random Forest": "random_forest.pkl",
            "AdaBoost": "adaboost.pkl",
            "XGBoost": "xgboost_model.pkl",
        }

        self.models = {}
        for name, fname in self.model_files.items():
            path = os.path.join(MODELS_DIR, fname)
            if os.path.exists(path):
                print(f"[MLService] Loading {name} from {path}...")
                self.models[name] = joblib.load(path)
            else:
                print(f"[MLService] Warning: {name} model binary not found at {path}")

        print(f"[MLService] Successfully pre-warmed models: {list(self.models.keys())}")

    def get_loaded_models(self) -> List[str]:
        return list(self.models.keys())

    def _detect_risk_factors(self, data: Dict[str, Any]) -> List[str]:
        """Identifies clinical and pedagogical friction points in the mentorship dyad."""
        risks = []
        if data.get("attendance_status") == "Cancelled":
            risks.append("Session was cancelled; immediate outreach and re-engagement required.")
        if data.get("attendance_status") == "Rescheduled":
            risks.append("Scheduling disruption detected; follow-up momentum may be compromised.")
        if data.get("communication_quality", 5) <= 2:
            risks.append("Low communication reciprocity; mentee reported poor conversational flow.")
        if data.get("mentor_responsiveness_score", 5) <= 2:
            risks.append("High mentor latency; unresponsive before or after interaction.")
        if data.get("career_support_score", 5) <= 2:
            risks.append("Sub-par instrumental coaching; actionable career guidance was deficient.")
        if data.get("goal_progress_score", 5) <= 2:
            risks.append("Stagnant milestone progress; stated developmental objective was not advanced.")
        if data.get("confidence_growth_score", 5) <= 2:
            risks.append("Low self-efficacy impact; mentee did not report confidence growth.")
        return risks

    def _generate_recommendation(self, prediction: int, risks: List[str]) -> str:
        """Constructs actionable guidance based on prediction and risk diagnosis."""
        if prediction == 1:
            if not risks:
                return (
                    "Exemplary mentorship interaction. High developmental synergy observed. "
                    "Recommend scheduling next milestone check-in within 3 to 4 weeks."
                )
            return (
                "Session deemed effective overall, but minor communication friction noted. "
                "Recommend mentor reviews action items to sustain mentee momentum."
            )
        else:
            if "Session was cancelled" in " ".join(risks):
                return "Session cancelled. Trigger automated re-engagement prompt and open reschedule slots."
            return (
                "Session exhibited high developmental friction and is classified as ineffective. "
                "Academic counseling debrief or dyad re-matching recommended prior to next session."
            )

    def predict_single(
        self, session_input: MentorshipSessionInput, model_name: str = None
    ) -> SessionPredictionResponse:
        """Processes a single session input and returns structured diagnostic prediction."""
        model_name = model_name or DEFAULT_MODEL
        if model_name not in self.models:
            raise ValueError(f"Model '{model_name}' not available. Choose from: {list(self.models.keys())}")

        model = self.models[model_name]
        data_dict = session_input.model_dump() if hasattr(session_input, "model_dump") else session_input.dict()

        # Create 1-row DataFrame
        df_input = pd.DataFrame([data_dict])
        
        # Transform features through preprocessor
        X_trans = self.preprocessor.transform(df_input)

        # Infer
        pred_label = int(model.predict(X_trans)[0])
        pred_prob = float(model.predict_proba(X_trans)[0, 1])

        risks = self._detect_risk_factors(data_dict)
        rec = self._generate_recommendation(pred_label, risks)
        status_str = "Effective" if pred_label == 1 else "Ineffective / Needs Intervention"

        # Local feature attribution via TreeSHAP (NFR-05)
        feature_explanations = []
        if "XGBoost" in self.models:
            import xgboost as xgb
            feature_names = self.metadata["transformed_feature_names"]
            dmatrix = xgb.DMatrix(X_trans, feature_names=feature_names)
            contribs = self.models["XGBoost"].get_booster().predict(dmatrix, pred_contribs=True)[0][:-1]
            ranked_idx = np.argsort(np.abs(contribs))[::-1][:5]
            for idx in ranked_idx:
                c_val = float(contribs[idx])
                name = feature_names[idx]
                feature_explanations.append({
                    "feature": name,
                    "contribution": round(c_val, 4),
                    "effect": "increases_effectiveness" if c_val > 0 else "decreases_effectiveness",
                })

        return SessionPredictionResponse(
            prediction=pred_label,
            status=status_str,
            effectiveness_probability=round(pred_prob, 4),
            model_used=model_name,
            recommendation=rec,
            risk_factors=risks,
            feature_contributions=feature_explanations,
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

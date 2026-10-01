"""
INUA Mentorship Platform: Real-Time Inference & Feature Attribution Module
Author: Michelle (Final Year Project - BICS Year 4, Strathmore University)
Sprint: Sprint 3 · Production Inference & Per-Prediction Explanations (NFR-05)

Provides:
- Real-time classification using Random Forest, AdaBoost, or XGBoost.
- Local per-prediction feature attribution via XGBoost `pred_contribs` (TreeSHAP).
- Graceful dropping of redundant `mentor_experience_level_encoded` attribute.
"""

import os
import joblib
import pandas as pd
import numpy as np
import xgboost as xgb
from typing import Dict, Any, List, Tuple


class MentorshipEffectivenessPredictor:
    def __init__(self, models_dir: str = None, default_model: str = "XGBoost"):
        if models_dir is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            models_dir = os.path.join(base_dir, "saved_models")

        self.models_dir = models_dir
        self.default_model_name = default_model

        # Load preprocessor & metadata
        preproc_path = os.path.join(models_dir, "preprocessor.pkl")
        meta_path = os.path.join(models_dir, "feature_metadata.pkl")

        if not os.path.exists(preproc_path):
            raise FileNotFoundError(f"Preprocessor not found at: {preproc_path}. Run train_models.py first.")

        self.preprocessor = joblib.load(preproc_path)
        self.metadata = joblib.load(meta_path)
        self.feature_names = self.metadata["transformed_feature_names"]

        # Model file mapping
        self.model_files = {
            "Random Forest": "random_forest.pkl",
            "AdaBoost": "adaboost.pkl",
            "XGBoost": "xgboost_model.pkl",
        }
        self.loaded_models = {}

    def _get_model(self, model_name: str):
        if model_name not in self.model_files:
            raise ValueError(f"Unknown model '{model_name}'. Choose from: {list(self.model_files.keys())}")
        if model_name not in self.loaded_models:
            model_path = os.path.join(self.models_dir, self.model_files[model_name])
            self.loaded_models[model_name] = joblib.load(model_path)
        return self.loaded_models[model_name]

    def _clean_input_record(self, session_data: dict) -> dict:
        """Removes dropped or redundant attributes like mentor_experience_level_encoded."""
        cleaned = dict(session_data)
        # Drop per NFR-05 (duplicates mentor_experience_years and has zero importance)
        cleaned.pop("mentor_experience_level_encoded", None)
        cleaned.pop("session_id", None)
        cleaned.pop("effectiveness_index", None)
        return cleaned

    def explain_prediction(self, X_transformed: np.ndarray, top_k: int = 5) -> Tuple[List[Dict[str, Any]], float]:
        """
        Computes local per-prediction TreeSHAP contributions using XGBoost's `pred_contribs`.
        Returns the top features driving THIS specific prediction and the model bias term.
        """
        xgb_model = self._get_model("XGBoost")
        booster = xgb_model.get_booster()

        dmatrix = xgb.DMatrix(X_transformed, feature_names=self.feature_names)
        # Output shape: (1, n_features + 1), where last column is the base margin bias
        contribs = booster.predict(dmatrix, pred_contribs=True)[0]

        bias_term = float(contribs[-1])
        feat_contribs = contribs[:-1]

        # Rank features by absolute contribution magnitude
        ranked_indices = np.argsort(np.abs(feat_contribs))[::-1]

        top_explanations = []
        for idx in ranked_indices[:top_k]:
            c_val = float(feat_contribs[idx])
            name = self.feature_names[idx]
            effect = "increases_effectiveness" if c_val > 0 else "decreases_effectiveness"

            top_explanations.append({
                "feature": name,
                "contribution": round(c_val, 4),
                "effect": effect,
                "description": f"{name} contributed {c_val:+.2f} log-odds towards {effect.replace('_', ' ')}",
            })

        return top_explanations, round(bias_term, 4)

    def predict_session(self, session_data: dict, model_name: str = None, top_k_explanations: int = 5) -> dict:
        """
        Takes a raw single session dictionary and returns:
        - Prediction label (0 or 1)
        - Probability confidence
        - Model used
        - Local per-prediction feature contributions (NFR-05)
        - Tailored pedagogical recommendations
        """
        model_name = model_name or self.default_model_name
        model = self._get_model(model_name)

        # Clean input record
        cleaned_data = self._clean_input_record(session_data)
        df_input = pd.DataFrame([cleaned_data])

        # Preprocess features
        X_trans = self.preprocessor.transform(df_input)

        # Predict
        pred_label = int(model.predict(X_trans)[0])
        pred_prob = float(model.predict_proba(X_trans)[0, 1])

        status = "Effective" if pred_label == 1 else "Ineffective / Needs Intervention"

        # Local feature attribution (NFR-05)
        feature_explanations, bias = self.explain_prediction(X_trans, top_k=top_k_explanations)

        # Context-aware recommendation
        if pred_label == 1:
            rec = "Session demonstrates high developmental efficacy. Recommend scheduling next milestone check-in within 3 to 4 weeks."
        else:
            top_neg = [f["feature"] for f in feature_explanations if f["effect"] == "decreases_effectiveness"]
            if top_neg:
                rec = f"Session exhibited developmental friction primarily driven by: {', '.join(top_neg[:2])}. Academic counseling debrief or dyad re-matching recommended."
            else:
                rec = "Session exhibited structural or communication friction. Re-match or post-session debrief advised."

        return {
            "model_used": model_name,
            "prediction": pred_label,
            "status": status,
            "effectiveness_probability": round(pred_prob, 4),
            "recommendation": rec,
            "feature_contributions": feature_explanations,
            "base_margin_bias": bias,
        }


def sample_prediction_test():
    """Runs verification showing strong and weak sessions produce different top driving features."""
    predictor = MentorshipEffectivenessPredictor()

    strong_session = {
        "career_stage": "Year4",
        "field_of_study": "Computer Science",
        "career_interest": "Software Engineering",
        "prior_sessions": 3,
        "mentor_experience_years": 8,
        "mentor_experience_level_encoded": 2,  # Should be dropped gracefully
        "mentor_industry": "Technology",
        "mentor_specialization": "Backend Engineering",
        "mentor_availability": "High",
        "session_type": "Interview Preparation",
        "session_duration_minutes": 65,
        "attendance_status": "Attended",
        "meeting_platform": "Teams",
        "goal_category": "Internship",
        "career_support_score": 4,
        "psychosocial_support_score": 4,
        "communication_quality": 5,
        "goal_progress_score": 4,
        "confidence_growth_score": 4,
        "mentor_responsiveness_score": 5,
    }

    weak_session = {
        "career_stage": "Year2",
        "field_of_study": "Business",
        "career_interest": "Finance",
        "prior_sessions": 0,
        "mentor_experience_years": 2,
        "mentor_experience_level_encoded": 1,  # Should be dropped gracefully
        "mentor_industry": "Banking & Finance",
        "mentor_specialization": "Risk Management",
        "mentor_availability": "Low",
        "session_type": "Career Guidance",
        "session_duration_minutes": 25,
        "attendance_status": "Rescheduled",
        "meeting_platform": "Meet",
        "goal_category": "Career Transition",
        "career_support_score": 2,
        "psychosocial_support_score": 2,
        "communication_quality": 2,
        "goal_progress_score": 1,
        "confidence_growth_score": 2,
        "mentor_responsiveness_score": 1,
    }

    print("=" * 60)
    print("NFR-05 VERIFICATION: PER-PREDICTION FEATURE CONTRIBUTIONS")
    print("=" * 60)

    res_strong = predictor.predict_session(strong_session, model_name="XGBoost")
    print("\n--- STRONG SESSION PREDICTION ---")
    print(f"Status: {res_strong['status']} ({res_strong['effectiveness_probability']:.1%})")
    print("Top Local Driving Features:")
    for f in res_strong["feature_contributions"]:
        print(f"  [+] {f['feature']:<30s} -> {f['contribution']:+.4f} ({f['effect']})")

    res_weak = predictor.predict_session(weak_session, model_name="XGBoost")
    print("\n--- WEAK SESSION PREDICTION ---")
    print(f"Status: {res_weak['status']} ({res_weak['effectiveness_probability']:.1%})")
    print("Top Local Driving Features:")
    for f in res_weak["feature_contributions"]:
        print(f"  [-] {f['feature']:<30s} -> {f['contribution']:+.4f} ({f['effect']})")

    # Verify they produce different contributions
    strong_top = res_strong["feature_contributions"][0]
    weak_top = res_weak["feature_contributions"][0]
    assert strong_top["contribution"] > 0, "Strong session top feature must be positive"
    assert weak_top["contribution"] < 0, "Weak session top feature must be negative"
    print("\n[VERIFICATION PASSED] Strong and weak sessions generated distinct driving contributions!")


if __name__ == "__main__":
    sample_prediction_test()

"""
predict.py

Implements the Prediction API contract defined in Chapter 4, IR-02:
  "The Prediction API shall accept a structured feature payload (session
   and feedback variables) and return an effectiveness label, a confidence
   score, and a model version identifier."

This is the core prediction FUNCTION a real REST endpoint would call --
it is not itself a running server. Wiring this into an actual REST route
(FastAPI/Flask) is Sprint 3/4 work (system development), not modelling.

Usage:
    from predict import predict_session_effectiveness
    result = predict_session_effectiveness({
        "mentor_experience_years": 4.5,
        "duration_minutes": 45,
        "interaction_frequency_per_month": 6,
        "goal_progress_pct": 72.0,
        "communication_score": 4,
        "overall_rating": 4,
        "mentor_experience_level": "Mid",
    })
"""

import json
import os
import joblib
import pandas as pd

from preprocessing import FEATURE_COLUMNS, EXPERIENCE_LEVELS

_model = None
_encoder = None
_scaler = None
_metadata = None

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")


def _load_artifacts():
    """Lazy-load the trained model and preprocessing artifacts once per process."""
    global _model, _encoder, _scaler, _metadata
    if _model is None:
        _model = joblib.load(os.path.join(MODELS_DIR, "model.joblib"))
        _encoder = joblib.load(os.path.join(MODELS_DIR, "encoder.joblib"))
        _scaler = joblib.load(os.path.join(MODELS_DIR, "scaler.joblib"))
        with open(os.path.join(MODELS_DIR, "model_metadata.json")) as f:
            _metadata = json.load(f)
    return _model, _encoder, _scaler, _metadata


def predict_session_effectiveness(payload: dict) -> dict:
    """
    Accepts a structured feature payload for ONE session (IR-02) and returns:
      {
        "effectiveness_label": "Effective" | "Ineffective",
        "confidence_score": float,      # probability of the predicted class
        "model_version": str,
        "top_features": [(name, importance), ...]   # for NFR-05 explainability
      }

    Raises ValueError with a clear message if the payload is missing a
    required field or contains an invalid mentor_experience_level -- this
    is what IR-03's "invalid response" handling on the caller's side reacts to.
    """
    model, encoder, scaler, metadata = _load_artifacts()

    required = [
        "mentor_experience_years", "duration_minutes",
        "interaction_frequency_per_month", "goal_progress_pct",
        "communication_score", "overall_rating", "mentor_experience_level",
    ]
    missing = [f for f in required if f not in payload]
    if missing:
        raise ValueError(f"Missing required field(s): {missing}")
    if payload["mentor_experience_level"] not in EXPERIENCE_LEVELS:
        raise ValueError(
            f"mentor_experience_level must be one of {EXPERIENCE_LEVELS}, "
            f"got {payload['mentor_experience_level']!r}"
        )

    row = pd.DataFrame([payload])
    row["mentor_experience_level_encoded"] = encoder.transform(row[["mentor_experience_level"]])
    X = row[FEATURE_COLUMNS]
    X_scaled = pd.DataFrame(scaler.transform(X), columns=FEATURE_COLUMNS)

    pred_class = int(model.predict(X_scaled)[0])
    proba = model.predict_proba(X_scaled)[0]
    confidence = float(proba[pred_class])

    top_features = sorted(
        metadata["feature_importances"].items(), key=lambda t: -t[1]
    )[:3]

    return {
        "effectiveness_label": "Effective" if pred_class == 1 else "Ineffective",
        "confidence_score": round(confidence, 4),
        "model_version": metadata["model_version"],
        "top_features": top_features,
    }


if __name__ == "__main__":
    # Smoke test: one strong session, one weak session (Step 7 of the roadmap)
    strong_session = {
        "mentor_experience_years": 8.0,
        "duration_minutes": 50,
        "interaction_frequency_per_month": 7,
        "goal_progress_pct": 85.0,
        "communication_score": 5,
        "overall_rating": 5,
        "mentor_experience_level": "Senior",
    }
    weak_session = {
        "mentor_experience_years": 1.0,
        "duration_minutes": 20,
        "interaction_frequency_per_month": 1,
        "goal_progress_pct": 15.0,
        "communication_score": 2,
        "overall_rating": 2,
        "mentor_experience_level": "Junior",
    }

    for label, session in [("Strong session", strong_session), ("Weak session", weak_session)]:
        result = predict_session_effectiveness(session)
        print(f"\n{label}:")
        print(f"  Predicted: {result['effectiveness_label']} (confidence {result['confidence_score']:.1%})")
        print(f"  Model version: {result['model_version']}")
        print(f"  Top contributing features: {result['top_features']}")

    # Error-handling demonstration (IR-03)
    print("\nError-handling check (missing field):")
    try:
        predict_session_effectiveness({"mentor_experience_years": 3})
    except ValueError as e:
        print(f"  Correctly raised ValueError: {e}")

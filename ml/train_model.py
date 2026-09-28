"""
train_model.py

Trains the XGBoost classifier (Section 3.5.4) and benchmarks it against
Random Forest and AdaBoost baselines (Section 3.2.4), then saves the best
model artifact for use by predict.py.

Run:  python train_model.py
"""

import json
import os
import joblib
import numpy as np
from datetime import datetime, timezone
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier, AdaBoostClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report,
)
from xgboost import XGBClassifier

from preprocessing import load_training_data, FEATURE_COLUMNS

RANDOM_STATE = 42
MODEL_VERSION = "xgb-v1.0.0"  # bumped whenever the model is retrained on new data (DR-06)
MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")


def evaluate(name, model, X_test, y_test):
    preds = model.predict(X_test)
    metrics = {
        "accuracy": accuracy_score(y_test, preds),
        "precision": precision_score(y_test, preds),
        "recall": recall_score(y_test, preds),
        "f1": f1_score(y_test, preds),
    }
    print(f"\n--- {name} ---")
    for k, v in metrics.items():
        print(f"{k.capitalize():10s}: {v:.3f}")
    print("Confusion matrix [rows=actual, cols=predicted] (Ineffective, Effective):")
    print(confusion_matrix(y_test, preds))
    return metrics


def main():
    X, y, encoder, scaler = load_training_data()
    print(f"Loaded {len(X)} sessions | {y.sum()} Effective / {len(y) - y.sum()} Ineffective")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=RANDOM_STATE, stratify=y
    )

    results = {}

    rf = RandomForestClassifier(n_estimators=150, max_depth=4, random_state=RANDOM_STATE)
    rf.fit(X_train, y_train)
    results["Random Forest"] = evaluate("Random Forest (baseline)", rf, X_test, y_test)

    ada = AdaBoostClassifier(n_estimators=100, random_state=RANDOM_STATE)
    ada.fit(X_train, y_train)
    results["AdaBoost"] = evaluate("AdaBoost (baseline)", ada, X_test, y_test)

    xgb = XGBClassifier(
        n_estimators=150, max_depth=3, learning_rate=0.08,
        eval_metric="logloss", random_state=RANDOM_STATE,
    )
    xgb.fit(X_train, y_train)
    results["XGBoost"] = evaluate("XGBoost (proposed model)", xgb, X_test, y_test)

    # --- Robustness: k-fold cross-validation (k tuned to dataset size, Section 3.2.4) ---
    n_folds = 5
    cv_scores = cross_val_score(xgb, X, y, cv=n_folds, scoring="accuracy")
    print(f"\n{n_folds}-fold cross-validation accuracy: {cv_scores.round(3)} (mean {cv_scores.mean():.3f})")

    print("\nFull classification report for XGBoost:")
    print(classification_report(y_test, xgb.predict(X_test), target_names=["Ineffective", "Effective"]))

    print("Feature importances (XGBoost) -- this is what NFR-05 surfaces to the user:")
    importances = sorted(zip(FEATURE_COLUMNS, xgb.feature_importances_), key=lambda t: -t[1])
    for col, imp in importances:
        print(f"  {col:35s} {imp:.3f}")

    # --- Persist the winning model + preprocessing artifacts + metadata (DR-06, IR-02) ---
    os.makedirs(MODELS_DIR, exist_ok=True)
    joblib.dump(xgb, os.path.join(MODELS_DIR, "model.joblib"))
    joblib.dump(encoder, os.path.join(MODELS_DIR, "encoder.joblib"))
    joblib.dump(scaler, os.path.join(MODELS_DIR, "scaler.joblib"))

    metadata = {
        "model_version": MODEL_VERSION,
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "algorithm": "XGBoost (XGBClassifier)",
        "feature_columns": FEATURE_COLUMNS,
        "n_training_rows": int(len(X_train)),
        "n_test_rows": int(len(X_test)),
        "test_metrics": {k: round(v, 4) for k, v in results["XGBoost"].items()},
        "cv_accuracy_mean": round(float(cv_scores.mean()), 4),
        "cv_folds": n_folds,
        "baseline_comparison": {
            name: {k: round(v, 4) for k, v in m.items()} for name, m in results.items()
        },
        "feature_importances": {col: round(float(imp), 4) for col, imp in importances},
    }
    with open(os.path.join(MODELS_DIR, "model_metadata.json"), "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"\nSaved model.joblib, encoder.joblib, scaler.joblib, model_metadata.json to {MODELS_DIR}/")
    print(f"Model version: {MODEL_VERSION}")


if __name__ == "__main__":
    main()

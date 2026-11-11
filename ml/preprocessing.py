"""
INUA Mentorship Platform: Pre-Session Feature Preprocessing Pipeline (U-CS 5)
Author: Michelle (Final Year Project - BICS Year 4, Strathmore University)
Deliverable: Preprocessed chronological training (80%) and test (20%) partitions & serialized preprocessor

Prevents Target & Post-Session Leakage (U-CS 5 Mandate):
- All post-session feedback and execution variables (`career_support_score`,
  `psychosocial_support_score`, `communication_quality`, `goal_progress_score`,
  `confidence_growth_score`, `mentor_responsiveness_score`, `attendance_status`,
  `session_duration_minutes`, `effectiveness_index`) are strictly excluded from X.
- Only pre-session features known BEFORE the session happens (`leadTimeHours`,
  `hasAgenda`, `isFirstSession`, `mentor_experience_years`, `prior_sessions`, and
  dyad profile context) are included in X.
- Dataset is split chronologically on `created_at` (earliest 80% train, most recent 20% test).
"""

import os
import joblib
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer


POST_SESSION_LEAKAGE_COLS = [
    "session_id",
    "created_at",
    "effectiveness_index",
    "mentor_experience_level_encoded",
    "career_support_score",
    "psychosocial_support_score",
    "communication_quality",
    "goal_progress_score",
    "confidence_growth_score",
    "mentor_responsiveness_score",
    "attendance_status",
    "session_duration_minutes",
]

PRE_SESSION_NUMERICAL_COLS = [
    "leadTimeHours",
    "hasAgenda",
    "isFirstSession",
    "mentor_experience_years",
    "prior_sessions",
]

PRE_SESSION_CATEGORICAL_COLS = [
    "career_stage",
    "field_of_study",
    "career_interest",
    "mentor_industry",
    "mentor_specialization",
    "mentor_availability",
    "session_type",
    "meeting_platform",
    "goal_category",
]


def build_preprocessor(categorical_cols: list, numerical_cols: list) -> ColumnTransformer:
    """Creates a ColumnTransformer pipeline handling pre-session categorical and numerical features."""
    return ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), numerical_cols),
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical_cols),
        ],
        remainder="drop",
    )


def run_preprocessing(
    csv_path: str = None,
    output_dir: str = None,
    models_dir: str = None,
    test_size: float = 0.20,
    random_state: int = 42,
):
    """
    Executes pre-session feature selection, performs a chronological 80/20 train-test split
    sorted by `created_at`, fits the preprocessor strictly on the training partition,
    and serializes all artifacts.
    """
    cur_dir = os.path.dirname(os.path.abspath(__file__))
    base_dir = os.path.dirname(cur_dir) if os.path.basename(cur_dir) == "scripts" else cur_dir
    if csv_path is None:
        csv_path = os.path.join(base_dir, "data", "inua_mentorship_dataset.csv")
    if output_dir is None:
        output_dir = os.path.join(base_dir, "data")
    if models_dir is None:
        models_dir = os.path.join(base_dir, "saved_models")

    os.makedirs(output_dir, exist_ok=True)
    os.makedirs(models_dir, exist_ok=True)

    print("=" * 65)
    print("INUA U-CS 5: PRE-SESSION FEATURE PREPROCESSING & TIME SPLIT")
    print("=" * 65)

    df = pd.read_csv(csv_path)
    print(f"[PREPROCESS] Synthetic dataset loaded: {df.shape[0]} rows, {df.shape[1]} columns")

    # Sort chronologically by created_at (Time-Series Split Rule)
    if "created_at" in df.columns:
        df = df.sort_values("created_at", ascending=True).reset_index(drop=True)
        print(f"[PREPROCESS] Sorted chronologically by created_at: {df['created_at'].iloc[0]} -> {df['created_at'].iloc[-1]}")

    target_col = "session_effectiveness"
    categorical_cols = list(PRE_SESSION_CATEGORICAL_COLS)
    numerical_cols = list(PRE_SESSION_NUMERICAL_COLS)
    feature_cols = numerical_cols + categorical_cols

    print(f"[PREPROCESS] Pre-session numerical features ({len(numerical_cols)}): {numerical_cols}")
    print(f"[PREPROCESS] Pre-session categorical features ({len(categorical_cols)}): {categorical_cols}")
    print(f"[PREPROCESS] Excluded post-session / leakage columns: {POST_SESSION_LEAKAGE_COLS}")

    X = df[feature_cols].copy()
    y = df[target_col].copy()

    # Chronological 80/20 split (earliest 80% train, most recent 20% held-out test)
    split_idx = int(len(df) * (1.0 - test_size))
    X_train = X.iloc[:split_idx].reset_index(drop=True)
    X_test = X.iloc[split_idx:].reset_index(drop=True)
    y_train = y.iloc[:split_idx].reset_index(drop=True)
    y_test = y.iloc[split_idx:].reset_index(drop=True)

    print(f"[PREPROCESS] Chronological Train split (earliest {1-test_size:.0%}): {len(X_train)} samples")
    print(f"[PREPROCESS] Chronological Test split  (latest   {test_size:.0%}): {len(X_test)} samples")

    # Fit preprocessor strictly on chronological training partition
    preprocessor = build_preprocessor(categorical_cols, numerical_cols)
    preprocessor.fit(X_train)

    X_train_trans = preprocessor.transform(X_train)
    X_test_trans = preprocessor.transform(X_test)

    encoded_cat_names = preprocessor.named_transformers_["cat"].get_feature_names_out(categorical_cols)
    transformed_feature_names = numerical_cols + list(encoded_cat_names)
    print(f"[PREPROCESS] Transformed pre-session feature space dimensionality: {len(transformed_feature_names)} features")

    train_processed_df = pd.DataFrame(X_train_trans, columns=transformed_feature_names)
    train_processed_df["session_effectiveness"] = y_train.values

    test_processed_df = pd.DataFrame(X_test_trans, columns=transformed_feature_names)
    test_processed_df["session_effectiveness"] = y_test.values

    full_processed_df = pd.concat([train_processed_df, test_processed_df], axis=0).reset_index(drop=True)
    processed_csv_path = os.path.join(output_dir, "processed_dataset.csv")
    full_processed_df.to_csv(processed_csv_path, index=False)
    print(f"[PREPROCESS] Saved processed dataset -> {processed_csv_path}")

    preprocessor_path = os.path.join(models_dir, "preprocessor.pkl")
    joblib.dump(preprocessor, preprocessor_path)
    print(f"[PREPROCESS] Serialized preprocessor pipeline -> {preprocessor_path}")

    meta = {
        "categorical_cols": categorical_cols,
        "numerical_cols": numerical_cols,
        "transformed_feature_names": transformed_feature_names,
        "leakage_cols_removed": POST_SESSION_LEAKAGE_COLS,
        "split_method": "chronological_created_at_80_20",
        "X_test_raw": X_test.to_dict(orient="list"),
    }
    meta_path = os.path.join(models_dir, "feature_metadata.pkl")
    joblib.dump(meta, meta_path)
    print(f"[PREPROCESS] Saved feature metadata -> {meta_path}")

    return X_train_trans, X_test_trans, y_train.values, y_test.values, transformed_feature_names


if __name__ == "__main__":
    run_preprocessing()

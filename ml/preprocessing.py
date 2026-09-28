"""
preprocessing.py

Reusable preprocessing pipeline (Section 3.2.2; data requirements DR-01
through DR-06 in Chapter 4). Kept as importable functions, not a script,
so the exact same pipeline can be reused by train_model.py and predict.py --
this matters because a model can only score a real, incoming session
correctly if it is preprocessed identically to how the training data was
preprocessed (same imputation values, same scaler, same encoding).
"""

import os
import pandas as pd
from sklearn.preprocessing import StandardScaler, OrdinalEncoder

FEATURE_COLUMNS = [
    "mentor_experience_years",
    "duration_minutes",
    "interaction_frequency_per_month",
    "goal_progress_pct",
    "communication_score",
    "overall_rating",
    "mentor_experience_level_encoded",
]
# NOTE: career_support_score and psychosocial_score are deliberately EXCLUDED
# from the model's feature set. Both are derived directly from the granular
# variables above (see generate_dataset.py) and were used to construct the
# effectiveness label itself, so including them would let the model shortcut
# around learning from real behavioural data rather than genuinely modelling
# it -- undermining the point of a multi-variable classifier. They remain in
# the stored dataset and the logical schema (Figure 4.3) purely as
# schema-level / dashboard-explainability fields (NFR-05), not as predictors.

EXPERIENCE_LEVELS = ["Junior", "Mid", "Senior"]


def clean_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """De-duplicate and impute -- DR-04 (documented imputation), and the
    duplicate-record handling described in Section 3.2.2."""
    df = df.drop_duplicates(subset="session_id").reset_index(drop=True)

    if df["overall_rating"].isna().any():
        median_rating = df["overall_rating"].median()
        df["overall_rating"] = df["overall_rating"].fillna(median_rating)

    return df


def encode_and_scale(df: pd.DataFrame, encoder: OrdinalEncoder = None, scaler: StandardScaler = None):
    """Encode the categorical experience level and scale numeric features.
    Pass a fitted encoder/scaler (from training) to transform new data
    consistently at prediction time; leave both None to fit fresh (training)."""
    df = df.copy()

    fit_mode = encoder is None
    if fit_mode:
        encoder = OrdinalEncoder(categories=[EXPERIENCE_LEVELS])
        df["mentor_experience_level_encoded"] = encoder.fit_transform(df[["mentor_experience_level"]])
    else:
        df["mentor_experience_level_encoded"] = encoder.transform(df[["mentor_experience_level"]])

    X = df[FEATURE_COLUMNS].copy()

    if scaler is None:
        scaler = StandardScaler()
        X_scaled = pd.DataFrame(scaler.fit_transform(X), columns=FEATURE_COLUMNS, index=X.index)
    else:
        X_scaled = pd.DataFrame(scaler.transform(X), columns=FEATURE_COLUMNS, index=X.index)

    return X_scaled, encoder, scaler


def load_training_data(path: str = None):
    """Full pipeline for training: load -> clean -> encode/scale -> features + label."""
    if path is None:
        path = os.path.join(os.path.dirname(__file__), "data", "mentorship_sessions_sample.csv")
    df = pd.read_csv(path)
    df = clean_dataframe(df)

    X, encoder, scaler = encode_and_scale(df)
    y = (df["session_effectiveness"] == "Effective").astype(int)

    return X, y, encoder, scaler

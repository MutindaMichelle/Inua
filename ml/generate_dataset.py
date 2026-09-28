"""
generate_dataset.py

Builds a structured, literature-informed SIMULATED mentorship dataset,
aligned to the logical database schema finalised in Chapter 4 (Figure 4.3)
of the project report:
  "Supporting Career Mentorship Outcomes Among University Students and
   Early-Career Professionals in Kenya: An XGBoost-Based System for
   Predicting Session Effectiveness"

WHY SIMULATED DATA:
No public dataset captures session-level mentorship data with an
effectiveness label (confirmed by search across Kaggle, Zenodo, Hugging
Face, and academic mentorship-research repositories -- Section 3.2.1).
Building a rule-based simulated dataset lets the modelling pipeline be
validated end-to-end; validating predictive power against real-world data
is explicitly future work (Section 1.5.2).

SCHEMA ALIGNMENT (Chapter 4, Figure 4.3 -- Logical Database Schema):
  sessions:    mentor_id, mentee_id, session_date, duration_minutes,
               career_support_score, psychosocial_score, status
  feedback:    session_id, communication_score, goal_progress, overall_rating
  predictions: session_id, effectiveness_label, probability, model_version

career_support_score and psychosocial_score are not raw inputs -- they are
themselves derived from lower-level session/feedback variables, mirroring
the two-domain structure of established mentoring-measurement instruments
(Noe, 1988; Scandura & Ragins, 1993; Ragins & McFarlin, 1990; Berk et al.,
2005 -- see Section 3.2.1 for the full grounding). This script generates
both the lower-level variables (so preprocessing has real, interpretable
inputs) and the two schema-aligned composite scores.

Missingness and light noise are injected deliberately so preprocessing
(Section 3.2.2) has real work to do, rather than operating on an
artificially perfect dataset.
"""

import numpy as np
import pandas as pd

RNG_SEED = 42
N_SESSIONS = 400

rng = np.random.default_rng(RNG_SEED)


def generate_raw_dataset(n: int = N_SESSIONS) -> pd.DataFrame:
    mentor_ids = rng.integers(1, 51, size=n)   # 50 distinct mentors
    mentee_ids = rng.integers(1, 221, size=n)  # 220 distinct mentees
    session_ids = np.arange(1, n + 1)

    # ---- lower-level session variables (feed the CAREER sub-score) ----
    mentor_experience_years = np.clip(rng.gamma(shape=2.2, scale=2.5, size=n), 0.5, 20).round(1)
    duration_minutes = rng.integers(20, 91, size=n)
    interaction_frequency_per_month = rng.integers(1, 9, size=n)
    goal_progress_pct = np.clip(
        rng.normal(
            loc=30 + 4.5 * interaction_frequency_per_month + 0.25 * duration_minutes,
            scale=12, size=n,
        ), 0, 100,
    ).round(1)

    # ---- lower-level feedback variables (feed the PSYCHOSOCIAL sub-score) ----
    communication_score = np.clip(
        rng.normal(loc=2.7 + 0.08 * mentor_experience_years, scale=0.8, size=n), 1, 5
    ).round(0)
    overall_rating = np.clip(
        rng.normal(loc=2.5 + 0.35 * communication_score, scale=0.7, size=n), 1, 5
    ).round(0)

    # ---- schema-aligned composite scores (sessions table) ----
    # CAREER support: goal achievement, session frequency, mentor experience
    career_support_score = np.clip(
        0.55 * (goal_progress_pct / 100)
        + 0.25 * (interaction_frequency_per_month / 8)
        + 0.20 * (mentor_experience_years / 20),
        0, 1,
    ).round(3)

    # PSYCHOSOCIAL support: communication quality + overall feedback rating
    psychosocial_score = np.clip(
        0.55 * (communication_score / 5) + 0.45 * (overall_rating / 5), 0, 1
    ).round(3)

    status = np.full(n, "completed")

    sessions = pd.DataFrame({
        "session_id": session_ids,
        "mentor_id": mentor_ids,
        "mentee_id": mentee_ids,
        "duration_minutes": duration_minutes,
        "interaction_frequency_per_month": interaction_frequency_per_month,
        "mentor_experience_years": mentor_experience_years,
        "goal_progress_pct": goal_progress_pct,
        "career_support_score": career_support_score,
        "psychosocial_score": psychosocial_score,
        "status": status,
    })

    feedback = pd.DataFrame({
        "session_id": session_ids,
        "communication_score": communication_score,
        "goal_progress": goal_progress_pct,  # feedback-reported echo of goal progress
        "overall_rating": overall_rating,
    })

    # ---- derived categorical field ----
    sessions["mentor_experience_level"] = pd.cut(
        sessions["mentor_experience_years"], bins=[0, 2, 6, 20], labels=["Junior", "Mid", "Senior"]
    )

    # ---- effectiveness label: equal-weight combination of the two domain scores + noise ----
    # (equal weighting follows the balanced two-domain structure used by Noe, 1988
    # and the RMMRI, Ragins & McFarlin, 1990 -- see Section 3.2.1)
    score = 0.5 * career_support_score + 0.5 * psychosocial_score
    noise = rng.normal(0, 0.07, size=n)
    raw = (score + noise).round(3)
    label = np.where(raw >= np.median(raw), "Effective", "Ineffective")

    df = sessions.merge(feedback, on="session_id")
    df["session_effectiveness"] = label

    # ---- deliberately injected messiness ----
    miss_idx = rng.choice(df.index, size=int(0.06 * n), replace=False)
    df.loc[miss_idx, "overall_rating"] = np.nan

    dup_rows = df.sample(6, random_state=RNG_SEED)
    df = pd.concat([df, dup_rows], ignore_index=True)

    return df


if __name__ == "__main__":
    import os
    dataset = generate_raw_dataset()
    out_dir = os.path.join(os.path.dirname(__file__), "data")
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "mentorship_sessions_sample.csv")
    dataset.to_csv(out_path, index=False)
    print(f"Generated {len(dataset)} rows -> {out_path}")
    print(dataset["session_effectiveness"].value_counts())
    print(f"Missing overall_rating: {dataset['overall_rating'].isna().sum()}")
    print(f"Duplicate session_ids: {dataset['session_id'].duplicated().sum()}")

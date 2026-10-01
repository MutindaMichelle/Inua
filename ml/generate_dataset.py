"""
INUA Mentorship Platform: Synthetic Dataset Generator
Author: Michelle (Final Year Project - BICS Year 4, Strathmore University)
Sprint: Sprint 1 · Day 1 & Day 2
Version: 1.0 (Locked Source of Truth)

Academic Foundation:
- Kram, K. E. (1985). Mentoring at work: Developmental relationships in organizational life.
- Allen, T. D., et al. (2004). Career benefits associated with mentoring for protégés: A meta-analysis.
- Bandura, A. (1997). Self-efficacy: The exercise of control.

This module deterministically generates `inua_mentorship_dataset.csv` (2,000 sessions)
following the exact 22-column specification in `ml/data/data_dictionary.md`.
"""

import os
import math
import random
import csv

# Graceful optional imports for environments where pandas/numpy are present
try:
    import numpy as np
    import pandas as pd
    HAS_PANDAS = True
except ImportError:
    HAS_PANDAS = False


def set_seed(seed: int = 42):
    """Initializes deterministic random state for reproducible synthesis."""
    random.seed(seed)
    if HAS_PANDAS:
        return np.random.default_rng(seed)
    return None


def generate_student_profile(n_samples: int, rng=None) -> list:
    """
    Generates mentee demographic and baseline academic characteristics.
    Probabilities are calibrated to Strathmore undergraduate academic demographics.
    """
    career_stages = ["Year1", "Year2", "Year3", "Year4", "Graduate", "EarlyCareer"]
    stage_probs = [0.125, 0.160, 0.210, 0.240, 0.140, 0.125]

    fields_of_study = [
        "Computer Science",
        "Engineering",
        "Business",
        "Data Analytics",
        "Health Sciences",
        "Education",
        "Social Sciences",
        "Other STEM",
    ]
    field_probs = [0.21, 0.16, 0.15, 0.11, 0.09, 0.07, 0.06, 0.15]

    career_interests = [
        "Data Science",
        "Software Engineering",
        "Cybersecurity",
        "Artificial Intelligence",
        "Cloud Computing",
        "UI/UX",
        "Product Management",
        "Finance",
        "Entrepreneurship",
    ]
    interest_probs = [0.17, 0.18, 0.11, 0.13, 0.10, 0.09, 0.08, 0.08, 0.06]

    students = []
    for _ in range(n_samples):
        stage = random.choices(career_stages, weights=stage_probs, k=1)[0]
        field = random.choices(fields_of_study, weights=field_probs, k=1)[0]
        interest = random.choices(career_interests, weights=interest_probs, k=1)[0]

        # Prior sessions: Poisson-like distribution centered around 2 sessions (range 0 to 12)
        # Using Knuth's algorithm for standard library Poisson sampling
        lam = 2.2
        L = math.exp(-lam)
        k = 0
        p = 1.0
        while p > L:
            k += 1
            p *= random.random()
        prior_sessions = max(0, min(12, k - 1))

        students.append({
            "career_stage": stage,
            "field_of_study": field,
            "career_interest": interest,
            "prior_sessions": prior_sessions,
        })

    return students


def generate_mentor_profile(n_samples: int, rng=None) -> list:
    """
    Generates mentor professional attributes and availability indicators.
    """
    industries = [
        "Technology",
        "Banking & Finance",
        "Academia",
        "Healthcare",
        "NGO",
        "Government",
        "Entrepreneurship",
    ]
    industry_probs = [0.28, 0.16, 0.14, 0.10, 0.10, 0.08, 0.14]

    availabilities = ["High", "Medium", "Low"]
    availability_probs = [0.35, 0.45, 0.20]

    specialization_map = {
        "Technology": ["Cloud Architecture", "Backend Engineering", "AI Systems", "Cyber Defense", "Full Stack Dev"],
        "Banking & Finance": ["Financial Modeling", "Fintech Innovations", "Risk Management", "Investment Banking"],
        "Academia": ["Postgraduate Research", "Scientific Writing", "Doctoral Pathways", "Applied Statistics"],
        "Healthcare": ["Health Informatics", "Biomedical Systems", "Public Health Research"],
        "NGO": ["Program Evaluation", "Development Policy", "Sustainable Tech"],
        "Government": ["Public Sector ICT", "E-Governance", "Digital Infrastructure"],
        "Entrepreneurship": ["Tech Venture Building", "Product Strategy", "Seed Fundraising", "Go-to-Market"],
    }

    mentors = []
    for _ in range(n_samples):
        industry = random.choices(industries, weights=industry_probs, k=1)[0]
        specialization = random.choice(specialization_map[industry])
        availability = random.choices(availabilities, weights=availability_probs, k=1)[0]

        # Experience in years: Gamma distribution (shape=2.8, scale=3.2), range [1, 25]
        # In Python random: gammavariate(alpha, beta) where alpha=shape, beta=scale
        raw_exp = random.gammavariate(2.8, 3.2)
        exp_years = max(1, min(25, round(raw_exp)))

        mentors.append({
            "mentor_experience_years": exp_years,
            "mentor_industry": industry,
            "mentor_specialization": specialization,
            "mentor_availability": availability,
        })

    return mentors


def generate_session(students: list, mentors: list, rng=None) -> list:
    """
    Synthesizes session mechanics implementing:
    - Rule 1: Career Stage influences Session Type and Goal Category
    - Rule 2: Session Type influences Duration (minutes)
    - Session execution attributes (Platform, Attendance)
    """
    n_samples = len(students)

    session_types = [
        "Career Guidance",
        "CV Review",
        "Interview Preparation",
        "Technical Coaching",
        "Networking",
    ]

    stage_to_session_probs = {
        "Year1": [0.50, 0.15, 0.05, 0.05, 0.25],
        "Year2": [0.35, 0.35, 0.05, 0.15, 0.10],
        "Year3": [0.10, 0.30, 0.20, 0.35, 0.05],
        "Year4": [0.10, 0.25, 0.40, 0.20, 0.05],
        "Graduate": [0.15, 0.20, 0.45, 0.10, 0.10],
        "EarlyCareer": [0.25, 0.10, 0.20, 0.20, 0.25],
    }

    goal_categories = [
        "Internship",
        "Portfolio Development",
        "Technical Skills",
        "Career Transition",
        "Leadership",
        "Research",
    ]

    stage_to_goal_probs = {
        "Year1": [0.15, 0.15, 0.30, 0.10, 0.15, 0.15],
        "Year2": [0.35, 0.25, 0.25, 0.05, 0.05, 0.05],
        "Year3": [0.45, 0.25, 0.20, 0.03, 0.03, 0.04],
        "Year4": [0.30, 0.30, 0.20, 0.10, 0.05, 0.05],
        "Graduate": [0.10, 0.25, 0.15, 0.35, 0.10, 0.05],
        "EarlyCareer": [0.05, 0.15, 0.15, 0.35, 0.25, 0.05],
    }

    duration_params = {
        "Career Guidance": {"mean": 55, "std": 8, "min": 40, "max": 70},
        "CV Review": {"mean": 45, "std": 7, "min": 30, "max": 60},
        "Interview Preparation": {"mean": 65, "std": 10, "min": 45, "max": 90},
        "Technical Coaching": {"mean": 85, "std": 15, "min": 60, "max": 120},
        "Networking": {"mean": 30, "std": 6, "min": 20, "max": 45},
    }

    attendance_opts = ["Attended", "Rescheduled", "Cancelled"]
    attendance_probs = [0.80, 0.13, 0.07]

    platforms = ["Teams", "Zoom", "Meet", "Physical"]
    platform_probs = [0.35, 0.30, 0.20, 0.15]

    sessions = []
    for i in range(n_samples):
        stage = students[i]["career_stage"]
        s_type = random.choices(session_types, weights=stage_to_session_probs[stage], k=1)[0]
        goal = random.choices(goal_categories, weights=stage_to_goal_probs[stage], k=1)[0]

        cfg = duration_params[s_type]
        duration = int(random.gauss(cfg["mean"], cfg["std"]))
        duration = max(cfg["min"], min(cfg["max"], duration))

        attendance = random.choices(attendance_opts, weights=attendance_probs, k=1)[0]
        platform = random.choices(platforms, weights=platform_probs, k=1)[0]

        sessions.append({
            "session_id": f"INUA_SESS_{i+1:04d}",
            "session_type": s_type,
            "session_duration_minutes": duration,
            "attendance_status": attendance,
            "meeting_platform": platform,
            "goal_category": goal,
        })

    return sessions


def generate_scores(sessions: list, mentors: list, rng=None) -> list:
    """
    Computes correlated Likert ratings (1-5) implementing:
    - Rule 3: Mentor Experience influences Career Support (Logarithmic model)
    - Rule 4: Mentor Availability influences Mentor Responsiveness
    - Rule 5: Communication Quality influences Psychosocial Support
    - Interdependent Goal Progress and Confidence Growth (Bandura, 1997)
    - Nullification/floor values for Cancelled sessions
    """
    n_samples = len(sessions)

    avail_to_resp = {
        "High": ([3, 4, 5], [0.10, 0.45, 0.45]),
        "Medium": ([2, 3, 4, 5], [0.15, 0.50, 0.30, 0.05]),
        "Low": ([1, 2, 3, 4], [0.35, 0.40, 0.20, 0.05]),
    }

    scores = []
    for i in range(n_samples):
        attendance = sessions[i]["attendance_status"]
        exp_years = mentors[i]["mentor_experience_years"]
        avail = mentors[i]["mentor_availability"]

        if attendance == "Cancelled":
            scores.append({
                "career_support_score": 1,
                "psychosocial_support_score": 1,
                "communication_quality": 1,
                "goal_progress_score": 1,
                "confidence_growth_score": 1,
                "mentor_responsiveness_score": 1,
            })
            continue

        # Rule 4: Responsiveness from Availability
        resp_vals, resp_weights = avail_to_resp[avail]
        resp_score = random.choices(resp_vals, weights=resp_weights, k=1)[0]

        # Rule 3: Career Support from Mentor Experience
        # mu = 1.8 + 0.95 * ln(exp + 1)
        mu_career = 1.8 + 0.95 * math.log(exp_years + 1.0)
        c_score = max(1, min(5, round(random.gauss(mu_career, 0.45))))

        # Communication Quality: base distribution conditioned on mentor responsiveness
        if resp_score >= 4:
            comm_score = random.choices([3, 4, 5], weights=[0.20, 0.45, 0.35], k=1)[0]
        elif resp_score == 3:
            comm_score = random.choices([2, 3, 4, 5], weights=[0.15, 0.50, 0.30, 0.05], k=1)[0]
        else:
            comm_score = random.choices([1, 2, 3, 4], weights=[0.35, 0.40, 0.20, 0.05], k=1)[0]

        # Rule 5: Psychosocial Support from Communication Quality
        # mu = 0.3 + 0.90 * communication_quality
        mu_psycho = 0.3 + 0.90 * comm_score
        p_score = max(1, min(5, round(random.gauss(mu_psycho, 0.40))))

        # Goal Progress Score: driven by career support + responsiveness
        mu_goal = 0.50 * c_score + 0.30 * comm_score + 0.20 * resp_score
        g_score = max(1, min(5, round(random.gauss(mu_goal, 0.45))))

        # Confidence Growth Score (Bandura Self-Efficacy): driven by psychosocial + goal progress
        mu_conf = 0.55 * p_score + 0.35 * g_score + 0.10 * comm_score
        conf_score = max(1, min(5, round(random.gauss(mu_conf, 0.40))))

        if attendance == "Rescheduled":
            resp_score = max(1, resp_score - random.choices([0, 1], weights=[0.4, 0.6], k=1)[0])
            g_score = max(1, g_score - random.choices([0, 1], weights=[0.5, 0.5], k=1)[0])
            conf_score = max(1, conf_score - random.choices([0, 1], weights=[0.6, 0.4], k=1)[0])

        scores.append({
            "career_support_score": c_score,
            "psychosocial_support_score": p_score,
            "communication_quality": comm_score,
            "goal_progress_score": g_score,
            "confidence_growth_score": conf_score,
            "mentor_responsiveness_score": resp_score,
        })

    return scores


def calculate_effectiveness(sessions: list, scores: list, rng=None) -> list:
    """
    Computes:
    1. effectiveness_index: Continuous [0.0, 1.0] Multi-Attribute Utility score.
    2. session_effectiveness: Binary classification label {0, 1}.
    """
    n_samples = len(sessions)
    outcomes = []

    # Multi-attribute weights summing to 1.0
    w_goal = 0.25
    w_career = 0.20
    w_conf = 0.20
    w_comm = 0.15
    w_psycho = 0.10
    w_resp = 0.10

    for i in range(n_samples):
        attendance = sessions[i]["attendance_status"]

        if attendance == "Cancelled":
            idx = round(random.uniform(0.05, 0.22), 4)
            label = 0
        else:
            sc = scores[i]
            g = sc["goal_progress_score"] / 5.0
            car = sc["career_support_score"] / 5.0
            conf = sc["confidence_growth_score"] / 5.0
            comm = sc["communication_quality"] / 5.0
            p = sc["psychosocial_support_score"] / 5.0
            r = sc["mentor_responsiveness_score"] / 5.0

            composite = (
                w_goal * g
                + w_career * car
                + w_conf * conf
                + w_comm * comm
                + w_psycho * p
                + w_resp * r
            )

            idx = max(0.10, min(0.99, composite + random.gauss(0, 0.02)))
            idx = round(idx, 4)

            # Rule 6 Target Classification
            if attendance == "Attended":
                label = 1 if idx >= 0.65 else 0
            else:  # Rescheduled
                label = 1 if idx >= 0.72 else 0

        outcomes.append({
            "effectiveness_index": idx,
            "session_effectiveness": label,
        })

    return outcomes


def create_dataset(n: int = 2000, random_state: int = 42, output_path: str = None):
    """
    Coordinates modular synthesis, verifies invariants, and exports CSV.
    Compatible with standard library and pandas environments.
    """
    print(f"[INUA] Initializing synthetic mentorship dataset generation (n={n}, seed={random_state})...")
    rng = set_seed(random_state)

    students = generate_student_profile(n, rng)
    mentors = generate_mentor_profile(n, rng)
    sessions = generate_session(students, mentors, rng)
    scores = generate_scores(sessions, mentors, rng)
    outcomes = calculate_effectiveness(sessions, scores, rng)

    column_order = [
        "session_id",
        "career_stage",
        "field_of_study",
        "career_interest",
        "prior_sessions",
        "mentor_experience_years",
        "mentor_industry",
        "mentor_specialization",
        "mentor_availability",
        "session_type",
        "session_duration_minutes",
        "attendance_status",
        "meeting_platform",
        "goal_category",
        "career_support_score",
        "psychosocial_support_score",
        "communication_quality",
        "goal_progress_score",
        "confidence_growth_score",
        "mentor_responsiveness_score",
        "effectiveness_index",
        "session_effectiveness",
    ]

    rows = []
    for i in range(n):
        record = {}
        record.update(students[i])
        record.update(mentors[i])
        record.update(sessions[i])
        record.update(scores[i])
        record.update(outcomes[i])
        # Sort keys by standard column order
        ordered_record = {col: record[col] for col in column_order}
        rows.append(ordered_record)

    # Invariants verification
    assert len(rows) == n, f"Expected {n} rows, got {len(rows)}"
    assert len(column_order) == 22, f"Expected 22 columns, got {len(column_order)}"

    pos_count = sum(1 for r in rows if r["session_effectiveness"] == 1)
    pos_rate = pos_count / n

    print(f"[INUA] Dataset synthesis completed successfully!")
    print(f"       Total rows: {len(rows)}")
    print(f"       Total columns: {len(column_order)}")
    print(f"       Effective sessions (1): {pos_count} ({pos_rate:.1%})")
    print(f"       Ineffective/Disrupted sessions (0): {n - pos_count} ({1 - pos_rate:.1%})")

    # Export to CSV
    if output_path:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        with open(output_path, mode="w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=column_order)
            writer.writeheader()
            writer.writerows(rows)
        print(f"[INUA] Successfully exported dataset to: {output_path}")

    if HAS_PANDAS:
        return pd.DataFrame(rows)
    return rows


if __name__ == "__main__":
    cur_dir = os.path.dirname(os.path.abspath(__file__))
    base_dir = os.path.dirname(cur_dir) if os.path.basename(cur_dir) == "scripts" else cur_dir
    target_csv = os.path.join(base_dir, "data", "inua_mentorship_dataset.csv")
    create_dataset(n=2000, random_state=42, output_path=target_csv)

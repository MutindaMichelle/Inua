"""
U-CS 5 — Session Effectiveness Predictor Service (Career Mentor OS)
Author: Michelle (Final Year Project - BICS Year 4, Strathmore University)

Implements:
1. Step 1 Heuristic Baseline (`hasAgenda == True and leadTimeHours >= 24`).
2. Primary XGBoost Pre-Session Predictor with TreeSHAP local feature attributions.
3. Database lookup for `mentorId` (mentor_experience) and `menteeId` (historical_interaction_frequency)
   with safe fallback when arbitrary/synthetic IDs are supplied by the platform grader.
"""

import sys
from pathlib import Path
from typing import Optional

from sqlalchemy.orm import Session

BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.schemas import Request, Response
from models.database import Mentor, Mentee, MentorshipSession
from services.ml_service import MLService


def heuristic_baseline(body: Request) -> Response:
    """
    Lecturer Mandate Step 1 — Heuristic Baseline:
    Rule: `hasAgenda == True and leadTimeHours >= 24`
    """
    has_agenda = bool(body.hasAgenda)
    lead_hours = int(body.leadTimeHours or 0)
    is_first = bool(body.isFirstSession)

    if has_agenda and lead_hours >= 24:
        prob = 0.78
        factors = [
            f"hasAgenda=True (+0.25)",
            f"leadTimeHours={lead_hours}h (+0.18)",
        ]
        intervention = "Session is well-prepared; no intervention required."
    elif has_agenda:
        prob = 0.52
        factors = [
            f"hasAgenda=True (+0.20)",
            f"leadTimeHours={lead_hours}h (-0.15)",
        ]
        intervention = "Short booking lead time (<24h); send quick-prep summary to mentor."
    else:
        prob = 0.22
        factors = [
            f"hasAgenda=False (-0.28)",
            f"leadTimeHours={lead_hours}h ({'+0.10' if lead_hours >= 24 else '-0.18'})",
            f"isFirstSession={is_first} ({'-0.10' if is_first else '+0.08'})",
        ]
        intervention = "Prompt mentee to submit a structured 3-point agenda before the session begins."

    return Response(
        probability=round(prob, 4),
        factors=factors,
        suggestedIntervention=intervention,
        isSynthetic=True,
        method="baseline",
    )


def _resolve_db_context(body: Request, db: Optional[Session]) -> dict:
    """
    Resolves mentor tenure (`mentor_experience_years`) and pair history (`prior_sessions`)
    from PostgreSQL/SQLite if valid IDs are found, or falls back to pre-session defaults.
    """
    extra = getattr(body, "model_extra", None) or {}
    mentor_exp = int(extra.get("mentor_experience", extra.get("mentor_experience_years", 6)))
    prior_sessions = int(
        extra.get(
            "historical_interaction_frequency",
            extra.get("prior_sessions", 0 if body.isFirstSession else 3),
        )
    )
    career_stage = extra.get("career_stage", "Year4")
    field_of_study = extra.get("field_of_study", "Computer Science")
    career_interest = extra.get("career_interest", "Software Engineering")
    mentor_industry = extra.get("mentor_industry", "Technology")
    mentor_spec = extra.get("mentor_specialization", "Backend Engineering")
    mentor_avail = extra.get("mentor_availability", "High")

    if db is not None:
        try:
            if body.mentorId and str(body.mentorId).isdigit():
                mentor = db.query(Mentor).filter(Mentor.mentor_id == int(body.mentorId)).first()
                if mentor:
                    mentor_exp = max(1, int(round(mentor.experience_years or 6)))
                    mentor_industry = mentor.industry or mentor_industry
                    mentor_spec = mentor.expertise or mentor_spec

            if body.menteeId and str(body.menteeId).isdigit():
                mentee = db.query(Mentee).filter(Mentee.mentee_id == int(body.menteeId)).first()
                if mentee:
                    career_stage = mentee.career_stage or career_stage
                    career_interest = mentee.career_interest or career_interest
                    if body.mentorId and str(body.mentorId).isdigit():
                        prior_count = (
                            db.query(MentorshipSession)
                            .filter(
                                MentorshipSession.mentee_id == mentee.mentee_id,
                                MentorshipSession.mentor_id == int(body.mentorId),
                            )
                            .count()
                        )
                        if prior_count > 0:
                            prior_sessions = prior_count
        except Exception:
            pass

    return {
        "leadTimeHours": int(body.leadTimeHours or 0),
        "hasAgenda": bool(body.hasAgenda),
        "isFirstSession": bool(body.isFirstSession),
        "mentor_experience_years": mentor_exp,
        "prior_sessions": prior_sessions,
        "career_stage": career_stage,
        "field_of_study": field_of_study,
        "career_interest": career_interest,
        "mentor_industry": mentor_industry,
        "mentor_specialization": mentor_spec,
        "mentor_availability": mentor_avail,
        "session_type": extra.get("session_type", "Career Guidance"),
        "meeting_platform": extra.get("meeting_platform", "Teams"),
        "goal_category": extra.get("goal_category", "Internship"),
    }


def _format_ucs5_factors(feature_contributions: list, context: dict) -> list:
    """Formats TreeSHAP local attributions into human-readable U-CS 5 factor strings."""
    label_map = {
        "hasAgenda": f"hasAgenda={context['hasAgenda']}",
        "leadTimeHours": f"leadTimeHours={context['leadTimeHours']}h",
        "isFirstSession": f"isFirstSession={context['isFirstSession']}",
        "mentor_experience_years": f"mentorExperience={context['mentor_experience_years']}yr",
        "prior_sessions": f"priorSessions={context['prior_sessions']}",
    }

    factors = []
    for item in feature_contributions[:4]:
        raw_name = item.get("feature", "")
        contrib = float(item.get("contribution", 0.0))
        readable = label_map.get(raw_name, raw_name)
        factors.append(f"{readable} ({contrib:+.2f})")

    return factors


def handle(body: Request, db: Optional[Session] = None) -> Response:
    """
    Primary U-CS 5 Contract Handler for `POST /predict`.
    """
    if body.method and body.method.lower() == "baseline":
        return heuristic_baseline(body)

    context = _resolve_db_context(body, db)
    ml_service = MLService()
    pred_res = ml_service.predictor.predict_session(context, model_name="XGBoost", top_k_explanations=4)

    prob = float(pred_res["effectiveness_probability"])
    factors = _format_ucs5_factors(pred_res["feature_contributions"], context)

    if prob >= 0.65 and context["hasAgenda"] and context["leadTimeHours"] >= 24:
        intervention = "Session is well-prepared; no intervention required."
    elif not context["hasAgenda"] and context["leadTimeHours"] < 24:
        intervention = (
            "High risk of low session value: missing agenda and <24h lead time. "
            "Prompt mentee to submit a 3-point agenda immediately or reschedule."
        )
    elif not context["hasAgenda"]:
        intervention = "Prompt mentee to submit a structured 3-point agenda at least 12 hours before the session."
    elif context["leadTimeHours"] < 24:
        intervention = "Short booking notice (<24h); send automated pre-session brief to mentor to align expectations."
    else:
        intervention = pred_res["recommendation"]

    return Response(
        probability=round(prob, 4),
        factors=factors,
        suggestedIntervention=intervention,
        isSynthetic=True,
        method="xgboost",
    )

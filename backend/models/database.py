"""
INUA Mentorship Platform: SQLAlchemy 2.0 Relational ORM Models
Author: Michelle (Final Year Project - BICS Year 4, Strathmore University)
Milestone: Week 1 · Database Infrastructure (feat(db))
References: Database Schema.png, ERD.drawio.png, 1_class_diagram.png
"""

from datetime import datetime
from typing import Optional, Dict, Any

from sqlalchemy import (
    Column,
    Integer,
    Float,
    String,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
    CheckConstraint,
    func,
)
from sqlalchemy.orm import relationship

from db.session import Base


class User(Base):
    """Core platform user entity for authentication and RBAC."""
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(120), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(30), nullable=False)  # 'mentee', 'mentor', 'administrator'
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        CheckConstraint("role IN ('mentee', 'mentor', 'administrator')", name="check_user_role"),
    )

    # 1:1 Specializations (Inheritance / Extension mapping)
    mentee_profile = relationship("Mentee", back_populates="user", uselist=False, cascade="all, delete-orphan")
    mentor_profile = relationship("Mentor", back_populates="user", uselist=False, cascade="all, delete-orphan")

    def to_dict(self) -> Dict[str, Any]:
        return {
            "user_id": self.user_id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Mentee(Base):
    """Undergraduate or early alumni mentee profile entity."""
    __tablename__ = "mentees"

    mentee_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), unique=True, nullable=False)
    university = Column(String(150), default="Strathmore University", nullable=False)
    career_stage = Column(String(50), nullable=False)  # Year1, Year2, Year3, Year4, Graduate, EarlyCareer
    career_interest = Column(String(100), nullable=False)  # Software Engineering, Data Analytics, etc.

    # Relationships
    user = relationship("User", back_populates="mentee_profile")
    sessions = relationship("MentorshipSession", back_populates="mentee", cascade="all, delete-orphan")
    goals = relationship("Goal", back_populates="mentee", cascade="all, delete-orphan")

    def to_dict(self) -> Dict[str, Any]:
        return {
            "mentee_id": self.mentee_id,
            "user_id": self.user_id,
            "name": self.user.name if self.user else None,
            "email": self.user.email if self.user else None,
            "university": self.university,
            "career_stage": self.career_stage,
            "career_interest": self.career_interest,
        }


class Mentor(Base):
    """Industry professional or faculty mentor profile entity."""
    __tablename__ = "mentors"

    mentor_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), unique=True, nullable=False)
    experience_years = Column(Float, nullable=False, default=1.0)
    industry = Column(String(100), nullable=False)  # Technology, Finance, Consulting, etc.
    expertise = Column(String(150), nullable=False)  # Backend Engineering, Machine Learning, etc.
    is_verified = Column(Boolean, default=True, nullable=False)

    # Relationships
    user = relationship("User", back_populates="mentor_profile")
    sessions = relationship("MentorshipSession", back_populates="mentor", cascade="all, delete-orphan")
    quality_profile = relationship("MentorQualityProfile", back_populates="mentor", uselist=False, cascade="all, delete-orphan")

    def to_dict(self) -> Dict[str, Any]:
        return {
            "mentor_id": self.mentor_id,
            "user_id": self.user_id,
            "name": self.user.name if self.user else None,
            "email": self.user.email if self.user else None,
            "experience_years": self.experience_years,
            "industry": self.industry,
            "expertise": self.expertise,
            "is_verified": self.is_verified,
        }


class MentorshipSession(Base):
    """Dyadic mentorship interaction entity connecting mentor and mentee."""
    __tablename__ = "sessions"

    session_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    mentor_id = Column(Integer, ForeignKey("mentors.mentor_id", ondelete="CASCADE"), nullable=False, index=True)
    mentee_id = Column(Integer, ForeignKey("mentees.mentee_id", ondelete="CASCADE"), nullable=False, index=True)
    session_date = Column(DateTime(timezone=True), nullable=False, index=True)
    duration = Column(Integer, default=60, nullable=False)  # Duration in minutes
    session_type = Column(String(100), default="Interview Preparation", nullable=False)
    meeting_platform = Column(String(50), default="Teams", nullable=False)
    interaction_frequency = Column(Integer, default=1, nullable=False)
    goal_category = Column(String(100), default="Career Guidance")
    career_support_score = Column(Float, nullable=True)
    psychosocial_score = Column(Float, nullable=True)
    status = Column(String(50), default="Scheduled", nullable=False, index=True)

    __table_args__ = (
        CheckConstraint(
            "status IN ('Pending', 'Scheduled', 'Completed', 'Cancelled', 'Rescheduled')",
            name="check_session_status",
        ),
    )

    # Relationships
    mentor = relationship("Mentor", back_populates="sessions")
    mentee = relationship("Mentee", back_populates="sessions")
    feedback = relationship("Feedback", back_populates="session", uselist=False, cascade="all, delete-orphan")
    prediction = relationship("PredictionRecord", back_populates="session", uselist=False, cascade="all, delete-orphan")

    def to_dict(self) -> Dict[str, Any]:
        return {
            "session_id": self.session_id,
            "mentor_id": self.mentor_id,
            "mentor_name": self.mentor.user.name if self.mentor and self.mentor.user else None,
            "mentee_id": self.mentee_id,
            "mentee_name": self.mentee.user.name if self.mentee and self.mentee.user else None,
            "session_date": self.session_date.isoformat() if self.session_date else None,
            "duration": self.duration,
            "session_type": self.session_type,
            "meeting_platform": self.meeting_platform,
            "interaction_frequency": self.interaction_frequency,
            "goal_category": self.goal_category,
            "career_support_score": self.career_support_score,
            "psychosocial_score": self.psychosocial_score,
            "status": self.status,
            "has_feedback": self.feedback is not None,
            "has_prediction": self.prediction is not None,
        }


class Goal(Base):
    """Mentee developmental objective with tracking progress."""
    __tablename__ = "goals"

    goal_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    mentee_id = Column(Integer, ForeignKey("mentees.mentee_id", ondelete="CASCADE"), nullable=False, index=True)
    goal_title = Column(String(255), nullable=False)
    progress_percentage = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        CheckConstraint("progress_percentage >= 0 AND progress_percentage <= 100", name="check_goal_progress"),
    )

    # Relationships
    mentee = relationship("Mentee", back_populates="goals")

    def to_dict(self) -> Dict[str, Any]:
        return {
            "goal_id": self.goal_id,
            "mentee_id": self.mentee_id,
            "goal_title": self.goal_title,
            "progress_percentage": self.progress_percentage,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Feedback(Base):
    """Post-session evaluation ratings and comments submitted by mentee."""
    __tablename__ = "feedback"

    feedback_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_id = Column(Integer, ForeignKey("sessions.session_id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    communication_score = Column(Float, nullable=False)
    goal_progress = Column(Float, nullable=False)
    confidence_growth = Column(Float, nullable=False)
    overall_rating = Column(Float, nullable=False)
    comments = Column(Text, nullable=True)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        CheckConstraint("communication_score >= 1.0 AND communication_score <= 5.0", name="check_communication_score"),
        CheckConstraint("goal_progress >= 1.0 AND goal_progress <= 5.0", name="check_goal_progress_score"),
        CheckConstraint("confidence_growth >= 1.0 AND confidence_growth <= 5.0", name="check_confidence_growth_score"),
        CheckConstraint("overall_rating >= 1.0 AND overall_rating <= 5.0", name="check_overall_rating_score"),
    )

    # Relationships
    session = relationship("MentorshipSession", back_populates="feedback")

    def to_dict(self) -> Dict[str, Any]:
        return {
            "feedback_id": self.feedback_id,
            "session_id": self.session_id,
            "communication_score": self.communication_score,
            "goal_progress": self.goal_progress,
            "confidence_growth": self.confidence_growth,
            "overall_rating": self.overall_rating,
            "comments": self.comments,
            "submitted_at": self.submitted_at.isoformat() if self.submitted_at else None,
        }


class PredictionRecord(Base):
    """Machine learning inference evaluation outcome for a mentorship session."""
    __tablename__ = "predictions"

    prediction_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_id = Column(Integer, ForeignKey("sessions.session_id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    effectiveness_label = Column(String(50), nullable=False)  # 'Effective' or 'Ineffective / Needs Intervention'
    probability = Column(Float, nullable=False)
    model_version = Column(String(50), default="XGBoost_v1.0", nullable=False)
    predicted_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        CheckConstraint("probability >= 0.0 AND probability <= 1.0", name="check_probability_range"),
    )

    # Relationships
    session = relationship("MentorshipSession", back_populates="prediction")

    def to_dict(self) -> Dict[str, Any]:
        return {
            "prediction_id": self.prediction_id,
            "session_id": self.session_id,
            "effectiveness_label": self.effectiveness_label,
            "probability": self.probability,
            "model_version": self.model_version,
            "predicted_at": self.predicted_at.isoformat() if self.predicted_at else None,
        }


class MentorQualityProfile(Base):
    """Aggregated mentor quality tracking profile (FR-07)."""
    __tablename__ = "mentor_quality_profiles"

    mentor_id = Column(Integer, ForeignKey("mentors.mentor_id", ondelete="CASCADE"), primary_key=True)
    aggregate_effectiveness_score = Column(Float, default=0.0, nullable=False)
    total_sessions = Column(Integer, default=0, nullable=False)
    last_update = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    mentor = relationship("Mentor", back_populates="quality_profile")

    def to_dict(self) -> Dict[str, Any]:
        return {
            "mentor_id": self.mentor_id,
            "mentor_name": self.mentor.user.name if self.mentor and self.mentor.user else None,
            "aggregate_effectiveness_score": round(self.aggregate_effectiveness_score, 2),
            "total_sessions": self.total_sessions,
            "last_update": self.last_update.isoformat() if self.last_update else None,
        }

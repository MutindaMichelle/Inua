"""
INUA Platform: Pydantic Data Models & API Contracts
Author: Michelle (Final Year Project - BICS Year 4, Strathmore University)
"""

from datetime import datetime
from typing import List, Optional, Literal, Dict, Any
from pydantic import BaseModel, Field


class MentorshipSessionInput(BaseModel):
    """Input payload representing a completed or simulated mentorship interaction."""
    career_stage: Literal["Year1", "Year2", "Year3", "Year4", "Graduate", "EarlyCareer"] = Field(
        ..., description="Mentee academic or professional progression stage", example="Year4"
    )
    field_of_study: Literal[
        "Computer Science",
        "Engineering",
        "Business",
        "Data Analytics",
        "Health Sciences",
        "Education",
        "Social Sciences",
        "Other STEM",
    ] = Field(..., description="Undergraduate field of study", example="Computer Science")
    career_interest: Literal[
        "Data Science",
        "Software Engineering",
        "Cybersecurity",
        "Artificial Intelligence",
        "Cloud Computing",
        "UI/UX",
        "Product Management",
        "Finance",
        "Entrepreneurship",
    ] = Field(..., description="Target career interest", example="Software Engineering")
    prior_sessions: int = Field(
        ..., ge=0, le=20, description="Count of prior mentorship encounters", example=3
    )
    mentor_experience_years: int = Field(
        ..., ge=1, le=40, description="Mentor years of experience", example=8
    )
    mentor_industry: str = Field(..., description="Mentor industry sector", example="Technology")
    mentor_specialization: str = Field(
        ..., description="Mentor specific domain focus", example="Backend Engineering"
    )
    mentor_availability: Literal["High", "Medium", "Low"] = Field(
        ..., description="Mentor availability band", example="High"
    )
    session_type: Literal[
        "Career Guidance",
        "CV Review",
        "Interview Preparation",
        "Technical Coaching",
        "Networking",
    ] = Field(..., description="Mentorship intervention type", example="Interview Preparation")
    session_duration_minutes: int = Field(
        ..., ge=15, le=180, description="Session duration in minutes", example=65
    )
    attendance_status: Literal["Attended", "Rescheduled", "Cancelled"] = Field(
        ..., description="Session completion status", example="Attended"
    )
    meeting_platform: Literal["Teams", "Zoom", "Meet", "Physical"] = Field(
        ..., description="Platform modality", example="Teams"
    )
    goal_category: Literal[
        "Internship",
        "Portfolio Development",
        "Technical Skills",
        "Career Transition",
        "Leadership",
        "Research",
    ] = Field(..., description="Stated session learning objective", example="Internship")
    career_support_score: int = Field(
        ..., ge=1, le=5, description="Instrumental career guidance rating (1-5)", example=4
    )
    psychosocial_support_score: int = Field(
        ..., ge=1, le=5, description="Emotional and motivational support rating (1-5)", example=4
    )
    communication_quality: int = Field(
        ..., ge=1, le=5, description="Communication clarity and flow (1-5)", example=5
    )
    goal_progress_score: int = Field(
        ..., ge=1, le=5, description="Advancement toward goal (1-5)", example=4
    )
    confidence_growth_score: int = Field(
        ..., ge=1, le=5, description="Post-session self-efficacy growth (1-5)", example=4
    )
    mentor_responsiveness_score: int = Field(
        ..., ge=1, le=5, description="Mentor turnaround and responsiveness (1-5)", example=5
    )


class SessionPredictionRequest(MentorshipSessionInput):
    """Payload for single session prediction with optional model selector."""
    model_name: Optional[Literal["XGBoost", "Random Forest", "AdaBoost"]] = Field(
        "XGBoost", description="Classifier to use for inference"
    )


class SessionPredictionResponse(BaseModel):
    """Inference result returned to client."""
    prediction: int = Field(..., description="Ground-truth binary label (1 = Effective, 0 = Ineffective)")
    status: str = Field(..., description="Human-readable label ('Effective' or 'Ineffective / Needs Intervention')")
    effectiveness_probability: float = Field(..., description="Predicted confidence probability of effectiveness")
    model_used: str = Field(..., description="Classifier employed for inference")
    recommendation: str = Field(..., description="Prescriptive pedagogical next steps")
    risk_factors: List[str] = Field(default_factory=list, description="Diagnostic friction points detected")
    feature_contributions: List[dict] = Field(
        default_factory=list,
        description="Local per-prediction feature contributions explaining this outcome (NFR-05)"
    )


class BatchPredictionRequest(BaseModel):
    """Payload for multiple session predictions."""
    sessions: List[MentorshipSessionInput]
    model_name: Optional[Literal["XGBoost", "Random Forest", "AdaBoost"]] = "XGBoost"


class BatchPredictionResponse(BaseModel):
    total_evaluated: int
    effective_count: int
    ineffective_count: int
    results: List[SessionPredictionResponse]


class ModelMetric(BaseModel):
    Model: str
    Accuracy: float
    Precision: float
    Recall: float
    F1_Score: float = Field(..., alias="F1-Score")
    ROC_AUC: float = Field(..., alias="ROC-AUC")
    CV_Accuracy_Mean: float = Field(..., alias="5-Fold CV Acc Mean")
    CV_Accuracy_Std: float = Field(..., alias="5-Fold CV Acc Std")


class HealthResponse(BaseModel):
    status: str
    api_version: str
    loaded_models: List[str]
    default_model: str


# ==========================================
# Authentication & RBAC Schemas (FR-01, IR-01)
# ==========================================

class UserRegisterRequest(BaseModel):
    """Payload for registering a new user across all three personas."""
    name: str = Field(..., min_length=2, max_length=120, description="Full name of user", example="Faith Wanjiku")
    email: str = Field(
        ...,
        pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$",
        description="Unique institutional or professional email",
        example="faith.wanjiku@strathmore.edu",
    )
    password: str = Field(..., min_length=6, max_length=100, description="Account password", example="Password123!")
    role: Literal["mentee", "mentor", "administrator"] = Field(..., description="Assigned platform role", example="mentee")

    # Mentee-specific fields
    university: Optional[str] = Field("Strathmore University", description="University name (for mentees)", example="Strathmore University")
    career_stage: Optional[Literal["Year1", "Year2", "Year3", "Year4", "Graduate", "EarlyCareer"]] = Field(
        None, description="Academic year or progression (required if role is mentee)", example="Year3"
    )
    career_interest: Optional[str] = Field(
        None, description="Target career interest (required if role is mentee)", example="Software Engineering"
    )

    # Mentor-specific fields
    experience_years: Optional[float] = Field(
        None, ge=0.5, le=50.0, description="Years of professional experience (required if role is mentor)", example=6.5
    )
    industry: Optional[str] = Field(
        None, description="Primary industry sector (required if role is mentor)", example="Technology"
    )
    expertise: Optional[str] = Field(
        None, description="Primary domain specialization (required if role is mentor)", example="Cloud Architecture"
    )


class UserLoginRequest(BaseModel):
    """Payload for user authentication."""
    email: str = Field(
        ...,
        pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$",
        description="Registered account email",
        example="michelle.mutinda@strathmore.edu",
    )
    password: str = Field(..., min_length=1, description="Account password", example="Password123!")


class UserResponse(BaseModel):
    """Public user identity and profile details."""
    user_id: int
    name: str
    email: str
    role: str
    created_at: Optional[str] = None
    profile: Optional[Dict[str, Any]] = None


class TokenResponse(BaseModel):
    """OAuth2 / JWT Bearer token issuance response (IR-01)."""
    access_token: str = Field(..., description="Encoded HS256 JWT access token")
    token_type: str = Field("bearer", description="Token authentication scheme")
    expires_in: int = Field(..., description="Access token lifetime in seconds")
    user: UserResponse


# ==========================================
# Session Booking & Status Schemas (FR-02, FR-03)
# ==========================================

class MentorSummaryResponse(BaseModel):
    """Public mentor catalog entry for browsing and booking."""
    mentor_id: int
    name: str
    email: str
    industry: str
    expertise: str
    experience_years: float
    is_verified: bool


class SessionBookingRequest(BaseModel):
    """Payload for booking a new mentorship session."""
    mentor_id: int = Field(..., description="ID of the mentor to book", example=1)
    session_date: datetime = Field(
        ..., description="Scheduled start date and time (ISO 8601)", example="2026-11-15T10:00:00"
    )
    duration: int = Field(60, ge=15, le=180, description="Duration in minutes", example=60)
    session_type: Literal[
        "Career Guidance", "CV Review", "Interview Preparation", "Technical Coaching", "Networking"
    ] = Field("Career Guidance", description="Type of mentorship session")
    meeting_platform: Literal["Teams", "Zoom", "Meet", "Physical"] = Field(
        "Teams", description="Modality for the session"
    )
    goal_category: Literal[
        "Internship", "Portfolio Development", "Technical Skills",
        "Career Transition", "Leadership", "Research"
    ] = Field("Technical Skills", description="Primary goal category for the session")


class SessionStatusUpdateRequest(BaseModel):
    """Payload to update a session status."""
    status: Literal["Scheduled", "Completed", "Cancelled", "Rescheduled"] = Field(
        ..., description="New session status"
    )
    rescheduled_date: Optional[datetime] = Field(
        None, description="New scheduled date when status is 'Rescheduled'"
    )
    cancellation_reason: Optional[str] = Field(
        None, max_length=500, description="Optional reason for cancellation"
    )


class SessionDetailResponse(BaseModel):
    """Full session detail including participants and metadata."""
    session_id: int
    mentor_id: int
    mentor_name: Optional[str] = None
    mentee_id: int
    mentee_name: Optional[str] = None
    session_date: Optional[str] = None
    duration: int
    session_type: str
    meeting_platform: str
    interaction_frequency: int
    goal_category: Optional[str] = None
    status: str
    has_feedback: bool = False
    has_prediction: bool = False


class SessionListResponse(BaseModel):
    """Paginated session list."""
    total: int
    sessions: List[SessionDetailResponse]



# ==========================================
# Feedback Schemas (FR-04)
# ==========================================

class FeedbackSubmitRequest(BaseModel):
    """Payload for submitting mentee feedback after a completed session."""
    communication_score: float = Field(
        ..., ge=1.0, le=5.0, description="Communication quality (1.0 to 5.0)", example=4.5
    )
    goal_progress: float = Field(
        ..., ge=1.0, le=5.0, description="Goal progress achieved (1.0 to 5.0)", example=4.0
    )
    confidence_growth: float = Field(
        ..., ge=1.0, le=5.0, description="Confidence growth rating (1.0 to 5.0)", example=4.0
    )
    overall_rating: float = Field(
        ..., ge=1.0, le=5.0, description="Overall satisfaction rating (1.0 to 5.0)", example=4.5
    )
    comments: Optional[str] = Field(
        None, max_length=1000, description="Optional written qualitative feedback", example="Extremely valuable technical guidance and roadmap planning."
    )


class FeedbackResponse(BaseModel):
    """Feedback evaluation detail."""
    feedback_id: int
    session_id: int
    communication_score: float
    goal_progress: float
    confidence_growth: float
    overall_rating: float
    comments: Optional[str] = None
    submitted_at: Optional[str] = None

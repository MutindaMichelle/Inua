"""
INUA Platform: Pydantic Data Models & API Contracts
Author: Michelle (Final Year Project - BICS Year 4, Strathmore University)
Use Case: U-CS 5 (session-value) — Career Mentor OS
"""

from datetime import datetime
from typing import List, Optional, Literal, Dict, Any
from pydantic import BaseModel, Field


# ==========================================
# U-CS 5 Platform Grader Contract Schemas
# ==========================================

class UCS5PredictRequest(BaseModel):
    """
    Platform Grader Contract for U-CS 5 (session-value):
    in : { "menteeId": "...", "mentorId": "...", "leadTimeHours": 0, "hasAgenda": false, "isFirstSession": true }
    """
    menteeId: Optional[str] = Field("...", description="Mentee identifier")
    mentorId: Optional[str] = Field("...", description="Mentor identifier")
    leadTimeHours: int = Field(0, ge=0, description="Hours between booking and scheduled start")
    hasAgenda: bool = Field(False, description="Whether an agenda was submitted beforehand")
    isFirstSession: bool = Field(True, description="Whether this is the pair's initial meeting")
    method: Optional[str] = Field(None, description="Optional override ('baseline' or 'xgboost')")
    model_config = {"extra": "allow"}


class UCS5PredictResponse(BaseModel):
    """
    Platform Grader Contract for U-CS 5 (session-value):
    out: { "probability": 0.0, "factors": [], "suggestedIntervention": "...", "isSynthetic": true, "method": "xgboost" }
    """
    probability: float = Field(..., description="Predicted effectiveness probability [0.0, 1.0]")
    factors: List[str] = Field(default_factory=list, description="Top driving factors with signed contributions")
    suggestedIntervention: str = Field(..., description="Actionable pre-session intervention")
    isSynthetic: bool = Field(True, description="Synthetic data compliance flag")
    method: str = Field("xgboost", description="Inference method ('baseline' or 'xgboost')")
    model_config = {"extra": "allow"}


# ==========================================
# INUA Pre-Session & Legacy Prediction Schemas
# ==========================================

class MentorshipSessionInput(BaseModel):
    """Input payload representing a mentorship interaction (pre-session features prioritized)."""
    leadTimeHours: Optional[int] = Field(
        None, ge=0, le=720, description="Hours between booking and scheduled session start", example=48
    )
    hasAgenda: Optional[bool] = Field(
        None, description="Whether a session agenda was submitted beforehand", example=True
    )
    isFirstSession: Optional[bool] = Field(
        None, description="Whether this is the pair's initial meeting", example=False
    )
    career_stage: Literal["Year1", "Year2", "Year3", "Year4", "Graduate", "EarlyCareer"] = Field(
        "Year4", description="Mentee academic or professional progression stage", example="Year4"
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
    ] = Field("Computer Science", description="Undergraduate field of study", example="Computer Science")
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
    ] = Field("Software Engineering", description="Target career interest", example="Software Engineering")
    prior_sessions: int = Field(
        3, ge=0, le=20, description="Count of prior mentorship encounters (historical_interaction_frequency)", example=3
    )
    mentor_experience_years: int = Field(
        8, ge=1, le=40, description="Mentor years of industry experience", example=8
    )
    mentor_industry: str = Field("Technology", description="Mentor industry sector", example="Technology")
    mentor_specialization: str = Field(
        "Backend Engineering", description="Mentor specific domain focus", example="Backend Engineering"
    )
    mentor_availability: Literal["High", "Medium", "Low"] = Field(
        "High", description="Mentor availability band", example="High"
    )
    session_type: Literal[
        "Career Guidance",
        "CV Review",
        "Interview Preparation",
        "Technical Coaching",
        "Networking",
    ] = Field("Interview Preparation", description="Mentorship intervention type", example="Interview Preparation")
    session_duration_minutes: Optional[int] = Field(
        60, ge=15, le=180, description="Planned session duration in minutes", example=65
    )
    attendance_status: Optional[Literal["Attended", "Rescheduled", "Cancelled"]] = Field(
        "Attended", description="Legacy status field (excluded from ML feature vector X)", example="Attended"
    )
    meeting_platform: Literal["Teams", "Zoom", "Meet", "Physical"] = Field(
        "Teams", description="Platform modality", example="Teams"
    )
    goal_category: Literal[
        "Internship",
        "Portfolio Development",
        "Technical Skills",
        "Career Transition",
        "Leadership",
        "Research",
    ] = Field("Internship", description="Stated session learning objective", example="Internship")
    career_support_score: Optional[int] = Field(
        4, ge=1, le=5, description="Post-session construct (excluded from ML feature vector X)", example=4
    )
    psychosocial_support_score: Optional[int] = Field(
        4, ge=1, le=5, description="Post-session construct (excluded from ML feature vector X)", example=4
    )
    communication_quality: Optional[int] = Field(
        4, ge=1, le=5, description="Post-session construct (excluded from ML feature vector X)", example=5
    )
    goal_progress_score: Optional[int] = Field(
        4, ge=1, le=5, description="Post-session construct (excluded from ML feature vector X)", example=4
    )
    confidence_growth_score: Optional[int] = Field(
        4, ge=1, le=5, description="Post-session construct (excluded from ML feature vector X)", example=4
    )
    mentor_responsiveness_score: Optional[int] = Field(
        4, ge=1, le=5, description="Post-session construct (excluded from ML feature vector X)", example=5
    )


MODEL_CHOICES = Literal["XGBoost", "Random Forest", "AdaBoost", "Decision Tree", "Heuristic Baseline"]


class SessionPredictionRequest(MentorshipSessionInput):
    """Payload for single session prediction with optional model selector."""
    model_name: Optional[MODEL_CHOICES] = Field(
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
    isSynthetic: bool = Field(True, description="Synthetic data compliance flag")


class BatchPredictionRequest(BaseModel):
    """Payload for multiple session predictions."""
    sessions: List[MentorshipSessionInput]
    model_name: Optional[MODEL_CHOICES] = "XGBoost"


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


class UserProfileUpdateRequest(BaseModel):
    """Payload for updating a mentee or mentor user profile."""
    name: Optional[str] = Field(None, min_length=2, max_length=120)
    university: Optional[str] = Field(None, max_length=150)
    career_stage: Optional[Literal["Year1", "Year2", "Year3", "Year4", "Graduate", "EarlyCareer"]] = None
    career_interest: Optional[str] = Field(None, max_length=100)
    experience_years: Optional[float] = Field(None, ge=0.5, le=50.0)
    industry: Optional[str] = Field(None, max_length=100)
    expertise: Optional[str] = Field(None, max_length=150)


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
# Goal Progression Schemas
# ==========================================

class GoalCreateRequest(BaseModel):
    goal_title: str = Field(..., min_length=3, max_length=255, example="Complete AWS Solutions Architect Associate lab")
    progress_percentage: int = Field(0, ge=0, le=100, example=25)


class GoalUpdateRequest(BaseModel):
    goal_title: Optional[str] = Field(None, min_length=3, max_length=255)
    progress_percentage: Optional[int] = Field(None, ge=0, le=100)


class GoalResponse(BaseModel):
    goal_id: int
    mentee_id: int
    goal_title: str
    progress_percentage: int
    created_at: Optional[str] = None


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


# ==========================================
# Prediction Schemas (FR-05, FR-06, IR-02)
# ==========================================

class PredictionCreateRequest(BaseModel):
    """Payload to trigger an effectiveness prediction for a session or raw features."""
    session_id: Optional[int] = Field(
        None, description="ID of existing session to evaluate and save prediction for", example=1
    )
    model_name: Optional[MODEL_CHOICES] = Field(
        "XGBoost", description="Ensemble classifier to use for inference"
    )
    session_features: Optional[MentorshipSessionInput] = Field(
        None, description="Optional manual feature overrides"
    )


class StoredPredictionResponse(BaseModel):
    """Database entity representation of a prediction record."""
    prediction_id: int
    session_id: int
    effectiveness_label: str
    probability: float
    model_version: str
    predicted_at: Optional[str] = None


class PredictionDetailResponse(BaseModel):
    """Comprehensive prediction outcome including explanations and recommendations."""
    prediction_id: Optional[int] = None
    session_id: Optional[int] = None
    prediction: int = Field(..., description="1 = Effective, 0 = Ineffective")
    status: str = Field(..., description="'Effective' or 'Ineffective / Needs Intervention'")
    effectiveness_probability: float
    model_used: str
    recommendation: str
    risk_factors: List[str] = []
    feature_contributions: List[dict] = []
    predicted_at: Optional[str] = None


# ==========================================
# Mentor Quality & Admin Analytics (FR-07, FR-08)
# ==========================================

class MentorQualityProfileResponse(BaseModel):
    """Longitudinal mentor performance and feedback summary (FR-07)."""
    mentor_id: int
    name: str
    email: str
    industry: str
    expertise: str
    experience_years: float
    is_verified: bool
    total_sessions: int
    completed_sessions: int
    unique_mentees_count: int
    average_communication_score: float
    average_goal_progress: float
    average_confidence_growth: float
    average_overall_rating: float
    total_feedback_count: int
    effective_sessions_count: int
    effectiveness_rate_percentage: float
    aggregate_effectiveness_score: float
    recent_comments: List[str] = []
    last_update: Optional[str] = None


class AdminAnalyticsOverviewResponse(BaseModel):
    """Platform-wide system analytics and health statistics (FR-08)."""
    total_users: int
    users_by_role: Dict[str, int]
    total_sessions: int
    sessions_by_status: Dict[str, int]
    total_feedback_entries: int
    total_predictions: int
    predictions_breakdown: Dict[str, int]
    average_platform_satisfaction: float
    average_communication_score: float
    average_goal_progress: float
    average_confidence_growth: float
    active_mentors_count: int
    active_mentees_count: int
    top_performing_mentors: List[Dict[str, Any]] = []

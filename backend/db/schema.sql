-- =============================================================================
-- INUA Mentorship Platform: Physical PostgreSQL Database Schema
-- Project: INUA – Intelligent Mentorship Effectiveness Analytics & Matching Platform
-- Author: Michelle (Final Year Project - BICS Year 4, Strathmore University)
-- References: Database Schema.png, ERD.drawio.png, 1_class_diagram.png
-- Milestone: Week 1 (feat(db))
-- =============================================================================

-- Drop tables in reverse topological order if rebuilding
DROP TABLE IF EXISTS mentor_quality_profiles CASCADE;
DROP TABLE IF EXISTS predictions CASCADE;
DROP TABLE IF EXISTS feedback CASCADE;
DROP TABLE IF EXISTS goals CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS mentors CASCADE;
DROP TABLE IF EXISTS mentees CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- -----------------------------------------------------------------------------
-- 1. USERS TABLE (Core authentication and actor identity)
-- -----------------------------------------------------------------------------
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL CHECK (role IN ('mentee', 'mentor', 'administrator')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- -----------------------------------------------------------------------------
-- 2. MENTEES TABLE (Extends User entity for undergraduate/alumni mentees)
-- -----------------------------------------------------------------------------
CREATE TABLE mentees (
    mentee_id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    university VARCHAR(150) NOT NULL DEFAULT 'Strathmore University',
    career_stage VARCHAR(50) NOT NULL,
    career_interest VARCHAR(100) NOT NULL
);

CREATE INDEX idx_mentees_user_id ON mentees(user_id);
CREATE INDEX idx_mentees_career_interest ON mentees(career_interest);

-- -----------------------------------------------------------------------------
-- 3. MENTORS TABLE (Extends User entity for industry & academic mentors)
-- -----------------------------------------------------------------------------
CREATE TABLE mentors (
    mentor_id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    experience_years FLOAT NOT NULL DEFAULT 1.0,
    industry VARCHAR(100) NOT NULL,
    expertise VARCHAR(150) NOT NULL,
    is_verified BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_mentors_user_id ON mentors(user_id);
CREATE INDEX idx_mentors_industry ON mentors(industry);

-- -----------------------------------------------------------------------------
-- 4. SESSIONS TABLE (Represents 1:N interaction dyads between mentor and mentee)
-- -----------------------------------------------------------------------------
CREATE TABLE sessions (
    session_id SERIAL PRIMARY KEY,
    mentor_id INTEGER NOT NULL REFERENCES mentors(mentor_id) ON DELETE CASCADE,
    mentee_id INTEGER NOT NULL REFERENCES mentees(mentee_id) ON DELETE CASCADE,
    session_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration INTEGER NOT NULL DEFAULT 60,
    session_type VARCHAR(100) NOT NULL DEFAULT 'Interview Preparation',
    meeting_platform VARCHAR(50) NOT NULL DEFAULT 'Teams',
    interaction_frequency INTEGER NOT NULL DEFAULT 1,
    goal_category VARCHAR(100) DEFAULT 'Career Guidance',
    career_support_score FLOAT,
    psychosocial_score FLOAT,
    status VARCHAR(50) NOT NULL DEFAULT 'Scheduled' 
        CHECK (status IN ('Pending', 'Scheduled', 'Completed', 'Cancelled', 'Rescheduled'))
);

CREATE INDEX idx_sessions_mentor_id ON sessions(mentor_id);
CREATE INDEX idx_sessions_mentee_id ON sessions(mentee_id);
CREATE INDEX idx_sessions_date ON sessions(session_date);
CREATE INDEX idx_sessions_status ON sessions(status);

-- -----------------------------------------------------------------------------
-- 5. GOALS TABLE (Tracks mentee developmental objectives and progress)
-- -----------------------------------------------------------------------------
CREATE TABLE goals (
    goal_id SERIAL PRIMARY KEY,
    mentee_id INTEGER NOT NULL REFERENCES mentees(mentee_id) ON DELETE CASCADE,
    goal_title VARCHAR(255) NOT NULL,
    progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_goals_mentee_id ON goals(mentee_id);

-- -----------------------------------------------------------------------------
-- 6. FEEDBACK TABLE (Post-session multi-criteria evaluation submitted by mentee)
-- -----------------------------------------------------------------------------
CREATE TABLE feedback (
    feedback_id SERIAL PRIMARY KEY,
    session_id INTEGER UNIQUE NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
    communication_score FLOAT NOT NULL CHECK (communication_score BETWEEN 1.0 AND 5.0),
    goal_progress FLOAT NOT NULL CHECK (goal_progress BETWEEN 1.0 AND 5.0),
    confidence_growth FLOAT NOT NULL CHECK (confidence_growth BETWEEN 1.0 AND 5.0),
    overall_rating FLOAT NOT NULL CHECK (overall_rating BETWEEN 1.0 AND 5.0),
    comments TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_feedback_session_id ON feedback(session_id);

-- -----------------------------------------------------------------------------
-- 7. PREDICTIONS TABLE (AI inference output produced per evaluated session)
-- -----------------------------------------------------------------------------
CREATE TABLE predictions (
    prediction_id SERIAL PRIMARY KEY,
    session_id INTEGER UNIQUE NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
    effectiveness_label VARCHAR(50) NOT NULL,
    probability FLOAT NOT NULL CHECK (probability BETWEEN 0.0 AND 1.0),
    model_version VARCHAR(50) NOT NULL DEFAULT 'XGBoost_v1.0',
    predicted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_predictions_session_id ON predictions(session_id);

-- -----------------------------------------------------------------------------
-- 8. MENTOR_QUALITY_PROFILES TABLE (Aggregated longitudinal performance metrics)
-- -----------------------------------------------------------------------------
CREATE TABLE mentor_quality_profiles (
    mentor_id INTEGER PRIMARY KEY REFERENCES mentors(mentor_id) ON DELETE CASCADE,
    aggregate_effectiveness_score FLOAT NOT NULL DEFAULT 0.0,
    total_sessions INTEGER NOT NULL DEFAULT 0,
    last_update TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

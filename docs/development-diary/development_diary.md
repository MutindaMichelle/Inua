# INUA Development Diary & Engineering Log

**Project Title:** Supporting Career Mentorship Outcomes Among University Students and Early-Career Professionals in Kenya: An XGBoost-Based System for Predicting Session Effectiveness  
**Student:** Mutinda Michelle Mutio (Admission No. 154727)  
**Programme:** Bachelor of Business Information Technology / Computer Science (BICS Year 4)  
**Institution:** Strathmore University, School of Computing and Engineering Sciences  
**Supervisor:** Dr. Dickson Owuor  
**Repository:** [https://github.com/MutindaMichelle/Inua](https://github.com/MutindaMichelle/Inua)  
**Current Milestone:** Backend MVP (Milestone 1 — Issues #1 to #4 Closed)  

---

## 1. Executive Summary & Purpose

This Development Diary serves as the authoritative chronological log of technical developments, architectural choices, empirical research integrations, and milestones achieved for the INUA Capstone Project.

It is structured so that any supervisor, internal assessor, or external examiner can:
1. Understand the theoretical motivation behind each component.
2. Track tangible development progression against course milestones.
3. Follow exact, reproducible terminal instructions to run and evaluate the system independently.

---

## 2. Chronological Development Log

### Phase 1: Theoretical Framing & Synthetic Dataset Architecture (Sprint 1)
* **Problem Addressed:** Real-world university mentorship logs are heavily protected under student data privacy regulations (Kenya Data Protection Act 2019 Section 25, FERPA). Empirical student datasets at Kenyan universities were unavailable.
* **Theoretical Solution:** Designed a research-grounded synthetic dataset generator (2,000 sessions) guided by:
  * **Kram's Mentoring Theory (1985):** Separates mentoring into *instrumental career support* (sponsorship, exposure, skill coaching) and *psychosocial support* (counseling, friendship, role-modeling).
  * **Bandura's Social Cognitive Theory (1997):** Models post-session mentee *confidence growth* (self-efficacy).
  * **Allen et al. (2004):** Quantifies logarithmic returns of mentor experience years on career support:
    $$\mu_{\text{career\_support}} = 1.8 + 0.95 \cdot \ln(\text{mentor\_experience\_years} + 1)$$
* **Artifacts Created:**
  * `ml/data/data_dictionary.md`: Authoritative Data Dictionary v1.0 locking all 22 features, distributions, and domain boundaries.
  * `ml/scripts/dataset_generator.py` and `ml/generate_dataset.py`: Reproducible generator using global PRNG seed `42`.
  * `ml/data/inua_mentorship_dataset.csv`: 2,000-session ground-truth dataset (60% effective, 40% ineffective/disrupted).
  * `ml/notebooks/01_data_generation.ipynb`: Interactive Jupyter practical lab.

---

### Phase 2: Exploratory Data Analysis & Statistical Modeling (Sprint 2)
* **Problem Addressed:** Raw data required rigorous statistical validation to confirm realistic variances, feature correlations, and absent collinearity prior to model training.
* **Work Executed:**
  * Created `ml/notebooks/02_exploratory_analysis.ipynb`.
  * Generated publication-quality figures at 300 DPI stored in `ml/figures/`:
    * `figure_4_1_career_stage_distribution.png`: Student stage demographics across undergraduate years.
    * `figure_4_2_field_of_study.png`: Academic discipline proportions (Computer Science, Engineering, Business, etc.).
    * `figure_4_3_session_type.png`: Frequency distribution of session typologies.
    * `figure_4_4_mentor_exp_vs_career_support.png`: Empirical logarithmic curve validation.
    * `figure_4_5_duration_by_session_type.png`: Truncated normal distribution boxplots.
    * `figure_4_6_correlation_heatmap.png`: Kram correlation matrix.
    * `figure_4_7_target_class_distribution.png`: Binary label distribution.
  * Exported summary statistics: `table_4_1_missing_values.csv`, `table_4_2_numerical_summary.csv`, and `table_4_3_categorical_summary.csv` for Chapter 4 of the dissertation.

---

### Phase 3: Machine Learning Pipeline, Cross-Validation & Diagnostics (Sprint 3)
* **Problem Addressed:** Avoid data leakage and compare multiple classification algorithms using rigorous validation.
* **Leakage Prevention:**
  * Explicitly dropped `session_id` (arbitrary identifier).
  * Explicitly dropped `effectiveness_index` (latent outcome proxy).
  * Scalers (`StandardScaler`) and encoders (`OneHotEncoder`) fitted strictly on training fold (80%) and applied to test fold (20%).
* **Algorithms Evaluated (5-Fold Stratified Cross-Validation):**
  * **AdaBoost Classifier:** 94.2% Accuracy, 0.985 ROC-AUC
  * **Random Forest Classifier:** 96.7% Accuracy, 0.994 ROC-AUC
  * **XGBoost Classifier (Champion):** **96.8% Accuracy**, **0.995 ROC-AUC**, 0.969 Precision, 0.968 Recall
* **Artifacts Persisted in `ml/saved_models/`:**
  * `xgboost_model.pkl`, `random_forest.pkl`, `adaboost.pkl`, `preprocessor.pkl`, `feature_metadata.pkl`.
* **Diagnostic Figures:** ROC curves (`figure_4_9_roc_curves.png`), Confusion Matrices (`figure_4_8_confusion_matrices.png`), and Feature Importance (`figure_4_10_feature_importances.png`).
* **Academic Defense Analysis:** Confirmed absence of overfitting (generalization gap between train and CV test was $< 2.5\%$, tree depth regularized at `max_depth=4`). Documented algorithmic basis of XGBoost training speed (histogram binning, sparsity-aware split finding).

---

### Phase 4: Local Per-Prediction Feature Explanations (Issue #2 / NFR-05 — CLOSED)
* **Problem Addressed:** The initial implementation returned static global feature importances, meaning every session showed the same top features regardless of whether it succeeded or failed. Non-Functional Requirement NFR-05 mandates explaining what drove *this specific session*.
* **Solution Implemented:**
  * Upgraded `ml/predict.py` and `ml/scripts/predict.py` with **TreeSHAP local feature attribution** using `xgboost.DMatrix` with `pred_contribs=True`.
  * Returns exact log-odds contributions for every input feature.
  * Dropped `mentor_experience_level_encoded` which duplicated `mentor_experience_years` and contributed zero gain.
* **Empirical Verification:**
  * **Strong Session:** Top drivers were `goal_progress_score (+1.58)`, `confidence_growth_score (+1.34)`, `communication_quality (+1.18)`.
  * **Weak Session:** Top friction points were `goal_progress_score (-1.69)`, `confidence_growth_score (-1.58)`, `communication_quality (-0.79)`.
  * Passed automated unit test: `ml/tests/test_predict.py`.

---

### Phase 5: Relational Database Schema & Seeding (Issue #3 / feat(db) — CLOSED)
* **Problem Addressed:** Transform the system analysis diagrams (`Database Schema.png`, `ERD.drawio.png`, `1_class_diagram.png`) into a physical PostgreSQL schema and SQLAlchemy 2.0 ORM data layer.
* **Deliverables Implemented:**
  1. `backend/db/schema.sql`: Pure PostgreSQL DDL migration defining all **8 tables**:
     * `users`: Core credentials and RBAC (`role IN ('mentee', 'mentor', 'administrator')`).
     * `mentees`: University, academic level, and career interest.
     * `mentors`: Experience years, industry, expertise, verification status.
     * `sessions`: Dyadic interaction logs, duration, status constraints (`Scheduled`, `Completed`, `Cancelled`, `Rescheduled`).
     * `goals`: Mentee milestone tracking and percentage progress (0–100%).
     * `feedback`: Likert evaluations (communication, goal progress, confidence growth, overall rating).
     * `predictions`: AI inference outcomes, confidence probability, and model version.
     * `mentor_quality_profiles`: Aggregated longitudinal mentor ratings.
     * Foreign keys configured with `ON DELETE CASCADE` and B-Tree indexes on query keys.
  2. `backend/models/database.py`: SQLAlchemy 2.0 declarative models with bidirectional relationships (`relationship()`).
  3. `backend/db/session.py`: Dual connection manager supporting production PostgreSQL via `DATABASE_URL` with automatic local SQLite (`inua.db`) fallback for zero-configuration testing.
  4. `backend/db/seed.py`: Automated idempotent seed script populating 1 Admin, 4 Mentors (Safaricom, Microsoft ADC, Equity Bank), 4 Mentees (including Michelle Mutinda), 7 Goals, 8 Sessions, Feedback, Predictions, and Quality Profiles using salted `bcrypt` password hashes (`Password123!`).
  5. `backend/tests/test_db.py`: Automated integration test verifying table creation, foreign keys, cascades, and data integrity.

---

### Phase 6: FastAPI Application Scaffold & Service Layer (Issue #4 / feat(backend) — CLOSED)
* **Problem Addressed:** Provide a modular REST API application structure connecting client interfaces, database entities, and ML inference services.
* **Deliverables Implemented:**
  * `backend/app/main.py`: FastAPI entrypoint with lifespan events pre-warming models on startup and auto-initializing database tables.
  * `backend/app/config.py`: Centralized environment configuration with CORS policies.
  * `backend/routes/predict.py`: Inference route handling single and batch evaluations.
  * `backend/routes/analytics.py`: Exposing model comparison tables and dissertation figures.
  * `backend/routes/health.py`: Healthcheck endpoint reporting active model statuses.
  * `backend/services/ml_service.py`: Encapsulated inference service propagating TreeSHAP explanations.
  * `backend/tests/test_api.py`: Automated test suite covering all endpoints (**100% PASS**).

---

### Phase 7: Repository Alignment, Branch Protection & Clean Commit (Issue #1 / chore — CLOSED)
* **Work Executed:**
  * Pruned legacy, conflicting 78% model artifacts from `ml/models/`.
  * Cleaned `design/diagrams/` to retain only the 5 authoritative PNG architecture diagrams.
  * Updated `design/wireframes/` to include all 13 high-fidelity PNG interface wireframes.
  * Configured GitHub **Branch Protection** on `main` via GitHub API requiring pull request reviews.
  * Successfully committed and pushed clean codebase to GitHub `origin/main` (commit `2b75eb8`).
  * Closed Issues **#1**, **#2**, **#3**, and **#4** on GitHub.

---

### Phase 8: Authentication, JWT Bearer Token Issuance & Role-Based Access Control (Issue #5 / FR-01, IR-01, NFR-02 — COMPLETED & VERIFIED)
* **Branch:** `5-featbackend-implement-authregister-and-authlogin-fr-01`
* **Problem Addressed:** Implement secure registration and authentication across the three system personas (`mentee`, `mentor`, `administrator`) with salted password hashing, JWT token issuance (IR-01), and Role-Based Access Control (RBAC) route guarding (NFR-02).
* **Deliverables Implemented:**
  1. `backend/services/auth_service.py`:
     * Password hashing and verification via salted `bcrypt`.
     * Token creation and decoding via `pyjwt` with HS256 signing and expiration validation.
     * FastAPI security dependency `get_current_user` resolving the authenticated User from the Bearer token or raising `401 Unauthorized`.
     * RBAC dependency factory `require_roles(*roles)` enforcing role authorization or raising `403 Forbidden`.
  2. `backend/models/schemas.py`: Added `UserRegisterRequest`, `UserLoginRequest`, `UserResponse`, and `TokenResponse`.
  3. `backend/routes/auth.py`:
     * `POST /api/v1/auth/register`: Atomic registration of User credentials and linked specialization profile (`Mentee` or `Mentor`). Enforces email uniqueness (`409 Conflict`) and role-specific profile requirements (`422 Unprocessable Content`).
     * `POST /api/v1/auth/login`: Authenticates credentials against bcrypt hash and issues 24-hour JWT Bearer token.
     * `GET /api/v1/auth/me`: Retrieves current authenticated user profile.
     * Role-protected test routes (`/mentee-only`, `/mentor-only`, `/admin-only`) demonstrating NFR-02 role isolation.
  4. `backend/app/main.py`: Mounted `auth_router` under prefix `/api/v1`.
  5. `backend/tests/test_auth.py`: 14 automated assertions covering registration, login, token issuance, credential rejection, and RBAC enforcement (**100% PASS**).

---

### Phase 9: Session Booking, Lifecycle State Machine & Humanistic UI (Issue #6 / FR-02, FR-03 — CLOSED & MERGED)
* **Branch:** `feat/sessions` (Merged into `main` via commit `cd23cfc`)
* **Problem Addressed:** Allow mentees to discover verified mentors, book structured mentorship slots with automatic temporal conflict detection, and manage session status transitions.
* **Deliverables Implemented:**
  1. `backend/services/session_service.py`:
     * Overlap conflict detection rejecting conflicting schedules for both mentor and mentee (`409 Conflict`).
     * Permitted status transitions enforcement (`Scheduled` -> `Completed`, `Cancelled`, `Rescheduled`; terminal states validation).
     * Dyadic interaction frequency counter updating with each booking.
  2. `backend/routes/mentors.py` & `backend/routes/sessions.py`:
     * `GET /api/v1/mentors`: Public directory filtered by industry/expertise.
     * `POST /api/v1/sessions/book`: Mentee session booking.
     * `GET /api/v1/sessions`: Role-filtered sessions listing.
     * `PATCH /api/v1/sessions/{id}/status`: Lifecycle transitions with optional reschedule conflict validation.
  3. `frontend/index.html`: Completely redesigned humanistic dashboard in warm sage green, featuring responsive booking forms, status timeline, and one-click demo credentials.
  4. `backend/tests/test_sessions.py`: 37 automated test assertions (**100% PASS**).

---

### Phase 10: Post-Session Mentee Feedback Submission (Issue #7 / FR-04 — CLOSED & MERGED)
* **Branch:** `feat/feedback` (PR #20 merged into `main` via commit `7e1c135`, Issue #7 closed)
* **Problem Addressed:** Implement mentee evaluation ratings and qualitative reflections following a completed mentorship session.
* **Deliverables Implemented:**
  1. `backend/services/feedback_service.py`:
     * Pre-condition enforcement: only the assigned mentee can submit feedback and the session status must be `Completed` (`422 Unprocessable Content` if not completed, `403 Forbidden` if caller is not the mentee).
     * Duplicate feedback prevention enforcing one evaluation per session (`409 Conflict`).
  2. `backend/routes/feedback.py`:
     * `POST /api/v1/sessions/{session_id}/feedback`: Submits Likert scores (communication, goal progress, confidence growth, overall rating) and optional qualitative reflections.
     * `GET /api/v1/sessions/{session_id}/feedback`: Retrieves evaluation records with access restrictions (mentee, mentor, administrator).
  3. `backend/models/schemas.py`: Added `FeedbackSubmitRequest` and `FeedbackResponse` with 1.0 to 5.0 range validation.
  4. `frontend/index.html`: Added interactive 'Give Feedback' modal and 'View Feedback' score card to session cards.
  5. `backend/tests/test_feedback.py`: 20 automated assertions (**100% PASS**). Total backend assertions: **76/76 PASS**.

---

### Phase 11: Machine Learning Prediction Pipeline & TreeSHAP Local Attributions (Issue #8 / FR-05, FR-06, IR-02 — CLOSED & MERGED)
* **Branch:** `feat/predictions` (PR #21 merged into `main` via commit `9ad52d5`, Issue #8 closed)
* **Problem Addressed:** Connect trained ML models (XGBoost, Random Forest, AdaBoost) to a dedicated `/predictions` endpoint, evaluate session data, generate per-prediction TreeSHAP local explanations (NFR-05), and persist predictions in the relational schema.
* **Deliverables Implemented:**
  1. `backend/services/prediction_service.py`:
     * `build_session_features`: Constructs the complete 18-feature input payload from dyad records (mentee, mentor, session, feedback).
     * `predict_and_store_session`: Executes ML inference, computes probability, extracts top 5 TreeSHAP local feature attributions, and stores record in `predictions` table.
     * Role-based access validation for prediction retrieval.
  2. `backend/routes/predictions.py`:
     * `POST /api/v1/predictions`: Evaluates session by `session_id` (with DB persistence) or raw features (stateless).
     * `GET /api/v1/predictions`: Role-filtered prediction history (mentee, mentor, administrator).
     * `GET /api/v1/predictions/{id}`: Direct prediction lookup.
     * `GET /api/v1/sessions/{id}/prediction`: Dyad session outcome lookup.
  3. `backend/routes/feedback.py`: Automated pipeline trigger evaluating session effectiveness upon feedback submission.
  4. `backend/models/schemas.py`: Added `PredictionCreateRequest`, `StoredPredictionResponse`, and `PredictionDetailResponse`.
  5. `frontend/index.html`: Interactive 'View AI Diagnosis' modal displaying effectiveness status, confidence meter, recommendation, and signed TreeSHAP feature drivers.
  6. `backend/tests/test_predictions.py`: 34 automated assertions (**100% PASS**). Total backend suite: **110/110 PASS**.

---

### Phase 12: Mentor Quality Profiles & Administrator Analytics (Issue #9 / FR-07, FR-08 — PR #22 OPEN)
* **Branch:** `feat/9-mentor-quality-admin-analytics` (Pull Request #22 linked to Issue #9)
* **Problem Addressed:** Implement mentor longitudinal quality profiles based on completed sessions, student feedback, and AI evaluations, and provide platform-wide analytics for system administrators.
* **Deliverables Implemented:**
  1. `backend/services/mentor_quality_service.py`:
     * `compute_mentor_quality`: Longitudinal metrics including total and completed session volume, unique mentees guided, Likert rating averages (communication, goal progress, confidence, overall rating), and updates `mentor_quality_profiles` table.
     * `compute_all_mentor_profiles`: Ranked list of all verified mentor performance profiles.
     * `compute_admin_analytics_overview`: System-wide aggregations across user cohorts, session statuses, feedback satisfaction, and prediction distributions.
  2. `backend/routes/mentors.py`:
     * `GET /api/v1/mentors/{mentor_id}/quality`: Individual mentor quality profile (FR-07).
     * `GET /api/v1/mentors/quality-profiles`: Full verified mentor quality rankings directory.
  3. `backend/routes/analytics.py`:
     * `GET /api/v1/analytics/admin/overview`: System-wide statistics strictly guarded by `require_roles('administrator')` (FR-08).
     * `GET /api/v1/analytics/admin/mentors`: Full mentor audit rankings for administrators.
  4. `backend/models/schemas.py`: Added `MentorQualityProfileResponse` and `AdminAnalyticsOverviewResponse`.
  5. `backend/tests/test_analytics_admin.py`: 29 automated assertions (**100% PASS**). Total backend test suite: **139/139 PASS**.

---

## 3. How to Run & Verify the Project (Examiner & Reviewer Guide)

Follow these steps from a terminal to run and verify every layer of the system:

### Prerequisites
* Python 3.10+ (tested on Python 3.14 on Windows)
* Git

```bash
# Clone the repository
git clone https://github.com/MutindaMichelle/Inua.git
cd Inua
```

---

### Step 1: Run the Machine Learning Pipeline Tests
Verify that the 2,000-session dataset schema, data leakage guards, and TreeSHAP per-prediction attributions are functioning:

```powershell
# Run the pipeline validation test
python ml/tests/test_pipeline.py

# Run the TreeSHAP local attribution test
python ml/tests/test_predict.py
```
*Expected Output:* Both test suites exit with `[PASS]` and confirm that strong and weak sessions generate opposite feature contribution polarities.

---

### Step 2: Test Real-Time Single-Session Inference
Run the standalone inference module:

```powershell
python ml/predict.py
```
*Expected Output:* Displays classification outcomes (Effective vs. Ineffective) and the top contributing features for both sample sessions.

---

### Step 3: Initialize and Seed the Database
Generate the 8 relational tables and populate realistic Strathmore University mentorship records:

```powershell
python backend/db/seed.py
```
*Expected Output:*
```text
[SEED SUCCESS] Seeded 1 admin, 4 mentors, 4 mentees, 7 goals, 8 sessions (5 completed with feedback & predictions, 3 upcoming/pending), and 4 mentor quality profiles.
```

---

### Step 4: Run the Database Integrity Test Suite
Verify that all 8 tables, foreign keys, cascade deletes, and relationships are sound:

```powershell
python backend/tests/test_db.py
```
*Expected Output:*
```text
[TEST_DB] Discovered tables: ['feedback', 'goals', 'mentees', 'mentor_quality_profiles', 'mentors', 'predictions', 'sessions', 'users']
  [PASS] All 8 relational tables generated successfully.
  [PASS] Seeded entities verified (users=9, mentors=4, mentees=4).
  [PASS] Mentee relationships: Michelle has 3 goals and 3 sessions.
  [PASS] Cascade delete verification: deleting User automatically cascades to Mentee profile and Goals.
[ALL DATABASE SCHEMA & RELATIONSHIP TESTS PASSED!]
```

---

### Step 5: Launch the FastAPI REST Server
Start the backend server:

```powershell
python backend/run.py
```
* The server starts at `http://127.0.0.1:8000`.
* Open your browser to the interactive Swagger UI: **`http://127.0.0.1:8000/docs`**.
* Explore and test the live endpoints:
  * `GET /api/v1/health`
  * `GET /api/v1/predict/models`
  * `POST /api/v1/predict` (submits session features and returns classification + TreeSHAP explanations)
  * `GET /api/v1/analytics`

---

### Step 6: Run the Backend Integration Test Suite
While in the project root, run:

```powershell
python backend/tests/test_api.py
```
*Expected Output:*
```text
  [PASS] GET /api/v1/health
  [PASS] GET /api/v1/predict/models
  [PASS] POST /api/v1/predict (Effective Session)
  [PASS] POST /api/v1/predict (Ineffective Session & Risk Detection)
  [PASS] GET /api/v1/analytics (Comparison, Summary & Dissertation Figures)
[ALL TESTS PASSED SUCCESSFULLY!]
```

---

### Step 7: View the Interactive Frontend Prototype
Open `frontend/index.html` in any modern web browser:
```powershell
# Open prototype in default browser (Windows)
start frontend/index.html
```
Provides an interactive client dashboard demonstrating live parameter adjustment, real-time prediction scores, and risk factor diagnostics.

---

## 4. Current Milestone Status & Next Steps

### Issues Completed & Verified:
* [x] **#1 `chore: configure GitHub repository and project board`**
* [x] **#2 `feat(ml): per-prediction feature explanations (NFR-05)`**
* [x] **#3 `feat(db): create PostgreSQL schema from the logical schema`**
* [x] **#4 `feat(backend): scaffold FastAPI app, folder structure, config`**
* [x] **#5 `feat(backend): implement /auth/register and /auth/login (FR-01, IR-01, NFR-02)`** (PR #19 merged)
* [x] **#6 `feat(backend): implement session booking and status endpoints (FR-02, FR-03)`** (PR merged as cd23cfc)
* [x] **#7 `feat(backend): implement feedback submission endpoint (FR-04)`** (PR #20 merged as 7e1c135)
* [x] **#8 `feat(backend,ml): connect prediction model to /predictions endpoint (FR-05, FR-06, IR-02)`** (PR #21 merged as 9ad52d5)
* [x] **#9 `feat(backend): implement mentor quality profiles and admin analytics (FR-07, FR-08)`** (PR #22 open)

---

### Branching Strategy for Upcoming Issues:
In accordance with professional software engineering practice and course requirements, each remaining issue will be developed on a **distinct feature branch**, tested independently, and merged into `main` via Pull Request:

1. **Issue #10 (`test/10-integration-test-suite`)**:
   * End-to-end integration test suite.
4. **Issue #8 (`feat/prediction-pipeline-issue-8`)**:
   * Wire automated prediction inference to feedback submission (FR-05, FR-06, IR-02).
5. **Issue #9 (`feat/analytics-issue-9`)**:
   * Mentor quality profile aggregation and admin platform analytics (FR-07, FR-08).
6. **Issue #10 (`test/integration-issue-10`)**:
   * End-to-end integration test suite.


---

### Phase 13: End-to-End Integration Test Suite & Backend MVP Completion (Issue #10)

**Date:** 29 October 2026
**Branch:** `test/10-integration-core-api-workflows`
**Requirements Covered:** All FR-01 to FR-08, IR-01, IR-02, NFR-02 (Full end-to-end verification)

#### Problem Addressed
With all six feature endpoints individually unit-tested and merged, Milestone 1 required a final integration sweep proving that all API layers compose correctly end-to-end -- that a full mentee lifecycle (register -> discover mentor -> book session -> complete -> submit feedback -> trigger ML prediction -> inspect quality profile -> admin analytics) works as a coherent system, not merely as isolated units.

#### Engineering Work Executed

**1. Datetime Normalization Fix (`session_service.py`)**
- **Root cause:** `check_session_conflict()` compared incoming `start_time` (timezone-aware UTC from Pydantic ISO parsing) against `session_date` stored in SQLite (timezone-naive). Python raises `TypeError: can't compare offset-naive and offset-aware datetimes`.
- **Fix:** Added `_to_naive_utc(dt)` helper that strips `tzinfo` after converting to UTC, normalizing both sides of the comparison to naive UTC before `max(...) < min(...)` overlap check.
- **Files patched:** `backend/services/session_service.py` (both repos).

**2. Integration Test Suite (`backend/tests/test_integration_workflows.py`)**
Created a comprehensive 44-assertion, 8-stage end-to-end test script:

| Stage | Workflow Verified | Assertions |
|-------|-------------------|-----------|
| 1 | Persona Registration & Authentication (mentee, mentor, admin) | 8 |
| 2 | Mentor Discovery & Quality Profile Inspection | 3 |
| 3 | Session Booking, Conflict Prevention & Lifecycle Transitions | 6 |
| 4 | Post-Session Feedback Submission & Duplicate Prevention | 3 |
| 5 | Automated ML Prediction & TreeSHAP Explanations | 7 |
| 6 | Mentor Quality Profile Recalculation & Aggregation | 6 |
| 7 | Administrator Analytics & Strict RBAC Enforcement | 8 |
| 8 | Security, Boundary & Unauthorized Access Validations | 3 |
| **Total** | | **44/44** |

**3. Unified Test Runner (`backend/tests/run_all_tests.py`)**
Created a master test runner that sequentially executes all 7 test suites and produces a consolidated pass/fail summary. Final verified results:

```
Total Test Suites Executed : 7
Suites Passed              : 7
Suites Failed              : 0
ALL BACKEND MVP TEST SUITES PASSED WITH 100% SUCCESS!
```

#### Cumulative Test Coverage Across Milestone 1

| Test Suite | Requirements | Assertions |
|-----------|--------------|-----------|
| `test_api.py` | Scaffold & Health | 5 |
| `test_auth.py` | FR-01, IR-01, NFR-02 | 14 |
| `test_sessions.py` | FR-02, FR-03 | 37 |
| `test_feedback.py` | FR-04 | 20 |
| `test_predictions.py` | FR-05, FR-06, IR-02 | 34 |
| `test_analytics_admin.py` | FR-07, FR-08 | 29 |
| `test_integration_workflows.py` | End-to-End (all FRs) | 44 |
| **Grand Total** | | **183 assertions** |

#### Milestone 1 -- Backend MVP: COMPLETE

All 10 issues closed. All 8 functional requirements (FR-01 to FR-08) implemented, tested, and verified. All integration requirements (IR-01, IR-02) satisfied. NFR-02 (RBAC) enforced end-to-end across all endpoints.

#### Completed Issues -- Milestone 1 Branch Map:
1. Issue #5 (`feat/5-featbackend-implement-authregister-and-authlogin`) -> PR #19 merged (2271a1e)
2. Issue #6 (`feat/sessions`) -> PR merged (cd23cfc)
3. Issue #7 (`feat/feedback`) -> PR #20 merged (7e1c135)
4. Issue #8 (`feat/predictions`) -> PR #21 merged (9ad52d5)
5. Issue #9 (`feat/9-mentor-quality-admin-analytics`) -> PR #22 merged (c944338)
6. Issue #10 (`test/10-integration-core-api-workflows`) -> PR #23 merged (Milestone 1 Complete)


---

### Phase 14: React SPA — Full Frontend Implementation (Milestone 2 / Working Prototype)

**Date:** 5 November 2026
**Branch:** `feat/frontend-working-prototype`
**Requirements Covered:** All FR-01 to FR-08 exposed through browser UI; Milestone 2 (Working Prototype)

#### Problem Addressed
Milestone 1 delivered a fully-tested REST API. Milestone 2 requires a browser-navigable prototype where all three user personas (mentee, mentor, administrator) can complete their full workflows end-to-end without touching Swagger UI.

#### Engineering Work Executed

**1. Application Root & Router (`src/App.jsx`)**
- Wraps the entire tree in `<AuthProvider>` and `<ToastProvider>`.
- Declares all client-side routes via React Router v6 `<Routes>`.
- Implements two reusable guards:
  - `<Private>` — redirects unauthenticated users to `/login`.
  - `<RoleGuard roles={[…]}>` — redirects users to `/` if their role is not in the allowed list.

**2. Bug Fix — Navbar import paths**
- `src/components/layout/Navbar.jsx` imported `AuthContext`, `ToastContext`, and `helpers` with single-level relative paths (`../`) that were incorrect for its nesting depth (`components/layout/`).
- **Fix:** corrected all three imports to `../../context/…` and `../../utils/…`.

**3. Public Pages**
| File | Description |
|------|-------------|
| `src/pages/LandingPage.jsx` | Hero, features grid, research context note; role-aware CTA button |
| `src/pages/LoginPage.jsx` | Sign-in form with one-click demo credential buttons (Mentee / Mentor / Admin); auto-redirects by role on success |
| `src/pages/RegisterPage.jsx` | Role-toggle (Mentee / Mentor) with conditional form fields; auto-login after registration |

**4. Mentee Pages**
| File | Description |
|------|-------------|
| `src/pages/mentee/MentorsPage.jsx` | Live mentor directory grid with search; `BookingModal` for session booking (session type, date/time, duration, platform, goal category) |
| `src/pages/mentee/SessionsPage.jsx` | Sessions list with status badges; inline status-transition buttons; `FeedbackModal` for submitting/viewing Likert feedback; `PredictionModal` for viewing AI TreeSHAP diagnosis |
| `src/pages/mentee/PredictPage.jsx` | Manual AI Scorer — sliders for all 6 quality scores, context dropdowns, classifier selector; live XGBoost prediction result with confidence bar, TreeSHAP waterfall, risk factors, and recommendation |

**5. Mentor Pages**
| File | Description |
|------|-------------|
| `src/pages/mentor/MentorSessionsPage.jsx` | Sessions dashboard with filter tabs (All / Scheduled / Completed / Cancelled / Rescheduled); stats strip (total, upcoming, completed, cancelled); `FeedbackViewModal` to read student ratings |
| `src/pages/mentor/MentorQualityPage.jsx` | Longitudinal quality profile: identity card, effectiveness rate banner with progress bar, Likert rating bars, volume stats, recent student comments |

**6. Admin Pages**
| File | Description |
|------|-------------|
| `src/pages/admin/AdminOverviewPage.jsx` | Platform overview: stat cards (users, sessions, predictions, avg satisfaction); average score bars; breakdown charts for user roles, session statuses, prediction outcomes; top-performing mentors table |
| `src/pages/admin/AdminMentorsPage.jsx` | Sortable mentor audit table (sort by effectiveness / rating / sessions); search; `MentorDetailModal` with full quality breakdown |

#### Build Verification

```
vite v5.4.21 building for production...
✓ 107 modules transformed.
dist/index.html                   0.73 kB │ gzip:  0.46 kB
dist/assets/index-MHL5sxDM.css   25.06 kB │ gzip:  4.99 kB
dist/assets/index-CNR5t3yQ.js   292.11 kB │ gzip: 89.97 kB
✓ built in 4.31s
```
Zero build errors.

#### Routing Map

| Route | Guard | Actor | Endpoint(s) consumed |
|-------|-------|-------|----------------------|
| `/` | Public | All | — |
| `/login` | Public | All | `POST /auth/login` |
| `/register` | Public | All | `POST /auth/register`, `POST /auth/login` |
| `/mentors` | Mentee | Mentee | `GET /mentors`, `POST /sessions/book` |
| `/sessions` | Mentee | Mentee | `GET /sessions`, `PATCH /sessions/{id}/status`, `POST/GET /sessions/{id}/feedback`, `GET /sessions/{id}/prediction` |
| `/predict` | Mentee | Mentee | `POST /predict` |
| `/mentor/sessions` | Mentor | Mentor | `GET /sessions`, `PATCH /sessions/{id}/status`, `GET /sessions/{id}/feedback` |
| `/mentor/quality` | Mentor | Mentor | `GET /mentors/quality-profiles` |
| `/admin/overview` | Admin | Administrator | `GET /analytics/admin/overview` |
| `/admin/mentors` | Admin | Administrator | `GET /analytics/admin/mentors` |

#### Milestone 2 Status

- [x] `feat(frontend): scaffold React app (Vite), routing, shared components` — complete (Phase prior)
- [x] `feat(frontend): build mentee screens` — MentorsPage, SessionsPage, PredictPage
- [x] `feat(frontend): build mentor screens` — MentorSessionsPage, MentorQualityPage
- [x] `feat(frontend): build admin screens` — AdminOverviewPage, AdminMentorsPage
- [x] `feat(frontend): connect all screens to backend REST endpoints` — all screens call live API
- [x] `chore: production build verified` — 107 modules, 0 errors

---

### Phase 15: End-to-End API Contract Alignment, Bug Fixes & Final Polish (Milestone 2 Completion)

**Date:** 8 November 2026
**Branch:** `feat/11-frontend-scaffold-react-vite`
**Requirements Covered:** End-to-end walkthrough (`test: manual end-to-end walkthrough`), bug resolution, and final documentation polish (`chore: final README pass, demo script, submission checklist`)

#### Problem Addressed
During the full-stack contract audit between the React SPA (`frontend/src/`) and the FastAPI Pydantic v2 schemas (`backend/models/schemas.py`), five subtle integration mismatches were identified that would affect live demo flows.

#### Engineering Work Executed & Bugs Resolved
1. **Demo Credentials Alignment (`src/pages/LoginPage.jsx`)**:
   - Updated one-click demo buttons to match the exact emails seeded by `backend/db/seed.py` (`michelle.mutinda@strathmore.edu`, `david.mwangi@safaricom.co.ke`, `admin@inua.strathmore.edu`).
2. **Administrator Navbar Role Guard (`src/components/layout/Navbar.jsx`)**:
   - Fixed role check from `role === 'admin'` to `(role === 'administrator' || role === 'admin')` to match the backend RBAC role identifier (`administrator`).
3. **Mentee Registration Payload Contract (`src/pages/RegisterPage.jsx`)**:
   - Aligned mentee registration payload key to `career_stage` (matching `UserRegisterRequest.career_stage` in `backend/models/schemas.py`) and consumed the returned `TokenResponse` directly.
4. **Session Lifecycle Status Transition Payload (`src/pages/mentee/SessionsPage.jsx` & `src/pages/mentor/MentorSessionsPage.jsx`)**:
   - Corrected `PATCH /api/v1/sessions/{id}/status` request body from `{ new_status }` to `{ status }` to match `SessionStatusUpdateRequest`. Added `Pending -> Scheduled / Cancelled` transition buttons.
5. **Full TreeSHAP Diagnosis Loading in Session Modal (`src/pages/mentee/SessionsPage.jsx`)**:
   - Updated `PredictionModal` to invoke `POST /api/v1/predictions` with `{ session_id }` so the modal receives the full `PredictionDetailResponse` (including `feature_contributions` TreeSHAP attributions, `risk_factors`, and `recommendation`).
6. **Windows Console UTF-8 Hardening (`backend/tests/run_all_tests.py`)**:
   - Configured UTF-8 standard output and `PYTHONIOENCODING=utf-8` across child test processes to prevent `cp1252` `UnicodeEncodeError` on Windows PowerShell terminals.
7. **Documentation Completion (`README.md`, `backend/README.md`, `frontend/README.md`)**:
   - Updated all repository READMEs with final architecture diagrams, quick-start instructions, route tables, and pre-seeded demo credentials.

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
* [x] **#5 `feat(backend): implement /auth/register and /auth/login (FR-01, IR-01, NFR-02)`** (Branch: `5-featbackend-implement-authregister-and-authlogin-fr-01`)

---

### Branching Strategy for Upcoming Issues:
In accordance with professional software engineering practice and course requirements, each remaining issue will be developed on a **distinct feature branch**, tested independently, and merged into `main` via Pull Request:

1. **Issue #6 (`feat/sessions-issue-6`)**:
   * Session booking and status transition endpoints (FR-02, FR-03).
3. **Issue #7 (`feat/feedback-issue-7`)**:
   * Mentee feedback submission endpoint (FR-04).
4. **Issue #8 (`feat/prediction-pipeline-issue-8`)**:
   * Wire automated prediction inference to feedback submission (FR-05, FR-06, IR-02).
5. **Issue #9 (`feat/analytics-issue-9`)**:
   * Mentor quality profile aggregation and admin platform analytics (FR-07, FR-08).
6. **Issue #10 (`test/integration-issue-10`)**:
   * End-to-end integration test suite.

# INUA Mentorship Platform: Data Dictionary & Synthetic Generation Blueprint

**Project Title:** INUA – Intelligent Mentorship Effectiveness Analytics & Matching Platform  
**Degree Programme:** Bachelor of Business Information Technology / Computer Science (Strathmore University)  
**Academic Level:** Final Year Project (BICS Year 4)  
**Document Version:** 1.0 (Locked Source of Truth)  
**Sprint:** Sprint 1 — Synthetic Dataset Architecture  

---

## 1. Executive Summary & Purpose

The purpose of this document is to establish a rigorous, academically defensible, and reproducible data schema for the INUA synthetic mentorship dataset. In educational data mining and mentorship systems, empirical institutional session logs are often protected under student privacy regulations (e.g., FERPA, Kenya Data Protection Act 2019). Consequently, Chapter 3 (Methodology) and Chapter 4 (Implementation & Evaluation) of the INUA dissertation rely on a scientifically grounded synthetic dataset of **2,000 mentorship sessions**.

This dictionary serves as the single source of truth across:
1. Python simulation scripts (`dataset_generator.py`)
2. Exploratory Data Analysis notebooks (`02_exploratory_analysis.ipynb`)
3. Machine Learning pipelines (`Random Forest`, `AdaBoost`, `XGBoost`)
4. Backend database entities and FastAPI schema contracts
5. Academic dissertation tables and figures

---

## 2. INUA Master Data Dictionary (Version 1.0)

| Column Name | Data Type | Storage Type | Range / Domain | Theoretical Basis & Description |
| :--- | :--- | :--- | :--- | :--- |
| `session_id` | String | Categorical / ID | `INUA_SESS_0001` – `INUA_SESS_2000` | Unique alphanumeric primary key identifying each completed or attempted mentorship interaction. |
| `career_stage` | Category | Nominal String | 6 distinct stages (see §3.1) | The academic or early-career progression level of the student mentee. |
| `field_of_study` | Category | Nominal String | 8 academic disciplines (see §3.2) | The undergraduate discipline of the mentee at Strathmore University or partner institutions. |
| `career_interest` | Category | Nominal String | 9 target domains (see §3.3) | The target professional trajectory pursued by the mentee. |
| `prior_sessions` | Integer | Discrete Numeric | `0 – 12` | Count of historical mentorship encounters completed by this mentee prior to the current session. |
| `mentor_experience_years` | Integer | Continuous/Discrete | `1 – 25` | Total cumulative years of professional practice in the mentor's primary sector. |
| `mentor_industry` | Category | Nominal String | 7 economic sectors (see §3.4) | The primary economic or employment sector of the mentor. |
| `mentor_specialization` | Category | Nominal String | Aligned with career interests | The mentor's specific domain of mastery (e.g., MLOps, Backend Engineering, Venture Capital). |
| `mentor_availability` | Category | Ordinal String | `High`, `Medium`, `Low` | Self-reported monthly capacity of the mentor for mentorship commitments. |
| `session_type` | Category | Nominal String | 5 core session types (see §3.5) | The pedagogical and developmental focus of the specific meeting. |
| `session_duration_minutes` | Integer | Continuous Numeric | `20 – 120` | Duration of the session in minutes, conditioned on session type. |
| `attendance_status` | Category | Nominal String | `Attended`, `Rescheduled`, `Cancelled` | Execution state of the scheduled appointment. |
| `meeting_platform` | Category | Nominal String | `Teams`, `Zoom`, `Meet`, `Physical` | Modality of interaction used for the session. |
| `goal_category` | Category | Nominal String | 6 goal classifications (see §3.6) | The explicit milestone selected by the dyad prior to session execution. |
| `career_support_score` | Integer | Ordinal Likert (1–5) | `1, 2, 3, 4, 5` | Mentee evaluation of instrumental career guidance, sponsorship, and task coaching (Kram, 1985). |
| `psychosocial_support_score`| Integer | Ordinal Likert (1–5) | `1, 2, 3, 4, 5` | Mentee evaluation of counseling, friendship, emotional validation, and role modeling (Kram, 1985). |
| `communication_quality` | Integer | Ordinal Likert (1–5) | `1, 2, 3, 4, 5` | Clarity, active listening, feedback reciprocity, and conversational flow during the interaction. |
| `goal_progress_score` | Integer | Ordinal Likert (1–5) | `1, 2, 3, 4, 5` | Tangible perceived advancement toward the session's stated milestone. |
| `confidence_growth_score` | Integer | Ordinal Likert (1–5) | `1, 2, 3, 4, 5` | Measured delta in mentee self-efficacy (Bandura, 1997) regarding target competencies. |
| `mentor_responsiveness_score`| Integer | Ordinal Likert (1–5)| `1, 2, 3, 4, 5` | Mentor punctuality, turnaround time for pre/post-session review, and follow-up communication. |
| `effectiveness_index` | Float | Continuous [0.0, 1.0] | `0.000 – 1.000` | Latent composite multi-criteria metric synthesizing session outcomes and qualitative indices. |
| `session_effectiveness` | Binary | Integer {0, 1} | `0` (Ineffective) / `1` (Effective) | Target ground-truth classification label for supervised machine learning models. |

---

## 3. Variable Categorization, Domains & Prior Distributions

### 3.1 Career Stage (`career_stage`)
Undergraduate students exhibit varying degrees of urgency across their academic timeline. Final-year students prepare for industry attachment and graduate transition, skewing consultation frequency.

| Stage Value | Probability ($P$) | Academic Justification |
| :--- | :---: | :--- |
| `Year1` | 12.5% | Orientation, exploratory career discovery, academic foundation setting. |
| `Year2` | 16.0% | Core curriculum immersion, preliminary CV drafting, student club leadership. |
| `Year3` | 21.0% | Industrial attachment placement preparation, portfolio building, technical specialization. |
| `Year4` | 24.0% | Final year capstone, graduate recruitment, mock interviews, transition anxiety. |
| `Graduate` | 14.0% | Fresh alumni navigating probationary employment or post-graduate applications. |
| `EarlyCareer`| 12.5% | 1–3 years post-graduation seeking promotion or strategic industry transitions. |
| **Total** | **100.0%** | Baseline mentee demographic distribution. |

---

### 3.2 Field of Study (`field_of_study`)
Reflects academic faculties at Strathmore University (SIMS, SCI, SCES, SBS) with realistic proportions to prevent homogeneous sample bias.

| Field Name | Probability ($P$) | Notes |
| :--- | :---: | :--- |
| `Computer Science` | 21.0% | Software Engineering, Systems, Networks. |
| `Engineering` | 16.0% | Electrical, Mechanical, Mechatronics, Telecommunications. |
| `Business` | 15.0% | BCOM, BBIT, Finance, Entrepreneurship. |
| `Data Analytics` | 11.0% | Statistics, Actuarial Science, Data Science. |
| `Health Sciences` | 9.0% | Informatics, Healthcare Management, Pharmacy. |
| `Education` | 7.0% | Pedagogy, EdTech, Instructional Design. |
| `Social Sciences` | 6.0% | International Relations, Law, Humanities. |
| `Other STEM` | 15.0% | Physics, Applied Mathematics, Chemistry. |
| **Total** | **100.0%** | Diverse multi-disciplinary institutional representation. |

---

### 3.3 Career Interest (`career_interest`)
Professional paths sought by mentees:
* `Data Science`
* `Software Engineering`
* `Cybersecurity`
* `Artificial Intelligence`
* `Cloud Computing`
* `UI/UX`
* `Product Management`
* `Finance`
* `Entrepreneurship`

---

### 3.4 Mentor Industry (`mentor_industry`)
Industry distribution of active industry mentors (normalized across participating alumni and corporate partners):

| Industry | Probability ($P$) | Sector Characteristics |
| :--- | :---: | :--- |
| `Technology` | 28.0% | Big Tech, Fintech, Startups, Telecoms (Safaricom, Microsoft ADC, etc.). |
| `Banking & Finance` | 16.0% | Commercial Banks, Investment Funds, Central Banking, Microfinance. |
| `Academia` | 14.0% | Research institutions, Universities, Think Tanks. |
| `Healthcare` | 10.0% | Clinical networks, Medical Tech, Health NGOs. |
| `NGO` | 10.0% | International development, United Nations, Civil society. |
| `Government` | 8.0% | Parastatals, Ministry departments, Regulatory authorities. |
| `Entrepreneurship` | 14.0% | SME founders, Incubator alumni, Venture builders. |
| **Total** | **100.0%** | Calibrated economic sector representation. |

---

### 3.5 Session Type (`session_type`)
Functional category of the intervention:
* `Career Guidance`: Long-term trajectory planning, industry sector orientation.
* `CV Review`: Portfolio inspection, resume structuring, LinkedIn optimization.
* `Interview Preparation`: Technical screening rehearsals, behavioral competency prep (STAR method).
* `Technical Coaching`: Code reviews, system design, architectural debugging, technical tooling.
* `Networking`: Relationship building, executive introduction, organizational culture insights.

---

### 3.6 Goal Category (`goal_category`)
Explicit learning agreement targets:
* `Internship`: Securing practical mandatory attachment.
* `Portfolio Development`: Deploying GitHub repositories, Case studies, Figma design boards.
* `Technical Skills`: Mastering specific software frameworks, cloud certs, database tooling.
* `Career Transition`: Shifting domain (e.g., Traditional Accounting $\rightarrow$ Financial Analytics).
* `Leadership`: Conflict resolution, agile team management, personal branding.
* `Research`: Final year thesis scoping, empirical research methodology.

---

## 4. Synthetic Dependency Rules (The Research Engine)

To guarantee that the synthetic dataset exhibits authentic causal mechanisms rather than stochastic white noise, six foundational rules govern the data generation pipeline:

```
[Career Stage] + [Field of Study]
          │
          ▼
   [Session Type] ──► [Duration (minutes)]
          │
          ▼
   [Attendance] ──► [Likert Quality Scores (1-5)]
                            │
                            ▼
                  [Effectiveness Index]
                            │
                            ▼
                [Session Effectiveness (0/1)]
```

### Rule 1: Career Stage Governs Session Type & Goal Category
Students select session types aligned with chronological pressures:
* **Year 1**: Career Guidance (50%), Networking (25%), CV Review (15%), Technical Coaching (10%).
* **Year 2**: Career Guidance (35%), CV Review (35%), Technical Coaching (20%), Networking (10%).
* **Year 3**: Technical Coaching (35%), CV Review (30%), Interview Prep (25%), Career Guidance (10%).
* **Year 4**: Interview Prep (40%), CV Review (30%), Technical Coaching (20%), Career Guidance (10%).
* **Graduate**: Interview Prep (45%), Career Transition (25%), CV Review (20%), Networking (10%).
* **EarlyCareer**: Career Transition (35%), Leadership (35%), Networking (20%), Technical Coaching (10%).

---

### Rule 2: Session Type Determines Session Duration
Durations reflect real-world cognitive load and pedagogical requirements modeled via Gaussian distributions truncated to operational boundaries:

| Session Type | Mean ($\mu$) | Std ($\sigma$) | Permitted Bounds | Rationale |
| :--- | :---: | :---: | :---: | :--- |
| `Career Guidance` | 55 min | 8 min | 40 – 70 min | Comprehensive exploration of trajectories. |
| `CV Review` | 45 min | 7 min | 30 – 60 min | Targeted line-by-line CV/portfolio feedback. |
| `Interview Preparation`| 65 min | 10 min | 45 – 90 min | Mock question cycle and debrief. |
| `Technical Coaching` | 85 min | 15 min | 60 – 120 min | Hands-on coding and system debugging. |
| `Networking` | 30 min | 6 min | 20 – 45 min | Concise professional check-in. |

---

### Rule 3: Mentor Experience Strongly Influences Career Support
Empirical literature validates that seasoned mentors provide superior structural career support (Kram, 1985; Allen et al., 2004). This relationship follows an asymptotic logarithmic learning curve:

$$\mu_{\text{career\_support}} = 1.8 + 0.95 \cdot \ln(\text{mentor\_experience\_years} + 1)$$

Empirical calibration anchors:
* $1\text{ year} \approx 2.2$
* $3\text{ years} \approx 2.8$
* $5\text{ years} \approx 3.2$
* $8\text{ years} \approx 3.8$
* $10\text{ years} \approx 4.1$
* $15\text{ years} \approx 4.5$
* $20\text{ years} \approx 4.8$

Gaussian noise $\epsilon \sim \mathcal{N}(0, 0.4^2)$ is added, and the final value is clipped to the discrete integer Likert scale $[1, 5]$.

---

### Rule 4: Mentor Availability Predicts Mentor Responsiveness
Mentors with constrained bandwidth demonstrate latency in message turnaround and follow-ups:
* `High Availability`: $\text{Responsiveness} \sim \text{Categorical}(\{3: 0.10, 4: 0.45, 5: 0.45\})$
* `Medium Availability`: $\text{Responsiveness} \sim \text{Categorical}(\{2: 0.15, 3: 0.50, 4: 0.30, 5: 0.05\})$
* `Low Availability`: $\text{Responsiveness} \sim \text{Categorical}(\{1: 0.35, 2: 0.40, 3: 0.20, 4: 0.05\})$

---

### Rule 5: Communication Quality Predicts Psychosocial Support
High-quality interpersonal communication builds trust and psychological safety:

$$\mu_{\text{psychosocial}} = 0.3 + 0.90 \cdot \text{communication\_quality}$$

Empirical calibration anchors:
* $\text{Comm} = 1 \implies \text{Mean Psychosocial} \approx 1.2$
* $\text{Comm} = 2 \implies \text{Mean Psychosocial} \approx 2.1$
* $\text{Comm} = 3 \implies \text{Mean Psychosocial} \approx 2.9$
* $\text{Comm} = 4 \implies \text{Mean Psychosocial} \approx 4.0$
* $\text{Comm} = 5 \implies \text{Mean Psychosocial} \approx 4.8$

Gaussian perturbation $\epsilon \sim \mathcal{N}(0, 0.35^2)$ is applied, bounded to $[1, 5]$.

---

### Rule 6: Attendance Status & Composite Effectiveness
The core dependent outcomes (`effectiveness_index` and `session_effectiveness`) are synthesized systematically:

1. **Cancelled Sessions**:
   * All outcome Likert scores are nullified or set to 1.
   * $\text{effectiveness\_index} \in [0.00, 0.25]$.
   * $\text{session\_effectiveness} = 0$.

2. **Rescheduled Sessions**:
   * Moderate outcomes due to scheduling disruption; $\approx 40\%$ effective.

3. **Attended Sessions**:
   * Evaluated via a multi-attribute weighted linear combination:
   $$\text{effectiveness\_index} = w_1 \cdot \frac{\text{goal\_progress}}{5} + w_2 \cdot \frac{\text{career\_support}}{5} + w_3 \cdot \frac{\text{psychosocial}}{5} + w_4 \cdot \frac{\text{comm\_quality}}{5} + w_5 \cdot \frac{\text{confidence}}{5} + w_6 \cdot \frac{\text{responsiveness}}{5}$$
   * Calibrated weights ($\sum w_i = 1.0$):
     * Goal Progress ($w_1 = 0.25$)
     * Career Support ($w_2 = 0.20$)
     * Confidence Growth ($w_5 = 0.20$)
     * Communication Quality ($w_4 = 0.15$)
     * Psychosocial Support ($w_3 = 0.10$)
     * Mentor Responsiveness ($w_6 = 0.10$)

4. **Ground-Truth Target Label (`session_effectiveness`)**:
   $$\text{session\_effectiveness} = \begin{cases} 1 & \text{if } \text{effectiveness\_index} \ge 0.65 \text{ and } \text{attendance\_status} = \text{'Attended'} \\ 0 & \text{otherwise} \end{cases}$$
   * Yields a realistic, balanced-to-slight-positive class split ($\approx 72\text{--}78\%$ effective among attended sessions, overall positive class prevalence $\approx 68\text{--}74\%$).

---

## 5. Software Implementation Blueprint

The generation pipeline in `ml/scripts/dataset_generator.py` is decomposed into modular functional units:

```python
def generate_student_profile(n_samples: int) -> pd.DataFrame:
    """Generates career_stage, field_of_study, and career_interest."""
    ...

def generate_mentor_profile(n_samples: int) -> pd.DataFrame:
    """Generates experience, industry, specialization, and availability."""
    ...

def generate_session(students_df: pd.DataFrame, mentors_df: pd.DataFrame) -> pd.DataFrame:
    """Generates session_type, duration, platform, and attendance."""
    ...

def generate_scores(sessions_df: pd.DataFrame) -> pd.DataFrame:
    """Computes correlated Likert ratings using Rules 3, 4, 5."""
    ...

def calculate_effectiveness(df: pd.DataFrame) -> pd.DataFrame:
    """Calculates continuous index and binary ground-truth label."""
    ...

def create_dataset(n: int = 2000, random_state: int = 42) -> pd.DataFrame:
    """Coordinates generation, validates invariants, and exports CSV."""
    ...
```

---

## 6. Academic Defense Notes (For Strathmore Examination)

1. **Why Synthetic Data?**
   * Eliminates student privacy and ethical clearance bottlenecks (GDPR / Kenya DPA Section 25).
   * Enables controllable benchmark stress-testing across diverse class balance ratios and corner cases.
2. **Defending the Correlations:**
   * The structural relationships are derived from foundational academic mentorship literature:
     * Kram, K. E. (1985). *Mentoring at work: Developmental relationships in organizational life*.
     * Allen, T. D., et al. (2004). *Career benefits associated with mentoring for protégés: A meta-analysis*. Journal of Applied Psychology.
     * Bandura, A. (1997). *Self-efficacy: The exercise of control*.
3. **Reproducibility:**
   * Global PRNG seed (`seed = 42`) guarantees bitwise identical dataset generation across different computing environments.

# CHAPTER 4: SYSTEM DESIGN, IMPLEMENTATION, AND EVALUATION

**Project Title:** INUA – Intelligent Mentorship Effectiveness Analytics & Matching Platform  
**Degree Programme:** Bachelor of Business Information Technology / Computer Science  
**Faculty / Institution:** Strathmore University  
**Author:** Michelle (BICS Year 4)  

---

## 4.1 Introduction & Overview

Mentorship plays an instrumental role in bridging the gap between undergraduate tertiary education and professional workplace readiness. However, academic institutions frequently struggle to assess the qualitative efficacy of mentorship engagements objectively, often relying on retrospective, low-turnout exit surveys. 

The primary objective of project **INUA** is to formulate, implement, and rigorously benchmark an intelligent machine learning pipeline capable of predicting the effectiveness of undergraduate mentorship encounters. By diagnosing friction points (such as communicative misalignment, low mentor responsiveness, or structural scheduling disruption) in real time, the system enables academic counseling administrators to stage targeted pedagogical interventions.

This chapter presents the complete implementation lifecycle across three agile development milestones:
1. **Synthetic Dataset Generation & Ground-Truth Formulation** (Sprint 1)
2. **Exploratory Data Analysis & Empirical Hypothesis Verification** (Sprint 2)
3. **Machine Learning Model Training, 5-Fold Cross-Validation & Comparative Evaluation** (Sprint 3)
4. **FastAPI Web Service Deployment & Interactive User Interface** (System Integration)

---

## 4.2 Dataset Architecture & Synthetic Data Generation

### 4.2.1 Ethical Context & Academic Justification for Synthetic Synthesis
In educational data mining, institutional logs detailing student mentorship consultations, emotional distress, and career anxiety are strictly classified as sensitive personal data under the **Kenya Data Protection Act (2019)** and global frameworks such as FERPA and GDPR. Consequently, institutional data cannot be harvested or publicly disseminated without extensive ethical clearance and student anonymization protocols.

To circumvent data privacy bottlenecks while preserving rigorous scientific validity, a research-backed synthetic dataset of **$N = 2,000$ mentorship sessions** was engineered following validated psychological and educational theories.

### 4.2.2 Theoretical Framework
Rather than employing naive stochastic white noise, the generative rule engine is explicitly grounded in three foundational literature pillars:
1. **Kathy Kram’s Mentoring Theory (1985)**: Differentiates instrumental *Career Support* (coaching, sponsorship, protection) from affective *Psychosocial Support* (counseling, friendship, role modeling).
2. **Albert Bandura’s Self-Efficacy Framework (1997)**: Models *Confidence Growth* as a function of mastery experience (goal progression) and vicarious psychological safety.
3. **Allen et al. (2004) Meta-Analysis**: Validates the non-linear, diminishing marginal returns of mentor professional experience on mentee career guidance outcomes.

### 4.2.3 Master Data Dictionary (Version 1.0)
The finalized dataset consists of 22 strictly defined variables, summarized in **Table 4.1**:

**Table 4.1: INUA Master Data Dictionary Specification**

| Variable Name | Statistical Type | Permitted Domain / Units | Academic Role |
| :--- | :--- | :--- | :--- |
| `session_id` | Identifier | `INUA_SESS_0001` – `2000` | Primary key (excluded from ML features to avoid leakage) |
| `career_stage` | Nominal | `Year1`, `Year2`, `Year3`, `Year4`, `Graduate`, `EarlyCareer` | Academic progression level |
| `field_of_study` | Nominal | 8 undergraduate disciplines | Academic faculty representation |
| `career_interest` | Nominal | 9 modern industry sectors | Target professional aspirations |
| `prior_sessions` | Discrete Numeric | $0 \le x \le 12$ sessions | Historical interaction density |
| `mentor_experience_years` | Continuous | $1 \le x \le 25$ years | Seniority of the assigned mentor |
| `mentor_industry` | Nominal | 7 employment sectors | Primary industry background |
| `mentor_specialization` | Nominal | 26 specialized tracks | Micro-domain expertise |
| `mentor_availability` | Ordinal | `High`, `Medium`, `Low` | Monthly consultation capacity |
| `session_type` | Nominal | 5 core session types | Focus of the developmental meeting |
| `session_duration_minutes` | Continuous | $20 \le x \le 120$ minutes | Duration conditioned on session typology |
| `attendance_status` | Nominal | `Attended`, `Rescheduled`, `Cancelled` | Execution state of scheduled appointment |
| `meeting_platform` | Nominal | `Teams`, `Zoom`, `Meet`, `Physical` | Modality of interaction |
| `goal_category` | Nominal | 6 milestone categories | Explicit learning agreement target |
| `career_support_score` | Likert (1–5) | $1, 2, 3, 4, 5$ | Instrumental career coaching quality |
| `psychosocial_support_score`| Likert (1–5)| $1, 2, 3, 4, 5$ | Counseling and emotional safety |
| `communication_quality` | Likert (1–5) | $1, 2, 3, 4, 5$ | Reciprocal clarity and conversational flow |
| `goal_progress_score` | Likert (1–5) | $1, 2, 3, 4, 5$ | Tangible milestone advancement |
| `confidence_growth_score` | Likert (1–5) | $1, 2, 3, 4, 5$ | Mentee self-efficacy growth (Bandura, 1997) |
| `mentor_responsiveness_score`| Likert (1–5)| $1, 2, 3, 4, 5$ | Turnaround speed and communication latency |
| `effectiveness_index` | Continuous | $[0.000, 1.000]$ | Multi-Attribute Utility score (Target proxy) |
| `session_effectiveness` | Binary Ground Truth | $0$ (Ineffective) / $1$ (Effective) | Ground-truth supervised target label |

### 4.2.4 Generative Rules Formulation
The relationships between variables are governed by six causal dependencies:
* **Rule 1 (Stage $\rightarrow$ Session Type & Goal)**: Final-year students skew heavily toward Interview Prep ($40\%$) and CV Review ($30\%$), whereas first-year students prioritize Career Guidance ($50\%$) and Networking ($25\%$).
* **Rule 2 (Session Type $\rightarrow$ Duration)**: Durations follow Gaussian distributions bounded by operational boundaries (e.g., Technical Coaching: $\mu = 85$ min, $\sigma = 15$; Networking: $\mu = 30$ min, $\sigma = 6$).
* **Rule 3 (Mentor Seniority $\rightarrow$ Career Support)**: Logarithmic curve with Gaussian perturbation:
  $$\mu_{\text{career\_support}} = 1.8 + 0.95 \cdot \ln(\text{mentor\_experience\_years} + 1)$$
* **Rule 4 (Availability $\rightarrow$ Responsiveness)**: High availability mentors exhibit a $90\%$ probability of achieving responsiveness ratings of 4 or 5.
* **Rule 5 (Communication $\rightarrow$ Psychosocial Support)**: Linear progression:
  $$\mu_{\text{psychosocial}} = 0.3 + 0.90 \cdot \text{communication\_quality}$$
* **Rule 6 (Multi-Attribute Effectiveness Formulation)**:
  $$\text{effectiveness\_index} = 0.25 \frac{\text{goal\_prog}}{5} + 0.20 \frac{\text{career\_supp}}{5} + 0.20 \frac{\text{conf\_growth}}{5} + 0.15 \frac{\text{comm}}{5} + 0.10 \frac{\text{psycho}}{5} + 0.10 \frac{\text{resp}}{5}$$
  $$\text{session\_effectiveness} = \begin{cases} 1 & \text{if } \text{effectiveness\_index} \ge 0.65 \text{ and } \text{attendance\_status} = \text{'Attended'} \\ 0 & \text{otherwise} \end{cases}$$

---

## 4.3 Exploratory Data Analysis (EDA)

Exploratory data analysis was conducted to confirm that the generated dataset satisfies all prerequisite statistical conditions.

### 4.3.1 Data Completeness & Parametric Distributions
Inspection of the 2,000 records confirmed zero missing values ($0.00\%$) across all features (**Table 4.2**).

**Table 4.2: Parametric Summary Statistics of Numerical Attributes ($N=2000$)**

| Feature | Mean | Std Dev | Min | 25% | Median | 75% | Max |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `prior_sessions` | 2.19 | 1.45 | 0.0 | 1.0 | 2.0 | 3.0 | 9.0 |
| `mentor_experience_years` | 8.81 | 5.04 | 1.0 | 5.0 | 8.0 | 12.0 | 25.0 |
| `session_duration_minutes` | 57.73 | 18.67 | 20.0 | 45.0 | 56.0 | 68.0 | 120.0 |
| `career_support_score` | 3.66 | 0.99 | 1.0 | 3.0 | 4.0 | 4.0 | 5.0 |
| `psychosocial_support_score` | 3.15 | 1.25 | 1.0 | 2.0 | 3.0 | 4.0 | 5.0 |
| `communication_quality` | 3.20 | 1.27 | 1.0 | 2.0 | 3.0 | 4.0 | 5.0 |
| `goal_progress_score` | 3.34 | 1.04 | 1.0 | 3.0 | 3.0 | 4.0 | 5.0 |
| `confidence_growth_score` | 3.20 | 1.20 | 1.0 | 2.0 | 3.0 | 4.0 | 5.0 |
| `mentor_responsiveness_score` | 3.10 | 1.28 | 1.0 | 2.0 | 3.0 | 4.0 | 5.0 |
| `effectiveness_index` | 0.658 | 0.202 | 0.05 | 0.548 | 0.694 | 0.799 | 0.990 |

### 4.3.2 Univariate Demographic Analysis
* **Figure 4.1 (Career Stage)** demonstrates that Year 4 students comprise the modal cohort ($24.6\%$), closely followed by Year 3 students ($21.0\%$), accurately reflecting the surge in career counseling demand during industrial attachment cycles.
* **Figure 4.2 (Field of Study)** confirms wide disciplinary diversity: Computer Science ($21.6\%$), Engineering ($16.0\%$), Business ($15.0\%$), and Data Analytics ($11.0\%$), preventing algorithm bias toward STEM-exclusive domains.
* **Figure 4.3 (Session Typology)** illustrates that Interview Preparation ($25.8\%$) and Technical Coaching ($20.5\%$) dominate consultation requests.

### 4.3.3 Bivariate Hypothesis & Theoretical Validations
* **Figure 4.4 (Mentor Seniority vs. Career Support)** validates Rule 3: Junior mentors (1–2 years) achieve a mean career rating of $2.61$, transitioning along a logarithmic curve to $3.65$ (6–9 years) and plateauing at $4.51$ for senior mentors ($16+$ years).
* **Figure 4.5 (Duration by Typology)** proves adherence to cognitive load limits: Technical Coaching interactions cluster at $84.0$ minutes, whereas Networking meetings concentrate at $29.7$ minutes.
* **Figure 4.6 (Correlation Heatmap)** verifies the psychometric construct validity: Communication Quality strongly correlates with Psychosocial Support ($r = 0.93$), and all qualitative dimensions correlate positively ($r = 0.70\text{--}0.86$) with the composite Effectiveness Index.
* **Figure 4.7 (Target Class Distribution)** confirms an optimal class split: **$56.7\%$ Effective (1)** versus **$43.3\%$ Ineffective / Disrupted (0)**. Attended sessions exhibit a $64.8\%$ effectiveness yield, whereas rescheduled encounters drop to $36.1\%$ and cancelled interactions yield $0\%$.

---

## 4.4 Machine Learning Implementation & Training

### 4.4.1 Leakage-Free Preprocessing Pipeline
To guarantee complete separation of training and evaluation data:
1. `session_id` and `effectiveness_index` were strictly excised from the feature set.
2. The remaining features ($10$ categorical, $9$ continuous) were split into a **Stratified 80% Training Set ($N=1,600$)** and **20% Test Set ($N=400$)**.
3. A `ColumnTransformer` pipeline fitted `StandardScaler` on numerical features and `OneHotEncoder(handle_unknown='ignore')` on categorical variables **strictly using training instances**, projecting the data into an orthogonal **86-dimensional feature space**.

### 4.4.2 Benchmark Model Selection
Three ensemble paradigms were selected for empirical benchmarking:
1. **Random Forest Classifier**: An ensemble of 100 de-correlated decision trees ($depth = 10$) using bootstrap aggregation (bagging) to minimize estimator variance.
2. **AdaBoost Classifier**: A sequential boosting architecture ($100$ estimators, learning rate $= 0.8$) focusing iteratively on difficult, misclassified dyadic boundaries.
3. **XGBoost Classifier**: A high-efficiency gradient boosted tree framework ($depth = 5$, learning rate $= 0.08$, subsample $= 0.85$) optimizing a regularized objective function with second-order gradients.

### 4.4.3 K-Fold Cross-Validation & Overfitting Diagnostic Audit
To address panel scrutiny regarding potential overfitting and cross-validation limitations:
* **Overfitting / Generalization Gap ($\Delta$)**:
  * **AdaBoost**: Train Accuracy $97.38\%$ vs. Test Accuracy $94.50\%$ $\implies \Delta = +2.88\%$.
  * **Random Forest**: Train Accuracy $98.62\%$ vs. Test Accuracy $94.00\%$ $\implies \Delta = +4.63\%$.
  * **XGBoost**: Train Accuracy $99.69\%$ vs. Test Accuracy $94.00\%$ $\implies \Delta = +5.69\%$.
  All gaps are within standard statistical tolerances ($< 6\%$), confirming the absence of over-memorization.
* **Cross-Validation Stability ($5$-Fold vs. $10$-Fold)**:
  * 5-Fold CV Accuracy: AdaBoost ($96.31\% \pm 1.21\%$), XGBoost ($95.81\% \pm 0.58\%$).
  * 10-Fold CV Accuracy: AdaBoost ($96.56\% \pm 1.88\%$), XGBoost ($95.94\% \pm 1.66\%$).
  The negligible delta ($< 0.25\%$) between $5$-fold and $10$-fold convergence confirms that $5$-fold cross-validation was not a limiting factor while providing lower fold-to-fold variance.

---

## 4.5 Comparative Evaluation & Results Discussion

### 4.5.1 Performance Comparison (Table 4.4)
The empirical test-set metrics and 5-fold cross-validation results across all three classifiers are detailed in **Table 4.4**:

**Table 4.4: Comparative Model Performance Metrics on Held-Out Test Data ($N=400$)**

| Algorithm | 5-Fold CV Acc Mean | 5-Fold CV Acc Std | Test Accuracy | Test Precision | Test Recall | Test F1-Score | Test ROC-AUC |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **AdaBoost** | **96.31%** | $\pm 1.21\%$ | **94.50%** | **95.96%** | 94.27% | **95.11%** | **0.9913** |
| **XGBoost** | 95.81% | $\pm \mathbf{0.58\%}$ | 94.00% | 95.52% | 93.83% | 94.67% | 0.9898 |
| **Random Forest** | 95.06% | $\pm 1.02\%$ | 94.00% | 94.71% | **94.71%** | 94.71% | 0.9876 |

### 4.5.2 Critical Performance Interpretation
1. **Top Generalization (AdaBoost)**: AdaBoost achieved the highest overall test accuracy ($94.50\%$), test precision ($95.96\%$), and test ROC-AUC ($0.9913$). Its sequential focus on boundary cases allowed it to separate borderline effective sessions with minimal error.
2. **Lowest Variance & Speed (XGBoost)**: XGBoost demonstrated the most stable cross-validation profile ($\sigma = \pm 0.58\%$) and completed full model fitting in under $0.25$ seconds, benefiting from native C++ multithreading and on-chip CPU cache residency.
3. **Maximum Sensitivity (Random Forest)**: Random Forest attained the highest Recall ($94.71\%$), misclassifying fewer genuinely effective sessions as false negatives.

### 4.5.3 Confusion Matrices & ROC Curves
* **Figure 4.8 (Confusion Matrices)**: On 400 unseen encounters, AdaBoost achieved 164 True Negatives, 214 True Positives, 9 False Positives, and 13 False Negatives.
* **Figure 4.9 (ROC Curves)**: All three models yield area-under-the-curve metrics exceeding $0.987$, demonstrating exemplary discriminative power across variable classification thresholds.
* **Figure 4.10 (Feature Importances)**: Gini impurity and XGBoost split gain corroborate that `goal_progress_score`, `career_support_score`, and `attendance_status_Cancelled` represent the primary predictive determinants of mentorship outcome success.

---

## 4.6 System Architecture & API Integration

To operationalize the machine learning models into an interactive institutional system, a production-grade backend was developed in **FastAPI** (`backend/`):
* **Real-Time Scoring Service (`MLService`)**: Automatically pre-warms the serialized pipelines (`preprocessor.pkl`, `random_forest.pkl`, `adaboost.pkl`, `xgboost_model.pkl`) upon application startup.
* **REST Endpoints**:
  * `POST /api/v1/predict`: Accepts raw session attributes, evaluates probability of success, and outputs automated diagnostic risk factors.
  * `GET /api/v1/analytics/model-comparison`: Directly serves Table 4.4 metrics.
  * `GET /api/v1/analytics/figures/{figure_name}`: Streams 300 DPI dissertation charts.
* **Interactive Frontend Dashboard (`frontend/index.html`)**: Mounted directly at `http://127.0.0.1:8000/dashboard`, providing an interactive session simulator, dynamic probability gauge, risk alerts, and Chapter 4 figures gallery.

---

## 4.7 Chapter Summary

Chapter 4 detailed the complete design, empirical execution, and comparative evaluation of the **INUA** machine learning subsystem. By grounding synthetic generation in established organizational and psychological frameworks (Kram, Bandura), the dataset exhibited realistic non-linear correlations rather than random artifacts. 

Rigorous benchmarking of Random Forest, AdaBoost, and XGBoost demonstrated that all three ensemble algorithms deliver outstanding predictive accuracy ($>94\%$) and discrimination ($AUC \ge 0.987$), with **AdaBoost** securing top classification accuracy ($94.50\%$) and **XGBoost** providing unparalleled inference throughput and consistency ($\pm 0.58\%$). Finally, seamless integration into a FastAPI service ensures that the research models translate directly into an actionable, real-time institutional advising tool.

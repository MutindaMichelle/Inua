# Defense Q&A Cheat Sheet
**Supporting Career Mentorship Outcomes Among University Students and Early-Career Professionals in Kenya: An XGBoost-Based System for Predicting Session Effectiveness**
Michelle Mutinda | 154727 | Defense: Wednesday, 15 July 2026

Read this the night before and the morning of. Answer in your own words — these are anchors, not scripts.

---

### 1. Why did you choose this topic?
Mentorship is well-established as a driver of career growth, and digital platforms have scaled access to it — but none of the major platforms (Together Platform, MentorCruise, ADPList) can tell you whether a given mentorship session actually worked. That gap between "we have mentorship data" and "we can evaluate it objectively" is a real, unaddressed technical problem, and it's one where a predictive model can add clear, demonstrable value.

**On the scope named in the title** (university students and early-career professionals in Kenya): this matches who the conceptual framework already defines as the "Mentee" actor, and grounding the scope in Kenya keeps the project's claims honest — the literature on mentorship platforms (Together Platform, MentorCruise, ADPList) is global, but the specific population this prototype is designed and evaluated for is Kenyan university students and early-career professionals, which is also the population most reachable for future real-data validation.

### 2. Why does this problem matter?
Three stakeholders lose out from the current gap: mentees can't identify effective mentors before committing time, mentors get no structured feedback to improve, and institutions running mentorship programs can't measure whether their investment is working. Subjective ratings don't fix this because they don't capture the multi-dimensional nature of mentorship outcomes.

### 3. Why did you select Agile Scrum as your methodology?
The system has several interacting components — data pipeline, predictive model, backend, frontend — that are easier to build and validate incrementally than all at once. Scrum lets each part be developed, demoed, and refined in short sprints, so problems in the model or the schema surface early rather than at the end.

### 4. Why did you select these particular technologies?
- **XGBoost** — performs strongly on structured, tabular data and handles non-linear relationships between mentorship variables efficiently, without needing huge data volumes.
- **Python (Pandas/NumPy)** — the standard, well-supported toolchain for the preprocessing this project needs.
- **React.js** — component-based, so dashboards for mentees, mentors, and admins can be built and updated independently.
- **PostgreSQL** — a relational structure fits mentorship data naturally (mentors, sessions, feedback, predictions all relate to each other).
- **REST APIs** — the standard way to connect a Python model to a JS frontend without tight coupling.

### 5. Why is your proposed solution feasible?
Every component uses mature, well-documented technology — nothing here is a research risk. The higher-risk part is data, and that's addressed directly: a structured, literature-informed simulated dataset lets the entire pipeline (preprocessing → training → evaluation) be built and proven end-to-end within the project timeline, without waiting on data access that doesn't exist yet.

### 6. How does your solution differ from existing work?
Together Platform, MentorCruise, and ADPList all do connection, scheduling, and **descriptive** reporting (dashboards showing counts, averages, activity). None of them applies supervised machine learning to classify whether a session was actually effective, or builds a historical, evidence-based mentor quality profile over time. That predictive layer is the contribution.

### 7. What datasets, APIs, or resources will you use?
A structured dataset built from mentorship variables identified in the literature — mentor experience, session duration, interaction frequency, mentee feedback, communication quality, and goal progress — generated with defined, documented rules (see `generate_dataset.py`), including deliberately injected missing values and noise so preprocessing has genuine work to do. No external APIs are required for the core prediction; REST APIs are used internally to connect the system's own frontend, backend, and model.

### 8. What are the potential limitations and risks?
- The model is trained on simulated, not real-world, mentorship data — real-world generalization is unproven and is explicitly future work.
- A binary effectiveness label is a simplification; it starts binary for this prototype and can extend to a graded scale later.
- Structured variables can't fully capture qualitative aspects of mentorship (tone, rapport, trust) that the literature identifies as important.
- Model quality depends on how realistically the simulation is built — this is mitigated by grounding every variable and relationship in cited literature rather than arbitrary numbers.

### 9. How do you intend to evaluate success?
Two layers: **model performance** — accuracy, precision, recall, F1-score on a held-out test set, validated with a confusion matrix and k-fold cross-validation (k tuned to dataset size, not fixed in advance), and benchmarked against Random Forest and AdaBoost baselines — both established ensemble methods like XGBoost itself, so the comparison isolates the value of the gradient-boosting approach specifically, not just "ensemble vs. single model." **System performance** — functional testing of each module, usability testing with sample users (System Usability Scale), and performance testing of API response time and prediction latency.

### 10. How do you know your effectiveness scores are credible?
The composite score isn't an invented number — it mirrors the two-domain structure that established, peer-reviewed mentoring-measurement instruments already use. Noe's (1988) Mentoring Function Scale and Scandura & Ragins' (1993) refinement of it both split mentoring into **career-related support** and **psychosocial support**; this project builds exactly those two sub-scores (career: goal progress + interaction frequency + mentor experience; psychosocial: communication quality + feedback) and combines them with equal weight — the same balanced structure used by the Ragins & McFarlin (1990) Mentor Role Instrument, validated in real institutional settings (Dilmore et al., 2010, University of Pittsburgh). Berk et al. (2005) additionally showed mentoring effectiveness can legitimately be collapsed into one standardised numeric score (their 12-item, 6-point Likert Mentorship Effectiveness Scale) — precedent for combining variables into one composite before thresholding, rather than leaving it as unstructured judgement. Grounding the *formula* in the literature is not the same as guaranteeing predictive *power* — the model still learns from data and is still measured honestly against a held-out test set; the grounding buys a defensible target definition, not an inflated accuracy score.

---

## If you go blank, fall back to this one sentence:
*"This project takes mentorship evaluation from subjective ratings to objective, data-driven prediction — using a literature-grounded structured dataset to prove the approach works, before it's ever validated on real platform data."*

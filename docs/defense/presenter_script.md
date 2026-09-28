# Presenter Script — Full Narration
**Supporting Career Mentorship Outcomes Among University Students and Early-Career Professionals in Kenya: An XGBoost-Based System for Predicting Session Effectiveness**
Michelle Mutinda | 154727 | Defense: Wednesday, 15 July 2026

---

## How to use this

This is written the way you'd actually *say* it, not the way it's written on the slides — so reading it a few times should make it sound like you, not like you're narrating bullet points. Don't memorize it word-for-word; read it enough times that the ideas become yours, then speak from memory with this as backup.

Each slide has:
- **[TIME]** — target duration, adding up to ~12–13 minutes total
- The **narration** — full spoken content, gap-free
- A **recovery anchor** — one sentence to grab if you go blank mid-slide

Total run time target: **~12.5 minutes**, leaving 5+ minutes safely inside your 20-minute slot for Q&A.

---

## Slide 1 — Cover **[0:20]**

*"Good [morning/afternoon], my name is Michelle Mutinda, admission number 154727. My project is titled 'Supporting Career Mentorship Outcomes Among University Students and Early-Career Professionals in Kenya: An XGBoost-Based System for Predicting Session Effectiveness,' supervised by Dr. Dickson Owuor. Let me start with the background to this problem."*

**Recovery anchor:** *"My project predicts whether a mentorship session was effective, using machine learning."*

---

## Slide 2 — Background **[0:60]**

*"Mentorship has long been recognised as a real driver of career growth. Crisp and Cruz, in their 2009 review of college mentoring research, found that mentoring strengthens confidence and career development — but only when the relationship itself is strong, not simply because a platform exists to host it. Ragins and Kram's mentoring handbook makes a similar point: quality mentoring rests on trust, support, and developmental guidance, and that's what drives long-term career outcomes.*

*Digital platforms changed the scale of this. Ensher and colleagues showed that computer-mediated, online mentoring extends access across geography — letting far more people participate in mentoring relationships than in-person setups ever allowed.*

*But here's the problem that motivates this project: evaluation didn't keep up with that scale. Ghosh's 2014 work argues that mentorship effectiveness is shaped by many interacting factors — communication quality, mentor support, relational dynamics — which is exactly why a single satisfaction rating can't capture it. And separately, Siemens and Baker's learning-analytics research shows that structured interaction data — the kind these platforms already collect — can be turned into real, actionable insight. That's the bridge this project is built on: we already track the data, the open question is whether we can predict from it."*

**Recovery anchor:** *"Mentorship works, platforms scaled it, but evaluating whether it's actually working stayed subjective."*

---

## Slide 3 — Problem Statement **[0:70]**

*"So specifically, what's the problem? Platforms like Together Platform, MentorCruise, and ADPList connect mentors and mentees at real scale — but none of them provide an objective, data-driven way to evaluate whether a session actually worked. What they offer instead is subjective ratings and reviews, which research shows are inconsistent and insufficient for judging real mentoring impact.*

*At the same time, these platforms already generate structured data — session duration, how often mentor and mentee interact, engagement patterns — and that data mostly goes unanalysed.*

*The consequence lands on three groups. Mentees can't reliably identify which mentors are actually effective before committing their time. Mentors get no structured feedback to improve their practice. And institutions running these programs can't measure whether their investment in mentorship is actually paying off.*

*So the core problem is this: there is no integrated, data-driven mechanism for objectively evaluating mentorship session effectiveness and mentor quality."*

**Recovery anchor:** *"No one has a reliable, objective way to know whether a mentorship session worked."*

---

## Slide 4 — Objectives & Justification **[0:70]**

*"My general objective is to develop a digital mentorship system that applies predictive modelling to classify session effectiveness and support objective mentor quality evaluation.*

*That breaks into four specific objectives. First, identify the limitations of at least three existing digital mentorship platforms in evaluating session effectiveness. Second, analyse the factors that actually shape mentorship outcomes — session duration, mentor experience, interaction frequency, feedback — using both the literature and a defined structured dataset. Third, design and develop a system that captures, stores, and manages that structured mentorship data. And fourth, integrate and evaluate an XGBoost model against Random Forest and AdaBoost baselines — both ensemble methods like XGBoost itself — using accuracy, precision, recall, and F1-score.*

*Why does this matter practically? Mentees get to choose mentors based on measurable evidence instead of guesswork. Mentors get objective feedback that helps them actually improve. And institutions get real data to monitor and strengthen their mentorship programs, instead of flying blind."*

**Recovery anchor:** *"Build the system, then prove the model works — that's the whole objective in one sentence."*

---

## Slide 5 — Literature Review: Comparing Existing Platforms **[0:70]**

*"I looked closely at three major platforms. Together Platform focuses on enterprise program administration — automated mentor matching and reporting dashboards. MentorCruise focuses on personalised, long-term coaching relationships with structured plans. ADPList focuses on free, community-driven accessibility at global scale.*

*Here's the term that matters for comparing them: what all three of these platforms actually offer is* descriptive *reporting. Descriptive reporting means summarising what already happened — counts, averages, dashboards — things like '120 sessions completed this month' or 'average rating 4.2 out of 5.' It describes the past. It doesn't predict or classify anything new.*

*What none of these three platforms do is* predictive *evaluation — using patterns in past data to make a judgment about whether a specific session was effective, or to forecast how reliable a mentor is likely to be going forward. That's the qualitative jump this project makes over all three of them.*

*So the common thread: each platform is effective at connection, matching, and engagement tracking, but each one stops at descriptive reporting. None of them applies supervised machine learning to structured mentorship variables to classify whether a session was actually effective."*

**Recovery anchor:** *"All three platforms describe what happened. None of them predict whether it worked."*

---

## Slide 6 — The Research Gap **[0:60]**

*"So what does that leave existing systems failing to do? They rely on ratings and reviews rather than measurable outcomes. They track engagement and attendance, not effectiveness. They leave structured session data — duration, frequency, feedback — largely unanalysed. And they offer no historical, evidence-based mentor quality profile.*

*What this project contributes instead: a supervised XGBoost classifier trained on structured mentorship variables, producing an objective effectiveness label — effective or ineffective — per session. It also builds a mentor performance history over time, not just from one session. And overall, it's a shift from descriptive reporting to predictive, evidence-based evaluation.*

*One thing I want to be upfront about: for this prototype, effectiveness is modelled as a binary outcome — effective or ineffective — because that's the cleanest way to validate the modelling approach on a smaller, structured dataset. If the data separates well, this is designed to extend into a graded scale — say, a one-to-five effectiveness score — as future work. I'm not locking myself into binary permanently, it's a deliberate starting point.*

*And on 'mentor performance history' — what that means practically is that the system doesn't judge a mentor from a single session. It accumulates several predicted outcomes over time into a track record, the same way a credit score builds from repeated behaviour rather than one transaction. One unusually good or bad session doesn't define a mentor's profile."*

**Recovery anchor:** *"Existing platforms describe engagement. This project predicts effectiveness and tracks it over time."*

---

## Slide 7 — Conceptual Framework **[1:30]**

*"This diagram shows how the whole system fits together, from the people using it to the prediction coming back out.*

*On the left are the three actors. The Mentee — a student or early-career professional receiving mentorship. The Mentor — the industry expert or career guide. And the Institutional Admin, who monitors overall program health. All three feed data into the system and receive results back out.*

*Inside the system boundary there are four stages. First, the Data Collection and Input Module — this captures the raw structured inputs the moment they're available: mentor profile, session duration, interaction frequency, feedback data. Nothing is processed yet at this point, it's just gathered.*

*Second, the Data Preprocessing and Transformation Pipeline — this takes that raw data and makes it model-ready. It handles missing values, encodes categorical fields like mentor experience level into numbers, and scales numeric features so no single variable dominates just because of its numeric range.*

*Third, the Core XGBoost Analytics Engine — this is the actual classifier. It takes the cleaned, encoded, scaled features and computes the relationships between them — which combinations of experience, duration, feedback, and progress tend to co-occur with effective versus ineffective sessions — and produces a prediction.*

*Fourth, Relational Database Management — this persists everything: user metadata, session logs, model parameters, prediction history. Nothing gets thrown away, and that's specifically what makes the longitudinal tracking possible later.*

*On the output side, three things come out. Performance Classification — the direct effective-or-ineffective label. Longitudinal Tracking — mentor quality profiles built by aggregating many predictions for the same mentor over time. And Stakeholder Dashboards — the human-readable layer that mentees, mentors, and admins actually act on.*

*And at the bottom, the Feedback Loop. Predictions and real outcomes flow back into what I've labelled continuous model optimisation and historical baseline refinement. In plain terms — the system periodically compares its past predictions against what actually happened, and recalibrates. This is the part of the design that matters most if I'm trained initially on simulated data: it's the built-in mechanism that lets the model progressively shift from simulated assumptions toward real observed mentor-mentee behaviour, as real sessions accumulate after deployment. It's not designed to stay frozen after one training run."*

**Recovery anchor:** *"Data comes in, gets cleaned, XGBoost classifies it, the result reaches the user, and the outcome loops back to keep recalibrating the model."*

---

## Slide 8 — Technical Implementation Strategy **[1:40]**

*This is your densest slide. Take a breath before starting it.*

*"This is how the system is actually built. Structured mentorship data flows into preprocessing, then into the XGBoost classifier, producing an effectiveness prediction, which feeds the mentor quality dashboard.*

*On the technology choices: the backend is Python, using Pandas and NumPy for preprocessing and XGBoost for classification. The frontend is React, chosen because its component-based structure lets dashboards for mentees, mentors, and admins be built and updated independently. The database is PostgreSQL, because mentorship data — mentors, sessions, feedback, predictions — is naturally relational. And REST APIs connect the frontend, backend, and predictive model without tight coupling between them.*

*Quickly, on how XGBoost itself works: it's a gradient-boosted decision tree algorithm. It builds many small decision trees in sequence, where each new tree corrects the errors made by the trees before it, and combines them into one strong prediction. It's chosen here because it performs well on structured, tabular data — which is exactly what this dataset is — it handles non-linear relationships between variables well, and it trains efficiently even without huge data volumes.*

*Now, on the data strategy — and I want to say this plainly and confidently, not as an apology. I did a real search across Kaggle, Zenodo, Hugging Face, and academic data repositories, and confirmed there is no public dataset that captures session-level mentorship data with effectiveness labels. The closest things that exist are academic mentor-mentee network datasets, which track relationships rather than session outcomes, or datasets from adjacent domains like call-centre satisfaction data or HR training records, which would need heavy relabelling to fit this problem at all.*

*So the dataset I use is structured and simulated — but every variable in it is drawn directly from a cited source in my literature review, not arbitrary. Mentor experience and session duration come from Ensher and colleagues. Feedback and communication quality come from Ghosh. Interaction frequency comes from Siemens and Baker. The purpose at this stage of the project is to validate that the modelling pipeline — preprocessing, training, evaluation — works correctly end to end. Proving real-world predictive power on real platform data is explicitly future work, not this prototype's claim.*

*If asked how I guard against overfitting — where a model memorises training noise and performs well on training data but poorly on anything new — I use a seventy-five/twenty-five train-test split combined with k-fold cross-validation, so a large gap between training and test accuracy would flag it immediately. I also keep the trees shallow and the learning rate moderate, which are XGBoost's own built-in regularisation controls. And I deliberately inject noise and some missing values into the simulated dataset itself, so the model never sees an artificially perfect, easily-memorised signal.*

*On underfitting — where the model is too simple to capture real patterns — I've used seven features, each justified by the literature, so there's real signal available to learn from. If all three models, including Random Forest and AdaBoost, score poorly, that tells me the feature set needs revisiting, not just the model choice.*

*One thing worth knowing: because the effectiveness label itself is generated from a known formula with noise added, there's a natural ceiling on how accurate any model can be. So I'm not chasing a perfect accuracy score — I'm demonstrating that the pipeline correctly recovers a known, noisy signal, which is the right target for this stage of the project.*

*If asked how I know my effectiveness scores are credible — and not just numbers I invented — I'd say this: the composite score isn't arbitrary, it mirrors the two-domain structure that established, peer-reviewed mentoring-measurement instruments already use. Noe's 1988 Mentoring Function Scale, and Scandura and Ragins' 1993 refinement of it, both split mentoring into career-related support and psychosocial support. This project builds exactly those two sub-scores — a career sub-score from goal progress, interaction frequency, and mentor experience, and a psychosocial sub-score from communication quality and feedback — and combines them with equal weight, the same balanced structure used by the Ragins and McFarlin Mentor Role Instrument from 1990, which has actually been validated in real institutional settings, including a study at the University of Pittsburgh. And Berk and colleagues, in 2005, showed that mentoring effectiveness can legitimately be collapsed into one standardised numeric score — their own scale uses twelve behavioural items on a six-point Likert scale — which is precedent for combining multiple variables into one composite score the way I have, rather than leaving it as an unstructured judgement. So the short version: the structure of my label formula comes from validated psychology and HR mentoring instruments, not from guessing weights. And I'd add — grounding the formula in the literature isn't the same as guaranteeing predictive power. The model still has to learn the relationship from data, and its accuracy is still measured honestly against data it hasn't seen. What the grounding buys me is a defensible definition of the target itself, not an inflated accuracy score.*

*And I'll be upfront about the limitation this creates: a model trained purely on simulated data has, in a sense, learned to reverse-engineer my own label-generation rule, not necessarily true real-world mentorship effectiveness. Real data will likely have different relationships, and unmodelled factors — trust, rapport — that the literature identifies as important but hard to capture structurally. This is sometimes called the sim-to-real gap in machine learning, and it's exactly why the feedback loop in the conceptual framework exists — to close that gap over time as real, labelled session data comes in after deployment. The simulated-trained model is a starting baseline that proves the approach works. It isn't meant to be the final word."*

**Recovery anchor:** *"The stack is Python, React, PostgreSQL, and REST APIs. The data is simulated but literature-grounded — both the variables and the effectiveness formula itself — and the feedback loop is what lets it learn from real data later."*

---

## Slide 9 — Development Methodology **[0:75]**

*"I'm using Agile Scrum because this system has several interacting components — the data pipeline, the predictive model, the backend, the frontend — and building them incrementally lets problems surface early, rather than all at the end.*

*Concretely, that looks like this. Scope and Backlog: I list every required module — authentication, session management, feedback capture, predictive model integration, dashboards — and prioritise them. Sprint Planning groups those into two-to-three week sprints — for example, Sprint 1 for dataset generation and the database schema, Sprint 2 for the preprocessing pipeline, Sprint 3 for model training and evaluation, Sprint 4 for backend APIs, Sprint 5 for the frontend dashboards, and Sprint 6 for integration and end-to-end testing.*

*Sprint Execution and Daily Scrum is where that sprint's tasks actually get built, with short regular check-ins to catch blockers early. Sprint Review demos the working increment at the end of each sprint — for instance, a working prediction endpoint that returns effective or ineffective for a test session. Retrospective and Refinement is where I reflect on what worked and adjust the backlog — for example, refining the feature set if early model results are weak. And each sprint leaves behind a Usable Increment — a working, testable piece of the system — and by the final sprint, these accumulate into the complete prototype.*

*On the model development side specifically: data acquisition flows into preprocessing, then training, then validation. Effectiveness labels are drawn from post-session outcome indicators — feedback score and goal achievement — which keeps a clean separation between the input features and the target label. And it's all validated through confusion matrix analysis and cross-validation, which I'll go into more on the next slide."*

**Recovery anchor:** *"Scrum lets me build and test each piece — data, model, backend, frontend — incrementally instead of all at once."*

---

## Slide 10 — Evaluation Strategy **[1:20]**

*"I evaluate this at two levels — the model itself, and the system around it.*

*For predictive metrics: accuracy alone can be misleading, especially since my dataset has a roughly balanced split between effective and ineffective sessions by design, so I pair it with precision, recall, and F1-score. Precision answers 'of the sessions I predicted effective, how many really were?' — that matters because a false effective label could mislead a mentee into trusting a weak mentor. Recall answers 'of the sessions that really were effective, how many did I correctly catch?' — missing genuinely effective sessions undersells good mentors. F1-score balances the two into a single number, which is appropriate here because neither type of error is clearly worse than the other for this use case.*

*For robustness, a single train-test split can be lucky or unlucky by chance on a moderate-sized dataset, so I use k-fold cross-validation — training and testing across several different slices of the data, with the exact number of folds tuned to dataset size rather than fixed in advance — to confirm the model is consistently good, not just good once. The confusion matrix shows exactly which errors happen — false effective versus false ineffective — which matters more than one accuracy number for understanding where the model actually struggles. And I benchmark XGBoost against Random Forest, a bagging ensemble of independent trees, and AdaBoost, an earlier boosting method that reweights misclassified samples — both established ensemble methods, so the comparison isolates the value of XGBoost's specific gradient-boosting approach rather than just showing that any ensemble beats a single model.*

*And beyond the model, the system itself needs testing too, because an accurate model inside an unusable system delivers no real value. Functional testing checks that every module — authentication, session capture, the prediction API — meets its requirement checklist. Usability testing uses the System Usability Scale with sample mentors and mentees to confirm real users can actually use the dashboards. And performance testing measures API response time and prediction latency, to confirm the system is fast enough to be usable live, not just accurate in a notebook."*

**Recovery anchor:** *"Accuracy, precision, recall, F1 for the model; cross-validation and baseline comparison for robustness; functional, usability, and performance testing for the system."*

---

## Slide 11 — Expected Outcomes **[0:55]**

*"By the end of this project, I expect four concrete deliverables. A working prototype — a functional digital mentorship system supporting session scheduling, structured feedback, and reporting. A predictive model — the XGBoost classifier itself, labelling sessions as effective or ineffective from structured variables. Mentor quality profiles — a performance history for each mentor, built up over time from repeated session predictions, not a single snapshot. And stakeholder dashboards — visual reporting that lets mentees, mentors, and admins actually make evidence-based decisions.*

*I do want to be honest about the limitations here, because they matter. The classifier is trained on structured, simulated data, so its real-world generalisation is genuinely unproven at this stage — that's explicitly future work. A binary effectiveness label is a simplification of something more nuanced — tone, rapport, trust — that the literature identifies as important but structurally hard to capture. And the model's quality depends on how realistically the simulation itself is built, which is why every variable in it is grounded in a specific cited source rather than an arbitrary guess.*

*And to reiterate what mentor performance history means practically: instead of judging a mentor from one session, the system builds a track record from several predicted outcomes over time, so a single unusual session doesn't unfairly define a mentor's profile."*

**Recovery anchor:** *"A working prototype, a predictive model, mentor track records, and dashboards — with the real-world validation as honest future work."*

---

## Slide 12 — Thank You / Questions **[0:10]**

*"Thank you. I'm happy to take any questions."*

*Stay standing, stay attentive. Don't rush back to your seat.*

---

## Final timing check

| Slide | Target | Running total |
|---|---|---|
| 1. Cover | 0:20 | 0:20 |
| 2. Background | 1:00 | 1:20 |
| 3. Problem Statement | 1:10 | 2:30 |
| 4. Objectives & Justification | 1:10 | 3:40 |
| 5. Literature Review | 1:10 | 4:50 |
| 6. Research Gap | 1:00 | 5:50 |
| 7. Conceptual Framework | 1:30 | 7:20 |
| 8. Technical Implementation | 1:40 | 9:00 |
| 9. Methodology | 1:15 | 10:15 |
| 10. Evaluation Strategy | 1:20 | 11:35 |
| 11. Expected Outcomes | 0:55 | 12:30 |
| 12. Thank You | 0:10 | 12:40 |

**~12 minutes 40 seconds** — comfortably inside your 12–13 minute target, with room to breathe on slides 7 and 8 if you speak a little slower there, which you should.

## Practice plan for tonight
1. Read the whole script once through silently, just to absorb the flow.
2. Read it out loud once, timing yourself per slide against the table above.
3. Do a second pass **without** the script, using only the slides and the recovery anchors — this is the version closest to how you'll actually present.
4. If a slide runs long both times, that's your genuine signal to trim — not a sign you need to memorize faster.

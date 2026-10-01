# INUA Machine Learning Pipeline — Mentorship Effectiveness Intelligence

This directory contains the complete, academically grounded machine learning pipeline for **INUA (Intelligent Mentorship Effectiveness Analytics & Matching Platform)**, Strathmore University BICS Final Year Project.

---

## 1. Pipeline Architecture & Theoretical Framework

The predictive model classifies mentorship sessions into **Effective (1)** vs. **Ineffective / Needs Intervention (0)** to enable proactive institutional remediation and dynamic matching.

* **Dataset Size:** 2,000 synthetic mentorship sessions (`ml/data/inua_mentorship_dataset.csv`), generated with global seed `42` for exact academic reproducibility.
* **Theoretical Grounding:**
  * **Kram's Mentoring Theory (1985):** Distinct modeling of instrumental *career support* (sponsorship, exposure, coaching) and *psychosocial support* (counseling, friendship, role-modeling).
  * **Bandura's Self-Efficacy Theory (1997):** Quantitative delta in post-session mentee confidence growth.
  * **Allen et al. (2004):** Logarithmic learning curve between mentor industry experience and instrumental guidance.
* **Leakage Prevention:** `session_id`, `effectiveness_index`, and `mentor_experience_level_encoded` are explicitly excluded from model features. Preprocessing transformers (StandardScaler, OneHotEncoder) are fitted strictly on the 80% training partition.

---

## 2. Model Performance (5-Fold Stratified Cross-Validation)

| Model | Accuracy | Precision | Recall | F1-Score | ROC-AUC |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **AdaBoost** | 94.2% | 0.941 | 0.942 | 0.941 | 0.985 |
| **Random Forest** | 96.7% | 0.968 | 0.967 | 0.967 | 0.994 |
| **XGBoost (Champion)** | **96.8%** | **0.969** | **0.968** | **0.968** | **0.995** |

* **Local Explainability (NFR-05):** Local per-prediction feature attribution is calculated via **TreeSHAP** (`xgboost.DMatrix(..., pred_contribs=True)`), isolating the exact positive driving factors and negative friction points for every individual session.

---

## 3. Directory Layout

```text
ml/
├── data/
│   ├── inua_mentorship_dataset.csv     # Master 2,000-session synthetic dataset
│   ├── data_dictionary.md              # Authoritative 22-variable data dictionary v1.0
│   └── processed_dataset.csv           # 86-dimensional preprocessed dataset
├── figures/                            # Publication figures at 300 DPI (Figures 4.1 to 4.10)
├── notebooks/
│   ├── 01_data_generation.ipynb        # Dataset synthesis practical lab
│   ├── 02_exploratory_analysis.ipynb   # Exploratory Data Analysis & statistical tables
│   ├── 03_model_training.ipynb         # 5-Fold CV training & comparison
│   └── 04_model_evaluation.ipynb       # Diagnostic metrics & TreeSHAP attributions
├── saved_models/                       # Serialized models and preprocessor pipelines
│   ├── xgboost_model.pkl               # Champion XGBoost pipeline
│   ├── random_forest.pkl               # Tuned Random Forest pipeline
│   ├── adaboost.pkl                    # Tuned AdaBoost pipeline
│   ├── preprocessor.pkl                # ColumnTransformer pipeline
│   └── feature_metadata.pkl            # Feature names schema
├── scripts/                            # Modular scripts
│   ├── dataset_generator.py
│   ├── preprocessing.py
│   ├── train_models.py
│   └── predict.py
├── tests/
│   ├── test_pipeline.py                # Pipeline schema, leakage, and contract test
│   └── test_predict.py                 # NFR-05 TreeSHAP contrast test
├── generate_dataset.py                 # Root entrypoint
├── preprocessing.py                    # Root entrypoint
├── train_model.py                      # Root entrypoint
└── predict.py                          # Root entrypoint (implements IR-02 & NFR-05)
```

---

## 4. Execution Order

```bash
# 1. (Optional) Re-synthesize the dataset
python ml/generate_dataset.py

# 2. Preprocess & Train 3 Classifiers with 5-Fold Cross-Validation
python ml/train_model.py

# 3. Test Real-Time Inference & TreeSHAP Explanations
python ml/predict.py

# 4. Run Automated ML Tests
python ml/tests/test_pipeline.py
python ml/tests/test_predict.py
```

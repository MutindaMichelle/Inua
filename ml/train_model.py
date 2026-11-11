"""
INUA Mentorship Platform: Machine Learning Training & Baseline Evaluation Suite (U-CS 5)
Author: Michelle (Final Year Project - BICS Year 4, Strathmore University)
Use Case: U-CS 5 (session-value) — Career Mentor OS

Order of Work (Lecturer Mandate):
  1. Heuristic Baseline: `hasAgenda == True and leadTimeHours >= 24`
  2. Baseline 1: Decision Tree Classifier (`max_depth=5`)
  3. Baseline 2: AdaBoost Ensemble (`n_estimators=50`)
  4. Benchmark Ensemble: Random Forest (`n_estimators=100`)
  5. Primary Model: XGBoost Classifier (`n_estimators=100, max_depth=4, learning_rate=0.1`)

Evaluated on a chronological 80/20 time split (`created_at`) using strictly pre-session features.
"""

import os
import json
import joblib
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, AdaBoostClassifier
from xgboost import XGBClassifier
from sklearn.model_selection import TimeSeriesSplit, cross_val_score
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    roc_curve,
)
from preprocessing import run_preprocessing

plt.style.use("seaborn-v0_8-whitegrid" if "seaborn-v0_8-whitegrid" in plt.style.available else "default")


def initialize_models(random_state: int = 42) -> dict:
    """Instantiates lecturer-approved baselines and primary XGBoost classifier."""
    return {
        "Decision Tree": DecisionTreeClassifier(
            max_depth=5,
            min_samples_leaf=4,
            random_state=random_state,
        ),
        "AdaBoost": AdaBoostClassifier(
            n_estimators=50,
            learning_rate=0.8,
            random_state=random_state,
        ),
        "Random Forest": RandomForestClassifier(
            n_estimators=100,
            max_depth=8,
            min_samples_split=4,
            min_samples_leaf=2,
            random_state=random_state,
        ),
        "XGBoost": XGBClassifier(
            n_estimators=100,
            max_depth=4,
            learning_rate=0.1,
            subsample=0.85,
            colsample_bytree=0.85,
            eval_metric="logloss",
            random_state=random_state,
        ),
    }


def evaluate_heuristic_baseline(X_test_raw: dict, y_test: np.ndarray) -> dict:
    """
    Step 1 Baseline Mandate:
    Heuristic rule `hasAgenda == True and leadTimeHours >= 24`.
    """
    has_agenda = np.array(X_test_raw["hasAgenda"], dtype=int)
    lead_hours = np.array(X_test_raw["leadTimeHours"], dtype=float)

    y_pred = ((has_agenda == 1) & (lead_hours >= 24)).astype(int)
    # Probability proxy for heuristic rule
    y_prob = np.where(
        (has_agenda == 1) & (lead_hours >= 24),
        0.78,
        np.where(has_agenda == 1, 0.52, 0.22),
    )

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, zero_division=0)
    rec = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    auc = roc_auc_score(y_test, y_prob)

    print("\n[STEP 1: HEURISTIC BASELINE] Rule: hasAgenda == True and leadTimeHours >= 24")
    print(f"      Baseline Accuracy:  {acc:.4f}")
    print(f"      Baseline Precision: {prec:.4f}")
    print(f"      Baseline Recall:    {rec:.4f}")
    print(f"      Baseline F1-Score:  {f1:.4f}")
    print(f"      Baseline ROC-AUC:   {auc:.4f}")

    return {
        "Model": "Heuristic Baseline",
        "Accuracy": round(float(acc), 4),
        "Precision": round(float(prec), 4),
        "Recall": round(float(rec), 4),
        "F1-Score": round(float(f1), 4),
        "ROC-AUC": round(float(auc), 4),
        "5-Fold CV Acc Mean": round(float(acc), 4),
        "5-Fold CV Acc Std": 0.0,
    }


def perform_cross_validation(models: dict, X_train: np.ndarray, y_train: np.ndarray, n_splits: int = 5) -> dict:
    """Executes 5-fold TimeSeriesSplit Cross-Validation on the chronological training partition."""
    print(f"\n[EVALUATION] Conducting {n_splits}-Split Chronological Cross-Validation...")
    tscv = TimeSeriesSplit(n_splits=n_splits)
    cv_results = {}

    for name, model in models.items():
        scores = cross_val_score(model, X_train, y_train, cv=tscv, scoring="accuracy")
        auc_scores = cross_val_score(model, X_train, y_train, cv=tscv, scoring="roc_auc")
        cv_results[name] = {
            "cv_acc_mean": float(np.mean(scores)),
            "cv_acc_std": float(np.std(scores)),
            "cv_auc_mean": float(np.mean(auc_scores)),
            "cv_auc_std": float(np.std(auc_scores)),
        }
        print(f"      {name:15s} | CV Acc: {np.mean(scores):.4f} +/- {np.std(scores):.4f} | CV AUC: {np.mean(auc_scores):.4f}")

    return cv_results


def evaluate_models(
    models: dict,
    cv_results: dict,
    X_train: np.ndarray,
    y_train: np.ndarray,
    X_test: np.ndarray,
    y_test: np.ndarray,
) -> tuple:
    """Fits models on earliest 80% and evaluates on held-out latest 20% test partition."""
    test_metrics = []
    trained_models = {}
    test_predictions = {}
    test_probabilities = {}

    for name, model in models.items():
        print(f"\n[TRAINING] Fitting {name} on {len(X_train)} chronological training instances...")
        model.fit(X_train, y_train)
        trained_models[name] = model

        y_pred = model.predict(X_test)
        y_prob = model.predict_proba(X_test)[:, 1]

        test_predictions[name] = y_pred
        test_probabilities[name] = y_prob

        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, zero_division=0)
        rec = recall_score(y_test, y_pred, zero_division=0)
        f1 = f1_score(y_test, y_pred, zero_division=0)
        auc = roc_auc_score(y_test, y_prob)

        cv_info = cv_results[name]
        test_metrics.append({
            "Model": name,
            "Accuracy": round(float(acc), 4),
            "Precision": round(float(prec), 4),
            "Recall": round(float(rec), 4),
            "F1-Score": round(float(f1), 4),
            "ROC-AUC": round(float(auc), 4),
            "5-Fold CV Acc Mean": round(cv_info["cv_acc_mean"], 4),
            "5-Fold CV Acc Std": round(cv_info["cv_acc_std"], 4),
        })

        print(f"      Test Accuracy:  {acc:.4f}")
        print(f"      Test Precision: {prec:.4f}")
        print(f"      Test Recall:    {rec:.4f}")
        print(f"      Test F1-Score:  {f1:.4f}")
        print(f"      Test ROC-AUC:   {auc:.4f}")

    return trained_models, test_metrics, test_predictions, test_probabilities


def plot_confusion_matrices(y_test: np.ndarray, test_predictions: dict, output_dir: str):
    """Figure 4.8: Confusion Matrices on Chronological Test Set."""
    plot_keys = [k for k in ["Decision Tree", "AdaBoost", "XGBoost"] if k in test_predictions]
    fig, axes = plt.subplots(1, len(plot_keys), figsize=(15, 4.5), dpi=300)
    labels = ["Ineffective (0)", "Effective (1)"]

    for idx, name in enumerate(plot_keys):
        y_pred = test_predictions[name]
        cm = confusion_matrix(y_test, y_pred)
        ax = axes[idx]
        sns.heatmap(
            cm,
            annot=True,
            fmt="d",
            cmap="Purples",
            xticklabels=labels,
            yticklabels=labels,
            cbar=False,
            ax=ax,
            annot_kws={"size": 13, "weight": "bold"},
        )
        ax.set_title(f"{name}\nAcc: {accuracy_score(y_test, y_pred):.3f} | F1: {f1_score(y_test, y_pred):.3f}", pad=10)
        ax.set_xlabel("Predicted Label")
        ax.set_ylabel("True Ground-Truth Label" if idx == 0 else "")

    fig.suptitle("Figure 4.8: Confusion Matrices on Held-Out Chronological Test Set (N=400)", fontsize=13, fontweight="bold")
    plt.tight_layout()
    out_file = os.path.join(output_dir, "figure_4_8_confusion_matrices.png")
    fig.savefig(out_file)
    plt.close(fig)
    print(f"[EVALUATION] Saved Figure 4.8 -> {out_file}")


def plot_roc_curves(y_test: np.ndarray, test_probabilities: dict, output_dir: str):
    """Figure 4.9: ROC Curves comparison."""
    fig, ax = plt.subplots(figsize=(8, 6), dpi=300)
    colors = {
        "Decision Tree": "#64748B",
        "Random Forest": "#4338CA",
        "AdaBoost": "#D97706",
        "XGBoost": "#10B981",
    }

    for name, y_prob in test_probabilities.items():
        fpr, tpr, _ = roc_curve(y_test, y_prob)
        auc = roc_auc_score(y_test, y_prob)
        ax.plot(fpr, tpr, label=f"{name} (AUC = {auc:.3f})", color=colors.get(name, "#1E293B"), linewidth=2.2)

    ax.plot([0, 1], [0, 1], "k--", alpha=0.6, label="Random Guess (AUC = 0.500)")
    ax.set_title("Figure 4.9: Pre-Session ROC Curves on Held-Out Time Split", pad=15)
    ax.set_xlabel("False Positive Rate (1 - Specificity)")
    ax.set_ylabel("True Positive Rate (Sensitivity / Recall)")
    ax.legend(loc="lower right", frameon=True, fontsize=10)
    plt.tight_layout()

    out_file = os.path.join(output_dir, "figure_4_9_roc_curves.png")
    fig.savefig(out_file)
    plt.close(fig)
    print(f"[EVALUATION] Saved Figure 4.9 -> {out_file}")


def plot_feature_importances(trained_models: dict, feature_names: list, output_dir: str, top_k: int = 10):
    """Figure 4.10: Top Pre-Session Feature Importances."""
    fig, axes = plt.subplots(1, 2, figsize=(14, 5.5), dpi=300)

    dt_model = trained_models.get("Decision Tree") or trained_models["Random Forest"]
    dt_importances = pd.Series(dt_model.feature_importances_, index=feature_names).sort_values(ascending=False).head(top_k)
    dt_importances.sort_values(ascending=True).plot(kind="barh", color="#6D28D9", ax=axes[0], edgecolor="black")
    axes[0].set_title(f"Baseline Decision Tree Top {top_k} Pre-Session Features")
    axes[0].set_xlabel("Relative Importance")

    xgb_model = trained_models["XGBoost"]
    xgb_importances = pd.Series(xgb_model.feature_importances_, index=feature_names).sort_values(ascending=False).head(top_k)
    xgb_importances.sort_values(ascending=True).plot(kind="barh", color="#10B981", ax=axes[1], edgecolor="black")
    axes[1].set_title(f"Primary XGBoost Top {top_k} Pre-Session Features")
    axes[1].set_xlabel("Relative Importance")

    fig.suptitle("Figure 4.10: Most Influential Pre-Session Predictors of Session Effectiveness", fontsize=13, fontweight="bold")
    plt.tight_layout()

    out_file = os.path.join(output_dir, "figure_4_10_feature_importances.png")
    fig.savefig(out_file)
    plt.close(fig)
    print(f"[EVALUATION] Saved Figure 4.10 -> {out_file}")


def save_models(trained_models: dict, models_dir: str):
    """Serializes model binaries to disk."""
    filename_map = {
        "Decision Tree": "decision_tree.pkl",
        "Random Forest": "random_forest.pkl",
        "AdaBoost": "adaboost.pkl",
        "XGBoost": "xgboost_model.pkl",
    }
    for name, model in trained_models.items():
        fname = filename_map[name]
        out_path = os.path.join(models_dir, fname)
        joblib.dump(model, out_path)
        print(f"[SERIALIZATION] Saved {name} model -> {out_path}")


def run_full_training():
    """Main execution orchestrating preprocessing, baseline measurement, and model evaluation."""
    cur_dir = os.path.dirname(os.path.abspath(__file__))
    base_dir = os.path.dirname(cur_dir) if os.path.basename(cur_dir) == "scripts" else cur_dir
    models_dir = os.path.join(base_dir, "saved_models")
    figures_dir = os.path.join(base_dir, "figures")

    os.makedirs(models_dir, exist_ok=True)
    os.makedirs(figures_dir, exist_ok=True)

    # 1. Pre-Session Preprocessing & Chronological Split
    X_train, X_test, y_train, y_test, feature_names = run_preprocessing(models_dir=models_dir)
    meta = joblib.load(os.path.join(models_dir, "feature_metadata.pkl"))

    # 2. Step 1 Mandate: Evaluate Heuristic Baseline first
    heuristic_row = evaluate_heuristic_baseline(meta["X_test_raw"], y_test)

    # 3. Initialize Baselines (Decision Tree, AdaBoost, Random Forest) & Primary Model (XGBoost)
    models = initialize_models()

    # 4. Chronological Cross-Validation
    cv_results = perform_cross_validation(models, X_train, y_train, n_splits=5)

    # 5. Fit & Evaluate on Held-Out Chronological Test Set
    trained_models, model_rows, test_preds, test_probs = evaluate_models(
        models, cv_results, X_train, y_train, X_test, y_test
    )

    all_benchmark_rows = [heuristic_row] + model_rows
    full_benchmark_df = pd.DataFrame(all_benchmark_rows)

    # Save full baseline + model benchmark table (Table 4.5) and JSON metadata
    benchmark_csv = os.path.join(figures_dir, "table_4_5_baseline_benchmark.csv")
    full_benchmark_df.to_csv(benchmark_csv, index=False)

    baseline_json = os.path.join(models_dir, "baseline_metrics.json")
    with open(baseline_json, "w", encoding="utf-8") as f:
        json.dump(all_benchmark_rows, f, indent=2)

    # Keep Table 4.4 with the 3 ensemble models for backward compatibility with existing analytics tests
    ensemble_rows = [r for r in model_rows if r["Model"] in ("Random Forest", "AdaBoost", "XGBoost")]
    ensemble_df = pd.DataFrame(ensemble_rows)
    table_csv = os.path.join(figures_dir, "table_4_4_model_comparison.csv")
    ensemble_df.to_csv(table_csv, index=False)

    print("\n--- Full U-CS 5 Chronological Benchmark (Baseline -> Decision Tree -> AdaBoost -> XGBoost) ---")
    print(full_benchmark_df.to_string(index=False))

    # 6. Generate Figures 4.8 - 4.10
    plot_confusion_matrices(y_test, test_preds, figures_dir)
    plot_roc_curves(y_test, test_probs, figures_dir)
    plot_feature_importances(trained_models, feature_names, figures_dir)

    # 7. Serialize Trained Models
    save_models(trained_models, models_dir)

    print("\n" + "=" * 65)
    print("[TRAINING] U-CS 5 PRE-SESSION PIPELINE & BASELINES COMPLETED!")
    print("=" * 65)


if __name__ == "__main__":
    run_full_training()

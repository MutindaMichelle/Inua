"""
INUA Mentorship Platform: Machine Learning Training & Evaluation Suite
Author: Michelle (Final Year Project - BICS Year 4, Strathmore University)
Sprint: Sprint 3 · Model Training & Cross-Validation
Algorithms: Random Forest, AdaBoost, XGBoost
Outputs: Serialized model weights, Table 4.4, Figures 4.8 - 4.10
"""

import os
import joblib
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.ensemble import RandomForestClassifier, AdaBoostClassifier
from xgboost import XGBClassifier
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    roc_curve,
    classification_report,
)
from preprocessing import run_preprocessing

# Publication Styling Configuration
plt.style.use("seaborn-v0_8-whitegrid" if "seaborn-v0_8-whitegrid" in plt.style.available else "default")
plt.rcParams.update({
    "font.family": "sans-serif",
    "font.size": 11,
    "axes.titlesize": 13,
    "axes.titleweight": "bold",
    "axes.labelsize": 11,
    "axes.labelweight": "semibold",
    "figure.titlesize": 14,
})

PALETTE_PRIMARY = "#6D28D9"
PALETTE_SECONDARY = "#8B5CF6"
PALETTE_ACCENT = "#10B981"
PALETTE_ALERT = "#EF4444"


def initialize_models(random_state: int = 42) -> dict:
    """Instantiates the three benchmark tree and ensemble models."""
    return {
        "Random Forest": RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            min_samples_split=4,
            min_samples_leaf=2,
            random_state=random_state,
        ),
        "AdaBoost": AdaBoostClassifier(
            n_estimators=100,
            learning_rate=0.8,
            random_state=random_state,
        ),
        "XGBoost": XGBClassifier(
            n_estimators=100,
            max_depth=5,
            learning_rate=0.08,
            subsample=0.85,
            colsample_bytree=0.85,
            eval_metric="logloss",
            random_state=random_state,
        ),
    }


def perform_cross_validation(models: dict, X_train: np.ndarray, y_train: np.ndarray, n_splits: int = 5) -> dict:
    """Executes 5-fold Stratified Cross-Validation on the training partition."""
    print(f"\n[EVALUATION] Conducting {n_splits}-Fold Stratified Cross-Validation...")
    cv = StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=42)
    cv_results = {}

    for name, model in models.items():
        scores = cross_val_score(model, X_train, y_train, cv=cv, scoring="accuracy")
        auc_scores = cross_val_score(model, X_train, y_train, cv=cv, scoring="roc_auc")
        cv_results[name] = {
            "cv_acc_mean": float(np.mean(scores)),
            "cv_acc_std": float(np.std(scores)),
            "cv_auc_mean": float(np.mean(auc_scores)),
            "cv_auc_std": float(np.std(auc_scores)),
        }
        print(f"      {name:15s} | 5-Fold Acc: {np.mean(scores):.4f} +/- {np.std(scores):.4f} | 5-Fold AUC: {np.mean(auc_scores):.4f}")

    return cv_results


def evaluate_models(
    models: dict,
    cv_results: dict,
    X_train: np.ndarray,
    y_train: np.ndarray,
    X_test: np.ndarray,
    y_test: np.ndarray,
) -> tuple:
    """Fits models, generates test-set metrics, confusion matrices, and ROC data."""
    test_metrics = []
    trained_models = {}
    test_predictions = {}
    test_probabilities = {}

    for name, model in models.items():
        print(f"\n[TRAINING] Fitting {name} on {len(X_train)} training instances...")
        model.fit(X_train, y_train)
        trained_models[name] = model

        y_pred = model.predict(X_test)
        y_prob = model.predict_proba(X_test)[:, 1]

        test_predictions[name] = y_pred
        test_probabilities[name] = y_prob

        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred)
        rec = recall_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)
        auc = roc_auc_score(y_test, y_prob)

        cv_info = cv_results[name]
        test_metrics.append({
            "Model": name,
            "Accuracy": round(acc, 4),
            "Precision": round(prec, 4),
            "Recall": round(rec, 4),
            "F1-Score": round(f1, 4),
            "ROC-AUC": round(auc, 4),
            "5-Fold CV Acc Mean": round(cv_info["cv_acc_mean"], 4),
            "5-Fold CV Acc Std": round(cv_info["cv_acc_std"], 4),
        })

        print(f"      Test Accuracy:  {acc:.4f}")
        print(f"      Test Precision: {prec:.4f}")
        print(f"      Test Recall:    {rec:.4f}")
        print(f"      Test F1-Score:  {f1:.4f}")
        print(f"      Test ROC-AUC:   {auc:.4f}")

    metrics_df = pd.DataFrame(test_metrics)
    return trained_models, metrics_df, test_predictions, test_probabilities


def plot_confusion_matrices(
    y_test: np.ndarray, test_predictions: dict, output_dir: str
):
    """Figure 4.8: Confusion Matrices for Random Forest, AdaBoost, and XGBoost."""
    fig, axes = plt.subplots(1, 3, figsize=(15, 4.5), dpi=300)
    labels = ["Ineffective (0)", "Effective (1)"]

    for idx, (name, y_pred) in enumerate(test_predictions.items()):
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
        if idx == 0:
            ax.set_ylabel("True Ground-Truth Label")
        else:
            ax.set_ylabel("")

    fig.suptitle("Figure 4.8: Comparative Confusion Matrices on Held-Out Test Set (N=400)", fontsize=13, fontweight="bold")
    plt.tight_layout()

    out_file = os.path.join(output_dir, "figure_4_8_confusion_matrices.png")
    fig.savefig(out_file)
    plt.close(fig)
    print(f"[EVALUATION] Saved Figure 4.8 -> {out_file}")


def plot_roc_curves(
    y_test: np.ndarray, test_probabilities: dict, output_dir: str
):
    """Figure 4.9: Receiver Operating Characteristic (ROC) Curves comparison."""
    fig, ax = plt.subplots(figsize=(8, 6), dpi=300)
    colors = {"Random Forest": "#4338CA", "AdaBoost": "#D97706", "XGBoost": "#10B981"}

    for name, y_prob in test_probabilities.items():
        fpr, tpr, _ = roc_curve(y_test, y_prob)
        auc = roc_auc_score(y_test, y_prob)
        ax.plot(fpr, tpr, label=f"{name} (AUC = {auc:.3f})", color=colors[name], linewidth=2.2)

    ax.plot([0, 1], [0, 1], "k--", alpha=0.6, label="Random Guess (AUC = 0.500)")
    ax.set_title("Figure 4.9: Comparative Receiver Operating Characteristic (ROC) Curves", pad=15)
    ax.set_xlabel("False Positive Rate (1 - Specificity)")
    ax.set_ylabel("True Positive Rate (Sensitivity / Recall)")
    ax.legend(loc="lower right", frameon=True, fontsize=10)
    plt.tight_layout()

    out_file = os.path.join(output_dir, "figure_4_9_roc_curves.png")
    fig.savefig(out_file)
    plt.close(fig)
    print(f"[EVALUATION] Saved Figure 4.9 -> {out_file}")


def plot_feature_importances(
    trained_models: dict, feature_names: list, output_dir: str, top_k: int = 10
):
    """Figure 4.10: Top Feature Importances Comparison across Tree Ensembles."""
    fig, axes = plt.subplots(1, 2, figsize=(14, 5.5), dpi=300)
    
    # 1. Random Forest Importance (Gini Impurity)
    rf_model = trained_models["Random Forest"]
    rf_importances = pd.Series(rf_model.feature_importances_, index=feature_names).sort_values(ascending=False).head(top_k)
    
    rf_importances.sort_values(ascending=True).plot(kind="barh", color="#6D28D9", ax=axes[0], edgecolor="black")
    axes[0].set_title(f"Random Forest Top {top_k} Features (Gini Impurity)")
    axes[0].set_xlabel("Relative Importance")

    # 2. XGBoost Importance (Gain / Weight)
    xgb_model = trained_models["XGBoost"]
    xgb_importances = pd.Series(xgb_model.feature_importances_, index=feature_names).sort_values(ascending=False).head(top_k)

    xgb_importances.sort_values(ascending=True).plot(kind="barh", color="#10B981", ax=axes[1], edgecolor="black")
    axes[1].set_title(f"XGBoost Top {top_k} Features (Weight)")
    axes[1].set_xlabel("Relative Importance")

    fig.suptitle("Figure 4.10: Most Influential Predictors of Mentorship Session Effectiveness", fontsize=13, fontweight="bold")
    plt.tight_layout()

    out_file = os.path.join(output_dir, "figure_4_10_feature_importances.png")
    fig.savefig(out_file)
    plt.close(fig)
    print(f"[EVALUATION] Saved Figure 4.10 -> {out_file}")


def save_models(trained_models: dict, models_dir: str):
    """Serializes model binaries to disk."""
    filename_map = {
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
    """Main execution orchestrating preprocessing, cross-validation, and model evaluation."""
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    models_dir = os.path.join(base_dir, "saved_models")
    figures_dir = os.path.join(base_dir, "figures")

    os.makedirs(models_dir, exist_ok=True)
    os.makedirs(figures_dir, exist_ok=True)

    # 1. Preprocessing Pipeline
    X_train, X_test, y_train, y_test, feature_names = run_preprocessing(models_dir=models_dir)

    # 2. Model Initialization
    models = initialize_models()

    # 3. 5-Fold Stratified Cross-Validation
    cv_results = perform_cross_validation(models, X_train, y_train, n_splits=5)

    # 4. Training & Testing Evaluation
    trained_models, metrics_df, test_preds, test_probs = evaluate_models(
        models, cv_results, X_train, y_train, X_test, y_test
    )

    # 5. Export Table 4.4 Model Comparison
    table_csv = os.path.join(figures_dir, "table_4_4_model_comparison.csv")
    metrics_df.to_csv(table_csv, index=False)
    print(f"\n[REPORT] Saved Table 4.4 Model Comparison -> {table_csv}")
    print("\n--- Table 4.4: Model Performance Metrics Comparison ---")
    print(metrics_df.to_string(index=False))

    # 6. Generate Figures 4.8 - 4.10
    plot_confusion_matrices(y_test, test_preds, figures_dir)
    plot_roc_curves(y_test, test_probs, figures_dir)
    plot_feature_importances(trained_models, feature_names, figures_dir)

    # 7. Serialize Trained Models
    save_models(trained_models, models_dir)

    print("\n" + "=" * 60)
    print("[TRAINING] SPRINT 3 COMPLETED SUCCESSFULLY!")
    print("=" * 60)


if __name__ == "__main__":
    run_full_training()

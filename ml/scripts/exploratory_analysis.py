"""
INUA Mentorship Platform: Exploratory Data Analysis (EDA) Suite
Author: Michelle (Final Year Project - BICS Year 4, Strathmore University)
Sprint: Sprint 2 · Exploratory Data Analysis
Deliverables: Figures 4.1 - 4.7 (Saved to ml/figures/ at 300 DPI for Chapter 4)

Produces academic-grade statistical summaries, missing value analyses,
univariate frequency charts, bivariate hypothesis verifications,
and correlation heatmaps.
"""

import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

# Set publication style
plt.style.use("seaborn-v0_8-whitegrid" if "seaborn-v0_8-whitegrid" in plt.style.available else "default")
plt.rcParams.update({
    "font.family": "sans-serif",
    "font.size": 11,
    "axes.titlesize": 13,
    "axes.titleweight": "bold",
    "axes.labelsize": 11,
    "axes.labelweight": "semibold",
    "xtick.labelsize": 10,
    "ytick.labelsize": 10,
    "figure.titlesize": 14,
})

PALETTE_PRIMARY = "#6D28D9"
PALETTE_SECONDARY = "#8B5CF6"
PALETTE_MUTED = "#C4B5FD"
PALETTE_ACCENT = "#10B981"
PALETTE_ALERT = "#EF4444"


def load_dataset(csv_path: str) -> pd.DataFrame:
    """Loads and performs initial sanity verification on the INUA dataset."""
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Dataset not found at: {csv_path}")
    df = pd.read_csv(csv_path)
    print(f"[EDA] Dataset successfully loaded: {df.shape[0]} rows, {df.shape[1]} columns")
    return df


def generate_summary_tables(df: pd.DataFrame, output_dir: str):
    """Generates numerical and categorical descriptive summary tables."""
    print("[EDA] Generating summary statistical tables...")
    
    # 1. Missing Values Analysis
    missing_df = pd.DataFrame({
        "Feature": df.columns,
        "MissingCount": df.isnull().sum(),
        "MissingPercentage": (df.isnull().sum() / len(df) * 100).round(2),
        "DataType": df.dtypes.astype(str)
    }).reset_index(drop=True)
    
    missing_csv = os.path.join(output_dir, "table_4_1_missing_values.csv")
    missing_df.to_csv(missing_csv, index=False)
    print(f"      Saved missing values table -> {missing_csv}")

    # 2. Numerical Summary Statistics
    num_summary = df.describe().T.round(3)
    num_csv = os.path.join(output_dir, "table_4_2_numerical_summary.csv")
    num_summary.to_csv(num_csv)
    print(f"      Saved numerical summary table -> {num_csv}")

    # 3. Categorical Counts Summary
    cat_cols = df.select_dtypes(include=["object"]).columns
    cat_rows = []
    for col in cat_cols:
        val_counts = df[col].value_counts()
        cat_rows.append({
            "Feature": col,
            "UniqueValues": df[col].nunique(),
            "TopCategory": val_counts.index[0],
            "TopCategoryCount": val_counts.iloc[0],
            "TopCategoryPercent": round(val_counts.iloc[0] / len(df) * 100, 1)
        })
    cat_df = pd.DataFrame(cat_rows)
    cat_csv = os.path.join(output_dir, "table_4_3_categorical_summary.csv")
    cat_df.to_csv(cat_csv, index=False)
    print(f"      Saved categorical summary table -> {cat_csv}")


def plot_career_stage_distribution(df: pd.DataFrame, output_dir: str):
    """Figure 4.1: Mentee Academic Progression / Career Stage Distribution."""
    fig, ax = plt.subplots(figsize=(8, 4.8), dpi=300)
    order = ["Year1", "Year2", "Year3", "Year4", "Graduate", "EarlyCareer"]
    counts = df["career_stage"].value_counts().reindex(order)
    percentages = (counts / len(df) * 100).round(1)

    bars = ax.bar(order, counts, color=PALETTE_PRIMARY, edgecolor="#4C1D95", alpha=0.9, width=0.6)
    
    for bar, pct, cnt in zip(bars, percentages, counts):
        yval = bar.get_height()
        ax.text(bar.get_x() + bar.get_width() / 2.0, yval + 15, f"{cnt}\n({pct}%)",
                ha="center", va="bottom", fontsize=9, fontweight="bold", color="#374151")

    ax.set_title("Figure 4.1: Mentee Distribution by Academic Career Stage", pad=15)
    ax.set_xlabel("Career Stage")
    ax.set_ylabel("Number of Sessions")
    ax.set_ylim(0, max(counts) * 1.22)
    plt.tight_layout()
    
    out_file = os.path.join(output_dir, "figure_4_1_career_stage_distribution.png")
    fig.savefig(out_file)
    plt.close(fig)
    print(f"      Saved Figure 4.1 -> {out_file}")


def plot_field_of_study_distribution(df: pd.DataFrame, output_dir: str):
    """Figure 4.2: Multidisciplinary Representation Across Academic Fields."""
    fig, ax = plt.subplots(figsize=(9, 5), dpi=300)
    counts = df["field_of_study"].value_counts(ascending=True)
    percentages = (counts / len(df) * 100).round(1)

    bars = ax.barh(counts.index, counts, color=PALETTE_SECONDARY, edgecolor="#6D28D9", alpha=0.9)
    
    for bar, pct, cnt in zip(bars, percentages, counts):
        xval = bar.get_width()
        ax.text(xval + 8, bar.get_y() + bar.get_height() / 2.0, f"{cnt} ({pct}%)",
                ha="left", va="center", fontsize=9, fontweight="bold", color="#374151")

    ax.set_title("Figure 4.2: Mentee Distribution Across Undergraduate Disciplines", pad=15)
    ax.set_xlabel("Number of Sessions")
    ax.set_ylabel("Field of Study")
    ax.set_xlim(0, max(counts) * 1.25)
    plt.tight_layout()

    out_file = os.path.join(output_dir, "figure_4_2_field_of_study.png")
    fig.savefig(out_file)
    plt.close(fig)
    print(f"      Saved Figure 4.2 -> {out_file}")


def plot_session_type_distribution(df: pd.DataFrame, output_dir: str):
    """Figure 4.3: Distribution of Mentorship Session Types."""
    fig, ax = plt.subplots(figsize=(8.5, 4.8), dpi=300)
    counts = df["session_type"].value_counts()
    percentages = (counts / len(df) * 100).round(1)

    bars = ax.bar(counts.index, counts, color="#4338CA", edgecolor="#312E81", width=0.55)
    
    for bar, pct, cnt in zip(bars, percentages, counts):
        yval = bar.get_height()
        ax.text(bar.get_x() + bar.get_width() / 2.0, yval + 15, f"{cnt}\n({pct}%)",
                ha="center", va="bottom", fontsize=9, fontweight="bold", color="#374151")

    ax.set_title("Figure 4.3: Proportional Allocation of Mentorship Session Types", pad=15)
    ax.set_xlabel("Session Purpose")
    ax.set_ylabel("Total Scheduled Sessions")
    ax.set_ylim(0, max(counts) * 1.20)
    plt.xticks(rotation=15)
    plt.tight_layout()

    out_file = os.path.join(output_dir, "figure_4_3_session_type.png")
    fig.savefig(out_file)
    plt.close(fig)
    print(f"      Saved Figure 4.3 -> {out_file}")


def plot_mentor_exp_vs_career_support(df: pd.DataFrame, output_dir: str):
    """Figure 4.4: Mentor Experience vs. Career Support Rating (Validates Rule 3)."""
    fig, ax = plt.subplots(figsize=(8.5, 5), dpi=300)
    
    # Stratify experience into academic brackets
    df_copy = df.copy()
    bins = [0, 2, 5, 9, 15, 30]
    labels = ["1-2 yrs", "3-5 yrs", "6-9 yrs", "10-15 yrs", "16+ yrs"]
    df_copy["exp_bracket"] = pd.cut(df_copy["mentor_experience_years"], bins=bins, labels=labels)

    sns.boxplot(
        data=df_copy,
        x="exp_bracket",
        y="career_support_score",
        ax=ax,
        palette="Purples",
        boxprops=dict(alpha=0.85),
        showmeans=True,
        meanprops={"marker": "D", "markerfacecolor": "#EF4444", "markeredgecolor": "black", "markersize": 6}
    )

    means = df_copy.groupby("exp_bracket", observed=False)["career_support_score"].mean()
    for idx, (lbl, mean_val) in enumerate(means.items()):
        ax.text(idx, mean_val + 0.18, f"Mean: {mean_val:.2f}",
                ha="center", va="bottom", fontsize=9, fontweight="bold", color="#991B1B")

    ax.set_title("Figure 4.4: Career Support Likert Score Across Mentor Seniority Brackets", pad=15)
    ax.set_xlabel("Mentor Experience Bracket (Years)")
    ax.set_ylabel("Career Support Rating (1–5)")
    ax.set_ylim(0.5, 5.8)
    plt.tight_layout()

    out_file = os.path.join(output_dir, "figure_4_4_mentor_exp_vs_career_support.png")
    fig.savefig(out_file)
    plt.close(fig)
    print(f"      Saved Figure 4.4 -> {out_file}")


def plot_duration_by_session_type(df: pd.DataFrame, output_dir: str):
    """Figure 4.5: Duration Distributions by Session Type (Validates Rule 2)."""
    fig, ax = plt.subplots(figsize=(9, 5), dpi=300)
    
    order = ["Networking", "CV Review", "Career Guidance", "Interview Preparation", "Technical Coaching"]
    sns.violinplot(
        data=df,
        x="session_type",
        y="session_duration_minutes",
        order=order,
        palette="crest",
        inner="quartile",
        cut=0,
        ax=ax
    )

    ax.set_title("Figure 4.5: Empirical Duration Distributions Conditioned on Session Type", pad=15)
    ax.set_xlabel("Session Type")
    ax.set_ylabel("Duration (Minutes)")
    plt.xticks(rotation=15)
    plt.tight_layout()

    out_file = os.path.join(output_dir, "figure_4_5_duration_by_session_type.png")
    fig.savefig(out_file)
    plt.close(fig)
    print(f"      Saved Figure 4.5 -> {out_file}")


def plot_correlation_heatmap(df: pd.DataFrame, output_dir: str):
    """Figure 4.6: Pearson Correlation Heatmap across Quality Indices."""
    fig, ax = plt.subplots(figsize=(8.5, 7), dpi=300)
    
    cols = [
        "career_support_score",
        "psychosocial_support_score",
        "communication_quality",
        "goal_progress_score",
        "confidence_growth_score",
        "mentor_responsiveness_score",
        "effectiveness_index"
    ]
    labels = [
        "Career Support",
        "Psychosocial Support",
        "Communication Quality",
        "Goal Progress",
        "Confidence Growth",
        "Mentor Responsiveness",
        "Effectiveness Index"
    ]

    corr_matrix = df[cols].corr()

    mask = np.triu(np.ones_like(corr_matrix, dtype=bool))
    sns.heatmap(
        corr_matrix,
        mask=mask,
        annot=True,
        fmt=".2f",
        cmap="Purples",
        vmin=-0.1,
        vmax=1.0,
        square=True,
        xticklabels=labels,
        yticklabels=labels,
        cbar_kws={"shrink": 0.8, "label": "Pearson Correlation Coefficient (r)"},
        ax=ax
    )

    ax.set_title("Figure 4.6: Correlation Matrix of Psychometric Mentorship Features", pad=15)
    plt.xticks(rotation=35, ha="right")
    plt.yticks(rotation=0)
    plt.tight_layout()

    out_file = os.path.join(output_dir, "figure_4_6_correlation_heatmap.png")
    fig.savefig(out_file)
    plt.close(fig)
    print(f"      Saved Figure 4.6 -> {out_file}")


def plot_target_class_distribution(df: pd.DataFrame, output_dir: str):
    """Figure 4.7: Ground-Truth Session Effectiveness Target Distribution & Attendance Breakdown."""
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(11, 4.8), dpi=300)
    
    # 1. Overall Target Split
    target_counts = df["session_effectiveness"].value_counts()
    target_labels = ["Effective (1)", "Ineffective/Disrupted (0)"]
    target_vals = [target_counts.get(1, 0), target_counts.get(0, 0)]
    colors = [PALETTE_ACCENT, PALETTE_ALERT]

    ax1.pie(
        target_vals,
        labels=target_labels,
        autopct="%1.1f%%",
        startangle=140,
        colors=colors,
        explode=(0.04, 0),
        textprops={"fontweight": "bold"}
    )
    ax1.set_title("Overall Ground-Truth Class Balance")

    # 2. Breakdown by Attendance Status
    attendance_group = pd.crosstab(
        df["attendance_status"],
        df["session_effectiveness"],
        normalize="index"
    ) * 100

    attendance_group.plot(
        kind="bar",
        stacked=True,
        color=[PALETTE_ALERT, PALETTE_ACCENT],
        ax=ax2,
        edgecolor="black",
        alpha=0.9
    )
    ax2.set_title("Effectiveness Yield Conditioned on Attendance")
    ax2.set_xlabel("Attendance Status")
    ax2.set_ylabel("Proportion of Sessions (%)")
    ax2.legend(["Ineffective (0)", "Effective (1)"], loc="upper left", frameon=True)
    plt.xticks(rotation=0)

    fig.suptitle("Figure 4.7: Ground-Truth Mentorship Effectiveness Distribution", fontsize=13, fontweight="bold")
    plt.tight_layout()

    out_file = os.path.join(output_dir, "figure_4_7_target_class_distribution.png")
    fig.savefig(out_file)
    plt.close(fig)
    print(f"      Saved Figure 4.7 -> {out_file}")


def run_full_eda(csv_path: str = None, output_dir: str = None):
    """Runs the complete EDA suite and exports all artifacts."""
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    if csv_path is None:
        csv_path = os.path.join(base_dir, "data", "inua_mentorship_dataset.csv")
    if output_dir is None:
        output_dir = os.path.join(base_dir, "figures")
    
    os.makedirs(output_dir, exist_ok=True)
    
    print("=" * 60)
    print("INUA SPRINT 2: EXPLORATORY DATA ANALYSIS (EDA)")
    print("=" * 60)
    
    df = load_dataset(csv_path)
    generate_summary_tables(df, output_dir)
    
    print("\n[EDA] Plotting dissertation figures (300 DPI)...")
    plot_career_stage_distribution(df, output_dir)
    plot_field_of_study_distribution(df, output_dir)
    plot_session_type_distribution(df, output_dir)
    plot_mentor_exp_vs_career_support(df, output_dir)
    plot_duration_by_session_type(df, output_dir)
    plot_correlation_heatmap(df, output_dir)
    plot_target_class_distribution(df, output_dir)
    
    print("=" * 60)
    print(f"[EDA] Complete! All artifacts saved to: {output_dir}")
    print("=" * 60)


if __name__ == "__main__":
    run_full_eda()

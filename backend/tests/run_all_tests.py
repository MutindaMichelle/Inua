"""
INUA Mentorship Platform: Unified Automated Test Runner
Author: Michelle (Final Year Project - BICS Year 4, Strathmore University)

Executes all unit, functional, and end-to-end integration test suites:
  1. API Scaffolding & Health (test_api.py)
  2. Authentication & RBAC (test_auth.py)
  3. Session Booking & Lifecycle (test_sessions.py)
  4. Post-Session Feedback (test_feedback.py)
  5. Machine Learning Prediction Pipeline (test_predictions.py)
  6. Mentor Quality & Admin Analytics (FR-07, FR-08)
  7. End-to-End Workflow Integration (test_integration_workflows.py)

Usage from project root:
    python backend/tests/run_all_tests.py
"""

import os
import sys
import subprocess
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = Path(__file__).resolve().parent.parent.parent
BACKEND = ROOT / "backend"

TEST_SUITES = [
    ("API Scaffolding & Health", "backend/tests/test_api.py"),
    ("Authentication & RBAC (FR-01, IR-01, NFR-02)", "backend/tests/test_auth.py"),
    ("Session Booking & Lifecycle (FR-02, FR-03)", "backend/tests/test_sessions.py"),
    ("Feedback Submission (FR-04)", "backend/tests/test_feedback.py"),
    ("Prediction Pipeline & TreeSHAP (FR-05, FR-06, IR-02)", "backend/tests/test_predictions.py"),
    ("Mentor Quality & Admin Analytics (FR-07, FR-08)", "backend/tests/test_analytics_admin.py"),
    ("End-to-End Core Workflow Integration (Issue #10)", "backend/tests/test_integration_workflows.py"),
]


def main():
    print("\n" + "=" * 75)
    print("  INUA PLATFORM -- UNIFIED AUTOMATED TEST SUITE RUNNER")
    print("=" * 75)

    passed_suites = 0
    failed_suites = 0

    for title, script_rel in TEST_SUITES:
        print(f"\n[RUN] Running: {title} ({script_rel})...")
        print("-" * 75)

        cmd = [sys.executable, "-W", "ignore", str(ROOT / script_rel)]
        env = {**os.environ, "PYTHONIOENCODING": "utf-8"}
        res = subprocess.run(cmd, cwd=str(ROOT), env=env)

        if res.returncode == 0:
            passed_suites += 1
            print(f"[PASS] {title}")
        else:
            failed_suites += 1
            print(f"[FAIL] {title} (exit code: {res.returncode})")

    print("\n" + "=" * 75)
    print("  OVERALL TEST SUITE SUMMARY")
    print("=" * 75)
    print(f"  Total Test Suites Executed : {len(TEST_SUITES)}")
    print(f"  Suites Passed              : {passed_suites}")
    print(f"  Suites Failed              : {failed_suites}")
    print("=" * 75)

    if failed_suites == 0:
        print("  ALL BACKEND MVP TEST SUITES PASSED WITH 100% SUCCESS!\n")
        sys.exit(0)
    else:
        print(f"  WARNING: {failed_suites} test suite(s) reported failures.\n")
        sys.exit(1)


if __name__ == "__main__":
    main()

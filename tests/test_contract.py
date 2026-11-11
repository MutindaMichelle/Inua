"""
Contract test: the shape other teams rely on (U-CS 5 — session-value).
Verifies root GET /health and POST /predict return HTTP 200 and adhere to the Career Mentor OS contract.
"""
import sys
from pathlib import Path
from fastapi.testclient import TestClient

ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from app.main import app

client = TestClient(app)


def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"


def test_endpoint_responds():
    res = client.post("/predict", json={})
    assert res.status_code == 200, res.text
    body = res.json()
    assert "method" in body
    assert "probability" in body
    assert "factors" in body
    assert "suggestedIntervention" in body
    assert body["isSynthetic"] is True


def test_ucs5_contract_prepared_vs_unprepared():
    prepared = client.post(
        "/predict",
        json={
            "menteeId": "1",
            "mentorId": "1",
            "leadTimeHours": 48,
            "hasAgenda": True,
            "isFirstSession": False,
        },
    )
    assert prepared.status_code == 200
    p_data = prepared.json()
    assert 0.0 <= p_data["probability"] <= 1.0
    assert isinstance(p_data["factors"], list) and len(p_data["factors"]) > 0
    assert p_data["method"] == "xgboost"

    baseline_res = client.post(
        "/predict",
        json={
            "menteeId": "1",
            "mentorId": "1",
            "leadTimeHours": 48,
            "hasAgenda": True,
            "isFirstSession": False,
            "method": "baseline",
        },
    )
    assert baseline_res.status_code == 200
    assert baseline_res.json()["method"] == "baseline"


if __name__ == "__main__":
    test_health()
    test_endpoint_responds()
    test_ucs5_contract_prepared_vs_unprepared()
    print("[PASS] All U-CS 5 root contract tests passed!")

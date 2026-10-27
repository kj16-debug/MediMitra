import logging
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi.testclient import TestClient

from app.main import app
from app import config
from app.config import _safe_int
from app.schemas import AnalyzeRequest, Vitals
from app.llm import call_model

client = TestClient(app)

def make_request(text: str = "Child with fever for 2 days") -> AnalyzeRequest:
    return AnalyzeRequest(
        text=text,
        age_years=4,
        sex="female",
        pregnant=False,
        vitals=Vitals(temp_c=38.5, pulse_bpm=100, spo2_pct=96, systolic_bp=None, resp_rate=30),
        output_language="English",
    )

def make_escalate_payload(req: AnalyzeRequest) -> dict:
    return {
        "request": req.model_dump(),
        "local_result": {
            "chief_complaint": "fever",
            "symptoms": ["fever"],
            "duration": "2 days",
            "red_flags": [],
            "urgency": "yellow",
            "urgency_reason": "Clinical review advised",
            "summary_plain": "Local triage summary",
            "referral_note": "Local referral note. Decision support only. Not a diagnosis.",
            "suggested_questions": ["When did it start?"],
        },
    }

@pytest.fixture(autouse=True)
def setup_cloud_config(monkeypatch):
    monkeypatch.setattr(config, "DEMO_MODE", False)
    monkeypatch.setattr(config, "CLOUD_BASE_URL", "https://api.example.com/v1")
    monkeypatch.setattr(config, "CLOUD_API_KEY", "test-cloud-key")
    monkeypatch.setattr(config, "CLOUD_MODEL", "gemma-4-26b-a4b-it")

def test_content_none_with_reasoning_content_dosage_fallback(caplog):
    mock_choice = MagicMock()
    mock_choice.message.content = None
    mock_choice.message.reasoning_content = "Patient should be given 500 mg paracetamol tablets every 6 hours."
    mock_resp = MagicMock()
    mock_resp.choices = [mock_choice]

    req = make_request()
    with caplog.at_level(logging.WARNING):
        with patch("app.llm.AsyncOpenAI") as mock_openai:
            instance = MagicMock()
            instance.chat.completions.create = AsyncMock(return_value=mock_resp)
            mock_openai.return_value = instance

            import asyncio
            result = asyncio.run(call_model(req, cloud=True))

    # 1. Output is rules-only
    assert result.rules_only is True
    assert result.source == "cloud"
    assert result.urgency in ("yellow", "red")
    # 2. Reasoning text is NOT used as the answer
    assert "paracetamol" not in result.summary_plain
    assert "500 mg" not in result.summary_plain
    assert "paracetamol" not in result.referral_note
    # 3. Log shows generic message only
    assert "model returned no content" in caplog.text
    assert "500 mg" not in caplog.text

def test_empty_content_gives_escalate_fallback_200(caplog):
    mock_choice = MagicMock()
    mock_choice.message.content = ""
    mock_resp = MagicMock()
    mock_resp.choices = [mock_choice]

    req = make_request()
    payload = make_escalate_payload(req)

    with caplog.at_level(logging.WARNING):
        with patch("app.llm.AsyncOpenAI") as mock_openai:
            instance = MagicMock()
            instance.chat.completions.create = AsyncMock(return_value=mock_resp)
            mock_openai.return_value = instance

            resp = client.post("/api/escalate", json=payload)

    assert resp.status_code == 200
    data = resp.json()
    assert data["rules_only"] is True
    assert data["urgency"] in ("yellow", "red")
    assert "Decision support only. Not a diagnosis." in data["referral_note"]
    assert "model returned no content" in caplog.text

def test_new_env_value_falls_back_to_default_when_invalid():
    assert _safe_int(None, 4000) == 4000
    assert _safe_int("", 4000) == 4000
    assert _safe_int("   ", 4000) == 4000
    assert _safe_int("not_a_number", 4000) == 4000
    assert _safe_int("-100", 4000) == 4000
    assert _safe_int("0", 4000) == 4000
    assert _safe_int("2048", 4000) == 2048
    assert _safe_int(" 8192 ", 4000) == 8192

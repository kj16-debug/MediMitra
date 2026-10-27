import logging
import asyncio
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from openai import APITimeoutError
import httpx
from fastapi.testclient import TestClient

from app.main import app
from app import config
from app.schemas import AnalyzeRequest
from app.llm import call_model

client = TestClient(app)

MARKER_CASE_TEXT = "PATIENT_CONFIDENTIAL_MARKER_998877_XYZ"
MARKER_MODEL_SNIPPET = "MODEL_INTERNAL_SNIPPET_665544_ABC"

def make_completion(content: str):
    mock = MagicMock()
    mock.choices = [MagicMock()]
    mock.choices[0].message.content = content
    return mock

@pytest.fixture(autouse=True)
def setup_env(monkeypatch):
    monkeypatch.setattr(config, "DEMO_MODE", False)
    monkeypatch.setattr(config, "LOCAL_BASE_URL", "http://localhost:11434/v1")
    monkeypatch.setattr(config, "LOCAL_MODEL", "gemma4:e4b")
    monkeypatch.setattr(config, "LOCAL_API_KEY", "ollama")
    monkeypatch.setattr(config, "CLOUD_BASE_URL", "https://models.jarvislabs.net/v1")
    monkeypatch.setattr(config, "CLOUD_MODEL", "gemma-4-26b-a4b-it")
    monkeypatch.setattr(config, "CLOUD_API_KEY", "mock-cloud-key")

def test_first_attempt_failure_retry_success_logs_no_case_text(caplog):
    # 1. First attempt fails, retry without response-format succeeds
    valid_payload = """{
        "chief_complaint": "Mild fever",
        "symptoms": ["fever"],
        "duration": "1 day",
        "red_flags": [],
        "urgency": "yellow",
        "urgency_reason": "Clinical assessment needed.",
        "summary_plain": "Observed fever.",
        "referral_note": "Routine referral.",
        "suggested_questions": ["When did it start?"]
    }"""
    req = AnalyzeRequest(text=f"Severe headache with {MARKER_CASE_TEXT}")

    with caplog.at_level(logging.DEBUG):
        with patch("app.llm.AsyncOpenAI") as mock_openai:
            mock_instance = MagicMock()
            # First call raises, second call succeeds
            mock_instance.chat.completions.create = AsyncMock(
                side_effect=[Exception("Mock server error on first attempt"), make_completion(valid_payload)]
            )
            mock_openai.return_value = mock_instance

            res = asyncio.run(call_model(req, cloud=False))
            assert res.urgency == "yellow"
            assert res.rules_only is False

    # Marker must never appear in caplog
    assert MARKER_CASE_TEXT not in caplog.text

def test_both_attempts_fail_logs_no_case_text_and_no_error_echo(caplog):
    # 2. Both attempts fail -> endpoint gracefully falls back, marker never logged or echoed in error
    with caplog.at_level(logging.DEBUG):
        with patch("app.llm.AsyncOpenAI") as mock_openai:
            mock_instance = MagicMock()
            mock_instance.chat.completions.create = AsyncMock(
                side_effect=Exception(f"Upstream crash containing {MARKER_MODEL_SNIPPET}")
            )
            mock_openai.return_value = mock_instance

            res = client.post(
                "/api/analyze",
                json={"text": f"Severe pain {MARKER_CASE_TEXT}"},
            )

    assert res.status_code == 200
    data = res.json()
    assert data["rules_only"] is True
    assert MARKER_CASE_TEXT not in caplog.text
    assert MARKER_MODEL_SNIPPET not in caplog.text

def test_timeout_logs_no_case_text_and_no_error_echo(caplog):
    # 3. Timeout error -> marker never logged or echoed
    with caplog.at_level(logging.DEBUG):
        with patch("app.llm.AsyncOpenAI") as mock_openai:
            mock_instance = MagicMock()
            mock_request = httpx.Request("POST", "http://localhost:11434/v1/chat/completions")
            mock_instance.chat.completions.create = AsyncMock(
                side_effect=APITimeoutError(request=mock_request)
            )
            mock_openai.return_value = mock_instance

            # Test analyze endpoint fallback
            res_analyze = client.post(
                "/api/analyze",
                json={"text": f"Dizziness with {MARKER_CASE_TEXT}"},
            )
            assert res_analyze.status_code == 200

            # Test escalate endpoint error response
            res_escalate = client.post(
                "/api/escalate",
                json={
                    "request": {"text": f"Dizziness with {MARKER_CASE_TEXT}", "output_language": "English", "vitals": {}},
                    "local_result": res_analyze.json(),
                },
            )
            assert res_escalate.status_code == 503
            assert MARKER_CASE_TEXT not in res_escalate.text
            assert MARKER_CASE_TEXT not in caplog.text

def test_invalid_json_logs_no_case_text_and_no_raw_model_response(caplog):
    # 4. Invalid JSON from model -> neither case text nor invalid model snippet appears in logs or error
    invalid_raw_text = f"Non-JSON garbage containing {MARKER_MODEL_SNIPPET} and syntax error {{"
    with caplog.at_level(logging.DEBUG):
        with patch("app.llm.AsyncOpenAI") as mock_openai:
            mock_instance = MagicMock()
            mock_instance.chat.completions.create = AsyncMock(
                return_value=make_completion(invalid_raw_text)
            )
            mock_openai.return_value = mock_instance

            res = client.post(
                "/api/analyze",
                json={"text": f"Stomach ache {MARKER_CASE_TEXT}"},
            )

    assert res.status_code == 200
    data = res.json()
    assert data["rules_only"] is True
    assert MARKER_CASE_TEXT not in caplog.text
    assert MARKER_MODEL_SNIPPET not in caplog.text
    assert MARKER_MODEL_SNIPPET not in str(data)

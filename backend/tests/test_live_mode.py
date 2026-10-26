import asyncio
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from openai import APITimeoutError
import httpx
from fastapi.testclient import TestClient

from app.main import app
from app import config
from app.schemas import AnalyzeRequest, EscalateRequest, TriageResult
from app.llm import call_model, rules_only_result, clean_llm_output
from app.red_flags import apply_red_flag_rules

client = TestClient(app)

def make_completion(content: str):
    mock = MagicMock()
    mock.choices = [MagicMock()]
    mock.choices[0].message.content = content
    return mock

@pytest.fixture(autouse=True)
def reset_config(monkeypatch):
    monkeypatch.setattr(config, "DEMO_MODE", False)
    monkeypatch.setattr(config, "LOCAL_BASE_URL", "http://localhost:11434/v1")
    monkeypatch.setattr(config, "LOCAL_API_KEY", "ollama")
    monkeypatch.setattr(config, "LOCAL_MODEL", "gemma4:e4b")
    monkeypatch.setattr(config, "CLOUD_BASE_URL", "https://models.jarvislabs.net/v1")
    monkeypatch.setattr(config, "CLOUD_API_KEY", "mock-secret-key")
    monkeypatch.setattr(config, "CLOUD_MODEL", "gemma-4-26b-a4b-it")

def test_call_model_valid_json():
    # 1. Valid JSON mocked model response
    valid_payload = """{
        "chief_complaint": "Mild rash",
        "symptoms": ["itching", "rash"],
        "duration": "1 day",
        "red_flags": [],
        "urgency": "green",
        "urgency_reason": "Mild localized rash without systemic symptoms.",
        "summary_plain": "Patient has mild rash.",
        "referral_note": "Please review rash. Urgency: green. Decision-support prototype. Not a diagnostic tool. Mock data only.",
        "suggested_questions": ["Is it spreading?", "Any fever?"],
        "rule_reasons": [],
        "source": "local",
        "rules_only": false
    }"""
    with patch("app.llm.AsyncOpenAI") as mock_openai:
        mock_instance = MagicMock()
        mock_instance.chat.completions.create = AsyncMock(return_value=make_completion(valid_payload))
        mock_openai.return_value = mock_instance

        req = AnalyzeRequest(text="Mild itching rash on forearm")
        res = asyncio.run(call_model(req, cloud=False))
        assert res.urgency == "green"
        assert res.chief_complaint == "Mild rash"
        assert res.rules_only is False
        assert res.source == "local"

def test_call_model_json_inside_markdown_fences():
    # 2. JSON inside markdown code fences
    fenced_payload = """
    Here is the clinical triage assessment:
    ```json
    {
        "chief_complaint": "Persistent cough",
        "symptoms": ["cough", "mild fever"],
        "duration": "4 days",
        "red_flags": [],
        "urgency": "YELLOW",
        "urgency_reason": "Cough for 4 days requires primary center evaluation.",
        "summary_plain": "Persistent cough.",
        "referral_note": "Refer for assessment.",
        "suggested_questions": ["Any blood in sputum?"]
    }
    ```
    """
    with patch("app.llm.AsyncOpenAI") as mock_openai:
        mock_instance = MagicMock()
        mock_instance.chat.completions.create = AsyncMock(return_value=make_completion(fenced_payload))
        mock_openai.return_value = mock_instance

        req = AnalyzeRequest(text="Coughing for 4 days")
        res = asyncio.run(call_model(req, cloud=False))
        assert res.urgency == "yellow"
        assert res.chief_complaint == "Persistent cough"

def test_analyze_invalid_json_falls_back_to_rules_only():
    # 3. Invalid JSON triggers rules_only fallback (never green)
    with patch("app.llm.AsyncOpenAI") as mock_openai:
        mock_instance = MagicMock()
        mock_instance.chat.completions.create = AsyncMock(return_value=make_completion("This is plain text with no JSON."))
        mock_openai.return_value = mock_instance

        res = client.post("/api/analyze", json={"text": "Normal checkup, no pain", "vitals": {"pulse_bpm": 72}})
        assert res.status_code == 200
        data = res.json()
        assert data["rules_only"] is True
        assert data["urgency"] in ("yellow", "red")
        assert data["urgency"] != "green"
        assert "AI unavailable - assess manually" in data["urgency_reason"]

def test_analyze_timeout_falls_back_to_rules_only():
    # 4. Model timeout triggers rules_only fallback (never green)
    with patch("app.llm.AsyncOpenAI") as mock_openai:
        mock_instance = MagicMock()
        mock_request = httpx.Request("POST", "http://localhost:11434/v1/chat/completions")
        mock_instance.chat.completions.create = AsyncMock(side_effect=APITimeoutError(request=mock_request))
        mock_openai.return_value = mock_instance

        res = client.post("/api/analyze", json={"text": "Feeling slightly unwell"})
        assert res.status_code == 200
        data = res.json()
        assert data["rules_only"] is True
        assert data["urgency"] == "yellow"
        assert "AI unavailable" in data["urgency_reason"]

def test_model_says_green_but_spo2_low_final_must_be_red():
    # 5. Model says green while SpO2 is low (87%) -> final MUST be red
    green_payload = """{
        "chief_complaint": "Tiredness",
        "symptoms": ["tired"],
        "urgency": "green",
        "urgency_reason": "Patient is only mildly tired.",
        "summary_plain": "Mild tiredness.",
        "referral_note": "Routine review.",
        "suggested_questions": []
    }"""
    with patch("app.llm.AsyncOpenAI") as mock_openai:
        mock_instance = MagicMock()
        mock_instance.chat.completions.create = AsyncMock(return_value=make_completion(green_payload))
        mock_openai.return_value = mock_instance

        res = client.post("/api/analyze", json={"text": "Tiredness", "vitals": {"spo2_pct": 87}})
        assert res.status_code == 200
        data = res.json()
        assert data["urgency"] == "red"
        assert any("oxygen" in r.lower() for r in data["rule_reasons"])
        assert "Final urgency: RED" in data["referral_note"]

def test_self_harm_statement_produces_human_support_wording():
    # 6. Self-harm statement produces urgent human support directives
    with patch("app.llm.AsyncOpenAI") as mock_openai:
        mock_instance = MagicMock()
        mock_instance.chat.completions.create = AsyncMock(return_value=make_completion("{}"))
        mock_openai.return_value = mock_instance

        res = client.post("/api/analyze", json={"text": "I feel hopeless and want to end my life"})
        assert res.status_code == 200
        data = res.json()
        assert data["urgency"] == "red"
        assert any("human support" in r.lower() for r in data["red_flags"])
        assert "IMMEDIATE HUMAN SUPPORT REQUIRED" in data["referral_note"]
        assert "IMMEDIATE HUMAN SUPPORT REQUIRED" in data["summary_plain"]

def test_independent_local_and_cloud_configuration(monkeypatch):
    # 7a. Only cloud configured (local unconfigured): analyze falls back to rules-only; escalate works
    monkeypatch.setattr(config, "LOCAL_MODEL", "")
    monkeypatch.setattr(config, "CLOUD_MODEL", "gemma-4-26b-a4b-it")
    monkeypatch.setattr(config, "CLOUD_API_KEY", "valid-cloud-key")

    cloud_payload = """{
        "chief_complaint": "Severe fever",
        "symptoms": ["high fever", "chills"],
        "urgency": "yellow",
        "urgency_reason": "High fever warrants evaluation.",
        "summary_plain": "Severe fever review.",
        "referral_note": "Cloud referral note.",
        "suggested_questions": []
    }"""
    with patch("app.llm.AsyncOpenAI") as mock_openai:
        mock_instance = MagicMock()
        mock_instance.chat.completions.create = AsyncMock(return_value=make_completion(cloud_payload))
        mock_openai.return_value = mock_instance

        # Analyze (local call) should fall back to rules-only
        res_analyze = client.post("/api/analyze", json={"text": "Fever and chills for 2 days"})
        assert res_analyze.status_code == 200
        data_analyze = res_analyze.json()
        assert data_analyze["rules_only"] is True
        assert data_analyze["urgency"] == "yellow"

        # Escalate (cloud call) should succeed independently
        res_escalate = client.post("/api/escalate", json={
            "request": {"text": "Fever and chills for 2 days", "output_language": "English", "vitals": {}},
            "local_result": data_analyze,
        })
        assert res_escalate.status_code == 200
        data_escalate = res_escalate.json()
        assert data_escalate["source"] == "cloud"
        assert data_escalate["rules_only"] is False

    # 7b. Only local configured (cloud unconfigured): analyze succeeds; escalate fails with 503
    monkeypatch.setattr(config, "LOCAL_MODEL", "gemma4:e4b")
    monkeypatch.setattr(config, "CLOUD_MODEL", "")
    monkeypatch.setattr(config, "CLOUD_API_KEY", "")

    local_payload = """{
        "chief_complaint": "Mild headache",
        "symptoms": ["headache"],
        "urgency": "green",
        "urgency_reason": "Isolated headache without danger signs.",
        "summary_plain": "Mild headache.",
        "referral_note": "Routine advice.",
        "suggested_questions": []
    }"""
    with patch("app.llm.AsyncOpenAI") as mock_openai:
        mock_instance = MagicMock()
        mock_instance.chat.completions.create = AsyncMock(return_value=make_completion(local_payload))
        mock_openai.return_value = mock_instance

        res_local = client.post("/api/analyze", json={"text": "Mild headache this morning"})
        assert res_local.status_code == 200
        assert res_local.json()["rules_only"] is False
        assert res_local.json()["urgency"] == "green"

        res_escalate_fail = client.post("/api/escalate", json={
            "request": {"text": "Mild headache this morning", "output_language": "English", "vitals": {}},
            "local_result": res_local.json(),
        })
        assert res_escalate_fail.status_code == 503
        assert "not configured" in res_escalate_fail.json()["detail"]

def test_api_status_returns_only_five_keys_and_no_secrets(monkeypatch):
    # 8. GET /api/status returns ONLY demo_mode, local_configured, cloud_configured, local_model, cloud_model
    monkeypatch.setattr(config, "DEMO_MODE", False)
    monkeypatch.setattr(config, "LOCAL_MODEL", "local-test-model")
    monkeypatch.setattr(config, "CLOUD_MODEL", "cloud-test-model")
    monkeypatch.setattr(config, "CLOUD_API_KEY", "super-secret-key-123")

    res = client.get("/api/status")
    assert res.status_code == 200
    data = res.json()
    assert set(data.keys()) == {"demo_mode", "local_configured", "cloud_configured", "local_model", "cloud_model"}
    assert data["demo_mode"] is False
    assert data["local_configured"] is True
    assert data["cloud_configured"] is True
    assert data["local_model"] == "local-test-model"
    assert data["cloud_model"] == "cloud-test-model"
    assert "super-secret-key-123" not in str(data)

    # In demo mode
    monkeypatch.setattr(config, "DEMO_MODE", True)
    res_demo = client.get("/api/status")
    assert res_demo.status_code == 200
    data_demo = res_demo.json()
    assert set(data_demo.keys()) == {"demo_mode", "local_configured", "cloud_configured", "local_model", "cloud_model"}
    assert data_demo["demo_mode"] is True

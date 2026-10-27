import logging
import asyncio
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from app.schemas import AnalyzeRequest, TriageResult
from app.output_filter import contains_treatment_or_dosage, is_text_prohibited
from app.llm import call_model
from app import config

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

@pytest.mark.parametrize(
    "prohibited_text",
    [
        # Group 1: Numbers followed by units
        "Take 500 mg daily",
        "Administer 2 tablets after food",
        "Give 5 ml oral fluid",
        "Requires 100 mcg dose",
        "Use 2 puffs as needed",
        "Dispense 500 IU injection",
        "Give 5 g sachet",
        # Group 2: Action / prescription words
        "Prescribe broad-spectrum therapy",
        "Patient needs prescription for recovery",
        "Start on medication immediately",
        "Administer supportive medicine",
        "Start antibiotic treatment",
        "Cough syrup indicated",
        "Inject intramuscularly",
        "Give him oral fluids immediately",
        "Give her emergency care",
        "Give them immediate remedy",
        # Group 3: Drug names
        "Advised paracetamol for comfort",
        "Acetaminophen taken earlier",
        "Start amoxicillin cycle",
        "Needs ibuprofen for swelling",
        "Take aspirin if fever persists",
        "Azithromycin 3-day course",
        "Administer diclofenac",
        "Hydrate with ORS solution",
        "IV morphine needed",
        "Salbutamol nebulization",
        "Adrenaline standby",
        "Epinephrine auto-injector",
        "Insulin adjustment required",
        "Diazepam for convulsions",
    ],
)
def test_filter_detects_prohibited_patterns(prohibited_text):
    assert is_text_prohibited(prohibited_text) is True

def test_filter_clean_text_passes():
    clean_texts = [
        "Patient reports mild headache and tiredness for 2 days.",
        "Observe child closely for fast breathing or chest in-drawing.",
        "Ensure child drinks clean boiled water and rests.",
        "Follow up with primary health center if symptoms do not improve in 48 hours.",
    ]
    for text in clean_texts:
        assert is_text_prohibited(text) is False

def test_model_output_with_treatment_rejected_and_falls_back(caplog):
    # Model returns urgency green, but includes dosage in summary
    poisoned_payload = """{
        "chief_complaint": "Mild fever",
        "symptoms": ["fever"],
        "duration": "1 day",
        "red_flags": [],
        "urgency": "green",
        "urgency_reason": "Low grade temperature without complications.",
        "summary_plain": "Patient has fever, give 500 mg paracetamol at home.",
        "referral_note": "Routine review.",
        "suggested_questions": ["When did it start?"]
    }"""
    req = AnalyzeRequest(text="Fever since morning")

    with caplog.at_level(logging.WARNING):
        with patch("app.llm.AsyncOpenAI") as mock_openai:
            mock_instance = MagicMock()
            mock_instance.chat.completions.create = AsyncMock(return_value=make_completion(poisoned_payload))
            mock_openai.return_value = mock_instance

            res = asyncio.run(call_model(req, cloud=False))

    # Assertions per Piece 1:
    # 1. Output is discarded and falls back to rules_only result
    assert res.rules_only is True
    # 2. Fallback is never green (minimum yellow)
    assert res.urgency in ("yellow", "red")
    assert res.urgency != "green"
    # 3. Model output text was discarded
    assert "paracetamol" not in res.summary_plain
    assert "500 mg" not in res.summary_plain
    # 4. Caplog shows only generic message, and NO prohibited model text
    assert "model output rejected by filter" in caplog.text
    assert "paracetamol" not in caplog.text
    assert "500 mg" not in caplog.text

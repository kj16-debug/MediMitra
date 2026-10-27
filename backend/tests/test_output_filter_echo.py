import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from app.output_filter import is_text_prohibited, contains_treatment_or_dosage
from app.schemas import AnalyzeRequest, TriageResult
from app.llm import call_model
from app import config

# --- 1. Passes when the input mentions it ---
@pytest.mark.parametrize(
    "echo_text,matching_case",
    [
        ("Mother gave ORS at home", "Child with diarrhoea, mother gave ORS at home"),
        ("took medicine from a pharmacy", "Adult cough 5 days, took medicine from a pharmacy"),
        ("mother gave paracetamol last night", "Fever 2 days, mother gave paracetamol last night, drinking little"),
    ],
)
def test_echo_history_passes_with_matching_case_text(echo_text, matching_case):
    assert is_text_prohibited(echo_text, case_text=matching_case) is False
    assert contains_treatment_or_dosage(echo_text, case_text=matching_case) is False

def test_triage_result_with_echoed_history_passes():
    case_text = "Child with diarrhoea, mother gave ORS at home. Fever 2 days, mother gave paracetamol last night."
    result = TriageResult(
        chief_complaint="Diarrhoea and fever",
        symptoms=["Diarrhoea", "Fever"],
        duration="2 days",
        red_flags=[],
        urgency="yellow",
        urgency_reason="Mother gave ORS at home and mother gave paracetamol last night.",
        summary_plain="Patient took medicine from a pharmacy. Mother gave ORS at home.",
        referral_note="Mother gave ORS at home. Decision support only. Not a diagnosis.",
        suggested_questions=["How many episodes?", "Is child able to drink?"],
    )
    # With matching case_text, this must pass
    assert contains_treatment_or_dosage(result, case_text=case_text + " took medicine from a pharmacy.") is False

# --- 2. Rejected when input does NOT mention it ---
@pytest.mark.parametrize(
    "echo_text",
    [
        "Mother gave ORS at home",
        "took medicine from a pharmacy",
        "mother gave paracetamol last night",
    ],
)
def test_echo_history_rejected_when_not_in_case_text(echo_text):
    # Empty case text
    assert is_text_prohibited(echo_text, case_text="") is True
    assert contains_treatment_or_dosage(echo_text, case_text="") is True

    # Unrelated case text
    unrelated_case = "Patient has mild headache and runny nose for 3 days."
    assert is_text_prohibited(echo_text, case_text=unrelated_case) is True
    assert contains_treatment_or_dosage(echo_text, case_text=unrelated_case) is True

# --- 3. Rejected even when in the input (advice verbs, dosages, strict actions) ---
@pytest.mark.parametrize(
    "prohibited_phrase",
    [
        "give ORS",
        "take paracetamol",
        "start antibiotics",
        "paracetamol 500 mg",
        "administer",
        "give him water",
        "dose",
    ],
)
def test_rejected_even_when_in_input(prohibited_phrase):
    # Even if the case text includes every one of these words:
    permissive_case = (
        "Mother gave ORS, took paracetamol, doctor gave antibiotics 500 mg, "
        "worker did administer water dose to him."
    )
    assert is_text_prohibited(prohibited_phrase, case_text=permissive_case) is True
    assert contains_treatment_or_dosage(prohibited_phrase, case_text=permissive_case) is True

# --- 4. Unrelated drug name rejected even if another drug name is in case text ---
def test_unrelated_drug_rejected_when_other_drug_in_case_text():
    case_text = "Fever for 2 days, mother gave paracetamol last night."

    # paracetamol with neutral history passes
    assert is_text_prohibited("mother gave paracetamol", case_text=case_text) is False

    # unrelated drugs not mentioned in case_text are strictly rejected
    assert is_text_prohibited("ibuprofen was given", case_text=case_text) is True
    assert is_text_prohibited("start amoxicillin", case_text=case_text) is True
    assert is_text_prohibited("take aspirin", case_text=case_text) is True
    assert is_text_prohibited("azithromycin indicated", case_text=case_text) is True

# --- 5. Harmless texts pass filter ---
@pytest.mark.parametrize(
    "harmless_text",
    [
        "Refer to the district doctors today",
        "Patient was sitting at a table",
        "Orders from supervisor",
        "Fever for 2 days, vomiting, drinking little",
        "Breathing fast, SpO2 88",
    ],
)
def test_harmless_texts_pass_with_and_without_case_text(harmless_text):
    assert is_text_prohibited(harmless_text) is False
    assert is_text_prohibited(harmless_text, case_text="") is False
    assert is_text_prohibited(harmless_text, case_text="Mother gave paracetamol") is False

# --- 6. End-to-end call_model integration with filter (mocked network) ---
def test_call_model_passes_echoed_history_but_rejects_advice(monkeypatch):
    import asyncio
    monkeypatch.setattr(config, "DEMO_MODE", False)
    monkeypatch.setattr(config, "LOCAL_BASE_URL", "http://localhost:11434/v1")
    monkeypatch.setattr(config, "LOCAL_MODEL", "gemma4:e4b")
    monkeypatch.setattr(config, "LOCAL_API_KEY", "ollama")

    req = AnalyzeRequest(text="Child with diarrhoea, mother gave ORS at home.")

    # A) Model echoes neutral history that matches case_text
    allowed_json = (
        '{"urgency": "yellow", "chief_complaint": "Diarrhoea", '
        '"summary_plain": "Mother gave ORS at home.", '
        '"urgency_reason": "Child has diarrhoea.", '
        '"referral_note": "Mother gave ORS at home. Decision support only. Not a diagnosis.", '
        '"suggested_questions": ["How long?"]}'
    )
    mock_resp = MagicMock()
    mock_resp.choices = [MagicMock()]
    mock_resp.choices[0].message.content = allowed_json

    with patch("openai.resources.chat.completions.AsyncCompletions.create", new_callable=AsyncMock) as mock_create:
        mock_create.return_value = mock_resp
        res = asyncio.run(call_model(req, cloud=False))
        assert res.rules_only is False
        assert "Decision support only. Not a diagnosis." in res.referral_note

    # B) Model advises "give ORS" -> rejected by filter, falls back to rules_only
    prohibited_json = (
        '{"urgency": "yellow", "chief_complaint": "Diarrhoea", '
        '"summary_plain": "Please give ORS immediately.", '
        '"urgency_reason": "Child needs hydration.", '
        '"referral_note": "Give ORS. Decision support only. Not a diagnosis.", '
        '"suggested_questions": ["How long?"]}'
    )
    mock_resp_prohibited = MagicMock()
    mock_resp_prohibited.choices = [MagicMock()]
    mock_resp_prohibited.choices[0].message.content = prohibited_json

    with patch("openai.resources.chat.completions.AsyncCompletions.create", new_callable=AsyncMock) as mock_create:
        mock_create.return_value = mock_resp_prohibited
        res = asyncio.run(call_model(req, cloud=False))
        assert res.rules_only is True

import pytest
from app.output_filter import is_text_prohibited, contains_treatment_or_dosage
from app.schemas import TriageResult

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
def test_harmless_texts_pass_filter(harmless_text):
    assert is_text_prohibited(harmless_text) is False
    assert contains_treatment_or_dosage(harmless_text) is False

def test_triage_result_with_harmless_texts_passes():
    result = TriageResult(
        chief_complaint="Fever for 2 days, vomiting, drinking little",
        symptoms=["Fever", "Vomiting"],
        duration="2 days",
        red_flags=["Breathing fast, SpO2 88"],
        urgency="yellow",
        urgency_reason="Orders from supervisor to assess hydration.",
        summary_plain="Patient was sitting at a table during field visit.",
        referral_note="Refer to the district doctors today. Decision support only. Not a diagnosis.",
        suggested_questions=["How many days?", "Can child drink?"],
    )
    assert contains_treatment_or_dosage(result) is False

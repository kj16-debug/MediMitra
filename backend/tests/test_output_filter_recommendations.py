import pytest
from app.output_filter import is_text_prohibited, contains_treatment_or_dosage

PERMISSIVE_CASE = (
    "Mother gave ORS at home. Patient took medicine from a pharmacy. "
    "Mother gave paracetamol last night. Child was given antibiotics."
)

@pytest.mark.parametrize(
    "prohibited_text",
    [
        "Paracetamol is recommended",
        "Consider ORS",
        "ORS should be continued",
        "Try paracetamol for the fever",
        "The child needs antibiotics",
        "Paracetamol would benefit the patient",
        "ORS is indicated for hydration",
        "Worker must ensure ORS intake",
        "Doctor suggests paracetamol",
        "Nurse advised medicine",
    ],
)
def test_recommendation_cues_rejected_even_when_in_case_text(prohibited_text):
    # Even though PERMISSIVE_CASE contains paracetamol, ORS, medicine, antibiotics
    assert is_text_prohibited(prohibited_text, case_text=PERMISSIVE_CASE) is True
    assert contains_treatment_or_dosage(prohibited_text, case_text=PERMISSIVE_CASE) is True

@pytest.mark.parametrize(
    "allowed_history",
    [
        "Mother gave ORS at home",
        "Patient took medicine from a pharmacy",
        "Mother gave paracetamol last night",
        "Patient was given paracetamol earlier",
        "Child has been taking paracetamol",
    ],
)
def test_neutral_past_history_still_passes_with_case_text(allowed_history):
    assert is_text_prohibited(allowed_history, case_text=PERMISSIVE_CASE) is False
    assert contains_treatment_or_dosage(allowed_history, case_text=PERMISSIVE_CASE) is False

@pytest.mark.parametrize(
    "text_without_case",
    [
        "Mother gave ORS at home",
        "Patient took medicine from a pharmacy",
        "Mother gave paracetamol last night",
        "Paracetamol is recommended",
        "Consider ORS",
    ],
)
def test_empty_case_text_maintains_strict_rejection(text_without_case):
    # With default / empty case_text, all terms are rejected exactly as before
    assert is_text_prohibited(text_without_case) is True
    assert is_text_prohibited(text_without_case, case_text="") is True

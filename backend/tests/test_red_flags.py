import pytest
from app.schemas import AnalyzeRequest, TriageResult
from app.red_flags import apply_red_flag_rules

def result(level="green"):
    return TriageResult(chief_complaint="demo", symptoms=[], duration=None, red_flags=[], urgency=level, urgency_reason="demo", summary_plain="demo", referral_note="demo", suggested_questions=[])

@pytest.mark.parametrize("text", ["chest pain", "pressure in chest", "tightness in chest"])
def test_chest_pain(text): assert apply_red_flag_rules(AnalyzeRequest(text=text), result()).urgency == "red"
@pytest.mark.parametrize("text", ["difficulty breathing", "can't breathe", "short of breath", "breathless"])
def test_breathing(text): assert apply_red_flag_rules(AnalyzeRequest(text=text), result()).urgency == "red"
def test_low_oxygen(): assert apply_red_flag_rules(AnalyzeRequest(text="fine", vitals={"spo2_pct": 91}), result()).urgency == "red"
def test_low_oxygen_override_updates_handoff_text():
    r = result()
    r.summary_plain = "Reported stable. Current urgency: green."
    r.referral_note = "Referral. Urgency: green."
    apply_red_flag_rules(AnalyzeRequest(text="fine", vitals={"spo2_pct": 88}), r)
    assert r.urgency == "red"
    assert "Final urgency: RED" in r.summary_plain
    assert "Final urgency: RED" in r.referral_note
    assert "Low oxygen level" in r.urgency_reason
def test_oxygen_nontrigger(): assert apply_red_flag_rules(AnalyzeRequest(text="fine", vitals={"spo2_pct": 92}), result()).urgency == "green"
@pytest.mark.parametrize("text", ["unconscious", "fainted and not waking", "seizure", "fits"])
def test_unconscious(text): assert apply_red_flag_rules(AnalyzeRequest(text=text), result()).urgency == "red"
@pytest.mark.parametrize("text", ["face drooping", "slurred speech", "sudden weakness one side"])
def test_stroke(text): assert apply_red_flag_rules(AnalyzeRequest(text=text), result()).urgency == "red"
@pytest.mark.parametrize("text", ["heavy bleeding", "bleeding won't stop", "vomiting blood"])
def test_bleeding(text): assert apply_red_flag_rules(AnalyzeRequest(text=text), result()).urgency == "red"
@pytest.mark.parametrize("text", ["bleeding", "severe headache", "reduced baby movement"])
def test_pregnancy(text): assert apply_red_flag_rules(AnalyzeRequest(text=text, pregnant=True), result()).urgency == "red"
def test_pregnancy_nontrigger(): assert apply_red_flag_rules(AnalyzeRequest(text="headache", pregnant=False), result()).urgency == "green"
def test_infant_fever(): assert apply_red_flag_rules(AnalyzeRequest(text="fever", age_years=.2, vitals={"temp_c": 38}), result()).urgency == "red"
def test_infant_nontrigger(): assert apply_red_flag_rules(AnalyzeRequest(text="fever", age_years=.3, vitals={"temp_c": 38}), result()).urgency == "green"
def test_high_fever(): assert apply_red_flag_rules(AnalyzeRequest(text="fever", vitals={"temp_c": 39.5}), result()).urgency == "yellow"
def test_high_fever_nontrigger(): assert apply_red_flag_rules(AnalyzeRequest(text="fine", vitals={"temp_c": 39.4}), result()).urgency == "green"
def test_high_pulse(): assert apply_red_flag_rules(AnalyzeRequest(text="fine", vitals={"pulse_bpm": 131}), result()).urgency == "yellow"
def test_high_pulse_nontrigger(): assert apply_red_flag_rules(AnalyzeRequest(text="fine", vitals={"pulse_bpm": 130}), result()).urgency == "green"
def test_low_bp(): assert apply_red_flag_rules(AnalyzeRequest(text="fine", vitals={"systolic_bp": 89}), result()).urgency == "red"
def test_low_bp_nontrigger(): assert apply_red_flag_rules(AnalyzeRequest(text="fine", vitals={"systolic_bp": 90}), result()).urgency == "green"
@pytest.mark.parametrize("text", ["want to die", "kill myself", "end my life"])
def test_self_harm(text): assert "immediate human support" in apply_red_flag_rules(AnalyzeRequest(text=text), result()).red_flags[0]
def test_self_harm_nontrigger(): assert apply_red_flag_rules(AnalyzeRequest(text="feeling sad"), result()).urgency == "green"
@pytest.mark.parametrize("level", ["yellow", "red"])
def test_never_lowers_urgency(level): assert apply_red_flag_rules(AnalyzeRequest(text="routine"), result(level)).urgency == level

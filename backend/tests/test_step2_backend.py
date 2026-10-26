import pytest
from app.schemas import AnalyzeRequest, TriageResult
from app.red_flags import apply_red_flag_rules
from app.llm import clean_llm_output, rules_only_result
from app.fixtures import DEMO_PATIENTS

def mock_triage_result(urgency="green"):
    return TriageResult(
        chief_complaint="Stable patient",
        symptoms=["Cough"],
        duration="2 days",
        red_flags=[],
        urgency=urgency,
        urgency_reason="Model assessed as stable.",
        summary_plain="Reported stable symptoms. Urgency: green.",
        referral_note="Referral note: routine follow-up. Urgency: green.",
        suggested_questions=["How long?"]
    )

def test_model_says_green_but_spo2_low_forces_red():
    # 1. Model says green, but SpO2 is low (88%) -> final urgency must be red
    req = AnalyzeRequest(text="Feeling mildly tired", vitals={"spo2_pct": 88})
    res = mock_triage_result(urgency="green")
    final = apply_red_flag_rules(req, res)
    assert final.urgency == "red"
    assert "Low oxygen level" in final.urgency_reason
    assert "Final urgency: RED" in final.referral_note

def test_self_harm_human_support_wording_present():
    # 2. Self-harm statement hit -> immediate human support wording must be present
    req = AnalyzeRequest(text="I cannot take this anymore and want to die")
    res = mock_triage_result(urgency="green")
    final = apply_red_flag_rules(req, res)
    assert final.urgency == "red"
    assert any("immediate human support" in rf.lower() for rf in final.red_flags)
    assert "IMMEDIATE HUMAN SUPPORT REQUIRED" in final.referral_note
    assert "IMMEDIATE HUMAN SUPPORT REQUIRED" in final.summary_plain

def test_kabir_fever_vomiting_case():
    # 3. Kabir case (fever + vomiting) -> even if model says green, rules override to yellow
    kabir_demo = next(p for p in DEMO_PATIENTS if "Kabir" in p["name"])
    req = kabir_demo["request"]
    res = mock_triage_result(urgency="green")
    final = apply_red_flag_rules(req, res)
    assert final.urgency == "yellow"
    assert any("vomit" in r.lower() for r in final.rule_reasons)
    assert "Final urgency: YELLOW" in final.referral_note

def test_clean_llm_output_markdown_fences_and_uppercase():
    # 4. Strip markdown code fences, reasoning tags, normalize uppercase urgency and trim questions
    raw = """
    <think>Model internal thoughts</think>
    ```json
    {
        "chief_complaint": "Chest tightness",
        "symptoms": ["chest tightness", "sweating"],
        "urgency": "RED",
        "urgency_reason": "Acute cardiac warning signs.",
        "summary_plain": "Patient has acute chest tightness.",
        "referral_note": "Immediate clinical referral.",
        "suggested_questions": ["When did it start?", "Radiation to arm?", "Associated nausea?", "Fourth question", "Fifth question"]
    }
    ```
    """
    cleaned = clean_llm_output(raw)
    assert cleaned["urgency"] == "red"
    assert len(cleaned["suggested_questions"]) == 3
    assert cleaned["suggested_questions"] == ["When did it start?", "Radiation to arm?", "Associated nausea?"]
    # Verify it validates into TriageResult without error
    validated = TriageResult.model_validate(cleaned)
    assert validated.urgency == "red"

def test_clean_llm_output_all_urgency_cases():
    for raw_u, expected in [("GREEN", "green"), ("YELLOW", "yellow"), ("RED", "red"), ("unknown", "yellow")]:
        cleaned = clean_llm_output(f'{{"urgency": "{raw_u}"}}')
        assert cleaned["urgency"] == expected

def test_rules_only_fallback_never_green():
    # 5. Invalid model JSON -> rules-only fallback is used, never green
    req = AnalyzeRequest(text="Normal headache without red flags")
    fallback = rules_only_result(req, source="local")
    final = apply_red_flag_rules(req, fallback)
    assert final.urgency == "yellow"  # Fallback starts at yellow, never green
    assert "AI unavailable - assess manually" in final.urgency_reason

def test_rules_only_fallback_raises_to_red_on_danger():
    req = AnalyzeRequest(text="Chest pain with breathlessness", vitals={"spo2_pct": 89})
    fallback = rules_only_result(req, source="local")
    final = apply_red_flag_rules(req, fallback)
    assert final.urgency == "red"
    assert "Safety rules raised urgency to RED" in final.referral_note

def test_analyze_endpoint_live_mode_fallback(monkeypatch):
    import asyncio
    from app import config, main
    monkeypatch.setattr(config, "DEMO_MODE", False)

    async def failing_model(req, cloud=False):
        raise RuntimeError("Model service unavailable")

    monkeypatch.setattr(main, "call_model", failing_model)

    req = AnalyzeRequest(text="Fever for 2 days", vitals={"temp_c": 38.5})
    res = asyncio.run(main.analyze(req))
    assert res.urgency in ("yellow", "red")
    assert res.urgency != "green"
    assert "AI unavailable - assess manually" in res.urgency_reason

def test_mock_result_never_used_when_demo_mode_false(monkeypatch):
    import asyncio
    from app import config, main, llm
    monkeypatch.setattr(config, "DEMO_MODE", False)
    monkeypatch.setattr(config, "LOCAL_MODEL", "")

    with pytest.raises(RuntimeError, match="Model endpoint is not configured"):
        asyncio.run(llm.call_model(AnalyzeRequest(text="Headache")))

    res = asyncio.run(main.analyze(AnalyzeRequest(text="Headache")))
    assert "SIMULATED DEMO ANALYSIS" not in res.urgency_reason
    assert "AI unavailable - assess manually" in res.urgency_reason
    assert res.urgency == "yellow"

def test_demo_mode_returns_simulated_result_with_label(monkeypatch):
    import asyncio
    from app import config, main
    monkeypatch.setattr(config, "DEMO_MODE", True)

    res = asyncio.run(main.analyze(AnalyzeRequest(text="Headache")))
    assert "SIMULATED DEMO ANALYSIS" in res.urgency_reason

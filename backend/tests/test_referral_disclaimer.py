import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.schemas import AnalyzeRequest, TriageResult, Vitals
from app.red_flags import apply_red_flag_rules
from app.llm import rules_only_result, mock_result

client = TestClient(app)

def make_req(text: str, vitals: dict | None = None) -> AnalyzeRequest:
    v = Vitals(
        temp_c=None,
        pulse_bpm=None,
        spo2_pct=None,
        systolic_bp=None,
        resp_rate=None,
    )
    if vitals:
        for k, val in vitals.items():
            setattr(v, k, val)
    return AnalyzeRequest(
        text=text,
        age_years=30,
        sex="female",
        pregnant=False,
        vitals=v,
        output_language="English",
    )

def test_disclaimer_in_green_referral_note():
    req = make_req("Mild skin irritation for two days, no other symptoms")
    res = mock_result(req)
    res.urgency = "green"
    final = apply_red_flag_rules(req, res)
    assert final.urgency == "green"
    assert "Decision support only. Not a diagnosis." in final.referral_note

def test_disclaimer_in_yellow_referral_note():
    req = make_req("Moderate fever for 2 days, drinking fluids normally")
    res = mock_result(req)
    res.urgency = "yellow"
    final = apply_red_flag_rules(req, res)
    assert final.urgency == "yellow"
    assert "Decision support only. Not a diagnosis." in final.referral_note

def test_disclaimer_in_red_referral_note():
    req = make_req("Severe chest pain radiating to jaw and arm")
    res = mock_result(req)
    res.urgency = "red"
    final = apply_red_flag_rules(req, res)
    assert final.urgency == "red"
    assert "Decision support only. Not a diagnosis." in final.referral_note

def test_disclaimer_in_rules_only_fallback_referral_note():
    req = make_req("Cough for 3 days")
    fallback = rules_only_result(req)
    final = apply_red_flag_rules(req, fallback)
    assert final.rules_only is True
    assert "Decision support only. Not a diagnosis." in final.referral_note

def test_disclaimer_in_self_harm_referral_note():
    req = make_req("Patient stated I want to end my life")
    res = mock_result(req)
    final = apply_red_flag_rules(req, res)
    assert final.urgency == "red"
    assert "IMMEDIATE HUMAN SUPPORT REQUIRED" in final.referral_note
    assert "Decision support only. Not a diagnosis." in final.referral_note

def test_api_analyze_contains_disclaimer_in_referral_note():
    # Green case via API
    resp_green = client.post(
        "/api/analyze",
        json={"text": "Small scratch on finger", "age_years": 25, "sex": "male"},
    )
    assert resp_green.status_code == 200
    assert "Decision support only. Not a diagnosis." in resp_green.json()["referral_note"]

    # Red flag vitals case via API
    resp_red = client.post(
        "/api/analyze",
        json={
            "text": "Feeling dizzy",
            "age_years": 45,
            "sex": "female",
            "vitals": {"spo2_pct": 85},
        },
    )
    assert resp_red.status_code == 200
    assert resp_red.json()["urgency"] == "red"
    assert "Decision support only. Not a diagnosis." in resp_red.json()["referral_note"]

    # Self-harm case via API
    resp_harm = client.post(
        "/api/analyze",
        json={"text": "Patient says I want to end my life", "age_years": 22, "sex": "female"},
    )
    assert resp_harm.status_code == 200
    assert resp_harm.json()["urgency"] == "red"
    assert "IMMEDIATE HUMAN SUPPORT REQUIRED" in resp_harm.json()["referral_note"]
    assert "Decision support only. Not a diagnosis." in resp_harm.json()["referral_note"]

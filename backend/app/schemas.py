from typing import Literal
from pydantic import BaseModel, Field

class Vitals(BaseModel):
    temp_c: float | None = None
    pulse_bpm: int | None = None
    spo2_pct: int | None = None
    systolic_bp: int | None = None
    resp_rate: int | None = None

class AnalyzeRequest(BaseModel):
    text: str = Field(min_length=1, max_length=5000)
    age_years: float | None = Field(default=None, ge=0, le=120)
    sex: Literal["female", "male", "other", "unknown"] = "unknown"
    pregnant: bool | None = None
    vitals: Vitals | None = None
    output_language: str = "English"

class TriageResult(BaseModel):
    chief_complaint: str
    symptoms: list[str]
    duration: str | None = None
    red_flags: list[str]
    urgency: Literal["green", "yellow", "red"]
    urgency_reason: str
    summary_plain: str
    referral_note: str
    suggested_questions: list[str] = Field(max_length=3)
    rule_reasons: list[str] = []
    source: Literal["local", "cloud"] = "local"
    rules_only: bool = False
    disclaimer: str = "Decision-support prototype. Not a diagnostic tool. Mock data only."

class EscalateRequest(BaseModel):
    request: AnalyzeRequest
    local_result: TriageResult

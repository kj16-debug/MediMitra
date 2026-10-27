"""Output filter for external model text to prevent treatment, prescription, or dosage advice.

Discard any model response that attempts to provide medical prescriptions, dosages,
or curative treatments, and trigger a graceful rules-only fallback.
"""

import re
import logging
from typing import Any
from .schemas import TriageResult

logger = logging.getLogger("app.output_filter")

# 1. Number followed by unit (dosage amounts)
UNIT_PATTERN = re.compile(
    r"\b\d+(?:\.\d+)?\s*(?:mg|mcg|g|ml|iu|tablets?|tabs?|capsules?|drops?|puffs?)\b",
    re.IGNORECASE,
)

# 2. Treatment, dosage, and prescription keywords
ACTION_PATTERN = re.compile(
    r"\b(?:dose|dosages?|administer(?:ed|ing|s)?|prescribe[ds]?|prescriptions?|"
    r"medications?|medicines?|antibiotics?|syrups?|injections?|inject(?:ed|ing|s)?)\b|"
    r"\bgive\s+(?:him|her|them)\b",
    re.IGNORECASE,
)

# 3. Common drug and therapeutic substance names
DRUG_PATTERN = re.compile(
    r"\b(?:paracetamol|acetaminophen|ibuprofen|aspirin|amoxicillin|azithromycin|"
    r"diclofenac|ors|morphine|diazepam|salbutamol|adrenaline|epinephrine|insulin)\b",
    re.IGNORECASE,
)

FILTER_PATTERNS = [UNIT_PATTERN, ACTION_PATTERN, DRUG_PATTERN]

def is_text_prohibited(text: str) -> bool:
    """Check if a string contains any dosage, prescription, or treatment words."""
    if not text or not isinstance(text, str):
        return False
    for pat in FILTER_PATTERNS:
        if pat.search(text):
            return True
    return False

def contains_treatment_or_dosage(data: Any) -> bool:
    """Check every free-text field in a TriageResult or dict for prohibited treatment/dosage wording."""
    if isinstance(data, TriageResult):
        fields_to_check = [
            data.chief_complaint,
            data.duration or "",
            data.urgency_reason,
            data.summary_plain,
            data.referral_note,
            *data.symptoms,
            *data.red_flags,
            *data.suggested_questions,
        ]
        for field in fields_to_check:
            if is_text_prohibited(field):
                return True
        return False

    if isinstance(data, dict):
        for k, v in data.items():
            if k in ("source", "rules_only", "disclaimer", "rule_reasons"):
                continue
            if isinstance(v, str):
                if is_text_prohibited(v):
                    return True
            elif isinstance(v, list):
                for item in v:
                    if isinstance(item, str) and is_text_prohibited(item):
                        return True
                    elif isinstance(item, (dict, list)) and contains_treatment_or_dosage(item):
                        return True
            elif isinstance(v, dict):
                if contains_treatment_or_dosage(v):
                    return True
        return False

    if isinstance(data, str):
        return is_text_prohibited(data)

    return False

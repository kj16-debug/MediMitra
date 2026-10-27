"""Output filter for external model text to prevent treatment, prescription, or dosage advice.

Discard any model response that attempts to provide medical prescriptions, dosages,
or curative treatments, and trigger a graceful rules-only fallback.
"""

import re
import logging
from typing import Any
from .schemas import TriageResult

logger = logging.getLogger("app.output_filter")

# 1. Number followed by unit (dosage amounts) - ALWAYS REJECT
UNIT_PATTERN = re.compile(
    r"\b\d+(?:\.\d+)?\s*(?:mg|mcg|g|ml|iu|tablets?|tabs?|capsules?|drops?|puffs?)\b",
    re.IGNORECASE,
)

# 2. Strict treatment, dosage, and prescription keywords - ALWAYS REJECT
ALWAYS_REJECT_ACTION_PATTERN = re.compile(
    r"\b(?:dose|dosages?|administer(?:ed|ing|s)?|prescri(?:be[ds]?|bing|ptions?)|inject(?:ed|ing|s)?)\b|"
    r"\bgive\s+(?:him|her|them)\b",
    re.IGNORECASE,
)

# 3. Echo-allowed terms: drug names, ORS, and specific treatment nouns
# A match is ignored only if the same whole word appears in case_text and is not preceded by an advice verb
ECHO_ALLOWED_PATTERN = re.compile(
    r"\b(?:paracetamol|acetaminophen|ibuprofen|aspirin|amoxicillin|azithromycin|"
    r"diclofenac|ors|morphine|diazepam|salbutamol|adrenaline|epinephrine|insulin|"
    r"medicines?|medications?|syrups?|injections?|antibiotics?)\b",
    re.IGNORECASE,
)

# Retain backward-compatible references
ACTION_PATTERN = ALWAYS_REJECT_ACTION_PATTERN
DRUG_PATTERN = ECHO_ALLOWED_PATTERN
FILTER_PATTERNS = [UNIT_PATTERN, ALWAYS_REJECT_ACTION_PATTERN, ECHO_ALLOWED_PATTERN]

# Specific treatment nouns that support singular/plural form matching
NOUNS_SET = {
    "medicine", "medicines",
    "medication", "medications",
    "syrup", "syrups",
    "injection", "injections",
    "antibiotic", "antibiotics",
}

# Recommendation cues that reject an echo-allowed term if appearing in the SAME sentence
RECOMMENDATION_CUES_PATTERN = re.compile(
    r"\b(?:"
    r"recommend(?:s|ed|ing)?|"
    r"advis(?:e|es|ed|ing)|"
    r"suggest(?:s|ed|ing)?|"
    r"should|"
    r"consider(?:s|ed|ing)?|"
    r"try|"
    r"needs?|"
    r"must|"
    r"ensure[ds]?|"
    r"continue[ds]?|"
    r"starts?|"
    r"(?:is|are)\s+indicated|"
    r"would\s+benefit"
    r")\b",
    re.IGNORECASE,
)

# Advice verbs that reject an echo-allowed term if directly preceding it within 3 words
# (Past-tense history such as 'gave', 'took', 'was given', 'has been taking' are allowed)
ADVICE_VERBS = {
    "give", "gives",
    "take", "takes",
    "start", "starts",
    "use", "uses",
    "apply", "applies",
    "administer", "administers",
    "prescribe", "prescribes",
    "continue", "continues",
    "increase", "increases",
    "repeat", "repeats",
}

def _get_sentence_around(text: str, start: int, end: int) -> str:
    """Extract the sentence containing the slice start..end."""
    before = text[:start]
    prev_boundary = max(
        before.rfind("."),
        before.rfind("!"),
        before.rfind("?"),
        before.rfind("\n"),
        before.rfind(";"),
    )
    sent_start = 0 if prev_boundary == -1 else prev_boundary + 1

    after = text[end:]
    next_boundaries = [
        pos for pos in (
            after.find("."),
            after.find("!"),
            after.find("?"),
            after.find("\n"),
            after.find(";"),
        ) if pos != -1
    ]
    sent_end = len(text) if not next_boundaries else end + min(next_boundaries)
    return text[sent_start:sent_end]

def _word_in_case_text(term: str, case_text: str) -> bool:
    if not case_text or not isinstance(case_text, str):
        return False
    # Exact whole-word case-insensitive match
    if re.search(rf"\b{re.escape(term)}\b", case_text, re.IGNORECASE):
        return True
    lower = term.lower()
    if lower in NOUNS_SET:
        base = lower[:-1] if lower.endswith("s") else lower
        alt = base if lower.endswith("s") else (base + "s")
        if re.search(rf"\b{re.escape(alt)}\b", case_text, re.IGNORECASE):
            return True
    return False

def is_text_prohibited(text: str, case_text: str = "") -> bool:
    """Check if a string contains any dosage, prescription, or treatment words.

    If case_text is provided, echo-allowed terms (drug names, ORS, nouns: medicine,
    medication, syrup, injection, antibiotic) mentioned in case_text are ignored,
    UNLESS:
      - The same sentence contains a recommendation cue before OR after the term.
      - The term is directly preceded within 3 words by an advice verb.
    """
    if not text or not isinstance(text, str):
        return False

    # 1. Number + unit (ALWAYS REJECT)
    if UNIT_PATTERN.search(text):
        return True

    # 2. Strict treatment/prescription action keywords (ALWAYS REJECT)
    if ALWAYS_REJECT_ACTION_PATTERN.search(text):
        return True

    # 3. Echo-allowed terms
    for match in ECHO_ALLOWED_PATTERN.finditer(text):
        term = match.group()
        # If not present in case_text, reject
        if not _word_in_case_text(term, case_text):
            return True

        # Check if the same sentence contains any recommendation cue before OR after the term
        sentence = _get_sentence_around(text, match.start(), match.end())
        if RECOMMENDATION_CUES_PATTERN.search(sentence):
            return True

        # Check if directly preceded within 3 words by an advice verb
        prefix = text[: match.start()]
        clause = re.split(r"[.!?;\n]", prefix)[-1]
        words_before = re.findall(r"\b[A-Za-z]+\b", clause)
        preceding_3 = [w.lower() for w in words_before[-3:]]
        if any(w in ADVICE_VERBS for w in preceding_3):
            return True

    return False

def contains_treatment_or_dosage(data: Any, case_text: str = "") -> bool:
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
            if is_text_prohibited(field, case_text=case_text):
                return True
        return False

    if isinstance(data, dict):
        for k, v in data.items():
            if k in ("source", "rules_only", "disclaimer", "rule_reasons"):
                continue
            if isinstance(v, str):
                if is_text_prohibited(v, case_text=case_text):
                    return True
            elif isinstance(v, list):
                for item in v:
                    if isinstance(item, str) and is_text_prohibited(item, case_text=case_text):
                        return True
                    elif isinstance(item, (dict, list)) and contains_treatment_or_dosage(item, case_text=case_text):
                        return True
            elif isinstance(v, dict):
                if contains_treatment_or_dosage(v, case_text=case_text):
                    return True
        return False

    if isinstance(data, str):
        return is_text_prohibited(data, case_text=case_text)

    return False

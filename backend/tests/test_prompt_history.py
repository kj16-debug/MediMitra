from app.prompts import SYSTEM_PROMPT

def test_system_prompt_contains_past_history_wording_rule():
    expected_sentence = (
        'When describing medicine or fluid the worker says was already given, '
        'use plain past tense such as "gave" or "took", and never use the words "administer", "administered" or "dose".'
    )
    assert expected_sentence in SYSTEM_PROMPT

from .schemas import AnalyzeRequest

DEMO_PATIENTS = [
    {"name": "Asha · mild cold", "request": AnalyzeRequest(text="Runny nose, mild cough and sneezing for 2 days. No breathing difficulty.", age_years=32, sex="female", vitals={"temp_c": 37.1, "pulse_bpm": 78, "spo2_pct": 98})},
    {"name": "Kabir · fever and vomiting", "request": AnalyzeRequest(text="Fever for 3 days with vomiting twice today.", age_years=8, sex="male", vitals={"temp_c": 39.0, "pulse_bpm": 112})},
    {"name": "Mina · chest tightness", "request": AnalyzeRequest(text="Chest tightness and sweating started this morning.", age_years=54, sex="female", vitals={"pulse_bpm": 120, "spo2_pct": 96})},
    {"name": "Dev · low oxygen rule override", "request": AnalyzeRequest(text="Feeling tired and slightly unwell since yesterday.", age_years=47, sex="male", vitals={"spo2_pct": 88, "pulse_bpm": 88})},
    {"name": "Nila · pregnancy warning signs", "request": AnalyzeRequest(text="Bleeding with a severe headache since this morning.", age_years=26, sex="female", pregnant=True)},
]

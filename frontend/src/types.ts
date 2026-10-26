export type Vitals={temp_c:number|null;pulse_bpm:number|null;spo2_pct:number|null;systolic_bp:number|null;resp_rate:number|null};
export type AnalyzeRequest={text:string;age_years:number|null;sex:'female'|'male'|'other'|'unknown';pregnant:boolean|null;vitals:Vitals;output_language:string};
export type TriageResult={chief_complaint:string;symptoms:string[];duration:string|null;red_flags:string[];urgency:'green'|'yellow'|'red';urgency_reason:string;summary_plain:string;referral_note:string;suggested_questions:string[];rule_reasons:string[];source:'local'|'cloud';rules_only?:boolean;disclaimer:string};
export type DemoPatient=AnalyzeRequest&{name:string};
export type Status={demo_mode:boolean;local_configured:boolean;cloud_configured:boolean;local_model:string;cloud_model:string};

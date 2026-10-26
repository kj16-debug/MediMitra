import { useState, useId } from 'react';
import type { AnalyzeRequest, DemoPatient, Vitals, Status } from '../types';
import {
  ChildIcon,
  MicIcon,
  WarningIcon,
  EmergencyIcon,
  HospitalIcon,
  MemoryIcon,
  ArrowBackIcon,
  PersonIcon,
} from '../components/Icons';

interface IntakeScreenProps {
  form: AnalyzeRequest;
  set: (key: keyof AnalyzeRequest, value: unknown) => void;
  setVital: (key: keyof Vitals, value: string) => void;
  onAnalyze: () => void;
  busy: string;
  error: string;
  demos: DemoPatient[];
  selectedDemo: string;
  onLoadDemo: (name: string) => void;
  onBackToHome: () => void;
  status?: Status | null;
}

const DANGER_SIGNS = [
  {
    id: 'breathing',
    label: 'Breathing difficulty / Respiratory distress',
    desc: 'Stridor while calm, continuous fast breathing, chest in-drawing, or audible grunting.',
    badge: 'SpO2 / Airway',
  },
  {
    id: 'unconscious',
    label: 'Unconscious or lethargic state',
    desc: 'Abnormally sleepy, completely unresponsive to voice, eye opening, or physical touch.',
    badge: 'Neurological',
  },
  {
    id: 'convulsions',
    label: 'Convulsions / Active seizures',
    desc: 'Episodes of involuntary jerking, rigid shaking, or fitting within the past 24 hours.',
    badge: 'Seizure',
  },
  {
    id: 'fluid_loss',
    label: 'Severe bleeding or fluid collapse',
    desc: 'Uncontrolled bleeding, sunken eyes with skin pinch > 2 seconds, no urine passed for > 12 hours.',
    badge: 'Dehydration',
  },
  {
    id: 'chest_pain',
    label: 'Severe chest pain / Acute collapse',
    desc: 'Crushing retrosternal sensation radiating to jaw, sudden severe cyanosis, cold extremities.',
    badge: 'Cardiac / Shock',
  },
  {
    id: 'self_harm',
    label: 'Self-harm distress signals',
    desc: 'Explicit statements of self-harm, severe disorientation, acute psychiatric trauma crisis.',
    badge: 'Psychiatric Safety',
  },
];

export function IntakeScreen({
  form,
  set,
  setVital,
  onAnalyze,
  busy,
  error,
  demos,
  selectedDemo,
  onLoadDemo,
  onBackToHome,
  status,
}: IntakeScreenProps) {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [selectedSigns, setSelectedSigns] = useState<string[]>([]);
  const [patientName, setPatientName] = useState(
    selectedDemo ? selectedDemo : form.text.toLowerCase().includes('kabir') ? 'Kabir' : form.text.toLowerCase().includes('dev') ? 'Dev' : 'Field Patient'
  );
  const [village, setVillage] = useState('Village Rampur');

  const demoSelectId = useId();
  const symptomsInputId = useId();

  function toggleDangerSign(label: string) {
    let next: string[];
    if (selectedSigns.includes(label)) {
      next = selectedSigns.filter((s) => s !== label);
    } else {
      next = [...selectedSigns, label];
      // Append danger sign to form text if not already present
      if (!form.text.toLowerCase().includes(label.toLowerCase())) {
        const updated = form.text.trim() ? `${form.text.trim()}\nRed flag sign noted: ${label}` : `Red flag sign noted: ${label}`;
        set('text', updated);
      }
    }
    setSelectedSigns(next);
  }

  const tempF = form.vitals.temp_c ? ((form.vitals.temp_c * 9) / 5 + 32).toFixed(1) : null;
  const readyToAnalyze = Boolean(form.text.trim());

  return (
    <div className="flex flex-col w-full pb-space-xl">
      {/* Step Progress Header Section */}
      <div className="w-full bg-surface-container-lowest rounded-2xl shadow-sm p-space-md sm:p-space-lg mb-space-lg border border-surface-container">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm mb-space-md">
          <div className="flex items-center gap-space-sm">
            <span className="px-space-sm py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-meta text-label-meta uppercase tracking-wider font-bold">
              Step {activeStep} of 3
            </span>
            <h1 className="font-headline-sm text-headline-sm text-on-surface">
              {activeStep === 1
                ? 'Patient Demographics & Complaint'
                : activeStep === 2
                ? 'Critical Danger Signs Checklist'
                : 'Clinical Vitals & Measurements'}
            </h1>
          </div>
          <div className="flex items-center gap-space-xs font-label-meta text-label-meta text-on-surface-variant">
            <MemoryIcon size={18} className="text-primary" />
            <span>
              {status?.demo_mode
                ? 'Simulated Gemma 4 Active'
                : status?.local_model && status.local_model !== 'Not configured'
                ? `${status.local_model} Active`
                : 'Deterministic Rules Active'}
            </span>
            <span className="inline-block w-2 h-2 rounded-full bg-secondary ml-1 animate-pulse" />
          </div>
        </div>

        {/* Multi-step Stepper Indicator */}
        <div className="grid grid-cols-3 gap-space-sm relative mb-space-sm">
          <button
            onClick={() => setActiveStep(1)}
            className={`flex items-center gap-space-xs sm:gap-space-sm text-left cursor-pointer transition-all ${
              activeStep === 1 ? 'opacity-100 font-bold' : 'opacity-80'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                activeStep === 1
                  ? 'bg-primary-container text-on-primary ring-4 ring-primary-fixed/40'
                  : 'bg-primary text-on-primary'
              }`}
            >
              <span className="text-sm font-bold">1</span>
            </div>
            <div className="min-w-0 hidden sm:flex flex-col">
              <span className="font-label-meta text-label-meta text-primary uppercase">Step 1</span>
              <span className="font-body-sm text-body-sm text-on-surface truncate">Patient & Complaint</span>
            </div>
          </button>

          <button
            onClick={() => setActiveStep(2)}
            className={`flex items-center gap-space-xs sm:gap-space-sm text-left cursor-pointer transition-all ${
              activeStep === 2 ? 'opacity-100 font-bold' : 'opacity-80'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                activeStep === 2
                  ? 'bg-primary-container text-on-primary ring-4 ring-primary-fixed/40'
                  : 'bg-surface-container-high text-on-surface-variant'
              }`}
            >
              <span className="text-sm font-bold">2</span>
            </div>
            <div className="min-w-0 hidden sm:flex flex-col">
              <span className="font-label-meta text-label-meta text-primary uppercase">Step 2</span>
              <span className="font-body-sm text-body-sm text-on-surface truncate">Danger Signs</span>
            </div>
          </button>

          <button
            onClick={() => setActiveStep(3)}
            className={`flex items-center gap-space-xs sm:gap-space-sm text-left cursor-pointer transition-all ${
              activeStep === 3 ? 'opacity-100 font-bold' : 'opacity-80'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                activeStep === 3
                  ? 'bg-primary-container text-on-primary ring-4 ring-primary-fixed/40'
                  : 'bg-surface-container-high text-on-surface-variant'
              }`}
            >
              <span className="text-sm font-bold">3</span>
            </div>
            <div className="min-w-0 hidden sm:flex flex-col">
              <span className="font-label-meta text-label-meta text-on-surface-variant uppercase">Step 3</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant truncate">Vitals & Tests</span>
            </div>
          </button>
        </div>

        {/* Progress Track Bar */}
        <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden mt-space-sm">
          <div
            className="bg-primary h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(activeStep / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Two-Column Triage Form Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* Left Column: Form Core (8 columns) */}
        <div className="lg:col-span-8 flex flex-col gap-space-md">
          {/* Quick Patient Anchor Ribbon */}
          <div className="bg-surface-container-low rounded-xl p-space-md flex flex-wrap items-center justify-between gap-space-sm shadow-sm border border-surface-container">
            <div className="flex items-center gap-space-sm">
              <div className="w-10 h-10 rounded-full bg-surface-container-highest text-primary flex items-center justify-center shrink-0">
                <ChildIcon size={22} />
              </div>
              <div>
                <div className="flex items-center gap-space-xs">
                  <span className="font-headline-sm text-headline-sm text-on-surface leading-tight font-bold">
                    {patientName}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-meta text-label-meta">
                    ID #R4829
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {form.age_years ?? '—'} yrs • {form.sex} • {village}
                </p>
              </div>
            </div>

            {/* Quick Demo Pre-loader dropdown */}
            <div className="flex items-center gap-2">
              <label htmlFor={demoSelectId} className="font-label-meta text-label-meta text-on-surface-variant font-bold">
                Load Demo:
              </label>
              <select
                id={demoSelectId}
                className="px-2.5 py-1.5 rounded-lg bg-surface-container-lowest border border-surface-container text-xs font-medium text-on-surface focus:outline-none"
                value={selectedDemo}
                onChange={(e) => {
                  onLoadDemo(e.target.value);
                  setPatientName(e.target.value);
                }}
              >
                <option value="">Choose Case...</option>
                {demos.map((d) => (
                  <option key={d.name} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* STEP 1: Patient Demographics & Complaint */}
          <div className="bg-surface-container-lowest rounded-2xl p-space-md sm:p-space-lg shadow-sm border border-surface-container">
            <h2 className="font-body-bold text-body-bold text-on-surface mb-1">
              Patient Demographics & Onset
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
              Basic age, gender, and duration information for standardized triage protocols.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm mb-space-md">
              <div>
                <label className="block font-label-meta text-label-meta text-on-surface-variant mb-1">
                  Age (Years)
                </label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  placeholder="e.g. 4"
                  className="w-full p-2.5 rounded-xl bg-surface-container-low border border-surface-container text-body-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={form.age_years ?? ''}
                  onChange={(e) => set('age_years', e.target.value === '' ? null : Number(e.target.value))}
                />
              </div>

              <div>
                <label className="block font-label-meta text-label-meta text-on-surface-variant mb-1">
                  Sex
                </label>
                <select
                  className="w-full p-2.5 rounded-xl bg-surface-container-low border border-surface-container text-body-lg focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                  value={form.sex}
                  onChange={(e) => set('sex', e.target.value)}
                >
                  <option value="unknown">Unknown</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-label-meta text-label-meta text-on-surface-variant mb-1">
                  Village / Sub-Center
                </label>
                <input
                  type="text"
                  placeholder="e.g. Village Rampur"
                  className="w-full p-2.5 rounded-xl bg-surface-container-low border border-surface-container text-body-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 mb-space-md">
              <input
                type="checkbox"
                id="pregnant-check"
                className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer"
                checked={form.pregnant === true}
                onChange={(e) => set('pregnant', e.target.checked ? true : null)}
              />
              <label htmlFor="pregnant-check" className="font-body-sm text-body-sm text-on-surface cursor-pointer">
                Patient is pregnant (triggers maternal safety review)
              </label>
            </div>

            <div className="border-t border-surface-container pt-space-md">
              <label htmlFor={symptomsInputId} className="block font-body-bold text-body-bold text-on-surface mb-1">
                Chief Complaint & Observations <span className="text-error font-normal text-xs">*Required</span>
              </label>
              <textarea
                id={symptomsInputId}
                rows={4}
                className="w-full p-space-sm rounded-xl bg-surface-container-low border border-surface-container text-body-lg focus:outline-none focus:ring-2 focus:ring-primary leading-relaxed"
                placeholder="Describe patient symptoms in their own words (e.g. High fever for 3 days, continuous vomiting, refusing fluids)..."
                value={form.text}
                onChange={(e) => set('text', e.target.value)}
              />
            </div>
          </div>

          {/* Voice Note Section */}
          <div className="bg-surface-container-lowest rounded-2xl p-space-md sm:p-space-lg shadow-sm border border-surface-container">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm mb-space-sm">
              <div className="flex items-center gap-space-xs">
                <MicIcon size={22} className="text-on-surface-variant" />
                <h2 className="font-body-bold text-body-bold text-on-surface">
                  Voice Observation
                </h2>
              </div>
              <span className="font-label-meta text-label-meta text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full">
                Demo Environment
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
              Voice recording is not active in this demo. Enter patient observations directly in the text field above.
            </p>

            <div className="bg-surface-container-low rounded-xl p-space-sm flex items-center gap-space-md border border-surface-container">
              <button
                type="button"
                disabled={true}
                title="Voice note: Not available in demo"
                className="w-full sm:w-auto px-space-lg py-3 rounded-lg font-body-bold text-body-bold flex items-center justify-center gap-space-xs transition-all shrink-0 shadow-sm bg-surface-container text-on-surface-variant opacity-60 cursor-not-allowed border border-surface-container"
              >
                <MicIcon size={20} />
                <span>Voice note: Not available in demo</span>
              </button>
            </div>
          </div>

          {/* STEP 2: Danger Signs Interactive Checklist */}
          <div className="bg-surface-container-lowest rounded-2xl p-space-md sm:p-space-lg shadow-sm border border-surface-container">
            <div className="flex items-center justify-between mb-space-sm">
              <div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">Red-Flag Danger Signs</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  Select all positive symptoms observed in the last 24 hours.
                </p>
              </div>
              <WarningIcon size={28} className="text-error" />
            </div>

            {/* Warning Callout */}
            <div className="mb-space-md p-space-sm rounded-lg bg-error-container text-on-error-container flex items-start gap-space-xs font-body-sm text-body-sm">
              <EmergencyIcon size={20} className="text-error shrink-0 mt-0.5" />
              <span>
                Checking any item below instantly flags the referral category as <strong>URGENT (RED)</strong>.
              </span>
            </div>

            <div className="space-y-space-sm">
              {DANGER_SIGNS.map((item) => {
                const checked = selectedSigns.includes(item.label);
                return (
                  <label
                    key={item.id}
                    className={`group relative flex items-start gap-space-md p-space-md rounded-xl transition-all cursor-pointer shadow-sm select-none border ${
                      checked
                        ? 'bg-error-container/20 border-error'
                        : 'bg-surface-container-low border-surface-container hover:bg-surface-container'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="mt-1 w-5 h-5 rounded text-error focus:ring-error accent-error cursor-pointer shrink-0"
                      checked={checked}
                      onChange={() => toggleDangerSign(item.label)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-body-bold text-body-bold text-on-surface">
                          {item.label}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-bold">
                          {item.badge}
                        </span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                        {item.desc}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* STEP 3: Clinical Vitals Input Grid */}
          <div className="bg-surface-container-lowest rounded-2xl p-space-md sm:p-space-lg shadow-sm border border-surface-container">
            <div className="flex items-center justify-between mb-space-sm">
              <div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">Clinical Field Vitals</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  Input objective vital signs. Leave blank if device or measurement is unavailable.
                </p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-surface-container text-on-surface-variant font-bold">
                Optional
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-space-sm">
              {/* Temperature */}
              <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container flex flex-col justify-between">
                <span className="font-label-meta text-label-meta text-on-surface-variant">TEMP (°C)</span>
                <input
                  type="number"
                  step="0.1"
                  placeholder="38.9"
                  className="w-full mt-1 p-1.5 bg-surface-container-lowest rounded border border-surface-container text-body-bold font-bold focus:outline-none"
                  value={form.vitals.temp_c ?? ''}
                  onChange={(e) => setVital('temp_c', e.target.value)}
                />
                <span className="text-[11px] text-on-surface-variant mt-1">
                  {tempF ? `${tempF}°F` : 'Norm 36.5-37.5'}
                </span>
              </div>

              {/* Pulse */}
              <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container flex flex-col justify-between">
                <span className="font-label-meta text-label-meta text-on-surface-variant">PULSE (bpm)</span>
                <input
                  type="number"
                  placeholder="118"
                  className="w-full mt-1 p-1.5 bg-surface-container-lowest rounded border border-surface-container text-body-bold font-bold focus:outline-none"
                  value={form.vitals.pulse_bpm ?? ''}
                  onChange={(e) => setVital('pulse_bpm', e.target.value)}
                />
                <span className="text-[11px] text-on-surface-variant mt-1">Adult 60-100</span>
              </div>

              {/* SpO2 */}
              <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container flex flex-col justify-between">
                <span className="font-label-meta text-label-meta text-on-surface-variant">SpO2 (%)</span>
                <input
                  type="number"
                  placeholder="96"
                  className="w-full mt-1 p-1.5 bg-surface-container-lowest rounded border border-surface-container text-body-bold font-bold focus:outline-none"
                  value={form.vitals.spo2_pct ?? ''}
                  onChange={(e) => setVital('spo2_pct', e.target.value)}
                />
                <span className="text-[11px] text-on-surface-variant mt-1">&lt;90% forces RED</span>
              </div>

              {/* Systolic BP */}
              <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container flex flex-col justify-between">
                <span className="font-label-meta text-label-meta text-on-surface-variant">BP SYS (mmHg)</span>
                <input
                  type="number"
                  placeholder="110"
                  className="w-full mt-1 p-1.5 bg-surface-container-lowest rounded border border-surface-container text-body-bold font-bold focus:outline-none"
                  value={form.vitals.systolic_bp ?? ''}
                  onChange={(e) => setVital('systolic_bp', e.target.value)}
                />
                <span className="text-[11px] text-on-surface-variant mt-1">Systolic target</span>
              </div>

              {/* Resp Rate */}
              <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container flex flex-col justify-between col-span-2 sm:col-span-1">
                <span className="font-label-meta text-label-meta text-on-surface-variant">RESP (/min)</span>
                <input
                  type="number"
                  placeholder="38"
                  className="w-full mt-1 p-1.5 bg-surface-container-lowest rounded border border-surface-container text-body-bold font-bold focus:outline-none"
                  value={form.vitals.resp_rate ?? ''}
                  onChange={(e) => setVital('resp_rate', e.target.value)}
                />
                <span className="text-[11px] text-on-surface-variant mt-1">Pediatric tachypnea</span>
              </div>
            </div>
          </div>

          {/* Action Bar & Submission */}
          {error && (
            <div className="p-space-md rounded-xl bg-error-container text-on-error-container font-body-sm text-body-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-space-md pt-space-xs">
            <button
              type="button"
              onClick={onBackToHome}
              className="w-full sm:w-auto px-space-lg py-3 rounded-xl bg-surface-container-lowest hover:bg-surface-container text-primary font-body-bold text-body-bold flex items-center justify-center gap-space-xs transition-colors shadow-sm min-h-[48px] border border-surface-container cursor-pointer"
            >
              <ArrowBackIcon size={20} />
              <span>Back to Home</span>
            </button>

            <button
              type="button"
              disabled={!readyToAnalyze || busy !== ''}
              onClick={onAnalyze}
              className="w-full sm:w-auto px-space-xl py-3.5 rounded-xl bg-primary hover:bg-tertiary text-on-primary font-body-bold text-body-bold flex items-center justify-center gap-space-xs transition-all shadow-md hover:shadow-lg min-h-[48px] disabled:opacity-50 cursor-pointer"
            >
              {busy === 'analyze' ? (
                <>
                  <span className="spinner mr-2" />
                  <span>Evaluating Offline Safety Rules...</span>
                </>
              ) : (
                <>
                  <span>Analyze Case & Evaluate Urgency</span>
                  <ArrowBackIcon size={20} className="rotate-180" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Live Sticky "Case So Far" Summary (4 columns) */}
        <div className="lg:col-span-4 sticky top-24 flex flex-col gap-space-md">
          <div className="bg-surface-container-lowest rounded-2xl p-space-md sm:p-space-lg shadow-sm border border-surface-container">
            {/* Header */}
            <div className="flex items-center justify-between pb-space-sm mb-space-md border-b border-surface-container">
              <div className="flex items-center gap-space-xs">
                <span className="font-body-bold text-body-bold text-on-surface">Case Summary</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-meta text-label-meta font-medium">
                Live State
              </span>
            </div>

            {/* Patient Demographics */}
            <div className="space-y-space-xs pb-space-sm mb-space-sm border-b border-surface-container">
              <span className="font-label-meta text-label-meta text-on-surface-variant uppercase">
                Patient Profile
              </span>
              <div className="flex items-center justify-between">
                <span className="font-body-bold text-body-bold text-on-surface">{patientName}</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  {form.age_years ?? '—'} yrs • {form.sex}
                </span>
              </div>
              <div className="text-body-sm text-on-surface-variant flex items-center gap-1">
                <span>{village} (Cluster Zone B)</span>
              </div>
            </div>

            {/* Chief Complaint Preview */}
            <div className="space-y-space-xs pb-space-sm mb-space-sm border-b border-surface-container">
              <span className="font-label-meta text-label-meta text-on-surface-variant uppercase">
                Chief Complaint
              </span>
              <div className="bg-surface-container-low p-space-sm rounded-xl border border-surface-container">
                <p className="font-body-sm text-body-sm text-on-surface leading-snug">
                  {form.text ? form.text : <em className="text-on-surface-variant">No symptoms entered yet.</em>}
                </p>
              </div>
            </div>

            {/* Live Danger Signs Counter Card */}
            <div className="space-y-space-xs pb-space-sm mb-space-sm border-b border-surface-container">
              <div className="flex items-center justify-between">
                <span className="font-label-meta text-label-meta text-on-surface-variant uppercase">
                  Danger Signs Flagged
                </span>
                <span
                  className={`font-label-meta text-label-meta px-2 py-0.5 rounded-full font-bold ${
                    selectedSigns.length > 0
                      ? 'bg-error-container text-on-error-container'
                      : 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  {selectedSigns.length} Selected
                </span>
              </div>
              <div className="bg-surface-container-low p-space-sm rounded-xl min-h-[50px] border border-surface-container">
                {selectedSigns.length === 0 ? (
                  <span className="font-body-sm text-body-sm text-on-surface-variant italic">
                    No red-flag signs selected yet.
                  </span>
                ) : (
                  <ul className="space-y-1">
                    {selectedSigns.map((sign) => (
                      <li key={sign} className="text-xs text-error font-bold flex items-center gap-1">
                        <span>•</span> {sign}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Recorded Vitals Preview */}
            <div className="space-y-space-xs pb-space-sm mb-space-sm border-b border-surface-container">
              <span className="font-label-meta text-label-meta text-on-surface-variant uppercase">
                Field Vitals Preview
              </span>
              <div className="grid grid-cols-3 gap-1.5 text-center">
                <div className="p-2 rounded-lg bg-surface-container-low border border-surface-container">
                  <span className="text-[10px] text-on-surface-variant uppercase block">TEMP</span>
                  <span className="font-bold text-sm text-on-surface">
                    {form.vitals.temp_c ? `${form.vitals.temp_c}°C` : '—'}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-surface-container-low border border-surface-container">
                  <span className="text-[10px] text-on-surface-variant uppercase block">PULSE</span>
                  <span className="font-bold text-sm text-on-surface">
                    {form.vitals.pulse_bpm ? `${form.vitals.pulse_bpm}` : '—'}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-surface-container-low border border-surface-container">
                  <span className="text-[10px] text-on-surface-variant uppercase block">SpO2</span>
                  <span className="font-bold text-sm text-on-surface">
                    {form.vitals.spo2_pct ? `${form.vitals.spo2_pct}%` : '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Urgency Logic Preview & Safety Notice */}
            <div className="p-space-sm rounded-xl bg-surface-container flex items-start gap-space-xs text-on-surface-variant">
              <EmergencyIcon size={18} className="text-primary shrink-0 mt-0.5" />
              <p className="font-label-meta text-label-meta">
                Urgency classification finalizes upon running triage. Deterministic clinical rules run strictly on-device.
              </p>
            </div>
          </div>

          {/* Quick Field Reference Facility Widget */}
          <div className="bg-surface-container-low rounded-xl p-space-md shadow-sm border border-surface-container">
            <div className="flex items-center gap-space-xs mb-space-xs">
              <HospitalIcon size={20} className="text-secondary" />
              <h4 className="font-body-bold text-body-bold text-on-surface">Emergency Support</h4>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface font-semibold">
              Contact your supervisor or local emergency services
            </p>
            <p className="font-label-meta text-label-meta text-on-surface-variant mt-0.5">
              Follow established clinical referral pathways for emergency transport.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

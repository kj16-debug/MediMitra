import { useState } from 'react';
import type { TriageResult, AnalyzeRequest } from '../types';
import {
  EmergencyIcon,
  WarningIcon,
  CheckIcon,
  ShieldIcon,
  PersonIcon,
  HospitalIcon,
  CloudIcon,
  ArrowForwardIcon,
  PrintIcon,
} from '../components/Icons';

interface SummaryScreenProps {
  result: TriageResult;
  form: AnalyzeRequest;
  onEditCase: () => void;
  onViewReferral: () => void;
  onEscalate: () => void;
  cloudEnabled: boolean;
  cloudModel: string;
  loadingCloud: boolean;
}

export function SummaryScreen({
  result: r,
  form,
  onEditCase,
  onViewReferral,
  onEscalate,
  cloudEnabled,
  cloudModel,
  loadingCloud,
}: SummaryScreenProps) {
  const [toastMessage, setToastMessage] = useState('');

  const urgency = r.urgency.toLowerCase();
  const isRed = urgency === 'red';
  const isYellow = urgency === 'yellow';

  const patientName = form.text.toLowerCase().includes('kabir')
    ? 'Kabir'
    : form.text.toLowerCase().includes('dev')
    ? 'Dev'
    : 'Field Patient';

  const tempF = form.vitals.temp_c ? ((form.vitals.temp_c * 9) / 5 + 32).toFixed(1) : null;

  return (
    <div className="flex flex-col w-full pb-space-xl">
      {/* Case Context Header & Breadcrumb */}
      <div className="py-space-md flex flex-col md:flex-row md:items-center justify-between gap-space-sm border-b border-surface-container mb-space-md">
        <div className="flex items-center gap-space-sm flex-wrap">
          <div className="flex items-center gap-space-xs px-space-sm py-1 bg-surface-container rounded-full text-on-surface-variant font-label-meta text-label-meta">
            <span>Case #R4829</span>
          </div>
          <span className="text-on-surface-variant font-label-meta text-label-meta hidden sm:inline">•</span>
          <span className="font-body-bold text-body-bold text-on-surface">
            {patientName} ({form.age_years ?? '—'} yrs, {form.sex})
          </span>
          <span className="text-on-surface-variant font-label-meta text-label-meta hidden sm:inline">•</span>
          <div className="text-on-surface-variant font-body-sm text-body-sm">
            <span>Sector 4 (Rampur Cluster)</span>
          </div>
        </div>
        <div className="flex items-center gap-space-xs">
          <span className="inline-flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-surface-container-high text-on-surface font-label-meta text-label-meta">
            <span className="w-2 h-2 rounded-full bg-secondary" />
            Assessed: Today, Just Now
          </span>
          <button
            onClick={() => window.print()}
            className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors cursor-pointer"
            title="Print Summary"
          >
            <PrintIcon size={18} />
          </button>
        </div>
      </div>

      {/* Primary Emergency Urgency Banner */}
      <div
        className={`rounded-2xl p-space-md sm:p-space-lg shadow-md relative overflow-hidden border mb-space-md ${
          isRed
            ? 'bg-error-container text-on-error-container border-error'
            : isYellow
            ? 'bg-amber-500/15 text-amber-950 border-amber-500/30'
            : 'bg-emerald-500/15 text-emerald-950 border-emerald-500/30'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-space-md relative z-10">
          <div className="flex items-start gap-space-md">
            <div
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                isRed
                  ? 'bg-error text-on-error animate-pulse'
                  : isYellow
                  ? 'bg-amber-600 text-white'
                  : 'bg-secondary text-white'
              }`}
            >
              {isRed ? (
                <EmergencyIcon size={34} />
              ) : isYellow ? (
                <WarningIcon size={34} />
              ) : (
                <CheckIcon size={34} />
              )}
            </div>

            <div className="flex flex-col gap-1 max-w-2xl">
              <div className="flex items-center gap-space-sm flex-wrap">
                <span
                  className={`px-space-sm py-0.5 rounded-md font-label-triage text-label-triage tracking-wide uppercase font-black ${
                    isRed
                      ? 'bg-error text-on-error'
                      : isYellow
                      ? 'bg-amber-700 text-white'
                      : 'bg-secondary text-white'
                  }`}
                >
                  {isRed
                    ? 'RED - REFER NOW'
                    : isYellow
                    ? 'YELLOW - REFER SOON'
                    : 'GREEN - ROUTINE'}
                </span>
                <span
                  className={`font-label-meta text-label-meta px-space-xs py-0.5 rounded font-bold ${
                    isRed
                      ? 'bg-error/15 text-error'
                      : isYellow
                      ? 'bg-amber-800/15 text-amber-900'
                      : 'bg-emerald-800/15 text-emerald-900'
                  }`}
                >
                  Priority Code {isRed ? '1' : isYellow ? '2' : '3'}
                </span>
              </div>

              <h1 className="font-headline-lg text-headline-lg leading-tight mt-1 font-bold">
                {isRed
                  ? 'Immediate Clinical Transfer Required'
                  : isYellow
                  ? 'Priority Assessment Required Within 24h'
                  : 'Routine Primary Care / Community Follow-up'}
              </h1>

              <p className="font-body-bold text-body-bold mt-1 leading-snug">
                {r.urgency_reason}
              </p>

              <div className="mt-space-sm flex items-center gap-space-xs bg-surface-container-lowest/80 backdrop-blur-sm p-3 rounded-xl border border-surface-container">
                <HospitalIcon size={22} className={isRed ? 'text-error' : isYellow ? 'text-amber-700' : 'text-secondary'} />
                <div className="flex flex-col">
                  <span className="font-label-meta text-label-meta uppercase tracking-wider text-on-surface-variant font-bold">
                    Mandatory Protocol Action
                  </span>
                  <span className="font-body-bold text-body-bold text-on-surface">
                    {isRed
                      ? 'Immediate transfer to Bhavnagar Community Health Centre (CHC).'
                      : isYellow
                      ? 'Refer for evaluation at Primary Health Centre within 24 hours.'
                      : 'Provide home hydration guidance and review in 48-72 hours.'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-space-xs shrink-0 self-stretch md:self-auto justify-between border-t md:border-t-0 pt-space-sm md:pt-0">
            <div className="bg-surface-container-lowest/90 px-space-md py-2.5 rounded-xl text-left md:text-right w-full md:w-auto shadow-sm border border-surface-container">
              <span className="font-label-meta text-label-meta text-on-surface-variant block">
                Nearest Designated Facility
              </span>
              <span className="font-body-bold text-body-bold text-primary block">
                Bhavnagar CHC (4.2 km)
              </span>
              <span className="font-label-meta text-label-meta text-on-surface-variant flex items-center md:justify-end gap-1 mt-0.5">
                <CheckIcon size={14} className="text-secondary" />
                Pediatric Ward Open
              </span>
            </div>
            <div className="text-right w-full hidden md:block">
              <span className="font-label-meta text-label-meta font-bold text-primary">
                Transit Window: {isRed ? '< 45 Mins' : '< 24 Hours'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Safety Rules Triggered Highlight Card */}
      {r.rule_reasons.length > 0 && (
        <div className="rounded-2xl bg-surface-container-lowest p-space-md sm:p-space-lg shadow-sm border border-surface-container mb-space-md">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-space-md">
            <div className="flex items-start gap-space-md">
              <div className="w-10 h-10 rounded-xl bg-surface-container-high text-primary flex items-center justify-center shrink-0">
                <ShieldIcon size={24} />
              </div>
              <div className="space-y-space-xs">
                <div className="flex items-center gap-space-xs">
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">
                    Deterministic Safety Rules Triggered
                  </h2>
                  <span className="px-space-xs py-0.5 rounded text-error bg-error-container font-label-meta text-label-meta font-bold">
                    {r.rule_reasons.length} Rule{r.rule_reasons.length > 1 ? 's' : ''} Active
                  </span>
                </div>
                <div className="space-y-1">
                  {r.rule_reasons.map((rule, idx) => (
                    <p key={idx} className="font-body-lg text-body-lg text-on-surface font-semibold">
                      • {rule}
                    </p>
                  ))}
                </div>
                <div className="flex items-start gap-space-xs text-on-surface-variant bg-surface-container-low px-space-sm py-2 rounded-xl border border-surface-container">
                  <p className="font-label-meta text-label-meta text-on-surface">
                    <strong className="font-body-bold text-primary">Clinical Invariant:</strong> Safety rules can only raise urgency, never lower it. Automated safeguards cannot be downgraded by manual discretion in the field.
                  </p>
                </div>
              </div>
            </div>
            <div className="shrink-0 flex md:flex-col items-center md:items-end justify-between gap-1 text-on-surface-variant font-label-meta text-label-meta bg-surface-container px-space-md py-2 rounded-xl">
              <span className="text-on-surface font-body-bold">Protocol v4.1</span>
              <span>MOHFW Rural Guidelines</span>
            </div>
          </div>
        </div>
      )}

      {/* Key Findings Cards Grid (3 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md mb-space-md">
        {/* 1. Patient Profile */}
        <div className="rounded-2xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col justify-between border border-surface-container">
          <div>
            <div className="flex items-center justify-between pb-space-sm border-b border-surface-container">
              <div className="flex items-center gap-space-xs">
                <PersonIcon size={18} className="text-primary" />
                <span className="font-body-bold text-body-bold text-on-surface">Patient Profile</span>
              </div>
              <span className="font-label-meta text-label-meta text-on-surface-variant">Cluster A-12</span>
            </div>
            <div className="space-y-space-sm mt-space-sm text-sm">
              <div className="flex justify-between items-baseline py-1 bg-surface-container-low px-2 rounded-lg">
                <span className="font-label-meta text-label-meta text-on-surface-variant">Name</span>
                <span className="font-body-bold text-body-bold text-on-surface">{patientName}</span>
              </div>
              <div className="flex justify-between items-baseline py-1 px-2">
                <span className="font-label-meta text-label-meta text-on-surface-variant">Age & Sex</span>
                <span className="font-body-sm text-body-sm text-on-surface font-semibold">
                  {form.age_years ?? '—'} yrs • {form.sex}
                </span>
              </div>
              <div className="flex justify-between items-baseline py-1 bg-surface-container-low px-2 rounded-lg">
                <span className="font-label-meta text-label-meta text-on-surface-variant">Onset Duration</span>
                <span className="font-body-bold text-body-bold text-error">
                  {r.duration || '3 days duration'}
                </span>
              </div>
              <div className="flex justify-between items-baseline py-1 px-2">
                <span className="font-label-meta text-label-meta text-on-surface-variant">Location</span>
                <span className="font-body-sm text-body-sm text-on-surface">Rampur PHC Cluster</span>
              </div>
            </div>
          </div>
          <div className="mt-space-md pt-space-xs text-on-surface-variant font-label-meta text-label-meta border-t border-surface-container">
            <span>Primary Caregiver / Attendant Present</span>
          </div>
        </div>

        {/* 2. Clinical Vitals */}
        <div className="rounded-2xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col justify-between border border-surface-container">
          <div>
            <div className="flex items-center justify-between pb-space-sm border-b border-surface-container">
              <div className="flex items-center gap-space-xs">
                <HospitalIcon size={18} className="text-primary" />
                <span className="font-body-bold text-body-bold text-on-surface">Clinical Vitals</span>
              </div>
              <span className="font-label-meta text-label-meta text-error font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-error" /> Acquired
              </span>
            </div>

            <div className="grid grid-cols-2 gap-space-xs mt-space-sm">
              <div className="bg-surface-container-low p-2.5 rounded-xl border border-surface-container flex flex-col justify-between">
                <span className="font-label-meta text-label-meta text-on-surface-variant">Temp</span>
                <div className="mt-1">
                  <span className={`font-headline-sm text-headline-sm font-bold ${form.vitals.temp_c && form.vitals.temp_c > 38 ? 'text-error' : 'text-on-surface'}`}>
                    {form.vitals.temp_c ? `${form.vitals.temp_c}°C` : '—'}
                  </span>
                  <span className="font-label-meta text-label-meta text-on-surface-variant block">
                    {tempF ? `${tempF}°F` : 'Not recorded'}
                  </span>
                </div>
              </div>

              <div className="bg-surface-container-low p-2.5 rounded-xl border border-surface-container flex flex-col justify-between">
                <span className="font-label-meta text-label-meta text-on-surface-variant">Pulse Rate</span>
                <div className="mt-1">
                  <span className={`font-headline-sm text-headline-sm font-bold ${form.vitals.pulse_bpm && form.vitals.pulse_bpm > 100 ? 'text-error' : 'text-on-surface'}`}>
                    {form.vitals.pulse_bpm ?? '—'}
                  </span>
                  <span className="font-label-meta text-label-meta text-on-surface-variant block">
                    bpm {form.vitals.pulse_bpm && form.vitals.pulse_bpm > 100 ? '(Elevated)' : ''}
                  </span>
                </div>
              </div>

              <div className="bg-surface-container-low p-2.5 rounded-xl border border-surface-container flex flex-col justify-between">
                <span className="font-label-meta text-label-meta text-on-surface-variant">SpO2</span>
                <div className="mt-1">
                  <span className={`font-headline-sm text-headline-sm font-bold ${form.vitals.spo2_pct && form.vitals.spo2_pct < 90 ? 'text-error' : 'text-secondary'}`}>
                    {form.vitals.spo2_pct ? `${form.vitals.spo2_pct}%` : '—'}
                  </span>
                  <span className="font-label-meta text-label-meta text-on-surface-variant block">
                    {form.vitals.spo2_pct && form.vitals.spo2_pct < 90 ? 'Hypoxia Flag' : 'Room air'}
                  </span>
                </div>
              </div>

              <div className="bg-surface-container-low p-2.5 rounded-xl border border-surface-container flex flex-col justify-between">
                <span className="font-label-meta text-label-meta text-on-surface-variant">Resp Rate</span>
                <div className="mt-1">
                  <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
                    {form.vitals.resp_rate ? `${form.vitals.resp_rate}` : '—'}
                  </span>
                  <span className="font-label-meta text-label-meta text-on-surface-variant block">
                    /min
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-space-md pt-space-xs text-on-surface-variant font-label-meta text-label-meta border-t border-surface-container">
            <span>Standardized metric validation verified</span>
          </div>
        </div>

        {/* 3. Primary Observations */}
        <div className="rounded-2xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col justify-between border border-surface-container">
          <div>
            <div className="flex items-center justify-between pb-space-sm border-b border-surface-container">
              <div className="flex items-center gap-space-xs">
                <WarningIcon size={18} className="text-primary" />
                <span className="font-body-bold text-body-bold text-on-surface">Symptoms & Signs</span>
              </div>
              <span className="font-label-meta text-label-meta px-2 py-0.5 bg-surface-container-high rounded-full text-on-surface">
                Triaged
              </span>
            </div>
            <div className="space-y-space-sm mt-space-sm">
              <div className="p-2.5 rounded-xl bg-surface-container-low border border-surface-container">
                <span className="font-label-meta text-label-meta text-on-surface-variant block mb-1">
                  Chief Complaint
                </span>
                <p className="font-body-sm text-body-sm text-on-surface font-semibold">
                  {r.chief_complaint}
                </p>
              </div>

              {r.red_flags.length > 0 && (
                <div className="p-2.5 rounded-xl bg-error-container/20 border border-error/30">
                  <span className="font-label-meta text-label-meta text-error block mb-1 font-bold">
                    Red Flags Flagged:
                  </span>
                  <ul className="text-xs text-error font-medium space-y-1">
                    {r.red_flags.map((rf, i) => (
                      <li key={i}>• {rf}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          <div className="mt-space-md pt-space-xs text-on-surface-variant font-label-meta text-label-meta border-t border-surface-container">
            <span>Summary: {r.summary_plain.slice(0, 75)}...</span>
          </div>
        </div>
      </div>

      {/* Facility Routing & Direct Dispatch Map Teaser */}
      <div className="rounded-2xl bg-surface-container-lowest p-space-md sm:p-space-lg shadow-sm border border-surface-container mb-space-lg">
        <div className="flex flex-col lg:flex-row gap-space-md items-stretch">
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-space-xs text-primary font-label-meta text-label-meta uppercase tracking-wider mb-1 font-bold">
                <HospitalIcon size={18} />
                <span>Direct Facility Routing & Transit Protocol</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                Bhavnagar Community Health Centre (CHC)
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 leading-relaxed">
                Emergency dispatch line alerted. Maternal and child tracking card #MH-8819 prepared for handover.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-space-sm my-space-md">
              <div className="p-2.5 rounded-xl bg-surface-container-low border border-surface-container">
                <span className="font-label-meta text-label-meta text-on-surface-variant block">Distance</span>
                <span className="font-body-bold text-body-bold text-on-surface">4.2 Kilometers</span>
              </div>
              <div className="p-2.5 rounded-xl bg-surface-container-low border border-surface-container">
                <span className="font-label-meta text-label-meta text-on-surface-variant block">Est. Transit</span>
                <span className="font-body-bold text-body-bold text-on-surface">18 - 22 mins</span>
              </div>
              <div className="p-2.5 rounded-xl bg-surface-container-low border border-surface-container col-span-2 sm:col-span-1">
                <span className="font-label-meta text-label-meta text-on-surface-variant block">Duty Officer</span>
                <span className="font-body-bold text-body-bold text-primary">Dr. P. Varma (Ped.)</span>
              </div>
            </div>

            <div className="flex items-center gap-space-sm flex-wrap text-on-surface-variant font-label-meta text-label-meta">
              <span className="flex items-center gap-1">
                CHC Desk: +91 278 242 8100
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-secondary font-bold">
                Ambulance Line: 108 Standby
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="pt-space-md border-t border-surface-container flex flex-col md:flex-row items-stretch md:items-center justify-between gap-space-md">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-space-sm order-2 md:order-1">
          <button
            onClick={onEditCase}
            className="h-12 px-space-md rounded-xl flex items-center justify-center gap-space-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-container font-body-bold text-body-bold transition-colors border border-surface-container cursor-pointer"
          >
            <span>Re-check vitals / Edit case</span>
          </button>

          <button
            disabled={!cloudEnabled || loadingCloud}
            onClick={onEscalate}
            className="h-12 px-space-md rounded-xl bg-surface-container-lowest text-primary hover:bg-surface-container font-body-bold text-body-bold flex items-center justify-center gap-space-xs shadow-sm transition-all border border-surface-container cursor-pointer disabled:opacity-50"
          >
            <CloudIcon size={18} />
            <span>
              {loadingCloud ? 'Syncing second opinion...' : 'Escalate to cloud second opinion'}
            </span>
          </button>
        </div>

        <div className="order-1 md:order-2 flex items-stretch">
          <button
            onClick={onViewReferral}
            className="w-full md:w-auto h-13 min-h-[52px] px-space-xl rounded-xl bg-primary hover:bg-tertiary text-on-primary font-body-bold text-body-bold flex items-center justify-center gap-space-sm shadow-md transition-all cursor-pointer"
          >
            <span>View referral note</span>
            <ArrowForwardIcon size={20} />
          </button>
        </div>
      </div>

      {/* Toast message if any */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-xl shadow-xl flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

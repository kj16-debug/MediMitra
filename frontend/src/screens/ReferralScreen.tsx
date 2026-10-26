import { useState } from 'react';
import type { TriageResult, AnalyzeRequest } from '../types';
import {
  HospitalIcon,
  CopyIcon,
  PrintIcon,
  ArrowBackIcon,
  EmergencyIcon,
  WarningIcon,
  CheckIcon,
  ShieldIcon,
  PersonIcon,
} from '../components/Icons';

interface ReferralScreenProps {
  result: TriageResult;
  form: AnalyzeRequest;
  onBackToSummary: () => void;
}

export function ReferralScreen({
  result: r,
  form,
  onBackToSummary,
}: ReferralScreenProps) {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
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

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  }

  async function handleCopy() {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(r.referral_note);
        setCopyState('copied');
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = r.referral_note;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(textarea);
        if (!ok) throw new Error('Copy command failed');
        setCopyState('copied');
      }
      showToast('Referral summary copied to clipboard!');
      setTimeout(() => setCopyState('idle'), 2000);
    } catch {
      setCopyState('failed');
      showToast('Copy failed. Please copy text manually.');
      setTimeout(() => setCopyState('idle'), 2500);
    }
  }

  return (
    <div className="flex flex-col w-full pb-space-xl">
      {/* Top Action Toolbar */}
      <div className="py-space-md flex flex-col md:flex-row md:items-center justify-between gap-space-md border-b border-surface-container mb-space-md">
        <div className="flex items-center gap-space-sm">
          <button
            onClick={onBackToSummary}
            className="inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-body-sm shadow-sm transition-all border border-surface-container cursor-pointer"
          >
            <ArrowBackIcon size={18} />
            <span>Back to Urgency</span>
          </button>
          <div className="hidden sm:flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-meta text-label-meta">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span>Slip Ready • Offline Cached</span>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex items-center flex-wrap gap-space-xs sm:gap-space-sm">
          <button
            onClick={handleCopy}
            className={`inline-flex items-center gap-space-xs px-space-sm sm:px-space-md py-2 rounded-xl text-primary font-body-sm text-body-sm shadow-sm transition-all border border-surface-container cursor-pointer ${
              copyState === 'failed'
                ? 'bg-error-container text-on-error-container'
                : 'bg-surface-container-lowest hover:bg-surface-container'
            }`}
          >
            <CopyIcon size={18} />
            <span>
              {copyState === 'copied'
                ? 'COPIED ✓'
                : copyState === 'failed'
                ? 'COPY FAILED ⚠'
                : 'Copy Text'}
            </span>
          </button>

          <button
            onClick={() => showToast('Transmitting via Bluetooth ESC/POS & SMS Dispatch...')}
            className="inline-flex items-center gap-space-xs px-space-sm sm:px-space-md py-2 rounded-xl bg-surface-container-lowest hover:bg-surface-container text-on-surface font-body-sm text-body-sm shadow-sm transition-all border border-surface-container cursor-pointer"
          >
            <span>SMS / Bluetooth</span>
          </button>

          <button
            onClick={() => {
              showToast('Generating printable layout...');
              setTimeout(() => window.print(), 500);
            }}
            className="inline-flex items-center gap-space-xs px-space-md py-2 rounded-xl bg-primary hover:bg-tertiary text-on-primary font-body-bold text-body-bold shadow-md transition-all cursor-pointer"
          >
            <PrintIcon size={18} />
            <span>Print Note</span>
          </button>
        </div>
      </div>

      {/* Visual Field Context Banner */}
      <div className="relative w-full rounded-2xl overflow-hidden mb-space-lg shadow-sm border border-surface-container bg-primary p-space-lg text-on-primary">
        <div className="max-w-xl">
          <p className="font-label-meta text-label-meta uppercase tracking-wider text-primary-fixed">
            Sub-Center Pipariya • Field Dispatch Mode
          </p>
          <h2 className="font-headline-sm text-headline-sm text-on-primary leading-tight font-bold mt-1">
            Emergency Clinical Referral Slip
          </h2>
          <p className="font-body-sm text-body-sm text-primary-fixed opacity-95 mt-1">
            High-contrast, thermal-printer compliant medical triage documentation record
          </p>
        </div>
      </div>

      {/* Printable Clinical Slip Paper Card */}
      <div className="relative w-full bg-surface-container-lowest rounded-2xl shadow-xl p-space-md sm:p-space-lg md:p-space-xl mb-space-xl overflow-hidden border border-surface-container">
        {/* Slip Top Identification Ribbon */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-space-sm pb-space-md mb-space-md bg-surface-container-low p-space-md rounded-xl border border-surface-container">
          <div className="flex items-start gap-space-sm">
            <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-sm">
              <HospitalIcon size={26} />
            </div>
            <div>
              <span className="font-label-meta text-label-meta uppercase tracking-wider text-primary font-bold">
                Health & Family Welfare • Primary Triage Unit
              </span>
              <h1 className="font-headline-sm sm:font-headline-lg text-headline-sm sm:text-headline-lg text-on-surface leading-tight tracking-tight uppercase font-black">
                Community Health Worker Field Referral Slip
              </h1>
              <p className="font-body-sm text-body-sm text-on-surface-variant font-medium">
                MediMitra Decision Support System
              </p>
            </div>
          </div>

          {/* Slip Meta Badge Box */}
          <div className="flex flex-col sm:items-end justify-center bg-surface-container-lowest px-space-md py-space-sm rounded-xl shadow-sm border border-surface-container">
            <div className="flex items-center gap-space-xs text-primary font-bold">
              <span>REF-DEMO-2025</span>
            </div>
            <span className="font-label-meta text-label-meta text-on-surface-variant">
              Triage Assessment Time: Current Session
            </span>
            <span className="font-label-meta text-label-meta text-secondary font-bold">
              Priority Dispatch: {isRed ? 'Immediate' : isYellow ? 'Urgent' : 'Routine'}
            </span>
          </div>
        </div>

        {/* Health Worker Attestation Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm bg-surface-container-high/40 p-space-sm rounded-xl mb-space-lg text-on-surface border border-surface-container">
          <div className="flex flex-col px-space-xs">
            <span className="font-label-meta text-label-meta text-on-surface-variant uppercase">
              Designated Worker
            </span>
            <span className="font-body-bold text-body-bold">Field Worker (Illustrative)</span>
          </div>
          <div className="flex flex-col px-space-xs">
            <span className="font-label-meta text-label-meta text-on-surface-variant uppercase">
              Cadre / State ID
            </span>
            <span className="font-body-sm text-body-sm font-semibold">ASHA #4092 (Demo)</span>
          </div>
          <div className="flex flex-col px-space-xs">
            <span className="font-label-meta text-label-meta text-on-surface-variant uppercase">
              Assigned Center
            </span>
            <span className="font-body-sm text-body-sm">Sub-Center (Demo)</span>
          </div>
          <div className="flex flex-col px-space-xs">
            <span className="font-label-meta text-label-meta text-on-surface-variant uppercase">
              Destination Facility
            </span>
            <span className="font-body-sm text-body-sm font-bold text-primary">
              Primary Facility (Illustrative)
            </span>
          </div>
        </div>

        {/* Patient Demographic Profile */}
        <div className="mb-space-lg">
          <div className="flex items-center gap-space-xs mb-space-xs">
            <PersonIcon size={20} className="text-primary" />
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              Patient Demographic Profile
            </h3>
          </div>
          <div className="bg-surface-container-low rounded-xl p-space-md border border-surface-container">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-space-md">
              <div className="col-span-2 sm:col-span-1">
                <span className="font-label-meta text-label-meta text-on-surface-variant">Full Name</span>
                <p className="font-body-bold text-body-bold text-on-surface text-lg">{patientName}</p>
              </div>
              <div>
                <span className="font-label-meta text-label-meta text-on-surface-variant">Age</span>
                <p className="font-body-bold text-body-bold text-on-surface">{form.age_years ?? '—'} Years</p>
              </div>
              <div>
                <span className="font-label-meta text-label-meta text-on-surface-variant">Gender</span>
                <p className="font-body-bold text-body-bold text-on-surface capitalize">{form.sex}</p>
              </div>
              <div>
                <span className="font-label-meta text-label-meta text-on-surface-variant">Village</span>
                <p className="font-body-bold text-body-bold text-on-surface">Rampur</p>
              </div>
              <div>
                <span className="font-label-meta text-label-meta text-on-surface-variant">Duration</span>
                <p className="font-body-bold text-body-bold text-error">{r.duration || '3 days'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Triage Urgency Level Banner */}
        <div
          className={`mb-space-lg rounded-2xl overflow-hidden border shadow-md ${
            isRed
              ? 'bg-error-container text-on-error-container border-error'
              : isYellow
              ? 'bg-amber-500/15 text-amber-950 border-amber-500/30'
              : 'bg-emerald-500/15 text-emerald-950 border-emerald-500/30'
          }`}
        >
          <div
            className={`p-space-md flex flex-col md:flex-row md:items-center justify-between gap-space-md ${
              isRed
                ? 'bg-error text-on-error'
                : isYellow
                ? 'bg-amber-700 text-white'
                : 'bg-secondary text-white'
            }`}
          >
            <div className="flex items-center gap-space-sm">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                {isRed ? (
                  <EmergencyIcon size={30} />
                ) : isYellow ? (
                  <WarningIcon size={30} />
                ) : (
                  <CheckIcon size={30} />
                )}
              </div>
              <div>
                <span className="font-label-meta text-label-meta uppercase tracking-wider opacity-90 block">
                  Triaged Urgency Classification
                </span>
                <div className="font-label-triage text-headline-sm uppercase tracking-wide font-black">
                  {isRed
                    ? 'RED - REFER NOW'
                    : isYellow
                    ? 'YELLOW - REFER SOON'
                    : 'GREEN - ROUTINE'}
                </div>
              </div>
            </div>
            <div className="bg-white text-on-surface px-space-md py-1.5 rounded-full font-label-triage text-label-triage uppercase text-center shrink-0 shadow-sm font-bold">
              {isRed
                ? 'Immediate Transfer Required'
                : isYellow
                ? 'Priority Referral (Within 24h)'
                : 'Routine Community Follow-up'}
            </div>
          </div>

          <div className="p-space-md flex items-start gap-space-sm">
            <div>
              <p className="font-body-bold text-body-bold">Recommended Action Line:</p>
              <p className="font-body-lg text-body-lg font-medium mt-0.5">
                {isRed
                  ? 'Seek immediate evaluation at Community Health Centre (CHC). Monitor fluid intake continuously en route. Alert facility on arrival.'
                  : isYellow
                  ? 'Seek evaluation at Primary Health Centre within 24 hours. Keep hydrated and watch for red flags.'
                  : 'Manage at home with oral hydration and standard protocol care. Review if symptoms worsen.'}
              </p>
            </div>
          </div>
        </div>

        {/* Clinical Findings & Vitals Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-space-md mb-space-lg">
          {/* Left side: Complaints & Danger Signs (7 cols) */}
          <div className="md:col-span-7 flex flex-col gap-space-md">
            <div className="bg-surface-container-low p-space-md rounded-xl border border-surface-container">
              <h4 className="font-body-bold text-body-bold text-on-surface mb-1">Chief Complaints</h4>
              <p className="font-body-lg text-body-lg text-on-surface leading-relaxed">
                {r.chief_complaint}
              </p>
            </div>

            {r.red_flags.length > 0 && (
              <div className="bg-surface-container-low p-space-md rounded-xl border border-surface-container">
                <h4 className="font-body-bold text-body-bold text-error mb-1">Field Danger Signs Identified</h4>
                <ul className="flex flex-col gap-space-xs">
                  {r.red_flags.map((flag, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-space-xs bg-surface-container-lowest p-space-xs rounded-lg text-on-surface border border-surface-container text-sm font-semibold"
                    >
                      <span className="text-error font-bold">•</span>
                      <span>{flag}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-surface-container-low p-space-md rounded-xl border border-surface-container">
              <h4 className="font-body-bold text-body-bold text-on-surface mb-1">Referral Note Text</h4>
              <p className="font-body-sm text-body-sm text-on-surface whitespace-pre-wrap leading-relaxed">
                {r.referral_note}
              </p>
            </div>
          </div>

          {/* Right side: Vitals Matrix (5 cols) */}
          <div className="md:col-span-5 bg-surface-container-low p-space-md rounded-xl flex flex-col justify-between border border-surface-container">
            <div>
              <div className="flex items-center justify-between mb-space-sm text-on-surface">
                <h4 className="font-body-bold text-body-bold">Field Vitals Acquired</h4>
                <span className="font-label-meta text-label-meta px-2 py-0.5 bg-surface-container rounded text-on-surface-variant font-bold">
                  Validated
                </span>
              </div>

              <div className="grid grid-cols-2 gap-space-sm">
                <div className="bg-surface-container-lowest p-space-sm rounded-xl flex flex-col justify-between shadow-sm border border-surface-container">
                  <span className="font-label-meta text-label-meta font-bold text-error">TEMP</span>
                  <div className="font-headline-sm text-headline-sm text-error font-bold">
                    {form.vitals.temp_c ? `${form.vitals.temp_c}°C` : '—'}
                  </div>
                  <span className="font-label-meta text-label-meta text-on-surface-variant">
                    {tempF ? `${tempF}°F` : 'Not recorded'}
                  </span>
                </div>

                <div className="bg-surface-container-lowest p-space-sm rounded-xl flex flex-col justify-between shadow-sm border border-surface-container">
                  <span className="font-label-meta text-label-meta font-bold text-on-surface-variant">PULSE</span>
                  <div className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    {form.vitals.pulse_bpm ?? '—'}
                  </div>
                  <span className="font-label-meta text-label-meta text-on-surface-variant">bpm</span>
                </div>

                <div className="bg-surface-container-lowest p-space-sm rounded-xl flex flex-col justify-between shadow-sm border border-surface-container">
                  <span className="font-label-meta text-label-meta font-bold text-secondary">SpO2</span>
                  <div className={`font-headline-sm text-headline-sm font-bold ${form.vitals.spo2_pct && form.vitals.spo2_pct < 90 ? 'text-error' : 'text-secondary'}`}>
                    {form.vitals.spo2_pct ? `${form.vitals.spo2_pct}%` : '—'}
                  </div>
                  <span className="font-label-meta text-label-meta text-on-surface-variant">Room air oxygen</span>
                </div>

                <div className="bg-surface-container-lowest p-space-sm rounded-xl flex flex-col justify-between shadow-sm border border-surface-container">
                  <span className="font-label-meta text-label-meta font-bold text-error">RESP RATE</span>
                  <div className="font-headline-sm text-headline-sm text-error font-bold">
                    {form.vitals.resp_rate ? `${form.vitals.resp_rate}/min` : '—'}
                  </div>
                  <span className="font-label-meta text-label-meta text-on-surface-variant">Breaths / min</span>
                </div>
              </div>
            </div>

            {/* Stability Pulse Line removed per compliance */}
          </div>
        </div>

        {/* Mandatory Statutory Field Medical Protocol Notice */}
        <div className="p-space-md rounded-xl bg-surface-container-highest text-on-surface mb-space-lg flex items-start gap-space-sm border border-surface-container">
          <ShieldIcon size={24} className="text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-label-meta text-label-meta uppercase tracking-wider text-primary font-bold">
              Statutory Field Medical Protocol Notice
            </p>
            <p className="font-body-sm text-body-sm font-medium leading-relaxed text-on-surface mt-0.5">
              <strong>No diagnosis made. No prescription medications or medicinal dosages administered.</strong> This field referral note was generated automatically based on standard triage screening protocols to assist prompt intake. Refer child immediately for comprehensive clinical assessment by a licensed medical officer.
            </p>
            <p className="text-xs text-on-surface-variant mt-1 italic">
              {r.disclaimer}
            </p>
          </div>
        </div>

        {/* Professional Dual Sign-off Blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md pt-space-md border-t border-surface-container">
          <div className="bg-surface-container-low p-space-md rounded-xl flex flex-col justify-between min-h-[140px] border border-surface-container">
            <div>
              <span className="font-label-meta text-label-meta uppercase tracking-wider text-on-surface-variant font-bold">
                Referring Health Worker Attestation (Illustrative - simulated demo)
              </span>
              <div className="mt-1 font-body-bold text-body-bold text-on-surface">Field Worker ID #4092</div>
              <p className="font-label-meta text-label-meta text-on-surface-variant">
                Field referral generated via MediMitra decision support
              </p>
            </div>
            <div className="pt-space-md flex items-end justify-between border-t border-surface-container">
              <span className="text-secondary font-label-meta text-label-meta font-bold">
                Triage Status: Verified
              </span>
              <span className="font-label-meta text-label-meta text-on-surface-variant">Standard Protocol</span>
            </div>
          </div>

          <div className="bg-surface-container-low p-space-md rounded-xl flex flex-col justify-between min-h-[140px] border border-surface-container">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-label-meta text-label-meta uppercase tracking-wider text-on-surface-variant font-bold">
                  Receiving Facility Acknowledgment
                </span>
                <span className="font-label-meta text-label-meta text-primary font-bold">Designated Facility</span>
              </div>
              <p className="font-label-meta text-label-meta text-on-surface-variant mt-1">
                To be stamped and countersigned by Medical Officer / Staff Nurse on arrival
              </p>
            </div>
            <div className="pt-space-md flex items-center justify-between text-on-surface-variant border-t border-surface-container text-xs">
              <span>Arrival Time: ____ : ____</span>
              <span>Officer: ________________</span>
            </div>
          </div>
        </div>
      </div>

      {/* Handheld Thermal Printer Sync Assist */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-space-md bg-surface-container p-space-md rounded-2xl border border-surface-container">
        <div>
          <h4 className="font-body-bold text-body-bold text-on-surface">Portable Thermal Printer Sync</h4>
          <p className="font-label-meta text-label-meta text-on-surface-variant">
            Compatible with 58mm & 80mm ESC/POS Bluetooth field printers
          </p>
        </div>
        <button
          onClick={() => showToast('Sending slip to handheld 58mm thermal printer...')}
          className="w-full sm:w-auto px-space-md py-2.5 rounded-xl bg-surface-container-lowest hover:bg-surface-container-high text-primary font-body-sm text-body-sm shadow-sm transition-all border border-surface-container cursor-pointer"
        >
          <span>Quick Print Slip (58mm)</span>
        </button>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-xl shadow-xl flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

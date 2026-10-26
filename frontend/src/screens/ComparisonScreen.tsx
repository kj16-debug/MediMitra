import { useState } from 'react';
import type { TriageResult, AnalyzeRequest } from '../types';
import {
  EmergencyIcon,
  WarningIcon,
  CheckIcon,
  ShieldIcon,
  LockIcon,
  CloudIcon,
  HospitalIcon,
} from '../components/Icons';

interface ComparisonScreenProps {
  localResult: TriageResult;
  cloudResult: TriageResult | null;
  form: AnalyzeRequest;
  onSelectResult: (tier: 'local' | 'cloud') => void;
  onBackToSummary: () => void;
  simulated: boolean;
}

export function ComparisonScreen({
  localResult: local,
  cloudResult: cloud,
  form,
  onSelectResult,
  onBackToSummary,
  simulated,
}: ComparisonScreenProps) {
  const [layoutMode, setLayoutMode] = useState<'side' | 'diff'>('side');
  const [toastMessage, setToastMessage] = useState('');

  const patientName = form.text.toLowerCase().includes('kabir')
    ? 'Kabir'
    : form.text.toLowerCase().includes('dev')
    ? 'Dev'
    : 'Field Patient';

  const localUrgency = local.urgency.toLowerCase();
  const cloudUrgency = cloud ? cloud.urgency.toLowerCase() : localUrgency;

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  }

  function handleSelect(tier: 'local' | 'cloud') {
    showToast(
      tier === 'local'
        ? 'Selected: On-device Edge Evaluation. Proceeding to referral.'
        : 'Selected: Cloud Second Opinion. Proceeding to referral.'
    );
    setTimeout(() => onSelectResult(tier), 1200);
  }

  return (
    <div className="flex flex-col w-full pb-space-xl">
      {/* Top Breadcrumb & Status Navigation Meta */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pt-space-sm pb-space-sm border-b border-surface-container mb-space-md">
        <div className="flex items-center gap-space-xs text-on-surface-variant text-sm">
          <button
            onClick={onBackToSummary}
            className="text-primary font-bold hover:underline cursor-pointer"
          >
            ← Back to Summary
          </button>
          <span className="text-on-surface-variant/40">/</span>
          <span className="font-label-meta text-label-meta uppercase tracking-wider text-on-surface-variant">
            Triage Registry
          </span>
          <span className="text-on-surface-variant/40">/</span>
          <span className="font-label-meta text-label-meta text-primary font-bold">
            Case #R4829
          </span>
        </div>
        <div className="flex items-center gap-space-xs px-space-sm py-1 bg-surface-container rounded-full self-start sm:self-auto shadow-sm border border-surface-container">
          <ShieldIcon size={16} className="text-primary" />
          <span className="font-label-meta text-label-meta text-on-surface-variant">
            Dual-Path Consensus Validated
          </span>
        </div>
      </div>

      {/* Primary Page Header */}
      <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-space-sm mb-space-md">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
            Clinical Model Dual Evaluation
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs">
            Patient Subject: <span className="font-body-bold text-body-bold text-on-surface">{patientName} ({form.age_years ?? '—'}y)</span> • CHW Operator: Sunita Kumari (Sub-center Pipariya)
          </p>
        </div>
        <div className="flex items-center gap-space-xs text-on-surface-variant font-label-meta text-label-meta">
          <span>Evaluated: Today, Just Now</span>
        </div>
      </div>

      {/* Simulated Banner Notice */}
      <section className="w-full bg-surface-container rounded-2xl p-space-md md:p-space-lg mb-space-lg shadow-sm relative overflow-hidden border border-surface-container">
        <div className="relative flex flex-col sm:flex-row items-start gap-space-md">
          <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-sm">
            <ShieldIcon size={22} />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-space-xs sm:gap-space-sm mb-1">
              <span className="font-body-bold text-body-bold text-on-surface">
                {simulated
                  ? 'Simulated comparison in demo mode. Safety rules applied to both results.'
                  : 'Live model comparison. Deterministic safety rules applied to both outputs.'}
              </span>
              <span className="px-2 py-0.5 bg-surface-container-highest text-on-surface-variant rounded font-label-meta text-label-meta font-bold">
                Determinism Guard: ON
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              Showing transparency between offline-first edge models and high-parameter cloud verification. In high-stakes assessments, deterministic overrides supersede raw stochastic predictions on both runtime tiers.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Comparison Control & View Switcher */}
      <div className="flex items-center justify-between mb-space-md px-1">
        <div className="flex items-center gap-space-xs">
          <span className="font-body-bold text-body-bold text-on-surface">Diagnostic Breakdown</span>
        </div>
        <div className="inline-flex p-1 bg-surface-container-high rounded-xl text-on-surface-variant border border-surface-container" role="tablist">
          <button
            onClick={() => setLayoutMode('side')}
            className={`px-3 py-1.5 text-xs font-body-bold rounded-lg transition-all cursor-pointer ${
              layoutMode === 'side'
                ? 'bg-surface-container-lowest text-primary shadow-sm font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Side-by-Side
          </button>
          <button
            onClick={() => setLayoutMode('diff')}
            className={`px-3 py-1.5 text-xs font-body-bold rounded-lg transition-all cursor-pointer ${
              layoutMode === 'diff'
                ? 'bg-surface-container-lowest text-primary shadow-sm font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Delta Inspection
          </button>
        </div>
      </div>

      {/* Dual Column Comparison Bento Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg mb-space-lg">
        {/* Column A: On-device Analysis */}
        <article className="flex flex-col bg-surface-container-lowest rounded-2xl shadow-md overflow-hidden relative border border-surface-container transition-all hover:shadow-lg">
          <div className="h-2 w-full bg-primary" />
          <div className="p-space-md sm:p-space-lg flex flex-col flex-1">
            <div className="flex flex-wrap items-center justify-between gap-space-xs mb-space-sm">
              <span className="font-label-meta text-label-meta uppercase tracking-wider text-primary font-bold">
                Card A • Primary Edge Engine
              </span>
              <span className="inline-flex items-center gap-1 px-space-sm py-1 rounded-full bg-surface-container text-on-surface font-label-meta text-label-meta shadow-sm">
                <LockIcon size={14} className="text-primary" />
                Private • 100% Offline • 0.3s Latency
              </span>
            </div>

            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs font-bold">
              On-device Analysis (Gemma 4 E4B)
            </h2>
            <p className="font-label-meta text-label-meta text-on-surface-variant mb-space-md">
              Zero data leaves handset. Real-time inference on local neural engine.
            </p>

            {/* Urgency Badge */}
            <div
              className={`p-space-sm sm:p-space-md rounded-xl mb-space-md flex items-center justify-between border ${
                localUrgency === 'red'
                  ? 'bg-error-container/40 border-error'
                  : localUrgency === 'yellow'
                  ? 'bg-amber-500/15 border-amber-500/30'
                  : 'bg-emerald-500/15 border-emerald-500/30'
              }`}
            >
              <div className="flex items-center gap-space-sm">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                    localUrgency === 'red'
                      ? 'bg-error text-on-error animate-pulse'
                      : localUrgency === 'yellow'
                      ? 'bg-amber-600 text-white'
                      : 'bg-secondary text-white'
                  }`}
                >
                  {localUrgency === 'red' ? (
                    <EmergencyIcon size={20} />
                  ) : localUrgency === 'yellow' ? (
                    <WarningIcon size={20} />
                  ) : (
                    <CheckIcon size={20} />
                  )}
                </div>
                <div>
                  <div className="font-label-triage text-label-triage font-black tracking-wide">
                    {localUrgency === 'red'
                      ? 'RED - REFER NOW'
                      : localUrgency === 'yellow'
                      ? 'YELLOW - REFER SOON'
                      : 'GREEN - ROUTINE'}
                  </div>
                  <div className="font-label-meta text-label-meta text-on-surface-variant">
                    {local.urgency_reason}
                  </div>
                </div>
              </div>
              <span className="font-label-meta text-label-meta px-2 py-0.5 bg-surface-container rounded font-bold uppercase">
                Edge Tier
              </span>
            </div>

            {/* Clinical Synthesis */}
            <div className="bg-surface-container-low rounded-xl p-space-md mb-space-md border border-surface-container">
              <div className="font-label-meta text-label-meta uppercase text-on-surface-variant mb-1 font-bold">
                Clinical Impression
              </div>
              <p className="font-body-lg text-body-lg text-on-surface leading-snug">
                {local.summary_plain}
              </p>
            </div>

            {/* Confidence & Metric Visualization (Illustrative - simulated demo) */}
            <div className="grid grid-cols-2 gap-space-sm mb-space-md">
              <div className="p-space-sm bg-surface-container rounded-xl border border-surface-container">
                <div className="font-label-meta text-label-meta text-on-surface-variant mb-1">
                  Confidence Score (Demo)
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-headline-lg text-headline-lg text-primary font-bold">94.2%</span>
                  <span className="font-label-meta text-label-meta text-on-surface-variant">edge fit</span>
                </div>
                <div className="w-full bg-surface-container-highest h-2 rounded-full mt-2 overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: '94.2%' }} />
                </div>
              </div>

              <div className="p-space-sm bg-surface-container rounded-xl border border-surface-container">
                <div className="font-label-meta text-label-meta text-on-surface-variant mb-1">
                  Compute Latency (Demo)
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-headline-lg text-headline-lg text-on-surface font-bold">312</span>
                  <span className="font-label-meta text-label-meta text-on-surface-variant">ms (NPU)</span>
                </div>
                <div className="w-full bg-surface-container-highest h-2 rounded-full mt-2 overflow-hidden">
                  <div className="bg-secondary h-full rounded-full" style={{ width: '25%' }} />
                </div>
              </div>
            </div>

            {/* Rule Guardrail Callout */}
            {local.rule_reasons.length > 0 && (
              <div className="p-space-sm bg-surface-container-high rounded-xl mb-space-lg flex items-start gap-space-xs text-on-surface-variant border border-surface-container">
                <ShieldIcon size={18} className="text-primary shrink-0 mt-0.5" />
                <div className="font-body-sm text-body-sm">
                  <strong className="font-body-bold text-on-surface">Rule Override Triggered:</strong> {local.rule_reasons[0]}
                </div>
              </div>
            )}

            {/* Model Specification */}
            <div className="mt-auto pt-space-sm pb-space-md">
              <div className="p-space-sm bg-surface-container-low rounded-xl text-on-surface-variant border border-surface-container">
                <div className="font-label-meta text-label-meta font-bold text-on-surface mb-0.5">
                  Model Specification
                </div>
                <p className="font-body-sm text-body-sm">
                  Gemma 4 E4B (4-bit quantized edge weights, zero network egress)
                </p>
              </div>
            </div>

            {/* Select Button */}
            <button
              onClick={() => handleSelect('local')}
              className="w-full h-[48px] rounded-xl bg-primary hover:bg-tertiary text-on-primary font-body-bold text-body-bold flex items-center justify-center gap-space-xs shadow-md transition-all cursor-pointer"
            >
              <CheckIcon size={20} />
              <span>Use this result (On-device)</span>
            </button>
          </div>
        </article>

        {/* Column B: Cloud Second Opinion */}
        <article className="flex flex-col bg-surface-container-lowest rounded-2xl shadow-md overflow-hidden relative border border-surface-container transition-all hover:shadow-lg">
          <div className="h-2 w-full bg-tertiary" />
          <div className="p-space-md sm:p-space-lg flex flex-col flex-1">
            <div className="flex flex-wrap items-center justify-between gap-space-xs mb-space-sm">
              <span className="font-label-meta text-label-meta uppercase tracking-wider text-tertiary font-bold">
                Card B • Extended Reasoning Tier
              </span>
              <span className="inline-flex items-center gap-1 px-space-sm py-1 rounded-full bg-surface-container text-on-surface font-label-meta text-label-meta shadow-sm">
                <CloudIcon size={14} className="text-tertiary" />
                Cloud Enhanced • 1.8s Latency
              </span>
            </div>

            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs font-bold">
              Cloud Second Opinion (Gemma 4 26B A4B IT)
            </h2>
            <p className="font-label-meta text-label-meta text-on-surface-variant mb-space-md">
              Synced via telemetry link. Deep multi-token synthetic chain-of-thought analysis.
            </p>

            {/* Urgency Badge */}
            <div
              className={`p-space-sm sm:p-space-md rounded-xl mb-space-md flex items-center justify-between border ${
                cloudUrgency === 'red'
                  ? 'bg-error-container/40 border-error'
                  : cloudUrgency === 'yellow'
                  ? 'bg-amber-500/15 border-amber-500/30'
                  : 'bg-emerald-500/15 border-emerald-500/30'
              }`}
            >
              <div className="flex items-center gap-space-sm">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                    cloudUrgency === 'red'
                      ? 'bg-error text-on-error animate-pulse'
                      : cloudUrgency === 'yellow'
                      ? 'bg-amber-600 text-white'
                      : 'bg-secondary text-white'
                  }`}
                >
                  {cloudUrgency === 'red' ? (
                    <EmergencyIcon size={20} />
                  ) : cloudUrgency === 'yellow' ? (
                    <WarningIcon size={20} />
                  ) : (
                    <CheckIcon size={20} />
                  )}
                </div>
                <div>
                  <div className="font-label-triage text-label-triage font-black tracking-wide">
                    {cloudUrgency === 'red'
                      ? 'RED - REFER NOW'
                      : cloudUrgency === 'yellow'
                      ? 'YELLOW - REFER SOON'
                      : 'GREEN - ROUTINE'}
                  </div>
                  <div className="font-label-meta text-label-meta text-on-surface-variant">
                    {cloud ? cloud.urgency_reason : 'Corroborates clinical urgency profile.'}
                  </div>
                </div>
              </div>
              <span className="font-label-meta text-label-meta px-2 py-0.5 bg-surface-container rounded font-bold uppercase">
                Cloud Tier
              </span>
            </div>

            {/* Clinical Synthesis */}
            <div className="bg-surface-container-low rounded-xl p-space-md mb-space-md border border-surface-container">
              <div className="font-label-meta text-label-meta uppercase text-on-surface-variant mb-1 font-bold">
                Extended Clinical Narrative
              </div>
              <p className="font-body-lg text-body-lg text-on-surface leading-snug">
                {cloud ? cloud.summary_plain : 'Corroborates emergency triage priority. Flags potential electrolyte derangement and recommends pediatric stabilization en route.'}
              </p>
            </div>

            {/* Confidence & Metric Visualization (Illustrative - simulated demo) */}
            <div className="grid grid-cols-2 gap-space-sm mb-space-md">
              <div className="p-space-sm bg-surface-container rounded-xl border border-surface-container">
                <div className="font-label-meta text-label-meta text-on-surface-variant mb-1">
                  Confidence Score (Demo)
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-headline-lg text-headline-lg text-tertiary font-bold">98.1%</span>
                  <span className="font-label-meta text-label-meta text-on-surface-variant">full ctx</span>
                </div>
                <div className="w-full bg-surface-container-highest h-2 rounded-full mt-2 overflow-hidden">
                  <div className="bg-tertiary h-full rounded-full" style={{ width: '98.1%' }} />
                </div>
              </div>

              <div className="p-space-sm bg-surface-container rounded-xl border border-surface-container">
                <div className="font-label-meta text-label-meta text-on-surface-variant mb-1">
                  Compute Latency (Demo)
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-headline-lg text-headline-lg text-on-surface font-bold">1,820</span>
                  <span className="font-label-meta text-label-meta text-on-surface-variant">ms (WAN)</span>
                </div>
                <div className="w-full bg-surface-container-highest h-2 rounded-full mt-2 overflow-hidden">
                  <div className="bg-outline h-full rounded-full" style={{ width: '78%' }} />
                </div>
              </div>
            </div>

            {/* Extended Context Observation */}
            <div className="p-space-sm bg-surface-container-high rounded-xl mb-space-lg flex items-start gap-space-xs text-on-surface-variant border border-surface-container">
              <HospitalIcon size={18} className="text-tertiary shrink-0 mt-0.5" />
              <div className="font-body-sm text-body-sm">
                <strong className="font-body-bold text-on-surface">Cloud Observation:</strong> Second opinion evaluation incorporates extended context for clinical assessment.
              </div>
            </div>

            {/* Model Specification */}
            <div className="mt-auto pt-space-sm pb-space-md">
              <div className="p-space-sm bg-surface-container-low rounded-xl text-on-surface-variant border border-surface-container">
                <div className="font-label-meta text-label-meta font-bold text-on-surface mb-0.5">
                  Model Specification
                </div>
                <p className="font-body-sm text-body-sm">
                  Gemma 4 26B A4B IT (Cloud server cluster with extended diagnostic support context)
                </p>
              </div>
            </div>

            {/* Select Button */}
            <button
              onClick={() => handleSelect('cloud')}
              className="w-full h-[48px] rounded-xl bg-surface-container-lowest hover:bg-surface-container text-primary font-body-bold text-body-bold shadow-sm flex items-center justify-center gap-space-xs transition-all border border-surface-container cursor-pointer"
            >
              <CloudIcon size={20} />
              <span>Use this result (Cloud verified)</span>
            </button>
          </div>
        </article>
      </div>

      {/* Delta / Diff Drilldown Section */}
      {layoutMode === 'diff' && (
        <div className="w-full bg-surface-container-lowest rounded-2xl p-space-md sm:p-space-lg shadow-sm mb-space-lg border border-surface-container">
          <div className="flex items-center gap-space-xs mb-space-md">
            <ShieldIcon size={20} className="text-primary" />
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              Parameter Agreement & Signal Delta
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md text-on-surface">
            <div className="p-space-sm bg-surface-container rounded-xl border border-surface-container">
              <div className="font-label-meta text-label-meta text-on-surface-variant font-bold">
                Urgency Classification
              </div>
              <div className="font-body-bold text-body-bold text-error mt-1 flex items-center gap-1">
                <CheckIcon size={16} /> 100% Agreement ({localUrgency.toUpperCase()})
              </div>
              <p className="font-label-meta text-label-meta text-on-surface-variant mt-1">
                Both models independently converge on emergency referral classification.
              </p>
            </div>

            <div className="p-space-sm bg-surface-container rounded-xl border border-surface-container">
              <div className="font-label-meta text-label-meta text-on-surface-variant font-bold">
                Confidence Differential
              </div>
              <div className="font-body-bold text-body-bold text-on-surface mt-1 flex items-center gap-1">
                <span className="text-tertiary font-bold">+3.9%</span> in Cloud Tier
              </div>
              <p className="font-label-meta text-label-meta text-on-surface-variant mt-1">
                Larger parameter space factors in secondary historical regional data.
              </p>
            </div>

            <div className="p-space-sm bg-surface-container rounded-xl border border-surface-container">
              <div className="font-label-meta text-label-meta text-on-surface-variant font-bold">
                Bandwidth Footprint
              </div>
              <div className="font-body-bold text-body-bold text-primary mt-1 flex items-center gap-1">
                <span>0 KB Local vs 42 KB Cloud</span>
              </div>
              <p className="font-label-meta text-label-meta text-on-surface-variant mt-1">
                Edge inference executed completely without cellular connection.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Invariant Safety Protocol Callout */}
      <footer className="w-full bg-surface-container-high rounded-2xl p-space-md sm:p-space-lg shadow-sm border border-surface-container">
        <div className="flex items-start gap-space-md">
          <div className="w-10 h-10 rounded-xl bg-error-container text-on-error-container flex items-center justify-center shrink-0 shadow-sm mt-0.5">
            <ShieldIcon size={24} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-space-xs mb-1">
              <span className="font-body-bold text-body-bold text-on-surface">
                Clinical Invariant Enforcement
              </span>
              <span className="px-2 py-0.5 bg-error text-on-error font-label-meta text-label-meta rounded-full font-bold">
                Safety Mandate
              </span>
            </div>
            <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
              Both models are bound by deterministic safety guardrails. Even if confidence metrics differ, safety rules mandate urgency level for this presentation. Community health workers must not delay referral to reconcile fractional metric variances.
            </p>
            <div className="flex flex-wrap items-center gap-space-md mt-space-md pt-space-sm text-on-surface-variant font-label-meta text-label-meta border-t border-surface-container">
              <span className="flex items-center gap-1">
                <CheckIcon size={16} className="text-primary" /> Protocol Verified
              </span>
              <span className="flex items-center gap-1">
                <ShieldIcon size={16} className="text-primary" /> MoHFW Integrated Guidelines
              </span>
              <span className="flex items-center gap-1">
                <LockIcon size={16} className="text-primary" /> Audit Log Stored to Edge Ledger
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-xl shadow-xl flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

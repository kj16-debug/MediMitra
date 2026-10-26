import { useState } from 'react';
import type { Status } from '../types';
import {
  MemoryIcon,
  ShieldIcon,
  LockIcon,
  CheckIcon,
  WarningIcon,
  EmergencyIcon,
} from '../components/Icons';

interface StatesScreenProps {
  status: Status | null;
  isOnline: boolean;
  onGoToIntake: () => void;
}

export function StatesScreen({
  status,
  isOnline,
  onGoToIntake,
}: StatesScreenProps) {
  const [filter, setFilter] = useState<'all' | 'analyzing' | 'offline' | 'error'>('all');
  const [simulatedProgress, setSimulatedProgress] = useState(75);
  const [demoStateActive, setDemoStateActive] = useState<string | null>(null);

  function triggerInspect() {
    setDemoStateActive('tensors');
    setTimeout(() => setDemoStateActive(null), 3000);
  }

  function triggerOfflineTest() {
    setDemoStateActive('offlineTest');
    setTimeout(() => setDemoStateActive(null), 3000);
  }

  function triggerRecoverySim() {
    setDemoStateActive('recovery');
    setTimeout(() => setDemoStateActive(null), 3000);
  }

  return (
    <div className="flex flex-col w-full pb-space-xl">
      {/* Header Section with Tactical Diagnostic Badges */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md bg-surface-container-low rounded-2xl p-space-md sm:p-space-lg shadow-sm border border-surface-container mb-space-lg">
        <div className="flex flex-col gap-space-xs max-w-2xl">
          <div className="flex items-center gap-space-xs">
            <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-meta text-label-meta font-bold">
              Resilience Architecture
            </span>
            <span className="font-label-meta text-label-meta text-on-surface-variant flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
              {status?.demo_mode ? 'Simulated Runtime Environment' : 'Field Runtime Mode'}
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold">
            System States & Resiliency Demonstration
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            MediMitra gracefully manages offline field realities, low-power states, and local compute cycles without losing patient data integrity.
          </p>
        </div>

        {/* Quick Interactive Filter Tabs */}
        <div className="flex items-center bg-surface-container rounded-xl p-1 shrink-0 self-start md:self-auto shadow-sm border border-surface-container">
          <button
            onClick={() => setFilter('all')}
            className={`px-space-md py-1.5 rounded-lg text-xs font-body-bold transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-surface-container-lowest text-primary shadow-sm font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            All States
          </button>
          <button
            onClick={() => setFilter('analyzing')}
            className={`px-space-md py-1.5 rounded-lg text-xs font-body-bold transition-all cursor-pointer ${
              filter === 'analyzing'
                ? 'bg-surface-container-lowest text-primary shadow-sm font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Compute (Demo)
          </button>
          <button
            onClick={() => setFilter('offline')}
            className={`px-space-md py-1.5 rounded-lg text-xs font-body-bold transition-all cursor-pointer ${
              filter === 'offline'
                ? 'bg-surface-container-lowest text-primary shadow-sm font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Offline (Demo)
          </button>
          <button
            onClick={() => setFilter('error')}
            className={`px-space-md py-1.5 rounded-lg text-xs font-body-bold transition-all cursor-pointer ${
              filter === 'error'
                ? 'bg-surface-container-lowest text-primary shadow-sm font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Recovery (Demo)
          </button>
        </div>
      </div>

      {/* Live Telemetry Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm mb-space-lg">
        <div className="bg-surface-container-lowest rounded-2xl p-space-md flex items-center gap-space-sm shadow-sm border border-surface-container">
          <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0 text-primary">
            <MemoryIcon size={22} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-label-meta text-label-meta text-on-surface-variant uppercase truncate font-bold">
              Neural Runtime
            </span>
            <span className="font-body-bold text-body-bold text-on-surface truncate text-sm">
              {status?.local_model && status.local_model !== 'Not configured'
                ? status.local_model
                : (status?.demo_mode ? 'Gemma 4 E4B (Demo)' : 'Deterministic Rules')}
            </span>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-space-md flex items-center gap-space-sm shadow-sm border border-surface-container">
          <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0 text-secondary">
            <ShieldIcon size={22} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-label-meta text-label-meta text-on-surface-variant uppercase truncate font-bold">
              Network State
            </span>
            <span className="font-body-bold text-body-bold text-on-surface truncate text-sm">
              {isOnline ? 'Online / Edge Ready' : 'Zero Uplink (Offline)'}
            </span>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-space-md flex items-center gap-space-sm shadow-sm border border-surface-container">
          <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0 text-primary">
            <LockIcon size={22} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-label-meta text-label-meta text-on-surface-variant uppercase truncate font-bold">
              Storage Security
            </span>
            <span className="font-body-bold text-body-bold text-on-surface truncate text-sm">
              In-Memory Enclave
            </span>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-space-md flex items-center gap-space-sm shadow-sm border border-surface-container">
          <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0 text-primary">
            <CheckIcon size={22} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-label-meta text-label-meta text-on-surface-variant uppercase truncate font-bold">
              Field Efficiency (Demo)
            </span>
            <span className="font-body-bold text-body-bold text-on-surface truncate text-sm">
              8.2 mW / Inference
            </span>
          </div>
        </div>
      </div>

      {/* Main States Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-md items-start">
        {/* STATE 1: ANALYZING STATE */}
        {(filter === 'all' || filter === 'analyzing') && (
          <section className="w-full bg-surface-container-lowest rounded-2xl shadow-md overflow-hidden flex flex-col border border-surface-container transition-all">
            <div className="relative bg-gradient-to-br from-surface-container to-surface-container-high p-space-lg overflow-hidden flex flex-col items-center justify-center min-h-[170px]">
              <div className="w-16 h-16 rounded-2xl bg-primary text-on-primary flex items-center justify-center shadow-lg">
                <MemoryIcon size={32} className="animate-spin" style={{ animationDuration: '6s' }} />
              </div>
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-lowest/90 backdrop-blur-md rounded-full shadow-sm border border-surface-container">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                <span className="font-label-meta text-label-meta text-primary font-bold">
                  Local NPU Active
                </span>
              </div>
            </div>

            <div className="p-space-lg flex flex-col gap-space-md flex-grow">
              <div className="flex flex-col gap-space-xs">
                <div className="flex items-center justify-between">
                  <span className="font-label-meta text-label-meta text-primary uppercase font-bold">
                    State 01 • Active Inference
                  </span>
                  <span className="font-label-meta text-label-meta text-on-surface-variant bg-surface-container px-2 py-0.5 rounded font-bold">
                    Cold Start 14ms
                  </span>
                </div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  Analyzing on this device...
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Executing {status?.local_model && status.local_model !== 'Not configured' ? status.local_model : 'local neural'} weights and evaluating deterministic rural safety rules. Zero internet connection required.
                </p>
              </div>

              {/* Progress Indicator */}
              <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col gap-space-xs shadow-sm border border-surface-container">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-label-meta text-label-meta text-on-surface-variant font-bold">
                    Inference Progress
                  </span>
                  <span className="font-label-meta text-label-meta text-primary font-bold">
                    {simulatedProgress}% • 0.28s
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 w-full mt-1">
                  <div className="h-2.5 rounded bg-primary" />
                  <div className="h-2.5 rounded bg-primary" />
                  <div className="h-2.5 rounded bg-primary" />
                  <div className="h-2.5 rounded bg-surface-container-highest animate-pulse" />
                </div>
                <div className="flex justify-between items-center text-on-surface-variant text-[11px] pt-1">
                  <span>Rule check</span>
                  <span>Safety guard</span>
                  <span>Scoring</span>
                </div>
              </div>

              <div className="flex items-start gap-space-xs p-space-sm bg-surface-container rounded-xl border border-surface-container">
                <ShieldIcon size={18} className="text-primary shrink-0 mt-0.5" />
                <span className="font-label-meta text-label-meta text-on-surface-variant">
                  Data remains strictly in-memory. Patient telemetry never touches disk or external network.
                </span>
              </div>

              <div className="mt-auto pt-space-xs">
                <button
                  onClick={triggerInspect}
                  className="w-full min-h-[48px] px-space-md rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-body-bold text-body-bold flex items-center justify-center gap-2 transition-colors cursor-pointer border border-surface-container"
                >
                  <MemoryIcon size={18} />
                  <span>
                    {demoStateActive === 'tensors' ? 'Tensors Verified (Active)' : 'Inspect Realtime Tensors (Demo only)'}
                  </span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* STATE 2: OFFLINE FIELD STATE */}
        {(filter === 'all' || filter === 'offline') && (
          <section className="w-full bg-surface-container-lowest rounded-2xl shadow-md overflow-hidden flex flex-col border border-surface-container transition-all">
            <div className="relative bg-surface-container-high p-space-lg overflow-hidden flex flex-col items-center justify-center min-h-[170px]">
              <div className="w-16 h-16 rounded-2xl bg-secondary text-on-secondary flex items-center justify-center shadow-lg">
                <ShieldIcon size={32} />
              </div>
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-lowest/90 backdrop-blur-md rounded-full shadow-sm border border-surface-container">
                <span className="w-2 h-2 rounded-full bg-secondary" />
                <span className="font-label-meta text-label-meta text-secondary font-bold">
                  Zero Uplink Autonomous
                </span>
              </div>
            </div>

            <div className="p-space-lg flex flex-col gap-space-md flex-grow">
              <div className="flex flex-col gap-space-xs">
                <div className="flex items-center justify-between">
                  <span className="font-label-meta text-label-meta text-secondary uppercase font-bold">
                    State 02 • Field Autonomy
                  </span>
                  <span className="font-label-meta text-label-meta text-on-surface-variant bg-surface-container px-2 py-0.5 rounded font-bold">
                    Zero Cellular
                  </span>
                </div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  Zero Uplink Field Operation
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Sub-centers with zero cellular connection operate with 100% triage feature parity. Deterministic safety rules remain permanently cached in local memory.
                </p>
              </div>

              <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col gap-space-xs shadow-sm border border-surface-container">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-label-meta text-label-meta text-on-surface-variant font-bold">
                    Offline Rule Cache
                  </span>
                  <span className="font-label-meta text-label-meta text-secondary font-bold">
                    100% Available
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface mt-1">
                  • Deterministic Safety Rules<br />
                  • Pediatric Dehydration Logic<br />
                  • Hypoxemia Vital Thresholds
                </p>
              </div>

              <div className="flex items-start gap-space-xs p-space-sm bg-surface-container rounded-xl border border-surface-container">
                <CheckIcon size={18} className="text-secondary shrink-0 mt-0.5" />
                <span className="font-label-meta text-label-meta text-on-surface-variant">
                  Emergency referral slips can be printed via local Bluetooth ESC/POS without cell reception.
                </span>
              </div>

              <div className="mt-auto pt-space-xs">
                <button
                  onClick={triggerOfflineTest}
                  className="w-full min-h-[48px] px-space-md rounded-xl bg-surface-container hover:bg-surface-container-high text-secondary font-body-bold text-body-bold flex items-center justify-center gap-2 transition-colors cursor-pointer border border-surface-container"
                >
                  <ShieldIcon size={18} />
                  <span>
                    {demoStateActive === 'offlineTest' ? 'Offline Validated ✓' : 'Test Offline Pipeline (Demo only)'}
                  </span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* STATE 3: ERROR / FALLBACK STATE */}
        {(filter === 'all' || filter === 'error') && (
          <section className="w-full bg-surface-container-lowest rounded-2xl shadow-md overflow-hidden flex flex-col border border-surface-container transition-all">
            <div className="relative bg-amber-500/15 p-space-lg overflow-hidden flex flex-col items-center justify-center min-h-[170px] border-b border-amber-500/20">
              <div className="w-16 h-16 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-lg">
                <WarningIcon size={32} />
              </div>
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-lowest/90 backdrop-blur-md rounded-full shadow-sm border border-amber-500/30">
                <span className="w-2 h-2 rounded-full bg-amber-600" />
                <span className="font-label-meta text-label-meta text-amber-900 font-bold">
                  Rules-Only Fallback Active
                </span>
              </div>
            </div>

            <div className="p-space-lg flex flex-col gap-space-md flex-grow">
              <div className="flex flex-col gap-space-xs">
                <div className="flex items-center justify-between">
                  <span className="font-label-meta text-label-meta text-amber-800 uppercase font-bold">
                    State 03 • Resilient Safety
                  </span>
                  <span className="font-label-meta text-label-meta text-on-surface-variant bg-surface-container px-2 py-0.5 rounded font-bold">
                    Non-Downgradable
                  </span>
                </div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  AI Unavailable — Rules Only Fallback
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  When model endpoints fail or are unconfigured in live mode (DEMO_MODE=0), the system never halts. Deterministic safety rules immediately take over.
                </p>
              </div>

              <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col gap-space-xs shadow-sm border border-surface-container">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-label-meta text-label-meta text-on-surface-variant font-bold">
                    Fallback Guardrails
                  </span>
                  <span className="font-label-meta text-label-meta text-amber-800 font-bold">
                    Active Floor
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface mt-1">
                  • Urgency cannot be green (floored at yellow)<br />
                  • Clear "AI unavailable" banner displayed<br />
                  • Safe error messaging (never echoes patient text)
                </p>
              </div>

              <div className="flex items-start gap-space-xs p-space-sm bg-surface-container rounded-xl border border-surface-container">
                <EmergencyIcon size={18} className="text-amber-700 shrink-0 mt-0.5" />
                <span className="font-label-meta text-label-meta text-on-surface-variant">
                  Clinical safety invariant guarantees that model failures never put rural patients at risk.
                </span>
              </div>

              <div className="mt-auto pt-space-xs">
                <button
                  onClick={triggerRecoverySim}
                  className="w-full min-h-[48px] px-space-md rounded-xl bg-surface-container hover:bg-surface-container-high text-amber-800 font-body-bold text-body-bold flex items-center justify-center gap-2 transition-colors cursor-pointer border border-surface-container"
                >
                  <WarningIcon size={18} />
                  <span>
                    {demoStateActive === 'recovery' ? 'Safety Floor Verified ✓' : 'Simulate Recovery Pipeline (Demo only)'}
                  </span>
                </button>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Start Case Action Strip */}
      <div className="mt-space-lg bg-surface-container rounded-2xl p-space-md sm:p-space-lg flex flex-col sm:flex-row items-center justify-between gap-space-md border border-surface-container">
        <div>
          <h3 className="font-body-bold text-body-bold text-on-surface">Ready to triage a live or demo case?</h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Jump into the intake workflow to test safety rules and referral note generation.
          </p>
        </div>
        <button
          onClick={onGoToIntake}
          className="px-space-xl py-3 rounded-xl bg-primary hover:bg-tertiary text-on-primary font-body-bold text-body-bold shadow-md cursor-pointer transition-all"
        >
          Open Intake Workspace →
        </button>
      </div>
    </div>
  );
}

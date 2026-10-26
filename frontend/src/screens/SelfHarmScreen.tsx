import { useState } from 'react';
import {
  HeartIcon,
  PhoneIcon,
  HospitalIcon,
  CheckIcon,
  ShieldIcon,
  EmergencyIcon,
} from '../components/Icons';

interface SelfHarmScreenProps {
  onContinueToSummary: () => void;
  onBackToIntake: () => void;
}

export function SelfHarmScreen({
  onContinueToSummary,
  onBackToIntake,
}: SelfHarmScreenProps) {
  const [checklist, setChecklist] = useState({
    safeSpace: false,
    trustedPresence: false,
    noJudgment: false,
    escort: false,
  });
  const [copiedSupervisor, setCopiedSupervisor] = useState(false);
  const [showDirectory, setShowDirectory] = useState(false);

  const completedCount = Object.values(checklist).filter(Boolean).length;

  function toggleCheck(key: keyof typeof checklist) {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function copySupervisorNumber() {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText('9429012345').then(() => {
        setCopiedSupervisor(true);
        setTimeout(() => setCopiedSupervisor(false), 2000);
      });
    }
  }

  return (
    <div className="flex flex-col w-full pb-space-xl">
      {/* Priority Protocol Active Status Context Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-space-sm py-space-sm px-space-md bg-surface-container-low rounded-xl mb-space-md shadow-sm border border-surface-container">
        <div className="flex items-center gap-space-sm">
          <div className="w-8 h-8 rounded-full bg-error-container text-error flex items-center justify-center font-bold">
            <EmergencyIcon size={18} />
          </div>
          <div>
            <p className="font-label-meta text-label-meta text-on-surface-variant uppercase tracking-wider">
              Priority Protocol Active
            </p>
            <p className="font-body-bold text-body-bold text-on-surface text-sm sm:text-base">
              Asha Field Case #MH-4092 • Ward 4, Vallabhipur
            </p>
          </div>
        </div>
        <div className="flex items-center gap-space-xs bg-error-container/30 px-space-sm py-1 rounded-full border border-error/20">
          <span className="w-2.5 h-2.5 rounded-full bg-error animate-ping" />
          <span className="font-label-meta text-label-meta text-error font-bold">
            Priority Override • Standard Triage Paused
          </span>
        </div>
      </div>

      {/* Hero Compassionate Safety Card */}
      <div className="relative overflow-hidden bg-surface-container-lowest rounded-2xl shadow-md p-space-md sm:p-space-xl mb-space-lg border border-surface-container">
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-gradient-to-br from-secondary-container/20 to-surface-container-high/30 pointer-events-none blur-2xl" />

        <div className="relative flex flex-col md:flex-row items-start gap-space-lg">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-surface-container-low flex items-center justify-center shrink-0 shadow-sm border border-surface-container text-primary">
            <HeartIcon size={40} className="text-primary" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-space-xs px-space-sm py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-meta text-label-meta mb-space-sm">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Gentle Supportive Response
            </div>

            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-space-xs font-bold leading-tight">
              Please get immediate human support. Do not leave the person alone.
            </h1>

            <p className="font-body-xl text-body-xl text-on-surface-variant max-w-3xl leading-relaxed mb-space-md">
              A distress signal has been identified. This takes precedence over routine triage questionnaires. Maintain a supportive presence, speak gently, and connect with trained supervisory support immediately.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm pt-space-xs">
              <div className="flex items-center gap-space-xs p-space-sm bg-surface-container-low rounded-xl border border-surface-container">
                <span className="text-secondary font-bold">👂</span>
                <span className="font-body-sm text-body-sm text-on-surface font-medium">Listen with calm patience</span>
              </div>
              <div className="flex items-center gap-space-xs p-space-sm bg-surface-container-low rounded-xl border border-surface-container">
                <span className="text-secondary font-bold">🤝</span>
                <span className="font-body-sm text-body-sm text-on-surface font-medium">Stay physically beside them</span>
              </div>
              <div className="flex items-center gap-space-xs p-space-sm bg-surface-container-low rounded-xl border border-surface-container">
                <span className="text-secondary font-bold">🕊️</span>
                <span className="font-body-sm text-body-sm text-on-surface font-medium">Validate without debate</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Action & Protocol Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md mb-space-lg">
        {/* Left Column: Supervisor Direct Line (7 Columns) */}
        <div className="lg:col-span-7 flex flex-col gap-space-md">
          <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col justify-between border border-surface-container">
            <div>
              <div className="flex items-center justify-between gap-space-sm mb-space-sm">
                <span className="font-label-meta text-label-meta uppercase tracking-wider text-secondary font-bold">
                  Step 1 • Direct Assistance
                </span>
                <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-meta text-label-meta font-bold">
                  24/7 Available
                </span>
              </div>

              <h2 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs font-bold">
                District Mental Health Helpline & Supervisor
              </h2>

              <p className="font-body-lg text-body-lg text-on-surface-variant mb-space-lg">
                Directly connect with Tele-MANAS certified nodal psychologists and Bhavnagar district medical officers for live verbal guidance.
              </p>

              {/* Dial Option 1: National Tele-MANAS */}
              <div className="p-space-md rounded-xl bg-surface-container-low mb-space-md border border-surface-container">
                <div className="flex items-center justify-between mb-space-sm">
                  <div className="flex items-center gap-space-xs">
                    <PhoneIcon size={20} className="text-primary" />
                    <span className="font-body-bold text-body-bold text-on-surface">National Tele-MANAS Network</span>
                  </div>
                  <span className="font-label-meta text-label-meta text-on-surface-variant">Toll-Free • 14416</span>
                </div>
                <a
                  href="tel:14416"
                  className="w-full h-[52px] bg-primary text-on-primary font-body-bold text-body-bold rounded-xl flex items-center justify-center gap-space-sm transition-all hover:bg-tertiary shadow-sm cursor-pointer"
                >
                  <PhoneIcon size={20} />
                  <span>Call Helpline (Toll-Free 14416 / Tele-MANAS)</span>
                </a>
              </div>

              {/* Dial Option 2: District Supervisor */}
              <div className="p-space-md rounded-xl bg-surface-container-low border border-surface-container">
                <div className="flex items-center justify-between mb-space-sm">
                  <div>
                    <p className="font-body-bold text-body-bold text-on-surface">Dr. Meera Trivedi (DMHP Bhavnagar)</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">District Nodal Officer • Direct Escort</p>
                  </div>
                  <span className="font-label-meta text-label-meta px-2 py-0.5 rounded bg-surface-container text-on-surface font-bold">
                    Speed-Dial 2
                  </span>
                </div>
                <div className="flex items-center gap-space-sm">
                  <a
                    href="tel:+919429012345"
                    className="flex-1 h-12 bg-surface-container-lowest text-primary font-body-bold text-body-bold rounded-xl flex items-center justify-center gap-space-xs shadow-sm hover:bg-surface-container transition-colors border border-surface-container cursor-pointer"
                  >
                    <PhoneIcon size={18} />
                    <span>+91 94290 12345</span>
                  </a>
                  <button
                    onClick={copySupervisorNumber}
                    className="h-12 px-space-md rounded-xl bg-surface-container text-on-surface font-body-sm text-body-sm hover:bg-surface-container-high transition-colors cursor-pointer"
                  >
                    {copiedSupervisor ? 'Copied ✓' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>

            {/* Ambient Facility Context Card */}
            <div className="mt-space-lg pt-space-md flex items-center gap-space-md border-t border-surface-container">
              <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary shrink-0">
                <HospitalIcon size={22} />
              </div>
              <div className="min-w-0">
                <p className="font-body-bold text-body-bold text-on-surface text-sm sm:text-base">
                  Sub-District Hospital Bhavnagar
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                  Mental Health Crisis Stabilization Unit • 14 km away
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Immediate Protocol Checklist (5 Columns) */}
        <div className="lg:col-span-5 flex flex-col gap-space-md">
          <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex-1 flex flex-col border border-surface-container">
            <div className="flex items-center justify-between mb-space-sm">
              <span className="font-label-meta text-label-meta uppercase tracking-wider text-secondary font-bold">
                Step 2 • On-Scene Safety
              </span>
              <span
                className={`font-label-meta text-label-meta font-bold ${
                  completedCount === 4 ? 'text-secondary font-bold' : 'text-on-surface-variant'
                }`}
              >
                {completedCount} of 4 Completed
              </span>
            </div>

            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs font-bold">
              Immediate Protocol Checklist
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
              Field worker ground duties. Tap each item to verify compliance:
            </p>

            <div className="space-y-space-sm flex-1">
              <label
                onClick={() => toggleCheck('safeSpace')}
                className={`group flex items-start gap-space-sm p-space-md rounded-xl cursor-pointer transition-all border select-none ${
                  checklist.safeSpace
                    ? 'bg-secondary-container/20 border-secondary'
                    : 'bg-surface-container-low border-surface-container hover:bg-surface-container'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checklist.safeSpace}
                  onChange={() => {}}
                  className="mt-1 w-5 h-5 rounded text-secondary focus:ring-secondary accent-secondary cursor-pointer shrink-0"
                />
                <div className="flex-1">
                  <p className="font-body-bold text-body-bold text-on-surface leading-snug">
                    Ensure safe, quiet space
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Move away from hazards, tools, medicines, heights, or road traffic.
                  </p>
                </div>
              </label>

              <label
                onClick={() => toggleCheck('trustedPresence')}
                className={`group flex items-start gap-space-sm p-space-md rounded-xl cursor-pointer transition-all border select-none ${
                  checklist.trustedPresence
                    ? 'bg-secondary-container/20 border-secondary'
                    : 'bg-surface-container-low border-surface-container hover:bg-surface-container'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checklist.trustedPresence}
                  onChange={() => {}}
                  className="mt-1 w-5 h-5 rounded text-secondary focus:ring-secondary accent-secondary cursor-pointer shrink-0"
                />
                <div className="flex-1">
                  <p className="font-body-bold text-body-bold text-on-surface leading-snug">
                    Trusted community presence
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Keep an empathetic family member or respected elder gently beside the person.
                  </p>
                </div>
              </label>

              <label
                onClick={() => toggleCheck('noJudgment')}
                className={`group flex items-start gap-space-sm p-space-md rounded-xl cursor-pointer transition-all border select-none ${
                  checklist.noJudgment
                    ? 'bg-secondary-container/20 border-secondary'
                    : 'bg-surface-container-low border-surface-container hover:bg-surface-container'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checklist.noJudgment}
                  onChange={() => {}}
                  className="mt-1 w-5 h-5 rounded text-secondary focus:ring-secondary accent-secondary cursor-pointer shrink-0"
                />
                <div className="flex-1">
                  <p className="font-body-bold text-body-bold text-on-surface leading-snug">
                    Do not probe or express judgment
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Avoid asking repetitive questions or giving unsolicited life advice.
                  </p>
                </div>
              </label>

              <label
                onClick={() => toggleCheck('escort')}
                className={`group flex items-start gap-space-sm p-space-md rounded-xl cursor-pointer transition-all border select-none ${
                  checklist.escort
                    ? 'bg-secondary-container/20 border-secondary'
                    : 'bg-surface-container-low border-surface-container hover:bg-surface-container'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checklist.escort}
                  onChange={() => {}}
                  className="mt-1 w-5 h-5 rounded text-secondary focus:ring-secondary accent-secondary cursor-pointer shrink-0"
                />
                <div className="flex-1">
                  <p className="font-body-bold text-body-bold text-on-surface leading-snug">
                    Prepare emergency escort
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Alert vehicle/108 ambulance for Bhavnagar Sub-District Hospital transit.
                  </p>
                </div>
              </label>
            </div>

            <div className="mt-space-md p-space-sm bg-surface-container rounded-xl flex items-center gap-space-sm border border-surface-container">
              <ShieldIcon size={20} className="text-secondary shrink-0" />
              <p className="font-label-meta text-label-meta text-on-surface-variant">
                All 4 safeguards follow WHO mhGAP Community Field Guidelines for Psychological First Aid.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Safety Actions & Navigation Strip */}
      <div className="bg-surface-container-lowest rounded-2xl p-space-md sm:p-space-lg shadow-md mb-space-lg border border-surface-container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-space-md">
          <a
            href="tel:14416"
            className="w-full md:w-auto flex-1 min-h-[52px] bg-primary text-on-primary font-body-bold text-body-bold rounded-xl px-space-lg flex items-center justify-center gap-space-sm shadow-md hover:bg-tertiary transition-all text-center cursor-pointer"
          >
            <PhoneIcon size={20} />
            <span>Call a supervisor or helpline</span>
          </a>

          <button
            onClick={onContinueToSummary}
            className="w-full md:w-auto min-h-[52px] bg-surface-container-low text-primary font-body-bold text-body-bold rounded-xl px-space-lg flex items-center justify-center gap-space-sm hover:bg-surface-container transition-all border border-surface-container cursor-pointer"
          >
            <CheckIcon size={18} />
            <span>Continue triage with supervisor on line</span>
          </button>

          <button
            onClick={() => setShowDirectory(true)}
            className="w-full md:w-auto min-h-[48px] px-space-md text-on-surface-variant hover:text-primary font-body-bold text-body-bold flex items-center justify-center gap-space-xs transition-colors cursor-pointer"
          >
            <span>Emergency directory</span>
          </button>
        </div>
      </div>

      {/* Reassuring Field Worker Reference Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
        <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm border border-surface-container">
          <div className="flex items-center gap-space-xs text-primary mb-space-xs">
            <span className="font-body-bold text-body-bold">Supportive Phrases to Use</span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-sm leading-relaxed">
            "I am here with you right now. You are safe. We will walk through this together and get someone to support us."
          </p>
          <div className="w-full h-1.5 bg-surface-container-low rounded-full overflow-hidden">
            <div className="w-3/4 h-full bg-secondary rounded-full" />
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex items-center justify-between border border-surface-container">
          <div>
            <p className="font-label-meta text-label-meta uppercase tracking-wider text-secondary font-bold">
              Local Transit Hub
            </p>
            <p className="font-body-bold text-body-bold text-on-surface">108 Emergency Ambulance Dispatched</p>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Bhavnagar District Referral Center Desk #4</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary font-bold">
            108
          </div>
        </div>
      </div>

      {/* Emergency Directory Modal */}
      {showDirectory && (
        <div className="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-space-md">
          <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-space-lg shadow-xl border border-surface-container">
            <div className="flex items-center justify-between mb-space-md">
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                Emergency Contact Directory
              </h3>
              <button
                onClick={() => setShowDirectory(false)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-space-sm mb-space-lg max-h-80 overflow-y-auto pr-1">
              <div className="p-space-sm bg-surface-container-low rounded-xl flex items-center justify-between border border-surface-container">
                <div>
                  <p className="font-body-bold text-body-bold text-on-surface">Tele-MANAS National</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Mental Health Govt Service</p>
                </div>
                <a href="tel:14416" className="px-space-md py-1.5 bg-primary text-on-primary rounded-lg font-body-sm text-body-sm font-bold">
                  14416
                </a>
              </div>

              <div className="p-space-sm bg-surface-container-low rounded-xl flex items-center justify-between border border-surface-container">
                <div>
                  <p className="font-body-bold text-body-bold text-on-surface">108 Emergency Medical</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Ambulance & Transport</p>
                </div>
                <a href="tel:108" className="px-space-md py-1.5 bg-primary text-on-primary rounded-lg font-body-sm text-body-sm font-bold">
                  108
                </a>
              </div>

              <div className="p-space-sm bg-surface-container-low rounded-xl flex items-center justify-between border border-surface-container">
                <div>
                  <p className="font-body-bold text-body-bold text-on-surface">Bhavnagar District Hospital</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Emergency Triage Dept</p>
                </div>
                <a href="tel:02782424001" className="px-space-md py-1.5 bg-surface-container text-on-surface rounded-lg font-body-sm text-body-sm font-bold">
                  0278-2424001
                </a>
              </div>

              <div className="p-space-sm bg-surface-container-low rounded-xl flex items-center justify-between border border-surface-container">
                <div>
                  <p className="font-body-bold text-body-bold text-on-surface">Kiran Helpline</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Psychosocial Rehabilitation</p>
                </div>
                <a href="tel:18005990019" className="px-space-md py-1.5 bg-surface-container text-on-surface rounded-lg font-body-sm text-body-sm font-bold">
                  1800-599-0019
                </a>
              </div>
            </div>

            <button
              onClick={() => setShowDirectory(false)}
              className="w-full h-12 bg-surface-container text-on-surface rounded-xl font-body-bold text-body-bold hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              Close Directory
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import {
  HeartIcon,
  ShieldIcon,
  EmergencyIcon,
  CheckIcon,
} from '../components/Icons';

interface SelfHarmScreenProps {
  onContinueToSummary: () => void;
  onBackToIntake: () => void;
}

export function SelfHarmScreen({
  onContinueToSummary,
  onBackToIntake,
}: SelfHarmScreenProps) {
  return (
    <div className="flex flex-col w-full pb-space-xl">
      {/* Priority Protocol Active Status Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-space-sm py-space-sm px-space-md bg-surface-container-low rounded-xl mb-space-md shadow-sm border border-surface-container">
        <div className="flex items-center gap-space-sm">
          <div className="w-8 h-8 rounded-full bg-error-container text-error flex items-center justify-center font-bold">
            <EmergencyIcon size={18} />
          </div>
          <div>
            <p className="font-label-meta text-label-meta text-on-surface-variant uppercase tracking-wider">
              Priority Safety Signal Detected
            </p>
            <p className="font-body-bold text-body-bold text-on-surface text-sm sm:text-base">
              Immediate Human Support Required
            </p>
          </div>
        </div>
        <div className="flex items-center gap-space-xs bg-error-container/30 px-space-sm py-1 rounded-full border border-error/20">
          <span className="w-2.5 h-2.5 rounded-full bg-error animate-ping" />
          <span className="font-label-meta text-label-meta text-error font-bold">
            Priority Safety Override
          </span>
        </div>
      </div>

      {/* Hero Compassionate Safety Card */}
      <div className="relative overflow-hidden bg-surface-container-lowest rounded-2xl shadow-md p-space-md sm:p-space-xl mb-space-lg border border-surface-container">
        <div className="relative flex flex-col md:flex-row items-start gap-space-lg">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-surface-container-low flex items-center justify-center shrink-0 shadow-sm border border-surface-container text-primary">
            <HeartIcon size={40} className="text-primary" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-space-xs px-space-sm py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-meta text-label-meta mb-space-sm">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Immediate Safety Guidance
            </div>

            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight mb-space-xs font-bold leading-tight">
              Please get immediate human support. Do not leave the person alone.
            </h1>

            <p className="font-body-xl text-body-xl text-on-surface-variant max-w-3xl leading-relaxed mb-space-md">
              A distress signal has been identified. This takes precedence over routine triage questionnaires.
            </p>

            {/* Core Required Guidance Only */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm pt-space-xs">
              <div className="flex items-center gap-space-sm p-space-md bg-surface-container-low rounded-xl border border-surface-container">
                <CheckIcon size={20} className="text-secondary shrink-0" />
                <span className="font-body-bold text-body-bold text-on-surface">
                  Stay with the person
                </span>
              </div>
              <div className="flex items-center gap-space-sm p-space-md bg-surface-container-low rounded-xl border border-surface-container">
                <CheckIcon size={20} className="text-secondary shrink-0" />
                <span className="font-body-bold text-body-bold text-on-surface">
                  Do not leave them alone
                </span>
              </div>
              <div className="flex items-center gap-space-sm p-space-md bg-surface-container-low rounded-xl border border-surface-container">
                <CheckIcon size={20} className="text-secondary shrink-0" />
                <span className="font-body-bold text-body-bold text-on-surface">
                  Contact your supervisor
                </span>
              </div>
              <div className="flex items-center gap-space-sm p-space-md bg-surface-container-low rounded-xl border border-surface-container">
                <CheckIcon size={20} className="text-secondary shrink-0" />
                <span className="font-body-bold text-body-bold text-on-surface">
                  Seek immediate human support
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Supervisor Contact Box */}
      <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-surface-container mb-space-lg">
        <div className="flex items-center gap-space-xs mb-space-xs">
          <ShieldIcon size={20} className="text-primary" />
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
            Supervisor & Emergency Support Contact
          </h2>
        </div>
        <p className="font-body-lg text-body-lg text-on-surface-variant mb-space-md">
          Contact your supervisor or local emergency services immediately according to your local facility protocols.
        </p>

        <div className="p-space-md rounded-xl bg-surface-container-low border border-surface-container">
          <span className="font-label-meta text-label-meta text-on-surface-variant uppercase font-bold block mb-1">
            Emergency Instructions
          </span>
          <p className="font-body-bold text-body-bold text-on-surface">
            Contact your supervisor or local emergency services.
          </p>
        </div>
      </div>

      {/* Safety Navigation Actions */}
      <div className="bg-surface-container-lowest rounded-2xl p-space-md sm:p-space-lg shadow-md border border-surface-container">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-space-md">
          <button
            onClick={onBackToIntake}
            className="w-full sm:w-auto px-space-lg py-3 rounded-xl bg-surface-container-low hover:bg-surface-container text-primary font-body-bold text-body-bold border border-surface-container cursor-pointer"
          >
            ← Return to Intake
          </button>

          <button
            onClick={onContinueToSummary}
            className="w-full sm:w-auto min-h-[52px] bg-primary hover:bg-tertiary text-on-primary font-body-bold text-body-bold rounded-xl px-space-xl flex items-center justify-center gap-space-sm shadow-md transition-all cursor-pointer"
          >
            <span>Proceed to Urgency Summary with Supervisor</span>
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}

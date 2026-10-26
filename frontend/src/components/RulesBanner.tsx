import React from 'react';
import { WarningIcon } from './Icons';

interface RulesBannerProps {
  show: boolean;
}

export function RulesBanner({ show }: RulesBannerProps) {
  if (!show) return null;

  return (
    <div
      className="w-full bg-amber-500/15 border border-amber-600/30 text-amber-900 rounded-xl p-space-md mb-space-md flex items-start gap-space-sm shadow-sm"
      role="alert"
    >
      <WarningIcon size={24} className="text-amber-700 shrink-0 mt-0.5" />
      <div>
        <h4 className="font-body-bold text-body-bold text-amber-900">
          AI Unavailable — Rules Only Fallback Active
        </h4>
        <p className="font-body-sm text-body-sm text-amber-800 mt-0.5">
          AI inference is unavailable. Urgency triage and safety triggers are driven strictly by deterministic clinical safety rules. The resulting classification cannot be lowered. Please conduct comprehensive manual assessment.
        </p>
      </div>
    </div>
  );
}

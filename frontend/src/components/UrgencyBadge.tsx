import React from 'react';
import { EmergencyIcon, WarningIcon, CheckIcon } from './Icons';

interface UrgencyBadgeProps {
  urgency: 'green' | 'yellow' | 'red' | string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  subtitle?: string;
}

export function UrgencyBadge({
  urgency,
  size = 'md',
  showSubtitle = false,
  subtitle,
}: UrgencyBadgeProps) {
  const norm = urgency?.toLowerCase() || 'green';

  if (norm === 'red') {
    return (
      <div className="flex items-center gap-space-sm">
        <div
          className={`${
            size === 'lg' ? 'w-12 h-12 sm:w-14 sm:h-14' : size === 'sm' ? 'w-7 h-7' : 'w-9 h-9 sm:w-10 sm:h-10'
          } rounded-xl bg-error text-on-error flex items-center justify-center shrink-0 shadow-sm animate-pulse`}
        >
          <EmergencyIcon size={size === 'lg' ? 28 : size === 'sm' ? 16 : 22} />
        </div>
        <div>
          <div className="font-label-triage text-error tracking-wide font-black uppercase flex items-center gap-1.5">
            <span>RED - REFER NOW</span>
          </div>
          {showSubtitle && (
            <p className="font-label-meta text-label-meta text-on-error-container">
              {subtitle || 'Immediate clinical facility transfer required'}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (norm === 'yellow') {
    return (
      <div className="flex items-center gap-space-sm">
        <div
          className={`${
            size === 'lg' ? 'w-12 h-12 sm:w-14 sm:h-14' : size === 'sm' ? 'w-7 h-7' : 'w-9 h-9 sm:w-10 sm:h-10'
          } rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-sm`}
        >
          <WarningIcon size={size === 'lg' ? 28 : size === 'sm' ? 16 : 22} />
        </div>
        <div>
          <div className="font-label-triage text-amber-800 tracking-wide font-black uppercase flex items-center gap-1.5">
            <span>YELLOW - REFER SOON</span>
          </div>
          {showSubtitle && (
            <p className="font-label-meta text-label-meta text-amber-900">
              {subtitle || 'Evaluate within 24 hours at primary health centre'}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Green / Routine
  return (
    <div className="flex items-center gap-space-sm">
      <div
        className={`${
          size === 'lg' ? 'w-12 h-12 sm:w-14 sm:h-14' : size === 'sm' ? 'w-7 h-7' : 'w-9 h-9 sm:w-10 sm:h-10'
        } rounded-xl bg-secondary text-white flex items-center justify-center shrink-0 shadow-sm`}
      >
        <CheckIcon size={size === 'lg' ? 28 : size === 'sm' ? 16 : 22} />
      </div>
      <div>
        <div className="font-label-triage text-secondary tracking-wide font-black uppercase flex items-center gap-1.5">
          <span>GREEN - ROUTINE</span>
        </div>
        {showSubtitle && (
          <p className="font-label-meta text-label-meta text-on-surface-variant">
            {subtitle || 'Manage at community level with routine follow-up'}
          </p>
        )}
      </div>
    </div>
  );
}

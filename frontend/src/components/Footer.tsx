import React from 'react';
import type { Status } from '../types';
import { ShieldIcon } from './Icons';

interface FooterProps {
  status?: Status | null;
}

export function Footer({ status }: FooterProps) {
  return (
    <footer className="w-full bg-inverse-surface text-inverse-on-surface py-space-md shadow-[0_-1px_6px_rgba(0,0,0,0.06)] mt-auto">
      <div className="max-w-[1100px] mx-auto px-margin flex flex-col sm:flex-row items-center justify-between gap-space-sm text-center sm:text-left">
        <div className="flex items-center gap-space-xs">
          <ShieldIcon size={18} className="text-secondary-fixed shrink-0" />
          <p className="font-label-meta text-label-meta text-inverse-on-surface">
            Decision support only. Not a diagnosis. No treatment or dosage advice. Always defer to local emergency medical protocols.
          </p>
        </div>
        <div className="font-label-meta text-label-meta text-inverse-on-surface/80 shrink-0">
          MediMitra v2.4 (Field Edition) | Local Model: {status?.demo_mode ? 'Gemma 4 E4B (Simulated)' : status?.local_model && status.local_model !== 'Not configured' ? status.local_model : 'Deterministic Rules'}
        </div>
      </div>
    </footer>
  );
}

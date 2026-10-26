import React from 'react';
import type { Status } from '../types';
import { CrossIcon, PersonIcon, TranslateIcon } from './Icons';

export type Screen = 'home' | 'intake' | 'summary' | 'self_harm' | 'referral' | 'comparison' | 'states';

interface HeaderProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  isOnline: boolean;
  hasResult: boolean;
  hasCloud: boolean;
  isSelfHarm?: boolean;
  status?: Status | null;
}

export function Header({
  currentScreen,
  onNavigate,
  isOnline,
  hasResult,
  hasCloud,
  isSelfHarm = false,
  status,
}: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/95 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-surface-container">
      <div className="h-16 max-w-[1100px] mx-auto px-margin flex items-center justify-between gap-space-md">
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-space-lg">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-space-sm text-left group cursor-pointer focus:outline-none"
            aria-label="MediMitra Home"
          >
            <div className="w-9 h-9 rounded-xl bg-primary text-primary-fixed flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105">
              <CrossIcon size={22} />
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-primary leading-tight tracking-tight">
                MediMitra
              </span>
              <span className="font-label-meta text-label-meta text-on-surface-variant leading-none">
                Rural Health Triage
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-space-xs" aria-label="Main Navigation">
            <button
              onClick={() => onNavigate('home')}
              className={`px-space-md py-space-xs rounded-lg text-body-sm transition-colors cursor-pointer ${
                currentScreen === 'home'
                  ? 'bg-surface-container text-primary font-body-bold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('intake')}
              className={`px-space-md py-space-xs rounded-lg text-body-sm transition-colors cursor-pointer ${
                currentScreen === 'intake'
                  ? 'bg-surface-container text-primary font-body-bold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              New Case
            </button>
            {hasResult && (
              <button
                onClick={() => onNavigate('summary')}
                className={`px-space-md py-space-xs rounded-lg text-body-sm transition-colors cursor-pointer ${
                  currentScreen === 'summary'
                    ? 'bg-surface-container text-primary font-body-bold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Summary
              </button>
            )}
            {isSelfHarm && (
              <button
                onClick={() => onNavigate('self_harm')}
                className={`px-space-md py-space-xs rounded-lg text-body-sm transition-colors cursor-pointer ${
                  currentScreen === 'self_harm'
                    ? 'bg-error-container text-error font-body-bold'
                    : 'text-error hover:bg-error-container/30'
                }`}
              >
                Safety Alert
              </button>
            )}
            {hasResult && (
              <button
                onClick={() => onNavigate('referral')}
                className={`px-space-md py-space-xs rounded-lg text-body-sm transition-colors cursor-pointer ${
                  currentScreen === 'referral'
                    ? 'bg-surface-container text-primary font-body-bold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Referral Note
              </button>
            )}
            {hasCloud && (
              <button
                onClick={() => onNavigate('comparison')}
                className={`px-space-md py-space-xs rounded-lg text-body-sm transition-colors cursor-pointer ${
                  currentScreen === 'comparison'
                    ? 'bg-surface-container text-primary font-body-bold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Dual Eval
              </button>
            )}
            <button
              onClick={() => onNavigate('states')}
              className={`px-space-md py-space-xs rounded-lg text-body-sm transition-colors cursor-pointer ${
                currentScreen === 'states'
                  ? 'bg-surface-container text-primary font-body-bold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              States
            </button>
          </nav>
        </div>

        {/* Right Status Cluster */}
        <div className="flex items-center gap-space-sm sm:gap-space-md">
          {/* Online/Offline Ready Dot */}
          <div className="flex items-center gap-space-xs px-space-sm py-1 bg-surface-container-low rounded-full">
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline ? 'bg-secondary animate-pulse' : 'bg-outline'
              }`}
            />
            <span className="hidden sm:inline font-label-meta text-label-meta text-on-surface-variant">
              {isOnline ? 'On-Device / Offline Ready' : 'Field Offline'}
            </span>
            <span className="sm:hidden font-label-meta text-label-meta text-on-surface-variant">
              {isOnline ? 'Ready' : 'Offline'}
            </span>
          </div>

          {/* Dynamic Status Pill */}
          <div className="flex items-center px-space-sm py-0.5 bg-surface-container-high rounded-full border border-surface-container-highest">
            <span className="font-label-meta text-label-meta text-on-surface-variant font-medium">
              {status?.demo_mode
                ? 'Simulated demo'
                : `Live: ${status?.local_model && status.local_model !== 'Not configured' ? status.local_model : status?.cloud_configured ? `Cloud (${status.cloud_model})` : 'Rules only'}`}
            </span>
          </div>

          {/* Language Selector: Disabled with "More languages coming soon" as instructed */}
          <div className="hidden sm:flex items-center gap-space-xs px-space-sm py-1 bg-surface-container-low rounded-lg opacity-80 cursor-not-allowed" title="More languages coming soon">
            <TranslateIcon size={16} className="text-on-surface-variant" />
            <span className="font-label-meta text-label-meta text-on-surface-variant">
              English
            </span>
            <span className="text-[10px] text-on-surface-variant bg-surface-container-high px-1.5 py-0.5 rounded font-medium">
              More languages coming soon
            </span>
          </div>

          {/* Profile Badge */}
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-sm" title="Field Health Worker #4092">
            <PersonIcon size={18} />
          </div>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar for Small Screens (<768px) */}
      <div className="md:hidden flex items-center justify-around bg-surface-container-low border-t border-surface-container py-1 px-2 overflow-x-auto text-xs">
        <button
          onClick={() => onNavigate('home')}
          className={`px-2 py-1 rounded font-medium ${
            currentScreen === 'home' ? 'bg-surface-container text-primary font-bold' : 'text-on-surface-variant'
          }`}
        >
          Home
        </button>
        <button
          onClick={() => onNavigate('intake')}
          className={`px-2 py-1 rounded font-medium ${
            currentScreen === 'intake' ? 'bg-surface-container text-primary font-bold' : 'text-on-surface-variant'
          }`}
        >
          New Case
        </button>
        {hasResult && (
          <button
            onClick={() => onNavigate('summary')}
            className={`px-2 py-1 rounded font-medium ${
              currentScreen === 'summary' ? 'bg-surface-container text-primary font-bold' : 'text-on-surface-variant'
            }`}
          >
            Summary
          </button>
        )}
        {isSelfHarm && (
          <button
            onClick={() => onNavigate('self_harm')}
            className={`px-2 py-1 rounded font-medium ${
              currentScreen === 'self_harm' ? 'bg-error-container text-error font-bold' : 'text-error'
            }`}
          >
            Safety
          </button>
        )}
        {hasResult && (
          <button
            onClick={() => onNavigate('referral')}
            className={`px-2 py-1 rounded font-medium ${
              currentScreen === 'referral' ? 'bg-surface-container text-primary font-bold' : 'text-on-surface-variant'
            }`}
          >
            Referral
          </button>
        )}
        {hasCloud && (
          <button
            onClick={() => onNavigate('comparison')}
            className={`px-2 py-1 rounded font-medium ${
              currentScreen === 'comparison' ? 'bg-surface-container text-primary font-bold' : 'text-on-surface-variant'
            }`}
          >
            Dual Eval
          </button>
        )}
        <button
          onClick={() => onNavigate('states')}
          className={`px-2 py-1 rounded font-medium ${
            currentScreen === 'states' ? 'bg-surface-container text-primary font-bold' : 'text-on-surface-variant'
          }`}
        >
          States
        </button>
      </div>
    </header>
  );
}

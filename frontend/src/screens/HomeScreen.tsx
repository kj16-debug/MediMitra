import React from 'react';
import {
  CrossIcon,
  LockIcon,
  ShieldIcon,
  ScienceIcon,
  ChildIcon,
  PersonIcon,
  ArrowForwardIcon,
  FolderIcon,
  CheckIcon,
} from '../components/Icons';
import type { DemoPatient } from '../types';

interface HomeScreenProps {
  onStartNewCase: () => void;
  onLoadDemo: (name: string) => void;
  onViewReferrals: () => void;
  demos: DemoPatient[];
  isOnline: boolean;
}

export function HomeScreen({
  onStartNewCase,
  onLoadDemo,
  onViewReferrals,
  demos,
  isOnline,
}: HomeScreenProps) {
  return (
    <div className="flex flex-col w-full pb-space-xl">
      {/* Hero Section */}
      <section className="relative w-full rounded-2xl bg-surface-container-low shadow-sm overflow-hidden p-space-md sm:p-space-lg lg:p-space-xl mb-space-lg border border-surface-container">
        {/* Ambient background blur elements */}
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-primary-fixed/25 blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-64 h-64 rounded-full bg-secondary-fixed/25 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-start md:justify-between gap-space-lg">
          <div className="flex-1 flex flex-col items-start max-w-3xl">
            {/* Logo and App Badge */}
            <div className="flex items-center gap-space-sm mb-space-md">
              <div className="w-12 h-12 rounded-xl bg-surface-container-lowest shadow-sm flex items-center justify-center p-2 shrink-0 border border-surface-container">
                <CrossIcon size={28} className="text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-meta text-label-meta uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Field Edition v2.4
                </span>
                <span className="font-label-meta text-label-meta text-on-surface-variant">
                  Rural Primary Triage System
                </span>
              </div>
            </div>

            {/* Main Headline & Subtitle */}
            <h1 className="font-headline-lg sm:font-headline-xl text-headline-lg sm:text-headline-xl text-on-surface mb-space-sm leading-tight tracking-tight">
              Fast, reliable clinical triage for community health workers
            </h1>
            <p className="font-body-xl text-body-xl text-on-surface-variant max-w-2xl mb-space-lg">
              Record patient complaints, check vital safety rules offline, and generate structured facility referral notes in minutes.
            </p>

            {/* Primary & Secondary Action Cluster */}
            <div className="flex flex-wrap items-center gap-space-sm sm:gap-space-md w-full sm:w-auto">
              <button
                onClick={onStartNewCase}
                className="inline-flex items-center justify-center gap-space-xs min-h-[52px] h-13 px-space-lg rounded-xl bg-primary hover:bg-tertiary text-on-primary font-body-bold text-body-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98] w-full sm:w-auto text-center cursor-pointer"
              >
                <CrossIcon size={20} />
                <span>Start new case</span>
              </button>
              <button
                onClick={onViewReferrals}
                className="inline-flex items-center justify-center gap-space-xs min-h-[52px] h-13 px-space-lg rounded-xl bg-surface-container-lowest text-primary font-body-bold text-body-bold shadow-sm hover:bg-surface-container transition-all active:scale-[0.98] w-full sm:w-auto text-center cursor-pointer border border-surface-container"
              >
                <FolderIcon size={20} />
                <span>View current referral</span>
              </button>
            </div>
          </div>

          {/* Quick Session Context Card */}
          <div className="w-full md:w-72 shrink-0 rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col gap-space-sm border border-surface-container">
            <div className="flex items-center justify-between pb-space-xs">
              <span className="font-label-meta text-label-meta uppercase text-on-surface-variant tracking-wider">
                Field Operative (Illustrative - simulated demo)
              </span>
              <span className="inline-flex items-center gap-1 font-label-meta text-label-meta text-secondary font-bold">
                <span className="w-2 h-2 rounded-full bg-secondary" /> {isOnline ? 'Online Ready' : 'Offline'}
              </span>
            </div>
            <div className="flex items-center gap-space-sm">
              <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary font-body-bold text-body-bold">
                SK
              </div>
              <div>
                <p className="font-body-bold text-body-bold text-on-surface leading-tight">Sunita Kumari</p>
                <p className="font-label-meta text-label-meta text-on-surface-variant">ASHA Cadre #4092</p>
              </div>
            </div>
            <div className="pt-space-xs flex items-center justify-between text-on-surface-variant font-label-meta text-label-meta border-t border-surface-container">
              <span>Sub-Center: <strong className="text-on-surface font-semibold">Pipariya East</strong></span>
              <span className="text-primary font-bold">Zone B</span>
            </div>
          </div>
        </div>

        {/* Data Privacy Guarantee Box */}
        <div className="mt-space-lg rounded-xl bg-surface-container-highest/60 p-space-md flex flex-col sm:flex-row items-start sm:items-center gap-space-sm text-on-surface-variant">
          <div className="w-9 h-9 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary shrink-0 shadow-sm">
            <LockIcon size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-body-sm text-body-sm text-on-surface leading-snug">
              <strong className="text-primary font-semibold">Privacy Guarantee:</strong> Case text stays strictly in memory for the request. Never enter real patient identities in this simulated environment.
            </p>
          </div>
          <span className="shrink-0 px-2 py-1 rounded bg-surface-container-lowest text-on-surface-variant font-label-meta text-label-meta shadow-sm border border-surface-container">
            Local Enclave Active
          </span>
        </div>
      </section>

      {/* Visual Field Context Insights Grid */}
      <section className="mb-space-lg grid grid-cols-1 md:grid-cols-3 gap-space-md">
        <div className="rounded-xl overflow-hidden shadow-sm bg-surface-container-lowest flex flex-col border border-surface-container p-space-md">
          <div className="flex items-center gap-space-xs mb-space-xs">
            <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
              <ShieldIcon size={18} />
            </div>
            <span className="font-label-meta text-label-meta text-primary font-semibold uppercase tracking-wider">
              Clinical Guidelines
            </span>
          </div>
          <h3 className="font-body-bold text-body-bold text-on-surface mb-1">Standardized Clinical Triage</h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Standardized triage guidance for pediatric fever, respiratory distress, and dehydration signs.
          </p>
        </div>

        <div className="rounded-xl overflow-hidden shadow-sm bg-surface-container-lowest flex flex-col border border-surface-container p-space-md">
          <div className="flex items-center gap-space-xs mb-space-xs">
            <div className="w-8 h-8 rounded-lg bg-secondary-container flex items-center justify-center text-secondary">
              <CheckIcon size={18} />
            </div>
            <span className="font-label-meta text-label-meta text-secondary font-semibold uppercase tracking-wider">
              Safety Invariant
            </span>
          </div>
          <h3 className="font-body-bold text-body-bold text-on-surface mb-1">Deterministic Safety Rules</h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Safety rules run after model output, and can only maintain or raise urgency, never lower it.
          </p>
        </div>

        <div className="rounded-xl overflow-hidden shadow-sm bg-surface-container-lowest flex flex-col border border-surface-container p-space-md">
          <div className="flex items-center gap-space-xs mb-space-xs">
            <div className="w-8 h-8 rounded-lg bg-tertiary-fixed flex items-center justify-center text-tertiary">
              <FolderIcon size={18} />
            </div>
            <span className="font-label-meta text-label-meta text-tertiary font-semibold uppercase tracking-wider">
              Facility Handoff
            </span>
          </div>
          <h3 className="font-body-bold text-body-bold text-on-surface mb-1">Structured Referral Slips</h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Generate clean, printer-ready handoff documentation for Community Health Centres with zero diagnosis.
          </p>
        </div>
      </section>

      {/* Demo Cases Section */}
      <section className="w-full mb-space-lg">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-space-md">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ScienceIcon size={22} className="text-primary" />
              <h2 className="font-headline-lg text-headline-lg text-on-surface">Try a demo case</h2>
            </div>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Instant sample data to test urgency algorithms and deterministic safety rule overrides
            </p>
          </div>
          <span className="mt-2 sm:mt-0 font-label-meta text-label-meta text-on-surface-variant bg-surface-container px-3 py-1 rounded-full w-fit">
            Simulated Environment Active
          </span>
        </div>

        {/* 2 Columns Grid for Demo Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
          {/* Card A: Kabir */}
          <article className="group rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between border border-surface-container">
            <div>
              <div className="flex items-start justify-between gap-space-sm mb-space-md">
                <div>
                  <span className="font-label-meta text-label-meta uppercase tracking-wider text-on-surface-variant">
                    Pediatric Triage Demo
                  </span>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mt-0.5">
                    Kabir — fever and vomiting
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary shrink-0">
                  <ChildIcon size={22} />
                </div>
              </div>

              {/* Patient Meta Badges */}
              <div className="flex flex-wrap items-center gap-space-xs mb-space-md">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container text-on-surface font-label-meta text-label-meta">
                  <PersonIcon size={14} className="text-on-surface-variant" />
                  4 yrs, Male
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container text-on-surface font-label-meta text-label-meta">
                  Duration: 3 days
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-900 font-label-meta text-label-meta font-bold">
                  Temp: 38.9°C (102.0°F)
                </span>
              </div>

              {/* Symptoms Summary */}
              <div className="p-space-sm rounded-xl bg-surface-container-low mb-space-md">
                <p className="font-label-meta text-label-meta text-on-surface-variant mb-1 font-semibold uppercase">
                  Reported Symptoms
                </p>
                <p className="font-body-lg text-body-lg text-on-surface">
                  High fever for 3 days, persistent vomiting (4 episodes recorded today), refusing oral fluids.
                </p>
              </div>

              {/* Expected Urgency Badge */}
              <div className="mb-space-lg">
                <span className="font-label-meta text-label-meta text-on-surface-variant block mb-1">
                  Clinical Assessment:
                </span>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-900 font-label-triage text-label-triage font-bold">
                  <span>YELLOW - REFER SOON</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => onLoadDemo(demos.find(d => d.name.toLowerCase().includes('kabir'))?.name || 'Kabir')}
              className="w-full min-h-[48px] h-12 px-space-md rounded-xl bg-surface-container text-primary font-body-bold text-body-bold hover:bg-primary hover:text-on-primary transition-colors flex items-center justify-between shadow-sm cursor-pointer"
            >
              <span>Load Kabir's Case</span>
              <ArrowForwardIcon size={20} />
            </button>
          </article>

          {/* Card B: Dev */}
          <article className="group rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between border border-error-container">
            <div>
              <div className="flex items-start justify-between gap-space-sm mb-space-md">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-label-meta text-label-meta uppercase tracking-wider text-on-surface-variant">
                      Adult Respiratory Demo
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-error-container text-on-error-container font-label-meta text-label-meta font-bold">
                      Rule Trigger Demo
                    </span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mt-0.5">
                    Dev — low oxygen rule override
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-error-container flex items-center justify-center text-error shrink-0">
                  <PersonIcon size={22} />
                </div>
              </div>

              {/* Patient Meta Badges */}
              <div className="flex flex-wrap items-center gap-space-xs mb-space-md">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container text-on-surface font-label-meta text-label-meta">
                  <PersonIcon size={14} className="text-on-surface-variant" />
                  52 yrs, Male
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container text-on-surface font-label-meta text-label-meta">
                  Duration: 1 day
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-error-container text-on-error-container font-label-meta text-label-meta font-bold">
                  SpO2: 89% (Room Air)
                </span>
              </div>

              {/* Symptoms Summary */}
              <div className="p-space-sm rounded-xl bg-surface-container-low mb-space-md">
                <p className="font-label-meta text-label-meta text-on-surface-variant mb-1 font-semibold uppercase">
                  Reported Symptoms
                </p>
                <p className="font-body-lg text-body-lg text-on-surface">
                  Cough, shortness of breath on exertion, SpO2 reading 89% on ambient air. Forces immediate RED urgency.
                </p>
              </div>

              {/* Expected Urgency Badge */}
              <div className="mb-space-lg">
                <span className="font-label-meta text-label-meta text-on-surface-variant block mb-1">
                  Deterministic Vital Override:
                </span>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-error-container text-on-error-container font-label-triage text-label-triage font-bold">
                  <span>RED - REFER NOW</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => onLoadDemo(demos.find(d => d.name.toLowerCase().includes('dev'))?.name || 'Dev')}
              className="w-full min-h-[48px] h-12 px-space-md rounded-xl bg-error text-on-error font-body-bold text-body-bold hover:bg-error-container hover:text-on-error-container transition-colors flex items-center justify-between shadow-sm cursor-pointer"
            >
              <span>Load Dev's Case</span>
              <ArrowForwardIcon size={20} />
            </button>
          </article>
        </div>
      </section>

      {/* Field Metric Overview Strip */}
      <section className="w-full">
        <div className="rounded-xl bg-surface-container-highest/80 shadow-sm p-space-md flex flex-col md:flex-row items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-sm">
            <div className="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary shadow-sm shrink-0">
              <ShieldIcon size={20} />
            </div>
            <div className="flex flex-col">
              <span className="font-body-bold text-body-bold text-on-surface">
                Daily Field Progress Summary
              </span>
              <p className="font-label-meta text-label-meta text-on-surface-variant">
                Today in Sector 4: <strong>8 cases triaged</strong> • <strong>2 facility referrals generated</strong> • <strong>100% offline verified</strong>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-space-md w-full md:w-auto justify-end">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-24 h-2 rounded-full bg-surface-container-low overflow-hidden">
                <div className="h-full bg-secondary rounded-full" style={{ width: '80%' }} />
              </div>
              <span className="font-label-meta text-label-meta text-on-surface-variant">8/10 planned</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-secondary font-label-meta text-label-meta shadow-sm flex items-center gap-1.5 border border-surface-container">
              <CheckIcon size={16} />
              <span>Sync Ready (0 Pending)</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

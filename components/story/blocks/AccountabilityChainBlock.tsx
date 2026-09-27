'use client';

import React, { useState } from 'react';
import type { AccountabilityChainData } from './types';

export default function AccountabilityChainBlock({ title, description, steps }: AccountabilityChainData) {
  const defaultSteps = [
    {
      id: 'step-1',
      stepNumber: 1,
      title: 'POWER',
      subtitle: 'Statutory Authority',
      description: 'Authority granted to ministers, collectors, and commissioners by Parliament or state legislatures.',
      failurePoint: 'Power is exercised without enforceable personal responsibility for departmental outcomes.',
      remedy: 'Statutory definition of institutional stewardship.'
    },
    {
      id: 'step-2',
      stepNumber: 2,
      title: 'DECISION',
      subtitle: 'Administrative Choice',
      description: 'Allocation of public resources, award of contracts, issuance of permits, or approval of payment systems.',
      failurePoint: 'Discretionary shortcuts taken in the name of administrative convenience or political priority.',
      remedy: 'Mandatory competitive, transparent electronic processes.'
    },
    {
      id: 'step-3',
      stepNumber: 3,
      title: 'DUTY',
      subtitle: 'Legal Obligation',
      description: 'Statutory obligation to inspect structures, disburse wages within 15 days, or ensure safety compliance.',
      failurePoint: 'Regulatory fragmentation where multiple agencies each hold partial oversight and none acts.',
      remedy: 'Single-point statutory ownership with mandatory inspection ledgers.'
    },
    {
      id: 'step-4',
      stepNumber: 4,
      title: 'WARNING',
      subtitle: 'Prior Notice',
      description: 'Prior audit observations, unexecuted demolition notices, or social audit red flags.',
      failurePoint: 'Notices are issued on paper but left unexecuted while establishments continue to operate.',
      remedy: 'Automated escalation of unexecuted statutory notices.'
    },
    {
      id: 'step-5',
      stepNumber: 5,
      title: 'FAILURE',
      subtitle: 'Systemic Breakdown',
      description: 'Catastrophic event: fire, bridge collapse, custodial death, or stalled welfare payments.',
      failurePoint: 'The cost of the breakdown is absorbed by citizens who had no power to prevent it.',
      remedy: 'Strict state liability in public law under Article 21.'
    },
    {
      id: 'step-6',
      stepNumber: 6,
      title: 'INVESTIGATION',
      subtitle: 'Fact-Finding',
      description: 'Audits by the CAG, police investigations by SIT, or judicial commissions of inquiry.',
      failurePoint: 'Audits and inquiries take years, completing autopsies after decision-makers have moved on.',
      remedy: 'Time-bound, public fact-finding with independent statutory powers.'
    },
    {
      id: 'step-7',
      stepNumber: 7,
      title: 'RESPONSIBILITY',
      subtitle: 'Attribution of Failure',
      description: 'Determining whether responsibility rests on political leadership, senior administrators, or field staff.',
      failurePoint: 'Conflating political and administrative stewardship with high penal standards of criminal guilt.',
      remedy: 'Clear separation of political resignation, disciplinary action, and penal prosecution.'
    },
    {
      id: 'step-8',
      stepNumber: 8,
      title: 'SANCTION',
      subtitle: 'Consequence Imposed',
      description: 'Resignation, disciplinary penalties, departmental recoveries, or criminal trial.',
      failurePoint: 'Suspensions used as temporary shock absorbers; procedural rules turn inquiries into multi-year delays.',
      remedy: 'Direct financial recoveries and strict enforcement of civil service conduct rules.'
    },
    {
      id: 'step-9',
      stepNumber: 9,
      title: 'CORRECTION',
      subtitle: 'Remediation of Harm',
      description: 'Clearing stalled wage backlogs, paying statutory delay compensation, or sealing illegal structures.',
      failurePoint: 'Compliance memos signed while underlying systemic payment backlogs persist.',
      remedy: 'Statutory restitution directly credited to affected citizens.'
    },
    {
      id: 'step-10',
      stepNumber: 10,
      title: 'INSTITUTIONAL LEARNING',
      subtitle: 'Systemic Reform',
      description: 'Revising administrative design and legal standards so the same failure is not repeated in the next cycle.',
      failurePoint: 'Earlier audit deficiencies carried forward into successive audit cycles without resolution.',
      remedy: 'Legislative oversight through mandatory Public Accounts Committee follow-up.'
    }
  ];

  const activeSteps = steps && steps.length > 0 ? steps : defaultSteps;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const currentStep = activeSteps[selectedIndex] || activeSteps[0];

  return (
    <section 
      aria-label="Accountability Chain Framework" 
      className="my-12 p-6 sm:p-8 rounded-2xl bg-[#0D0D0D] border border-neutral-800 shadow-xl"
    >
      <header className="mb-6">
        <span className="text-xs font-mono uppercase font-bold tracking-widest text-[#FFD900] bg-[#FFD900]/10 px-2.5 py-1 rounded border border-[#FFD900]/30 inline-block mb-2">
          Conceptual Framework
        </span>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          {title || 'The Accountability Chain: From Power to Consequence'}
        </h2>
        <p className="text-sm text-neutral-400 mt-1 leading-relaxed">
          {description || 'Accountability in public governance requires an unbroken sequence across ten institutional stages. When a failure occurs, the chain often snaps between detection and consequence.'}
        </p>
      </header>

      {/* Accessible Step Selector Buttons */}
      <div 
        role="tablist" 
        aria-label="Accountability Chain Stages"
        className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6"
      >
        {activeSteps.map((step, idx) => {
          const isSelected = idx === selectedIndex;
          return (
            <button
              key={step.id || idx}
              role="tab"
              aria-selected={isSelected}
              aria-controls={`step-panel-${idx}`}
              id={`step-tab-${idx}`}
              onClick={() => setSelectedIndex(idx)}
              className={`p-2.5 text-left rounded-lg border transition-all text-xs focus:outline-none focus:ring-2 focus:ring-[#FFD900] ${
                isSelected
                  ? 'bg-[#1F1F1F] border-[#FFD900] text-white shadow-sm'
                  : 'bg-[#141414] border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[10px] text-neutral-500 font-bold">
                  STEP {step.stepNumber < 10 ? `0${step.stepNumber}` : step.stepNumber}
                </span>
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFD900]" aria-hidden="true" />
                )}
              </div>
              <div className="font-bold uppercase tracking-wider text-[11px] truncate text-white">
                {step.title}
              </div>
            </button>
          );
        })}
      </div>

      {/* Detail Card for Selected Step */}
      <div
        role="tabpanel"
        id={`step-panel-${selectedIndex}`}
        aria-labelledby={`step-tab-${selectedIndex}`}
        className="p-5 sm:p-6 rounded-xl bg-[#141414] border border-neutral-800"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800/80 pb-3 mb-4">
          <div>
            <span className="text-xs font-mono font-bold text-[#FFD900] uppercase tracking-wider block">
              Stage {currentStep.stepNumber} of {activeSteps.length}
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-white mt-0.5">
              {currentStep.title} — <span className="text-neutral-300 font-medium">{currentStep.subtitle}</span>
            </h3>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Active Stage Analysis
          </div>
        </div>

        <p className="text-sm sm:text-base text-neutral-200 leading-relaxed mb-5">
          {currentStep.description}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
          {currentStep.failurePoint && (
            <div className="p-4 rounded-lg bg-red-950/20 border border-red-900/40">
              <span className="font-mono text-[11px] uppercase font-bold text-red-400 tracking-wider block mb-1">
                Where the Chain Typically Breaks
              </span>
              <p className="text-neutral-300 leading-relaxed">{currentStep.failurePoint}</p>
            </div>
          )}
          {currentStep.remedy && (
            <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-900/40">
              <span className="font-mono text-[11px] uppercase font-bold text-emerald-400 tracking-wider block mb-1">
                Documented Constitutional / Institutional Remedy
              </span>
              <p className="text-neutral-300 leading-relaxed">{currentStep.remedy}</p>
            </div>
          )}
        </div>
      </div>

      {/* Static Accessible Fallback for Screen Readers & Print */}
      <div className="sr-only">
        <h4>Complete Ten-Step Accountability Sequence</h4>
        <ol>
          {activeSteps.map((s) => (
            <li key={s.id || s.stepNumber}>
              <strong>Step {s.stepNumber}: {s.title} ({s.subtitle})</strong> — {s.description} 
              {s.failurePoint ? ` Failure point: ${s.failurePoint}.` : ''}
              {s.remedy ? ` Remedy: ${s.remedy}.` : ''}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

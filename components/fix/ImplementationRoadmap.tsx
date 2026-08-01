'use client';

import React from 'react';
import type { Fix } from '../../types/canonical';
import { computeImplementationPhases } from '../../lib/fix-helpers';

interface ImplementationRoadmapProps {
  fix: Fix;
}

type PhaseStatus = 'completed' | 'in_progress' | 'upcoming';

function TimelinePhase({ phase, title, description, duration, status, isLast }: {
  phase: number;
  title: string;
  description: string;
  duration: string;
  status: PhaseStatus;
  isLast?: boolean;
}) {
  const statusConfig: Record<PhaseStatus, { bg: string; ring: string; label: string; labelColor: string }> = {
    completed: { bg: 'bg-emerald-500', ring: 'ring-emerald-500/30', label: 'Completed', labelColor: 'text-emerald-400' },
    in_progress: { bg: 'bg-[var(--color-brand-400)]', ring: 'ring-[var(--color-brand-400)]/30', label: 'In Progress', labelColor: 'text-[var(--color-brand-400)]' },
    upcoming: { bg: 'bg-gray-600', ring: 'ring-gray-600/30', label: 'Upcoming', labelColor: 'text-gray-500' },
  };
  const cfg = statusConfig[status];

  return (
    <div className="flex items-start gap-4 relative">
      {!isLast && (
        <div className={`absolute left-4 top-8 bottom-0 w-px ${status === 'completed' ? 'bg-emerald-500/40' : 'bg-[var(--color-border)]'}`} />
      )}
      <div className={`relative z-10 shrink-0 w-8 h-8 rounded-full ${cfg.bg} flex items-center justify-center text-xs font-bold text-gray-900 ring-4 ${cfg.ring}`}>
        {status === 'completed' ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
        ) : phase}
      </div>
      <div className="pb-6 min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <h5 className="text-sm font-semibold text-[var(--color-text-primary)]">{title}</h5>
          <span className={`text-[10px] font-medium ${cfg.labelColor}`}>{cfg.label}</span>
        </div>
        <span className="text-[10px] text-[var(--color-text-tertiary)]">{duration}</span>
        <p className="text-xs text-[var(--color-text-secondary)] mt-1 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

export default function ImplementationRoadmap({ fix }: ImplementationRoadmapProps) {
  const phases = computeImplementationPhases(fix);
  const recommendedActions = (fix.recommendedActions || []).filter(a => a.priority === 'critical' || a.priority === 'high');

  return (
    <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border)] rounded-xl p-5 mb-6">
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
        <svg className="w-4 h-4 text-[var(--color-brand-400)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        Implementation Roadmap
      </h3>

      <div className="mb-4 flex items-center gap-4">
        <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)]">
          {phases.length} phases \u00b7 {(fix.timeToImpact || 'medium-term').replace('-', ' ')}
        </span>
        <div className="flex items-center gap-3 ml-auto">
          <span className="flex items-center gap-1 text-[10px] text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Completed</span>
          <span className="flex items-center gap-1 text-[10px] text-[var(--color-brand-400)]"><span className="w-2 h-2 rounded-full bg-[var(--color-brand-400)]" /> In Progress</span>
          <span className="flex items-center gap-1 text-[10px] text-gray-500"><span className="w-2 h-2 rounded-full bg-gray-600" /> Upcoming</span>
        </div>
      </div>

      <div>
        {phases.map((phase, i) => (
          <TimelinePhase key={i} phase={i + 1} title={phase.title} description={phase.description} duration={phase.duration} status={phase.status} isLast={i === phases.length - 1} />
        ))}
      </div>

      {recommendedActions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
          <h5 className="text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)] mb-2">Key Actions</h5>
          <div className="space-y-1.5">
            {recommendedActions.slice(0, 4).map((action, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className={`shrink-0 w-1.5 h-1.5 rounded-full mt-1.5 ${action.priority === 'critical' ? 'bg-red-400' : 'bg-amber-400'}`} />
                <span className="text-xs text-[var(--color-text-secondary)]">{action.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React from 'react';
import type { Fix } from '../../types/canonical';
import { EVIDENCE_GRADE_CONFIG, getSourceCount, formatDate } from '../../lib/fix-helpers';

interface TrustCardProps {
  fix: Fix;
}

function StatRow({ label, value, icon }: { label: string; value: React.ReactNode; icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <span className="text-sm font-semibold text-[var(--color-text-primary)]">{value}</span>
    </div>
  );
}

function TrustStateIndicator({ fix }: { fix: Fix }) {
  const grade = fix.evidenceGrade || 'Moderate';
  const maturity = fix.maturityStatus || 'proposed';

  let state: string;
  let stateColor: string;
  let stateBg: string;

  if (maturity === 'implemented' || maturity === 'measured' || (maturity === 'expert_reviewed' && grade === 'High')) {
    state = 'Verified';
    stateColor = 'text-emerald-400';
    stateBg = 'bg-emerald-500/10 border-emerald-500/30';
  } else if (maturity === 'expert_reviewed' || grade === 'Moderate') {
    state = 'Under Review';
    stateColor = 'text-amber-400';
    stateBg = 'bg-amber-500/10 border-amber-500/30';
  } else {
    state = 'In Development';
    stateColor = 'text-blue-400';
    stateBg = 'bg-blue-500/10 border-blue-500/30';
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border mb-3 ${stateBg}`}>
      <div className={`w-2 h-2 rounded-full ${state === 'Verified' ? 'bg-emerald-400' : state === 'Under Review' ? 'bg-amber-400' : 'bg-blue-400'}`} />
      <span className={`text-xs font-semibold ${stateColor}`}>{state}</span>
    </div>
  );
}

export default function TrustCard({ fix }: TrustCardProps) {
  const precedentCount = (fix.globalPrecedents || []).length;
  const tradeOffCount = (fix.tradeOffs || []).length;
  const riskCount = (fix.risksAndFailures || []).length;
  const sourceCount = getSourceCount(fix);
  const grade = EVIDENCE_GRADE_CONFIG[fix.evidenceGrade || 'Moderate'] || EVIDENCE_GRADE_CONFIG.Moderate;

  return (
    <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border)] rounded-xl p-5 sticky top-24">
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
        <svg className="w-4 h-4 text-[var(--color-brand-400)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        Trust & Evidence
      </h3>

      <TrustStateIndicator fix={fix} />

      <div className="divide-y divide-[var(--color-border)]">
        <StatRow
          label="Evidence Grade"
          value={<span className={grade.color}>{fix.evidenceGrade || 'Moderate'}</span>}
          icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>}
        />
        <StatRow
          label="Sources"
          value={sourceCount > 0 ? sourceCount : <span className="text-[var(--color-text-tertiary)] text-xs italic">Under editorial review</span>}
          icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
        />
        <StatRow
          label="Global Precedents"
          value={`${precedentCount} ${precedentCount === 1 ? 'country' : 'countries'}`}
          icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatRow
          label="Trade-offs"
          value={tradeOffCount}
          icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>}
        />
        <StatRow
          label="Risks"
          value={riskCount}
          icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>}
        />
        <StatRow
          label="Last Verified"
          value={formatDate(fix.lastVerified)}
          icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>

      <button className="w-full mt-4 py-2 text-xs font-medium text-[var(--color-brand-400)] border border-[var(--color-brand-400)]/30 rounded-lg hover:bg-[var(--color-brand-400)]/10 transition-colors">
        See Full Evidence
      </button>
    </div>
  );
}

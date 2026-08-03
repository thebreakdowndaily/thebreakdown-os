import React from 'react';
import type { VerificationQueue, VerificationKind, VerificationExecutiveSummary } from '@/lib/intel/executive';
import { ConfidencePill } from '@/components/intel/shared/primitives';
import { VerificationStatusBadge } from '@/components/intel/verification/VerificationStatusBadge';
import type { VerificationStatus } from '@/lib/intel/verification';

// Governing document: Phase IV sprint brief (Verification Queue) + Phase V sprint brief
// (Verification Operating System — Mission Control integration).
// Surfaces the verification work derived from certified engine outputs. Render only —
// queue construction lives in the Executive Intelligence Service; the case summary is the
// Verification Service's Mission Control projection. No logic here.

const KIND_LABEL: Record<VerificationKind, string> = {
  claim: 'Claim to verify',
  missing_evidence: 'Missing evidence',
  weak_evidence: 'Weak evidence',
  conflicting_evidence: 'Conflicting signals',
};

const SUMMARY_STATUSES: VerificationStatus[] = [
  'unreviewed',
  'in_review',
  'evidence_complete',
  'evidence_incomplete',
  'needs_field_verification',
  'needs_official_confirmation',
  'conflicting_evidence',
  'verified',
  'rejected',
  'deferred',
  'archived',
];

function SummaryStrip({ summary }: { summary: VerificationExecutiveSummary }) {
  return (
    <div style={{ marginTop: 'var(--spacing-4)', padding: 'var(--spacing-4)', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-default)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--spacing-2)' }}>
        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
          Verification cases
        </span>
        <a href="/intel/verification" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-amber-500)', textDecoration: 'none' }}>
          Open verification workspace →
        </a>
      </div>
      <div style={{ display: 'flex', gap: 'var(--spacing-4)', marginTop: 'var(--spacing-2)', flexWrap: 'wrap', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
        <span>{summary.totalCases} cases</span>
        <span>{summary.openCases} open</span>
        <span style={{ color: 'var(--color-warning)' }}>{summary.highPriorityOpen} high-priority open</span>
        <span>{summary.verifiedCases} verified</span>
        <span>{summary.openConflicts} open conflicts</span>
      </div>
      <div style={{ display: 'flex', gap: 'var(--spacing-1)', marginTop: 'var(--spacing-3)', flexWrap: 'wrap', alignItems: 'center' }}>
        {SUMMARY_STATUSES.filter((s) => summary.statusCounts[s] > 0).map((s) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-1)' }}>
            <VerificationStatusBadge status={s} />
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{summary.statusCounts[s]}</span>
          </div>
        ))}
      </div>
      {summary.blockedInvestigations.length > 0 ? (
        <details style={{ marginTop: 'var(--spacing-3)' }}>
          <summary style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
            Blocked investigations
          </summary>
          <ul style={{ marginTop: 'var(--spacing-1)', paddingLeft: 'var(--spacing-4)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)' }}>
            {summary.blockedInvestigations.map((b) => (
              <li key={b.caseId} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>{b.constituencyName}</span> — {b.reason}
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}

export function VerificationPanel({
  queue,
  verificationOS,
}: {
  queue: VerificationQueue;
  verificationOS?: VerificationExecutiveSummary;
}) {
  return (
    <section aria-label="Verification queue">
      <div style={{ marginBottom: 'var(--spacing-3)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>Overall confidence</span>
        <ConfidencePill tier={queue.overallConfidence} />
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          {queue.counts.claim} claim · {queue.counts.missing_evidence} missing · {queue.counts.weak_evidence} weak · {queue.counts.conflicting_evidence} conflicting
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
        {queue.items.map((item) => (
          <div key={item.id} style={{ padding: 'var(--spacing-3)', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--spacing-2)', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {KIND_LABEL[item.kind]} — {item.title}
              </span>
              <ConfidencePill tier={item.confidence} />
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-1)' }}>{item.detail}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>{item.recommendedAction}</div>
          </div>
        ))}
      </div>
      <details style={{ marginTop: 'var(--spacing-3)' }}>
        <summary style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>Required documents</summary>
        <ul style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)', paddingLeft: 'var(--spacing-4)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)' }}>
          {queue.requiredDocuments.map((d) => <li key={d}>{d}</li>)}
        </ul>
      </details>
      {verificationOS ? <SummaryStrip summary={verificationOS} /> : null}
    </section>
  );
}

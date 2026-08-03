import React from 'react';
import type { VerificationOverview, VerificationStatus } from '@/lib/intel/verification';
import { verificationStatusLabel } from '@/lib/intel/verification';
import { ConfidencePill, Badge } from '@/components/intel/shared/primitives';

// Governing document: docs/intelligence/tbios-master-prompt-v1.md (Verification Workspace — Dashboard)
// Render-only dashboard. All numbers come from computeVerificationOverview.

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{ padding: 'var(--spacing-5)', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-default)' }}>
      <div style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text-muted)', fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: 'var(--spacing-1)' }}>{value}</div>
      {sub ? <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>{sub}</div> : null}
    </div>
  );
}

const STATUS_ORDER: VerificationStatus[] = [
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

export function VerificationDashboard({ overview }: { overview: VerificationOverview }) {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-6)' }}>
        <StatCard label="Total cases" value={String(overview.totalCases)} sub="top Investigation Priority seats" />
        <StatCard label="Open cases" value={String(overview.openCases)} sub={`${overview.highPriorityOpen} high-priority open`} />
        <StatCard label="Verification backlog" value={String(overview.backlogCount)} sub="waiting on review or evidence" />
        <StatCard label="Open conflicts" value={String(overview.openConflicts)} sub={`evidence debt ${overview.evidenceDebt.toLocaleString()}`} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-6)', marginBottom: 'var(--spacing-6)', alignItems: 'start' }}>
        <section>
          <div style={{ marginBottom: 'var(--spacing-3)' }}>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-text-primary)' }}>Workflow distribution</h2>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>
              Cases by explicit verification status. Transitions follow the workflow's transition map.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)', marginBottom: 'var(--spacing-4)' }}>
            {STATUS_ORDER.map((s) =>
              overview.statusCounts[s] > 0 ? (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', fontSize: 'var(--text-xs)' }}>
                  <span style={{ width: 180, color: 'var(--color-text-secondary)' }}>{verificationStatusLabel(s)}</span>
                  <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--color-bg-primary)', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${(overview.statusCounts[s] / Math.max(1, overview.totalCases)) * 100}%`,
                        background: s === 'verified' ? 'var(--color-brand-400)' : s === 'conflicting_evidence' || s === 'rejected' ? 'var(--color-error)' : 'var(--color-amber-500)',
                      }}
                    />
                  </div>
                  <span style={{ color: 'var(--color-text-muted)', width: 40, textAlign: 'right' }}>{overview.statusCounts[s]}</span>
                </div>
              ) : null
            )}
          </div>
        </section>

        <section>
          <div style={{ marginBottom: 'var(--spacing-3)' }}>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-text-primary)' }}>Workspace posture</h2>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>
              Overall confidence across the case set, and honest notes about the workspace.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-3)' }}>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>Overall confidence</span>
            <ConfidencePill tier={overview.overallConfidence} />
          </div>
          <div style={{ padding: 'var(--spacing-4)', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
            <div style={{ display: 'flex', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-2)', flexWrap: 'wrap' }}>
              <Badge>{overview.dataSource}</Badge>
              <Badge>cutoff {overview.researchCutoff}</Badge>
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{overview.storeNote}</div>
          </div>
        </section>
      </div>
    </div>
  );
}

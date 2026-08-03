import React from 'react';
import type { StoryOverview, StoryStatus } from '@/lib/intel/story';
import { storyStatusLabel } from '@/lib/intel/story';
import { Badge } from '@/components/intel/shared/primitives';

// Governing document: docs/intelligence/tbios-master-prompt-v1.md (Story Builder — Dashboard)
// Render-only dashboard. Every number comes from computeStoryOverview. No logic here.

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{ padding: 'var(--spacing-5)', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-default)' }}>
      <div style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text-muted)', fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: 'var(--spacing-1)' }}>{value}</div>
      {sub ? <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>{sub}</div> : null}
    </div>
  );
}

const STATUS_ORDER: StoryStatus[] = [
  'idea',
  'planned',
  'researching',
  'verification_required',
  'verification_complete',
  'drafting',
  'editorial_review',
  'ready_for_publication',
  'published',
  'archived',
];

export function StoryDashboard({ overview }: { overview: StoryOverview }) {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-6)' }}>
        <StatCard label="Story drafts" value={String(overview.totalDrafts)} sub="top Investigation Priority seats" />
        <StatCard label="Ready to draft" value={String(overview.readyToDraft)} sub="verification complete / drafting" />
        <StatCard label="Blocked" value={String(overview.blocked)} sub="editorial blockers or field reporting" />
        <StatCard label="High-impact opportunities" value={String(overview.highImpactOpportunities)} sub={`${overview.publishedCount} published`} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-6)', marginBottom: 'var(--spacing-6)', alignItems: 'start' }}>
        <section>
          <div style={{ marginBottom: 'var(--spacing-3)' }}>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-text-primary)' }}>Workflow distribution</h2>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>
              Story drafts by editorial status. Transitions follow the explicit editorial transition map.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)', marginBottom: 'var(--spacing-4)' }}>
            {STATUS_ORDER.map((s) =>
              overview.statusCounts[s] > 0 ? (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', fontSize: 'var(--text-xs)' }}>
                  <span style={{ width: 190, color: 'var(--color-text-secondary)' }}>{storyStatusLabel(s)}</span>
                  <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--color-bg-primary)', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${(overview.statusCounts[s] / Math.max(1, overview.totalDrafts)) * 100}%`,
                        background: s === 'published' || s === 'ready_for_publication' ? 'var(--color-brand-400)' : s === 'archived' ? 'var(--color-text-muted)' : 'var(--color-amber-500)',
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
              The Story Builder plans editorial work over certified intelligence. It never creates facts.
            </p>
          </div>
          <div style={{ padding: 'var(--spacing-4)', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
            <div style={{ display: 'flex', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-2)', flexWrap: 'wrap' }}>
              <Badge>{overview.dataSource}</Badge>
              <Badge>cutoff {overview.researchCutoff}</Badge>
              <Badge>{overview.awaitingVerification} awaiting verification</Badge>
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{overview.storeNote}</div>
          </div>
        </section>
      </div>
    </div>
  );
}

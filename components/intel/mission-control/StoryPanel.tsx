import React from 'react';
import type { StoryExecutiveSummary } from '@/lib/intel/executive';
import { Badge } from '@/components/intel/shared/primitives';

// Governing document: Phase VI sprint brief (Story Builder — Mission Control integration).
// Surfaces the Story Builder's Mission Control projection. Render only — the projection is
// computed by the Executive Intelligence Service from the Story Service. No logic here.

const RECENT_ACTION_LABEL: Record<string, string> = {
  created: 'created',
  status_transition: 'status changed',
  editor_assigned: 'editor assigned',
  note: 'noted',
};

export function StoryPanel({ storyOS }: { storyOS: StoryExecutiveSummary }) {
  return (
    <div style={{ padding: 'var(--spacing-5)', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-default)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--spacing-2)' }}>
        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
          Story Builder · Editorial Production System
        </span>
        <a href="/intel/story-builder" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-amber-500)', textDecoration: 'none' }}>
          Open Story Builder →
        </a>
      </div>

      <div style={{ display: 'flex', gap: 'var(--spacing-5)', marginTop: 'var(--spacing-3)', flexWrap: 'wrap', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
        <span><strong style={{ color: 'var(--color-text-primary)' }}>{storyOS.totalDrafts}</strong> drafts</span>
        <span><strong style={{ color: 'var(--color-brand-400)' }}>{storyOS.readyToDraft}</strong> ready to draft</span>
        <span style={{ color: 'var(--color-warning)' }}><strong style={{ color: 'var(--color-warning)' }}>{storyOS.awaitingVerification}</strong> awaiting verification</span>
        <span><strong style={{ color: 'var(--color-amber-500)' }}>{storyOS.highImpactOpportunities}</strong> high-impact opportunities</span>
        <span><strong style={{ color: 'var(--color-brand-400)' }}>{storyOS.publishedCount}</strong> published</span>
      </div>

      {storyOS.recentActivity.length > 0 ? (
        <details style={{ marginTop: 'var(--spacing-3)' }}>
          <summary style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
            Recent editorial activity
          </summary>
          <ul style={{ marginTop: 'var(--spacing-2)', paddingLeft: 'var(--spacing-4)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)' }}>
            {storyOS.recentActivity.map((a) => (
              <li key={`${a.storyId}-${a.at}`} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>{a.headline}</span> — {RECENT_ACTION_LABEL[a.action] ?? a.action} by {a.actorName} · {new Date(a.at).toLocaleString()}
              </li>
            ))}
          </ul>
        </details>
      ) : (
        <div style={{ marginTop: 'var(--spacing-3)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          No editorial activity recorded in this process lifetime.
        </div>
      )}

      <div style={{ marginTop: 'var(--spacing-3)', display: 'flex', gap: 'var(--spacing-2)', flexWrap: 'wrap' }}>
        <Badge>{storyOS.note}</Badge>
      </div>
    </div>
  );
}

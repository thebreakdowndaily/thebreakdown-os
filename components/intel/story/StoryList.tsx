import React from 'react';
import Link from 'next/link';
import type { StoryDraftSummary } from '@/lib/intel/story';
import { StoryStatusBadge } from './StoryStatusBadge';
import { ConfidencePill } from '@/components/intel/shared/primitives';

// Governing document: docs/intelligence/tbios-master-prompt-v1.md (Story Builder — Draft List)
// Render-only story list. Each draft links to its editorial workspace.

const READINESS_COLOR: Record<StoryDraftSummary['readinessState'], string> = {
  ready: 'var(--color-brand-400)',
  needs_editorial_review: 'var(--color-amber-400)',
  needs_verification: 'var(--color-warning)',
  needs_field_reporting: 'var(--color-warning)',
  needs_research: 'var(--color-warning)',
  blocked: 'var(--color-error)',
  published: 'var(--color-brand-400)',
  archived: 'var(--color-text-muted)',
};

export function StoryList({ stories }: { stories: StoryDraftSummary[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
      {stories.map((s) => (
        <Link key={s.id} href={`/intel/story-builder/${s.id}`} style={{ textDecoration: 'none' }}>
          <div
            style={{
              padding: 'var(--spacing-4)',
              background: 'var(--color-bg-secondary)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border-default)',
              display: 'grid',
              gridTemplateColumns: '220px 1fr auto',
              gap: 'var(--spacing-4)',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {s.constituencyName}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>
                {s.storyType.replace('_', ' ')} story
              </div>
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {s.headline}
              </div>
              <div style={{ display: 'flex', gap: 'var(--spacing-2)', marginTop: 'var(--spacing-2)', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  <span style={{ color: READINESS_COLOR[s.readinessState], fontWeight: 600 }}>{s.readinessState.replace(/_/g, ' ')}</span> · updated {new Date(s.updatedAt).toLocaleDateString()}
                </span>
                <ConfidencePill tier={s.confidence} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--spacing-2)' }}>
              <StoryStatusBadge status={s.status} />
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-amber-500)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                IPI {String(s.editorialPriority)} · {s.priorityTier}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

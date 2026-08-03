import React from 'react';
import type { StoryStatus } from '@/lib/intel/story';
import { storyStatusLabel } from '@/lib/intel/story';

// Governing document: docs/intelligence/tbios-master-prompt-v1.md (Story Builder)
// Render-only status badge. Color reflects workflow phase, not editorial quality.

const STATUS_COLOR: Record<StoryStatus, string> = {
  idea: 'var(--color-text-muted)',
  planned: 'var(--color-text-muted)',
  researching: 'var(--color-brand-400)',
  verification_required: 'var(--color-warning)',
  verification_complete: 'var(--color-amber-400)',
  drafting: 'var(--color-brand-400)',
  editorial_review: 'var(--color-amber-400)',
  ready_for_publication: 'var(--color-brand-400)',
  published: 'var(--color-brand-400)',
  archived: 'var(--color-text-muted)',
};

export function StoryStatusBadge({ status }: { status: StoryStatus }) {
  const color = STATUS_COLOR[status];
  return (
    <span
      style={{
        fontSize: 'var(--text-xs)',
        fontWeight: 600,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        padding: '2px 8px',
        borderRadius: 'var(--radius-sm)',
        color,
        background: 'color-mix(in srgb, var(--color-bg-primary) 60%, transparent)',
        border: `1px solid color-mix(in srgb, ${color} 50%, transparent)`,
      }}
    >
      {storyStatusLabel(status)}
    </span>
  );
}

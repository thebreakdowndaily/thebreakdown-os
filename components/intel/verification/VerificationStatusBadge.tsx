import React from 'react';
import type { VerificationStatus } from '@/lib/intel/verification';
import { verificationStatusLabel } from '@/lib/intel/verification';

// Governing document: docs/intelligence/tbios-master-prompt-v1.md (Verification Workspace)
// Render-only status badge. Label source is the canonical status machine.

const STATUS_COLOR: Record<VerificationStatus, string> = {
  unreviewed: 'var(--color-text-secondary)',
  in_review: 'var(--color-amber-500)',
  evidence_complete: 'var(--color-brand-400)',
  evidence_incomplete: 'var(--color-warning)',
  needs_field_verification: 'var(--color-amber-500)',
  needs_official_confirmation: 'var(--color-brand-400)',
  conflicting_evidence: 'var(--color-error)',
  verified: 'var(--color-brand-400)',
  rejected: 'var(--color-error)',
  deferred: 'var(--color-text-muted)',
  archived: 'var(--color-text-muted)',
};

export function VerificationStatusBadge({ status }: { status: VerificationStatus }) {
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
        border: `1px solid color-mix(in srgb, ${color} 45%, transparent)`,
      }}
    >
      {verificationStatusLabel(status)}
    </span>
  );
}

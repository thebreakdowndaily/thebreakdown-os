import React from 'react';
import Link from 'next/link';
import type { VerificationCase } from '@/lib/intel/verification';
import { VerificationStatusBadge } from './VerificationStatusBadge';
import { ConfidencePill } from '@/components/intel/shared/primitives';

// Governing document: docs/intelligence/tbios-master-prompt-v1.md (Verification Workspace — Case List)
// Render-only case list. Each case links to its detail workspace.

function tierColor(tier: VerificationCase['priorityTier']): string {
  return tier === 'critical' ? 'var(--color-error)' : tier === 'high' ? 'var(--color-amber-500)' : tier === 'medium' ? 'var(--color-brand-400)' : 'var(--color-text-muted)';
}

export function CaseList({ cases }: { cases: VerificationCase[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
      {cases.map((c) => (
        <Link
          key={c.id}
          href={`/intel/verification/cases/${c.id}`}
          style={{ textDecoration: 'none' }}
        >
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
                {c.constituencyName}
                <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}> · {c.district}</span>
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                {c.region} · {c.currentMlaParty} → {c.predictedWinner}
              </div>
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {c.summary}
              </div>
              <div style={{ display: 'flex', gap: 'var(--spacing-2)', marginTop: 'var(--spacing-2)', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  {c.claimRegister.length} claims · {c.conflicts.length} conflicts · {c.readiness.score}/100 readiness
                </span>
                <ConfidencePill tier={c.confidence} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--spacing-2)' }}>
              <VerificationStatusBadge status={c.status} />
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: tierColor(c.priorityTier), textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                IPI {String(Math.round(c.ipi))} · {c.priorityTier}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

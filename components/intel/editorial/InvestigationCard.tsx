import Link from 'next/link';
import { ConfidencePill, Badge, Muted } from '@/components/intel/shared/primitives';
import type { InvestigationCase } from '@/lib/intel/editorial/types';

// Governing document: docs/intelligence/roadmap.md (Part 14 — Editorial Intelligence)
// Render-only card for one Investigation Case. Every ranked seat states why it ranks where it does.

function factorColor(value: number): string {
  if (value >= 70) return 'var(--color-error)';
  if (value >= 40) return 'var(--color-warning)';
  return 'var(--color-brand-400)';
}

export function InvestigationCard({ caseData, rank }: { caseData: InvestigationCase; rank: number }) {
  return (
    <details
      style={{ background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)', overflow: 'hidden' }}
    >
      <summary style={{ cursor: 'pointer', listStyle: 'none', padding: 'var(--spacing-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-tertiary)', minWidth: 28 }}>#{String(rank)}</span>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>{caseData.constituency_name}</span>
              <Badge>{caseData.current_mla_party || 'vacant'}</Badge>
              <Badge tone={caseData.ipi >= 60 ? 'warn' : 'default'}>IPI {String(caseData.ipi)}</Badge>
              <ConfidencePill tier={caseData.confidence} />
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 4 }}>
              {caseData.district} · {caseData.region} · {caseData.reservation_type} · AC {String(caseData.ac_number)}
            </div>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', textAlign: 'right' }}>
            <div>
              Predicted <strong>{caseData.predicted_winner}</strong> at <strong>{String(caseData.winner_probability)}%</strong>
            </div>
            <div style={{ marginTop: 2 }}>
              <Muted>{caseData.topReasons[0]?.label ?? 'No driver'}: {caseData.topReasons[0]?.why ?? '—'}</Muted>
            </div>
          </div>
        </div>
      </summary>

      <div style={{ padding: '0 var(--spacing-4) var(--spacing-4)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
          <div>
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-2)' }}>
              Factor decomposition — why this seat ranks #{String(rank)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
              {caseData.factors.map((f) => (
                <div key={f.key} style={{ padding: 'var(--spacing-3)', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-primary)', flex: 1 }}>{f.label}</span>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>weight {Math.round(f.weight * 100)}%</span>
                    <ConfidencePill tier={f.confidence} />
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: factorColor(f.value) }}>{String(f.value)}/100</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--color-bg-primary)', borderRadius: 3, overflow: 'hidden', marginTop: 'var(--spacing-2)' }}>
                    <div style={{ height: '100%', width: `${String(f.value)}%`, background: factorColor(f.value), borderRadius: 3 }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 'var(--spacing-2)' }}>
                    {f.evidence.map((e) => (
                      <div key={e} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>· {e}</div>
                    ))}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-2)' }}>
                    <Muted>Limit: {f.limitation}</Muted>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-3)' }}>
            <div style={{ padding: 'var(--spacing-3)', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-2)' }}>
                Recommended for the desk
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {caseData.recommendations.length > 0 ? (
                  caseData.recommendations.map((r) => (
                    <div key={`${r.factor}:${r.action}`} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                      · {r.action}
                    </div>
                  ))
                ) : (
                  <Muted>No immediate desk action required from this seat's drivers.</Muted>
                )}
              </div>
            </div>
            <div style={{ padding: 'var(--spacing-3)', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-2)' }}>
                Limitations
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {caseData.limitations.map((l) => (
                  <div key={l} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>· {l}</div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--spacing-3)', flexWrap: 'wrap' }}>
            <Link
              href={`/intel/toolkit?constituency=${encodeURIComponent(caseData.canonical_constituency_id)}`}
              style={{ fontSize: 'var(--text-xs)', color: 'var(--color-amber-500)', textDecoration: 'none' }}
            >
              Open field pack →
            </Link>
            <Link
              href={`/intel/research`}
              style={{ fontSize: 'var(--text-xs)', color: 'var(--color-amber-500)', textDecoration: 'none' }}
            >
              Evidence graph →
            </Link>
          </div>
        </div>
      </div>
    </details>
  );
}

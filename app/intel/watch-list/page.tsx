import type { Metadata } from 'next';
import { IntelModuleGuard } from '@/features/auth/components/IntelModuleGuard';
import { guardIntelModule } from '@/features/auth/intel-server';
import { IntelDenied } from '@/components/intel/IntelDenied';
import { computeScoringOverview } from '@/lib/intel/scoring/overview';
import type { IntelligenceScore, ScoreKey } from '@/lib/intel/scoring/types';

export const metadata: Metadata = {
  title: 'Watch List — Intelligence Workspace',
  robots: { index: false, follow: false },
};

const SCORE_ORDER: ScoreKey[] = ['momentum', 'competitiveness', 'incumbency_risk', 'volatility', 'investigation_priority'];

const SCORE_LABELS: Record<ScoreKey, string> = {
  momentum: 'Momentum',
  competitiveness: 'Competitiveness',
  incumbency_risk: 'Incumbency risk',
  volatility: 'Volatility',
  investigation_priority: 'Investigation priority',
};

const CONFIDENCE_COLOR: Record<string, string> = {
  VERY_HIGH: 'var(--color-brand-400)',
  HIGH: 'var(--color-brand-400)',
  MEDIUM: 'var(--color-amber-400)',
  LOW: 'var(--color-warning)',
  VERY_LOW: 'var(--color-error)',
};

export default async function WatchListPage() {
  const gate = await guardIntelModule('watch-list');
  if (!gate.authorized) return <IntelDenied reason={gate.reason} roleLabel={gate.roleLabel} />;

  const overview = await computeScoringOverview({ by: 'investigation_priority', limit: 25 });

  return (
    <IntelModuleGuard module="watch-list">
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'var(--spacing-8)' }}>
        <div style={{ marginBottom: 'var(--spacing-8)' }}>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>Watch List</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--spacing-1)' }}>
            Constituencies ranked by intelligence scores computed from the frozen evidence layer (dataset {overview.dataSource}). Every score is explainable — expand a row to see the drivers and assumptions behind it.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-8)' }}>
          {SCORE_ORDER.map((key) => {
            const agg = overview.aggregate.byScore[key];
            return (
              <div key={key} style={{ padding: 'var(--spacing-5)', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-default)' }}>
                <div style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text-muted)', fontWeight: 500 }}>{SCORE_LABELS[key]}</div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: 'var(--spacing-1)' }}>{String(Math.round(agg.avg))}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>avg across {String(overview.recordCount)} seats</div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
          {overview.topInvestigation.map((item, i) => (
            <WatchRow key={item.canonical_constituency_id} rank={i + 1} item={item} />
          ))}
        </div>
      </div>
    </IntelModuleGuard>
  );
}

function WatchRow({ rank, item }: { rank: number; item: { constituency_name: string; district: string; region: string; current_mla_party: string; scores: Record<ScoreKey, IntelligenceScore>; overall: number } }) {
  return (
    <details style={{ background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-default)', padding: 'var(--spacing-4)' }}>
      <summary style={{ cursor: 'pointer', listStyle: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)' }}>
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-text-muted)', width: 24, textAlign: 'center' }}>{String(rank)}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>{item.constituency_name}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>{item.district} · {item.region} · {item.current_mla_party}</div>
          </div>
          <ScoreBar label="Investigation" score={item.scores.investigation_priority} />
          <ScoreBar label="Volatility" score={item.scores.volatility} />
          <ScoreBar label="Overall" score={{ value: item.overall, confidence: item.scores.investigation_priority.confidence }} />
        </div>
      </summary>
      <div style={{ marginTop: 'var(--spacing-5)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
        {SCORE_ORDER.map((key) => (
          <ScoreDetail key={key} score={item.scores[key]} />
        ))}
      </div>
    </details>
  );
}

function ScoreBar({ label, score }: { label: string; score: Pick<IntelligenceScore, 'value' | 'confidence'> }) {
  return (
    <div style={{ minWidth: 120 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--spacing-2)', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
        <span>{label}</span>
        <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{String(Math.round(score.value))}</span>
      </div>
      <div style={{ height: 6, background: 'var(--color-bg-primary)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', background: CONFIDENCE_COLOR[score.confidence] ?? 'var(--color-brand-400)', borderRadius: 3, width: `${String(score.value)}%` }} />
      </div>
    </div>
  );
}

function ScoreDetail({ score }: { score: IntelligenceScore }) {
  return (
    <div style={{ padding: 'var(--spacing-4)', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-2)' }}>
        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>{score.label}</span>
        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: CONFIDENCE_COLOR[score.confidence] ?? 'var(--color-text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {String(Math.round(score.value))} · {score.confidence.replace('_', ' ')}
        </span>
      </div>
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', margin: 0, marginBottom: 'var(--spacing-2)' }}>{score.interpretation}</p>
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Why this score: {score.confidenceReason}</div>
      {score.drivers.length > 0 ? (
        <ul style={{ margin: 'var(--spacing-2) 0 0 0', paddingLeft: 'var(--spacing-4)', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)' }}>
          {score.drivers.map((d, i) => (
            <li key={i}><strong>{d.factor}</strong> — {d.evidence}</li>
          ))}
        </ul>
      ) : null}
      {score.dataGaps.length > 0 ? (
        <div style={{ marginTop: 'var(--spacing-2)', fontSize: 'var(--text-xs)', color: 'var(--color-warning)' }}>
          Data gaps: {score.dataGaps.join('; ')}
        </div>
      ) : null}
    </div>
  );
}

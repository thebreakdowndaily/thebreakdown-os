import type { Metadata } from 'next';
import { IntelModuleGuard } from '@/features/auth/components/IntelModuleGuard';
import { guardIntelModule } from '@/features/auth/intel-server';
import { IntelDenied } from '@/components/intel/IntelDenied';
import { computePredictionsOverview } from '@/lib/intel/predictions/overview';
import type { ConstituencyPrediction, PartyProbability } from '@/lib/intel/predictions/types';

export const metadata: Metadata = {
  title: 'Predictions — Intelligence Workspace',
  robots: { index: false, follow: false },
};

const CONFIDENCE_COLOR: Record<string, string> = {
  VERY_HIGH: 'var(--color-brand-400)',
  HIGH: 'var(--color-brand-400)',
  MEDIUM: 'var(--color-amber-400)',
  LOW: 'var(--color-warning)',
  VERY_LOW: 'var(--color-error)',
};

const PARTY_COLORS: Record<string, string> = {
  BJP: '#F97316',
  SP: '#3B82F6',
  BSP: '#2563EB',
  INC: '#22C55E',
  RLD: '#A855F7',
  'AD(S)': '#EF4444',
  NISHAD: '#14B8A6',
  SBSP: '#EAB308',
  OTHER: '#94A3B8',
};

export default async function PredictionsPage() {
  const gate = await guardIntelModule('predictions');
  if (!gate.authorized) return <IntelDenied reason={gate.reason} roleLabel={gate.roleLabel} />;

  const overview = await computePredictionsOverview();

  return (
    <IntelModuleGuard module="predictions">
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'var(--spacing-8)' }}>
        <div style={{ marginBottom: 'var(--spacing-8)' }}>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>Predictions</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--spacing-1)' }}>
            Win probabilities per constituency, computed from recency-weighted vote-share history and adjusted by the intelligence scoring engine. Every number is explainable and derived from the frozen evidence layer (dataset {overview.dataSource}, cutoff {overview.researchCutoff}).
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-8)' }}>
          <StatCard label="Constituencies" value={String(overview.aggregate.count)} sub="all 403 seats projected" />
          <StatCard label="High-confidence projections" value={String(overview.aggregate.highConfidence)} sub={`of ${String(overview.aggregate.count)} seats`} />
          <StatCard label="Avg winner probability" value={`${overview.aggregate.avgWinnerProbability.toFixed(0)}%`} sub="across all seats" />
          <StatCard label="Most sensitive" value={overview.aggregate.sensitiveSeats[0]?.constituency_name ?? 'n/a'} sub="score ±10 moves it most" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-6)', marginBottom: 'var(--spacing-8)' }}>
          <IntelPanel title="Safest projections">
            {overview.topCertain.map((p) => (
              <ProjectionLine key={p.canonical_constituency_id} prediction={p} />
            ))}
          </IntelPanel>
          <IntelPanel title="Tossups (most open seats)">
            {overview.topTossups.map((p) => (
              <ProjectionLine key={p.canonical_constituency_id} prediction={p} />
            ))}
          </IntelPanel>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
          {overview.all.map((p, i) => (
            <PredictionRow key={p.canonical_constituency_id} rank={i + 1} prediction={p} />
          ))}
        </div>
      </div>
    </IntelModuleGuard>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{ padding: 'var(--spacing-5)', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-default)' }}>
      <div style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text-muted)', fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: 'var(--spacing-1)', wordBreak: 'break-word' }}>{value}</div>
      {sub ? <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>{sub}</div> : null}
    </div>
  );
}

function IntelPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: 'var(--spacing-5)', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-default)' }}>
      <h2 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-4)' }}>{title}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>{children}</div>
    </div>
  );
}

function ProjectionLine({ prediction }: { prediction: ConstituencyPrediction }) {
  return (
    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--spacing-2)', marginBottom: 4 }}>
        <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>{prediction.constituency_name}</span>
        <span style={{ fontWeight: 700 }}>{prediction.predicted_winner} · {String(prediction.winner_probability)}%</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--spacing-2)', color: 'var(--color-text-muted)' }}>
        <span>CI {String(prediction.winner_ci[0])}–{String(prediction.winner_ci[1])}%</span>
        <span style={{ color: CONFIDENCE_COLOR[prediction.confidence] ?? 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{prediction.confidence.replace('_', ' ')}</span>
      </div>
    </div>
  );
}

function PredictionRow({ rank, prediction }: { rank: number; prediction: ConstituencyPrediction }) {
  const sorted = [...prediction.probabilities].sort((a, b) => b.probability - a.probability);
  return (
    <details style={{ background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-default)', padding: 'var(--spacing-4)' }}>
      <summary style={{ cursor: 'pointer', listStyle: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)' }}>
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-text-muted)', width: 24, textAlign: 'center' }}>{String(rank)}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 'var(--spacing-2)' }}>
              <div>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>{prediction.constituency_name}</span>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginLeft: 'var(--spacing-2)' }}>{prediction.district}</span>
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                Winner: <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{prediction.predicted_winner}</span> {String(prediction.winner_probability)}% <span style={{ color: 'var(--color-text-muted)' }}>(CI {String(prediction.winner_ci[0])}–{String(prediction.winner_ci[1])}%)</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 'var(--spacing-2)' }}>
              {sorted.map((p) => (
                <PartyBar key={p.party} prob={p} />
              ))}
            </div>
          </div>
        </div>
      </summary>
      <div style={{ marginTop: 'var(--spacing-4)', padding: 'var(--spacing-4)', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-4)' }}>
          <Detail label="Why this winner?">
            <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{prediction.whyLeading}</p>
          </Detail>
          <Detail label="Why not the challenger?">
            <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{prediction.whyNot}</p>
          </Detail>
          <Detail label="What could change it?">
            <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{prediction.whatCouldChangeIt}</p>
          </Detail>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
          <Detail label={`Drivers (${String(prediction.drivers.length)})`}>
            <ul style={{ margin: 0, paddingLeft: 'var(--spacing-4)', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)' }}>
              {prediction.drivers.length > 0 ? prediction.drivers.map((d, i) => (
                <li key={i}><strong>{d.factor}</strong> — {d.evidence}</li>
              )) : <li>Base strength only; no score adjustments applied.</li>}
            </ul>
          </Detail>
          <Detail label="Sensitivity (score ±10)">
            <ul style={{ margin: 0, paddingLeft: 'var(--spacing-4)', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)' }}>
              {prediction.sensitivity.map((s, i) => (
                <li key={i}><strong>{s.factor}</strong> — {s.effect}</li>
              ))}
            </ul>
          </Detail>
        </div>
        <div style={{ marginTop: 'var(--spacing-3)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          Confidence: <span style={{ color: CONFIDENCE_COLOR[prediction.confidence] ?? 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{prediction.confidence.replace('_', ' ')}</span> — {prediction.confidenceReason}
        </div>
        {prediction.dataGaps.length > 0 ? (
          <div style={{ marginTop: 'var(--spacing-2)', fontSize: 'var(--text-xs)', color: 'var(--color-warning)' }}>Data gaps: {prediction.dataGaps.join('; ')}</div>
        ) : null}
      </div>
    </details>
  );
}

function PartyBar({ prob }: { prob: PartyProbability }) {
  const color = PARTY_COLORS[prob.party] ?? PARTY_COLORS['OTHER'];
  const winPct = Math.round(prob.probability * 100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', width: 44, flexShrink: 0, textAlign: 'right' }}>{prob.party}</span>
      <div style={{ flex: 1, height: 8, background: 'var(--color-bg-primary)', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
        <div style={{ height: '100%', background: color, borderRadius: 4, width: `${String(winPct)}%` }} />
        <div style={{ position: 'absolute', left: `${String(Math.round(prob.ciLow * 100))}%`, right: `${String(100 - Math.round(prob.ciHigh * 100))}%`, top: -2, height: 12, borderLeft: '1px dashed var(--color-text-muted)', borderRight: '1px dashed var(--color-text-muted)', opacity: 0.6 }} />
      </div>
      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-primary)', width: 34, flexShrink: 0 }}>{winPct}%</span>
    </div>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-1)' }}>{label}</div>
      {children}
    </div>
  );
}

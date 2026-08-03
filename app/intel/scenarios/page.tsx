import type { Metadata } from 'next';
import { IntelModuleGuard } from '@/features/auth/components/IntelModuleGuard';
import { guardIntelModule } from '@/features/auth/intel-server';
import { IntelDenied } from '@/components/intel/IntelDenied';
import { computeScenariosOverview } from '@/lib/intel/scenarios/overview';
import type { ScenarioResult, SeatOutcome } from '@/lib/intel/scenarios/types';

export const metadata: Metadata = {
  title: 'Scenarios — Intelligence Workspace',
  robots: { index: false, follow: false },
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

const PARTY_LABELS: Record<string, string> = {
  BJP: 'BJP',
  SP: 'SP',
  BSP: 'BSP',
  INC: 'INC',
  RLD: 'RLD',
  'AD(S)': 'AD(S)',
  NISHAD: 'NISHAD',
  SBSP: 'SBSP',
  OTHER: 'Others',
};

export default async function ScenariosPage() {
  const gate = await guardIntelModule('scenarios');
  if (!gate.authorized) return <IntelDenied reason={gate.reason} roleLabel={gate.roleLabel} />;

  const overview = await computeScenariosOverview();
  const baseline = overview.scenarios[0];

  return (
    <IntelModuleGuard module="scenarios">
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'var(--spacing-8)' }}>
        <div style={{ marginBottom: 'var(--spacing-8)' }}>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>Scenario Simulator</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--spacing-1)' }}>
            What-if electoral swings applied to the baseline projections (dataset {overview.dataSource}, cutoff {overview.researchCutoff}). Each scenario perturbs win probabilities, recomputes every seat, and shows how the assembly changes. Majority is {String(overview.majority)} of {String(baseline.totalSeats)}.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
          {overview.scenarios.map((scenario) => (
            <ScenarioBlock key={scenario.id} scenario={scenario} baseline={baseline} />
          ))}
        </div>
      </div>
    </IntelModuleGuard>
  );
}

function ScenarioBlock({ scenario, baseline }: { scenario: ScenarioResult; baseline?: ScenarioResult }) {
  const isBaseline = scenario.id === 'baseline';
  const partyRows = Object.entries(scenario.seatShare)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  return (
    <details
      open={isBaseline || scenario.flipCount > 100}
      style={{ background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-default)', padding: 'var(--spacing-5)' }}
    >
      <summary style={{ cursor: 'pointer', listStyle: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--spacing-4)', flexWrap: 'wrap' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--color-text-primary)' }}>{scenario.label}</span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{scenario.type}</span>
            </div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', margin: 'var(--spacing-1) 0 0 0' }}>{scenario.description}</p>
          </div>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
            {isBaseline ? <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>Reference</span> : (
              <><span style={{ color: scenario.flipCount > 0 ? 'var(--color-amber-400)' : 'var(--color-text-muted)', fontWeight: 700 }}>{String(scenario.flipCount)} flips</span> vs baseline</>
            )}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${String(Math.max(3, partyRows.length))}, 1fr)`, gap: 'var(--spacing-3)', marginTop: 'var(--spacing-4)' }}>
          {partyRows.map(([party, seats]) => {
            const baseSeats = baseline?.seatShare[party] ?? seats;
            const diff = isBaseline ? 0 : seats - baseSeats;
            const reachesMajority = seats >= scenario.majority;
            return (
              <div key={party} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: PARTY_COLORS[party] ?? 'var(--color-text-secondary)' }}>{PARTY_LABELS[party] ?? party}</div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: reachesMajority ? 'var(--color-brand-400)' : 'var(--color-text-primary)' }}>
                  {String(seats)}
                  {reachesMajority ? ' ✓' : ''}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: diff > 0 ? 'var(--color-brand-400)' : diff < 0 ? 'var(--color-error)' : 'var(--color-text-muted)' }}>
                  {isBaseline ? 'baseline' : `${diff > 0 ? '+' : ''}${String(diff)}`}
                </div>
              </div>
            );
          })}
        </div>
      </summary>

      <div style={{ marginTop: 'var(--spacing-5)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
        <ScenarioDetail label="Rationale">
          <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{scenario.rationale}</p>
        </ScenarioDetail>
        <ScenarioDetail label="Coalition arithmetic">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)' }}>
            {scenario.coalitions.map((c) => (
              <div key={c.coalitionId} style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--spacing-2)', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                <span>{c.label}</span>
                <span style={{ fontWeight: 700, color: c.seats >= scenario.majority ? 'var(--color-brand-400)' : 'var(--color-text-primary)' }}>{String(c.seats)} seats</span>
              </div>
            ))}
          </div>
        </ScenarioDetail>
      </div>

      {!isBaseline && scenario.flips.length > 0 ? (
        <div style={{ marginTop: 'var(--spacing-5)' }}>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-2)' }}>
            Seats that flip ({String(scenario.flips.length)})
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-2)' }}>
            {scenario.flips.slice(0, 24).map((flip) => (
              <FlipLine key={flip.canonical_constituency_id} flip={flip} />
            ))}
          </div>
        </div>
      ) : null}
    </details>
  );
}

function FlipLine({ flip }: { flip: SeatOutcome }) {
  return (
    <div style={{ fontSize: 'var(--text-xs)', padding: 'var(--spacing-2)', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
      <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{flip.constituency_name}</div>
      <div style={{ color: 'var(--color-text-secondary)', marginTop: 2 }}>
        <span style={{ color: PARTY_COLORS[flip.baselineWinner] ?? 'var(--color-text-secondary)' }}>{flip.baselineWinner}</span>
        {' → '}
        <span style={{ color: PARTY_COLORS[flip.scenarioWinner] ?? 'var(--color-text-secondary)', fontWeight: 700 }}>{flip.scenarioWinner}</span>
      </div>
      <div style={{ color: 'var(--color-text-muted)', marginTop: 2 }}>{flip.district} · {flip.region}</div>
    </div>
  );
}

function ScenarioDetail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: 'var(--spacing-4)', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
      <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-1)' }}>{label}</div>
      {children}
    </div>
  );
}

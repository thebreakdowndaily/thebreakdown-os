import type { Metadata } from 'next';
import { IntelModuleGuard } from '@/features/auth/components/IntelModuleGuard';
import { guardIntelModule } from '@/features/auth/intel-server';
import { IntelDenied } from '@/components/intel/IntelDenied';
import { computeEvidenceOverview } from '@/lib/intel/evidence/overview';
import { EVIDENCE_CATEGORY_LABELS } from '@/lib/intel/evidence/registry';
import { predictRecord } from '@/lib/intel/predictions';
import { getCachedData } from '@/lib/up403/loader';
import { linkPredictionToEvidence, buildEvidenceGraph } from '@/lib/intel/evidence';
import { toConstituencyIntelligence } from '@/lib/intel/scoring';
import type { ConstituencyEvidence } from '@/lib/intel/evidence/types';
import type { ConfidenceTier } from '@/lib/intel/scoring/types';

export const metadata: Metadata = {
  title: 'Evidence & Research — Intelligence Workspace',
  robots: { index: false, follow: false },
};

const CONFIDENCE_COLOR: Record<string, string> = {
  VERY_HIGH: 'var(--color-brand-400)',
  HIGH: 'var(--color-brand-400)',
  MEDIUM: 'var(--color-amber-400)',
  LOW: 'var(--color-warning)',
  VERY_LOW: 'var(--color-error)',
};

export default async function ResearchPage() {
  const gate = await guardIntelModule('research');
  if (!gate.authorized) return <IntelDenied reason={gate.reason} roleLabel={gate.roleLabel} />;

  const overview = await computeEvidenceOverview();

  const record = getCachedData()[0];
  const prediction = predictRecord(record);
  const intel = toConstituencyIntelligence(record);
  const evidence = buildEvidenceGraph(record);
  const linkage = linkPredictionToEvidence(prediction, intel, evidence);
  const supportedLinks = linkage.filter((l) => l.supporting.length > 0);
  const totalSupport = supportedLinks.reduce((s, l) => s + l.supporting.length, 0);

  return (
    <IntelModuleGuard module="research">
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'var(--spacing-8)' }}>
        <div style={{ marginBottom: 'var(--spacing-8)' }}>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>Evidence & Research KB</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--spacing-1)' }}>
            A per-constituency evidence graph, not a document library. Every field in the frozen dataset is registered as an evidence node with provenance and confidence. Coverage and debt are computed from what actually exists — no hallucinated values (dataset {overview.dataSource}, cutoff {overview.researchCutoff}).
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-8)' }}>
          <StatCard label="Constituencies profiled" value={String(overview.aggregate.count)} sub="evidence graphs built" />
          <StatCard label="Avg evidence coverage" value={`${overview.aggregate.avgCoverage.toFixed(0)}%`} sub="fields present of registered set" />
          <StatCard label="Total evidence debt" value={String(overview.aggregate.totalDebt)} sub="missing fields across all seats" />
          <StatCard label="Model confidence" value={topConfidence(overview.aggregate.confidenceDistribution)} sub="dominant tier across seats" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-6)', marginBottom: 'var(--spacing-8)' }}>
          <IntelPanel title="Evidence coverage by category">
            {(Object.keys(EVIDENCE_CATEGORY_LABELS) as Array<keyof typeof overview.aggregate.byCategory>)
              .map((cat) => overview.aggregate.byCategory[cat])
              .filter((c) => c.total > 0)
              .map((c) => (
                <CoverageBar key={c.label} label={c.label} pct={c.pct} available={c.available} total={c.total} />
              ))}
          </IntelPanel>
          <IntelPanel title="How the evidence graph works">
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
              <p style={{ margin: 0 }}>
                <strong style={{ color: 'var(--color-text-primary)' }}>Official Election Data →</strong> ECI results 2012 / 2017 / 2022 (winner, share, margin, turnout, candidates).
              </p>
              <p style={{ margin: 0 }}>
                <strong style={{ color: 'var(--color-text-primary)' }}>Historical Results →</strong> seat trajectory, party persistence, volatility indices.
              </p>
              <p style={{ margin: 0 }}>
                <strong style={{ color: 'var(--color-text-primary)' }}>Political DNA →</strong> algorithmic classification with reasoning and confidence.
              </p>
              <p style={{ margin: 0 }}>
                <strong style={{ color: 'var(--color-text-primary)' }}>Government Reports →</strong> issue count, environmental and disaster summaries, linked flagship projects.
              </p>
              <p style={{ margin: 0 }}>
                <strong style={{ color: 'var(--color-text-primary)' }}>Development Indicators →</strong> demographics, economy, infrastructure — <em>not available at constituency level</em> in the frozen dataset (DATA-08/09). These register as evidence debt, not as zeros.
              </p>
              <p style={{ margin: 0 }}>
                <strong style={{ color: 'var(--color-text-primary)' }}>Research Sources →</strong> provenance of every field: original authority, source dataset, quality.
              </p>
              <p style={{ margin: 0 }}>
                <strong style={{ color: 'var(--color-text-primary)' }}>Evidence Debt →</strong> every missing field is a registered gap, not an assumed value.
              </p>
            </div>
          </IntelPanel>
        </div>

        <div style={{ marginBottom: 'var(--spacing-8)' }}>
          <IntelPanel title={`Prediction evidence linkage — ${record.constituency_name} (${record.district})`}>
            <p style={{ margin: 0, marginBottom: 'var(--spacing-3)', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
              Every prediction driver resolves to evidence nodes. This seat: {String(supportedLinks.length)} of {String(linkage.length)} drivers backed by {String(totalSupport)} evidence items.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-3)' }}>
              {supportedLinks.map((link) => (
                <div key={link.factor} style={{ padding: 'var(--spacing-3)', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
                  <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-primary)' }}>{link.factor}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>{link.sourceField}</div>
                  <ul style={{ margin: 'var(--spacing-2) 0 0', paddingLeft: 'var(--spacing-4)', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                    {link.supporting.slice(0, 3).map((item) => (
                      <li key={item.id}>{item.label}: <strong>{item.value}</strong></li>
                    ))}
                    {link.supporting.length > 3 ? <li>+{String(link.supporting.length - 3)} more</li> : null}
                  </ul>
                </div>
              ))}
            </div>
          </IntelPanel>
        </div>

        <IntelPanel title="Most evidence-gapped constituencies">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
            {overview.aggregate.mostGapped.map((ev) => (
              <EvidenceRow key={ev.canonical_constituency_id} ev={ev} />
            ))}
          </div>
        </IntelPanel>
      </div>
    </IntelModuleGuard>
  );
}

function topConfidence(distribution: Record<ConfidenceTier, number>): string {
  return (Object.entries(distribution).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'LOW').replace('_', ' ');
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
      {children}
    </div>
  );
}

function CoverageBar({ label, pct, available, total }: { label: string; pct: number; available: number; total: number }) {
  return (
    <div style={{ marginBottom: 'var(--spacing-3)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', marginBottom: 4 }}>
        <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>{label}</span>
        <span style={{ color: 'var(--color-text-muted)' }}>{available}/{total} · {String(pct)}%</span>
      </div>
      <div style={{ height: 8, background: 'var(--color-bg-primary)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${String(pct)}%`, background: pct >= 80 ? 'var(--color-brand-400)' : pct >= 40 ? 'var(--color-amber-400)' : 'var(--color-warning)', borderRadius: 4 }} />
      </div>
    </div>
  );
}

function EvidenceRow({ ev }: { ev: ConstituencyEvidence }) {
  return (
    <details style={{ background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)', padding: 'var(--spacing-3)' }}>
      <summary style={{ cursor: 'pointer', listStyle: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>{ev.constituency_name}</span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{ev.district} · {ev.region}</span>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>Coverage <strong>{String(ev.coverage)}%</strong></span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-warning)' }}>Debt <strong>{String(ev.debt)}</strong></span>
          <span style={{ fontSize: 'var(--text-xs)', color: CONFIDENCE_COLOR[ev.confidence] ?? 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{ev.confidence.replace('_', ' ')}</span>
        </div>
      </summary>
      <div style={{ marginTop: 'var(--spacing-3)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-3)' }}>
        <div>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-2)' }}>Evidence nodes ({String(ev.items.length)})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {ev.items.filter((i) => i.status === 'available').map((item) => (
              <div key={item.id} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', display: 'flex', justifyContent: 'space-between', gap: 'var(--spacing-2)' }}>
                <span>{item.label}</span>
                <span style={{ color: 'var(--color-text-primary)', fontWeight: 600, textAlign: 'right' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-warning)', marginBottom: 'var(--spacing-2)' }}>Registered gaps ({String(ev.gaps.length)})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {ev.gaps.map((g) => (
              <div key={g.id} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{g.label}</div>
            ))}
          </div>
        </div>
      </div>
    </details>
  );
}

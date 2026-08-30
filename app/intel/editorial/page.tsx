import type { Metadata } from 'next';
import Link from 'next/link';
import { IntelModuleGuard } from '@/features/auth/components/IntelModuleGuard';
import { guardIntelModule } from '@/features/auth/intel-server';
import { IntelDenied } from '@/components/intel/IntelDenied';
import { computeEditorialOverview } from '@/lib/intel/editorial/overview';
import { InvestigationCard } from '@/components/intel/editorial/InvestigationCard';

// Governing document: docs/intelligence/roadmap.md (Part 14 — Editorial Intelligence)
// + docs/intelligence/tbios-master-prompt-v1.md (Editorial Intelligence)

export const metadata: Metadata = {
  title: 'Editorial Intelligence — Intelligence Workspace',
  robots: { index: false, follow: false },
};

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

export default async function EditorialPage() {
  const gate = await guardIntelModule('editorial');
  if (!gate.authorized) return <IntelDenied reason={gate.reason} roleLabel={gate.roleLabel} />;

  const overview = await computeEditorialOverview();

  return (
    <IntelModuleGuard module="editorial">
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'var(--spacing-8)' }}>
        <div style={{ marginBottom: 'var(--spacing-8)' }}>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>Editorial Intelligence</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--spacing-1)' }}>
            The Investigation Priority Index (IPI) ranks all {String(overview.total)} constituencies by investigative demand — a weighted factor surface over the shipped engines
            (structural priority, prediction instability, scenario exposure, evidence debt, verification pressure). Every seat states why it ranks where it does, and what it cannot tell you
            (dataset {overview.dataSource}, cutoff {overview.researchCutoff}).
          </p>
          <div style={{ marginTop: 'var(--spacing-3)' }}>
            <Link
              href="/intel/editorial/calendar"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid var(--color-border-default)',
                background: 'var(--color-bg-primary)',
                color: 'var(--color-text-primary)',
                fontSize: '12px',
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              📅 Editorial Calendar — Weekly Story Plan
            </Link>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-8)' }}>
          <StatCard label="Seats ranked" value={String(overview.total)} sub="full investigation pipeline" />
          <StatCard label="Top IPI" value={String(overview.topOverall)} sub="highest investigation priority" />
          <StatCard label="Factor drivers" value="5" sub="structural · instability · scenario · evidence · verification" />
          <StatCard label="Data honesty" value="Gaps only" sub="no population / development values invented" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-6)', marginBottom: 'var(--spacing-8)' }}>
          <IntelPanel title="Factor composition of the index">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
              {overview.factorAggregates.map((f) => (
                <div key={f.key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', marginBottom: 4 }}>
                    <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>{f.label} · weight {Math.round(f.weight * 100)}%</span>
                    <span style={{ color: 'var(--color-text-muted)' }}>avg {String(f.avg)} · {String(f.min)}–{String(f.max)}</span>
                  </div>
                  <div style={{ height: 8, background: 'var(--color-bg-primary)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${String(f.avg)}%`, background: f.avg >= 70 ? 'var(--color-error)' : f.avg >= 40 ? 'var(--color-amber-400)' : 'var(--color-brand-400)', borderRadius: 4 }} />
                  </div>
                </div>
              ))}
            </div>
          </IntelPanel>
          <IntelPanel title="Regional spread of the pipeline">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
              {Object.entries(overview.byRegion).map(([region, count]) => (
                <div key={region} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                  <span>{region}</span>
                  <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>{String(count)} seats</span>
                </div>
              ))}
            </div>
          </IntelPanel>
        </div>

        <IntelPanel title={`Investigation pipeline — ranked by IPI`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
            {overview.ranked.map((caseData, i) => (
              <InvestigationCard key={caseData.canonical_constituency_id} caseData={caseData} rank={i + 1} />
            ))}
          </div>
        </IntelPanel>

        <div style={{ marginTop: 'var(--spacing-8)' }}>
          <IntelPanel title="What this index cannot tell you">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
              {overview.limitations.map((l) => (
                <div key={l} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>· {l}</div>
              ))}
            </div>
          </IntelPanel>
        </div>
      </div>
    </IntelModuleGuard>
  );
}

import type { Metadata } from 'next';
import { IntelModuleGuard } from '@/features/auth/components/IntelModuleGuard';
import { guardIntelModule } from '@/features/auth/intel-server';
import { IntelDenied } from '@/components/intel/IntelDenied';
import { computeToolkitOverview, getConstituencyToolkit } from '@/lib/intel/toolkit/overview';
import { ToolkitWorkspace } from '@/components/intel/toolkit/ToolkitWorkspace';
import { ConstituencyPicker } from '@/components/intel/toolkit/ConstituencyPicker';

export const metadata: Metadata = {
  title: 'Journalist Toolkit — Intelligence Workspace',
  robots: { index: false, follow: false },
};

interface SearchParams {
  constituency?: string;
}

export default async function ToolkitPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const gate = await guardIntelModule('toolkit');
  if (!gate.authorized) return <IntelDenied reason={gate.reason} roleLabel={gate.roleLabel} />;

  const { constituency } = await searchParams;
  const overview = await computeToolkitOverview();
  const toolkit = constituency ? await getConstituencyToolkit(constituency) : null;

  return (
    <IntelModuleGuard module="toolkit">
      {toolkit ? (
        <ToolkitWorkspace toolkit={toolkit} />
      ) : (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'var(--spacing-8)' }}>
          <div style={{ marginBottom: 'var(--spacing-8)' }}>
            <div style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-amber-500)', fontWeight: 600 }}>Journalist Toolkit</div>
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: 'var(--spacing-1)' }}>
              {constituency ? 'Constituency not found' : 'Reporter Workspace'}
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--spacing-1)', maxWidth: 640, lineHeight: 1.6 }}>
              {constituency
                ? `No constituency registered with ID "${constituency}". Pick one from the list below.`
                : 'Every UP403 constituency becomes a newsroom workspace: interview briefs, reporting checklist, story angles, verification workspace, field pack, evidence explorer, research summary, and scenario analysis — all generated as a presentation layer over the evidence graph, scoring, prediction, and scenario engines. No new data, no hallucinated facts.'}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-6)' }}>
            <StatCard label="Constituencies" value={String(overview.total)} sub="reporter workspaces available" />
            <StatCard label="Dataset" value={overview.dataSource} sub={`research cutoff ${overview.researchCutoff}`} />
            <StatCard label="Workspace coverage" value="403 / 403" sub="every seat has a full toolkit" />
            <StatCard label="Evidence source" value="Frozen v1.1.0" sub="gaps reported as gaps, never zeros" />
          </div>

          <div style={{ padding: 'var(--spacing-5)', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-default)' }}>
            <h2 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-3)' }}>Select a constituency</h2>
            <ConstituencyPicker entries={overview.entries} />
          </div>
        </div>
      )}
    </IntelModuleGuard>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{ padding: 'var(--spacing-5)', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-default)' }}>
      <div style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text-muted)', fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: 'var(--spacing-1)', wordBreak: 'break-word' }}>{value}</div>
      {sub ? <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>{sub}</div> : null}
    </div>
  );
}

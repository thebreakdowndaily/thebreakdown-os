import type { Metadata } from 'next';
import { IntelModuleGuard } from '@/features/auth/components/IntelModuleGuard';
import { guardIntelModule } from '@/features/auth/intel-server';
import { IntelDenied } from '@/components/intel/IntelDenied';
import { researchIntelligenceCore } from '@/services/intelligence/research';
import { researchSourceRegistry } from '@/services/intelligence/research/source-registry';
import type { ResearchSourceHealthStatus } from '@/types/research-intelligence';
import { ensureResearchRuntime } from '@/lib/intelligence/research-bootstrap';
import { createResearchProjectAction, runPipelineAction } from './actions';
import type { ResearchProject } from '@/types/research-intelligence';

export const metadata: Metadata = {
  title: 'Research Intelligence — Intelligence Workspace',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function ResearchIntelligencePage() {
  const gate = await guardIntelModule('research');
  if (!gate.authorized) return <IntelDenied reason={gate.reason} roleLabel={gate.roleLabel} />;

  await ensureResearchRuntime();
  const projects = researchIntelligenceCore.getProjects();

  return (
    <IntelModuleGuard module="research">
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'var(--spacing-8)' }}>
        <div style={{ marginBottom: 'var(--spacing-8)' }}>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>Research Intelligence</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--spacing-1)' }}>
            Topic expansion to story brief. Every claim, source, and contradiction carries full provenance through the Research Pipeline
            (governing standard: docs/research/RESEARCH_INTELLIGENCE_OPERATING_STANDARD.md).
          </p>
        </div>

        <div style={{ marginBottom: 'var(--spacing-8)' }}>
          <NewProjectForm />
        </div>

        <SourceRegistryStatus />

        <h2 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-4)' }}>
          Projects ({String(projects.length)})
        </h2>

        {projects.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>No research projects yet. Create one above.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-4)' }}>
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </IntelModuleGuard>
  );
}

function NewProjectForm() {
  return (
    <form action={createResearchProjectAction}>
      <div style={{ padding: 'var(--spacing-5)', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-default)' }}>
        <h2 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-3)' }}>New research project</h2>
        <div style={{ display: 'grid', gap: 'var(--spacing-3)' }}>
          <label style={labelStyle}>
            Title
            <input name="title" required placeholder="e.g. India–US trade tariffs" style={inputStyle} />
          </label>
          <label style={labelStyle}>
            Research question
            <input name="researchQuestion" required placeholder="What is the current status of India–US trade tariff negotiations?" style={inputStyle} />
          </label>
          <label style={labelStyle}>
            Description
            <textarea name="description" rows={2} placeholder="Optional context, focus areas, and constraints." style={{ ...inputStyle, resize: 'vertical' }} />
          </label>
          <div>
            <button type="submit" style={buttonStyle}>Create project</button>
          </div>
        </div>
      </div>
    </form>
  );
}

function SourceRegistryStatus() {
  const snapshot = researchSourceRegistry.snapshot();
  const eligible = snapshot.sources.filter((s) => s.status === 'APPROVED' || s.status === 'ACTIVE');
  return (
    <div style={{ padding: 'var(--spacing-5)', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-default)', marginBottom: 'var(--spacing-8)' }}>
      <h2 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-3)' }}>
        Research Source Registry
      </h2>
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', margin: '0 0 var(--spacing-3)', lineHeight: 1.6 }}>
        Approved discovery sources. Only APPROVED/ACTIVE sources feed production discovery; the fixture adapter never participates.
        (Governing document: docs/research/source-governance.md)
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-3)' }}>
        <MiniStat label="Eligible" value={String(snapshot.eligible)} />
        <MiniStat label="Approved" value={String(snapshot.byState.APPROVED)} />
        <MiniStat label="Proposed" value={String(snapshot.byState.PROPOSED)} />
        <MiniStat label="Retired" value={String(snapshot.byState.RETIRED)} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-2)' }}>
        {eligible.map((s) => (
          <div key={s.id} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
            <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>{s.name}</span>
            <span style={{ color: 'var(--color-text-muted)' }}> · {s.publisher} · {s.status}</span>
            <span style={{ color: healthColor(s.healthStatus) }}> · {s.healthStatus}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function healthColor(status: ResearchSourceHealthStatus | undefined): string {
  switch (status) {
    case 'HEALTHY': return 'var(--color-brand-400)';
    case 'DEGRADED': return 'var(--color-amber-400)';
    case 'FAILING': return 'var(--color-error)';
    default: return 'var(--color-text-muted)';
  }
}

function ProjectCard({ project }: { project: ResearchProject }) {
  const overview = researchIntelligenceCore.getProjectOverview(project.id);
  return (
    <div style={{ padding: 'var(--spacing-5)', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-default)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-3)' }}>
        <div style={{ flex: 1 }}>
          <a href={`/intel/research/rie/${project.id}`} style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-brand-400)', textDecoration: 'none' }}>
            {project.title}
          </a>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>
            {project.status} · P{project.priority} · {project.id}
          </div>
        </div>
        <form action={runPipelineAction}>
          <input type="hidden" name="projectId" value={project.id} />
          <button type="submit" style={buttonStyle}>
            Run
          </button>
        </form>
      </div>
      <p style={{ margin: 'var(--spacing-3) 0 0', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
        {project.researchQuestion}
      </p>
      {overview ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--spacing-2)', marginTop: 'var(--spacing-4)' }}>
          <MiniStat label="Sources" value={String(overview.sourceCount)} />
          <MiniStat label="Claims" value={String(overview.verifiedClaims + overview.unverifiedClaims)} />
          <MiniStat label="Contradictions" value={String(overview.contradictions)} />
          <MiniStat label="Gaps" value={String(overview.openResearchGaps)} />
        </div>
      ) : null}
      {overview?.latestRun ? (
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-3)' }}>
          Last run: {overview.latestRun.completedAt ? new Date(overview.latestRun.completedAt).toLocaleString() : 'in progress'} · {overview.latestRun.status}
        </div>
      ) : null}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-primary)', fontWeight: 600 }}>{value}</div>
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{label}</div>
    </div>
  );
}

const buttonStyle: React.CSSProperties = {
  padding: 'var(--spacing-2) var(--spacing-3)',
  background: 'var(--color-brand-400)',
  color: 'var(--color-bg-primary)',
  border: 'none',
  borderRadius: 'var(--radius-sm)',
  fontSize: 'var(--text-xs)',
  fontWeight: 600,
  cursor: 'pointer',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  marginTop: 'var(--spacing-1)',
  padding: 'var(--spacing-2)',
  background: 'var(--color-bg-primary)',
  border: '1px solid var(--color-border-default)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--color-text-primary)',
  fontSize: 'var(--text-sm)',
};

const labelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  fontSize: 'var(--text-xs)',
  color: 'var(--color-text-secondary)',
  fontWeight: 500,
};

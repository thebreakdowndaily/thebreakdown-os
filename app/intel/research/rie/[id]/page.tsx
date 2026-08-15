import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { IntelModuleGuard } from '@/features/auth/components/IntelModuleGuard';
import { guardIntelModule } from '@/features/auth/intel-server';
import { IntelDenied } from '@/components/intel/IntelDenied';
import { researchIntelligenceCore } from '@/services/intelligence/research';
import { ensureResearchRuntime } from '@/lib/intelligence/research-bootstrap';
import { generateStoryBriefAction, runPipelineAction } from '../actions';
import type {
  ResearchProject,
  ResearchSource,
  ResearchClaim,
  ResearchContradiction,
  ResearchGap,
  ResearchChangeEvent,
} from '@/types/research-intelligence';

export const metadata: Metadata = {
  title: 'Research Project — Intelligence Workspace',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

const CLAIM_COLOR: Record<string, string> = {
  PRIMARY_SOURCE_CONFIRMED: 'var(--color-brand-400)',
  CORROBORATED: 'var(--color-brand-400)',
  PARTIALLY_CORROBORATED: 'var(--color-amber-400)',
  SIGNAL_ONLY: 'var(--color-text-muted)',
  UNVERIFIED: 'var(--color-text-muted)',
  FALSE_OR_MISLEADING: 'var(--color-error)',
  DISPUTED: 'var(--color-warning)',
};

export default async function ResearchProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const gate = await guardIntelModule('research');
  if (!gate.authorized) return <IntelDenied reason={gate.reason} roleLabel={gate.roleLabel} />;

  const { id } = await params;
  await ensureResearchRuntime();
  const project = researchIntelligenceCore.getProject(id);
  if (!project) notFound();

  const overview = researchIntelligenceCore.getProjectOverview(id);
  const sources = researchIntelligenceCore.getSources(id);
  const claims = researchIntelligenceCore.getClaims(id);
  const contradictions = researchIntelligenceCore.getContradictions(id);
  const gaps = researchIntelligenceCore.getGaps(id);
  const events = researchIntelligenceCore.getChangeEvents(id);
  const briefs = researchIntelligenceCore.getStoryBriefs(id);
  const latestBrief = briefs[briefs.length - 1];

  const claimCounts = claims.reduce<Record<string, number>>((acc, c) => {
    acc[c.verificationState] = (acc[c.verificationState] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <IntelModuleGuard module="research">
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'var(--spacing-8)' }}>
        <ProjectHeader project={project} overviewCount={overview?.latestRun ? `${overview.latestRun.status}` : 'never run'} />
        <div style={{ display: 'flex', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-6)' }}>
          <form action={runPipelineAction}>
            <input type="hidden" name="projectId" value={project.id} />
            <button type="submit" style={actionButton}>Run pipeline</button>
          </form>
          <form action={generateStoryBriefAction}>
            <input type="hidden" name="projectId" value={project.id} />
            <button type="submit" style={actionButton}>Generate story brief</button>
          </form>
          <a href={`/api/v2/research/projects/${project.id}/pack?format=markdown`} style={{ ...actionButton, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
            Download research pack
          </a>
        </div>

        <StatRow overview={overview} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-6)', marginBottom: 'var(--spacing-6)' }}>
          <RecentEvents events={events.slice(-8).reverse()} />
          <ClaimSummary counts={claimCounts} total={claims.length} />
        </div>

        <div style={{ marginBottom: 'var(--spacing-6)' }}>
          <Section title={`Sources (${String(sources.length)})`}>
            <SourceList sources={sources} />
          </Section>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-6)', marginBottom: 'var(--spacing-6)' }}>
          <ContradictionsSection contradictions={contradictions} />
          <GapsSection gaps={gaps} />
        </div>

        <div style={{ marginBottom: 'var(--spacing-6)' }}>
          <Section title={`Claims (${String(claims.length)})`}>
            <ClaimList claims={claims.slice(0, 12)} />
            {claims.length > 12 ? <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-3)' }}>+{String(claims.length - 12)} more claims — full list in the research pack.</p> : null}
          </Section>
        </div>

        {latestBrief ? <Section title={`Latest story brief (${new Date(latestBrief.generatedAt).toLocaleString()})`}>
          <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>{latestBrief.title}</h3>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>{latestBrief.summary}</p>
        </Section> : null}
      </div>
    </IntelModuleGuard>
  );
}

function ProjectHeader({ project, overviewCount }: { project: ResearchProject; overviewCount: string }) {
  return (
    <div style={{ marginBottom: 'var(--spacing-6)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--spacing-3)' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>{project.title}</h1>
        <span style={badge}>{project.status}</span>
        <span style={badge}>P{project.priority}</span>
      </div>
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>
        {project.id} · created {new Date(project.createdAt).toLocaleDateString()} · {overviewCount}
      </p>
      {project.researchQuestion ? (
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-2)' }}>{project.researchQuestion}</p>
      ) : null}
    </div>
  );
}

function StatRow({ overview }: { overview: ReturnType<typeof researchIntelligenceCore.getProjectOverview> }) {
  if (!overview) return null;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-6)' }}>
      <StatCard label="Sources" value={String(overview.sourceCount)} sub={`${String(overview.primarySourceCount)} primary`} />
      <StatCard label="Documents" value={String(overview.documents)} />
      <StatCard label="Claims" value={String(overview.verifiedClaims + overview.unverifiedClaims)} sub={`${String(overview.verifiedClaims)} verified`} />
      <StatCard label="Contradictions" value={String(overview.contradictions)} />
      <StatCard label="Open gaps" value={String(overview.openResearchGaps)} />
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{ padding: 'var(--spacing-4)', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-default)' }}>
      <div style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text-muted)', fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: 'var(--spacing-1)' }}>{value}</div>
      {sub ? <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>{sub}</div> : null}
    </div>
  );
}

function RecentEvents({ events }: { events: ResearchChangeEvent[] }) {
  return (
    <Section title={`Recent developments (${String(events.length)})`}>
      {events.length === 0 ? <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>No change events yet.</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
          {events.map((e) => (
            <div key={e.id} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{e.title}</span>
                <span style={{ color: 'var(--color-text-muted)' }}>{e.severity} · {e.type}</span>
              </div>
              <div style={{ color: 'var(--color-text-muted)', marginTop: 2 }}>{e.description}</div>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

function ClaimSummary({ counts, total }: { counts: Record<string, number>; total: number }) {
  return (
    <Section title={`Claims by verification state (${String(total)})`}>
      {total === 0 ? <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Run the pipeline to extract claims.</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
          {Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .map(([state, count]) => (
              <div key={state} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)' }}>
                <span style={{ color: CLAIM_COLOR[state] ?? 'var(--color-text-secondary)' }}>{state.replace(/_/g, ' ')}</span>
                <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>{String(count)}</span>
              </div>
            ))}
        </div>
      )}
    </Section>
  );
}

function SourceList({ sources }: { sources: ResearchSource[] }) {
  if (sources.length === 0) return <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>No sources yet.</p>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
      {sources.map((s) => (
        <div key={s.id} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', display: 'flex', gap: 'var(--spacing-3)', alignItems: 'baseline' }}>
          <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>{s.title}</span>
          <span style={{ color: 'var(--color-text-muted)' }}>{s.publisher}</span>
          <span style={{ color: 'var(--color-text-muted)' }}>{s.sourceClass.replace(/_/g, ' ')}</span>
          <div style={{ flex: 1 }} />
          <span style={{ color: 'var(--color-text-muted)' }}>{s.publishedAt?.slice(0, 10)}</span>
          <span style={{ color: 'var(--color-text-muted)' }}>{s.status.replace(/_/g, ' ')}</span>
        </div>
      ))}
    </div>
  );
}

function ContradictionsSection({ contradictions }: { contradictions: ResearchContradiction[] }) {
  return (
    <Section title={`Contradictions (${String(contradictions.length)})`}>
      {contradictions.length === 0 ? <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>No contradictions detected.</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
          {contradictions.map((c) => (
            <div key={c.id} style={{ padding: 'var(--spacing-3)', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)' }}>
                <span style={{ color: 'var(--color-warning)', fontWeight: 600 }}>{c.classification.replace(/_/g, ' ')}</span>
                <span style={{ color: 'var(--color-text-muted)' }}>{c.status} {c.metric ? `· ${c.metric}: ${c.valueA ?? '?'} vs ${c.valueB ?? '?'}` : ''}</span>
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: 4, lineHeight: 1.6 }}>
                {c.statementA} — <em>{c.statementB}</em>
              </div>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

function GapsSection({ gaps }: { gaps: ResearchGap[] }) {
  return (
    <Section title={`Research gaps (${String(gaps.length)})`}>
      {gaps.length === 0 ? <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>No gaps registered.</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
          {gaps.map((g) => (
            <div key={g.id} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', display: 'flex', gap: 'var(--spacing-3)', alignItems: 'baseline' }}>
              <span style={{ color: g.severity === 'CRITICAL' ? 'var(--color-error)' : 'var(--color-warning)', fontWeight: 600 }}>{g.severity}</span>
              <span>{g.title}</span>
              <div style={{ flex: 1 }} />
              <span style={{ color: 'var(--color-text-muted)' }}>{g.type.replace(/_/g, ' ')} · {g.status}</span>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

function ClaimList({ claims }: { claims: ResearchClaim[] }) {
  if (claims.length === 0) return <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>No claims yet.</p>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
      {claims.map((c) => (
        <div key={c.id} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', display: 'flex', gap: 'var(--spacing-3)', alignItems: 'baseline' }}>
          <span style={{ color: CLAIM_COLOR[c.verificationState] ?? 'var(--color-text-secondary)', fontWeight: 600, whiteSpace: 'nowrap' }}>{c.verificationState.replace(/_/g, ' ')}</span>
          <span style={{ flex: 1, lineHeight: 1.6 }}>{c.claimText}</span>
          <span style={{ color: 'var(--color-text-muted)' }}>{c.claimType}</span>
        </div>
      ))}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: 'var(--spacing-5)', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-default)' }}>
      <h2 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-4)' }}>{title}</h2>
      {children}
    </div>
  );
}

const badge: React.CSSProperties = {
  fontSize: 'var(--text-xs)',
  padding: '2px 8px',
  borderRadius: 'var(--radius-sm)',
  background: 'var(--color-bg-primary)',
  border: '1px solid var(--color-border-default)',
  color: 'var(--color-text-secondary)',
};

const actionButton: React.CSSProperties = {
  padding: 'var(--spacing-2) var(--spacing-3)',
  background: 'var(--color-brand-400)',
  color: 'var(--color-bg-primary)',
  border: 'none',
  borderRadius: 'var(--radius-sm)',
  fontSize: 'var(--text-xs)',
  fontWeight: 600,
  cursor: 'pointer',
};

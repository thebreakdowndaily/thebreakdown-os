import React from 'react';
import Link from 'next/link';
import type { StoryDraft, StorySourceDomain } from '@/lib/intel/story';
import { StoryStatusBadge } from './StoryStatusBadge';
import { StoryTransitionPanel } from './StoryTransitionPanel';
import { ConfidencePill, SectionCard, MiniCard, Badge, Muted } from '@/components/intel/shared/primitives';

// Governing document: docs/intelligence/tbios-master-prompt-v1.md (Story Builder — Editorial Workspace)
// Render-only editorial workspace for one story draft. The brief, outline, impact, source panel,
// and readiness are derived projections over certified engines — this component renders them,
// it does not compute them. The workflow panel is the only interactive surface.

const SOURCE_LABEL: Record<StorySourceDomain, string> = {
  evidence_graph: 'Evidence Graph',
  research_kb: 'Research Knowledge Base',
  verification_workspace: 'Verification Workspace',
  prediction_engine: 'Prediction Engine',
  scenario_engine: 'Scenario Engine',
  toolkit: 'Journalist Toolkit',
};

function AuditRow({ at, actorName, action, note }: { at: string; actorName: string; action: string; note?: string }) {
  return (
    <div style={{ display: 'flex', gap: 'var(--spacing-3)', alignItems: 'baseline' }}>
      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', minWidth: 120, fontVariantNumeric: 'tabular-nums' }}>
        {new Date(at).toLocaleString()}
      </span>
      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-primary)', minWidth: 120, textTransform: 'capitalize' }}>
        {action.replace(/_/g, ' ')}
      </span>
      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', flex: 1, lineHeight: 1.5 }}>
        {actorName}
        {note ? <span style={{ color: 'var(--color-text-muted)' }}> — {note}</span> : null}
      </span>
    </div>
  );
}

export function StoryDetail({ story }: { story: StoryDraft }) {
  const s = story;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--spacing-4)', flexWrap: 'wrap' }}>
          <div>
            <Link href="/intel/story-builder" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textDecoration: 'none' }}>← Story Builder</Link>
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: 'var(--spacing-1)' }}>
              {s.constituencyName}
            </h1>
            <div style={{ display: 'flex', gap: 'var(--spacing-2)', marginTop: 'var(--spacing-1)', flexWrap: 'wrap', alignItems: 'center' }}>
              <Muted>AC {s.acNumber} · {s.district} · {s.region}</Muted>
              <StoryStatusBadge status={s.status} />
              <ConfidencePill tier={s.confidence} />
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text-muted)' }}>Readiness</div>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: s.readiness.canPublish ? 'var(--color-brand-400)' : 'var(--color-amber-500)' }}>
              {s.readiness.state.replace(/_/g, ' ')}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>{s.readiness.verificationScore !== null ? `verification ${s.readiness.verificationScore}/100` : 'no linked verification'}</div>
          </div>
        </div>
        <p style={{ color: 'var(--color-text-primary)', fontSize: 'var(--text-sm)', fontWeight: 600, marginTop: 'var(--spacing-3)', maxWidth: 720, lineHeight: 1.6 }}>
          {s.headline}
        </p>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--spacing-1)', maxWidth: 720, lineHeight: 1.6 }}>
          {s.brief.executiveSummary}
        </p>
        <div style={{ display: 'flex', gap: 'var(--spacing-3)', marginTop: 'var(--spacing-3)', flexWrap: 'wrap' }}>
          <Badge tone={s.readiness.canPublish ? 'good' : 'default'}>{s.readiness.canPublish ? 'Publish ready' : 'Not publish ready'}</Badge>
          <Badge>{s.storyType.replace(/_/g, ' ')}</Badge>
          <Badge>IPI {String(Math.round(s.ipi))} · {s.priorityTier}</Badge>
          <Badge>{s.linkedConstituency.currentMlaParty} → {s.linkedConstituency.predictedWinner} ({String(Math.round(s.linkedConstituency.winnerProbability))}%)</Badge>
          <Link
            href={`/intel/verification/cases/${s.id}`}
            style={{ fontSize: 'var(--text-xs)', color: 'var(--color-amber-500)', textDecoration: 'none' }}
          >
            Open Verification case →
          </Link>
        </div>
      </section>

      <SectionCard id="workflow" title="Editorial workflow" subtitle="Status transitions, editor assignment, notes, and the append-only audit trail.">
        <StoryTransitionPanel
          storyId={s.id}
          status={s.status}
          editorName={s.editor?.name}
          notes={s.notes}
        />
      </SectionCard>

      <SectionCard id="readiness" title="Editorial readiness" subtitle="The Story Builder gates on the Verification Operating System, never on its own judgment.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
          <div style={{ display: 'flex', gap: 'var(--spacing-4)', flexWrap: 'wrap', alignItems: 'center' }}>
            <Badge tone={s.readiness.canPublish ? 'good' : 'bad'}>{s.readiness.canPublish ? 'Ready for publication' : `State: ${s.readiness.state.replace(/_/g, ' ')}`}</Badge>
            <Muted>Verification {s.readiness.verificationStatus ?? 'unverified'} · score {s.readiness.verificationScore ?? 'n/a'}/100</Muted>
          </div>
          {s.readiness.requiredActions.length > 0 ? (
            <ul style={{ paddingLeft: 'var(--spacing-4)', display: 'flex', flexDirection: 'column', gap: 2 }}>
              {s.readiness.requiredActions.map((a) => <li key={a} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>{a}</li>)}
            </ul>
          ) : (
            <Muted>No blockers. This story is ready for editorial handoff.</Muted>
          )}
          {s.readiness.blockers.length > 0 ? (
            <ul style={{ paddingLeft: 'var(--spacing-4)', display: 'flex', flexDirection: 'column', gap: 2 }}>
              {s.readiness.blockers.map((b, i) => (
                <li key={`${b.label}-${String(i)}`} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                  <span style={{ color: 'var(--color-warning)', fontWeight: 600 }}>{b.label}:</span> {b.detail}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </SectionCard>

      <SectionCard id="brief" title="Editorial brief" subtitle="Eleven planning sections, every item traced to a certified engine output.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
          <MiniCard title="Why it matters">
            <ul style={{ paddingLeft: 'var(--spacing-4)', display: 'flex', flexDirection: 'column', gap: 2 }}>
              {s.brief.whyItMatters.map((item) => <li key={item} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>{item}</li>)}
            </ul>
          </MiniCard>
          <MiniCard title="Key findings">
            <ul style={{ paddingLeft: 'var(--spacing-4)', display: 'flex', flexDirection: 'column', gap: 2 }}>
              {s.brief.keyFindings.map((item) => <li key={item} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>{item}</li>)}
            </ul>
          </MiniCard>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
            <MiniCard title="Primary evidence">
              <ul style={{ paddingLeft: 'var(--spacing-4)', display: 'flex', flexDirection: 'column', gap: 2 }}>
                {s.brief.primaryEvidence.map((item) => <li key={item} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>{item}</li>)}
              </ul>
            </MiniCard>
            <MiniCard title="Research summary">
              <ul style={{ paddingLeft: 'var(--spacing-4)', display: 'flex', flexDirection: 'column', gap: 2 }}>
                {s.brief.researchSummary.map((item) => <li key={item} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>{item}</li>)}
              </ul>
            </MiniCard>
            <MiniCard title="Data gaps">
              <ul style={{ paddingLeft: 'var(--spacing-4)', display: 'flex', flexDirection: 'column', gap: 2 }}>
                {s.brief.dataGaps.map((item) => <li key={item} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-warning)' }}>{item}</li>)}
              </ul>
            </MiniCard>
            <MiniCard title="Recommended publication timing">
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{s.brief.recommendedPublicationTiming}</div>
            </MiniCard>
          </div>
        </div>
      </SectionCard>

      <SectionCard id="outline" title="Story structure" subtitle="Structured planning blocks — references to intelligence, never drafted prose.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
          {s.outline.map((block) => (
            <MiniCard key={block.id} title={`${block.title} (${block.items.length})`}>
              <ul style={{ paddingLeft: 'var(--spacing-4)', display: 'flex', flexDirection: 'column', gap: 2 }}>
                {block.items.map((item) => (
                  <li key={`${item.text.slice(0, 32)}-${item.source}`} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                    <span style={{ color: 'var(--color-text-primary)' }}>{item.text}</span>
                    <span style={{ color: 'var(--color-text-muted)' }}> — {item.source}</span>
                  </li>
                ))}
              </ul>
            </MiniCard>
          ))}
        </div>
      </SectionCard>

      <SectionCard id="impact" title="Story impact" subtitle="Weighted editorial-impact estimate. Weights are explicit and versioned.">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-4)', flexWrap: 'wrap' }}>
          <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--color-brand-400)' }}>
            {Math.round(s.impact.overall * 100)}
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', fontWeight: 500 }}>/100</span>
          </div>
          <Muted>{s.impact.calculationVersion}</Muted>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-3)' }}>
          {s.impact.dimensions.map((d) => (
            <MiniCard key={d.key} title={`${d.label} · ${String(Math.round(d.value * 100))} × ${String(Math.round(d.weight * 100))}%`}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                contribution {String(Math.round(d.contribution * 100))}/100
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{d.limitation}</div>
            </MiniCard>
          ))}
        </div>
      </SectionCard>

      <SectionCard id="sources" title="Source panel" subtitle="Six domains referenced by this story, with honest confidence and coverage.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
          {s.sourcePanel.map((entry) => (
            <div key={entry.domain} style={{ padding: 'var(--spacing-3)', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--spacing-2)', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-primary)' }}>{SOURCE_LABEL[entry.domain]}</span>
                <span style={{ display: 'flex', gap: 'var(--spacing-2)', alignItems: 'center' }}>
                  <ConfidencePill tier={entry.confidence} />
                  <Badge>{entry.coverage}% coverage</Badge>
                  <Muted>{entry.evidenceCount} items</Muted>
                </span>
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>{entry.detail}</div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard id="package" title="Publication package" subtitle="Canonical story-package-v1 output — a future CMS ingest payload.">
        <div style={{ display: 'flex', gap: 'var(--spacing-3)', flexWrap: 'wrap', alignItems: 'center' }}>
          <Badge>{s.slug}.story-package.json</Badge>
          <Badge>v{s.version}</Badge>
          <Link
            href={`/intel/story-builder/${s.id}/export`}
            style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-brand-400)', textDecoration: 'none' }}
          >
            Download story package ↓
          </Link>
        </div>
      </SectionCard>

      <SectionCard id="audit" title="Audit trail" subtitle={`${s.audit.length} append-only event(s).`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
          {s.audit.map((entry) => (
            <AuditRow key={entry.id} at={entry.at} actorName={entry.actorName} action={entry.action} note={entry.note} />
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

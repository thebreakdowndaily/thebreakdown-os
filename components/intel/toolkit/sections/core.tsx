import type { ConstituencyToolkit, ChecklistItem, InterviewBrief, StoryAngle } from '@/lib/intel/toolkit/types';
import { SectionCard, ConfidencePill, Badge, MiniCard, Muted, TwoCol } from '@/components/intel/shared/primitives';

// Governing document: docs/intelligence/roadmap.md (Part 8 — Journalist Toolkit)

const STATUS_BADGE: Record<ChecklistItem['status'], { label: string; tone: 'good' | 'warn' | 'bad' }> = {
  done: { label: 'Reviewed', tone: 'good' },
  warning: { label: 'Needs attention', tone: 'warn' },
  todo: { label: 'Not started', tone: 'bad' },
};

export function BriefSection({ toolkit }: { toolkit: ConstituencyToolkit }) {
  const b = toolkit.brief;
  return (
    <SectionCard id="brief" title="Constituency Brief" subtitle="Synthesis of prediction, scoring, evidence, and history — every line traces to a registered field or engine output.">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)', fontSize: 'var(--text-sm)', lineHeight: 1.6, color: 'var(--color-text-secondary)' }}>
        <p style={{ margin: 0 }}>{b.overview}</p>
        <p style={{ margin: 0 }}><strong style={{ color: 'var(--color-text-primary)' }}>Political summary.</strong> {b.politicalSummary}</p>
        <p style={{ margin: 0 }}><strong style={{ color: 'var(--color-text-primary)' }}>Prediction.</strong> {b.predictionSummary}</p>
        <p style={{ margin: 0 }}><strong style={{ color: 'var(--color-text-primary)' }}>Competitiveness.</strong> {b.competitiveness}</p>
        <p style={{ margin: 0 }}><strong style={{ color: 'var(--color-text-primary)' }}>Momentum.</strong> {b.momentum}</p>
        <p style={{ margin: 0 }}><strong style={{ color: 'var(--color-text-primary)' }}>Evidence confidence.</strong> {b.evidenceConfidence}</p>
        <p style={{ margin: 0 }}><strong style={{ color: 'var(--color-text-primary)' }}>Research summary.</strong> {b.researchSummary}</p>
      </div>

      <div style={{ marginTop: 'var(--spacing-5)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-5)' }}>
        <div>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-2)' }}>Historical trends</div>
          <ul style={{ margin: 0, paddingLeft: 'var(--spacing-4)', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
            {b.historicalTrends.map((t) => <li key={t}>{t}</li>)}
          </ul>
        </div>
        <div>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-2)' }}>Regional context</div>
          <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>{b.regionalContext}</p>
        </div>
      </div>

      <TwoCol>
        <div>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-warning)', marginBottom: 'var(--spacing-2)' }}>Known risks</div>
          <ul style={{ margin: 0, paddingLeft: 'var(--spacing-4)', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
            {b.knownRisks.map((r) => <li key={r}>{r}</li>)}
          </ul>
        </div>
        <div>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-warning)', marginBottom: 'var(--spacing-2)' }}>Registered data gaps</div>
          <ul style={{ margin: 0, paddingLeft: 'var(--spacing-4)', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
            {b.dataGaps.map((g) => <li key={g}>{g}</li>)}
          </ul>
        </div>
      </TwoCol>

      <div style={{ marginTop: 'var(--spacing-5)', paddingTop: 'var(--spacing-4)', borderTop: '1px solid var(--color-border-subtle)' }}>
        <Muted>Last updated {b.lastUpdated} · Sources: {b.sourcesUsed.join(', ') || 'none recorded'}</Muted>
      </div>
    </SectionCard>
  );
}

export function InterviewsSection({ toolkit }: { toolkit: ConstituencyToolkit }) {
  return (
    <SectionCard id="interviews" title="Interview Briefs" subtitle={`${String(toolkit.interviews.length)} personas · ${String(toolkit.interviews.reduce((s, b) => s + b.questions.length, 0))} questions. Each question cites the signal and the evidence/prediction engine that motivates it.`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
        {toolkit.interviews.map((brief) => (
          <PersonaBlock key={brief.persona} brief={brief} />
        ))}
      </div>
    </SectionCard>
  );
}

function PersonaBlock({ brief }: { brief: InterviewBrief }) {
  return (
    <details style={{ background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
      <summary style={{ cursor: 'pointer', listStyle: 'none', padding: 'var(--spacing-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>{brief.personaLabel}</span>
          <Muted>Focus: {brief.focusAreas.join(' · ')}</Muted>
          <div style={{ flex: 1 }} />
          <Badge>{String(brief.questions.length)} questions</Badge>
        </div>
      </summary>
      <div style={{ padding: '0 var(--spacing-3) var(--spacing-3)' }}>
        <ol style={{ margin: 0, paddingLeft: 'var(--spacing-4)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
          {brief.questions.map((q, i) => (
            <li key={String(i)}>
              <strong style={{ color: 'var(--color-text-primary)' }}>{q.question}</strong>
              <div style={{ color: 'var(--color-text-muted)', marginTop: 2 }}>Signal: {q.signal} · Basis: {q.basis}</div>
            </li>
          ))}
        </ol>
        {brief.prepNotes.length > 0 ? (
          <div style={{ marginTop: 'var(--spacing-3)', fontSize: 'var(--text-xs)', color: 'var(--color-amber-400)' }}>
            <strong>Prep notes:</strong> {brief.prepNotes.join(' ')}
          </div>
        ) : null}
      </div>
    </details>
  );
}

export function ChecklistSection({ toolkit }: { toolkit: ConstituencyToolkit }) {
  return (
    <SectionCard id="checklist" title="Reporting Checklist" subtitle="State of each evidence/prediction input for this seat. Warnings are honest data gaps, not failures.">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
        {toolkit.checklist.map((item) => {
          const badge = STATUS_BADGE[item.status];
          return (
            <div key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-3)', padding: 'var(--spacing-3)', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
              <Badge tone={badge.tone}>{badge.label}</Badge>
              <div>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-primary)' }}>{item.label}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>{item.detail}</div>
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

export function AnglesSection({ toolkit }: { toolkit: ConstituencyToolkit }) {
  return (
    <SectionCard id="angles" title="Story Angles" subtitle="Angle confidence derives from the underlying scores — a certain gap is high confidence, a narrow prediction is not.">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
        {toolkit.angles.map((angle) => <AngleBlock key={angle.id} angle={angle} />)}
      </div>
    </SectionCard>
  );
}

function AngleBlock({ angle }: { angle: StoryAngle }) {
  return (
    <MiniCard title={angle.title}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-2)' }}>
        <ConfidencePill tier={angle.confidence} />
        <Muted>{angle.id}</Muted>
      </div>
      <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{angle.whyItMatters}</p>
      <div style={{ marginTop: 'var(--spacing-2)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
        <div>Evidence: {angle.evidenceUsed.join('; ')}</div>
        <div style={{ marginTop: 2 }}>Interviews: {angle.suggestedInterviews.join(', ')}</div>
        {angle.suggestedDocuments.length > 0 ? <div style={{ marginTop: 2 }}>Documents: {angle.suggestedDocuments.join('; ')}</div> : null}
      </div>
    </MiniCard>
  );
}

import React from 'react';
import Link from 'next/link';
import type { VerificationCase } from '@/lib/intel/verification';
import { VerificationStatusBadge } from './VerificationStatusBadge';
import { TransitionPanel } from './TransitionPanel';
import { ConfidencePill, SectionCard, MiniCard, Badge, Muted } from '@/components/intel/shared/primitives';

// Governing document: docs/intelligence/tbios-master-prompt-v1.md (Verification Workspace — Case Detail)
// Render-only case workspace. Every number traces to the derived Verification Case; the workflow
// panel is the only interactive surface and it mutates through server actions only.

const KIND_LABEL: Record<string, string> = {
  claim: 'Claim',
  missing_evidence: 'Missing evidence',
  weak_evidence: 'Weak evidence',
  conflicting_evidence: 'Conflicting signal',
};

const SEVERITY_COLOR: Record<string, string> = {
  high: 'var(--color-error)',
  medium: 'var(--color-amber-500)',
  low: 'var(--color-brand-400)',
};

function AuditRow({ at, actorName, action, note }: { at: string; actorName: string; action: string; note?: string }) {
  return (
    <div style={{ display: 'flex', gap: 'var(--spacing-3)', alignItems: 'baseline' }}>
      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', minWidth: 120, fontVariantNumeric: 'tabular-nums' }}>
        {new Date(at).toLocaleString()}
      </span>
      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-primary)', minWidth: 110, textTransform: 'capitalize' }}>
        {action.replace(/_/g, ' ')}
      </span>
      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', flex: 1, lineHeight: 1.5 }}>
        {actorName}
        {note ? <span style={{ color: 'var(--color-text-muted)' }}> — {note}</span> : null}
      </span>
    </div>
  );
}

export function CaseDetail({ verificationCase }: { verificationCase: VerificationCase }) {
  const c = verificationCase;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--spacing-4)', flexWrap: 'wrap' }}>
          <div>
            <Link href="/intel/verification" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textDecoration: 'none' }}>← Verification workspace</Link>
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: 'var(--spacing-1)' }}>
              {c.constituencyName}
            </h1>
            <div style={{ display: 'flex', gap: 'var(--spacing-2)', marginTop: 'var(--spacing-1)', flexWrap: 'wrap', alignItems: 'center' }}>
              <Muted>{c.acNumber} · {c.district} · {c.region} · {c.reservationType}</Muted>
              <VerificationStatusBadge status={c.status} />
              <ConfidencePill tier={c.confidence} />
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-text-muted)' }}>Readiness</div>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: c.readiness.canPublish ? 'var(--color-brand-400)' : c.readiness.score >= 70 ? 'var(--color-amber-500)' : 'var(--color-warning)' }}>
              {c.readiness.score}/100
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>{c.readiness.recommendation}</div>
          </div>
        </div>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--spacing-3)', maxWidth: 720, lineHeight: 1.6 }}>
          {c.summary}
        </p>
        <div style={{ display: 'flex', gap: 'var(--spacing-3)', marginTop: 'var(--spacing-3)', flexWrap: 'wrap' }}>
          <Badge tone={c.readiness.canPublish ? 'good' : 'default'}>{c.readiness.canPublish ? 'Publish ready' : 'Not publish ready'}</Badge>
          <Badge>IPI {String(Math.round(c.ipi))}</Badge>
          <Badge>{c.currentMlaParty} → {c.predictedWinner} ({String(Math.round(c.winnerProbability))}%)</Badge>
          <Link
            href={`/intel/toolkit?constituency=${c.id}`}
            style={{ fontSize: 'var(--text-xs)', color: 'var(--color-amber-500)', textDecoration: 'none' }}
          >
            Open Toolkit for {c.constituencyName} →
          </Link>
        </div>
      </section>

      <SectionCard id="workflow" title="Verification workflow" subtitle="Status, reviewer, notes, and the append-only audit trail.">
        <TransitionPanel
          caseId={c.id}
          status={c.status}
          reviewerName={c.reviewer?.name}
          reviewNotes={c.reviewNotes}
        />
      </SectionCard>

      <SectionCard id="claims" title="Claim register" subtitle={`${c.claimRegister.length} claims to verify — each traces to a certified engine output.`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
          {c.claimRegister.length === 0 ? (
            <Muted>No claims registered for this case.</Muted>
          ) : (
            c.claimRegister.map((claim) => (
              <div key={claim.id} style={{ padding: 'var(--spacing-3)', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--spacing-2)', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div style={{ minWidth: 0 }}>
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-primary)' }}>{KIND_LABEL[claim.kind]}</span>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: 2, lineHeight: 1.5 }}>{claim.text}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>Source: {claim.source}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--spacing-2)', alignItems: 'center', flexShrink: 0 }}>
                    <ConfidencePill tier={claim.confidence} />
                    <Badge tone={claim.status === 'verified' ? 'good' : claim.status === 'contested' ? 'bad' : 'default'}>{claim.status}</Badge>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </SectionCard>

      <SectionCard id="conflicts" title="Conflict detector" subtitle={`${c.conflicts.length} registered conflict(s) between certified signals.`}>
        {c.conflicts.length === 0 ? (
          <Muted>No conflicts detected for this case.</Muted>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-3)' }}>
            {c.conflicts.map((conflict) => (
              <MiniCard key={conflict.id} title={conflict.title} tone={conflict.severity === 'high' ? 'bad' : conflict.severity === 'medium' ? 'warn' : 'good'}>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{conflict.detail}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-2)' }}>
                  Between: <span style={{ color: 'var(--color-text-secondary)' }}>{conflict.between.join(' vs ')}</span>
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>
                  Severity: <span style={{ color: SEVERITY_COLOR[conflict.severity] }}>{conflict.severity}</span>
                </div>
                <ul style={{ marginTop: 'var(--spacing-2)', paddingLeft: 'var(--spacing-4)', display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {conflict.resolutionSteps.map((s) => <li key={s} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>{s}</li>)}
                </ul>
              </MiniCard>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard id="evidence" title="Evidence review" subtitle={`Coverage ${c.evidenceReview.coveragePct}% — derived from ${c.evidenceReview.derivedFrom}.`}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
          <MiniCard title="Coverage">
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {c.evidenceReview.coveragePct}% <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>· {c.evidenceReview.availableFields}/{c.evidenceReview.totalFields} fields</span>
            </div>
            <div style={{ marginTop: 'var(--spacing-2)' }}>
              <ConfidencePill tier={c.evidenceReview.confidence} />
            </div>
          </MiniCard>
          <MiniCard title="Missing by category">
            {c.evidenceReview.missingCategories.length === 0 ? (
              <Muted>No category gaps.</Muted>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {c.evidenceReview.missingCategories.map((m) => (
                  <div key={m.category} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                    {m.label}: <span style={{ color: 'var(--color-warning)' }}>{m.missing}/{m.total}</span> missing
                  </div>
                ))}
              </div>
            )}
          </MiniCard>
        </div>
        {c.evidenceReview.lowConfidenceItems.length > 0 ? (
          <details style={{ marginTop: 'var(--spacing-3)' }}>
            <summary style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
              {c.evidenceReview.lowConfidenceItems.length} low-confidence available field(s)
            </summary>
            <ul style={{ marginTop: 'var(--spacing-2)', paddingLeft: 'var(--spacing-4)', display: 'flex', flexDirection: 'column', gap: 2 }}>
              {c.evidenceReview.lowConfidenceItems.map((item, i) => (
                <li key={`${item.label}-${String(i)}`} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                  {item.label}: {item.value} ({item.confidence.replace('_', ' ')} — {item.source})
                </li>
              ))}
            </ul>
          </details>
        ) : null}
      </SectionCard>

      <SectionCard id="field" title="Field verification" subtitle={`${c.fieldPlan.taskCount} field tasks — documents, ground reporting, datasets, places, and people.`}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
          <MiniCard title={`Recommended documents (${c.fieldPlan.recommendedDocuments.length})`}>
            <ul style={{ paddingLeft: 'var(--spacing-4)', display: 'flex', flexDirection: 'column', gap: 2 }}>
              {c.fieldPlan.recommendedDocuments.map((d) => <li key={d} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>{d}</li>)}
            </ul>
          </MiniCard>
          <MiniCard title={`Ground reporting (${c.fieldPlan.groundReporting.length})`}>
            <ul style={{ paddingLeft: 'var(--spacing-4)', display: 'flex', flexDirection: 'column', gap: 2 }}>
              {c.fieldPlan.groundReporting.map((d) => <li key={d} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>{d}</li>)}
            </ul>
          </MiniCard>
          <MiniCard title="Places to visit">
            <ul style={{ paddingLeft: 'var(--spacing-4)', display: 'flex', flexDirection: 'column', gap: 2 }}>
              {c.fieldPlan.placesToVisit.map((d) => <li key={d} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>{d}</li>)}
            </ul>
          </MiniCard>
          <MiniCard title="People to interview">
            <ul style={{ paddingLeft: 'var(--spacing-4)', display: 'flex', flexDirection: 'column', gap: 2 }}>
              {c.fieldPlan.peopleToInterview.map((d) => <li key={d} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>{d}</li>)}
            </ul>
          </MiniCard>
        </div>
      </SectionCard>

      <SectionCard id="readiness" title="Editorial readiness" subtitle="Handoff contract to the Story Builder.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
          <div style={{ display: 'flex', gap: 'var(--spacing-4)', flexWrap: 'wrap', alignItems: 'center' }}>
            <Badge tone={c.readiness.canPublish ? 'good' : c.readiness.score >= 70 ? 'warn' : 'bad'}>
              {c.readiness.canPublish ? 'Publish ready' : `Score ${c.readiness.score}/100`}
            </Badge>
            <Muted>{c.readiness.verifiedClaims}/{c.readiness.totalClaims} claims verified · {c.readiness.openConflicts} open conflicts · {c.readiness.openFieldTasks} field tasks open</Muted>
          </div>
          {c.readiness.blockers.length > 0 ? (
            <ul style={{ paddingLeft: 'var(--spacing-4)', display: 'flex', flexDirection: 'column', gap: 2 }}>
              {c.readiness.blockers.map((b, i) => (
                <li key={`${b.label}-${String(i)}`} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                  <span style={{ color: 'var(--color-warning)', fontWeight: 600 }}>{b.label}:</span> {b.detail}
                </li>
              ))}
            </ul>
          ) : (
            <Muted>No blockers. This case is ready for editorial handoff.</Muted>
          )}
        </div>
      </SectionCard>

      <SectionCard id="audit" title="Audit trail" subtitle={`${c.audit.length} append-only event(s).`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
          {c.audit.map((entry) => (
            <AuditRow key={entry.id} at={entry.at} actorName={entry.actorName} action={entry.action} note={entry.note} />
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

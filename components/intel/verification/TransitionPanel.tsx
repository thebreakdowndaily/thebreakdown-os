import React from 'react';
import type { VerificationStatus } from '@/lib/intel/verification';
import { nextTransitions, verificationStatusLabel, isTerminal } from '@/lib/intel/verification';
import {
  transitionVerificationAction,
  assignVerificationReviewerAction,
  addVerificationNoteAction,
} from '@/app/intel/verification/actions';

// Governing document: docs/intelligence/tbios-master-prompt-v1.md (Verification Workspace — Workflow)
// Server-component workflow panel. Every mutation is a server action that re-authorizes the
// session role and passes through the explicit transition map. No client-side security.

export function TransitionPanel({
  caseId,
  status,
  reviewerName,
  reviewNotes,
}: {
  caseId: string;
  status: VerificationStatus;
  reviewerName?: string;
  reviewNotes: string[];
}) {
  const allowed = nextTransitions(status);
  const terminal = isTerminal(status);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-6)', alignItems: 'start' }}>
      <section aria-labelledby="transitions-title">
        <h3 id="transitions-title" style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-3)' }}>
          Status transitions
        </h3>
        {terminal ? (
          <div style={{ padding: 'var(--spacing-4)', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            This case is archived. It cannot be transitioned.
          </div>
        ) : allowed.length === 0 ? (
          <div style={{ padding: 'var(--spacing-4)', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            No transitions are currently allowed from {verificationStatusLabel(status)}.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
            {allowed.map((to) => (
              <form key={to} action={transitionVerificationAction} style={{ display: 'flex', gap: 'var(--spacing-2)', alignItems: 'center' }}>
                <input type="hidden" name="caseId" value={caseId} />
                <input type="hidden" name="to" value={to} />
                <input
                  type="text"
                  name="note"
                  placeholder="optional note"
                  aria-label={`Note for transition to ${verificationStatusLabel(to)}`}
                  style={{
                    flex: 1,
                    padding: '8px 10px',
                    fontSize: 'var(--text-xs)',
                    background: 'var(--color-bg-primary)',
                    color: 'var(--color-text-primary)',
                    border: '1px solid var(--color-border-default)',
                    borderRadius: 'var(--radius-md)',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: '8px 12px',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 600,
                    background: to === 'verified' ? 'var(--color-brand-400)' : to === 'rejected' ? 'var(--color-error)' : 'var(--color-bg-primary)',
                    color: to === 'verified' || to === 'rejected' ? '#000' : 'var(--color-text-primary)',
                    border: '1px solid var(--color-border-default)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {verificationStatusLabel(to)}
                </button>
              </form>
            ))}
          </div>
        )}
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-3)', lineHeight: 1.6 }}>
          Transitions follow the explicit workflow map. Every change is recorded in the append-only audit trail.
        </p>
      </section>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
        <section aria-labelledby="reviewer-title">
          <h3 id="reviewer-title" style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-3)' }}>
            Reviewer
          </h3>
          <div style={{ padding: 'var(--spacing-4)', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
            {reviewerName ? (
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                Assigned to <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{reviewerName}</span>.
              </div>
            ) : (
              <form action={assignVerificationReviewerAction}>
                <input type="hidden" name="caseId" value={caseId} />
                <button
                  type="submit"
                  style={{ padding: '8px 12px', fontSize: 'var(--text-xs)', fontWeight: 600, background: 'var(--color-bg-primary)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
                >
                  Assign me as reviewer
                </button>
              </form>
            )}
          </div>
        </section>

        <section aria-labelledby="notes-title">
          <h3 id="notes-title" style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-3)' }}>
            Review notes
          </h3>
          <div style={{ padding: 'var(--spacing-4)', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
            <form action={addVerificationNoteAction} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
              <input type="hidden" name="caseId" value={caseId} />
              <textarea
                name="note"
                rows={3}
                placeholder="Add a review note…"
                aria-label="Review note"
                style={{
                  padding: '8px 10px',
                  fontSize: 'var(--text-xs)',
                  background: 'var(--color-bg-secondary)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-border-default)',
                  borderRadius: 'var(--radius-md)',
                  resize: 'vertical',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  style={{ padding: '8px 12px', fontSize: 'var(--text-xs)', fontWeight: 600, background: 'var(--color-bg-primary)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
                >
                  Add note
                </button>
              </div>
            </form>
            {reviewNotes.length > 0 ? (
              <ul style={{ marginTop: 'var(--spacing-3)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)', paddingLeft: 0, listStyle: 'none' }}>
                {reviewNotes.map((n, i) => (
                  <li key={`${i}-${n.slice(0, 12)}`} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', padding: '8px 10px', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-sm)', lineHeight: 1.5 }}>
                    {n}
                  </li>
                ))}
              </ul>
            ) : (
              <div style={{ marginTop: 'var(--spacing-3)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>No review notes yet.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

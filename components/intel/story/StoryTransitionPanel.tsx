import React from 'react';
import type { StoryStatus } from '@/lib/intel/story';
import { nextStoryTransitions, storyStatusLabel, isTerminalStory, isVerificationGated } from '@/lib/intel/story';
import {
  transitionStoryAction,
  assignStoryEditorAction,
  addStoryNoteAction,
} from '@/app/intel/story-builder/actions';

// Governing document: docs/intelligence/tbios-master-prompt-v1.md (Story Builder — Editorial Workflow)
// Server-component workflow panel. Every mutation is a server action that re-authorizes the
// session role and passes through the explicit editorial transition map plus the verification
// gate. No client-side security. The verification gate is enforced server-side in the store:
// reaching a verification-gated status requires the linked Verification case to be Verified.

export function StoryTransitionPanel({
  storyId,
  status,
  editorName,
  notes,
}: {
  storyId: string;
  status: StoryStatus;
  editorName?: string;
  notes: string[];
}) {
  const allowed = nextStoryTransitions(status);
  const terminal = isTerminalStory(status);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-6)', alignItems: 'start' }}>
      <section aria-labelledby="transitions-title">
        <h3 id="transitions-title" style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-3)' }}>
          Status transitions
        </h3>
        {terminal ? (
          <div style={{ padding: 'var(--spacing-4)', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            This story draft is archived. It cannot be transitioned.
          </div>
        ) : allowed.length === 0 ? (
          <div style={{ padding: 'var(--spacing-4)', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            No transitions are currently allowed from {storyStatusLabel(status)}.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
            {allowed.map((to) => (
              <form key={to} action={transitionStoryAction} style={{ display: 'flex', gap: 'var(--spacing-2)', alignItems: 'center' }}>
                <input type="hidden" name="storyId" value={storyId} />
                <input type="hidden" name="to" value={to} />
                <input
                  type="text"
                  name="note"
                  placeholder="optional note"
                  aria-label={`Note for transition to ${storyStatusLabel(to)}`}
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
                    background: to === 'published' ? 'var(--color-brand-400)' : 'var(--color-bg-primary)',
                    color: to === 'published' ? '#000' : 'var(--color-text-primary)',
                    border: '1px solid var(--color-border-default)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {storyStatusLabel(to)}
                </button>
              </form>
            ))}
            {allowed.some((to) => isVerificationGated(to)) ? (
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-warning)', lineHeight: 1.5 }}>
                Reaching {allowed.filter((to) => isVerificationGated(to)).map(storyStatusLabel).join(' / ')} requires the linked Verification case to be Verified.
              </div>
            ) : null}
          </div>
        )}
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-3)', lineHeight: 1.6 }}>
          Transitions follow the explicit editorial workflow map and are recorded in the append-only audit trail.
        </p>
      </section>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
        <section aria-labelledby="editor-title">
          <h3 id="editor-title" style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-3)' }}>
            Assigned editor
          </h3>
          <div style={{ padding: 'var(--spacing-4)', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
            {editorName ? (
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                Assigned to <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{editorName}</span>.
              </div>
            ) : (
              <form action={assignStoryEditorAction}>
                <input type="hidden" name="storyId" value={storyId} />
                <button
                  type="submit"
                  style={{ padding: '8px 12px', fontSize: 'var(--text-xs)', fontWeight: 600, background: 'var(--color-bg-primary)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
                >
                  Assign me as editor
                </button>
              </form>
            )}
          </div>
        </section>

        <section aria-labelledby="notes-title">
          <h3 id="notes-title" style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-3)' }}>
            Editorial notes
          </h3>
          <div style={{ padding: 'var(--spacing-4)', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
            <form action={addStoryNoteAction} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
              <input type="hidden" name="storyId" value={storyId} />
              <textarea
                name="note"
                rows={3}
                placeholder="Add an editorial note…"
                aria-label="Editorial note"
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
            {notes.length > 0 ? (
              <ul style={{ marginTop: 'var(--spacing-3)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)', paddingLeft: 0, listStyle: 'none' }}>
                {notes.map((n, i) => (
                  <li key={`${i}-${n.slice(0, 12)}`} style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', padding: '8px 10px', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-sm)', lineHeight: 1.5 }}>
                    {n}
                  </li>
                ))}
              </ul>
            ) : (
              <div style={{ marginTop: 'var(--spacing-3)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>No editorial notes yet.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

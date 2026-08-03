import type { VerificationStatus } from '@/lib/intel/verification';
import type {
  StoryActor,
  StoryAuditEntry,
  StoryStatus,
  StoryTransitionResult,
} from './types';
import { canTransitionStory, isVerificationGated, storyStatusLabel } from './status';

// Governing document: docs/intelligence/tbios-master-prompt-v1.md (Story Builder — Editorial
// Status Model, Verification-before-editorial-readiness) + EOS store precedent
// (lib/editorial/eos/eos-store.ts).
//
// In-memory workflow overlay for Story Drafts. The repository has no runtime-writable persistence
// (Supabase schema changes are Level C; Vercel filesystem is read-only at runtime), so the overlay
// mirrors the Verification Service store: module-level deterministic state, seeded idempotently,
// valid for the lifetime of the server process.
//
// The overlay owns ONLY workflow metadata — status, editor, notes, version, and the append-only
// audit trail. Derived content (brief, outline, source panel, readiness, impact) is recomputed from
// the certified engines on every read and never stored here.
//
// Verification gate: transitions to verification_complete, editorial_review, or
// ready_for_publication require the caller to pass verificationStatus === 'verified'. Verification
// is mandatory before editorial readiness — the store refuses to advance past it otherwise.

/** Read-only view of the in-process workflow overlay (as returned by getStoryWorkflow). */
export interface StoryWorkflowView {
  status: StoryStatus;
  editor?: StoryActor;
  assignedAt?: string;
  notes: string[];
  version: number;
  created: string;
  lastTransition?: { at: string; by?: string; from?: StoryStatus; to: StoryStatus };
  audit: StoryAuditEntry[];
}

interface StoryWorkflow extends StoryWorkflowView {
  status: StoryStatus;
}

const BASE_TIME = '2026-07-29T08:00:00.000Z';

const workflows = new Map<string, StoryWorkflow>();
const auditSequence = new Map<string, number>();

function nextAuditId(storyId: string): string {
  const n = (auditSequence.get(storyId) ?? 0) + 1;
  auditSequence.set(storyId, n);
  return `${storyId}-story-audit-${String(n)}`;
}

function isoNow(): string {
  return new Date().toISOString();
}

/** Idempotent seed: creates an 'idea' workflow (with a created audit entry) for any story id not yet present. */
export function ensureStorySeed(storyIds: string[]): void {
  for (const storyId of storyIds) {
    if (workflows.has(storyId)) continue;
    const audit: StoryAuditEntry[] = [
      {
        id: nextAuditId(storyId),
        storyId,
        at: BASE_TIME,
        actorId: 'story-builder-os',
        actorName: 'Story Builder OS',
        action: 'created',
        to: 'idea',
        note: 'Story draft created from certified engine outputs.',
      },
    ];
    workflows.set(storyId, { status: 'idea', notes: [], version: 1, created: BASE_TIME, audit });
  }
}

export function getStoryWorkflow(storyId: string): StoryWorkflowView | undefined {
  const w = workflows.get(storyId);
  if (!w) return undefined;
  return {
    ...w,
    notes: [...w.notes],
    audit: w.audit.map((a) => ({ ...a })),
  };
}

export function getStoryStatus(storyId: string): StoryStatus {
  return workflows.get(storyId)?.status ?? 'idea';
}

export function getStoryVersion(storyId: string): number {
  return workflows.get(storyId)?.version ?? 1;
}

export function getStoryAudit(storyId: string): StoryAuditEntry[] {
  return (workflows.get(storyId)?.audit ?? []).map((a) => ({ ...a }));
}

export interface StoryTransitionOptions {
  verificationStatus?: VerificationStatus | null;
  note?: string;
}

/** Explicit, transition-map-validated status change with the verification gate enforced. */
export function transitionStory(storyId: string, to: StoryStatus, actor: StoryActor, options?: StoryTransitionOptions): StoryTransitionResult {
  const w = workflows.get(storyId);
  if (!w) return { success: false, error: `Unknown story draft ${storyId}.` };
  const from = w.status;
  if (!canTransitionStory(from, to)) {
    return { success: false, error: `Transition ${storyStatusLabel(from)} → ${storyStatusLabel(to)} is not allowed by the editorial workflow.` };
  }
  if (isVerificationGated(to) && options?.verificationStatus !== 'verified') {
    return { success: false, error: `Reaching ${storyStatusLabel(to)} requires the linked verification case to be Verified. Verification is mandatory before editorial readiness.` };
  }
  const at = isoNow();
  const entry: StoryAuditEntry = {
    id: nextAuditId(storyId),
    storyId,
    at,
    actorId: actor.id,
    actorName: actor.name,
    action: 'status_transition',
    from,
    to,
    note: options?.note,
  };
  w.status = to;
  w.lastTransition = { at, by: actor.name, from, to };
  w.version += 1;
  w.audit.push(entry);
  return { success: true, status: to };
}

export function assignStoryEditor(storyId: string, actor: StoryActor): StoryTransitionResult {
  const w = workflows.get(storyId);
  if (!w) return { success: false, error: `Unknown story draft ${storyId}.` };
  w.editor = { id: actor.id, name: actor.name };
  w.assignedAt = isoNow();
  w.version += 1;
  w.audit.push({
    id: nextAuditId(storyId),
    storyId,
    at: w.assignedAt,
    actorId: actor.id,
    actorName: actor.name,
    action: 'editor_assigned',
    note: `Editor assigned: ${actor.name}.`,
  });
  return { success: true, status: w.status };
}

export function addStoryNote(storyId: string, actor: StoryActor, note: string): StoryTransitionResult {
  const w = workflows.get(storyId);
  if (!w) return { success: false, error: `Unknown story draft ${storyId}.` };
  const clean = note.trim();
  if (!clean) return { success: false, error: 'Story note cannot be empty.' };
  w.notes.push(clean);
  w.version += 1;
  w.audit.push({
    id: nextAuditId(storyId),
    storyId,
    at: isoNow(),
    actorId: actor.id,
    actorName: actor.name,
    action: 'note',
    note: clean,
  });
  return { success: true, status: w.status };
}

/** For tests: reset the in-process store. */
export function resetStoryStore(): void {
  workflows.clear();
  auditSequence.clear();
}

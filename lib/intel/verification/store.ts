import type { Actor, AuditEntry, VerificationStatus, VerificationTransitionResult } from './types';
import { canTransition } from './status';
import { verificationStatusLabel } from './status';

// Governing document: docs/intelligence/tbios-master-prompt-v1.md (Verification Workspace — Workflow & Audit Trail)
//
// In-memory workflow overlay for Verification Cases. The repository has no runtime-writable
// persistence (Supabase schema changes are Level C; Vercel filesystem is read-only at runtime),
// so the overlay follows the EOS store precedent (lib/editorial/eos/eos-store.ts): module-level
// deterministic state, seeded idempotently, valid for the lifetime of the server process.
//
// The overlay owns ONLY workflow metadata — status, reviewer, notes, and the append-only audit
// trail. Derived content (claims, conflicts, evidence, field plan, readiness) is recomputed from
// the certified engines on every read and never stored here.
//
// Audit trail invariants: entries are immutable once appended; order is preserved; the trail
// grows monotonically within a process.

interface CaseWorkflow {
  status: VerificationStatus;
  reviewer?: Actor;
  assignedAt?: string;
  reviewNotes: string[];
  lastTransition?: { at: string; by?: string; from?: VerificationStatus; to: VerificationStatus };
  audit: AuditEntry[];
}

const BASE_TIME = '2026-07-28T08:00:00.000Z';

const workflows = new Map<string, CaseWorkflow>();
const auditSequence = new Map<string, number>();

function nextAuditId(caseId: string): string {
  const n = (auditSequence.get(caseId) ?? 0) + 1;
  auditSequence.set(caseId, n);
  return `${caseId}-audit-${String(n)}`;
}

function isoNow(): string {
  return new Date().toISOString();
}

function workflowFor(caseId: string): CaseWorkflow | undefined {
  return workflows.get(caseId);
}

/** Idempotent seed: creates an 'unreviewed' workflow (with a created audit entry) for any case id not yet present. */
export function ensureVerificationSeed(caseIds: string[]): void {
  for (const caseId of caseIds) {
    if (workflows.has(caseId)) continue;
    const audit: AuditEntry[] = [
      {
        id: nextAuditId(caseId),
        caseId,
        at: BASE_TIME,
        actorId: 'verification-os',
        actorName: 'Verification OS',
        action: 'created',
        to: 'unreviewed',
        note: 'Verification case created from certified engine outputs.',
      },
    ];
    workflows.set(caseId, { status: 'unreviewed', reviewNotes: [], audit });
  }
}

export function getVerificationWorkflow(caseId: string): CaseWorkflow | undefined {
  const w = workflowFor(caseId);
  if (!w) return undefined;
  return {
    ...w,
    reviewNotes: [...w.reviewNotes],
    audit: w.audit.map((a) => ({ ...a })),
  };
}

export function getVerificationStatus(caseId: string): VerificationStatus {
  return workflows.get(caseId)?.status ?? 'unreviewed';
}

export function getVerificationAudit(caseId: string): AuditEntry[] {
  return (workflows.get(caseId)?.audit ?? []).map((a) => ({ ...a }));
}

/** Explicit, transition-map-validated status change. Appends an immutable audit entry. */
export function transitionVerificationCase(caseId: string, to: VerificationStatus, actor: Actor, note?: string): VerificationTransitionResult {
  const w = workflowFor(caseId);
  if (!w) return { success: false, error: `Unknown verification case ${caseId}.` };
  const from = w.status;
  if (!canTransition(from, to)) {
    return { success: false, error: `Transition ${verificationStatusLabel(from)} → ${verificationStatusLabel(to)} is not allowed by the verification workflow.` };
  }
  const at = isoNow();
  const entry: AuditEntry = {
    id: nextAuditId(caseId),
    caseId,
    at,
    actorId: actor.id,
    actorName: actor.name,
    action: 'status_transition',
    from,
    to,
    note,
  };
  w.status = to;
  w.lastTransition = { at, by: actor.name, from, to };
  w.audit.push(entry);
  return { success: true, status: to };
}

export function assignVerificationReviewer(caseId: string, actor: Actor): VerificationTransitionResult {
  const w = workflowFor(caseId);
  if (!w) return { success: false, error: `Unknown verification case ${caseId}.` };
  w.reviewer = { id: actor.id, name: actor.name };
  w.assignedAt = isoNow();
  w.audit.push({
    id: nextAuditId(caseId),
    caseId,
    at: w.assignedAt,
    actorId: actor.id,
    actorName: actor.name,
    action: 'reviewer_assigned',
    note: `Reviewer assigned: ${actor.name}.`,
  });
  return { success: true, status: w.status };
}

export function addVerificationNote(caseId: string, actor: Actor, note: string): VerificationTransitionResult {
  const w = workflowFor(caseId);
  if (!w) return { success: false, error: `Unknown verification case ${caseId}.` };
  const clean = note.trim();
  if (!clean) return { success: false, error: 'Review note cannot be empty.' };
  w.reviewNotes.push(clean);
  w.audit.push({
    id: nextAuditId(caseId),
    caseId,
    at: isoNow(),
    actorId: actor.id,
    actorName: actor.name,
    action: 'review_note',
    note: clean,
  });
  return { success: true, status: w.status };
}

/** For tests: reset the in-process store. */
export function resetVerificationStore(): void {
  workflows.clear();
  auditSequence.clear();
}

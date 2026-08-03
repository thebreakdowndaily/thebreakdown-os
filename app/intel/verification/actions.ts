'use server';

import { revalidatePath } from 'next/cache';
import { getSession } from '@/features/auth/auth-server';
import { canAccessIntelModule, normalizeIntelRole, intelRoleLabel } from '@/features/auth/roles';
import {
  ensureVerificationSeed,
  transitionVerificationCase,
  assignVerificationReviewer,
  addVerificationNote,
  getVerificationCaseIds,
} from '@/lib/intel/verification';
import type { VerificationStatus } from '@/lib/intel/verification';

// Governing document: docs/intelligence/tbios-master-prompt-v1.md (Verification Workspace)
// Server actions for the Verification Operating System. Authorization happens HERE, server-side,
// before any workflow mutation — there is no client-side security boundary. All transitions pass
// through the explicit transition map in the Verification Service store.
//
// The exported server actions are form-action compatible (void). The internal *_core functions
// return actionable results and are the testable seam.

type ActionResult =
  | { success: true; message: string }
  | { success: false; error: string };

async function requireVerificationActor(): Promise<{ ok: true; actor: { id: string; name: string } } | { ok: false; error: string }> {
  const session = await getSession();
  if (!session) {
    return { ok: false, error: 'You must be signed in to update a verification case.' };
  }
  const role = normalizeIntelRole(session.user.role);
  if (!canAccessIntelModule(role, 'verification')) {
    return { ok: false, error: `Access denied. The ${intelRoleLabel(role)} role cannot modify verification cases.` };
  }
  const name = session.user.name || session.user.email?.split('@')[0] || 'Reviewer';
  return { ok: true, actor: { id: session.user.id, name } };
}

async function seedFor(caseId: string): Promise<ActionResult | null> {
  try {
    const ids = await getVerificationCaseIds();
    ensureVerificationSeed([...ids, caseId]);
    return null;
  } catch (e) {
    return { success: false, error: `Failed to initialise the verification workspace: ${e instanceof Error ? e.message : 'unknown error'}` };
  }
}

export async function transitionVerificationActionCore(caseId: string, to: VerificationStatus, note: string | undefined, actor: { id: string; name: string }): Promise<ActionResult> {
  if (!caseId || !to) return { success: false, error: 'Missing case id or target status.' };
  const seedError = await seedFor(caseId);
  if (seedError) return seedError;
  const result = transitionVerificationCase(caseId, to, actor, note || undefined);
  if (!result.success) return { success: false, error: result.error };
  revalidatePath('/intel');
  revalidatePath('/intel/verification');
  revalidatePath(`/intel/verification/cases/${caseId}`);
  return { success: true, message: `Verification case updated to ${to}.` };
}

export async function transitionVerificationAction(formData: FormData): Promise<void> {
  const auth = await requireVerificationActor();
  if (!auth.ok) return;
  await transitionVerificationActionCore(
    String(formData.get('caseId') ?? '').trim(),
    String(formData.get('to') ?? '') as VerificationStatus,
    String(formData.get('note') ?? '').trim() || undefined,
    auth.actor
  );
}

export async function assignVerificationReviewerActionCore(caseId: string, actor: { id: string; name: string }): Promise<ActionResult> {
  if (!caseId) return { success: false, error: 'Missing case id.' };
  const seedError = await seedFor(caseId);
  if (seedError) return seedError;
  const result = assignVerificationReviewer(caseId, actor);
  if (!result.success) return { success: false, error: result.error };
  revalidatePath('/intel');
  revalidatePath('/intel/verification');
  revalidatePath(`/intel/verification/cases/${caseId}`);
  return { success: true, message: 'Reviewer assigned.' };
}

export async function assignVerificationReviewerAction(formData: FormData): Promise<void> {
  const auth = await requireVerificationActor();
  if (!auth.ok) return;
  await assignVerificationReviewerActionCore(String(formData.get('caseId') ?? '').trim(), auth.actor);
}

export async function addVerificationNoteActionCore(caseId: string, note: string, actor: { id: string; name: string }): Promise<ActionResult> {
  if (!caseId) return { success: false, error: 'Missing case id.' };
  if (!note) return { success: false, error: 'Review note cannot be empty.' };
  const seedError = await seedFor(caseId);
  if (seedError) return seedError;
  const result = addVerificationNote(caseId, actor, note);
  if (!result.success) return { success: false, error: result.error };
  revalidatePath('/intel');
  revalidatePath('/intel/verification');
  revalidatePath(`/intel/verification/cases/${caseId}`);
  return { success: true, message: 'Review note added.' };
}

export async function addVerificationNoteAction(formData: FormData): Promise<void> {
  const auth = await requireVerificationActor();
  if (!auth.ok) return;
  await addVerificationNoteActionCore(String(formData.get('caseId') ?? '').trim(), String(formData.get('note') ?? '').trim(), auth.actor);
}

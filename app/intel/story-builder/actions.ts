'use server';

import { revalidatePath } from 'next/cache';
import { getSession } from '@/features/auth/auth-server';
import { canAccessIntelModule, normalizeIntelRole, intelRoleLabel } from '@/features/auth/roles';
import {
  ensureStorySeed,
  transitionStory,
  assignStoryEditor,
  addStoryNote,
  getStoryIds,
} from '@/lib/intel/story';
import { getVerificationStatus } from '@/lib/intel/verification';
import type { StoryStatus } from '@/lib/intel/story';

// Governing document: docs/intelligence/tbios-master-prompt-v1.md (Story Builder)
// Server actions for the Story Builder & Editorial Production System. Authorization happens
// HERE, server-side, before any workflow mutation — there is no client-side security boundary.
// All transitions pass through the explicit editorial transition map AND the verification gate
// (reaching verification_complete / editorial_review / ready_for_publication requires the linked
// verification case to be Verified).
//
// The exported server actions are form-action compatible (void). The internal *_core functions
// return actionable results and are the testable seam.

type ActionResult =
  | { success: true; message: string }
  | { success: false; error: string };

async function requireStoryActor(): Promise<{ ok: true; actor: { id: string; name: string } } | { ok: false; error: string }> {
  const session = await getSession();
  if (!session) {
    return { ok: false, error: 'You must be signed in to update a story draft.' };
  }
  const role = normalizeIntelRole(session.user.role);
  if (!canAccessIntelModule(role, 'story-builder')) {
    return { ok: false, error: `Access denied. The ${intelRoleLabel(role)} role cannot modify story drafts.` };
  }
  const name = session.user.name || session.user.email?.split('@')[0] || 'Editor';
  return { ok: true, actor: { id: session.user.id, name } };
}

async function seedFor(storyId: string): Promise<ActionResult | null> {
  try {
    const ids = await getStoryIds();
    ensureStorySeed([...ids, storyId]);
    return null;
  } catch (e) {
    return { success: false, error: `Failed to initialise the Story Builder workspace: ${e instanceof Error ? e.message : 'unknown error'}` };
  }
}

/** Create (seed) a story draft for a constituency. Idempotent. */
export async function createStoryDraftActionCore(storyId: string, actor: { id: string; name: string }): Promise<ActionResult> {
  if (!storyId) return { success: false, error: 'Missing constituency id.' };
  const seedError = await seedFor(storyId);
  if (seedError) return seedError;
  revalidatePath('/intel');
  revalidatePath('/intel/story-builder');
  revalidatePath(`/intel/story-builder/${storyId}`);
  return { success: true, message: 'Story draft created.' };
}

export async function createStoryDraftAction(formData: FormData): Promise<void> {
  const auth = await requireStoryActor();
  if (!auth.ok) return;
  await createStoryDraftActionCore(String(formData.get('storyId') ?? '').trim(), auth.actor);
}

export async function transitionStoryActionCore(storyId: string, to: StoryStatus, note: string | undefined, actor: { id: string; name: string }): Promise<ActionResult> {
  if (!storyId || !to) return { success: false, error: 'Missing story id or target status.' };
  const seedError = await seedFor(storyId);
  if (seedError) return seedError;
  const verificationStatus = getVerificationStatus(storyId);
  const result = transitionStory(storyId, to, actor, { verificationStatus, note: note || undefined });
  if (!result.success) return { success: false, error: result.error };
  revalidatePath('/intel');
  revalidatePath('/intel/story-builder');
  revalidatePath(`/intel/story-builder/${storyId}`);
  return { success: true, message: `Story draft updated to ${to}.` };
}

export async function transitionStoryAction(formData: FormData): Promise<void> {
  const auth = await requireStoryActor();
  if (!auth.ok) return;
  await transitionStoryActionCore(
    String(formData.get('storyId') ?? '').trim(),
    String(formData.get('to') ?? '') as StoryStatus,
    String(formData.get('note') ?? '').trim() || undefined,
    auth.actor
  );
}

export async function assignStoryEditorActionCore(storyId: string, actor: { id: string; name: string }): Promise<ActionResult> {
  if (!storyId) return { success: false, error: 'Missing story id.' };
  const seedError = await seedFor(storyId);
  if (seedError) return seedError;
  const result = assignStoryEditor(storyId, actor);
  if (!result.success) return { success: false, error: result.error };
  revalidatePath('/intel');
  revalidatePath('/intel/story-builder');
  revalidatePath(`/intel/story-builder/${storyId}`);
  return { success: true, message: 'Editor assigned.' };
}

export async function assignStoryEditorAction(formData: FormData): Promise<void> {
  const auth = await requireStoryActor();
  if (!auth.ok) return;
  await assignStoryEditorActionCore(String(formData.get('storyId') ?? '').trim(), auth.actor);
}

export async function addStoryNoteActionCore(storyId: string, note: string, actor: { id: string; name: string }): Promise<ActionResult> {
  if (!storyId) return { success: false, error: 'Missing story id.' };
  if (!note) return { success: false, error: 'Story note cannot be empty.' };
  const seedError = await seedFor(storyId);
  if (seedError) return seedError;
  const result = addStoryNote(storyId, actor, note);
  if (!result.success) return { success: false, error: result.error };
  revalidatePath('/intel');
  revalidatePath('/intel/story-builder');
  revalidatePath(`/intel/story-builder/${storyId}`);
  return { success: true, message: 'Story note added.' };
}

export async function addStoryNoteAction(formData: FormData): Promise<void> {
  const auth = await requireStoryActor();
  if (!auth.ok) return;
  await addStoryNoteActionCore(String(formData.get('storyId') ?? '').trim(), String(formData.get('note') ?? '').trim(), auth.actor);
}

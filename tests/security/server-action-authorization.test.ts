import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => ({
  session: null as any,
  revalidatePath: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: mocks.revalidatePath,
  revalidateTag: vi.fn(),
}));

vi.mock('@/features/auth/auth-server', () => ({
  getSession: vi.fn(async () => mocks.session),
}));

import {
  createStoryDraftAction,
  transitionStoryAction,
  assignStoryEditorAction,
  addStoryNoteAction,
} from '@/app/intel/story-builder/actions';
import {
  transitionVerificationAction,
  assignVerificationReviewerAction,
  addVerificationNoteAction,
} from '@/app/intel/verification/actions';
import {
  getStoryStatus,
  getStoryWorkflow,
  getStoryAudit,
  resetStoryStore,
  ensureStorySeed,
} from '@/lib/intel/story';
import {
  getVerificationStatus,
  getVerificationWorkflow,
  resetVerificationStore,
  ensureVerificationSeed,
} from '@/lib/intel/verification';

describe('Server Action Behavioral Authorization & Impersonation Prevention', () => {
  const storyId = 'constituency-ac-test-01';

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.session = null;
    resetStoryStore();
    resetVerificationStore();
    ensureStorySeed([storyId]);
    ensureVerificationSeed([storyId]);
  });

  describe('Unauthenticated Request Rejection', () => {
    it('rejects createStoryDraftAction when unauthenticated without state mutation', async () => {
      mocks.session = null;
      const formData = new FormData();
      formData.set('storyId', 'unauth-new-story');

      await createStoryDraftAction(formData);

      expect(getStoryWorkflow('unauth-new-story')).toBeUndefined();
    });

    it('rejects transitionStoryAction when unauthenticated without state mutation', async () => {
      mocks.session = null;
      const initialStatus = getStoryStatus(storyId);
      const formData = new FormData();
      formData.set('storyId', storyId);
      formData.set('to', 'planned');

      await transitionStoryAction(formData);

      expect(getStoryStatus(storyId)).toBe(initialStatus);
    });

    it('rejects assignStoryEditorAction when unauthenticated without state mutation', async () => {
      mocks.session = null;
      const formData = new FormData();
      formData.set('storyId', storyId);

      await assignStoryEditorAction(formData);

      const workflow = getStoryWorkflow(storyId);
      expect(workflow?.editor).toBeUndefined();
    });

    it('rejects addStoryNoteAction when unauthenticated without state mutation', async () => {
      mocks.session = null;
      const formData = new FormData();
      formData.set('storyId', storyId);
      formData.set('note', 'Privileged note from attacker');

      await addStoryNoteAction(formData);

      const workflow = getStoryWorkflow(storyId);
      expect(workflow?.notes || []).toHaveLength(0);
    });

    it('rejects verification mutations when unauthenticated without state mutation', async () => {
      mocks.session = null;
      const initialStatus = getVerificationStatus(storyId);

      const formTransition = new FormData();
      formTransition.set('caseId', storyId);
      formTransition.set('to', 'in_review');
      await transitionVerificationAction(formTransition);
      expect(getVerificationStatus(storyId)).toBe(initialStatus);

      const formAssign = new FormData();
      formAssign.set('caseId', storyId);
      await assignVerificationReviewerAction(formAssign);
      const wf = getVerificationWorkflow(storyId);
      expect(wf?.reviewer).toBeUndefined();

      const formNote = new FormData();
      formNote.set('caseId', storyId);
      formNote.set('note', 'Attacker verification note');
      await addVerificationNoteAction(formNote);
      expect(wf?.notes || []).toHaveLength(0);
    });
  });

  describe('Unauthorized Role Rejection', () => {
    it('rejects story mutations from non-editor roles (e.g. reader)', async () => {
      mocks.session = {
        user: { id: 'reader-001', role: 'reader', name: 'Regular Reader' },
      };

      const initialStatus = getStoryStatus(storyId);
      const form = new FormData();
      form.set('storyId', storyId);
      form.set('to', 'planned');

      await transitionStoryAction(form);
      expect(getStoryStatus(storyId)).toBe(initialStatus);

      const formNote = new FormData();
      formNote.set('storyId', storyId);
      formNote.set('note', 'Unauthorized reader note');
      await addStoryNoteAction(formNote);
      expect(getStoryWorkflow(storyId)?.notes || []).toHaveLength(0);
    });

    it('rejects verification mutations from non-fact-checker roles (e.g. reader)', async () => {
      mocks.session = {
        user: { id: 'reader-001', role: 'reader', name: 'Regular Reader' },
      };

      const form = new FormData();
      form.set('caseId', storyId);
      form.set('to', 'in_review');

      await transitionVerificationAction(form);
      expect(getVerificationStatus(storyId)).not.toBe('in_review');
    });
  });

  describe('Impersonation Prevention & Authorized Workflows', () => {
    it('attributes story mutations strictly to authenticated session actor, ignoring spoofed formData', async () => {
      mocks.session = {
        user: { id: 'editor-legit-42', role: 'editor', name: 'Legit Editor' },
      };

      const form = new FormData();
      form.set('storyId', storyId);
      form.set('note', 'Legitimate editorial note');
      // Attacker attempts to spoof actor metadata in formData
      form.set('actorId', 'spoofed-admin-id');
      form.set('actorName', 'Spoofed Superuser');

      await addStoryNoteAction(form);

      const workflow = getStoryWorkflow(storyId);
      expect(workflow?.notes).toHaveLength(1);
      expect(workflow?.notes[0]).toBe('Legitimate editorial note');

      const audit = getStoryAudit(storyId);
      const noteAudit = audit.find((a) => a.action === 'note');
      expect(noteAudit).toBeDefined();
      expect(noteAudit?.actorId).toBe('editor-legit-42');
      expect(noteAudit?.actorName).toBe('Legit Editor');
      expect(noteAudit?.actorId).not.toBe('spoofed-admin-id');
    });

    it('allows authorized editor to transition story according to state machine', async () => {
      mocks.session = {
        user: { id: 'editor-legit-42', role: 'editor', name: 'Legit Editor' },
      };

      const form = new FormData();
      form.set('storyId', storyId);
      form.set('to', 'planned');

      await transitionStoryAction(form);

      expect(getStoryStatus(storyId)).toBe('planned');
    });

    it('allows authorized editor to assign editor to story draft', async () => {
      mocks.session = {
        user: { id: 'editor-legit-42', role: 'editor', name: 'Legit Editor' },
      };

      const form = new FormData();
      form.set('storyId', storyId);

      await assignStoryEditorAction(form);

      const workflow = getStoryWorkflow(storyId);
      expect(workflow?.editor?.id).toBe('editor-legit-42');
      expect(workflow?.editor?.name).toBe('Legit Editor');
    });
  });
});

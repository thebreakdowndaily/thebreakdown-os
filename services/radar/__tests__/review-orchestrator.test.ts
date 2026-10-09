import { describe, it, expect, vi, beforeEach } from 'vitest';
import { applyTabularReviewDecision } from '../tables/review-orchestrator';
import { CanonicalStoryService } from '@/services/stories/canonical-repository';
import { EvidenceVaultService } from '@/services/intelligence/evidence-vault.service';
import { EventBus } from '@/lib/events/event-bus';
import { Claim, Story } from '@/types/canonical';

// Mock dependencies
vi.mock('@/services/stories/canonical-repository');
vi.mock('@/services/intelligence/evidence-vault.service');
vi.mock('@/lib/events/event-bus', () => ({
  EventBus: {
    getInstance: vi.fn(() => ({
      publish: vi.fn()
    }))
  }
}));

describe('Tabular Review Orchestrator (Phase 4B-3J)', () => {
  let storyService: any;
  let vaultService: any;
  let mockEmit: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockEmit = vi.fn();
    (EventBus.getInstance as any).mockReturnValue({ publish: mockEmit });

    storyService = new CanonicalStoryService() as any;
    storyService.getStory = vi.fn();
    storyService.saveStoryOCC = vi.fn();

    vaultService = new EvidenceVaultService(null as any) as any;
    vaultService.lockRetention = vi.fn();
    // Simulate that by default, vault verification check passes
    vaultService.getArtifactMetadata = vi.fn().mockResolvedValue({
      id: 'arch-1',
      retentionState: 'verified'
    });
    vaultService.verifyCryptographicIntegrity = vi.fn().mockResolvedValue(true);
  });

  const getBaseDossier = (claimId: string, classification = 'MATERIAL_VALUE_CHANGE') => ({
    dossierId: 'd-1',
    archiveIdOld: 'arch-1',
    archiveIdNew: 'arch-2',
    tableIdOld: 't1',
    tableIdNew: 't1',
    globalMutations: [],
    affectedClaims: [{
      claimId,
      classification,
      cellAddress: { archiveId: 'arch-1', tableIndex: 0, tableId: 't1', rowKey: 'r1', columnKey: 'c1', snapshot: { raw: '10' } },
      oldSnapshot: { raw: '10' },
      newSnapshot: { raw: '20' },
      reviewState: 'REVIEW_REQUIRED'
    }],
    hasAmbiguity: false,
    generatedAt: 'now'
  });

  const getBaseStory = (claimId: string, status: 'verified' | 'unverified' = 'verified', pubStatus: 'published' | 'draft' = 'published'): Story => ({
    id: 's1',
    title: 'Test',
    slug: 'test',
    status: pubStatus as any,
    publicationStatus: pubStatus,
    claims: [{
      id: claimId,
      claim: 'Test claim',
      status,
      archiveId: 'arch-1',
      cellAddress: { archiveId: 'arch-1', tableIndex: 0, tableId: 't1', rowKey: 'r1', columnKey: 'c1', snapshot: { raw: '10' } }
    }]
  } as any);

  it('rejects unauthenticated reviewer', async () => {
    const res = await applyTabularReviewDecision('', getBaseDossier('c1') as any, 's1', 'c1', 'APPROVE_NEW_BASELINE', vaultService, storyService);
    expect(res.outcome).toBe('REJECTED');
    expect(res.errorReason).toContain('Authentication');
  });

  it('rejects if story not found', async () => {
    storyService.getStory.mockResolvedValueOnce(undefined);
    const res = await applyTabularReviewDecision('ed1', getBaseDossier('c1') as any, 's1', 'c1', 'APPROVE_NEW_BASELINE', vaultService, storyService);
    expect(res.outcome).toBe('REJECTED');
    expect(res.errorReason).toContain('not found');
  });

  it('rejects legacy claims', async () => {
    const story = getBaseStory('c1');
    story.claims[0].cellAddress = undefined; // Legacy
    storyService.getStory.mockResolvedValueOnce(story);

    const res = await applyTabularReviewDecision('ed1', getBaseDossier('c1') as any, 's1', 'c1', 'APPROVE_NEW_BASELINE', vaultService, storyService);
    expect(res.outcome).toBe('REJECTED');
    expect(res.transition?.reasonCode).toBe('REJECTED_LEGACY_CLAIM');
  });

  it('returns ALREADY_APPLIED for duplicate submissions', async () => {
    const story = getBaseStory('c1');
    story.claims[0].cellAddress!.snapshot.raw = '20'; // Already matches new snapshot
    storyService.getStory.mockResolvedValueOnce(story);

    const res = await applyTabularReviewDecision('ed1', getBaseDossier('c1') as any, 's1', 'c1', 'APPROVE_NEW_BASELINE', vaultService, storyService);
    expect(res.outcome).toBe('ALREADY_APPLIED');
  });

  it('returns RECONCILIATION_REQUIRED if story save fails after vault updates', async () => {
    storyService.getStory.mockResolvedValueOnce(getBaseStory('c1'));
    vaultService.lockRetention.mockResolvedValueOnce(undefined as any); // Success
    storyService.saveStoryOCC.mockRejectedValueOnce(new Error('OCC_FAILURE: DB failure')); // Failure

    const res = await applyTabularReviewDecision('ed1', getBaseDossier('c1') as any, 's1', 'c1', 'APPROVE_NEW_BASELINE', vaultService, storyService);
    expect(res.outcome).toBe('RECONCILIATION_REQUIRED');
    
  });

  it('processes APPROVE_NEW_BASELINE and updates story successfully', async () => {
    vaultService.getArtifactMetadata.mockResolvedValue({ id: 'arch-2', retentionState: 'verified' } as any);
    storyService.getStory.mockResolvedValueOnce(getBaseStory('c1'));
    storyService.saveStoryOCC.mockResolvedValueOnce(undefined as any);

    const res = await applyTabularReviewDecision('ed1', getBaseDossier('c1') as any, 's1', 'c1', 'APPROVE_NEW_BASELINE', vaultService, storyService);
    
    expect(res.outcome).toBe('APPLIED');
    expect(vaultService.lockRetention).toHaveBeenCalledWith('arch-2', expect.objectContaining({ verifierId: 'ed1' }));
    
    // Checks that the new claim state is pushed
    const updatedStoryArg = storyService.saveStoryOCC.mock.calls[0][0];
    expect(updatedStoryArg.claims[0].cellAddress.snapshot.raw).toBe('20');
    expect(updatedStoryArg.claims[0].archiveId).toBe('arch-2');
    
    // Checks that publication guard worked
    const saveOptions = storyService.saveStoryOCC.mock.calls[0][2];
    expect(saveOptions?.publicationToken).toBeDefined();

    // Event bus emission
    expect(mockEmit).toHaveBeenCalled();
  });

  it('processes RETRACT_CLAIM and preserves publication if evidence guard passes', async () => {
    storyService.getStory.mockResolvedValueOnce(getBaseStory('c1', 'verified', 'published'));
    storyService.saveStoryOCC.mockResolvedValueOnce(undefined as any);

    const res = await applyTabularReviewDecision('ed1', getBaseDossier('c1') as any, 's1', 'c1', 'RETRACT_CLAIM', vaultService, storyService);
    
    expect(res.outcome).toBe('APPLIED');
    expect(vaultService.lockRetention).not.toHaveBeenCalled(); // Retraction does not require new vault locking
    
    const updatedStoryArg = storyService.saveStoryOCC.mock.calls[0][0];
    expect(updatedStoryArg.claims[0].status).toBe('unverified');
    
    // Because evidence is unverified but artifact exists, validation is still true for the story
    // It remains published
    expect(updatedStoryArg.publicationStatus).toBe('published');
    expect(updatedStoryArg.status).toBe('published');
    const saveOptions = storyService.saveStoryOCC.mock.calls[0][2];
    expect(saveOptions?.publicationToken).toBeDefined();
  });

  it('processes DISMISS_IRRELEVANT gracefully', async () => {
    storyService.getStory.mockResolvedValueOnce(getBaseStory('c1'));
    
    const res = await applyTabularReviewDecision('ed1', getBaseDossier('c1') as any, 's1', 'c1', 'DISMISS_IRRELEVANT', vaultService, storyService);
    expect(res.outcome).toBe('ALREADY_APPLIED');
  });

  it('rejects ambiguous approval rejection', async () => {
    storyService.getStory.mockResolvedValueOnce(getBaseStory('c1'));
    const dossier = getBaseDossier('c1');
    dossier.hasAmbiguity = true;

    const res = await applyTabularReviewDecision('ed1', dossier as any, 's1', 'c1', 'APPROVE_NEW_BASELINE', vaultService, storyService);
    expect(res.outcome).toBe('REJECTED');
    expect(res.errorReason).toContain('ambiguous table lineage');
  });
});

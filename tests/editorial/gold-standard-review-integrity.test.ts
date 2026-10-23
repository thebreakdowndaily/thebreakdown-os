/**
 * ─── The Breakdown OS — Gold Standard Review Integrity Regression Suite ──────
 * Governing Documents:
 *   - Level 1 Editorial Constitution Article XI (7-Phase Gold Standard Review)
 *   - Level 1 Editorial Constitution Article XIII (Cryptographic Immutability)
 *   - docs/editorial/newsroom-readiness/2026-10-23-constitution-to-code-gap-matrix.md (CR-01, CR-02, CR-03)
 *
 * Verifies all 12 core requirements for Gold Standard Review integrity.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import type { Story, Claim, Source, StoryBlock } from '@/types/canonical';
import type { Principal } from '@/features/auth/principal';
import {
  computeStoryContentFingerprint,
  verifyStoryContentFingerprint,
} from '@/lib/editorial/content-fingerprint';
import {
  createDefaultGoldStandardAudit,
  createValidGoldStandardAudit,
  validateGoldStandardAuditRecord,
  evaluateGoldStandardPass,
  type GoldStandardAuditRecord,
} from '@/lib/editorial/gold-standard-review';
import {
  validateStoryForPublication,
  validateStoryForPublicationAsync,
} from '@/lib/editorial/publication-gate';
import {
  evaluatePublicationContract,
  evaluatePublicationContractAsync,
} from '@/lib/editorial/canonical-publication';
import { MemoryStoryService } from '@/services/repositories/memory/story';

function createMockEditor(id = 'usr-editor-1'): Principal {
  return {
    userId: id,
    email: 'editor@thebreakdown.in',
    name: 'Senior Editor',
    role: 'editor',
    isSuperAdmin: false,
    status: 'active',
    organizationId: null,
  };
}

function buildBaseStory(id = 'story-gsr-1', author = 'Aditi Sharma'): Story {
  return {
    id,
    title: 'Deep Investigation into Groundwater Governance',
    slug: 'groundwater-governance-investigation',
    headline: 'Groundwater Depletion Reaches Critical Tipping Point Across Northern Plains',
    summary: 'A multi-year investigation tracking extraction data, irrigation contracts, and aquifer levels.',
    heroImage: '/images/groundwater.jpg',
    author,
    category: 'governance',
    status: 'scheduled',
    publicationStatus: 'scheduled',
    storyType: 'standard',
    evidenceScore: 94,
    readingTime: 8,
    publishedAt: '2026-10-25T10:00:00Z',
    createdAt: '2026-10-20T00:00:00Z',
    updatedAt: '2026-10-22T00:00:00Z',
    tags: ['water', 'environment', 'policy'],
    blocks: [
      { id: 'b1', type: 'paragraph', data: { text: 'Aquifer recharge rates have declined by 42% over the decade.' } },
      { id: 'b2', type: 'paragraph', data: { text: 'Official groundwater reports show widespread over-extraction.' } },
    ] as StoryBlock[],
    sources: [
      {
        id: 'src-cwa-2026',
        title: 'Central Ground Water Board Report 2026',
        url: 'https://cgwb.gov.in/report-2026.pdf',
        tier: 1,
      } as Source,
    ],
    claims: [
      {
        id: 'clm-recharge-drop',
        claim: 'Aquifer recharge dropped 42% between 2016 and 2026',
        source: 'Central Ground Water Board Report 2026',
        sourceUrl: 'https://cgwb.gov.in/report-2026.pdf',
        archiveId: 'arch-cgwb-001',
        isLegacy: false,
        tier: 1,
        confidence: 96,
        status: 'verified',
      } as Claim,
    ],
    timeline: [],
    faq: [],
    charts: [],
    relatedStoryIds: [],
    relatedEntityIds: [],
    relatedTopicIds: [],
  };
}

describe('Gold Standard Review Integrity Suite (CR-01, CR-02, CR-03)', () => {


  // ─── Test 1: Density Fallback Removed ───────────────────────────────────────
  it('Test 1: Density fallback removed — story with high source/claim density but missing audit is blocked', () => {
    const story = buildBaseStory();
    // Deliberately ensure goldStandardAudit is undefined
    delete story.goldStandardAudit;
    delete (story as any).contentFingerprint;

    expect(story.sources.length).toBeGreaterThan(0);
    expect(story.claims.length).toBeGreaterThan(0);

    const gateResult = validateStoryForPublication(
      { storyId: story.id, triggeredBy: 'manual' },
      story
    );

    expect(gateResult.passed).toBe(false);
    const gate11 = gateResult.checks.find(c => c.name === 'gold_standard_review');
    expect(gate11).toBeDefined();
    expect(gate11?.passed).toBe(false);
    expect(gate11?.reason).toContain('Missing Gold Standard Review record');
    expect(gate11?.reason).not.toContain('foundational evidence and claim density requirements');
  });

  // ─── Test 2: Mismatched storyId ───────────────────────────────────────────
  it('Test 2: Audit bound to mismatched storyId fails closed', () => {
    const storyA = buildBaseStory('story-alpha');
    const validAuditA = createValidGoldStandardAudit(storyA);

    const storyB = buildBaseStory('story-beta');
    // Attach audit from story A to story B
    storyB.goldStandardAudit = validAuditA;

    const validation = validateGoldStandardAuditRecord(storyB.goldStandardAudit, storyB);
    expect(validation.valid).toBe(false);
    expect(validation.violations.some(v => v.includes('Audit belongs to another story'))).toBe(true);

    const gateResult = validateStoryForPublication(
      { storyId: storyB.id, triggeredBy: 'manual' },
      storyB
    );
    expect(gateResult.passed).toBe(false);
    const gate11 = gateResult.checks.find(c => c.name === 'gold_standard_review');
    expect(gate11?.passed).toBe(false);
    expect(gate11?.reason).toContain('Audit belongs to another story');
  });

  // ─── Test 3: Missing phases or unpassed phase ──────────────────────────────
  it('Test 3: Incomplete phases, malformed records, or unpassed phases fail closed', () => {
    const story = buildBaseStory();

    // 3a: Non-object audit record
    const valMalformed = validateGoldStandardAuditRecord('not-an-object', story);
    expect(valMalformed.valid).toBe(false);
    expect(valMalformed.violations[0]).toContain('missing or not an object');

    // 3b: Missing one required phase (Phase 4 Bias Audit deleted)
    const auditMissingPhase = createValidGoldStandardAudit(story);
    delete (auditMissingPhase.phases as any).phase4BiasAudit;
    const valMissing = validateGoldStandardAuditRecord(auditMissingPhase, story);
    expect(valMissing.valid).toBe(false);
    expect(valMissing.violations.some(v => v.includes('Missing required audit phase: Bias Audit'))).toBe(true);

    // 3c: One phase unpassed (Phase 2 Reader Review passed = false)
    const auditUnpassed = createValidGoldStandardAudit(story);
    auditUnpassed.phases.phase2ReaderReview.passed = false;
    const valUnpassed = validateGoldStandardAuditRecord(auditUnpassed, story);
    expect(valUnpassed.valid).toBe(false);
    expect(valUnpassed.violations.some(v => v.includes('Reader Review') && v.includes('has not passed'))).toBe(true);
  });

  // ─── Test 4: Missing auditor ID or invalid timestamp ────────────────────────
  it('Test 4: Passed phase without auditor ID, unparseable date, or future date fails closed', () => {
    const story = buildBaseStory();

    // 4a: Missing auditorId on passed phase
    const auditNoAuditor = createValidGoldStandardAudit(story);
    auditNoAuditor.phases.phase3EvidenceAudit.auditorId = '';
    const valNoAuditor = validateGoldStandardAuditRecord(auditNoAuditor, story);
    expect(valNoAuditor.valid).toBe(false);
    expect(valNoAuditor.violations.some(v => v.includes('missing required auditor identity'))).toBe(true);

    // 4b: Unparseable auditDate
    const auditBadDate = createValidGoldStandardAudit(story);
    auditBadDate.phases.phase3EvidenceAudit.auditDate = 'garbage-date-string';
    const valBadDate = validateGoldStandardAuditRecord(auditBadDate, story);
    expect(valBadDate.valid).toBe(false);
    expect(valBadDate.violations.some(v => v.includes('unparseable auditDate'))).toBe(true);

    // 4c: Future auditDate beyond clock drift tolerance (10 days in future)
    const auditFutureDate = createValidGoldStandardAudit(story);
    const tenDaysFuture = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();
    auditFutureDate.phases.phase3EvidenceAudit.auditDate = tenDaysFuture;
    const valFuture = validateGoldStandardAuditRecord(auditFutureDate, story);
    expect(valFuture.valid).toBe(false);
    expect(valFuture.violations.some(v => v.includes('future auditDate'))).toBe(true);
  });

  // ─── Test 5: Reviewer independence (Author cannot self-audit) ───────────────
  it('Test 5: Author self-reviewing independent phases violates reviewer independence', () => {
    const story = buildBaseStory('story-independence', 'Siddharth Mukherjee');

    // 5a: Author attempts to sign off on Phase 3 (Evidence Audit)
    const auditAuthorAsFactChecker = createValidGoldStandardAudit(story);
    auditAuthorAsFactChecker.phases.phase3EvidenceAudit.auditorId = 'siddharth mukherjee';
    auditAuthorAsFactChecker.phases.phase3EvidenceAudit.auditorName = 'Siddharth Mukherjee';
    const val1 = validateGoldStandardAuditRecord(auditAuthorAsFactChecker, story);
    expect(val1.valid).toBe(false);
    expect(val1.violations.some(v => v.includes('Reviewer independence violation in Phase 3'))).toBe(true);

    // 5b: Author attempts to sign off on Phase 4 (Bias Audit)
    const auditAuthorAsBiasEditor = createValidGoldStandardAudit(story);
    auditAuthorAsBiasEditor.phases.phase4BiasAudit.auditorId = 'Siddharth Mukherjee';
    const val2 = validateGoldStandardAuditRecord(auditAuthorAsBiasEditor, story);
    expect(val2.valid).toBe(false);
    expect(val2.violations.some(v => v.includes('Reviewer independence violation in Phase 4'))).toBe(true);

    // 5c: Author attempts to sign off on Phase 7 (Defensibility Signoff)
    const auditAuthorAsEic = createValidGoldStandardAudit(story);
    auditAuthorAsEic.phases.phase7DefensibilityAudit.auditorId = 'Siddharth Mukherjee';
    const val3 = validateGoldStandardAuditRecord(auditAuthorAsEic, story);
    expect(val3.valid).toBe(false);
    expect(val3.violations.some(v => v.includes('Reviewer independence violation in Phase 7'))).toBe(true);
  });

  // ─── Test 6: Blocking issue counts ──────────────────────────────────────────
  it('Test 6: Negative or unresolved blocking issue counts fail validation', () => {
    const story = buildBaseStory();

    // 6a: Negative blocking issues count
    const auditNegative = createValidGoldStandardAudit(story);
    auditNegative.phases.phase1ExpertReview.blockingIssuesCount = -1;
    const valNegative = validateGoldStandardAuditRecord(auditNegative, story);
    expect(valNegative.valid).toBe(false);
    expect(valNegative.violations.some(v => v.includes('negative blockingIssuesCount'))).toBe(true);

    // 6b: Non-integer blocking issues count
    const auditFloat = createValidGoldStandardAudit(story);
    (auditFloat.phases.phase1ExpertReview as any).blockingIssuesCount = 1.5;
    const valFloat = validateGoldStandardAuditRecord(auditFloat, story);
    expect(valFloat.valid).toBe(false);
    expect(valFloat.violations.some(v => v.includes('Must be an integer'))).toBe(true);

    // 6c: Unresolved blocking issues count (> 0)
    const auditUnresolved = createValidGoldStandardAudit(story);
    auditUnresolved.phases.phase1ExpertReview.blockingIssuesCount = 2;
    const valUnresolved = validateGoldStandardAuditRecord(auditUnresolved, story);
    expect(valUnresolved.valid).toBe(false);
    expect(valUnresolved.violations.some(v => v.includes('2 unresolved blocking issue(s)'))).toBe(true);
  });

  // ─── Test 7: Valid audit bound to fingerprint passes ───────────────────────
  it('Test 7: Valid complete 7-phase audit bound to fingerprint passes Gate 11', () => {
    const story = buildBaseStory();
    story.goldStandardAudit = createValidGoldStandardAudit(story);
    story.contentFingerprint = story.goldStandardAudit.contentFingerprint;

    const validation = validateGoldStandardAuditRecord(story.goldStandardAudit, story);
    expect(validation.valid).toBe(true);
    expect(validation.derivedOverallPassed).toBe(true);
    expect(validation.derivedCompletedPhasesCount).toBe(7);
    expect(validation.derivedBlockingIssuesCount).toBe(0);
    expect(validation.contentFingerprintMatched).toBe(true);
    expect(validation.violations).toHaveLength(0);

    const gateResult = validateStoryForPublication(
      { storyId: story.id, triggeredBy: 'manual' },
      story
    );
    expect(gateResult.passed).toBe(true);
    const gate11 = gateResult.checks.find(c => c.name === 'gold_standard_review');
    expect(gate11?.passed).toBe(true);
  });

  // ─── Test 8: Content fingerprint invalidation on material edit ──────────────
  it('Test 8: Material content change invalidates prior audit approval', () => {
    const story = buildBaseStory();
    const originalAudit = createValidGoldStandardAudit(story);
    story.goldStandardAudit = originalAudit;
    story.contentFingerprint = originalAudit.contentFingerprint;

    expect(validateGoldStandardAuditRecord(story.goldStandardAudit, story).valid).toBe(true);

    // 8a: Modifying headline invalidates review
    const storyModHeadline = { ...story, headline: 'New Material Headline Change' };
    const valHeadline = validateGoldStandardAuditRecord(story.goldStandardAudit, storyModHeadline);
    expect(valHeadline.valid).toBe(false);
    expect(valHeadline.violations.some(v => v.includes('Audit content fingerprint mismatch'))).toBe(true);

    // 8b: Modifying blocks invalidates review
    const storyModBlocks = {
      ...story,
      blocks: [...story.blocks, { id: 'b3', type: 'paragraph', data: { text: 'Injected unreviewed claim paragraph.' } }] as StoryBlock[],
    };
    const valBlocks = validateGoldStandardAuditRecord(story.goldStandardAudit, storyModBlocks);
    expect(valBlocks.valid).toBe(false);
    expect(valBlocks.violations.some(v => v.includes('Audit content fingerprint mismatch'))).toBe(true);

    // 8c: Modifying claims invalidates review
    const storyModClaims = {
      ...story,
      claims: [
        ...story.claims,
        { id: 'c-new', claim: 'Unverified material assertion', source: 'Blog', tier: 1, confidence: 90, status: 'verified' } as Claim,
      ],
    };
    const valClaims = validateGoldStandardAuditRecord(story.goldStandardAudit, storyModClaims);
    expect(valClaims.valid).toBe(false);
    expect(valClaims.violations.some(v => v.includes('Audit content fingerprint mismatch'))).toBe(true);

    // 8d: Non-material changes (e.g. updatedAt, notes, version) DO NOT invalidate review
    const storyNonMaterial = {
      ...story,
      updatedAt: '2026-10-24T12:34:56Z',
      notes: 'Internal workflow note from editor desk',
      version: 5,
    };
    const valNonMaterial = validateGoldStandardAuditRecord(story.goldStandardAudit, storyNonMaterial);
    expect(valNonMaterial.valid).toBe(true);
  });

  // ─── Test 9: Client cannot forge summary booleans ───────────────────────────
  it('Test 9: Client cannot forge review approval with arbitrary summary booleans', () => {
    const story = buildBaseStory();
    const forgedAudit: GoldStandardAuditRecord = {
      storyId: story.id,
      contentFingerprint: computeStoryContentFingerprint(story),
      overallPassed: true,          // FORGED
      completedPhasesCount: 7,      // FORGED
      phases: {
        phase1ExpertReview: { phaseId: 1, phaseName: 'Expert Review', passed: false, blockingIssuesCount: 1 },
        phase2ReaderReview: { phaseId: 2, phaseName: 'Reader Review', passed: false, blockingIssuesCount: 0 },
        phase3EvidenceAudit: { phaseId: 3, phaseName: 'Evidence Audit', passed: false, blockingIssuesCount: 0 },
        phase4BiasAudit: { phaseId: 4, phaseName: 'Bias Audit', passed: false, blockingIssuesCount: 0 },
        phase5VisualAudit: { phaseId: 5, phaseName: 'Visual Audit', passed: false, blockingIssuesCount: 0 },
        phase6KnowledgeDensityAudit: { phaseId: 6, phaseName: 'Knowledge Density', passed: false, blockingIssuesCount: 0 },
        phase7DefensibilityAudit: { phaseId: 7, phaseName: 'Defensibility', passed: false, blockingIssuesCount: 0 },
      },
      lastAuditTimestamp: new Date().toISOString(),
    };

    const val = validateGoldStandardAuditRecord(forgedAudit, story);
    expect(val.valid).toBe(false);
    expect(val.derivedOverallPassed).toBe(false);
    expect(val.derivedCompletedPhasesCount).toBe(0);
    expect(val.violations.some(v => v.includes('Audit record claims overallPassed=true, but verified phase records do not satisfy pass criteria'))).toBe(true);
  });

  // ─── Test 10: Publication paths enforce Evidence Vault + Gold Standard ──────
  it('Test 10: Manual and scheduled publication paths enforce Evidence Vault and Gold Standard review', async () => {
    const editor = createMockEditor();
    const story = buildBaseStory();
    // Valid audit attached
    story.goldStandardAudit = createValidGoldStandardAudit(story);
    story.contentFingerprint = story.goldStandardAudit.contentFingerprint;

    // 10a: Synchronous evaluatePublicationContract never issues a publication token
    const syncDecision = evaluatePublicationContract(story, story, editor);
    expect(syncDecision.allowed).toBe(true);
    expect(syncDecision.publicationToken).toBeUndefined(); // MUST BE UNDEFINED

    // 10b: evaluatePublicationContractAsync evaluates all gates and issues publication token
    const mockVaultPass: any = {
      getArtifactMetadata: async (id: string) => ({
        id,
        byteLength: 2048,
        preservationState: 'preserved',
        retentionState: 'verified',
      }),
      verifyCryptographicIntegrity: async () => true,
    };
    const asyncDecision = await evaluatePublicationContractAsync(story, story, editor, { vault: mockVaultPass });
    expect(asyncDecision.allowed).toBe(true);
    expect(asyncDecision.publicationToken).toBeDefined();

    // 10c: Story without valid audit fails evaluatePublicationContractAsync with 422
    const unAuditedStory = buildBaseStory('story-no-audit');
    delete unAuditedStory.goldStandardAudit;
    const blockedDecision = await evaluatePublicationContractAsync(unAuditedStory, unAuditedStory, editor);
    expect(blockedDecision.allowed).toBe(false);
    expect(blockedDecision.httpStatus).toBe(422);
    expect(blockedDecision.error).toContain('gold_standard_review');

    // 10d: MemoryStoryService.publishStory fails closed when audit is invalid/missing
    const repo = new MemoryStoryService([unAuditedStory], mockVaultPass);
    await expect(repo.publishStory(unAuditedStory.id)).rejects.toThrow(/Gold Standard Review/);
  });

  // ─── Test 11: Actionable diagnostics and no visibility leak on failure ──────
  it('Test 11: Failed publication attempts produce actionable diagnostics and do not leak visibility', async () => {
    const story = buildBaseStory('story-diag-1');
    const auditWithBlocker = createValidGoldStandardAudit(story);
    auditWithBlocker.phases.phase3EvidenceAudit.blockingIssuesCount = 1;
    auditWithBlocker.phases.phase3EvidenceAudit.notes = 'Unverified statistic in paragraph 1';
    story.goldStandardAudit = auditWithBlocker;

    const gateResult = validateStoryForPublication(
      { storyId: story.id, triggeredBy: 'manual' },
      story
    );

    expect(gateResult.passed).toBe(false);
    const gate11 = gateResult.checks.find(c => c.name === 'gold_standard_review');
    expect(gate11?.reason).toContain('1 unresolved blocking issue(s)');

    // Ensure story remains unpublished in repository and not accessible publicly
    const repo = new MemoryStoryService([story]);
    const publicStories = await repo.getPublicStories();
    expect(publicStories.data.some(s => s.id === story.id)).toBe(false);

    const publicSlug = await repo.getPublicStoryBySlug(story.slug);
    expect(publicSlug).toBeUndefined();
  });

  // ─── Test 12: Existing public stories & ordinary edits retain behavior ──────
  it('Test 12: Existing public stories retain access; ordinary non-public edits succeed; material edits require re-review', async () => {
    // 12a: An existing public story continues to be readable
    const publicStory = buildBaseStory('story-legacy-pub');
    publicStory.status = 'published';
    publicStory.publicationStatus = 'published';
    publicStory.publishedAt = '2026-07-01T00:00:00Z';
    // Legacy public slug
    publicStory.slug = 'ng-ch-01-the-promise';

    const repo = new MemoryStoryService([publicStory]);
    const fetched = await repo.getPublicStoryBySlug('ng-ch-01-the-promise');
    expect(fetched).toBeDefined();
    expect(fetched?.id).toBe(publicStory.id);

    // 12b: Ordinary draft saving succeeds without publication token
    const draftStory = buildBaseStory('story-draft-edit');
    draftStory.status = 'draft';
    draftStory.publicationStatus = 'draft';
    await repo.saveStory(draftStory);
    const savedDraft = await repo.getStory(draftStory.id);
    expect(savedDraft?.status).toBe('draft');

    // 12c: Attempting to save directly as 'published' without a token is forbidden
    const illegalPublish = { ...draftStory, status: 'published' as const };
    await expect(repo.saveStory(illegalPublish)).rejects.toThrow(/Direct saveStory with status='published' is prohibited/);
  });
});

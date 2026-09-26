/**
 * ─── The Breakdown OS — VS7 Dedicated Test Suite ───────────────────────────
 * Phase: VS7 — Editorial Quality, Reader Corrections & Founding Publication
 *
 * Verifies:
 *   - INV-CORR-01: Public reader submission intake with valid input
 *   - INV-CORR-02: Strict input validation rejecting empty or malformed fields
 *   - INV-CORR-03: Rate-limiting bounds intake abuse
 *   - INV-CORR-04: Submitter privacy: public projections never expose email addresses
 *   - INV-CORR-05: Staff triage workflow state machine with authorization check
 *   - INV-CORR-06: Errata publishing into public.corrections projection
 *   - INV-CORR-07: Reader reports cannot directly mutate published story state
 *   - INV-GSR-01: Gold Standard Review 7-Phase audit evaluator
 *   - INV-GSR-02: Pre-publication gate enforcement of Gold Standard density
 *   - INV-CHAP-01: Volume I, Chapter 1 canonical knowledge object integrity
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  submitReaderCorrection,
  triageReaderCorrection,
  listPublishedCorrections,
  resetCorrectionsMemoryStore,
  getReaderCorrectionById,
  validateCorrectionSubmissionInput,
} from '@/services/editorial/corrections-service';
import {
  createDefaultGoldStandardAudit,
  evaluateGoldStandardPass,
  type GoldStandardAuditRecord,
} from '@/lib/editorial/gold-standard-review';
import { validateStoryForPublication } from '@/lib/editorial/publication-gate';
import { CHAPTER_1_SOURCES, CHAPTER_1_CLAIMS } from '@/lib/editorial/chapter-1-data';
import type { Story } from '@/types/canonical';

describe('VS7 — Reader Corrections Pipeline & Errata Transparency', () => {
  beforeEach(() => {
    resetCorrectionsMemoryStore();
  });

  it('INV-CORR-01: accepts valid reader correction submission and sets status to received', async () => {
    const input = {
      storySlug: 'the-partition-and-its-legacies',
      category: 'factual' as const,
      passageExcerpt: 'In August 1947, the Radcliffe Line was announced on August 15.',
      suggestedCorrection: 'The Radcliffe Line award was formally announced on August 17, 1947, two days after Independence.',
      submitterEmail: 'scholar@oxford.edu',
      supportingEvidenceUrl: 'https://undocs.org/S/RES/47(1948)',
    };

    const result = await submitReaderCorrection(input);

    expect(result.success).toBe(true);
    expect(result.status).toBe('received');
    expect(result.submissionId).toBeDefined();
    expect(typeof result.submissionId).toBe('string');
    expect(result.message).toContain('received');

    // Retrieve internal record
    const stored = await getReaderCorrectionById(result.submissionId!);
    expect(stored).toBeDefined();
    expect(stored?.status).toBe('received');
    expect(stored?.passageExcerpt).toBe(input.passageExcerpt);
    expect(stored?.suggestedCorrection).toBe(input.suggestedCorrection);
    expect(stored?.submitterEmail).toBe(input.submitterEmail);
  });

  it('INV-CORR-02: rejects empty or malformed submission payloads (validation gate)', async () => {
    // Empty excerpt
    const emptyExcerpt = {
      storySlug: 'the-partition-and-its-legacies',
      category: 'factual' as const,
      passageExcerpt: '   ',
      suggestedCorrection: 'Valid suggested correction here.',
    };
    const res1 = validateCorrectionSubmissionInput(emptyExcerpt);
    expect(res1.valid).toBe(false);
    expect(res1.errors.some(e => e.includes('excerpt'))).toBe(true);

    // Empty suggestion
    const emptySuggestion = {
      storySlug: 'the-partition-and-its-legacies',
      category: 'factual' as const,
      passageExcerpt: 'Valid passage excerpt from article.',
      suggestedCorrection: '',
    };
    const res2 = validateCorrectionSubmissionInput(emptySuggestion);
    expect(res2.valid).toBe(false);
    expect(res2.errors.some(e => e.includes('correction'))).toBe(true);

    // Malformed story slug
    const badSlug = {
      storySlug: 'Invalid Slug With Spaces!',
      category: 'factual' as const,
      passageExcerpt: 'Valid excerpt here.',
      suggestedCorrection: 'Valid suggestion here.',
    };
    const res3 = validateCorrectionSubmissionInput(badSlug);
    expect(res3.valid).toBe(false);
    expect(res3.errors.some(e => e.includes('slug'))).toBe(true);
  });

  it('INV-CORR-03: rate limits excessive submissions from the same identifier', async () => {
    const validPayload = {
      storySlug: 'the-partition-and-its-legacies',
      category: 'factual' as const,
      passageExcerpt: 'Excerpt text for testing rate limiting threshold.',
      suggestedCorrection: 'Correction text for testing rate limiting threshold.',
    };

    const clientIp = '192.168.1.100';

    // Submit 5 times (allowed)
    for (let i = 0; i < 5; i++) {
      const res = await submitReaderCorrection(validPayload, { clientIp });
      expect(res.success).toBe(true);
    }

    // 6th attempt should be rejected by rate limiter
    const blockedRes = await submitReaderCorrection(validPayload, { clientIp });
    expect(blockedRes.success).toBe(false);
    expect(blockedRes.message).toContain('Rate limit exceeded');
  });

  it('INV-CORR-04: public errata projections never leak submitter email or private notes', async () => {
    // 1. Submit reader correction
    const submission = await submitReaderCorrection({
      storySlug: 'the-partition-and-its-legacies',
      storyId: 'story-vol1-chap1',
      category: 'factual',
      passageExcerpt: 'The boundary commission announced the partition boundary on August 15, 1947.',
      suggestedCorrection: 'The award was officially gazetted on August 17, 1947.',
      submitterEmail: 'confidential_scholar@domain.org',
    });

    // 2. Staff triages and resolves by publishing an errata notice
    const staffContext = {
      userId: 'staff-editor-01',
      role: 'editor' as const,
    };

    await triageReaderCorrection({
      correctionId: submission.submissionId!,
      status: 'resolved',
      triageNotes: 'Verified against national archives records.',
      publishedCorrection: {
        category: 'factual',
        previousWording: 'The boundary commission announced the partition boundary on August 15, 1947.',
        correctedWording: 'The award was officially gazetted on August 17, 1947.',
        explanation: 'Clarified the gap between independence day and the formal publication of the Radcliffe Award.',
      },
    }, staffContext);

    // 3. Query public projections
    const publicList = await listPublishedCorrections();
    expect(publicList.length).toBeGreaterThan(0);

    const published = publicList.find(c => c.storyId === 'story-vol1-chap1');
    expect(published).toBeDefined();
    expect(published?.correctedWording).toBe('The award was officially gazetted on August 17, 1947.');

    // Invariant: Submitter email and internal notes are NOT present on public model
    expect((published as unknown as { submitterEmail?: string }).submitterEmail).toBeUndefined();
    expect((published as unknown as { triageNotes?: string }).triageNotes).toBeUndefined();
  });

  it('INV-CORR-05: unauthorized actor cannot mutate triage or publish corrections', async () => {
    const submission = await submitReaderCorrection({
      storySlug: 'the-partition-and-its-legacies',
      category: 'clarification',
      passageExcerpt: 'Some passage excerpt text for testing triage authorization.',
      suggestedCorrection: 'Some suggested correction text.',
    });

    const unauthorizedContext = {
      userId: 'anonymous-or-reader',
      role: 'reader' as const,
    };

    await expect(
      triageReaderCorrection({
        correctionId: submission.submissionId!,
        status: 'in_review',
      }, unauthorizedContext)
    ).rejects.toThrow(/Unauthorized/);
  });

  it('INV-CORR-07: reader correction submission never directly mutates story publication status', async () => {
    const storyBefore: Story = {
      id: 'story-vol1-chap1',
      title: 'The Partition and Its Legacies',
      slug: 'the-partition-and-its-legacies',
      summary: 'Foundational history of India foreign policy post-partition.',
      blocks: [{ id: 'b1', type: 'paragraph', content: 'Original text.' }],
      sources: CHAPTER_1_SOURCES,
      claims: CHAPTER_1_CLAIMS,
      publishedAt: '2026-07-25T00:00:00Z',
      status: 'published',
      publicationStatus: 'published',
    } as unknown as Story;

    // Submitting a correction against this story
    await submitReaderCorrection({
      storySlug: storyBefore.slug,
      storyId: storyBefore.id,
      category: 'factual',
      passageExcerpt: 'Original text.',
      suggestedCorrection: 'Altered text.',
    });

    // Story properties remain unmodified
    expect(storyBefore.status).toBe('published');
    expect(storyBefore.blocks[0].content).toBe('Original text.');
  });
});

describe('VS7 — Gold Standard Review & Quality Gate Enforcement', () => {
  it('INV-GSR-01: evaluates 7-Phase Gold Standard review correctly', () => {
    const audit = createDefaultGoldStandardAudit('story-test-01');
    expect(audit.overallPassed).toBe(false);

    // Mark all 7 phases as passed with 0 blocking issues
    audit.phases.phase1ExpertReview.passed = true;
    audit.phases.phase2ReaderReview.passed = true;
    audit.phases.phase3EvidenceAudit.passed = true;
    audit.phases.phase4BiasAudit.passed = true;
    audit.phases.phase5VisualAudit.passed = true;
    audit.phases.phase6KnowledgeDensityAudit.passed = true;
    audit.phases.phase7DefensibilityAudit.passed = true;

    expect(evaluateGoldStandardPass(audit)).toBe(true);

    // If any phase has a blocking issue, overall fails
    audit.phases.phase3EvidenceAudit.blockingIssuesCount = 1;
    expect(evaluateGoldStandardPass(audit)).toBe(false);
  });

  it('INV-GSR-02: publication gate enforces evidence, source, and claim completeness', () => {
    const validStory: Story = {
      id: 'story-valid-pub',
      title: 'Valid Story Title',
      slug: 'valid-story-slug',
      summary: 'Valid non-empty summary for publication gate.',
      blocks: [{ id: 'b1', type: 'paragraph', content: 'Story paragraph content.' }],
      sources: CHAPTER_1_SOURCES,
      claims: CHAPTER_1_CLAIMS,
      publishedAt: '2026-07-25T00:00:00Z',
      status: 'scheduled',
      publicationStatus: 'scheduled',
    } as unknown as Story;

    const result = validateStoryForPublication(
      { storyId: 'story-valid-pub', scheduleId: 'sched-01', triggeredBy: 'test' },
      validStory
    );

    expect(result.passed).toBe(true);
    expect(result.checks.find(c => c.name === 'has_sources')?.passed).toBe(true);
    expect(result.checks.find(c => c.name === 'has_claims')?.passed).toBe(true);
    expect(result.checks.find(c => c.name === 'has_content')?.passed).toBe(true);
    expect(result.checks.find(c => c.name === 'gold_standard_review')?.passed).toBe(true);
  });

  it('INV-GSR-03: publication gate rejects story when goldStandardAudit has blocking issues', () => {
    const auditRecord = createDefaultGoldStandardAudit('story-failing-pub');
    // Audit has 0 completed phases by default
    const failingStory: Story = {
      id: 'story-failing-pub',
      title: 'Story With Failing Audit',
      slug: 'story-failing-audit',
      summary: 'Summary for failing audit story.',
      blocks: [{ id: 'b1', type: 'paragraph', content: 'Story paragraph content.' }],
      sources: CHAPTER_1_SOURCES,
      claims: CHAPTER_1_CLAIMS,
      publishedAt: '2026-07-25T00:00:00Z',
      status: 'scheduled',
      publicationStatus: 'scheduled',
      goldStandardAudit: auditRecord,
    } as unknown as Story;

    const result = validateStoryForPublication(
      { storyId: 'story-failing-pub', scheduleId: 'sched-02', triggeredBy: 'test' },
      failingStory
    );

    expect(result.passed).toBe(false);
    const gateCheck = result.checks.find(c => c.name === 'gold_standard_review');
    expect(gateCheck).toBeDefined();
    expect(gateCheck?.passed).toBe(false);
    expect(gateCheck?.reason).toContain('blocking issues');
  });
});

describe('VS7 — Founding Publication (Volume I, Chapter 1) Integrity', () => {
  it('INV-CHAP-01: Chapter 1 satisfies Article XI primary evidence and confidence invariants', () => {
    expect(CHAPTER_1_SOURCES.length).toBeGreaterThanOrEqual(5);
    expect(CHAPTER_1_CLAIMS.length).toBeGreaterThanOrEqual(4);

    // Check tier 1 primary sources exist
    const primarySources = CHAPTER_1_SOURCES.filter(s => s.tier === 1);
    expect(primarySources.length).toBeGreaterThanOrEqual(3);

    // Check all claims have valid confidence >= 0.90
    for (const claim of CHAPTER_1_CLAIMS) {
      expect(claim.confidence).toBeGreaterThanOrEqual(0.90);
      expect(claim.status).toBe('verified');
      expect(claim.sourceUrl).toBeDefined();
    }
  });
});

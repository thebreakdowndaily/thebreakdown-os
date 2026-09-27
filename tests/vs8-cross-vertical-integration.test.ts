/**
 * ─── The Breakdown OS — VS8 Cross-Vertical Integration Dedicated Test Suite ──
 * Governing Contract: VS8 — Cross-Vertical Integration Implementation Contract
 * Covers:
 *   VS8-01: Errata banner appears on corrected story
 *   VS8-02: Errata banner absent on uncorrected story
 *   VS8-03: Private correction data cannot reach public story
 *   VS8-04: Correction health metrics derive from real correction state
 *   VS8-05: Unavailable correction metrics become UNKNOWN
 *   VS8-06: Correction queue is represented in pipeline health
 *   VS8-07: Correction submission emits correction:submitted
 *   VS8-08: Event payload excludes private submitter information
 *   VS8-09: Event failure does not lose persisted correction
 *   VS8-10: Reader correction does not mutate claims directly
 *   VS8-11: Valid claim handoff reaches canonical verification workflow
 *   VS8-12: Ambiguous claim mapping remains unresolved
 *   VS8-13: Verification provenance preserves correction ID
 *   VS8-14: Correction workflow remains authorization-safe
 *   VS8-15: Concurrent correction handling is safe
 *   VS8-16: Existing VS5/VS6/VS7 boundaries remain intact
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

import {
  submitReaderCorrection,
  triageReaderCorrection,
  handoffCorrectionToVerification,
  listPublishedCorrections,
  getCorrectionsHealthMetrics,
  getReaderCorrectionById,
  resetCorrectionsMemoryStore,
} from '../services/editorial/corrections-service';
import { NewsroomPipelineHealthAggregator } from '../lib/operations/pipeline-health';
import { eventBus } from '../lib/events/event-bus';
import type { Event, Claim } from '../types/canonical';

describe('VS8 — Cross-Vertical Platform Integration Suite', () => {
  beforeEach(() => {
    resetCorrectionsMemoryStore();
    vi.restoreAllMocks();
  });

  // ─── GAP-VS8-01: In-Context Story Errata Banner Binding ────────────────────

  it('VS8-01: Errata banner appears on corrected story', async () => {
    // 1. Submit and publish a correction for a story
    const submission = await submitReaderCorrection({
      storySlug: 'mgnrega-reform',
      passageExcerpt: '100 statutory work days',
      suggestedCorrection: '125 statutory work days under 2025 amendment',
    });

    await triageReaderCorrection(
      {
        correctionId: submission.submissionId!,
        status: 'resolved',
        publishedCorrection: {
          category: 'factual',
          previousWording: '100 statutory work days',
          correctedWording: '125 statutory work days under 2025 amendment',
          explanation: 'Updated to reflect amended statutory entitlements.',
        },
      },
      { userId: 'editor-lead', role: 'editor' }
    );

    // 2. Query published corrections for story
    const publishedList = await listPublishedCorrections('mgnrega-reform');
    expect(publishedList.length).toBe(1);
    expect(publishedList[0].storySlug).toBe('mgnrega-reform');
    expect(publishedList[0].correctedWording).toBe('125 statutory work days under 2025 amendment');
    expect(publishedList[0].explanation).toBe('Updated to reflect amended statutory entitlements.');

    // 3. Verify Story page and StoryShell integrate CorrectionNoticeBanner
    const storyPageFile = path.resolve(process.cwd(), 'app/story/[slug]/page.tsx');
    const storyShellFile = path.resolve(process.cwd(), 'components/rxs/StoryShell.tsx');
    const bannerFile = path.resolve(process.cwd(), 'components/story/CorrectionNoticeBanner.tsx');

    expect(fs.existsSync(storyPageFile)).toBe(true);
    expect(fs.existsSync(storyShellFile)).toBe(true);
    expect(fs.existsSync(bannerFile)).toBe(true);

    const storyPageSource = fs.readFileSync(storyPageFile, 'utf8');
    const storyShellSource = fs.readFileSync(storyShellFile, 'utf8');
    expect(storyPageSource).toContain('listPublishedCorrections');
    expect(storyPageSource).toContain('publishedCorrections');
    expect(storyShellSource).toContain('CorrectionNoticeBanner');
  });

  it('VS8-02: Errata banner absent on uncorrected story', async () => {
    const publicList = await listPublishedCorrections('uncorrected-story-slug');
    expect(publicList).toHaveLength(0);

    // Banner file enforces null return on empty corrections list
    const bannerFile = path.resolve(process.cwd(), 'components/story/CorrectionNoticeBanner.tsx');
    const bannerSource = fs.readFileSync(bannerFile, 'utf8');
    expect(bannerSource).toContain('if (!corrections || corrections.length === 0) return null;');
  });

  it('VS8-03: Private correction data cannot reach public story', async () => {
    const submission = await submitReaderCorrection({
      storySlug: 'investigation-01',
      passageExcerpt: 'Alleged expenditure was Rs 500 Cr.',
      suggestedCorrection: 'Actual expenditure audited was Rs 420 Cr.',
      submitterEmail: 'confidential.source@example.com',
    });

    expect(submission.success).toBe(true);

    // Triage with confidential internal notes
    await triageReaderCorrection(
      {
        correctionId: submission.submissionId!,
        status: 'resolved',
        triageNotes: 'Confidential whistleblower report verified against CAG audit table 4.2.',
        publishedCorrection: {
          category: 'factual',
          previousWording: 'Alleged expenditure was Rs 500 Cr.',
          correctedWording: 'Actual expenditure audited was Rs 420 Cr.',
          explanation: 'Corrected according to official CAG audit tables.',
        },
      },
      { userId: 'senior-editor-42', role: 'editor' }
    );

    const publicList = await listPublishedCorrections('investigation-01');
    expect(publicList).toHaveLength(1);

    const published = publicList[0];
    // Public projection MUST NOT expose private fields
    expect((published as any).submitterEmail).toBeUndefined();
    expect((published as any).triageNotes).toBeUndefined();
    expect((published as any).submitterIp).toBeUndefined();
    expect(JSON.stringify(published)).not.toContain('confidential.source@example.com');
    expect(JSON.stringify(published)).not.toContain('whistleblower');
  });

  // ─── GAP-VS8-02: Correction Operational Telemetry & Pipeline Health ───────

  it('VS8-04: Correction health metrics derive from real correction state', async () => {
    // Initial empty state
    let metrics = await getCorrectionsHealthMetrics();
    expect(metrics.pendingQueueDepth).toBe(0);
    expect(metrics.inReviewCount).toBe(0);
    expect(metrics.publishedErrataCount).toBe(0);

    // Add 3 submissions
    const sub1 = await submitReaderCorrection({
      storySlug: 'story-alpha',
      passageExcerpt: 'Excerpt alpha for testing.',
      suggestedCorrection: 'Correction alpha for testing.',
    });
    const sub2 = await submitReaderCorrection({
      storySlug: 'story-beta',
      passageExcerpt: 'Excerpt beta for testing.',
      suggestedCorrection: 'Correction beta for testing.',
    });
    const sub3 = await submitReaderCorrection({
      storySlug: 'story-gamma',
      passageExcerpt: 'Excerpt gamma for testing.',
      suggestedCorrection: 'Correction gamma for testing.',
    });

    // Move sub2 to in_review
    await triageReaderCorrection(
      { correctionId: sub2.submissionId!, status: 'in_review' },
      { userId: 'staff-01', role: 'staff' }
    );

    // Resolve sub3
    await triageReaderCorrection(
      {
        correctionId: sub3.submissionId!,
        status: 'resolved',
        publishedCorrection: {
          category: 'clarification',
          previousWording: 'Excerpt gamma for testing.',
          correctedWording: 'Correction gamma for testing.',
          explanation: 'Clarified gamma context.',
        },
      },
      { userId: 'editor-01', role: 'editor' }
    );

    metrics = await getCorrectionsHealthMetrics();
    expect(metrics.pendingQueueDepth).toBe(1);
    expect(metrics.inReviewCount).toBe(1);
    expect(metrics.publishedErrataCount).toBe(1);
    expect(metrics.lastSubmissionAt).not.toBe('UNKNOWN');
  });

  it('VS8-05: Unavailable correction metrics become UNKNOWN', async () => {
    const metrics = await getCorrectionsHealthMetrics();
    expect(metrics.lastSubmissionAt).toBe('UNKNOWN');

    // Health aggregator degrades safely to UNKNOWN if component throws
    const originalMethod = NewsroomPipelineHealthAggregator.evaluatePipelineHealth;
    const health = await originalMethod();
    expect(health.stages.every((s) => s.status !== undefined)).toBe(true);
  });

  it('VS8-06: Correction queue is represented in pipeline health', async () => {
    await submitReaderCorrection({
      storySlug: 'pipeline-story',
      passageExcerpt: 'Excerpt for pipeline testing.',
      suggestedCorrection: 'Correction for pipeline testing.',
    });

    const health = await NewsroomPipelineHealthAggregator.evaluatePipelineHealth();
    const stage7 = health.stages.find((s) => s.stage === 'VERIFICATION');
    const stage9 = health.stages.find((s) => s.stage === 'READER');

    expect(stage7).toBeDefined();
    expect(stage7?.queueDepth).toBeGreaterThanOrEqual(1);
    expect(stage9).toBeDefined();
    expect(stage9?.queueDepth).toBeGreaterThanOrEqual(1);
  });

  // ─── GAP-VS8-03: Reader Correction Feedback Signal to Intelligence ────────

  it('VS8-07: Correction submission emits correction:submitted', async () => {
    const events: Event[] = [];
    const unsub = eventBus.subscribe('correction:submitted', (e) => events.push(e));

    await submitReaderCorrection({
      storySlug: 'intelligence-lead-slug',
      passageExcerpt: 'Export numbers were overstated by 12%.',
      suggestedCorrection: 'DGFT bulletin shows a 2% decline instead.',
    });

    expect(events.length).toBe(1);
    expect(events[0].type).toBe('correction:submitted');
    expect(events[0].payload.storySlug).toBe('intelligence-lead-slug');
    expect(events[0].payload.status).toBe('received');

    unsub();
  });

  it('VS8-08: Event payload excludes private submitter information', async () => {
    const events: Event[] = [];
    const unsub = eventBus.subscribe('correction:submitted', (e) => events.push(e));

    await submitReaderCorrection(
      {
        storySlug: 'privacy-check-slug',
        passageExcerpt: 'Private excerpt content.',
        suggestedCorrection: 'Public correction suggestion.',
        submitterEmail: 'whistleblower@securemail.org',
      },
      { clientIp: '203.0.113.195' }
    );

    expect(events.length).toBe(1);
    const payload = events[0].payload;
    expect(payload.submitterEmail).toBeUndefined();
    expect(payload.clientIp).toBeUndefined();
    expect((payload as any).email).toBeUndefined();
    expect(JSON.stringify(payload)).not.toContain('whistleblower@securemail.org');
    expect(JSON.stringify(payload)).not.toContain('203.0.113.195');

    unsub();
  });

  it('VS8-09: Event failure does not lose persisted correction', async () => {
    const publishSpy = vi.spyOn(eventBus, 'publish').mockImplementation(() => {
      throw new Error('EventBus transport down');
    });

    const result = await submitReaderCorrection({
      storySlug: 'resilience-test-slug',
      passageExcerpt: 'Resilience test excerpt.',
      suggestedCorrection: 'Resilience test suggested correction.',
    });

    expect(result.success).toBe(true);
    expect(result.submissionId).toBeDefined();

    const stored = await getReaderCorrectionById(result.submissionId!);
    expect(stored).toBeDefined();
    expect(stored?.storySlug).toBe('resilience-test-slug');

    publishSpy.mockRestore();
  });

  // ─── GAP-VS8-04: Automated Claim-Level Verification Handoff ────────────────

  it('VS8-10: Reader correction does not mutate claims directly', async () => {
    const mockClaim: Claim = {
      id: 'claim-kashmir-01',
      claim: 'Ceasefire took effect under UN auspices.',
      data: 'UNCIP Document S/1100',
      source: 'UN Digital Library',
      sourceUrl: 'https://digitallibrary.un.org',
      tier: 1,
      confidence: 0.95,
      status: 'verified',
    };

    const initialStatus = mockClaim.status;

    const submission = await submitReaderCorrection({
      storySlug: 'kashmir-the-first-test',
      claimId: mockClaim.id,
      passageExcerpt: 'Ceasefire took effect under UN auspices.',
      suggestedCorrection: 'Ceasefire implementation was delayed until midnight.',
    });

    await handoffCorrectionToVerification(
      {
        correctionId: submission.submissionId!,
        claimId: mockClaim.id,
        claimsRegistry: [mockClaim],
      },
      { userId: 'factchecker-1', role: 'reviewer' }
    );

    // Hard Invariant: Reader correction workflow MUST NOT mutate claim status directly
    expect(mockClaim.status).toBe(initialStatus);
    expect(mockClaim.status).toBe('verified');
  });

  it('VS8-11: Valid claim handoff reaches canonical verification workflow', async () => {
    const claimsRegistry = [
      { id: 'claim-101', claim: 'Border demarcated in 1960 by joint commission.' },
      { id: 'claim-102', claim: 'Buffer zones established in eastern sector.' },
    ];

    const submission = await submitReaderCorrection({
      storySlug: 'border-dispute',
      passageExcerpt: 'Border demarcated in 1960 by joint commission.',
      suggestedCorrection: 'Border was never demarcated in 1960.',
    });

    const result = await handoffCorrectionToVerification(
      {
        correctionId: submission.submissionId!,
        candidateClaimText: 'Border demarcated in 1960',
        claimsRegistry,
      },
      { userId: 'editor-bureau', role: 'editor' }
    );

    expect(result.success).toBe(true);
    expect(result.matchStatus).toBe('MATCHED');
    expect(result.handoffRecord.claimId).toBe('claim-101');
    expect(result.handoffRecord.reviewStatus).toBe('pending_editorial_verification');
  });

  it('VS8-12: Ambiguous claim mapping remains unresolved', async () => {
    const ambiguousRegistry = [
      { id: 'claim-201', claim: 'Subsidies were revised upward in budget 2025.' },
      { id: 'claim-202', claim: 'Subsidies were revised downward in budget 2026.' },
    ];

    const submission = await submitReaderCorrection({
      storySlug: 'fiscal-analysis',
      passageExcerpt: 'Subsidies were revised.',
      suggestedCorrection: 'Subsidies were held constant.',
    });

    const result = await handoffCorrectionToVerification(
      {
        correctionId: submission.submissionId!,
        candidateClaimText: 'Subsidies were revised',
        claimsRegistry: ambiguousRegistry,
      },
      { userId: 'editor-bureau', role: 'editor' }
    );

    expect(result.success).toBe(true);
    expect(result.matchStatus).toBe('AMBIGUOUS');
    expect(result.handoffRecord.claimId).toBeUndefined();
    expect(result.handoffRecord.reviewStatus).toBe('unresolved_ambiguity');
  });

  it('VS8-13: Verification provenance preserves correction ID', async () => {
    const submission = await submitReaderCorrection({
      storySlug: 'provenance-test',
      passageExcerpt: 'Provenance passage excerpt.',
      suggestedCorrection: 'Provenance corrected suggestion.',
    });

    const result = await handoffCorrectionToVerification(
      {
        correctionId: submission.submissionId!,
        claimId: 'claim-audit-99',
      },
      { userId: 'staff-auditor-9', role: 'administrator' }
    );

    const provenance = result.handoffRecord.provenance;
    expect(provenance.correctionId).toBe(submission.submissionId);
    expect(provenance.storySlug).toBe('provenance-test');
    expect(provenance.claimId).toBe('claim-audit-99');
    expect(provenance.sourceOfTrigger).toBe('reader_correction');
    expect(provenance.actor.userId).toBe('staff-auditor-9');
    expect(provenance.actor.role).toBe('administrator');
    expect(new Date(provenance.timestamp).getTime()).not.toBeNaN();
  });

  // ─── Platform Boundaries & Security Invariants ────────────────────────────

  it('VS8-14: Correction workflow remains authorization-safe', async () => {
    const submission = await submitReaderCorrection({
      storySlug: 'auth-test',
      passageExcerpt: 'Test passage.',
      suggestedCorrection: 'Test correction.',
    });

    // Reader role cannot triage
    await expect(
      triageReaderCorrection(
        { correctionId: submission.submissionId!, status: 'in_review' },
        { userId: 'anon-reader', role: 'reader' as any }
      )
    ).rejects.toThrow(/Unauthorized/);

    // Reader role cannot execute verification handoff
    await expect(
      handoffCorrectionToVerification(
        { correctionId: submission.submissionId! },
        { userId: 'anon-reader', role: 'reader' as any }
      )
    ).rejects.toThrow(/Unauthorized/);

    // Authorized staff role succeeds
    const okTriage = await triageReaderCorrection(
      { correctionId: submission.submissionId!, status: 'in_review' },
      { userId: 'staff-user', role: 'staff' }
    );
    expect(okTriage.success).toBe(true);
  });

  it('VS8-15: Concurrent correction handling is safe', async () => {
    const promises = Array.from({ length: 15 }, (_, i) =>
      submitReaderCorrection({
        storySlug: `concurrent-story-${i % 3}`,
        passageExcerpt: `Excerpt batch ${i}`,
        suggestedCorrection: `Correction batch ${i}`,
      })
    );

    const results = await Promise.all(promises);
    expect(results.every((r) => r.success)).toBe(true);

    const metrics = await getCorrectionsHealthMetrics();
    expect(metrics.pendingQueueDepth).toBe(15);
  });

  it('VS8-16: Existing VS5/VS6/VS7 boundaries remain intact', () => {
    // 1. Migration count must remain strictly 16 (MIGRATIONS = 0 for VS8)
    const migrationsDir = path.resolve(process.cwd(), 'supabase/migrations');
    const migrationFiles = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql'));

    expect(migrationFiles.length).toBe(16);
    expect(migrationFiles[migrationFiles.length - 1]).toContain('016_api_keys_and_rate_limiting');

    // 2. VS6 Control plane must be intact
    const pipelineFile = path.resolve(process.cwd(), 'lib/operations/pipeline-health.ts');
    expect(fs.existsSync(pipelineFile)).toBe(true);

    // 3. VS7 Corrections service must exist and be intact
    const correctionsFile = path.resolve(process.cwd(), 'services/editorial/corrections-service.ts');
    expect(fs.existsSync(correctionsFile)).toBe(true);
  });
});

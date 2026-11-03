/**
 * ─── The Breakdown OS — Green Cracker Publication Safety Regression Suite ────
 *
 * Mission: TB-INV-2026-11-03-GREEN-CRACKERS
 * Governing Documents:
 *   - Level 1 Editorial Constitution v1.1 (Articles I, III, IV, XI, XIII)
 *   - AGENTS.md (Editorial Accountability, Fail-Closed Gates)
 *   - Priority One & Eight: Scheduled Publication Safety & Regression Tests
 *
 * Verifies all 10 Priority Eight Scenarios:
 *   1. Scheduled time without editorial approval
 *   2. Scheduled time with missing Gold Standard Review
 *   3. Scheduled time with active editorial release hold
 *   4. Missing Editor-in-Chief / Editor authorization
 *   5. Mismatched content fingerprint
 *   6. Unauthenticated publication request
 *   7. Unpublished story sitemap exclusion
 *   8. Unpublished story RSS/feed exclusion
 *   9. Unpublished story public API/discovery isolation
 *  10. Valid authorised publication candidate evaluation (16 passed, 2 blocked)
 */

import { describe, it, expect } from 'vitest';
import { DELHI_GREEN_CRACKER_STORY } from '@/lib/editorial/drafts/delhi-green-crackers';
import {
  isPubliclyPublished,
  isCanonicalStoryPublic,
  storyPublicationContext,
  diagnosePublication,
  canPubliclyViewStory,
  shouldIncludeInFeed,
  shouldIndexStory,
  shouldIncludeInDiscovery,
} from '@/lib/story/publication';
import {
  countNarrativeWords,
  estimateReadingTimeMinutes,
} from '@/lib/story/narrative-metrics';
import { validateStoryForPublication } from '@/lib/editorial/publication-gate';
import { evaluatePublicationContract } from '@/lib/editorial/canonical-publication';
import { EDITORIAL_RELEASE_HOLDS } from '@/lib/editorial/release-holds';
import {
  computeStoryContentFingerprint,
  verifyStoryContentFingerprint,
} from '@/lib/editorial/content-fingerprint';
import { validateGoldStandardAuditRecord } from '@/lib/editorial/gold-standard-review';
import type { Principal } from '@/features/auth/principal';

describe('TB-INV-2026-11-03-GREEN-CRACKERS Publication Safety & Pre-Review Integrity', () => {
  const story = DELHI_GREEN_CRACKER_STORY;

  describe('Priority One: Scheduled Publication Safety & Non-Negotiable Invariants', () => {
    it('Scenario 1: Scheduled timestamp arrival does NOT cause public visibility without editorial approval', () => {
      // Even well past scheduled time (e.g. 5 Nov 2026)
      const postScheduledTime = new Date('2026-11-05T12:00:00Z');
      expect(isCanonicalStoryPublic(story, postScheduledTime)).toBe(false);
      expect(isPubliclyPublished(storyPublicationContext(story), postScheduledTime)).toBe(false);
    });

    it('Scenario 2: Scheduled time with missing Gold Standard Review fails Gate 11', () => {
      const result = validateStoryForPublication(story);
      const gate11 = result.checks.find(c => c.name === 'gold_standard_review');
      expect(gate11).toBeDefined();
      expect(gate11?.passed).toBe(false);
      expect(gate11?.reason).toContain('Missing Gold Standard Review record');
    });

    it('Scenario 3: Scheduled time with active editorial release hold fails Gate 13', () => {
      const result = validateStoryForPublication(story);
      const gate13 = result.checks.find(c => c.name === 'editorial_release_hold');
      expect(gate13).toBeDefined();
      expect(gate13?.passed).toBe(false);
      expect(gate13?.reason).toContain('Editorial Release Hold is ACTIVE');
    });

    it('Scenario 4: Missing Editor authorization (unauthorized principal role) returns HTTP 403', () => {
      const reporterPrincipal: Principal = {
        userId: 'usr-reporter-01',
        email: 'reporter@thebreakdown.in',
        name: 'Junior Reporter',
        role: 'reporter',
        permissions: ['story.create', 'story.update'], // No 'story.publish'
      };

      const decision = evaluatePublicationContract(undefined, story, reporterPrincipal);
      expect(decision.allowed).toBe(false);
      expect(decision.httpStatus).toBe(403);
      expect(decision.error).toContain('Forbidden');
    });

    it('Scenario 5: Mismatched content fingerprint rejects Gold Standard Audit validation', () => {
      const fakeAuditRecord: any = {
        storyId: story.id,
        currentStage: 'gold_standard_review',
        contentFingerprint: 'sha256:0000000000000000000000000000000000000000000000000000000000000000',
        phases: {
          phase1_primary_sources: { status: 'passed', signedBy: 'usr-1', timestamp: '2026-11-03T20:00:00Z', notes: 'OK' },
          phase2_claim_by_claim: { status: 'passed', signedBy: 'usr-2', timestamp: '2026-11-03T20:00:00Z', notes: 'OK' },
          phase3_legal_compliance: { status: 'passed', signedBy: 'usr-3', timestamp: '2026-11-03T20:00:00Z', notes: 'OK' },
          phase4_adversarial: { status: 'passed', signedBy: 'usr-4', timestamp: '2026-11-03T20:00:00Z', notes: 'OK' },
          phase5_editorial_standards: { status: 'passed', signedBy: 'usr-5', timestamp: '2026-11-03T20:00:00Z', notes: 'OK' },
          phase6_visual_verification: { status: 'passed', signedBy: 'usr-6', timestamp: '2026-11-03T20:00:00Z', notes: 'OK' },
          phase7_eic_authorization: { status: 'passed', signedBy: 'usr-7', timestamp: '2026-11-03T20:00:00Z', notes: 'OK' },
        },
      };

      const auditValidation = validateGoldStandardAuditRecord(fakeAuditRecord, story);
      expect(auditValidation.valid).toBe(false);
      expect(auditValidation.violations.some(v => v.includes('fingerprint'))).toBe(true);
      expect(verifyStoryContentFingerprint(story, fakeAuditRecord.contentFingerprint)).toBe(false);
    });

    it('Scenario 6: Unauthenticated publication request returns HTTP 401', () => {
      const decision = evaluatePublicationContract(undefined, story, null);
      expect(decision.allowed).toBe(false);
      expect(decision.httpStatus).toBe(401);
      expect(decision.error).toContain('Authentication required');
    });

    it('Scenario 7: Unpublished story is strictly excluded from sitemaps', () => {
      const ctx = storyPublicationContext(story);
      expect(shouldIndexStory(ctx)).toBe(false);
    });

    it('Scenario 8: Unpublished story is strictly excluded from RSS and JSON feeds', () => {
      const ctx = storyPublicationContext(story);
      expect(shouldIncludeInFeed(ctx)).toBe(false);
    });

    it('Scenario 9: Unpublished story is isolated from public reader APIs and discovery', () => {
      const ctx = storyPublicationContext(story);
      expect(canPubliclyViewStory(ctx)).toBe(false);
      expect(shouldIncludeInDiscovery(ctx)).toBe(false);
    });

    it('Scenario 10: Valid authorised publication candidate evaluates to exactly 16 passed, 2 blocked', () => {
      const mockEditor: Principal = {
        userId: 'usr-eic-01',
        email: 'eic@thebreakdown.in',
        name: 'Editor-in-Chief',
        role: 'editor',
        permissions: ['story.publish', 'story.review'],
      };

      const decision = evaluatePublicationContract(
        undefined,
        story,
        mockEditor,
        { now: new Date('2026-11-03T21:00:00Z') }
      );

      expect(decision.allowed).toBe(false);
      expect(decision.httpStatus).toBe(422);

      const checks = decision.gateResult!.checks;
      expect(checks.length).toBe(18);

      const passed = checks.filter(c => c.passed);
      const blocked = checks.filter(c => !c.passed);

      expect(passed.length).toBe(16);
      expect(blocked.length).toBe(2);

      const blockedNames = blocked.map(c => c.name).sort();
      expect(blockedNames).toEqual(['editorial_release_hold', 'gold_standard_review']);
    });
  });

  describe('Priority Two: Publication Gate Arithmetic Comparison', () => {
    it('Evaluation A (Standalone review-draft): exactly 15 passed, 3 blocked', () => {
      const result = validateStoryForPublication(story);
      expect(result.checks.length).toBe(18);

      const passed = result.checks.filter(c => c.passed);
      const blocked = result.checks.filter(c => !c.passed);

      expect(passed.length).toBe(15);
      expect(blocked.length).toBe(3);

      const blockedNames = blocked.map(c => c.name).sort();
      expect(blockedNames).toEqual([
        'editorial_release_hold',
        'gold_standard_review',
        'has_published_at',
      ]);
    });
  });

  describe('Priority Three & Five: Fingerprint & Primary Source Integrity', () => {
    it('Content fingerprint is strictly preserved at sha256:c9fab15e683a4a585f17127f90d860964d2f798bb4ef284d1e0451444138b06f', () => {
      const fp = computeStoryContentFingerprint(story);
      expect(fp).toBe('sha256:c9fab15e683a4a585f17127f90d860964d2f798bb4ef284d1e0451444138b06f');
      expect(verifyStoryContentFingerprint(story, 'sha256:c9fab15e683a4a585f17127f90d860964d2f798bb4ef284d1e0451444138b06f')).toBe(true);
    });

    it('Source 1 classifies the order as an IndiaKanoon reproduction, marking official court PDF pending', () => {
      const src1 = story.sources.find(s => s.id === 'src-sc-order-2026');
      expect(src1).toBeDefined();
      expect(src1?.title).toContain('IndiaKanoon Legal Database Reproduction');
      expect(src1?.publisher).toBe('IndiaKanoon (reproducing Supreme Court of India)');
      expect(src1?.url).toBe('https://indiankanoon.org/doc/113136598/');
    });

    it('Editorial release hold in lib/editorial/release-holds.ts remains actively set to HOLD', () => {
      const hold = EDITORIAL_RELEASE_HOLDS[story.slug];
      expect(hold).toBeDefined();
      expect(hold.status).toBe('HOLD');
      expect(hold.requiredBeforeRelease).toContain('Independent human editorial board acceptance review (Constitution Art. XI)');
    });
  });
});

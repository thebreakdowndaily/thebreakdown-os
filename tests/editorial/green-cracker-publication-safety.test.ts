/**
 * ─── The Breakdown OS — Green Cracker Publication Safety Regression Suite ────
 *
 * Mission: TB-INV-2026-11-03-GREEN-CRACKERS
 * Governing Documents:
 *   - Level 1 Editorial Constitution v1.1 (Articles I, III, IV, XI, XIII)
 *   - AGENTS.md (Editorial Accountability, Fail-Closed Gates)
 *   - Mission Contract: Research Package & Publication Safety
 *
 * Verifies:
 *   1. Review-stage story has no premature publication timestamp (publishedAt === '').
 *   2. Unpublished review/scheduled stories cannot be viewed publicly or indexed.
 *   3. Standalone draft evaluation fails Gate 8 (has_published_at) while review-stage.
 *   4. Canonical publication workflow provides the publication timestamp dynamically,
 *      allowing Gate 8 to pass during authorized publication without mutating review drafts.
 *   5. Narrative word count (2,780 words) matches platform reading time (13 min at 220 wpm).
 *   6. Editorial release holds and gold standard review requirements fail closed.
 */

import { describe, it, expect } from 'vitest';
import { DELHI_GREEN_CRACKER_STORY } from '@/lib/editorial/drafts/delhi-green-crackers';
import {
  isPubliclyPublished,
  isCanonicalStoryPublic,
  storyPublicationContext,
  diagnosePublication,
} from '@/lib/story/publication';
import {
  countNarrativeWords,
  estimateReadingTimeMinutes,
} from '@/lib/story/narrative-metrics';
import { validateStoryForPublication } from '@/lib/editorial/publication-gate';
import { evaluatePublicationContract } from '@/lib/editorial/canonical-publication';
import { EDITORIAL_RELEASE_HOLDS } from '@/lib/editorial/release-holds';
import { computeStoryContentFingerprint } from '@/lib/editorial/content-fingerprint';
import type { Principal } from '@/features/auth/principal';

describe('TB-INV-2026-11-03-GREEN-CRACKERS Publication Safety & Semantics', () => {
  const story = DELHI_GREEN_CRACKER_STORY;

  describe('Task 2: Publication Timestamp Semantics & Visibility', () => {
    it('review-stage story must NOT carry a premature non-empty publishedAt timestamp', () => {
      expect(story.status).toBe('review');
      expect(story.publicationStatus).toBe('scheduled');
      expect(story.publishedAt).toBe('');
      expect(story.scheduledAt).toBe('2026-11-03T20:00:00Z');
    });

    it('story is not publicly viewable under isCanonicalStoryPublic predicate', () => {
      const now = new Date('2026-11-03T21:00:00Z');
      expect(isCanonicalStoryPublic(story, now)).toBe(false);
    });

    it('story is not publicly published under isPubliclyPublished predicate', () => {
      const ctx = storyPublicationContext(story);
      const now = new Date('2026-11-03T21:00:00Z');
      expect(isPubliclyPublished(ctx, now)).toBe(false);
    });

    it('diagnosePublication confirms failure to publish due to non-published status', () => {
      const ctx = storyPublicationContext(story);
      const diag = diagnosePublication(story.slug, ctx);
      expect(diag.isPublic).toBe(false);
      expect(diag.reason).toContain('scheduled status');
    });

    it('standalone draft evaluation fails Gate 8 (has_published_at) because publishedAt is empty', () => {
      const result = validateStoryForPublication(story);
      const gate8 = result.checks.find(c => c.name === 'has_published_at');
      expect(gate8).toBeDefined();
      expect(gate8?.passed).toBe(false);
      expect(gate8?.reason).toBe('Story has no publishedAt timestamp');
    });

    it('canonical publication evaluator supplies publication timestamp candidate and passes Gate 8', () => {
      const mockEditor: Principal = {
        userId: 'usr-eic-01',
        email: 'eic@thebreakdown.in',
        name: 'Editor-in-Chief',
        role: 'editor',
        permissions: ['story.publish', 'story.review'],
      };

      const decision = evaluatePublicationContract(undefined, story, mockEditor, {
        now: new Date('2026-11-03T21:00:00Z'),
      });

      expect(decision.gateResult).toBeDefined();
      const gate8 = decision.gateResult?.checks.find(c => c.name === 'has_published_at');
      expect(gate8).toBeDefined();
      expect(gate8?.passed).toBe(true);
    });
  });

  describe('Task 3: Narrative Word Count and Reading Time Consistency', () => {
    it('narrative word count is exactly 2,780 words', () => {
      const words = countNarrativeWords(story.blocks);
      expect(words).toBe(2780);
    });

    it('platform reading time calculation at 220 wpm yields 13 minutes', () => {
      const words = countNarrativeWords(story.blocks);
      const calculatedReadingTime = estimateReadingTimeMinutes(words, 220);
      // Math.ceil(2780 / 220) = Math.ceil(12.636363...) = 13
      expect(calculatedReadingTime).toBe(13);
    });

    it('declared reading time matches calculated reading time with 0% discrepancy', () => {
      const words = countNarrativeWords(story.blocks);
      const calculatedReadingTime = estimateReadingTimeMinutes(words, 220);
      expect(story.readingTime).toBe(calculatedReadingTime);
      expect(story.readingTime).toBe(13);
    });

    it('publication Gate 16 (reading_time_consistency) passes', () => {
      const result = validateStoryForPublication(story);
      const gate16 = result.checks.find(c => c.name === 'reading_time_consistency');
      expect(gate16).toBeDefined();
      expect(gate16?.passed).toBe(true);
      expect(gate16?.reason).toContain('13 min declared vs 13 min calculated at 220 wpm');
    });
  });

  describe('Task 5 & 7: Source Reconcilation, Fingerprint & Fail-Closed Holds', () => {
    it('source 1 is accurately classified as IndiaKanoon legal database reproduction', () => {
      const src1 = story.sources.find(s => s.id === 'src-sc-order-2026');
      expect(src1).toBeDefined();
      expect(src1?.title).toContain('IndiaKanoon Legal Database Reproduction');
      expect(src1?.publisher).toBe('IndiaKanoon (reproducing Supreme Court of India)');
      expect(src1?.url).toBe('https://indiankanoon.org/doc/113136598/');
    });

    it('editorial release hold is actively blocking the story slug', () => {
      const hold = EDITORIAL_RELEASE_HOLDS[story.slug];
      expect(hold).toBeDefined();
      expect(hold.status).toBe('HOLD');
    });

    it('publication Gate 11 (gold_standard_review) fails closed', () => {
      const result = validateStoryForPublication(story);
      const gate11 = result.checks.find(c => c.name === 'gold_standard_review');
      expect(gate11).toBeDefined();
      expect(gate11?.passed).toBe(false);
      expect(gate11?.reason).toContain('Missing Gold Standard Review record');
    });

    it('publication Gate 13 (editorial_release_hold) fails closed', () => {
      const result = validateStoryForPublication(story);
      const gate13 = result.checks.find(c => c.name === 'editorial_release_hold');
      expect(gate13).toBeDefined();
      expect(gate13?.passed).toBe(false);
      expect(gate13?.reason).toContain('Editorial Release Hold is ACTIVE');
    });

    it('canonical publication contract strictly forbids publishing without human sign-off', () => {
      const mockEditor: Principal = {
        userId: 'usr-eic-01',
        email: 'eic@thebreakdown.in',
        name: 'Editor-in-Chief',
        role: 'editor',
        permissions: ['story.publish', 'story.review'],
      };

      const decision = evaluatePublicationContract(undefined, story, mockEditor);
      expect(decision.allowed).toBe(false);
      expect(decision.httpStatus).toBe(422);
      expect(decision.error).toContain('gold_standard_review');
      expect(decision.error).toContain('editorial_release_hold');
    });

    it('computes deterministic canonical SHA-256 content fingerprint', () => {
      const fp = computeStoryContentFingerprint(story);
      expect(fp).toMatch(/^sha256:[a-f0-9]{64}$/);
      expect(fp).toBe('sha256:c9fab15e683a4a585f17127f90d860964d2f798bb4ef284d1e0451444138b06f');
    });
  });
});

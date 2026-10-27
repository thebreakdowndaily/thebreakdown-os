import { describe, it, expect } from 'vitest';
import {
  REMEDIATED_AI_LITERACY_STORY,
  REMEDIATED_SEMICONDUCTOR_STORY,
  REMEDIATED_BCCI_CRICKET_STORY,
} from '@/lib/editorial/drafts/remediated-stories';
import { IMAGE_INTELLIGENCE_MANIFEST } from '@/lib/image-intelligence/manifest';
import {
  matchImageToStoryContext,
  isPlaceholderAligned,
} from '@/lib/image-intelligence/context-matcher';
import { validateStoryForPublication } from '@/lib/editorial/publication-gate';
import { buildStoryPresentationModel } from '@/lib/story/presentation-model';
import { POST as resolveImagePOST } from '@/app/api/intelligence/resolve-image/route';
import { NextRequest } from 'next/server';

describe('Editorial Remediation & Quality Audit Suite', () => {
  describe('1. Image Intelligence & Context Matcher Hardening', () => {
    it('should classify generic placeholder SVGs as placeholders and reject them for feature heroes', () => {
      const placeholderUrl = '/images/placeholders/story-editorial.svg';
      expect(placeholderUrl.includes('/images/placeholders/')).toBe(true);

      const evaluation = matchImageToStoryContext(
        placeholderUrl,
        {
          slug: 'india-semiconductor-mission-fab-reality',
          title: "India's Semiconductor Mission",
          category: 'economy',
          storyType: 'feature',
          isFeatureStory: true,
        }
      );

      expect(evaluation.isEditorialBlocker).toBe(true);
      expect(evaluation.aligned).toBe(false);
      expect(evaluation.classification).toBe('generic-placeholder');
      expect(evaluation.reason).toContain('cannot satisfy hero media requirements');
    });

    it('should reject weak 1-word false positive semantic matches', () => {
      // "policy" is a generic stop word and should not match an arbitrary semiconductor image
      const evaluation = matchImageToStoryContext(
        '/images/stories/semiconductor-pli.jpg',
        {
          slug: 'general-delhi-policy-update',
          title: 'General Policy Discussion',
          category: 'policy',
        }
      );

      // Should not be aligned because "semiconductor" has no overlap with "policy update"
      expect(evaluation.aligned).toBe(false);
      expect(evaluation.isMatch).toBe(false);
    });

    it('should confirm context alignment for authentic photographic assets with distinctive stems', () => {
      const evalSemi = matchImageToStoryContext(
        REMEDIATED_SEMICONDUCTOR_STORY.heroImage!,
        {
          slug: REMEDIATED_SEMICONDUCTOR_STORY.slug,
          title: REMEDIATED_SEMICONDUCTOR_STORY.title,
          category: REMEDIATED_SEMICONDUCTOR_STORY.category,
        },
        (s) => IMAGE_INTELLIGENCE_MANIFEST[s] || null
      );
      expect(evalSemi.aligned).toBe(true);
      expect(evalSemi.isMatch).toBe(true);
      expect(evalSemi.classification).toBe('authentic-photo');
      expect(evalSemi.isEditorialBlocker).toBeFalsy();

      const evalCricket = matchImageToStoryContext(
        REMEDIATED_BCCI_CRICKET_STORY.heroImage!,
        {
          slug: REMEDIATED_BCCI_CRICKET_STORY.slug,
          title: REMEDIATED_BCCI_CRICKET_STORY.title,
          category: REMEDIATED_BCCI_CRICKET_STORY.category,
        },
        (s) => IMAGE_INTELLIGENCE_MANIFEST[s] || null
      );
      expect(evalCricket.aligned).toBe(true);
      expect(evalCricket.isMatch).toBe(true);
      expect(evalCricket.classification).toBe('authentic-photo');

      const evalAI = matchImageToStoryContext(
        REMEDIATED_AI_LITERACY_STORY.heroImage!,
        {
          slug: REMEDIATED_AI_LITERACY_STORY.slug,
          title: REMEDIATED_AI_LITERACY_STORY.title,
          category: REMEDIATED_AI_LITERACY_STORY.category,
        },
        (s) => IMAGE_INTELLIGENCE_MANIFEST[s] || null
      );
      expect(evalAI.aligned).toBe(true);
      expect(evalAI.isMatch).toBe(true);
      expect(evalAI.classification).toBe('authentic-photo');
    });

    it('should contain verified photographic manifest entries for all three target slugs', () => {
      const slugs = [
        'ai-literacy-india-students-verify-ai',
        'india-semiconductor-mission-fab-reality',
        'bcci-domestic-mandate-ranji-economics',
      ];

      for (const slug of slugs) {
        const manifestEntry = IMAGE_INTELLIGENCE_MANIFEST[slug];
        expect(manifestEntry).toBeDefined();
        expect(manifestEntry.approvedImage).not.toContain('.svg');
        expect(manifestEntry.approvedImage).toMatch(/\.(jpg|jpeg|webp|png)$/);
        expect(manifestEntry.license).toBeTruthy();
        expect(manifestEntry.provenance).toBeTruthy();
      }
    });
  });

  describe('2. Image Intelligence API Contract (/api/intelligence/resolve-image)', () => {
    it('should successfully resolve an image when supplied with slug alone', async () => {
      const req = new NextRequest('http://localhost:3000/api/intelligence/resolve-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: 'ai-literacy-india-students-verify-ai',
        }),
      });

      const res = await resolveImagePOST(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.image).toBeDefined();
      expect(data.image.url).toBe('/images/stories/ai-literacy-india-students.jpg');
      expect(data.image.resolvedVia).toBe('manifest');
    });

    it('should successfully resolve an image when supplied with both slug and storyId', async () => {
      const req = new NextRequest('http://localhost:3000/api/intelligence/resolve-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyId: 's2222222-2222-4222-8222-222222222222',
          slug: 'india-semiconductor-mission-fab-reality',
        }),
      });

      const res = await resolveImagePOST(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.image.url).toBe('/images/stories/semiconductor-pli.jpg');
    });

    it('should return 400 bad request if neither storyId nor slug is provided', async () => {
      const req = new NextRequest('http://localhost:3000/api/intelligence/resolve-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const res = await resolveImagePOST(req);
      expect(res.status).toBe(400);

      const data = await res.json();
      expect(data.error).toContain('Missing story identifier');
    });
  });

  describe('3. Publication Acceptance Gates (Gates 14–17)', () => {
    it('Gate 14: should block publication under editorial release hold by default', () => {
      const result = validateStoryForPublication(
        { storyId: REMEDIATED_AI_LITERACY_STORY.id },
        REMEDIATED_AI_LITERACY_STORY
      );
      expect(result.passed).toBe(false);

      const holdCheck = result.checks.find((c) => c.name === 'editorial_release_hold');
      expect(holdCheck).toBeDefined();
      expect(holdCheck?.passed).toBe(false);
      expect(holdCheck?.reason).toContain('Editorial Release Hold');
    });

    it('Gate 14: should allow passing when bypassEditorialHold is explicitly authorized', () => {
      const result = validateStoryForPublication(
        { storyId: REMEDIATED_AI_LITERACY_STORY.id },
        REMEDIATED_AI_LITERACY_STORY,
        new Date(),
        { bypassEditorialHold: true }
      );

      const holdCheck = result.checks.find((c) => c.name === 'editorial_release_hold');
      expect(holdCheck).toBeDefined();
      expect(holdCheck?.passed).toBe(true);
      expect(holdCheck?.reason).toContain('not under active editorial release hold');
    });

    it('Gate 15: should enforce hero media quality and reject placeholders for feature stories', () => {
      const badStory = {
        ...REMEDIATED_AI_LITERACY_STORY,
        storyType: 'feature' as const,
        heroImage: '/images/placeholders/story-editorial.svg',
      };

      const result = validateStoryForPublication(
        { storyId: badStory.id },
        badStory,
        new Date(),
        { bypassEditorialHold: true }
      );
      const heroCheck = result.checks.find((c) => c.name === 'hero_media_quality');
      expect(heroCheck?.passed).toBe(false);
      expect(heroCheck?.reason).toContain('cannot use generic SVG placeholder');
    });

    it('Gate 16: should verify narrative depth and reading time consistency within tolerance', () => {
      // Remediated draft has 1,832 words, declared readingTime = 10 min -> calculated 9 min (discrepancy <= 10%)
      const result = validateStoryForPublication(
        { storyId: REMEDIATED_AI_LITERACY_STORY.id },
        REMEDIATED_AI_LITERACY_STORY,
        new Date(),
        { bypassEditorialHold: true }
      );
      const readingCheck = result.checks.find((c) => c.name === 'reading_time_consistency');
      expect(readingCheck?.passed).toBe(true);
    });

    it('Gate 16: should reject reading time overstatement when words are insufficient', () => {
      const stubStory = {
        ...REMEDIATED_AI_LITERACY_STORY,
        readingTime: 12, // Declares 12 minutes
        blocks: [
          {
            id: 'stub-p1',
            type: 'paragraph',
            data: { text: '<p>Only fifty words in this stub story to test gate failure.</p>' },
          },
        ],
      };

      const result = validateStoryForPublication(
        { storyId: stubStory.id },
        stubStory,
        new Date(),
        { bypassEditorialHold: true }
      );
      const readingCheck = result.checks.find((c) => c.name === 'reading_time_consistency');
      expect(readingCheck?.passed).toBe(false);
      expect(readingCheck?.reason).toContain('exceeds 25% tolerance limit');
    });

    it('Gate 17: should verify visual intelligence pipeline on long-form feature stories', () => {
      const featureStory = {
        ...REMEDIATED_SEMICONDUCTOR_STORY,
        storyType: 'feature' as const,
      };

      const result = validateStoryForPublication(
        { storyId: featureStory.id },
        featureStory,
        new Date(),
        { bypassEditorialHold: true }
      );
      const visualCheck = result.checks.find((c) => c.name === 'visual_intelligence_pipeline');
      expect(visualCheck?.passed).toBe(true);
    });
  });

  describe('4. Remediated Draft Substance and Depth Validation', () => {
    const stories = [
      { name: 'AI Literacy', story: REMEDIATED_AI_LITERACY_STORY, minWords: 1800 },
      { name: 'Semiconductor', story: REMEDIATED_SEMICONDUCTOR_STORY, minWords: 2000 },
      { name: 'BCCI Ranji', story: REMEDIATED_BCCI_CRICKET_STORY, minWords: 1800 },
    ];

    for (const { name, story, minWords } of stories) {
      it(`${name} should meet narrative word count target (>= ${minWords} words)`, () => {
        const narrativeTexts = story.blocks
          .filter((b) => b.type === 'paragraph' || b.type === 'text')
          .map((b) => (b.data as any)?.text || (b.data as any)?.content || (b as any).content || '');
        const cleanWords = narrativeTexts
          .join(' ')
          .replace(/<[^>]*>/g, ' ')
          .split(/\s+/)
          .filter(Boolean);

        expect(cleanWords.length).toBeGreaterThanOrEqual(minWords);
      });

      it(`${name} should include at least 6 structured chapters`, () => {
        const chapterHeadings = story.blocks.filter((b) => b.type === 'chapter-heading');
        expect(chapterHeadings.length).toBeGreaterThanOrEqual(6);
      });

      it(`${name} should include supporting visual blocks (key-numbers, comparison, timeline)`, () => {
        const blockTypes = story.blocks.map((b) => b.type);
        expect(blockTypes).toContain('key-numbers');
        expect(blockTypes).toContain('comparison');
        const hasTimeline = blockTypes.includes('timeline') || Boolean(story.timeline && story.timeline.length > 0);
        expect(hasTimeline).toBe(true);
      });

      it(`${name} should include at least 5 verifiable sources with primary documentation`, () => {
        expect(story.sources.length).toBeGreaterThanOrEqual(5);
        for (const source of story.sources) {
          expect(source.url).toMatch(/^https?:\/\//);
          expect(source.publisher).toBeTruthy();
          expect([1, 2]).toContain(source.tier);
        }
        const tier1Sources = story.sources.filter((s) => s.tier === 1);
        expect(tier1Sources.length).toBeGreaterThanOrEqual(3);
      });

      it(`${name} should include at least 5 verified claims linked to primary sources`, () => {
        expect(story.claims.length).toBeGreaterThanOrEqual(5);
        for (const claim of story.claims) {
          expect(claim.status).toBe('verified');
          expect(claim.confidence).toBeGreaterThanOrEqual(0.9);
          expect(claim.source).toBeTruthy();
        }
      });

      it(`${name} should produce a consistent presentation model with calculated reading time`, () => {
        const model = buildStoryPresentationModel(story);
        expect(model.hero.headline).toBeTruthy();
        expect(model.hero.readingTimeMinutes).toBeGreaterThanOrEqual(9);
        expect(model.hero.readingTimeMinutes).toBeLessThanOrEqual(13);
        expect(model.hero.trustSignals).toBeDefined();
      });
    }
  });

  describe('5. Publication Gate Release Matrix Verification (Mission Section 4)', () => {
    it('should reject an unreviewed story with status="draft"', () => {
      const draftStory = {
        ...REMEDIATED_BCCI_CRICKET_STORY,
        status: 'draft' as any,
      };
      const result = validateStoryForPublication(
        { storyId: draftStory.id },
        draftStory,
        new Date(),
        { bypassEditorialHold: true }
      );
      expect(result.passed).toBe(false);
      const statusCheck = result.checks.find((c) => c.name === 'status_eligible');
      expect(statusCheck?.passed).toBe(false);
      expect(statusCheck?.reason).toContain("Story status 'draft' is not eligible");
    });

    it('should reject an unreviewed story placed under active editorial release hold', () => {
      const result = validateStoryForPublication(
        { storyId: REMEDIATED_AI_LITERACY_STORY.id },
        REMEDIATED_AI_LITERACY_STORY
      );
      expect(result.passed).toBe(false);
      const holdCheck = result.checks.find((c) => c.name === 'editorial_release_hold');
      expect(holdCheck?.passed).toBe(false);
      expect(holdCheck?.reason).toContain('Editorial Release Hold is ACTIVE');
    });

    it('should reject a shallow investigation lacking narrative depth and visual blocks', () => {
      const shallowStory = {
        ...REMEDIATED_BCCI_CRICKET_STORY,
        blocks: [
          { id: 'b1', type: 'paragraph', data: { text: 'Short introductory paragraph.' } },
          { id: 'b2', type: 'paragraph', data: { text: 'Second short paragraph.' } },
        ],
      };
      const result = validateStoryForPublication(
        { storyId: shallowStory.id },
        shallowStory,
        new Date(),
        { bypassEditorialHold: true }
      );
      expect(result.passed).toBe(false);
      const readingCheck = result.checks.find((c) => c.name === 'reading_time_consistency');
      expect(readingCheck?.passed).toBe(false);
      const visualCheck = result.checks.find((c) => c.name === 'visual_intelligence_pipeline');
      expect(visualCheck?.passed).toBe(false);
    });

    it('should reject an incorrectly declared reading time exceeding 25% tolerance limit', () => {
      const mismatchedStory = {
        ...REMEDIATED_BCCI_CRICKET_STORY,
        readingTime: 20, // declared 20 min vs calculated ~9 min (>100% discrepancy)
      };
      const result = validateStoryForPublication(
        { storyId: mismatchedStory.id },
        mismatchedStory,
        new Date(),
        { bypassEditorialHold: true }
      );
      expect(result.passed).toBe(false);
      const readingCheck = result.checks.find((c) => c.name === 'reading_time_consistency');
      expect(readingCheck?.passed).toBe(false);
      expect(readingCheck?.reason).toContain('tolerance limit');
    });

    it('should reject an unverified material claim', () => {
      const unverifiedStory = {
        ...REMEDIATED_BCCI_CRICKET_STORY,
        claims: [
          ...REMEDIATED_BCCI_CRICKET_STORY.claims,
          {
            id: 'unverified-claim-1',
            claim: 'Attendance surged by 42% across domestic stadiums',
            status: 'unverified',
            verificationStatus: 'unverified',
            source: 'Secondary Social Media Post',
          } as any,
        ],
      };
      const result = validateStoryForPublication(
        { storyId: unverifiedStory.id },
        unverifiedStory,
        new Date(),
        { bypassEditorialHold: true }
      );
      expect(result.passed).toBe(false);
      const claimCheck = result.checks.find((c) => c.name === 'claims_verified');
      expect(claimCheck?.passed).toBe(false);
      expect(claimCheck?.reason).toContain('unverified or unsupported claim');
    });

    it('should reject a generic placeholder hero image on an investigative feature', () => {
      const placeholderStory = {
        ...REMEDIATED_BCCI_CRICKET_STORY,
        heroImage: '/images/placeholders/governance-placeholder.svg',
      };
      const result = validateStoryForPublication(
        { storyId: placeholderStory.id },
        placeholderStory,
        new Date(),
        { bypassEditorialHold: true }
      );
      expect(result.passed).toBe(false);
      const heroCheck = result.checks.find((c) => c.name === 'hero_media_quality');
      expect(heroCheck?.passed).toBe(false);
      expect(heroCheck?.reason).toContain('generic SVG placeholder');
    });

    it('should pass all gates for a valid, reviewed story with verified evidence and lifted hold', async () => {
      const { createValidGoldStandardAudit } = await import('@/lib/editorial/gold-standard-review');
      const { VERIFIED_STORY_IMAGE_MANIFEST } = await import('@/lib/image-intelligence/manifest');

      // Verify that unapproved/pending supporting visual fails closed
      const unapprovedStory = {
        ...REMEDIATED_BCCI_CRICKET_STORY,
        goldStandardAudit: createValidGoldStandardAudit(REMEDIATED_BCCI_CRICKET_STORY),
      };
      const origFees = { ...VERIFIED_STORY_IMAGE_MANIFEST['bcci-domestic-fees'] };
      try {
        VERIFIED_STORY_IMAGE_MANIFEST['bcci-domestic-fees'] = {
          ...origFees,
          approvalStatus: 'pending',
        };
        const pendingResult = validateStoryForPublication(
          { storyId: unapprovedStory.id },
          unapprovedStory,
          new Date(),
          { bypassEditorialHold: true }
        );
        expect(pendingResult.passed).toBe(false);
        const supportingCheck = pendingResult.checks.find((c) => c.name === 'supporting_media_approval');
        expect(supportingCheck?.passed).toBe(false);
      } finally {
        VERIFIED_STORY_IMAGE_MANIFEST['bcci-domestic-fees'] = origFees;
      }

      // Verify that when media approval is explicitly authorized by human reviewer, all gates pass
      const prev = { ...VERIFIED_STORY_IMAGE_MANIFEST['bcci-domestic-fees'] };
      try {
        VERIFIED_STORY_IMAGE_MANIFEST['bcci-domestic-fees'] = {
          ...prev,
          approvalStatus: 'approved',
          approvalTimestamp: '2026-10-25T12:00:00.000Z',
          approvedDigest: prev.approvedDigest || prev.expectedDigest || 'sha256:58285b107afc09664aca8319b9ff0197635947a6488f2f77ba96dd7eb7c6f38f',
          reviewedBy: 'Ananya Roy',
          reviewerRole: 'Senior Visual Editor',
        };

        const result = validateStoryForPublication(
          { storyId: unapprovedStory.id },
          unapprovedStory,
          new Date(),
          { bypassEditorialHold: true }
        );
        expect(result.passed).toBe(true);
        expect(result.checks.every((c) => c.passed)).toBe(true);
      } finally {
        VERIFIED_STORY_IMAGE_MANIFEST['bcci-domestic-fees'] = prev;
      }
    });

    it('should prevent bypassing validation via direct repository save with status="published"', async () => {
      const { MemoryStoryService } = await import('@/services/stories/service');
      const { DirectPublicationForbiddenError } = await import('@/lib/story/evidence-guard');
      const service = new MemoryStoryService();

      const publishedAttempt = {
        ...REMEDIATED_BCCI_CRICKET_STORY,
        status: 'published' as const,
      };

      await expect(service.saveStory(publishedAttempt)).rejects.toThrow(DirectPublicationForbiddenError);
    });

    it('should prevent bypassing validation via publishStory() when gates fail', async () => {
      const { MemoryStoryService } = await import('@/services/stories/service');
      const { PublicationBlockedError } = await import('@/lib/story/evidence-guard');
      const service = new MemoryStoryService();

      const unreviewedStory = {
        ...REMEDIATED_BCCI_CRICKET_STORY,
        status: 'review' as const,
      };
      await service.saveStory(unreviewedStory);

      // publishStory directly runs validateStoryForPublicationAsync, which fails because editorial hold is active
      await expect(service.publishStory(unreviewedStory.id)).rejects.toThrow(PublicationBlockedError);
    });
  });
});

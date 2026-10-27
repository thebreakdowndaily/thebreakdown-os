import { strict as assert } from 'node:assert';
import type { Story } from '../../types/canonical';
import {
  validateStoryHeroMedia,
  validateStorySupportingMedia,
} from '../../lib/image-intelligence/publication-validation';

function story(
  slug: string,
  storyType: Story['storyType'] = 'explainer',
  heroImage = '/images/editorial/test.svg',
  blocks: any[] = []
): Story {
  return {
    id: slug,
    slug,
    title: 'Test',
    headline: 'Test',
    summary: 'Summary',
    heroImage,
    heroImageAlt: 'Accessible test graphic',
    author: 'Test',
    category: 'technology',
    status: 'review',
    storyType,
    publicationStatus: 'review',
    evidenceScore: 1,
    readingTime: 3,
    publishedAt: '2026-10-24T00:00:00Z',
    createdAt: '2026-10-24T00:00:00Z',
    updatedAt: '2026-10-24T00:00:00Z',
    tags: [],
    blocks,
    sources: [],
    claims: [],
    timeline: [],
    faq: [],
    charts: [],
    relatedStoryIds: [],
    relatedEntityIds: [],
    relatedTopicIds: [],
  };
}

// 1. Pending hero approval fails closed
const aiLiteracyHero = validateStoryHeroMedia(story('ai-literacy-india-students-verify-ai'));
assert.equal(aiLiteracyHero.required, true);
assert.equal(aiLiteracyHero.passed, false);
assert.ok(aiLiteracyHero.violations.some((v) => v.includes('approval timestamp')));

// 2. Semiconductor hero fails closed (pending asset)
const semiHero = validateStoryHeroMedia(
  story('india-semiconductor-mission-fab-reality', 'explainer', '/images/stories/semiconductor-pli.jpg')
);
assert.equal(semiHero.required, true);
assert.equal(semiHero.passed, false);
assert.ok(semiHero.violations.some((v) => v.includes('approval timestamp')));

// 3. No-manifest story fails closed for feature story
assert.equal(validateStoryHeroMedia(story('no-manifest-story')).passed, false);

// 4. Non-feature story does not require strict hero manifest
assert.equal(validateStoryHeroMedia(story('ordinary-news', 'standard')).passed, true);

// 5. BCCI Ranji Trophy hero photo passes validation
const bcciHero = validateStoryHeroMedia(
  story('bcci-domestic-mandate-ranji-economics', 'explainer', '/images/stories/bcci-ranji-trophy.jpg')
);
assert.equal(bcciHero.required, true);
assert.equal(bcciHero.passed, true);
assert.equal(bcciHero.assetId, 'tb-bcci-ranji-trophy-photo-v1');
assert.equal(bcciHero.assetType, 'authentic-photo');

// 6. Accountability in India flagship hero passes validation
const accountabilityHero = validateStoryHeroMedia(
  story('accountability-in-india', 'explainer', '/images/stories/accountability-in-india.jpg')
);
assert.equal(accountabilityHero.required, true);
assert.equal(accountabilityHero.passed, true);
assert.equal(accountabilityHero.assetId, 'tb-accountability-in-india-hero-v1');
assert.equal(accountabilityHero.assetType, 'authentic-photo');

// 7. Semiconductor pending editorial graphic fails approval check
const semiGraphic = validateStoryHeroMedia(
  story('semiconductor-project-status', 'explainer', '/images/editorial/semiconductor-project-status.svg')
);
assert.equal(semiGraphic.required, true);
assert.equal(semiGraphic.passed, false);
assert.ok(semiGraphic.violations.some((v) => v.includes('approval timestamp')));
assert.equal(semiGraphic.assetId, 'tb-semiconductor-status-graphic-v1');
assert.equal(semiGraphic.assetType, 'original-editorial-graphic');

// 8. Supporting media validation: BCCI domestic fees graphic passes as supporting block for BCCI story
const bcciSupporting = validateStorySupportingMedia(
  story('bcci-domestic-mandate-ranji-economics', 'explainer', '/images/stories/bcci-ranji-trophy.jpg', [
    {
      type: 'image',
      data: {
        src: '/images/editorial/bcci-domestic-fees.svg',
        alt: 'Three senior men’s domestic daily fee tiers: ₹40,000, ₹50,000 and ₹60,000 across BCCI-published match-count bands; reserve fees are separate.',
        caption: "BCCI's 20 September 2021 senior men's domestic daily fee table.",
      },
    },
  ])
);
assert.equal(bcciSupporting.required, true);
assert.equal(bcciSupporting.passed, true, `BCCI supporting media must pass: ${bcciSupporting.violations.join(', ')}`);
assert.ok(bcciSupporting.assetIds.includes('tb-bcci-domestic-mandate-ranji-economics-graphic-v1'));

// 9. Feature story with missing supporting media blocks fails minimum visual package
const missingSupporting = validateStorySupportingMedia(
  story('bcci-domestic-mandate-ranji-economics', 'explainer', '/images/stories/bcci-ranji-trophy.jpg', [])
);
assert.equal(missingSupporting.required, true);
assert.equal(missingSupporting.passed, false);
assert.ok(missingSupporting.violations.some((v) => v.includes('visual-package minimum')));

// 10. Supporting media with pending asset fails validation
const pendingSupporting = validateStorySupportingMedia(
  story('ai-literacy-india-students-verify-ai', 'explainer', '/images/placeholders/policy-placeholder.svg', [
    {
      type: 'image',
      data: {
        src: '/images/editorial/ai-literacy-verification-path.svg',
        alt: 'Three-stage student verification framework: source provenance check, cross-model consistency testing, and primary document grounding.',
        caption: 'The student verification workflow piloted in Delhi schools. Original graphic by The Breakdown.',
      },
    },
  ])
);
assert.equal(pendingSupporting.required, true);
assert.equal(pendingSupporting.passed, false);
assert.ok(pendingSupporting.violations.some((v) => v.includes('explicit human media approval') || v.includes('approval timestamp')));

console.log('PASS publication validation: all hero and supporting media gates enforce invariants and fail-closed correctly.');

import { strict as assert } from 'node:assert';
import type { Story } from '../../types/canonical';
import { validateStoryHeroMedia } from '../../lib/image-intelligence/publication-validation';

function story(slug: string, storyType: Story['storyType'] = 'explainer', heroImage = '/images/editorial/test.svg'): Story {
  return {
    id: slug, slug, title: 'Test', headline: 'Test', summary: 'Summary', heroImage,
    heroImageAlt: 'Accessible test graphic', author: 'Test', category: 'technology', status: 'review',
    storyType, publicationStatus: 'review', evidenceScore: 1, readingTime: 3,
    publishedAt: '2026-10-24T00:00:00Z', createdAt: '2026-10-24T00:00:00Z', updatedAt: '2026-10-24T00:00:00Z',
    tags: [], blocks: [], sources: [], claims: [], timeline: [], faq: [], charts: [],
    relatedStoryIds: [], relatedEntityIds: [], relatedTopicIds: [],
  };
}

const held = validateStoryHeroMedia(story('ai-literacy-india-students-verify-ai'));
assert.equal(held.required, true);
assert.equal(held.passed, false);
assert.ok(held.violations.some((v) => v.includes('approval timestamp')));
assert.equal(validateStoryHeroMedia(story('no-manifest-story')).passed, false);
assert.equal(validateStoryHeroMedia(story('ordinary-news', 'standard')).passed, true);

// 1. BCCI Ranji Trophy hero photo passes validation
const bcciHero = validateStoryHeroMedia(
  story('bcci-domestic-mandate-ranji-economics', 'explainer', '/images/stories/bcci-ranji-trophy.jpg')
);
assert.equal(bcciHero.required, true);
assert.equal(bcciHero.passed, true);
assert.equal(bcciHero.assetId, 'tb-bcci-ranji-trophy-photo-v1');
assert.equal(bcciHero.assetType, 'authentic-photo');

// 2. Accountability in India flagship hero passes validation
const accountabilityHero = validateStoryHeroMedia(
  story('accountability-in-india', 'explainer', '/images/stories/accountability-in-india.jpg')
);
assert.equal(accountabilityHero.required, true);
assert.equal(accountabilityHero.passed, true);
assert.equal(accountabilityHero.assetId, 'tb-accountability-in-india-hero-v1');
assert.equal(accountabilityHero.assetType, 'authentic-photo');

// 3. Supporting BCCI domestic fees graphic passes validation
const bcciFeesGraphic = validateStoryHeroMedia(
  story('bcci-domestic-fees', 'explainer', '/images/editorial/bcci-domestic-fees.svg')
);
assert.equal(bcciFeesGraphic.required, true);
assert.equal(bcciFeesGraphic.passed, true);
assert.equal(bcciFeesGraphic.assetId, 'tb-bcci-domestic-mandate-ranji-economics-graphic-v1');
assert.equal(bcciFeesGraphic.assetType, 'original-editorial-graphic');

console.log('PASS hero media gate: missing manifest, pending approval, approved photographic assets, approved editorial graphic, and non-feature compatibility');

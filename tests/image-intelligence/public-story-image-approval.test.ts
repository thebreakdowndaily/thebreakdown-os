import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { resolveStoryHeroImage } from '../../lib/image-intelligence/service';
import { VERIFIED_STORY_IMAGE_MANIFEST } from '../../lib/image-intelligence/manifest';
import { EDITORIAL_RELEASE_HOLDS } from '../../lib/editorial/release-holds';

const entries = Object.entries(VERIFIED_STORY_IMAGE_MANIFEST);
assert.ok(entries.length > 0);
for (const [slug, record] of entries) {
  assert.ok(['approved', 'pending', 'rejected'].includes(record.approvalStatus || ''),
    `manifest entry ${slug} must have an explicit approval status`);
}
const unsafe = [
  'ai-literacy-india-students-verify-ai','india-semiconductor-mission-fab-reality',
  'india-china-border-tensions','india-china-border-lac','india-us-relations',
  'india-europe-relations','bcci-domestic-mandate-ranji-economics','india-china-relations',
  'india-uk-relations','india-indonesia-relations','education-budget',
];
for (const slug of unsafe) {
  const result = resolveStoryHeroImage({ slug, headline: slug, category: 'policy', heroImage: '/images/stories/unreviewed.jpg' });
  assert.equal(result.hero.isFallback, true, `${slug} must not expose unverified hero`);
  assert.ok(result.hero.src.startsWith('/images/placeholders/'));
}
const approved = resolveStoryHeroImage({
  slug: 'accountability-in-india', headline: 'Accountability in India', category: 'policy',
  heroImage: '/images/stories/accountability-in-india.jpg',
});
assert.equal(approved.hero.isFallback, false);
assert.equal(approved.hero.src, '/images/stories/accountability-in-india.jpg');

const surfaces = [
  'components/stories/StoriesArchive.tsx','components/home/DeepDivesGrid.tsx',
  'components/home/featured/FeaturedStories.tsx','components/home/featured/FeaturedStoryCard.tsx',
  'components/home/featured/FeaturedHeroCard.tsx','components/homepage/TopStory.tsx',
  'components/homepage/LatestInvestigations.tsx','components/ui/StoryCard.tsx',
  'components/story/RelatedStories.tsx','components/home/latest/LatestStories.tsx',
  'components/home/LeadStoryHero.tsx','features/home/view-model.ts',
];
for (const relative of surfaces) {
  const source = fs.readFileSync(path.join(process.cwd(), relative), 'utf8');
  assert.ok(source.includes('getStoryImagePresentation'), `${relative} uses centralized resolver`);
  assert.ok(!/src=\{(?:story|item|hero)\.heroImage(?:\s|\}|\|\|)/.test(source),
    `${relative} does not render raw hero paths`);
}
const presentation = fs.readFileSync(path.join(process.cwd(), 'lib/story/presentation-model.ts'), 'utf8');
assert.ok(presentation.includes('resolveStoryHeroImage(rs).hero'));
assert.ok(!presentation.includes('url: rs.heroImage'));
for (const slug of ['ai-literacy-india-students-verify-ai','india-semiconductor-mission-fab-reality','bcci-domestic-mandate-ranji-economics'])
  assert.equal(EDITORIAL_RELEASE_HOLDS[slug]?.status, 'HOLD', `${slug} remains held`);
for (const relative of ['lib/editorial/publication-gate.ts','lib/image-intelligence/publication-validation.ts'])
  assert.ok(fs.readFileSync(path.join(process.cwd(), relative), 'utf8').includes('Object.keys(EDITORIAL_RELEASE_HOLDS)'));
console.log(`PASS: story image approval and release-hold checks (${entries.length} manifest entries)`);

import assert from 'node:assert/strict';
import { matchImageToStoryContext } from '../lib/image-intelligence/context-matcher';
import { getManifestEntry } from '../lib/image-intelligence/manifest';
import { getStories } from '../utils/data-layer/store';
import { validateImageFile } from '../lib/image-intelligence/asset-validator';
import { validateStoryForPublication } from '../lib/editorial/publication-gate';
import type { Story } from '../types/canonical';

const indiaUK = {
  slug: 'india-uk-relations',
  headline: 'India-UK Relations: Beyond Colonial History to a Modern Strategic Partnership',
  category: 'geopolitics',
  tags: ['India-UK', 'FTA', 'diaspora', 'Commonwealth', 'defence', 'migration', 'colonial history'],
};
const indiaIndonesia = {
  slug: 'india-indonesia-relations',
  headline: 'India-Indonesia: How Maritime Neighbours Are Reshaping the Indo-Pacific',
  category: 'geopolitics',
  tags: ['India-Indonesia', 'maritime security', 'ASEAN', 'Indo-Pacific', 'trade', 'Act East'],
};
const indiaEV = {
  slug: 'india-ev-paradox',
  headline: "India's EV Paradox: Rising Sales, Stalled Charging, and the Battery Import Bill",
  category: 'environment',
  tags: ['EV', 'electric vehicles', 'FAME', 'batteries', 'charging infrastructure', 'PLI', 'sustainable transport', 'lithium-ion', 'import dependency'],
};

assert.equal(
  matchImageToStoryContext('/images/stories/india-europe-relations.jpg', indiaUK, getManifestEntry).isMatch,
  false,
  'an EU summit image must not be accepted for an India-UK story on the strength of shared words alone',
);
assert.equal(
  matchImageToStoryContext('/images/stories/india-europe-relations.jpg', indiaIndonesia, getManifestEntry).isMatch,
  false,
  'an EU summit image must not be accepted for an India-Indonesia story on the strength of shared words alone',
);
assert.equal(
  matchImageToStoryContext('/images/stories/climate-finance.jpg', indiaEV, getManifestEntry).isMatch,
  false,
  'climate-finance imagery must not be accepted as an EV story hero without a topic-specific match',
);
assert.equal(
  matchImageToStoryContext('/images/stories/india-china-border-tensions.jpg', {
    slug: 'india-china-relations',
    headline: 'India-China: Two Asian Giants in an Era of Mistrust and Strategic Rivalry',
    category: 'geopolitics',
    tags: ['India-China', 'border tensions', 'LAC', 'strategic rivalry'],
  }, getManifestEntry).isMatch,
  true,
  'specific China/border/tensions overlap remains acceptable',
);
assert.equal(
  matchImageToStoryContext('/images/placeholders/policy-placeholder.svg', indiaUK, getManifestEntry).isMatch,
  true,
  'an explicitly registered neutral category placeholder is acceptable until a verified image is sourced',
);
assert.equal(
  matchImageToStoryContext('/images/stories/global-trade.jpg', {
    slug: 'regional-policy-reform',
    headline: 'Regional public policy reform',
    category: 'policy',
    tags: ['trade'],
  }, getManifestEntry).isMatch,
  false,
  'one generic shared word such as trade must not prove that an image matches a story',
);
assert.equal(
  validateImageFile('/../package.json').isValid,
  false,
  'asset validation must reject paths that resolve outside public/',
);
assert.match(
  validateImageFile('/../package.json').error || '',
  /outside public directory/i,
  'path traversal is rejected before a filesystem target is inspected',
);


const seededStories = getStories({ pageSize: 1000 }).data;
const expectedAssignments: Record<string, string> = {
  'india-ev-paradox': '/images/stories/india-ev-paradox.svg',
  'india-indonesia-relations': '/images/stories/india-indonesia-relations.svg',
  'india-uk-relations': '/images/stories/india-uk-relations.svg',
};
for (const [slug, expectedImage] of Object.entries(expectedAssignments)) {
  const story = seededStories.find((item) => item.slug === slug);
  assert.ok(story, `the seed registry includes ${slug}`);
  assert.equal(story.heroImage, expectedImage, `${slug} must not reuse a cross-topic hero photo`);
  assert.equal(getManifestEntry(slug)?.approvedImage, expectedImage, `${slug} manifest must match its seed assignment`);
  assert.equal(getManifestEntry(slug)?.assetType, 'editorial-illustration', `${slug} asset must be identified honestly as an editorial illustration`);
  assert.equal(story.heroImageIsDecorative, false, `${slug} illustration must not be hidden from assistive technology`);
  assert.ok((story.heroImageAlt || '').trim().length > 20, `${slug} must have meaningful alt text`);
  assert.equal(validateImageFile(expectedImage).isValid, true, `${slug} asset must exist and pass image signature validation`);
  assert.equal(matchImageToStoryContext(expectedImage, { slug, headline: story.headline, category: story.category, tags: story.tags }, getManifestEntry).isMatch, true, `${slug} illustration must pass the story-context gate via its manifest`);
}


const publicationFixture: Story = {
  id: 'india-indonesia-relations',
  slug: 'india-indonesia-relations',
  title: 'India-Indonesia relations',
  headline: 'India-Indonesia: How Maritime Neighbours Are Reshaping the Indo-Pacific',
  summary: 'A review of maritime security, trade and diplomacy.',
  heroImage: '/images/placeholders/economy-placeholder.svg',
  heroImageAlt: 'A generic economy illustration',
  heroImageIsDecorative: false,
  author: 'The Breakdown Editorial',
  category: 'geopolitics',
  status: 'review',
  publicationStatus: 'review',
  storyType: 'standard',
  evidenceScore: 90,
  readingTime: 10,
  publishedAt: '2026-10-22T00:00:00.000Z',
  createdAt: '2026-10-20T00:00:00.000Z',
  updatedAt: '2026-10-22T00:00:00.000Z',
  tags: ['India-Indonesia', 'maritime security', 'ASEAN', 'Indo-Pacific', 'trade'],
  blocks: [{ id: 'body-1', type: 'text', region: 'main', data: { text: 'Story body for publication-gate regression.' } }],
  sources: [{ title: 'Official source', url: 'https://example.com/source', accessedAt: '2026-10-22', tier: 1 }],
  claims: [{ id: 'claim-1', claim: 'India and Indonesia cooperate on maritime issues.', data: '', source: 'Official source', sourceUrl: 'https://example.com/source', tier: 1, confidence: 0.9, status: 'verified' }],
  timeline: [],
  faq: [],
  charts: [],
  relatedStoryIds: [],
  relatedEntityIds: [],
  relatedTopicIds: [],
};
const publicationInput = { storyId: publicationFixture.id, triggeredBy: 'manual' as const };
const badPublication = validateStoryForPublication(publicationInput, publicationFixture, new Date('2026-10-22T00:00:00.000Z'));
assert.equal(
  badPublication.checks.find((check) => check.name === 'hero_image_integrity')?.passed,
  false,
  'publication gate must reject a valid but off-topic economy placeholder assigned to an India-Indonesia story',
);
const goodPublication = validateStoryForPublication(publicationInput, {
  ...publicationFixture,
  heroImage: '/images/stories/india-indonesia-relations.svg',
  heroImageAlt: 'Editorial illustration connecting India and Indonesia across a maritime route with a cargo ship and the two countries\' flags.',
}, new Date('2026-10-22T00:00:00.000Z'));
assert.equal(
  goodPublication.checks.find((check) => check.name === 'hero_image_integrity')?.passed,
  true,
  'publication gate must accept the story-specific registered illustration with descriptive alt text',
);
const missingAltPublication = validateStoryForPublication(publicationInput, {
  ...publicationFixture,
  heroImage: '/images/stories/india-indonesia-relations.svg',
  heroImageAlt: '',
  heroImageIsDecorative: false,
}, new Date('2026-10-22T00:00:00.000Z'));
assert.equal(
  missingAltPublication.checks.find((check) => check.name === 'hero_image_integrity')?.passed,
  false,
  'publication gate must reject an informative hero without alt text',
);
const decorativeImagePublication = validateStoryForPublication(publicationInput, {
  ...publicationFixture,
  heroImage: '/images/stories/india-indonesia-relations.svg',
  heroImageAlt: '',
  heroImageIsDecorative: true,
}, new Date('2026-10-22T00:00:00.000Z'));
assert.equal(
  decorativeImagePublication.checks.find((check) => check.name === 'hero_image_integrity')?.passed,
  true,
  'publication gate may accept an explicitly decorative hero image without alt text',
);
const genericAltPublication = validateStoryForPublication(publicationInput, {
  ...publicationFixture,
  heroImage: '/images/stories/india-indonesia-relations.svg',
  heroImageAlt: 'Mock alt text',
  heroImageIsDecorative: false,
}, new Date('2026-10-22T00:00:00.000Z'));
assert.equal(
  genericAltPublication.checks.find((check) => check.name === 'hero_image_integrity')?.passed,
  false,
  'publication gate must reject generic placeholder alt text',
);
const conflictingDecorativeAlt = validateStoryForPublication(publicationInput, {
  ...publicationFixture,
  heroImage: '/images/stories/india-indonesia-relations.svg',
  heroImageAlt: 'A descriptive alt text that should not be used for a decorative image.',
  heroImageIsDecorative: true,
}, new Date('2026-10-22T00:00:00.000Z'));
assert.equal(
  conflictingDecorativeAlt.checks.find((check) => check.name === 'hero_image_integrity')?.passed,
  false,
  'decorative images must not carry descriptive alt text',
);
const missingAssetPublication = validateStoryForPublication(publicationInput, {
  ...publicationFixture,
  heroImage: '/images/stories/does-not-exist.jpg',
  heroImageAlt: 'Story-specific editorial image that is missing from the repository.',
  heroImageIsDecorative: false,
}, new Date('2026-10-22T00:00:00.000Z'));
assert.equal(
  missingAssetPublication.checks.find((check) => check.name === 'hero_image_integrity')?.passed,
  false,
  'publication gate must reject a local image path that does not exist',
);


console.log('Image context, accessibility and asset-integrity regression tests passed');

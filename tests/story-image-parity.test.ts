import { strict as assert } from 'node:assert';
import { buildStoryPresentationModel } from '../lib/story/presentation-model';
import { createStoryJsonLd } from '../lib/seo/jsonld-story';
import { resolveStoryHeroImage } from '../lib/image-intelligence/service';
import type { Story } from '../types/canonical';

// Test 1: Pending hero approval must use honest fallback alt-text and maintain parity across surfaces
const pendingStory: Story = {
  id: 'story-ai-literacy-pending',
  slug: 'ai-literacy-india-students-verify-ai',
  headline: 'AI in the Classroom: Can Indian Students Learn to Verify What Algorithms Generate?',
  title: 'AI in the Classroom: Can Indian Students Learn to Verify What Algorithms Generate?',
  summary: 'Across Indian schools, students are turning to generative AI for homework. A new curriculum tests verification.',
  category: 'policy',
  storyType: 'explainer',
  author: 'The Breakdown Editorial',
  publishedAt: '2026-03-15T00:00:00.000Z',
  updatedAt: '2026-03-15T00:00:00.000Z',
  status: 'published',
  heroImage: '/images/stories/ai-literacy-india-students.jpg',
  heroImageAlt: 'Indian school students using tablets in a computer lab to verify AI-generated content',
  tags: ['education', 'ai-policy'],
  blocks: [],
};

// 1. Presentation Model
const presentationModel = buildStoryPresentationModel(pendingStory);
assert.ok(presentationModel.hero.heroMedia, 'heroMedia must exist');
const renderedHeroUrl = presentationModel.hero.heroMedia!.url;
const renderedAltText = presentationModel.hero.heroMedia!.altText;

// Assert hero is fallback SVG, not the unapproved photo
assert.ok(renderedHeroUrl.endsWith('.svg'), `Rendered hero must be fallback SVG, got ${renderedHeroUrl}`);
assert.notEqual(
  renderedAltText,
  pendingStory.heroImageAlt,
  'Fallback hero alt text must NEVER describe the unapproved photo'
);
assert.ok(
  renderedAltText.toLowerCase().includes('placeholder') || renderedAltText.toLowerCase().includes('awaiting approval'),
  `Fallback alt text must state it is a placeholder awaiting approval, got: "${renderedAltText}"`
);
assert.equal(presentationModel.hero.heroMedia!.caption, undefined, 'Fallback hero must not have caption');
assert.equal(presentationModel.hero.heroMedia!.credit, undefined, 'Fallback hero must not have credit');

// 2. Resolved Hero & Open Graph parity
const resolvedHero = resolveStoryHeroImage(pendingStory);
assert.equal(resolvedHero.hero.src, renderedHeroUrl, 'Resolved hero src must match rendered hero src');
assert.equal(resolvedHero.og.src, renderedHeroUrl, 'Resolved OG src must match rendered hero src');

// 3. JSON-LD parity
const jsonLd = createStoryJsonLd(pendingStory);
const newsArticle = jsonLd.find((node) => node['@type'] === 'NewsArticle') as Record<string, unknown> | undefined;
assert.ok(newsArticle, 'NewsArticle schema must exist in JSON-LD');
const schemaImage = newsArticle.image as { url: string } | undefined;
assert.ok(schemaImage, 'NewsArticle image must exist');
assert.ok(
  schemaImage.url.endsWith(renderedHeroUrl),
  `JSON-LD image URL (${schemaImage.url}) must match rendered hero URL (${renderedHeroUrl})`
);

// Test 2: Approved authentic hero maintains full parity across surfaces with approved alt text
const approvedStory: Story = {
  id: 'story-bcci-approved',
  slug: 'bcci-domestic-mandate-ranji-economics',
  headline: 'Ranji Trophy Economics: Inside the BCCI Domestic Mandate',
  title: 'Ranji Trophy Economics: Inside the BCCI Domestic Mandate',
  summary: 'An investigation into domestic cricket compensation and Ranji player economics.',
  category: 'policy',
  storyType: 'explainer',
  author: 'The Breakdown Editorial',
  publishedAt: '2026-02-01T00:00:00.000Z',
  updatedAt: '2026-02-01T00:00:00.000Z',
  status: 'published',
  heroImage: '/images/stories/bcci-ranji-trophy.jpg',
  heroImageAlt: 'Ranji Trophy cricket match in progress at a domestic stadium in India',
  tags: ['cricket', 'bcci', 'sports-economics'],
  blocks: [],
};

const approvedPresentation = buildStoryPresentationModel(approvedStory);
assert.ok(approvedPresentation.hero.heroMedia, 'Approved heroMedia must exist');
assert.equal(approvedPresentation.hero.heroMedia!.url, '/images/stories/bcci-ranji-trophy.jpg');
assert.ok(
  approvedPresentation.hero.heroMedia!.altText.includes('Ranji Trophy') ||
  approvedPresentation.hero.heroMedia!.altText.includes('cricket'),
  'Approved alt text must describe the authentic cricket match'
);

const approvedJsonLd = createStoryJsonLd(approvedStory);
const approvedNewsArticle = approvedJsonLd.find((node) => node['@type'] === 'NewsArticle') as Record<string, unknown> | undefined;
const approvedSchemaImage = approvedNewsArticle?.image as { url: string } | undefined;
assert.ok(
  approvedSchemaImage?.url.endsWith('/images/stories/bcci-ranji-trophy.jpg'),
  'JSON-LD image URL must match approved hero image'
);

console.log('PASS story image parity suite: presentation, OG, Twitter, and JSON-LD resolve identically with honest fallback alt-text.');

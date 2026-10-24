import { strict as assert } from 'node:assert';
import type { Story } from '../../types/canonical';
import { validateStoryHeroMedia } from '../../lib/image-intelligence/publication-validation';

function story(slug: string, storyType: Story['storyType'] = 'explainer'): Story {
  return {
    id: slug, slug, title: 'Test', headline: 'Test', summary: 'Summary', heroImage: '/images/editorial/test.svg',
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
console.log('PASS hero media gate: missing manifest, pending approval, and non-feature compatibility');

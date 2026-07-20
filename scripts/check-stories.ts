import { getStories } from '../utils/data-layer/store';
import type { APIStory } from '../utils/data-layer/types';

const stories = getStories({ pageSize: 100 }).data;

let allPass = true;
const requiredIds = ['hero', 'executive-summary', 'evidence', 'related-stories', 'author-box'];

function hasSection(id: string, story: APIStory): boolean {
  switch (id) {
    case 'hero':
      return !!(
        story.headline ||
        story.summary ||
        story.heroImage ||
        story.publishedAt ||
        story.updatedAt ||
        story.readingTime ||
        story.author ||
        story.evidenceScore
      );
    case 'executive-summary':
      return !!(story.summary || (story.keyPoints && story.keyPoints.length > 0));
    case 'evidence':
      return !!(
        (story.claims && story.claims.length > 0) ||
        (story.sources && story.sources.length > 0) ||
        story.evidenceScore !== undefined
      );
    case 'related-stories':
      return !!(story.relatedStories && story.relatedStories.length > 0);
    case 'author-box':
      return !!(story.author && story.author.name);
    default:
      return false;
  }
}

for (const story of stories) {
  const missing = requiredIds.filter(id => !hasSection(id, story));
  if (missing.length > 0) {
    console.log(`Story ${story.slug} is missing required sections: ${missing.join(', ')}`);
    allPass = false;
  }
}

if (allPass) {
  console.log("ALL STORIES match the required structure.");
}

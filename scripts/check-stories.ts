import { getStories } from '../utils/data-layer/store';
import { buildStory } from '../utils/website-builder';
import type { StoryJSON } from '../utils/types';

const stories = getStories({ pageSize: 100 }).data as unknown as StoryJSON[];

let allPass = true;
const requiredIds = ['hero', 'executive-summary', 'evidence', 'related-stories', 'author-box'];

for (const story of stories) {
  const page = buildStory(story);
  const sectionIds = page.sections.map(s => s.id);
  
  const missing = requiredIds.filter(id => !sectionIds.includes(id));
  if (missing.length > 0) {
    console.log(`Story ${story.slug} is missing required sections: ${missing.join(', ')}`);
    allPass = false;
  }
}

if (allPass) {
  console.log("ALL STORIES match the required structure.");
}

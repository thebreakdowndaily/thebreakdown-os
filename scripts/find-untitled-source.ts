import { getPublicStories } from '../utils/data-layer/store';
const stories = getPublicStories({ pageSize: 1000 }).data;
for (const story of stories) {
  for (const s of story.sources || []) {
    if (!s || !s.title) {
      console.log('Story with source missing title:', story.slug, s);
    }
  }
}

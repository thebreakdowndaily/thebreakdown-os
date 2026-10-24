import { strict as assert } from 'node:assert';
import type { Story, StoryBlock } from '../../types/canonical';
import { estimateReadingTimeMinutes, countNarrativeWords, getEditorialNarrativeTarget } from '../../lib/story/narrative-metrics';

const block = (type: string, text: string, region = 'main') => ({ id: type + text, type, region, data: { text } }) as StoryBlock;
const blocks = [
  block('heading-1', 'A headline does not count'),
  block('paragraph', "India's students verify AI-generated claims."),
  block('paragraph', 'A second paragraph has 12,500 learners.'),
  block('source-card', 'Source title and citation do not count'),
  block('paragraph', 'Appendix material', 'appendix'),
];
assert.equal(countNarrativeWords(blocks), 12);
assert.equal(estimateReadingTimeMinutes(311), 2);
assert.equal(estimateReadingTimeMinutes(0), 0);
assert.throws(() => estimateReadingTimeMinutes(100, 0));
const story = {
  blocks,
  readingTime: 8,
} as Story;
assert.equal(countNarrativeWords(story.blocks), 12);
assert.equal(getEditorialNarrativeTarget({ slug: 'ai-literacy-india-students-verify-ai', storyType: 'explainer' }), 1800);
console.log('PASS narrative metrics: exclusions, Unicode-aware count, reading-time calculation, and story-specific target');

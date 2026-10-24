import { strict as assert } from 'node:assert';
import type { Story, StoryBlock } from '../../types/canonical';
import { calculateReadingTimeMinutes, countNarrativeWords, validateNarrativeQuality } from '../../lib/story/narrative-metrics';

const block = (type: string, text: string, region = 'main') => ({ id: type + text, type, region, data: { text } }) as StoryBlock;
const blocks = [
  block('heading-1', 'A headline does not count'),
  block('paragraph', "India's students verify AI-generated claims."),
  block('paragraph', 'A second paragraph has 12,500 learners.'),
  block('source-card', 'Source title and citation do not count'),
  block('paragraph', 'Appendix material', 'appendix'),
];
assert.equal(countNarrativeWords(blocks), 10);
assert.equal(calculateReadingTimeMinutes(311), 2);
assert.equal(calculateReadingTimeMinutes(0), 1);
assert.throws(() => calculateReadingTimeMinutes(-1));
const story = {
  blocks,
  readingTime: 8,
} as Story;
const quality = validateNarrativeQuality(story, 1800);
assert.equal(quality.passed, false);
assert.equal(quality.narrativeWords, 10);
assert.equal(quality.calculatedReadingTimeMinutes, 1);
assert.equal(quality.violations.length, 2);
console.log('PASS narrative metrics: exclusions, Unicode-aware count, reading-time calculation, and underlength blocker');

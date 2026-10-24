import type { Story, StoryType } from '@/types/canonical';

/**
 * Narrative blocks only. Do not count headlines, summaries, FAQs, timelines,
 * claims ledgers, source lists, captions, or CMS metadata as article prose.
 */
const NARRATIVE_BLOCK_TYPES = new Set([
  'paragraph',
  'paragraph-text',
  'text',
  'rich-text',
  'blockquote',
  'quote',
  'pullquote',
]);

const MINIMUM_NARRATIVE_WORDS: Record<StoryType, number> = {
  standard: 450,
  briefing: 800,
  explainer: 1800,
  analysis: 1800,
  investigation_chapter: 2200,
};

export const EDITORIAL_READING_WORDS_PER_MINUTE = 220;

type NarrativeBlock = {
  type?: string;
  region?: string;
  content?: unknown;
  text?: unknown;
  data?: unknown;
};

/** Extract only authored prose fields from a canonical or denormalized block. */
function proseFromBlock(block: NarrativeBlock): string {
  if (!block || !NARRATIVE_BLOCK_TYPES.has(String(block.type || '').toLowerCase())) return '';
  if (block.region && block.region !== 'main') return '';

  const values: string[] = [];
  for (const value of [block.content, block.text]) {
    if (typeof value === 'string') values.push(value);
  }

  if (typeof block.data === 'string') {
    values.push(block.data);
  } else if (block.data && typeof block.data === 'object' && !Array.isArray(block.data)) {
    const data = block.data as Record<string, unknown>;
    for (const key of ['text', 'content', 'body', 'markdown', 'quote']) {
      if (typeof data[key] === 'string') values.push(data[key] as string);
    }
  }

  return [...new Set(values)].join(' ').replace(/<[^>]*>/g, ' ').replace(/&nbsp;|&#160;/gi, ' ');
}

export function countNarrativeWords(blocks: readonly NarrativeBlock[] | null | undefined): number {
  const prose = (blocks || []).map(proseFromBlock).filter(Boolean).join(' ');
  const matches = prose.match(/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu);
  return matches?.length || 0;
}

export function estimateReadingTimeMinutes(
  narrativeWords: number,
  wordsPerMinute = EDITORIAL_READING_WORDS_PER_MINUTE,
): number {
  if (!Number.isFinite(narrativeWords) || narrativeWords <= 0) return 0;
  if (!Number.isFinite(wordsPerMinute) || wordsPerMinute <= 0) {
    throw new Error('wordsPerMinute must be a positive finite number');
  }
  return Math.max(1, Math.ceil(narrativeWords / wordsPerMinute));
}

export function minimumNarrativeWordsForStoryType(storyType: StoryType | undefined): number {
  return MINIMUM_NARRATIVE_WORDS[storyType || 'standard'];
}

export function getEditorialNarrativeTarget(story: Pick<Story, 'slug' | 'storyType'>): number {
  // These are the specific P0 assignments; their minimums follow the editorial brief.
  if (story.slug === 'ai-literacy-india-students-verify-ai') return 1800;
  if (story.slug === 'india-semiconductor-mission-fab-reality') return 2000;
  if (story.slug === 'bcci-domestic-mandate-ranji-economics') return 1800;
  return minimumNarrativeWordsForStoryType(story.storyType);
}

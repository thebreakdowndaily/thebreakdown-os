import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import StoryCard from '../../components/ui/StoryCard';

describe('StoryCard trust language', () => {
  const story = {
    slug: 'test-story',
    headline: 'A reported story',
    summary: 'A source-backed summary.',
    publishedAt: '2026-10-01T00:00:00.000Z',
    readingTime: 5,
    evidenceScore: 85,
    category: 'Policy',
  };

  it('does not label a story Fact-Checked without explicit review metadata', () => {
    for (const variant of ['default', 'featured'] as const) {
      const html = renderToStaticMarkup(createElement(StoryCard, { story, variant }));
      expect(html).not.toContain('Fact-Checked');
      expect(html).toContain('A reported story');
    }
  });
});

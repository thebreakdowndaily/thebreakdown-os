import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { TrustBar } from '../components/home/trust/TrustBar';

describe('TrustBar metric labels', () => {
  it('labels the chaptersPublished count as published chapters, not reviewed chapters', () => {
    const html = renderToStaticMarkup(createElement(TrustBar, {
      chaptersPublished: 8,
      claimsRegistered: 25,
      primarySources: 12,
      lastVerified: '2026-10-15',
    }));

    expect(html).toContain('Published Chapters:');
    expect(html).not.toContain('Chapters Reviewed:');
  });

  it('does not show a successful marker for a missing chapter count', () => {
    const html = renderToStaticMarkup(createElement(TrustBar, {}));

    expect(html).toContain('Published Chapters:');
    expect(html).toContain('—');
    expect(html).not.toContain('✓');
  });
});

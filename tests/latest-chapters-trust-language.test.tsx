import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import LatestChapters from '../components/home/LatestChapters';
import type { TrustMetrics } from '../lib/knowledge/trust-metrics';

describe('LatestChapters trust language', () => {
  it('shows linked evidence counts without asserting universal fact-checking', () => {
    const trustMetrics = {
      chapterOneClaims: 22,
      chapterOneSources: 32,
    } as unknown as TrustMetrics;

    const html = renderToStaticMarkup(createElement(LatestChapters, { trustMetrics }));

    expect(html).toContain('22 linked claims');
    expect(html).toContain('32 linked sources');
    expect(html).not.toContain('Fully Sourced &amp; Fact-Checked');
    expect(html).not.toContain('Fully Sourced & Fact-Checked');
  });

  it('shows unavailable counts rather than inventing claim/source totals', () => {
    const html = renderToStaticMarkup(createElement(LatestChapters, { trustMetrics: null }));

    expect(html).toContain('-- linked claims');
    expect(html).toContain('-- linked sources');
  });
});

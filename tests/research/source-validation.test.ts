/**
 * RIE v1.2 production source validation: fully deterministic RSS outcomes.
 * Governing document: docs/research/RIE_V1_2_PRODUCTION_SOURCE_VALIDATION.md
 */

import { RssAdapter } from '../../services/intelligence/research/adapters/rss';

const feed = {
  url: 'https://example.com/feed.xml',
  publisher: 'Test authority',
  sourceType: 'GOVERNMENT' as const,
  sourceClass: 'PRIMARY' as const,
};

function context(fetcher: (url: string) => Promise<{ ok: boolean; status?: number; text: () => Promise<string> }>) {
  return { entities: [], fetcher, now: () => new Date(), maxResults: 10 };
}

describe('RIE v1.2 production source validation', () => {
  it('classifies a valid populated RSS feed as HEALTHY_WITH_ITEMS', async () => {
    const outcomes: string[] = [];
    const adapter = new RssAdapter({ feeds: [feed], retries: 0, onFeedOutcome: (o) => outcomes.push(o.status) });
    await adapter.discover({ text: 'policy' }, context(async () => ({
      ok: true, status: 200, text: async () => '<rss><channel><item><title>Policy update</title><link>https://example.com/a</link></item></channel></rss>',
    })));
    expect(outcomes).toEqual(['HEALTHY_WITH_ITEMS']);
  });

  it('classifies a valid RSS feed with zero items as HEALTHY_EMPTY', async () => {
    const outcomes: string[] = [];
    const adapter = new RssAdapter({ feeds: [feed], retries: 0, onFeedOutcome: (o) => outcomes.push(o.status) });
    await adapter.discover({ text: 'policy' }, context(async () => ({
      ok: true, status: 200, text: async () => '<rss><channel><title>Empty</title></channel></rss>',
    })));
    expect(outcomes).toEqual(['HEALTHY_EMPTY']);
  });

  it('classifies structurally malformed RSS as INVALID_FEED', async () => {
    const outcomes: string[] = [];
    const adapter = new RssAdapter({ feeds: [feed], retries: 0, onFeedOutcome: (o) => outcomes.push(o.status) });
    await adapter.discover({ text: 'policy' }, context(async () => ({ ok: true, status: 200, text: async () => '<rss />' })));
    expect(outcomes).toEqual(['INVALID_FEED']);
  });

  it('classifies HTML and other unsupported documents as UNSUPPORTED', async () => {
    const outcomes: string[] = [];
    const adapter = new RssAdapter({ feeds: [feed], retries: 0, onFeedOutcome: (o) => outcomes.push(o.status) });
    await adapter.discover({ text: 'policy' }, context(async () => ({ ok: true, status: 200, text: async () => '<html><body>Not a feed</body></html>' })));
    expect(outcomes).toEqual(['UNSUPPORTED']);
  });

  it('classifies HTTP failure and timeout without fabricating successful health', async () => {
    const outcomes: string[] = [];
    const adapter = new RssAdapter({ feeds: [feed], retries: 0, onFeedOutcome: (o) => outcomes.push(o.status) });
    await adapter.discover({ text: 'policy' }, context(async () => ({ ok: false, status: 503, text: async () => '' })));
    await adapter.discover({ text: 'policy' }, context(async () => { throw new Error('request timeout'); }));
    expect(outcomes).toEqual(['UNAVAILABLE', 'TIMEOUT']);
  });
});

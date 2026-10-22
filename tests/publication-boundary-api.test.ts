import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  libBootstrapServices: vi.fn(),
  serviceBootstrapServices: vi.fn(),
  checkLimit: vi.fn().mockResolvedValue({ allowed: true }),
  applyRateHeaders: vi.fn(),
  db: vi.fn(),
}));

vi.mock('@/lib/bootstrap', () => ({
  bootstrapServices: mocks.libBootstrapServices,
}));

vi.mock('@/services/bootstrap', () => ({
  bootstrapServices: mocks.serviceBootstrapServices,
}));

vi.mock('@/features/rate-limiting/limiter', () => ({
  rateLimiter: {
    checkLimit: mocks.checkLimit,
    applyHeaders: mocks.applyRateHeaders,
    create429Response: vi.fn(),
  },
}));

vi.mock('@/lib/api-v2', () => ({
  db: mocks.db,
  list: (data: unknown[], total: number, page = 1, pageSize = data.length) =>
    new Response(JSON.stringify({
      data,
      meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
    }), { headers: { 'Content-Type': 'application/json' } }),
  serverError: (error: unknown) =>
    new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    }),
}));

import { GET as getEvidenceGraph } from '@/app/api/graph/evidence/route';
import { GET as getExplorer } from '@/app/api/v2/explorer/route';
import { GET as getPublicSearch } from '@/app/api/search/route';
import { GET as getV1Search } from '@/app/api/v1/search/route';
import { GET as getV2Search } from '@/app/api/v2/search/route';
import { getGraph, getPublicStories } from '@/utils/data-layer/store';

function makeStory(overrides: Record<string, unknown> = {}) {
  return {
    id: 'public-story-id',
    slug: 'public-story',
    title: 'Public story with public-marker',
    headline: 'Public story with public-marker',
    summary: 'A public summary with public-marker',
    heroImage: '',
    author: 'The Breakdown Editorial',
    category: 'Policy',
    status: 'published',
    publicationStatus: 'published',
    storyType: 'standard',
    evidenceScore: 90,
    readingTime: 5,
    publishedAt: '2026-01-01T00:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    tags: [],
    blocks: [
      {
        id: 'public-block',
        type: 'text',
        region: 'main',
        data: { content: 'public-marker' },
      },
    ],
    sources: [
      {
        id: 'public-source',
        title: 'Public source',
        publisher: 'Public desk',
        url: 'https://example.org/public-source',
        tier: 1,
      },
    ],
    claims: [
      {
        id: 'public-claim',
        claim: 'Public claim marker',
        data: 'Public claim details',
        source: 'Public desk',
        status: 'verified',
        sourceCount: 1,
        confidence: 0.9,
      },
    ],
    timeline: [],
    faq: [],
    charts: [],
    relatedStoryIds: [],
    relatedEntityIds: [],
    relatedTopicIds: [],
    isTestArtifact: false,
    ...overrides,
  };
}

function makeQuarantinedStory() {
  return makeStory({
    id: 'quarantined-story-id',
    slug: 'quarantined-story',
    title: 'quarantined-sentinel',
    headline: 'quarantined-sentinel',
    summary: 'Private fixture must never appear in public discovery',
    isTestArtifact: true,
    blocks: [
      {
        id: 'quarantined-block',
        type: 'evidence',
        region: 'main',
        data: { content: 'quarantined-sentinel' },
      },
    ],
    sources: [
      {
        id: 'quarantined-source',
        title: 'quarantined-sentinel source',
        publisher: 'Private desk',
        url: 'https://example.org/private-source',
        tier: 1,
      },
    ],
    claims: [
      {
        id: 'quarantined-claim',
        claim: 'quarantined-sentinel claim',
        data: 'Private details',
        source: 'Private desk',
        status: 'unverified',
        sourceCount: 1,
        confidence: 0.1,
      },
    ],
  });
}

describe('Publication boundary — graph and explorer projections', () => {
  beforeEach(() => {
    mocks.libBootstrapServices.mockReset();
    mocks.serviceBootstrapServices.mockReset();
  });

  it('builds the evidence graph from public stories and drops quarantined artifacts defensively', async () => {
    const publicStory = makeStory();
    const quarantinedStory = makeQuarantinedStory();
    const getPublicStoriesMock = vi.fn().mockResolvedValue({
      data: [publicStory, quarantinedStory],
      meta: { total: 2, page: 1, pageSize: 2 },
    });
    const getStoriesMock = vi.fn().mockResolvedValue({
      data: [publicStory, quarantinedStory],
      meta: { total: 2, page: 1, pageSize: 2 },
    });

    mocks.libBootstrapServices.mockReturnValue({
      stories: {
        getPublicStories: getPublicStoriesMock,
        getStories: getStoriesMock,
      },
    });

    const response = await getEvidenceGraph(new Request('http://localhost/api/graph/evidence'));
    expect(response.status).toBe(200);
    const graph = await response.json();

    expect(getPublicStoriesMock).toHaveBeenCalledOnce();
    expect(getStoriesMock).not.toHaveBeenCalled();
    expect(graph.nodes.some((node: { id: string }) => node.id === 'public-story-id')).toBe(true);
    expect(graph.nodes.some((node: { id: string }) => node.id === 'quarantined-story-id')).toBe(false);
    expect(graph.nodes.some((node: { id: string }) => node.id === 'quarantined-claim')).toBe(false);
    expect(graph.nodes.some((node: { id: string }) => node.id === 'quarantined-source')).toBe(false);
  });

  it('keeps quarantined story, claim, source, and evidence content out of explorer results', async () => {
    const publicStory = makeStory();
    const quarantinedStory = makeQuarantinedStory();
    const getPublicStoriesMock = vi.fn().mockResolvedValue({
      // Deliberately include the artifact to verify route-level defense in depth
      // against a faulty or legacy repository adapter.
      data: [publicStory, quarantinedStory],
      meta: { total: 2, page: 1, pageSize: 2 },
    });
    const getStoriesMock = vi.fn().mockResolvedValue({
      data: [publicStory, quarantinedStory],
      meta: { total: 2, page: 1, pageSize: 2 },
    });

    mocks.serviceBootstrapServices.mockResolvedValue({
      stories: {
        getPublicStories: getPublicStoriesMock,
        getStories: getStoriesMock,
      },
      topics: { getTopics: vi.fn().mockResolvedValue({ data: [] }) },
      entities: { getEntities: vi.fn().mockResolvedValue({ data: [] }) },
      timelines: { getTimelines: vi.fn().mockResolvedValue({ data: [] }) },
    });

    const response = await getExplorer(
      new NextRequest('http://localhost/api/v2/explorer?q=quarantined-sentinel'),
    );
    expect(response.status).toBe(200);
    const result = await response.json();

    expect(getPublicStoriesMock).toHaveBeenCalledOnce();
    expect(getStoriesMock).not.toHaveBeenCalled();
    expect(result.data).toEqual([]);
    expect(JSON.stringify(result)).not.toContain('quarantined-sentinel');
  });

  it('keeps raw graph story nodes within the public-story projection with no dangling links', () => {
    const { data: visibleStories } = getPublicStories({ pageSize: 100 });
    const visibleSlugs = new Set(
      visibleStories
        .filter((story) => (story as typeof story & { isTestArtifact?: boolean }).isTestArtifact !== true)
        .map((story) => story.slug),
    );

    const graph = getGraph();
    const storyNodes = graph.nodes.filter((node) => node.type === 'story');
    expect(storyNodes.length).toBeGreaterThan(0);
    expect(storyNodes.every((node) => visibleSlugs.has(node.id))).toBe(true);
    expect(
      graph.links.every(
        (link) =>
          graph.nodes.some((node) => node.id === link.source) &&
          graph.nodes.some((node) => node.id === link.target),
      ),
    ).toBe(true);
  });

  it('filters pre-existing unpublished story entries from /api/search before pagination and totals', async () => {
    const publicStory = makeStory({ id: 'allowed-story-id', slug: 'allowed-story' });
    const search = vi.fn().mockReturnValue({
      data: [
        { id: 'allowed-story-id', type: 'story', slug: 'allowed-story', title: 'Public match' },
        { id: 'hidden-story-id', type: 'story', slug: 'hidden-story', title: 'private needle' },
        { id: 'public-entity-id', type: 'entity', slug: 'public-entity', title: 'Public entity match' },
      ],
      meta: { total: 3, page: 1, pageSize: 20 },
    });
    mocks.libBootstrapServices.mockReturnValue({
      stories: {
        getPublicStories: vi.fn().mockResolvedValue({
          data: [publicStory],
          meta: { total: 1, page: 1, pageSize: 1 },
        }),
      },
      search: { search, searchByType: search },
    });

    const response = await getPublicSearch(
      new NextRequest('http://localhost/api/search?q=needle&limit=20'),
    );
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.data.map((item: { id: string }) => item.id)).toEqual([
      'allowed-story-id',
      'public-entity-id',
    ]);
    expect(result.total).toBe(2);
    expect(result.meta.total).toBe(2);
    expect(JSON.stringify(result)).not.toContain('hidden-story-id');
  });

  it('filters pre-existing unpublished story entries from /api/v1/search', async () => {
    const publicStory = makeStory({ id: 'allowed-story-id', slug: 'allowed-story' });
    const search = vi.fn().mockReturnValue({
      data: [
        { id: 'allowed-story-id', type: 'story', slug: 'allowed-story', title: 'Public match' },
        { id: 'hidden-story-id', type: 'story', slug: 'hidden-story', title: 'private needle' },
        { id: 'public-entity-id', type: 'entity', slug: 'public-entity', title: 'Public entity match' },
      ],
      meta: { total: 3, page: 1, pageSize: 20 },
    });
    mocks.libBootstrapServices.mockReturnValue({
      stories: {
        getPublicStories: vi.fn().mockResolvedValue({
          data: [publicStory],
          meta: { total: 1, page: 1, pageSize: 1 },
        }),
      },
      search: { search, searchByType: search },
    });

    const response = await getV1Search(
      new NextRequest('http://localhost/api/v1/search?q=needle&page=1&pageSize=20'),
    );
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.data.map((item: { id: string }) => item.id)).toEqual([
      'allowed-story-id',
      'public-entity-id',
    ]);
    expect(result.meta.total).toBe(2);
    expect(JSON.stringify(result)).not.toContain('hidden-story-id');
  });


  it('constrains database-backed v2 story search to current public slugs', async () => {
    const calls: Array<{ table: string; inColumn?: string; inValues?: string[]; equalities: Record<string, unknown>; notEqualities: Record<string, unknown> }> = [];
    const makeBuilder = (table: string) => {
      const state: {
        table: string;
        equalities: Record<string, unknown>;
        notEqualities: Record<string, unknown>;
        inColumn?: string;
        inValues?: string[];
      } = { table, equalities: {}, notEqualities: {} };
      const builder: any = {
        select: vi.fn(() => builder),
        eq: vi.fn((column: string, value: unknown) => {
          state.equalities[column] = value;
          return builder;
        }),
        neq: vi.fn((column: string, value: unknown) => {
          state.notEqualities[column] = value;
          return builder;
        }),
        lte: vi.fn(() => builder),
        in: vi.fn((column: string, values: string[]) => {
          state.inColumn = column;
          state.inValues = values;
          return builder;
        }),
        textSearch: vi.fn(() => builder),
        or: vi.fn(() => builder),
        order: vi.fn(() => builder),
        range: vi.fn(async () => {
          calls.push({
            table: state.table,
            inColumn: state.inColumn,
            inValues: state.inValues,
            equalities: { ...state.equalities },
            notEqualities: { ...state.notEqualities },
          });
          if (table === 'stories') {
            return { data: [{ id: 'visible-id', slug: 'visible-story' }], count: 1, error: null };
          }
          if (state.equalities.ref_type === 'story') {
            return {
              data: [{ ref_id: 'visible-id', ref_type: 'story', ref_slug: 'visible-story', title: 'Visible story', score: 10 }],
              count: 1,
              error: null,
            };
          }
          return {
            data: [{ ref_id: 'topic-id', ref_type: 'topic', ref_slug: 'public-topic', title: 'Public topic', score: 8 }],
            count: 1,
            error: null,
          };
        }),
      };
      return builder;
    };
    mocks.db.mockReset().mockReturnValue({
      from: (table: string) => makeBuilder(table),
    });

    const response = await getV2Search(
      new NextRequest('http://localhost/api/v2/search?q=needle&page=1&pageSize=20'),
    );
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.meta.total).toBe(2);
    expect(result.data.map((row: { ref_id: string }) => row.ref_id)).toEqual(['visible-id', 'topic-id']);
    const storyIndexCall = calls.find((call) => call.table === 'index_entries' && call.equalities.ref_type === 'story');
    expect(storyIndexCall?.inColumn).toBe('ref_slug');
    expect(storyIndexCall?.inValues).toEqual(['visible-story']);
  });

  it('safely paginates and resolves public stories when repository contains more than 1,000 published stories', async () => {
    const calls: Array<{ table: string; inColumn?: string; inValues?: string[]; rangeStart?: number; rangeEnd?: number }> = [];

    // Simulate 1,050 published stories in the database
    const batch1 = Array.from({ length: 1000 }, (_, i) => ({ slug: `story-${i + 1}` }));
    const batch2 = Array.from({ length: 50 }, (_, i) => ({ slug: `story-${1000 + i + 1}` }));

    const makeBuilder = (table: string) => {
      let inCol: string | undefined;
      let inVals: string[] | undefined;
      const builder: any = {
        select: vi.fn(() => builder),
        eq: vi.fn(() => builder),
        neq: vi.fn(() => builder),
        lte: vi.fn(() => builder),
        in: vi.fn((col: string, vals: string[]) => {
          inCol = col;
          inVals = vals;
          return builder;
        }),
        textSearch: vi.fn(() => builder),
        or: vi.fn(() => builder),
        order: vi.fn(() => builder),
        range: vi.fn(async (start: number, end: number) => {
          calls.push({ table, inColumn: inCol, inValues: inVals, rangeStart: start, rangeEnd: end });
          if (table === 'stories') {
            if (start === 0) {
              return { data: batch1, count: 1050, error: null };
            }
            if (start === 1000) {
              return { data: batch2, count: 1050, error: null };
            }
            return { data: [], count: 1050, error: null };
          }
          // index_entries for story query at page 52 (items 1020..1039)
          return {
            data: [
              { ref_id: 'story-1025-id', ref_type: 'story', ref_slug: 'story-1025', title: 'Deep story 1025', score: 99 },
            ],
            count: 1050,
            error: null,
          };
        }),
      };
      return builder;
    };

    mocks.db.mockReset().mockReturnValue({
      from: (table: string) => makeBuilder(table),
    });

    // Request page 52 (items beyond 1,000) with type=story
    const response = await getV2Search(
      new NextRequest('http://localhost/api/v2/search?q=needle&type=story&page=52&pageSize=20'),
    );
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.data.length).toBe(1);
    expect(result.data[0].ref_slug).toBe('story-1025');
    expect(result.meta.page).toBe(52);
    expect(result.meta.total).toBe(1050);

    // Verify stories table was batched across both ranges: 0..999 and 1000..1999
    const storyCalls = calls.filter((c) => c.table === 'stories');
    expect(storyCalls.length).toBe(2);
    expect(storyCalls[0].rangeStart).toBe(0);
    expect(storyCalls[0].rangeEnd).toBe(999);
    expect(storyCalls[1].rangeStart).toBe(1000);
    expect(storyCalls[1].rangeEnd).toBe(1999);

    // Verify index_entries in query contains stories beyond 1,000
    const indexCall = calls.find((c) => c.table === 'index_entries');
    expect(indexCall?.inColumn).toBe('ref_slug');
    expect(indexCall?.inValues?.includes('story-1025')).toBe(true);
    expect(indexCall?.inValues?.length).toBe(1050);
  });

  it('safely handles mixed search pagination past index 1,000 without returning empty array', async () => {
    const makeBuilder = (table: string) => {
      const state: { equalities: Record<string, unknown>; notEqualities: Record<string, unknown> } = {
        equalities: {},
        notEqualities: {},
      };
      const builder: any = {
        select: vi.fn(() => builder),
        eq: vi.fn((col: string, val: unknown) => {
          state.equalities[col] = val;
          return builder;
        }),
        neq: vi.fn((col: string, val: unknown) => {
          state.notEqualities[col] = val;
          return builder;
        }),
        lte: vi.fn(() => builder),
        in: vi.fn(() => builder),
        textSearch: vi.fn(() => builder),
        or: vi.fn(() => builder),
        order: vi.fn(() => builder),
        range: vi.fn(async (start: number, end: number) => {
          if (table === 'stories') {
            return { data: [{ slug: 'visible-story' }], count: 1, error: null };
          }
          if (table === 'index_entries') {
            if (state.equalities.ref_type === 'story') {
              return { data: [], count: 0, error: null };
            }
            const rows = Array.from({ length: end + 1 }, (_, i) => ({
              ref_id: `item-${i + 1}`,
              ref_type: 'topic',
              ref_slug: `topic-${i + 1}`,
              title: `Topic ${i + 1}`,
              score: 2000 - i,
            }));
            return { data: rows, count: 2000, error: null };
          }
          return { data: [], count: 0, error: null };
        }),
      };
      return builder;
    };

    mocks.db.mockReset().mockReturnValue({
      from: (table: string) => makeBuilder(table),
    });

    // Request page 51 (items 1000..1019)
    const response = await getV2Search(
      new NextRequest('http://localhost/api/v2/search?q=needle&page=51&pageSize=20'),
    );
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.data.length).toBe(20);
    expect(result.meta.page).toBe(51);
    expect(result.data[0].ref_id).toBe('item-1001');
  });

});

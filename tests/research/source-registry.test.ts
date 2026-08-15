/**
 * ─── Research Intelligence — Source Registry Test ─────────────────────────────
 * Governing document: docs/research/source-governance.md
 *
 * Covers the editorial-governed state machine, eligibility rules, SSRF-safe
 * validation, runtime health classification, registry-driven adapter isolation
 * (eligible feeds only — fixture never participates), and the production
 * discovery harness refusal without approved sources.
 */

import { ResearchSourceRegistry } from '../../services/intelligence/research/source-registry';
import { NoApprovedSourcesError, runApprovedSourceDiscovery } from '../../services/intelligence/research/production-discovery';
import { ResearchIntelligenceCore } from '../../services/intelligence/research/core';
import { MemoryStateRepository } from '../../services/intelligence/research/persistence';
import { RssAdapter } from '../../services/intelligence/research/adapters/rss';
import { RESEARCH_SOURCE_DEFINITIONS } from '../../data/research-source-registry';
import type { ResearchSourceDefinition } from '../../types/research-intelligence';

function def(overrides: Partial<ResearchSourceDefinition> & { id: string; url: string }): ResearchSourceDefinition {
  return {
    name: `Source ${overrides.id}`,
    publisher: 'Test Publisher',
    sourceType: 'NEWS',
    adapter: 'rss',
    canonicalDomain: 'example.com',
    authorityClass: 'HIGH_QUALITY_SECONDARY',
    primarySource: false,
    enabled: true,
    topics: [],
    geographies: ['GLOBAL'],
    priority: 'P1',
    refreshPolicy: 'DAILY',
    approvalStatus: 'ACTIVE',
    approvedBy: 'test-editor',
    approvedAt: '2026-08-15T00:00:00.000Z',
    ...overrides,
  };
}

describe('Research Source Registry', () => {
  describe('seed data', () => {
    it('ships 4 definitions: 3 ACTIVE + 1 PROPOSED (The Guardian World)', () => {
      expect(RESEARCH_SOURCE_DEFINITIONS).toHaveLength(4);
      expect(RESEARCH_SOURCE_DEFINITIONS.filter((d) => d.approvalStatus === 'ACTIVE')).toHaveLength(3);
      expect(RESEARCH_SOURCE_DEFINITIONS.filter((d) => d.approvalStatus === 'PROPOSED').map((d) => d.id)).toContain('src-theguardian-world-rss');
    });

    it('global singleton reports 3 eligible sources', () => {
      const { researchSourceRegistry } = require('../../services/intelligence/research/source-registry') as {
        researchSourceRegistry: ResearchSourceRegistry;
      };
      expect(researchSourceRegistry.getEligible()).toHaveLength(3);
    });
  });

  describe('validation', () => {
    it('rejects duplicate URLs', () => {
      const url = 'https://example.com/feed';
      expect(() => new ResearchSourceRegistry([def({ id: 'a', url }), def({ id: 'b', url })])).toThrow(/duplicate URL/);
    });

    it('rejects SSRF-unsafe URLs', () => {
      expect(() => new ResearchSourceRegistry([def({ id: 'a', url: 'http://localhost/feed' })])).toThrow(/SSRF guard/);
      expect(() => new ResearchSourceRegistry([def({ id: 'b', url: 'http://127.0.0.1:8080/feed' })])).toThrow(/SSRF guard/);
    });

    it('rejects unsupported adapters', () => {
      expect(() => new ResearchSourceRegistry([def({ id: 'a', url: 'https://example.com/feed', adapter: 'google' })])).toThrow(/unsupported adapter/);
    });

    it('rejects primarySource=true with a non-primary authority class', () => {
      expect(() =>
        new ResearchSourceRegistry([def({ id: 'a', url: 'https://example.com/feed', primarySource: true })])
      ).toThrow(/marked primarySource but authorityClass/);
    });

    it('rejects APPROVED/ACTIVE definitions without approval metadata', () => {
      expect(() =>
        new ResearchSourceRegistry([
          def({ id: 'a', url: 'https://example.com/feed', approvalStatus: 'APPROVED', approvedBy: undefined, approvedAt: undefined }),
        ])
      ).toThrow(/requires approvedBy\/approvedAt/);
    });
  });

  describe('state machine', () => {
    let registry: ResearchSourceRegistry;

    beforeEach(() => {
      registry = new ResearchSourceRegistry([def({ id: 'src', url: 'https://example.com/feed', approvalStatus: 'PROPOSED' })]);
    });

    it('approve moves PROPOSED → APPROVED and records approver metadata', () => {
      registry.approve('src', 'Editor-in-Chief');
      const source = registry.get('src')!;
      expect(source.approvalStatus).toBe('APPROVED');
      expect(source.approvedBy).toBe('Editor-in-Chief');
      expect(source.approvedAt).toBeTruthy();
    });

    it('activate requires prior approval', () => {
      expect(() => registry.activate('src')).toThrow(/must be approved before activation/);
      registry.approve('src', 'Editor-in-Chief');
      registry.activate('src');
      expect(registry.get('src')!.approvalStatus).toBe('ACTIVE');
    });

    it('retire disables the source and is terminal', () => {
      registry.approve('src', 'Editor-in-Chief');
      registry.activate('src');
      registry.retire('src');
      expect(registry.get('src')!.approvalStatus).toBe('RETIRED');
      expect(registry.get('src')!.enabled).toBe(false);
      expect(() => registry.activate('src')).toThrow(/retired and cannot be reactivated/);
    });

    it('pause/retire transition guards', () => {
      expect(() => registry.pause('src')).toThrow(/cannot be paused/);
      expect(() => registry.approve('unknown', 'x')).toThrow(/unknown source/);
    });
  });

  describe('eligibility', () => {
    let registry: ResearchSourceRegistry;

    beforeEach(() => {
      registry = new ResearchSourceRegistry([
        def({ id: 'active', url: 'https://example.com/active', approvalStatus: 'ACTIVE' }),
        def({ id: 'approved', url: 'https://example.com/approved', approvalStatus: 'APPROVED' }),
        def({ id: 'proposed', url: 'https://example.com/proposed', approvalStatus: 'PROPOSED' }),
        def({ id: 'paused', url: 'https://example.com/paused', approvalStatus: 'PAUSED' }),
        def({ id: 'retired', url: 'https://example.com/retired', approvalStatus: 'RETIRED' }),
      ]);
    });

    it('only APPROVED/ACTIVE + enabled sources are eligible', () => {
      expect(registry.getEligible().map((d) => d.id)).toEqual(['active', 'approved']);
    });

    it('disabled sources drop out of eligibility', () => {
      registry.setEnabled('approved', false);
      expect(registry.getEligible().map((d) => d.id)).toEqual(['active']);
    });

    it('pausing an ACTIVE source removes it from eligibility', () => {
      registry.pause('active');
      expect(registry.getEligible().map((d) => d.id)).toEqual(['approved']);
    });
  });

  describe('runtime health', () => {
    let registry: ResearchSourceRegistry;

    beforeEach(() => {
      registry = new ResearchSourceRegistry([def({ id: 'src', url: 'https://example.com/feed' })]);
    });

    it('starts HEALTHY with no data', () => {
      expect(registry.getHealth('src')?.status).toBe('HEALTHY');
    });

    it('records a successful fetch as HEALTHY', () => {
      registry.recordFeedOutcome({ feedUrl: 'https://example.com/feed', ok: true, statusCode: 200, latencyMs: 400, itemsParsed: 12 });
      const h = registry.getHealth('src')!;
      expect(h.status).toBe('HEALTHY');
      expect(h.consecutiveFailures).toBe(0);
      expect(h.lastSuccessfulFetch).toBeTruthy();
      expect(h.parserSuccessRate).toBeGreaterThan(0.9);
    });

    it('classifies a single consecutive failure as DEGRADED', () => {
      registry.recordFeedOutcome({ feedUrl: 'https://example.com/feed', ok: false, statusCode: 500, latencyMs: 900, itemsParsed: 0 });
      expect(registry.getHealth('src')?.status).toBe('DEGRADED');
    });

    it('classifies high latency as DEGRADED', () => {
      registry.recordFeedOutcome({ feedUrl: 'https://example.com/feed', ok: true, statusCode: 200, latencyMs: 6000, itemsParsed: 4 });
      expect(registry.getHealth('src')?.status).toBe('DEGRADED');
    });

    it('classifies 3 consecutive failures as FAILING', () => {
      for (let i = 0; i < 3; i += 1) {
        registry.recordFeedOutcome({ feedUrl: 'https://example.com/feed', ok: false, statusCode: 500, latencyMs: 800, itemsParsed: 0 });
      }
      expect(registry.getHealth('src')?.status).toBe('FAILING');
      expect(registry.getHealth('src')?.failureCount).toBe(3);
    });

    it('recovers to HEALTHY after a success following failures', () => {
      for (let i = 0; i < 2; i += 1) {
        registry.recordFeedOutcome({ feedUrl: 'https://example.com/feed', ok: false, statusCode: 500, latencyMs: 800, itemsParsed: 0 });
      }
      registry.recordFeedOutcome({ feedUrl: 'https://example.com/feed', ok: true, statusCode: 200, latencyMs: 300, itemsParsed: 6 });
      const h = registry.getHealth('src')!;
      expect(h.status).toBe('HEALTHY');
      expect(h.consecutiveFailures).toBe(0);
    });
  });

  describe('adapter isolation (no fixture, eligible-only feeds)', () => {
    it('builds an RSS adapter whose discovery touches only eligible feed URLs', async () => {
      const registry = new ResearchSourceRegistry([
        def({ id: 'eligible', url: 'https://example.com/eligible-feed', approvalStatus: 'ACTIVE' }),
        def({ id: 'proposed', url: 'https://example.com/proposed-feed', approvalStatus: 'PROPOSED' }),
      ]);
      const adapter = registry.toRssAdapter();
      expect(adapter.id).toBe('rss');
      expect(adapter.capabilities).toContain('discover');

      const fetchedUrls: string[] = [];
      const fetcher = async (url: string) => {
        fetchedUrls.push(url);
        return {
          ok: true,
          status: 200,
          text: async () =>
            `<?xml version="1.0"?><rss version="2.0"><channel><title>Feed</title>` +
            `<item><title>India US trade tariffs update</title><link>https://example.com/article/1</link>` +
            `<description>India US trade tariffs coverage</description></item></channel></rss>`,
        };
      };

      const result = await adapter.discover(
        { id: 'q', text: 'India US trade tariffs', sourceType: 'NEWS', createdAt: new Date().toISOString(), usedInRuns: [] },
        { entities: [], fetcher, now: () => new Date(), maxResults: 10 }
      );

      expect(fetchedUrls).toEqual(['https://example.com/eligible-feed']);
      expect(fetchedUrls).not.toContain('https://example.com/proposed-feed');
      expect(result.items).toHaveLength(1);
      expect(result.items[0].publisher).toBe('Test Publisher');
    });

    it('RssAdapter surfaces partial feed failures and reports feed outcomes', async () => {
      const registry = new ResearchSourceRegistry([def({ id: 'src', url: 'https://example.com/feed' })]);
      const adapter = registry.toRssAdapter() as RssAdapter;
      const fetcher = async () => ({ ok: false, status: 503, text: async () => '' });
      const result = await adapter.discover(
        { id: 'q', text: 'tariffs', sourceType: 'NEWS', createdAt: new Date().toISOString(), usedInRuns: [] },
        { entities: [], fetcher, now: () => new Date(), maxResults: 10 }
      );
      expect(result.items).toHaveLength(0);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(registry.getHealth('src')?.status).toBe('DEGRADED');
    });
  });

  describe('production discovery harness', () => {
    let core: ResearchIntelligenceCore;
    let repository: MemoryStateRepository;

    beforeEach(async () => {
      ResearchIntelligenceCore.resetInstance();
      repository = new MemoryStateRepository();
      core = ResearchIntelligenceCore.getInstance(repository, []);
      await core.ensureLoaded();
    });

    it('throws NoApprovedSourcesError when the registry has no eligible sources', async () => {
      const empty = new ResearchSourceRegistry([def({ id: 'proposed', url: 'https://example.com/feed', approvalStatus: 'PROPOSED' })]);
      const project = core.createProject({ title: 't', description: 'd', createdBy: 'test' });
      await expect(
        runApprovedSourceDiscovery(core, project.id, { triggeredBy: 'test' }, empty)
      ).rejects.toBeInstanceOf(NoApprovedSourcesError);
    });

    it('runApprovedSourceDiscovery is fixture-free by construction', async () => {
      const registry = new ResearchSourceRegistry([def({ id: 'src', url: 'https://example.com/feed', approvalStatus: 'ACTIVE' })]);
      const adapter = registry.toRssAdapter();
      // No fixture adapter exists anywhere in the registry path; the adapter is
      // a raw RssAdapter — there is no fallback that can substitute fabricated
      // content for a failing real source.
      expect(adapter).toBeInstanceOf(RssAdapter);
      expect(core.getAdapters().some((a) => a.id === 'fixture')).toBe(false);
    });
  });
});

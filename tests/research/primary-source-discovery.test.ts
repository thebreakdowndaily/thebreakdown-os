/**
 * ─── RIE v1.2 — Primary-Source Discovery Regression Tests ─────────────────────
 * Governing document: docs/research/benchmarks/RIE_V1_2_FAILURE_ANALYSIS.md
 *
 * Covers the primary-source discovery query intelligence: topic-family
 * classification, DOCUMENT_TYPE + OFFICIAL query generation (with reasons,
 * dedup, bounding), the feature flag (v1.1 default unchanged), the
 * primary-source ranking bonus in the RSS adapter, discovery-path provenance,
 * and the anti-leakage invariant.
 */

import { ResearchIntelligenceCore } from '@/services/intelligence/research/core';
import { runResearchPipeline } from '@/services/intelligence/research/pipeline';
import { RssAdapter, RssFeedConfig } from '@/services/intelligence/research/adapters/rss';
import { researchSourceRegistry } from '@/services/intelligence/research/source-registry';
import { generateQueries } from '@/lib/intel/research/query-generation';
import {
  classifyPrimarySourceFamily,
  generatePrimarySourceDiscoveryQueries,
  documentTypesForFamily,
} from '@/lib/intel/research/primary-source-discovery';
import { expandTopic } from '@/lib/intel/research/topic-expansion';
import { BENCHMARK_GOLD_CORPUS } from '@/data/research-benchmark-gold';
import type { ResearchSourceContextEntry, TopicExpansion } from '@/types/research-intelligence';

function expansionFor(topic: string): TopicExpansion {
  return expandTopic(topic);
}

const SOURCE_CONTEXT: ResearchSourceContextEntry[] = [
  { domain: 'meity.gov.in', authorityClass: 'PRIMARY', documentTypes: ['Notification', 'Gazette'], priority: 'P1' },
  { domain: 'sebi.gov.in', authorityClass: 'REGULATORY', documentTypes: ['Order', 'Circular', 'Warning letter'], priority: 'P1' },
  { domain: 'greentribunal.gov.in', authorityClass: 'REGULATORY', documentTypes: ['Order'], priority: 'P1' },
  { domain: 'sci.gov.in', authorityClass: 'JUDICIAL', documentTypes: ['Judgment'], priority: 'P1' },
  { domain: 'undocs.org', authorityClass: 'PRIMARY', documentTypes: ['Resolution'], priority: 'P1' },
  { domain: 'thehindu.com', authorityClass: 'HIGH_QUALITY_SECONDARY', priority: 'P1' },
];

describe('Primary-Source Discovery Query Intelligence', () => {
  describe('classifyPrimarySourceFamily', () => {
    it('classifies a statute as POLICY', () => {
      expect(classifyPrimarySourceFamily('Digital Personal Data Protection Act 2023')).toBe('POLICY');
    });

    it('classifies a court verdict as COURT', () => {
      expect(classifyPrimarySourceFamily('Supreme Court verdict on Ayodhya')).toBe('COURT');
    });

    it('classifies regulator actions as REGULATORY (before COURT)', () => {
      expect(classifyPrimarySourceFamily('NGT order on Western Ghats ecologically sensitive areas')).toBe('REGULATORY');
      expect(classifyPrimarySourceFamily('SEBI Adani disclosures warning order')).toBe('REGULATORY');
      expect(classifyPrimarySourceFamily('RBI MPC repo rate decision (August 2026)')).toBe('REGULATORY');
      expect(classifyPrimarySourceFamily('CAG audit report on Kaleshwaram Lift Irrigation Project')).toBe('REGULATORY');
    });

    it('classifies parliamentary material as PARLIAMENT', () => {
      expect(classifyPrimarySourceFamily('Parliament debate on the amended Finance Bill')).toBe('PARLIAMENT');
    });

    it('classifies state bills as POLICY', () => {
      expect(classifyPrimarySourceFamily('Karnataka private jobs reservation bill')).toBe('POLICY');
    });

    it('falls back to GENERIC without keyword evidence', () => {
      expect(classifyPrimarySourceFamily('UN Security Council Resolution 47 on Kashmir')).toBe('GENERIC');
    });
  });

  describe('documentTypesForFamily', () => {
    it('maps each family to its document vocabulary', () => {
      expect(documentTypesForFamily('POLICY').map((s) => s.docType)).toEqual(['act', 'bill', 'notification', 'gazette']);
      expect(documentTypesForFamily('COURT').map((s) => s.docType)).toEqual(['judgment', 'verdict', 'order']);
      expect(documentTypesForFamily('REGULATORY').map((s) => s.docType)).toContain('warning letter');
    });
  });

  describe('generatePrimarySourceDiscoveryQueries', () => {
    it('emits DOCUMENT_TYPE queries with reasons for the family', () => {
      const specs = generatePrimarySourceDiscoveryQueries('Digital Personal Data Protection Act 2023', SOURCE_CONTEXT);
      const docType = specs.filter((s) => s.category === 'DOCUMENT_TYPE');
      expect(docType.length).toBeGreaterThanOrEqual(4);
      expect(docType.every((s) => s.text.startsWith('"Digital Personal Data Protection Act 2023" '))).toBe(true);
      expect(docType.every((s) => s.reason.length > 0)).toBe(true);
    });

    it('targets OFFICIAL queries at primary-class domains only (media excluded)', () => {
      const specs = generatePrimarySourceDiscoveryQueries('SEBI Adani disclosures warning order', SOURCE_CONTEXT);
      const official = specs.filter((s) => s.category === 'OFFICIAL');
      expect(official.length).toBeGreaterThan(0);
      for (const spec of official) {
        expect(spec.text).toMatch(/^site:[a-z0-9.-]+\.(gov\.in|org|com|in)/);
        expect(spec.text).not.toContain('thehindu.com');
      }
      expect(specs.every((s) => !s.text.includes('thehindu.com'))).toBe(true);
    });

    it('prefers the best-fitting authority class for the family', () => {
      const sebi = generatePrimarySourceDiscoveryQueries('SEBI Adani disclosures warning order', SOURCE_CONTEXT);
      expect(sebi.filter((s) => s.category === 'OFFICIAL')[0].text).toContain('sebi.gov.in');
    });

    it('bounds OFFICIAL domains and adds one top-domain document-type query', () => {
      const wide: ResearchSourceContextEntry[] = [
        'meity.gov.in', 'sebi.gov.in', 'greentribunal.gov.in', 'sci.gov.in',
        'undocs.org', 'karnataka.gov.in', 'cmrs.gov.in', 'pib.gov.in',
      ].map((domain, i) => ({
        domain,
        authorityClass: i % 2 === 0 ? ('PRIMARY' as const) : ('REGULATORY' as const),
        documentTypes: ['Order'],
        priority: 'P1' as const,
      }));
      const specs = generatePrimarySourceDiscoveryQueries('UN Security Council Resolution 47 on Kashmir', wide);
      const official = specs.filter((s) => s.category === 'OFFICIAL');
      expect(official.length).toBeLessThanOrEqual(6);
      // Plain `site:<domain> "<topic>"` queries (ending in the quote) are bounded by the cap.
      expect(official.filter((s) => /"$/.test(s.text)).length).toBeLessThanOrEqual(5);
    });

    it('produces no queries without a source context', () => {
      const specs = generatePrimarySourceDiscoveryQueries('Digital Personal Data Protection Act 2023', undefined);
      expect(specs.every((s) => s.category === 'DOCUMENT_TYPE')).toBe(true);
    });
  });

  describe('generateQueries integration', () => {
    it('emits DOCUMENT_TYPE/OFFICIAL queries only when the feature flag is on', () => {
      const expansion = expansionFor('Digital Personal Data Protection Act 2023');
      const off = generateQueries(expansion, { maxQueries: 10, primarySourceDiscovery: false });
      expect(off.some((q) => q.category === 'DOCUMENT_TYPE' || q.category === 'OFFICIAL')).toBe(false);

      const on = generateQueries(expansion, {
        maxQueries: 60,
        primarySourceDiscovery: true,
        sourceContext: SOURCE_CONTEXT,
      });
      expect(on.some((q) => q.category === 'DOCUMENT_TYPE')).toBe(true);
      expect(on.some((q) => q.category === 'OFFICIAL')).toBe(true);
      expect(on.every((q) => q.category !== 'DOCUMENT_TYPE' || q.reason)).toBe(true);
      expect(on.every((q) => q.category !== 'OFFICIAL' || q.reason)).toBe(true);
    });

    it('respects maxQueries including the primary-source block', () => {
      const expansion = expansionFor('Digital Personal Data Protection Act 2023');
      const bounded = generateQueries(expansion, {
        maxQueries: 8,
        primarySourceDiscovery: true,
        sourceContext: SOURCE_CONTEXT,
      });
      expect(bounded.length).toBe(8);
    });

    it('deduplicates identical query texts', () => {
      const expansion = expansionFor('Digital Personal Data Protection Act 2023');
      const on = generateQueries(expansion, {
        maxQueries: 60,
        primarySourceDiscovery: true,
        sourceContext: SOURCE_CONTEXT,
      });
      const texts = on.map((q) => q.text.toLowerCase());
      expect(new Set(texts).size).toBe(texts.length);
    });

    it('preserves the anti-leakage invariant with the feature enabled', () => {
      const topic = BENCHMARK_GOLD_CORPUS.topics.find((t) => t.topicId === 'topic-dpdp-2023')!;
      const expansion = expansionFor(topic.title);
      const queries = generateQueries(expansion, {
        maxQueries: 60,
        primarySourceDiscovery: true,
        sourceContext: SOURCE_CONTEXT,
      });
      for (const query of queries) {
        for (const gold of topic.goldSources) {
          expect(query.text).not.toContain(gold.url.replace(/^https?:\/\//, ''));
          expect(query.text).not.toContain(gold.sourceId);
          for (const fact of gold.facts) {
            expect(query.text).not.toContain(fact);
          }
        }
      }
    });
  });
});

describe('RIE v1.2 — Adapter ranking & discovery provenance', () => {
  it('ranks primary-class feeds above general media in the RSS adapter', async () => {
    const feeds: RssFeedConfig[] = [
      {
        url: 'https://example.com/primary', publisher: 'Primary Ministry',
        sourceType: 'GOVERNMENT', sourceClass: 'PRIMARY',
      },
      {
        url: 'https://example.com/media', publisher: 'Daily Newspaper',
        sourceType: 'NEWS', sourceClass: 'GENERAL_MEDIA',
      },
    ];
    const adapter = new RssAdapter({ feeds });
    const fetcher = async (url: string) => ({
      ok: true,
      status: 200,
      text: async () =>
        `<?xml version="1.0"?><rss version="2.0"><channel><item>` +
        `<title>India US trade tariffs update</title><link>https://example.com/a</link>` +
        `<description>tariffs coverage</description></item></channel></rss>`,
    });
    const result = await adapter.discover(
      { id: 'q', text: 'India US trade tariffs' },
      { entities: [], fetcher, now: () => new Date(), maxResults: 10 }
    );
    expect(result.items.length).toBe(2);
    const primary = result.items.find((i) => i.adapter === 'rss' && i.publisher === 'Primary Ministry')!;
    const media = result.items.find((i) => i.publisher === 'Daily Newspaper')!;
    expect(primary.relevanceScore).toBe(0.9);
    expect(media.relevanceScore).toBe(0.6);
    expect(primary.rankingComponents?.primarySourceBonus).toBe(0.3);
    expect(media.rankingComponents?.primarySourceBonus).toBe(0);
  });

  it('carries documentType through RSS discovery when the feed declares it', async () => {
    const feeds: RssFeedConfig[] = [{
      url: 'https://example.com/ngt', publisher: 'NGT',
      sourceType: 'GOVERNMENT', sourceClass: 'REGULATORY', documentTypes: ['Order', 'Judgment'],
    }];
    const adapter = new RssAdapter({ feeds });
    const fetcher = async () => ({
      ok: true,
      status: 200,
      text: async () =>
        `<?xml version="1.0"?><rss version="2.0"><channel><item>` +
        `<title>NGT order on Western Ghats</title><link>https://example.com/o</link>` +
        `<description>order text</description></item></channel></rss>`,
    });
    const result = await adapter.discover(
      { id: 'q', text: 'NGT order Western Ghats' },
      { entities: [], fetcher, now: () => new Date(), maxResults: 10 }
    );
    expect(result.items[0].documentType).toBe('Order');
  });

  it('records discoveryPath and queryId provenance through the pipeline', async () => {
    const core = new ResearchIntelligenceCore();
    await core.ensureLoaded();
    const project = core.createProject({
      title: 'SEBI Adani disclosures warning order',
      description: 'regulatory discovery',
      createdBy: 'test',
      scope: { geographicScope: [], languages: ['en'] },
      sourcePolicy: { allowSocial: false, sourceClasses: ['PRIMARY', 'REGULATORY'] },
    });

    const seen: Array<{ queryId: string; queryText: string }> = [];
    const adapter = {
      id: 'stub',
      capabilities: ['discover', 'fetch'] as const,
      async discover(query: any) {
        seen.push({ queryId: query.id, queryText: query.text });
        return {
          adapter: 'stub',
          queryText: query.text,
          items: [{
            url: 'https://sebi.gov.in/warning.pdf',
            title: 'SEBI administrative warning',
            publisher: 'SEBI',
            sourceType: 'GOVERNMENT',
            sourceClass: 'REGULATORY',
            adapter: 'stub',
            relevanceScore: 0.9,
            discoveryPath: query.text,
          }],
          errors: [],
        };
      },
      async fetch() {
        return { url: 'https://sebi.gov.in/warning.pdf', title: 'SEBI warning', text: 'SEBI issued an administrative warning to the Adani Group on disclosure compliance.', format: 'HTML' as const };
      },
    };

    await runResearchPipeline(core, project.id, {
      triggeredBy: 'test',
      trigger: 'MANUAL',
      maxQueries: 3,
      maxSources: 3,
      maxDocuments: 3,
      adapters: [adapter],
      primarySourceDiscovery: true,
      sourceContext: SOURCE_CONTEXT,
    });

    const sources = core.getSources(project.id);
    expect(sources.length).toBe(1);
    expect(sources[0].queryText).toBeDefined();
    expect(sources[0].queryText).toBeTruthy();
    expect(sources[0].queryId).toBe(seen[0].queryId);
  });
});

describe('RIE v1.2 — Registry-derived discovery surface', () => {
  it('includes the 6 newly onboarded authoritative domains in the eligible surface', () => {
    const domains = researchSourceRegistry.getEligible().map((d) => d.canonicalDomain);
    for (const domain of ['meity.gov.in', 'undocs.org', 'karnataka.gov.in', 'greentribunal.gov.in', 'cmrs.gov.in', 'sebi.gov.in']) {
      expect(domains).toContain(domain);
    }
  });

  it('carries documentTypes into the production RSS feed configs', () => {
    const configs = researchSourceRegistry.toRssFeedConfigs();
    const sebi = configs.find((c) => c.url === 'https://www.sebi.gov.in/sebirss.xml');
    expect(sebi?.documentTypes).toContain('Order');
    expect(configs.some((c) => c.url === 'https://meity.gov.in/')).toBe(false);
  });
});

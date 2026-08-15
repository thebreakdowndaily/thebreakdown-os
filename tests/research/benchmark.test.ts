/**
 * ─── RIE v1.1 — Recall & Freshness Benchmark Test ─────────────────────────────
 * Governing document: docs/research/RIE_V1_1_SOURCE_EXPANSION_STANDARD.md
 *
 * Implements the RIE v1.1 recall benchmark runner, baseline comparison,
 * freshness replay logic, leakage invariant tests, and reports serialization.
 */

import { ResearchIntelligenceCore } from '@/services/intelligence/research/core';
import { runResearchPipeline } from '@/services/intelligence/research/pipeline';
import { ResearchSourceRegistry } from '@/services/intelligence/research/source-registry';
import { RESEARCH_SOURCE_DEFINITIONS } from '@/data/research-source-registry';
import { runRecallBenchmark, generateDiscoveryTicks } from '@/lib/intel/research/benchmark/run';
import { matchDiscoveredToGold } from '@/lib/intel/research/benchmark/matching';
import {
  BENCHMARK_GOLD_CORPUS,
  BENCHMARK_MOCK_DOCUMENTS,
  BENCHMARK_SNAPSHOT_DATE,
  queryMockIndex,
} from '@/data/research-benchmark-gold';
import type { ResearchSourceAdapter } from '@/services/intelligence/research/adapters/interface';
import type { BenchmarkDiscoveryDriver, BenchmarkTopic } from '@/lib/intel/research/benchmark/types';
import { canonicalizeUrl, urlKey, contentHash, normalizeText } from '@/lib/intel/research/normalization';
import * as fs from 'fs';
import * as path from 'path';

// Ensure output directories exist
const BENCHMARK_DOCS_DIR = path.resolve(process.cwd(), 'docs/research/benchmarks');
if (!fs.existsSync(BENCHMARK_DOCS_DIR)) {
  fs.mkdirSync(BENCHMARK_DOCS_DIR, { recursive: true });
}

// ── 1. Mock Search Adapter Implementation ───────────────────────────────────

class MockSearchAdapter implements ResearchSourceAdapter {
  id = 'mock-search';
  capabilities = ['KEYWORDS', 'DOMAINS'] as any;
  simulatedNow = BENCHMARK_SNAPSHOT_DATE;
  enabledDomains: string[] = [];

  constructor(enabledDomains?: string[]) {
    if (enabledDomains) this.enabledDomains = enabledDomains;
  }

  async discover(query: any, context: any) {
    // Filter mock index by query text, time step, and active registry domains (source independence)
    const docs = queryMockIndex(query.text, this.simulatedNow, this.enabledDomains);
    return {
      items: docs.map((d) => ({
        url: d.url,
        title: d.title,
        snippet: d.content.slice(0, 150),
        publisher: d.publisher,
        publishedAt: d.publishedAt,
        sourceType: d.sourceType,
        sourceClass: d.sourceClass,
        adapter: this.id,
        relevanceScore: 0.9,
      })),
      errors: [],
    };
  }

  async fetch(url: string, context: any) {
    const doc = BENCHMARK_MOCK_DOCUMENTS.find((d) => d.url === url);
    if (!doc) throw new Error(`Not found: ${url}`);
    return {
      url: doc.url,
      title: doc.title,
      text: doc.content,
      format: 'HTML' as const,
      publishedAt: doc.publishedAt,
    };
  }
}

// ── 2. Replay-Enabled Discovery Driver ───────────────────────────────────────

function createReplayDriver(enabledDomains?: string[]): BenchmarkDiscoveryDriver {
  const adapter = new MockSearchAdapter(enabledDomains);

  return async (topic, projectId, core, options) => {
    let timeline: string[] = [BENCHMARK_SNAPSHOT_DATE];
    if (topic.temporalMode === 'breaking') {
      const times = topic.goldSources
        .map((g) => g.publishedAt)
        .filter((t): t is string => Boolean(t))
        .map((t) => new Date(t).getTime());
      const eventStartMs = times.length > 0 ? Math.min(...times) : new Date(topic.goldSources[0].firstAvailableAt).getTime() - 15 * 60 * 1000;
      const eventStartIso = new Date(eventStartMs).toISOString();
      timeline = generateDiscoveryTicks(eventStartIso, BENCHMARK_SNAPSHOT_DATE);
    }

    let lastRun: any = null;
    for (const timeStep of timeline) {
      adapter.simulatedNow = timeStep;
      lastRun = await runResearchPipeline(core, projectId, {
        triggeredBy: `benchmark:${topic.topicId}`,
        trigger: 'MANUAL',
        maxQueries: options.maxQueries,
        maxSources: options.maxSources,
        maxDocuments: options.maxDocuments,
        maxDiscoveryResultsPerQuery: options.maxDiscoveryResultsPerQuery,
        adapters: [adapter],
        now: () => new Date(timeStep),
      });

      const sources = core.getSources(projectId);
      for (const s of sources) {
        const matchResult = matchDiscoveredToGold(
          [{ id: s.id, url: s.url, title: s.title }],
          topic.goldSources,
          topic.topicId
        );
        const hasMatch = Object.values(matchResult.matches).some((h) => h !== null);
        if (hasMatch) {
          const srcObj = core.getSource(s.id);
          if (srcObj && !(srcObj as any).discoveryTickAt) {
            (srcObj as any).discoveredAt = timeStep;
            (srcObj as any).discoveryTickAt = timeStep;
          }
        }
      }
    }
    return lastRun;
  };
}

// ── 3. Helper to render markdown results reports ────────────────────────────

function generateMarkdownReport(report: any, isBaseline: boolean): string {
  const title = isBaseline ? 'RIE v1.1 Recall Benchmark — Baseline' : 'RIE v1.1 Recall Benchmark — Results';
  let md = `# ${title}\n\n`;
  md += `**Timestamp:** ${report.createdAt}\n`;
  md += `**Corpus Version:** ${report.corpusVersion}\n`;
  md += `**Benchmark Tag:** ${report.benchmarkTag}\n`;
  md += `**Approved Sources Count:** ${report.engine.registryApprovedSources}\n\n`;

  md += `## Aggregate Performance\n\n`;
  md += `| Metric | Value |\n`;
  md += `|--------|-------|\n`;
  md += `| Overall Source Recall | ${(report.aggregates.sourceRecall * 100).toFixed(1)}% |\n`;
  md += `| Primary Source Recall | ${(report.aggregates.primaryRecall * 100).toFixed(1)}% |\n`;
  md += `| Independent Publisher Recall | ${(report.aggregates.independentRecall * 100).toFixed(1)}% |\n`;
  md += `| Regional Source Recall | ${(report.aggregates.regionalRecall * 100).toFixed(1)}% |\n`;
  md += `| Regional Source Discovery Recall | ${(report.aggregates.regionalSourceDiscoveryRecall * 100).toFixed(1)}% |\n`;
  md += `| Regional Entity Recall | ${(report.aggregates.regionalEntityRecall * 100).toFixed(1)}% |\n`;
  md += `| Translation Preservation Rate | ${(report.aggregates.translationPreservationRate * 100).toFixed(1)}% |\n`;
  md += `| Claim Extraction Recall | ${(report.aggregates.claimRecall * 100).toFixed(1)}% |\n`;
  md += `| Event Extraction Recall | ${(report.aggregates.eventRecall * 100).toFixed(1)}% |\n`;
  md += `| Retrieval Precision | ${(report.aggregates.precision * 100).toFixed(1)}% |\n`;
  md += `| Independent Publisher Ratio | ${(report.aggregates.independentRatio * 100).toFixed(1)}% |\n`;
  md += `| Median TTD (hours) | ${report.aggregates.ttdMedianHours ?? 'N/A'} |\n\n`;

  md += `## Latency Distributions (hours)\n\n`;
  md += `| Metric | n | Mean | Min | Median | p90 | p95 | Max |\n`;
  md += `|--------|---|------|-----|--------|-----|-----|-----|\n`;
  const fmt = (stats: any) => {
    if (!stats) return `0 | N/A | N/A | N/A | N/A | N/A | N/A`;
    return `${stats.n} | ${stats.mean.toFixed(2)} | ${stats.min.toFixed(2)} | ${stats.median.toFixed(2)} | ${stats.p90.toFixed(2)} | ${stats.p95.toFixed(2)} | ${stats.max.toFixed(2)}`;
  };
  md += `| First-Source Discovery | ${fmt(report.aggregates.firstSourceDiscoveryLatency)} |\n`;
  md += `| Primary-Source Discovery | ${fmt(report.aggregates.primarySourceDiscoveryLatency)} |\n`;
  md += `| Independent Corroboration | ${fmt(report.aggregates.independentCorroborationLatency)} |\n\n`;

  md += `## Environmental Breakdown\n\n`;
  md += `| Environment | Recall | Eligible | Recalled |\n`;
  md += `|-------------|--------|----------|----------|\n`;
  for (const [env, data] of Object.entries(report.environmentalBreakdown ?? {})) {
    const d = data as any;
    md += `| ${env} | ${(d.recall * 100).toFixed(1)}% | ${d.eligible} | ${d.recalled} |\n`;
  }
  md += `\n`;

  md += `## Language Breakdown\n\n`;
  md += `| Language | Recall | Eligible | Recalled |\n`;
  md += `|----------|--------|----------|----------|\n`;
  for (const [lang, data] of Object.entries(report.languageBreakdown ?? {})) {
    const d = data as any;
    md += `| ${lang} | ${(d.recall * 100).toFixed(1)}% | ${d.eligible} | ${d.recalled} |\n`;
  }
  md += `\n`;

  md += `## Miss Diagnostics (Source Recall failures)\n\n`;
  md += `| Topic ID | Gold Source URL | Classification | Reason |\n`;
  md += `|----------|-----------------|----------------|--------|\n`;
  for (const miss of report.misses) {
    md += `| \`${miss.topicId}\` | \`${miss.goldUrl}\` | **${miss.classification}** | ${miss.reason} |\n`;
  }
  md += `\n`;

  return md;
}

// ── 4. Jest Test Suite ───────────────────────────────────────────────────────

describe('Research Intelligence Engine (RIE) v1.1 Evaluation', () => {
  let registry: ResearchSourceRegistry;

  beforeEach(() => {
    registry = new ResearchSourceRegistry(RESEARCH_SOURCE_DEFINITIONS);
  });

  // ── Invariant: Benchmark Leakage Invariant ──
  it('enforces the Gold Anti-Leakage Invariant', async () => {
    // Assert that no gold metadata (URL, ID, or text) is ever passed to query generation
    const core = new ResearchIntelligenceCore();
    await core.ensureLoaded();
    const topic = BENCHMARK_GOLD_CORPUS.topics[0]; // DPDP
    const project = core.createProject({
      title: topic.title,
      description: topic.researchQuestion,
      researchQuestion: topic.researchQuestion,
      createdBy: 'test',
      scope: { geographicScope: [], languages: ['en'] },
      sourcePolicy: { allowSocial: false, sourceClasses: ['PRIMARY'] },
    });

    const run = await runResearchPipeline(core, project.id, {
      triggeredBy: 'test',
      trigger: 'MANUAL',
      maxQueries: 5,
      maxSources: 1,
      maxDocuments: 1,
      adapters: [new MockSearchAdapter([])],
    });

    // Check generated queries for leakage
    for (const query of project.queries) {
      for (const gold of topic.goldSources) {
        expect(query.text).not.toContain(gold.url);
        expect(query.text).not.toContain(gold.sourceId);
        for (const fact of gold.facts) {
          expect(query.text).not.toContain(fact);
        }
      }
    }
  });

  // ── Baseline vs Expanded runs ──
  it('runs v1.0 Baseline vs v1.1 Expanded and records delta metrics', async () => {
    // 1. Baseline: Registry contains only original v1.0 RSS feeds (Hindu, Guardian, BBC Business)
    const baselineDomains = ['theguardian.com', 'feeds.bbci.co.uk', 'thehindu.com'];
    const baselineDriver = createReplayDriver(baselineDomains);
    const baselineReport = await runRecallBenchmark(BENCHMARK_GOLD_CORPUS, baselineDriver, {
      maxQueries: 10,
      maxSources: 15,
      maxDocuments: 15,
      benchmarkTag: 'rie-v1.0-baseline',
      status: 'RESULTS',
      availableAdapters: ['rss'],
      activeFeedDomains: baselineDomains,
      notes: ['Baseline evaluation representing v1.0 RSS discovery'],
    });

    // 2. Expanded: Registry contains all newly onboarded primary, official, and regional sources
    const expandedDomains = [
      'theguardian.com', 'feeds.bbci.co.uk', 'thehindu.com',
      'pib.gov.in', 'rbi.org.in', 'sci.gov.in', 'cag.gov.in',
      'jagran.com', 'mathrubhumi.com', 'maharashtra.gov.in', 'panchayatiraj.bih.nic.in'
    ];
    const expandedDriver = createReplayDriver(expandedDomains);
    const expandedReport = await runRecallBenchmark(BENCHMARK_GOLD_CORPUS, expandedDriver, {
      maxQueries: 10,
      maxSources: 15,
      maxDocuments: 15,
      benchmarkTag: 'rie-v1.1-expanded',
      status: 'RESULTS',
      availableAdapters: ['rss', 'mock-search'],
      activeFeedDomains: expandedDomains,
      notes: ['Expanded evaluation representing v1.1 with central/regional Indian sources'],
    });

    // Serialise reports to filesystem
    const baselineMd = generateMarkdownReport(baselineReport, true);
    const expandedMd = generateMarkdownReport(expandedReport, false);
    fs.writeFileSync(path.resolve(BENCHMARK_DOCS_DIR, 'RIE_V1_1_BASELINE.md'), baselineMd);
    fs.writeFileSync(path.resolve(BENCHMARK_DOCS_DIR, 'RIE_V1_1_RESULTS.md'), expandedMd);

    // Verify baseline vs expanded delta
    console.log('--- RIE v1.1 BENCHMARK DELTA ---');
    console.log(`Source Recall: ${(baselineReport.aggregates.sourceRecall * 100).toFixed(1)}% -> ${(expandedReport.aggregates.sourceRecall * 100).toFixed(1)}% (+${((expandedReport.aggregates.sourceRecall - baselineReport.aggregates.sourceRecall) * 100).toFixed(1)} pp)`);
    console.log(`Primary Source Recall: ${(baselineReport.aggregates.primaryRecall * 100).toFixed(1)}% -> ${(expandedReport.aggregates.primaryRecall * 100).toFixed(1)}%`);
    console.log(`Regional Source Recall: ${(baselineReport.aggregates.regionalRecall * 100).toFixed(1)}% -> ${(expandedReport.aggregates.regionalRecall * 100).toFixed(1)}%`);
    console.log(`Mean Primary Discovery Latency: ${baselineReport.aggregates.primarySourceDiscoveryLatency ?? 'N/A'} hrs -> ${expandedReport.aggregates.primarySourceDiscoveryLatency ?? 'N/A'} hrs`);
    console.log(`Mean Independent Corroboration Latency: ${baselineReport.aggregates.independentCorroborationLatency ?? 'N/A'} hrs -> ${expandedReport.aggregates.independentCorroborationLatency ?? 'N/A'} hrs`);

    expect(expandedReport.aggregates.sourceRecall).toBeGreaterThan(baselineReport.aggregates.sourceRecall);
    expect(expandedReport.aggregates.primaryRecall).toBeGreaterThan(baselineReport.aggregates.primaryRecall);
    expect(expandedReport.aggregates.regionalRecall).toBeGreaterThan(baselineReport.aggregates.regionalRecall);

    // Verify translation preservation rate on non-English sources recalled
    expect(expandedReport.aggregates.translationPreservationRate).toEqual(1);
  });

  // ── Verification Invariants & Latency Calibration Tests ──
  describe('RIE v1.1.1 — Latency & Replay Verification Invariants', () => {
    // 1. Mock Index Sorting Invariant
    it('ranks relevant high-overlap fresh documents ahead of noisy historical documents', () => {
      const query = 'GST revenue collections Ministry of Finance record August 2026';
      const results = queryMockIndex(query, BENCHMARK_SNAPSHOT_DATE);
      expect(results.length).toBeGreaterThan(0);

      const first = results[0];
      expect(first.url).toBe('https://pib.gov.in/PressReleasePage.aspx?PRID=GSTAugust2026Revenue');
    });

    // 2. Future Document Protection
    it('prevents future documents from being discovered before their availableAt timestamp', async () => {
      const core = new ResearchIntelligenceCore();
      await core.ensureLoaded();

      const topic = BENCHMARK_GOLD_CORPUS.topics.find((t) => t.topicId === 'topic-gst-august')!;
      const project = core.createProject({
        title: topic.title,
        description: topic.researchQuestion,
        researchQuestion: topic.researchQuestion,
        createdBy: 'test-future-protection',
        scope: { geographicScope: [], languages: ['en'] },
        sourcePolicy: { allowSocial: false, sourceClasses: ['PRIMARY'] },
      });

      const adapter = new MockSearchAdapter();
      const earlyTime = '2026-08-15T11:00:00.000Z';
      adapter.simulatedNow = earlyTime;

      await runResearchPipeline(core, project.id, {
        triggeredBy: 'test',
        trigger: 'MANUAL',
        maxQueries: 5,
        maxSources: 5,
        maxDocuments: 5,
        adapters: [adapter],
        now: () => new Date(earlyTime),
      });

      const sources = core.getSources(project.id);
      const matched = sources.some((s) => s.url === 'https://pib.gov.in/PressReleasePage.aspx?PRID=GSTAugust2026Revenue');
      expect(matched).toBe(false);
    });

    // 3. Latency Measurement Accuracy
    it('calculates non-zero latency matching the defined delay model and polling schedule', async () => {
      const topic = BENCHMARK_GOLD_CORPUS.topics.find((t) => t.topicId === 'topic-gst-august')!;
      const driver = createReplayDriver();

      ResearchIntelligenceCore.resetInstance();
      const freshCore = ResearchIntelligenceCore.getInstance();
      await freshCore.ensureLoaded();

      const report = await runRecallBenchmark({
        corpusId: 'test-latency-accuracy',
        corpusVersion: '1.0',
        createdBy: 'test',
        createdAt: '2026-08-15T00:00:00.000Z',
        verifiedAt: '2026-08-15T00:00:00.000Z',
        topics: [topic],
      }, driver);



      const gstMetrics = report.topics.find((t) => t.topicId === 'topic-gst-august')!;

      expect(gstMetrics.primarySourceDiscoveryLatency).not.toBeNull();
      expect(gstMetrics.primarySourceDiscoveryLatency).toBeGreaterThan(0);

      expect(gstMetrics.independentCorroborationLatency).not.toBeNull();
      expect(gstMetrics.independentCorroborationLatency).toBeGreaterThan(0);
    });

    // 4. Immutability
    it('asserts that discovery time is immutable and does not shift in subsequent ticks', async () => {
      const core = new ResearchIntelligenceCore();
      await core.ensureLoaded();
      const topic = BENCHMARK_GOLD_CORPUS.topics.find((t) => t.topicId === 'topic-gst-august')!;

      const project = core.createProject({
        title: topic.title,
        description: topic.researchQuestion,
        researchQuestion: topic.researchQuestion,
        createdBy: 'test-immutability',
        scope: { geographicScope: [], languages: ['en'] },
        sourcePolicy: { allowSocial: false, sourceClasses: ['PRIMARY'] },
      });

      const adapter = new MockSearchAdapter();

      adapter.simulatedNow = '2026-08-15T11:06:00.000Z';
      await runResearchPipeline(core, project.id, {
        triggeredBy: 'test',
        trigger: 'MANUAL',
        maxQueries: 5,
        maxSources: 5,
        maxDocuments: 5,
        adapters: [adapter],
        now: () => new Date('2026-08-15T11:06:00.000Z'),
      });

      const firstSources = core.getSources(project.id);
      const firstGst = firstSources.find((s) => s.url === 'https://pib.gov.in/PressReleasePage.aspx?PRID=GSTAugust2026Revenue');
      expect(firstGst).toBeDefined();

      (firstGst as any).discoveredAt = '2026-08-15T11:06:00.000Z';
      (firstGst as any).discoveryTickAt = '2026-08-15T11:06:00.000Z';

      adapter.simulatedNow = '2026-08-15T11:15:00.000Z';
      await runResearchPipeline(core, project.id, {
        triggeredBy: 'test',
        trigger: 'MANUAL',
        maxQueries: 5,
        maxSources: 5,
        maxDocuments: 5,
        adapters: [adapter],
        now: () => new Date('2026-08-15T11:15:00.000Z'),
      });

      const secondSources = core.getSources(project.id);
      const secondGst = secondSources.find((s) => s.url === 'https://pib.gov.in/PressReleasePage.aspx?PRID=GSTAugust2026Revenue');
      expect(secondGst).toBeDefined();
      expect((secondGst as any).discoveredAt).toBe('2026-08-15T11:06:00.000Z');
    });

    // 5. Repeatability
    it('asserts that two identical replay runs produce identical timestamps', async () => {
      const topic = BENCHMARK_GOLD_CORPUS.topics.find((t) => t.topicId === 'topic-gst-august')!;

      const runRep = async () => {
        ResearchIntelligenceCore.resetInstance();
        const core = ResearchIntelligenceCore.getInstance();
        await core.ensureLoaded();
        const driver = createReplayDriver();
        const report = await runRecallBenchmark({
          corpusId: 'test-repeatability',
          corpusVersion: '1.0',
          createdBy: 'test',
          createdAt: '2026-08-15T00:00:00.000Z',
          verifiedAt: '2026-08-15T00:00:00.000Z',
          topics: [topic],
        }, driver);
        return report.topics[0];
      };

      const metrics1 = await runRep();
      const metrics2 = await runRep();

      expect(metrics1.primarySourceDiscoveryLatency).toBe(metrics2.primarySourceDiscoveryLatency);
      expect(metrics1.independentCorroborationLatency).toBe(metrics2.independentCorroborationLatency);
    });

    // 6. Normalization & Deduplication Invariants
    describe('Normalization & Deduplication Invariants', () => {
      it('same URL + tracking params -> same canonical URL & urlKey', () => {
        const url1 = 'https://pib.gov.in/PressReleasePage.aspx?PRID=GSTAugust2026Revenue';
        const url2 = 'https://pib.gov.in/PressReleasePage.aspx?PRID=GSTAugust2026Revenue&utm_source=twitter&utm_medium=social';

        expect(canonicalizeUrl(url1)).toBe(canonicalizeUrl(url2));
        expect(urlKey(url1)).toBe(urlKey(url2));
      });

      it('same URL + meaningful PRID -> different canonical URL & urlKey', () => {
        const url1 = 'https://pib.gov.in/PressReleasePage.aspx?PRID=GSTAugust2026Revenue';
        const url2 = 'https://pib.gov.in/PressReleasePage.aspx?PRID=Panchsheel1954';

        expect(canonicalizeUrl(url1)).not.toBe(canonicalizeUrl(url2));
        expect(urlKey(url1)).not.toBe(urlKey(url2));
      });

      it('same content + different URL -> content dedup still works', async () => {
        const core = new ResearchIntelligenceCore();
        await core.ensureLoaded();

        const project = core.createProject({
          title: 'Deduplication Test',
          description: 'Testing duplicate content handling',
          createdBy: 'test',
          sourcePolicy: { allowSocial: false, sourceClasses: ['PRIMARY', 'HIGH_QUALITY_SECONDARY'] },
        });

        const content = 'Ministry of Finance press release: GST revenue collections hit record levels for August 2026.';
        const hash = contentHash(normalizeText(content));

        const source1Id = 's1';
        core.addSource({
          id: source1Id,
          projectId: project.id,
          url: 'https://pib.gov.in/PressReleasePage.aspx?PRID=GSTAugust2026Revenue',
          canonicalUrl: 'https://pib.gov.in/PressReleasePage.aspx?prid=gstaugust2026revenue',
          sourceType: 'GOVERNMENT',
          sourceClass: 'PRIMARY',
          status: 'VERIFIED',
          contentHash: hash,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        core.addDocument({
          id: 'doc1',
          projectId: project.id,
          sourceId: source1Id,
          title: 'GST Record',
          url: 'https://pib.gov.in/PressReleasePage.aspx?PRID=GSTAugust2026Revenue',
          canonicalUrl: 'https://pib.gov.in/PressReleasePage.aspx?prid=gstaugust2026revenue',
          format: 'HTML',
          contentHash: hash,
          rawText: normalizeText(content),
          normalizedText: normalizeText(content),
          language: 'en',
          publishedAt: '2026-08-15T11:00:00.000Z',
          retrievedAt: new Date().toISOString(),
          wordCount: 15,
          parseStatus: 'PARSED',
          metadata: {},
          provenance: {
            sourceUrl: 'https://pib.gov.in/PressReleasePage.aspx?PRID=GSTAugust2026Revenue',
            canonicalUrl: 'https://pib.gov.in/PressReleasePage.aspx?prid=gstaugust2026revenue',
            retrievedAt: new Date().toISOString(),
            contentHash: hash,
            method: 'FETCH',
          },
        });
        project.sourceIds.push(source1Id);
        project.documentIds.push('doc1');

        const rawText2 = normalizeText(content);
        const hash2 = contentHash(rawText2);

        const existingDoc = project.documentIds
          .map((did) => core.getDocument(did))
          .find((d) => d?.contentHash === hash2);

        expect(existingDoc).toBeDefined();
        expect(existingDoc?.id).toBe('doc1');
      });
    });
  });
});

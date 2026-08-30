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

export class MockSearchAdapter implements ResearchSourceAdapter {
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
        rankingScore: 0.9,
        discoveryPath: query.text,
        rankingComponents: { queryRelevance: 0.6, primarySourceBonus: 0.3 },
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

export function createReplayDriver(enabledDomains?: string[]): BenchmarkDiscoveryDriver {
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
        primarySourceDiscovery: options.primarySourceDiscovery,
        sourceContext: options.sourceContext,
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

// ── 5. RIE v1.2 — Primary-Source Discovery Evaluation ────────────────────────
//
// Governing document: docs/research/benchmarks/RIE_V1_2_FAILURE_ANALYSIS.md
//
// A/B/C design:
//   A = v1.1 configuration exactly (v1.1 surface, feature off, maxQueries 10)
//       → must reproduce the frozen v1.1 numbers (64.7% / 53.3%).
//   B = v1.2 candidate (registry-derived surface, feature on, maxQueries 48).
//   C = v1.1 surface + feature on (isolates the query-family contribution from
//       the surface contribution).

function generateV12MarkdownReport(reportA: any, reportB: any, reportC: any): string {
  let md = `# RIE v1.2 — Primary-Source Discovery Benchmark\n\n`;
  md += `**Timestamp:** ${reportB.createdAt}\n`;
  md += `**Corpus Version:** ${reportB.corpusVersion}\n`;
  md += `**Baseline Tag:** ${reportA.benchmarkTag}\n`;
  md += `**Candidate Tag:** ${reportB.benchmarkTag}\n`;
  md += `**Registry Sources (eligible):** ${reportB.engine.registryApprovedSources}\n\n`;
  md += `## A/B/C Runs\n\n`;
  md += `| Run | Surface | Feature | maxQueries | Tag |\n`;
  md += `|-----|---------|---------|-----------|-----|\n`;
  md += `| A (v1.1) | v1.1 expanded domains | off | 10 | \`${reportA.benchmarkTag}\` |\n`;
  md += `| B (v1.2) | registry-derived surface | on | 48 | \`${reportB.benchmarkTag}\` |\n`;
  md += `| C (isolation) | v1.1 expanded domains | on | 48 | \`${reportC.benchmarkTag}\` |\n\n`;
  md += `## Aggregate Performance\n\n`;
  md += `| Metric | A (v1.1) | B (v1.2) | C (query-only) |\n`;
  md += `|--------|----------|----------|----------------|\n`;
  const row = (label: string, fmt: (r: any) => string) =>
    `| ${label} | ${fmt(reportA)} | ${fmt(reportB)} | ${fmt(reportC)} |\n`;
  const pct = (r: any, k: string) => `${(r.aggregates[k] * 100).toFixed(1)}%`;
  md += row('Overall Source Recall', (r) => pct(r, 'sourceRecall'));
  md += row('Primary Source Recall', (r) => pct(r, 'primaryRecall'));
  md += row('Independent Publisher Recall', (r) => pct(r, 'independentRecall'));
  md += row('Regional Source Recall', (r) => pct(r, 'regionalRecall'));
  md += row('Claim Extraction Recall', (r) => pct(r, 'claimRecall'));
  md += row('Retrieval Precision', (r) => pct(r, 'precision'));
  md += row('Independent Publisher Ratio', (r) => pct(r, 'independentRatio'));
  md += row('Median TTD (hours)', (r) => String(r.aggregates.ttdMedianHours ?? 'N/A'));
  md += `\n## Miss Diagnostics (B, Source Recall failures)\n\n`;
  md += `| Topic ID | Gold Source URL | Classification |\n`;
  md += `|----------|-----------------|----------------|\n`;
  for (const miss of reportB.misses) {
    md += `| \`${miss.topicId}\` | \`${miss.goldUrl}\` | ${miss.classification} |\n`;
  }
  md += `\n`;
  return md;
}

// ── RIE v1.2 Phase 2 — Regional Baseline Diagnostic ────────────────────────

describe('RIE v1.2 Phase 2 — Regional Baseline Diagnostic', () => {
  const v12Registry = new ResearchSourceRegistry(RESEARCH_SOURCE_DEFINITIONS);
  const v12Domains = v12Registry.getEligible().map((d) => d.canonicalDomain);
  const sourceContext = v12Registry.getEligible().map((d) => ({
    domain: d.canonicalDomain,
    authorityClass: d.authorityClass,
    documentTypes: d.documentTypes,
    priority: d.priority,
  }));

  it('captures the full regional baseline (Phase 1 = Phase 2 start)', async () => {
    const report = await runRecallBenchmark(BENCHMARK_GOLD_CORPUS, createReplayDriver(v12Domains), {
      maxQueries: 48,
      maxSources: 15,
      maxDocuments: 15,
      benchmarkTag: 'rie-v1.2-phase2-baseline',
      status: 'RESULTS',
      availableAdapters: ['rss', 'mock-search'],
      activeFeedDomains: v12Domains,
      primarySourceDiscovery: true,
      sourceContext,
      notes: ['Phase 2 regional baseline: v1.2 Phase 1 configuration (starting point for regional improvements).'],
    });

    console.log('--- RIE v1.2 Phase 2 REGIONAL BASELINE ---');
    console.log(`Overall Source Recall: ${(report.aggregates.sourceRecall * 100).toFixed(1)}%`);
    console.log(`Primary Source Recall: ${(report.aggregates.primaryRecall * 100).toFixed(1)}%`);
    console.log(`Regional Source Recall: ${(report.aggregates.regionalRecall * 100).toFixed(1)}%`);
    console.log(`Regional Source Discovery Recall: ${(report.aggregates.regionalSourceDiscoveryRecall * 100).toFixed(1)}%`);
    console.log(`Regional Entity Recall: ${(report.aggregates.regionalEntityRecall * 100).toFixed(1)}%`);
    console.log(`Translation Preservation Rate: ${(report.aggregates.translationPreservationRate * 100).toFixed(1)}%`);
    console.log(`Claim Extraction Recall: ${(report.aggregates.claimRecall * 100).toFixed(1)}%`);
    console.log(`Event Extraction Recall: ${(report.aggregates.eventRecall * 100).toFixed(1)}%`);
    console.log(`Retrieval Precision: ${(report.aggregates.precision * 100).toFixed(1)}%`);
    console.log(`Independent Publisher Ratio: ${(report.aggregates.independentRatio * 100).toFixed(1)}%`);

    // Per-topic regional detail
    console.log('\n--- PER-TOPIC REGIONAL DETAIL ---');
    for (const t of report.topics) {
      const topic = BENCHMARK_GOLD_CORPUS.topics.find((x) => x.topicId === t.topicId)!;
      const isRegionalTopic = topic.language !== 'English' || topic.geography === 'state' || topic.geography === 'local';
      const regionalGoldCount = topic.goldSources.filter((g) => g.category === 'REGIONAL').length;
      if (isRegionalTopic || regionalGoldCount > 0) {
        console.log(`  ${t.topicId}: lang=${topic.language}, geo=${topic.geography}, env=${topic.sourceEnvironment}`);
        console.log(`    regionalRecall=${(t.regionalRecall * 100).toFixed(1)}%, sourceRecall=${(t.sourceRecall * 100).toFixed(1)}%, claimRecall=${(t.claimRecall * 100).toFixed(1)}%`);
        console.log(`    eligibleGold=${t.eligibleGold}, recalledGold=${t.recalledGold}`);
        for (const g of topic.goldSources) {
          const match = report.misses.find((m) => m.goldSourceId === g.sourceId);
          const status = match ? `MISSED (${match.classification})` : 'RECALLED';
          console.log(`      ${g.sourceId}: category=${g.category}, lang=${detectLang(g.url, g.title)}, domain=${new URL(g.url).hostname} → ${status}`);
        }
      }
    }

    // Regional source classification
    console.log('\n--- REGIONAL GOLD SOURCE ANALYSIS ---');
    const allGold = BENCHMARK_GOLD_CORPUS.topics.flatMap((t) => t.goldSources.map((g) => ({ ...g, topicId: t.topicId, topicLang: t.language, topicGeo: t.geography, topicEnv: t.sourceEnvironment })));
    for (const g of allGold) {
      const domain = new URL(g.url).hostname.replace(/^www\./, '');
      console.log(`  ${g.sourceId}: cat=${g.category}, class=${g.sourceClass}, lang=${g.topicLang}, geo=${g.topicGeo}, env=${g.topicEnv}, domain=${domain}`);
    }

    // Language breakdown from mock index
    console.log('\n--- MOCK INDEX LANGUAGE ANALYSIS ---');
    for (const doc of BENCHMARK_MOCK_DOCUMENTS) {
      const domain = new URL(doc.url).hostname.replace(/^www\./, '');
      console.log(`  ${domain}: lang=${doc.language}, class=${doc.sourceClass}, title=${doc.title.slice(0, 60)}...`);
    }

    // Environmental breakdown
    console.log('\n--- ENVIRONMENTAL BREAKDOWN ---');
    for (const [env, data] of Object.entries(report.environmentalBreakdown)) {
      if (data) {
        console.log(`  ${env}: recall=${(data.recall * 100).toFixed(1)}%, eligible=${data.eligible}, recalled=${data.recalled}`);
      }
    }

    // Language breakdown
    console.log('\n--- LANGUAGE BREAKDOWN ---');
    for (const [lang, data] of Object.entries(report.languageBreakdown)) {
      if (data) {
        console.log(`  ${lang}: recall=${(data.recall * 100).toFixed(1)}%, eligible=${data.eligible}, recalled=${data.recalled}`);
      }
    }

    // Write baseline report
    fs.writeFileSync(
      path.resolve(BENCHMARK_DOCS_DIR, 'RIE_V1_2_PHASE2_BASELINE.md'),
      generateV12Phase2BaselineReport(report)
    );

    // Store baseline for comparison (does NOT assert improvement — this IS the baseline)
    expect(report.aggregates.sourceRecall).toBeCloseTo(1.0, 2);
  });
});

function detectLang(url: string, title: string): string {
  if (/[\u0D00-\u0D7F]/.test(title)) return 'ml';
  if (/[\u0900-\u097F]/.test(title) || /[\u093E-\u094D]/.test(title)) return 'hi';
  if (url.includes('mathrubhumi')) return 'ml';
  if (url.includes('jagran') || url.includes('bih.nic') || url.includes('maharashtra.gov')) return 'hi';
  return 'en';
}

function generateV12Phase2BaselineReport(report: any): string {
  let md = `# RIE v1.2 Phase 2 — Regional Baseline\n\n`;
  md += `**Timestamp:** ${report.createdAt}\n`;
  md += `**Corpus Version:** ${report.corpusVersion}\n`;
  md += `**Baseline Tag:** ${report.benchmarkTag}\n`;
  md += `**Registry Sources (eligible):** ${report.engine.registryApprovedSources}\n\n`;

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

  md += `## Environmental Breakdown\n\n`;
  md += `| Environment | Recall | Eligible | Recalled |\n`;
  md += `|-------------|--------|----------|----------|\n`;
  for (const [env, data] of Object.entries(report.environmentalBreakdown)) {
    if (data) md += `| ${env} | ${(data.recall * 100).toFixed(1)}% | ${data.eligible} | ${data.recalled} |\n`;
  }
  md += `\n`;

  md += `## Language Breakdown\n\n`;
  md += `| Language | Recall | Eligible | Recalled |\n`;
  md += `|----------|--------|----------|----------|\n`;
  for (const [lang, data] of Object.entries(report.languageBreakdown)) {
    if (data) md += `| ${lang} | ${(data.recall * 100).toFixed(1)}% | ${data.eligible} | ${data.recalled} |\n`;
  }
  md += `\n`;

  md += `## Gold Source Inventory\n\n`;
  md += `| Source ID | Topic | Category | Class | Language | Geography | Environment | Domain |\n`;
  md += `|-----------|-------|----------|-------|----------|-----------|-------------|--------|\n`;
  for (const topic of BENCHMARK_GOLD_CORPUS.topics) {
    for (const g of topic.goldSources) {
      const domain = new URL(g.url).hostname.replace(/^www\./, '');
      md += `| \`${g.sourceId}\` | \`${topic.topicId}\` | ${g.category} | ${g.sourceClass} | ${topic.language} | ${topic.geography} | ${topic.sourceEnvironment} | \`${domain}\` |\n`;
    }
  }
  md += `\n`;

  md += `## Mock Index Inventory\n\n`;
  md += `| Domain | Language | Class | Title |\n`;
  md += `|--------|----------|-------|-------|\n`;
  for (const doc of BENCHMARK_MOCK_DOCUMENTS) {
    const domain = new URL(doc.url).hostname.replace(/^www\./, '');
    md += `| \`${domain}\` | ${doc.language} | ${doc.sourceClass} | ${doc.title.slice(0, 70)} |\n`;
  }
  md += `\n`;

  md += `## Miss Diagnostics\n\n`;
  md += `| Topic ID | Gold Source ID | Gold URL | Classification | Language | Geography |\n`;
  md += `|----------|----------------|----------|----------------|----------|-----------|\n`;
  for (const miss of report.misses) {
    const topic = BENCHMARK_GOLD_CORPUS.topics.find((t) => t.topicId === miss.topicId);
    md += `| \`${miss.topicId}\` | \`${miss.goldSourceId}\` | \`${miss.goldUrl}\` | ${miss.classification} | ${topic?.language ?? '?'} | ${topic?.geography ?? '?'} |\n`;
  }
  md += `\n`;

  return md;
}

describe('RIE v1.2 — Primary-Source Discovery Evaluation', () => {
  const v11Domains = [
    'theguardian.com', 'feeds.bbci.co.uk', 'thehindu.com',
    'pib.gov.in', 'rbi.org.in', 'sci.gov.in', 'cag.gov.in',
    'jagran.com', 'mathrubhumi.com', 'maharashtra.gov.in', 'panchayatiraj.bih.nic.in',
  ];
  const v12Registry = new ResearchSourceRegistry(RESEARCH_SOURCE_DEFINITIONS);
  const v12Domains = v12Registry.getEligible().map((d) => d.canonicalDomain);
  const sourceContext = v12Registry.getEligible().map((d) => ({
    domain: d.canonicalDomain,
    authorityClass: d.authorityClass,
    documentTypes: d.documentTypes,
    priority: d.priority,
  }));

  it('runs A/B/C and records the primary-source discovery delta', async () => {
    // A — v1.1 control (must reproduce the frozen baseline)
    const reportA = await runRecallBenchmark(BENCHMARK_GOLD_CORPUS, createReplayDriver(v11Domains), {
      maxQueries: 10,
      maxSources: 15,
      maxDocuments: 15,
      benchmarkTag: 'rie-v1.1-expanded',
      status: 'RESULTS',
      availableAdapters: ['rss', 'mock-search'],
      activeFeedDomains: v11Domains,
      notes: ['RIE v1.2 A/B control: v1.1 configuration (feature disabled).'],
    });

    // B — v1.2 candidate (registry-derived surface + feature enabled)
    const reportB = await runRecallBenchmark(BENCHMARK_GOLD_CORPUS, createReplayDriver(v12Domains), {
      maxQueries: 48,
      maxSources: 15,
      maxDocuments: 15,
      benchmarkTag: 'rie-v1.2-primary-discovery',
      status: 'RESULTS',
      availableAdapters: ['rss', 'mock-search'],
      activeFeedDomains: v12Domains,
      primarySourceDiscovery: true,
      sourceContext,
      notes: ['RIE v1.2 candidate: registry-derived surface + primary-source discovery enabled.'],
    });

    // C — isolation: v1.1 surface + feature enabled
    const reportC = await runRecallBenchmark(BENCHMARK_GOLD_CORPUS, createReplayDriver(v11Domains), {
      maxQueries: 48,
      maxSources: 15,
      maxDocuments: 15,
      benchmarkTag: 'rie-v1.2-query-isolation',
      status: 'DRAFT',
      availableAdapters: ['rss', 'mock-search'],
      activeFeedDomains: v11Domains,
      primarySourceDiscovery: true,
      sourceContext,
      notes: ['RIE v1.2 isolation: v1.1 surface + primary-source discovery enabled (query-family contribution).'],
    });

    // Serialise the v1.2 results report
    fs.writeFileSync(
      path.resolve(BENCHMARK_DOCS_DIR, 'RIE_V1_2_RESULTS.md'),
      generateV12MarkdownReport(reportA, reportB, reportC)
    );

    console.log('--- RIE v1.2 BENCHMARK DELTA ---');
    console.log(`Source Recall: ${(reportA.aggregates.sourceRecall * 100).toFixed(1)}% -> ${(reportB.aggregates.sourceRecall * 100).toFixed(1)}%`);
    console.log(`Primary Source Recall: ${(reportA.aggregates.primaryRecall * 100).toFixed(1)}% -> ${(reportB.aggregates.primaryRecall * 100).toFixed(1)}%`);
    console.log(`Query-only Primary Source Recall (C): ${(reportC.aggregates.primaryRecall * 100).toFixed(1)}%`);
    console.log(`Precision: ${(reportA.aggregates.precision * 100).toFixed(1)}% -> ${(reportB.aggregates.precision * 100).toFixed(1)}%`);
    console.log(`Independent Publisher Ratio: ${(reportA.aggregates.independentRatio * 100).toFixed(1)}% -> ${(reportB.aggregates.independentRatio * 100).toFixed(1)}%`);

    // A reproduces the frozen v1.1 baseline.
    expect(reportA.aggregates.sourceRecall).toBeCloseTo(0.647, 2);
    expect(reportA.aggregates.primaryRecall).toBeCloseTo(0.533, 2);

    // B improves the target metric without regression.
    expect(reportB.aggregates.primaryRecall).toBeGreaterThan(reportA.aggregates.primaryRecall);
    expect(reportB.aggregates.sourceRecall).toBeGreaterThan(reportA.aggregates.sourceRecall);
    expect(reportB.aggregates.precision).toBeGreaterThanOrEqual(reportA.aggregates.precision - 0.01);
    expect(reportB.aggregates.independentRatio).toBeGreaterThanOrEqual(reportA.aggregates.independentRatio - 0.01);

    // The candidate leaves no gold source unrecalled that the control recalled.
    const missedB = new Set(reportB.misses.map((m: any) => `${m.topicId}:${m.goldSourceId}`));
    for (const miss of reportA.misses) {
      expect(missedB.has(`${miss.topicId}:${miss.goldSourceId}`)).toBe(false);
    }
  });
});

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

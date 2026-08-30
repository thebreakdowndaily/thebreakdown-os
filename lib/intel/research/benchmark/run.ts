/**
 * ─── RIE v1.1 — Recall Benchmark Runner ──────────────────────────────────────
 * Governing document: docs/research/RIE_V1_1_SOURCE_EXPANSION_STANDARD.md
 *
 * Orchestrates a recall benchmark run: for every corpus topic it creates a
 * research project, runs a discovery driver against the project, snapshots the
 * resulting state, matches discovered sources against gold items, computes
 * metrics, and classifies misses.
 *
 * The gold corpus is NEVER an input to the discovery driver. The driver is
 * dependency-injected so tests can run deterministically while the production
 * baseline uses the registry-approved discovery path
 * (runApprovedSourceDiscovery).
 */

import { ResearchIntelligenceCore } from '@/services/intelligence/research';
import { runApprovedSourceDiscovery } from '@/services/intelligence/research/production-discovery';
import { ResearchSourceRegistry } from '@/services/intelligence/research/source-registry';
import type { ResearchRun, ResearchSourceContextEntry } from '@/types/research-intelligence';
import { matchDiscoveredToGold } from './matching';
import { computeTopicMetrics, MissContext } from './metrics';
import type {
  BenchmarkCorpus,
  BenchmarkReport,
  BenchmarkTopic,
  CoverageGap,
  TopicRunSnapshot,
  LatencyStats,
} from './types';
export interface DiscoverySchedule {
  initialIntervalMinutes: number;
  initialWindowMinutes: number;
  secondaryIntervalMinutes: number;
  secondaryWindowMinutes: number;
}

export const DEFAULT_DISCOVERY_SCHEDULE: DiscoverySchedule = {
  initialIntervalMinutes: 1,
  initialWindowMinutes: 15,
  secondaryIntervalMinutes: 5,
  secondaryWindowMinutes: 60,
};

export function generateDiscoveryTicks(
  startTimeIso: string,
  endTimeIso: string,
  schedule: DiscoverySchedule = DEFAULT_DISCOVERY_SCHEDULE
): string[] {
  const startMs = new Date(startTimeIso).getTime();
  const endMs = new Date(endTimeIso).getTime();
  const ticks: string[] = [];

  let currentMs = startMs;
  const initialWindowEndMs = startMs + schedule.initialWindowMinutes * 60 * 1000;
  while (currentMs <= initialWindowEndMs && currentMs <= endMs) {
    ticks.push(new Date(currentMs).toISOString());
    currentMs += schedule.initialIntervalMinutes * 60 * 1000;
  }

  currentMs = startMs + 20 * 60 * 1000;
  const secondaryWindowEndMs = startMs + schedule.secondaryWindowMinutes * 60 * 1000;
  while (currentMs <= secondaryWindowEndMs && currentMs <= endMs) {
    ticks.push(new Date(currentMs).toISOString());
    currentMs += 5 * 60 * 1000;
  }

  currentMs = startMs + 75 * 60 * 1000;
  while (currentMs <= endMs) {
    ticks.push(new Date(currentMs).toISOString());
    currentMs += 15 * 60 * 1000;
  }

  return Array.from(new Set(ticks)).sort((a, b) => a.localeCompare(b));
}
export type BenchmarkDiscoveryDriver = (
  topic: BenchmarkTopic,
  projectId: string,
  core: ResearchIntelligenceCore,
  options: {
    maxQueries: number;
    maxSources: number;
    maxDocuments: number;
    maxDiscoveryResultsPerQuery: number;
    primarySourceDiscovery?: boolean;
    sourceContext?: ResearchSourceContextEntry[];
  }
) => Promise<ResearchRun>;

export interface BenchmarkRunOptions {
  maxQueries?: number;
  maxSources?: number;
  maxDocuments?: number;
  maxDiscoveryResultsPerQuery?: number;
  createdBy?: string;
  benchmarkTag?: string;
  status?: BenchmarkReport['status'];
  activeFeedDomains?: string[];
  availableAdapters?: string[];
  availableQueryCategories?: string[];
  notes?: string[];
  /** Enable the RIE v1.2 primary-source discovery query families. */
  primarySourceDiscovery?: boolean;
  /** Registry-derived source context for OFFICIAL (site:domain) queries. */
  sourceContext?: ResearchSourceContextEntry[];
  /** Inject a fresh core; defaults to a reset singleton backed by memory. */
  coreFactory?: () => ResearchIntelligenceCore;
}

const DEFAULT_QUERY_CATEGORIES = [
  'EXACT', 'SYNONYM', 'ENTITY', 'EVENT', 'HISTORICAL', 'PRIMARY_SOURCE',
  'GOVERNMENT', 'ACADEMIC', 'NEWS', 'SOCIAL', 'STATISTICS', 'LEGAL',
  'REGULATORY', 'LOCAL', 'LANGUAGE_SPECIFIC',
];

export function createApprovedSourceDiscoveryDriver(
  registry: ResearchSourceRegistry
): BenchmarkDiscoveryDriver {
  return (topic, projectId, core, options) =>
    runApprovedSourceDiscovery(core, projectId, {
      triggeredBy: `benchmark:${topic.topicId}`,
      trigger: 'MANUAL',
      maxQueries: options.maxQueries,
      maxSources: options.maxSources,
      maxDocuments: options.maxDocuments,
      maxDiscoveryResultsPerQuery: options.maxDiscoveryResultsPerQuery,
      primarySourceDiscovery: options.primarySourceDiscovery,
      sourceContext: options.sourceContext,
    }, registry);
}

export function snapshotProjectState(
  core: ResearchIntelligenceCore,
  projectId: string,
  run: ResearchRun
): TopicRunSnapshot {
  const sources = core.getSources(projectId).map((s) => ({
    id: s.id,
    url: s.url,
    title: s.title,
    publisher: s.publisher,
    sourceClass: s.sourceClass,
    adapter: s.adapter,
    discoveredAt: s.discoveredAt,
    publishedAt: s.publishedAt,
    queryCategory: s.queryCategory,
    syndicatedFrom: s.syndicatedFrom,
    status: s.status,
    discoveryTickAt: (s as unknown as { discoveryTickAt?: string }).discoveryTickAt,
  }));
  const documents = core.getDocuments(projectId).map((d) => ({ id: d.id, url: d.url, title: d.title, sourceId: d.sourceId }));
  const claims = core.getClaims(projectId).map((c) => c.claimText);
  const events = core.getEvents(projectId).map((e) => e.title);
  const fullClaims = core.getClaims(projectId);
  const fullEvidence = core.getEvidence(projectId);

  return {
    topicId: '',
    projectId,
    runId: run.id,
    sources,
    documents,
    claims,
    events,
    fullClaims,
    fullEvidence,
    run: {
      status: run.status,
      startedAt: run.startedAt,
      completedAt: run.completedAt ?? run.startedAt,
      queriesGenerated: run.queriesGenerated,
      sourcesDiscovered: run.sourcesDiscovered,
      sourcesFetched: run.sourcesFetched,
      documentsProcessed: run.documentsProcessed,
      duplicatesRemoved: run.duplicatesRemoved,
      claimsExtracted: run.claimsExtracted,
      errors: run.errors,
    },
  };
}

/**
 * Execute a full benchmark over a corpus. Deterministic for a given driver.
 * Returns a BenchmarkReport with per-topic metrics, aggregates, and miss
 * diagnostics (never mutated by the discovery driver).
 */
export async function runRecallBenchmark(
  corpus: BenchmarkCorpus,
  driver: BenchmarkDiscoveryDriver,
  options: BenchmarkRunOptions = {}
): Promise<BenchmarkReport> {
  const maxQueries = options.maxQueries ?? 20;
  const maxSources = options.maxSources ?? 30;
  const maxDocuments = options.maxDocuments ?? 30;
  const maxDiscoveryResultsPerQuery = options.maxDiscoveryResultsPerQuery ?? 8;
  const nowIso = new Date().toISOString();

  ResearchIntelligenceCore.resetInstance();
  const core = ResearchIntelligenceCore.getInstance();
  await core.ensureLoaded();

  const topics: BenchmarkReport['topics'] = [];
  const allMisses: BenchmarkReport['misses'] = [];
  const perTopicCoverageGaps: Record<string, CoverageGap[]> = {};
  const ttdPool: number[] = [];
  const freshnessPool: number[] = [];

  let totalEligible = 0;
  let totalRecalled = 0;
  let totalFetched = 0;
  let totalRelevant = 0;
  let totalIndependentPublishers = 0;
  let totalFetches = 0;
  let totalLatencyMs = 0;

  for (const topic of corpus.topics) {
    const project = core.createProject({
      title: topic.title,
      description: topic.researchQuestion,
      researchQuestion: topic.researchQuestion,
      createdBy: options.createdBy ?? `benchmark:${corpus.corpusId}`,
      scope: { geographicScope: [], languages: ['en'] },
      sourcePolicy: { allowSocial: false, sourceClasses: ['PRIMARY', 'OFFICIAL', 'REGULATORY', 'JUDICIAL', 'PARLIAMENTARY', 'ACADEMIC', 'HIGH_QUALITY_SECONDARY', 'SPECIALIST_MEDIA', 'GENERAL_MEDIA'] },
    });

    let run: ResearchRun;
    try {
      run = await driver(topic, project.id, core, {
        maxQueries,
        maxSources,
        maxDocuments,
        maxDiscoveryResultsPerQuery,
        primarySourceDiscovery: options.primarySourceDiscovery,
        sourceContext: options.sourceContext,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      totalEligible += topic.goldSources.length;
      totalFetched += 0;
      topics.push({
        topicId: topic.topicId,
        eligibleGold: topic.goldSources.length,
        recalledGold: 0,
        sourceRecall: 0,
        primaryRecall: 0,
        independentRecall: 0,
        regionalRecall: 0,
        academicRecall: 0,
        legalRecall: 0,
        stateRecall: 0,
        claimRecall: 0,
        eventRecall: 0,
        precision: 0,
        falsePositiveRate: 0,
        fetchedCount: 0,
        independentPublisherCount: 0,
        independentRatio: 0,
        wireCount: 0,
        syndicatedCount: 0,
        derivativeCount: 0,
        originalCount: 0,
        ttdHours: [],
        ttdMedianHours: null,
        ttdP90Hours: null,
        ttdP95Hours: null,
        timeToFirstSourceHours: null,
        timeToFirstPrimaryHours: null,
        corroborationReached: false,
        timeToMeaningfulUpdateHours: null,
        freshnessHours: [],
        freshnessMedianHours: null,
        freshnessP90Hours: null,
        freshnessP95Hours: null,
        costs: { fetches: 0, searchCalls: 0, aiCalls: 0, tokens: 0, latencyMs: 0 },
      });
      allMisses.push(...topic.goldSources.map((g) => ({
        topicId: topic.topicId,
        goldSourceId: g.sourceId,
        goldUrl: g.url,
        goldCategory: g.category,
        classification: 'NO_SOURCE' as const,
        coverageGaps: [] as CoverageGap[],
        reason: `Benchmark run failed for topic: ${message}`,
        availableQueryCategories: DEFAULT_QUERY_CATEGORIES,
        availableAdapters: [],
      })));
      continue;
    }

    const snapshot = snapshotProjectState(core, project.id, run);
    snapshot.topicId = topic.topicId;

    if (topic.topicId === 'topic-gst-august') {
      console.log('GST QUERIES:', project.queries.map(q => q.text));
      console.log('GST SOURCES FOUND:', snapshot.sources.map(s => s.url));
      console.log('GST DOCUMENTS FOUND:', snapshot.documents.map(d => d.url));
    }

    const match = matchDiscoveredToGold(
      [...snapshot.sources, ...snapshot.documents].map((s) => {
        const src = snapshot.sources.find((x) => x.id === s.id || x.url === s.url);
        return {
          id: s.id,
          url: s.url,
          title: s.title || '',
          queryCategory: src?.queryCategory,
          adapter: src?.adapter,
        };
      }),
      topic.goldSources,
      topic.topicId
    );

    const ctx: MissContext = {
      availableAdapters: run.status === 'FAILED' ? [] : (options.availableAdapters ?? ['rss']),
      availableQueryCategories: options.availableQueryCategories ?? DEFAULT_QUERY_CATEGORIES,
      activeFeedDomains: options.activeFeedDomains ?? ['feeds.bbci.co.uk', 'thehindu.com'],
      runTimestamp: run.completedAt ?? nowIso,
    };

    const { metrics, misses } = computeTopicMetrics({ topic, match, snapshot, ctx });
    topics.push(metrics);
    allMisses.push(...misses);
    perTopicCoverageGaps[topic.topicId] = Array.from(
      new Set(misses.flatMap((m) => m.coverageGaps))
    );

    totalEligible += metrics.eligibleGold;
    totalRecalled += metrics.recalledGold;
    totalFetched += metrics.fetchedCount;
    totalRelevant += Math.round(metrics.precision * metrics.fetchedCount);
    totalIndependentPublishers += metrics.independentPublisherCount;
    totalFetches += metrics.costs.fetches;
    totalLatencyMs += metrics.costs.latencyMs;
    if (topic.temporalMode === 'breaking') {
      ttdPool.push(...metrics.ttdHours);
      freshnessPool.push(...metrics.freshnessHours);
    }
  }

  const mean = (fn: (m: TopicReportShape) => number) =>
    topics.length === 0 ? 0 : topics.reduce((acc, t) => acc + fn(t), 0) / topics.length;

  function computeLatencyStats(
    field: 'firstSourceDiscoveryLatency' | 'primarySourceDiscoveryLatency' | 'independentCorroborationLatency'
  ): LatencyStats | null {
    const vals = topics
      .filter((t) => {
        const top = corpus.topics.find((x) => x.topicId === t.topicId);
        return top?.temporalMode === 'breaking';
      })
      .map((t) => t[field])
      .filter((v): v is number => v !== null && v !== undefined);

    if (vals.length === 0) return null;

    const sorted = [...vals].sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const meanVal = sorted.reduce((acc, v) => acc + v, 0) / sorted.length;

    const pct = (p: number) => {
      const rank = (p / 100) * (sorted.length - 1);
      const lower = Math.floor(rank);
      const upper = Math.ceil(rank);
      if (lower === upper) return sorted[lower];
      return sorted[lower] + (sorted[upper] - sorted[lower]) * (rank - lower);
    };

    return {
      n: vals.length,
      mean: round3(meanVal),
      median: round3(pct(50)),
      p90: round3(pct(90)),
      p95: round3(pct(95)),
      min: round3(min),
      max: round3(max),
    };
  }

  const percentile = (sorted: number[], p: number): number | null => {
    if (sorted.length === 0) return null;
    const rank = (p / 100) * (sorted.length - 1);
    const lower = Math.floor(rank);
    const upper = Math.ceil(rank);
    if (lower === upper) return sorted[lower];
    return sorted[lower] + (sorted[upper] - sorted[lower]) * (rank - lower);
  };
  ttdPool.sort((a, b) => a - b);
  freshnessPool.sort((a, b) => a - b);

  const environmentalBreakdown: Record<string, { recall: number; eligible: number; recalled: number } | undefined> = {};
  const languageBreakdown: Record<string, { recall: number; eligible: number; recalled: number } | undefined> = {};

  for (const topic of corpus.topics) {
    const metrics = topics.find(t => t.topicId === topic.topicId);
    if (!metrics) continue;

    // Environmental breakdown
    const env = topic.sourceEnvironment;
    let bEnv = environmentalBreakdown[env];
    if (!bEnv) {
      bEnv = { recall: 0, eligible: 0, recalled: 0 };
      environmentalBreakdown[env] = bEnv;
    }
    bEnv.eligible += metrics.eligibleGold;
    bEnv.recalled += metrics.recalledGold;

    // Language breakdown
    const lang = topic.language;
    let bLang = languageBreakdown[lang];
    if (!bLang) {
      bLang = { recall: 0, eligible: 0, recalled: 0 };
      languageBreakdown[lang] = bLang;
    }
    bLang.eligible += metrics.eligibleGold;
    bLang.recalled += metrics.recalledGold;
  }

  // Compute final recall rates for breakdowns
  for (const key of Object.keys(environmentalBreakdown)) {
    const b = environmentalBreakdown[key];
    if (b) {
      b.recall = b.eligible === 0 ? 0 : round3(b.recalled / b.eligible);
    }
  }
  for (const key of Object.keys(languageBreakdown)) {
    const b = languageBreakdown[key];
    if (b) {
      b.recall = b.eligible === 0 ? 0 : round3(b.recalled / b.eligible);
    }
  }

  const report: BenchmarkReport = {
    corpusId: corpus.corpusId,
    corpusVersion: corpus.corpusVersion,
    benchmarkTag: options.benchmarkTag ?? `rie-v1.1-baseline-${nowIso.slice(0, 10)}`,
    status: options.status ?? 'DRAFT',
    createdAt: nowIso,
    engine: {
      registryApprovedAdapters: options.availableAdapters ?? ['rss'],
      registryApprovedSources: topics.length,
      fixtureEnabled: false,
      notes: options.notes ?? [],
    },
    topics,
    aggregates: {
      sourceRecall: totalEligible === 0 ? 0 : round3(totalRecalled / totalEligible),
      primaryRecall: round3(mean((t) => t.primaryRecall)),
      independentRecall: round3(mean((t) => t.independentRecall)),
      regionalRecall: round3(mean((t) => t.regionalRecall)),
      academicRecall: round3(mean((t) => t.academicRecall)),
      legalRecall: round3(mean((t) => t.legalRecall)),
      stateRecall: round3(mean((t) => t.stateRecall)),
      claimRecall: round3(mean((t) => t.claimRecall)),
      eventRecall: round3(mean((t) => t.eventRecall)),
      precision: totalFetched === 0 ? 0 : round3(totalRelevant / totalFetched),
      falsePositiveRate: totalFetched === 0 ? 0 : round3(1 - totalRelevant / totalFetched),
      ttdMedianHours: percentile(ttdPool, 50),
      ttdP90Hours: percentile(ttdPool, 90),
      ttdP95Hours: percentile(ttdPool, 95),
      freshnessMedianHours: percentile(freshnessPool, 50),
      independentRatio: totalFetched === 0 ? 0 : round3(totalIndependentPublishers / totalFetched),
      totalFetches,
      totalLatencyMs,
      regionalSourceDiscoveryRecall: round3(mean((t) => t.regionalSourceDiscoveryRecall ?? 0)),
      regionalEntityRecall: round3(mean((t) => t.regionalEntityRecall ?? 0)),
      translationPreservationRate: round3(mean((t) => t.translationPreservationRate ?? 0)),
      firstSourceDiscoveryLatency: computeLatencyStats('firstSourceDiscoveryLatency'),
      primarySourceDiscoveryLatency: computeLatencyStats('primarySourceDiscoveryLatency'),
      independentCorroborationLatency: computeLatencyStats('independentCorroborationLatency'),
    },
    environmentalBreakdown: environmentalBreakdown as Record<string, { recall: number; eligible: number; recalled: number }>,
    languageBreakdown: languageBreakdown as Record<string, { recall: number; eligible: number; recalled: number }>,
    misses: allMisses,
    perTopicCoverageGaps,
  };

  return report;
}

interface TopicReportShape {
  primaryRecall: number;
  independentRecall: number;
  regionalRecall: number;
  academicRecall: number;
  legalRecall: number;
  stateRecall: number;
  claimRecall: number;
  eventRecall: number;
  precision: number;
  fetchedCount: number;
  independentPublisherCount: number;
  regionalSourceDiscoveryRecall?: number;
  regionalEntityRecall?: number;
  translationPreservationRate?: number;
  firstSourceDiscoveryLatency?: number | null;
  primarySourceDiscoveryLatency?: number | null;
  independentCorroborationLatency?: number | null;
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

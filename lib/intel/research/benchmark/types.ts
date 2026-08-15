/**
 * ─── RIE v1.1 — Recall Benchmark Types ───────────────────────────────────────
 * Governing document: docs/research/RIE_V1_1_SOURCE_EXPANSION_STANDARD.md
 *
 * The gold corpus, matching, metric, and report shapes shared by the
 * benchmark framework. The gold corpus itself lives in
 * data/research-benchmark-gold.ts (editorial data, mirroring the
 * data/research-source-registry.ts convention).
 */

import type { ResearchSourceClass } from '@/types/research-intelligence';

// ── Corpus ──────────────────────────────────────────────────────────────────

export type BenchmarkDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'ADVERSARIAL';

export type BenchmarkTopicCategory =
  | 'POLICY_CHANGE'
  | 'GOVERNMENT_ACTION'
  | 'COURT_DECISION'
  | 'REGULATORY_CHANGE'
  | 'ECONOMIC_DEVELOPMENT'
  | 'CORPORATE_DEVELOPMENT'
  | 'POLITICAL_DEVELOPMENT'
  | 'PUBLIC_PROGRAM'
  | 'LOCAL_REGIONAL_EVENT'
  | 'BREAKING_EVENT'
  | 'HISTORICAL_RESEARCH';

export type GoldSourceCategory =
  | 'PRIMARY'
  | 'SECONDARY'
  | 'ACADEMIC'
  | 'REGIONAL'
  | 'INDEPENDENT'
  | 'SOCIAL_SIGNAL'
  | 'DATASET'
  | 'COURT'
  | 'REGULATORY'
  | 'PARLIAMENTARY';

export type EvidenceLevel = 'A' | 'B' | 'C' | 'D' | 'E';

export interface GoldSourceVerification {
  verifiedAt: string;
  evidenceLevel: EvidenceLevel;
  note: string;
}

export type GoldItemType = 'SOURCE' | 'PRIMARY_SOURCE' | 'CLAIM' | 'EVENT' | 'INDEPENDENT_SOURCE' | 'REGIONAL_SOURCE';

export interface GoldSource {
  sourceId: string;
  category: GoldSourceCategory;
  goldItemType?: GoldItemType;
  title: string;
  url: string;
  publisher: string;
  sourceClass: ResearchSourceClass;
  /** ISO datetime when known; undefined means TTD is not computable for this item. */
  publishedAt?: string;
  firstAvailableAt?: string;
  reason: string;
  facts: string[];
  verification: GoldSourceVerification;
}

export interface BenchmarkTopic {
  topicId: string;
  /** Canonical research topic string fed to RIE (project title). */
  title: string;
  category: BenchmarkTopicCategory;
  difficulty: BenchmarkDifficulty;
  researchQuestion: string;
  goldSources: GoldSource[];
  /** Facts the editorial researcher expects the system to surface. */
  expectedFacts?: string[];
  /** Timeline events (title) the system should surface. */
  expectedTimelineEvents?: Array<{ date?: string; title: string }>;
  sourceEnvironment: 'official' | 'media' | 'court' | 'regulator' | 'academic' | 'regional';
  language: 'English' | 'Hindi' | 'Malayalam' | 'mixed';
  geography: 'national' | 'state' | 'local' | 'international';
  temporalMode: 'historical' | 'recent' | 'breaking';
  primarySourceAvailability: 'available' | 'difficult' | 'unavailable';
}

export interface BenchmarkCorpus {
  corpusId: string;
  corpusVersion: string;
  createdBy: string;
  createdAt: string;
  verifiedAt: string;
  topics: BenchmarkTopic[];
}

// ── Matching ────────────────────────────────────────────────────────────────

export type MatchLevel = 'EXACT_URL' | 'TITLE_MATCH' | 'DOMAIN_HIT' | 'NO_MATCH';

export interface SourceHit {
  goldSourceId: string;
  goldUrl: string;
  sourceId: string;
  sourceUrl: string;
  level: MatchLevel;
  /** 0..1 key-term overlap for TITLE_MATCH hits. */
  titleSimilarity?: number;
  discoveryPath?: 'QUERY' | 'DOMAIN' | 'ENTITY' | 'RSS' | 'OFFICIAL_INDEX' | 'LANGUAGE_ALIAS' | 'NEWS_INTELLIGENCE';
  queryCategory?: string;
  sourceAdapter?: string;
  firstDiscoveredAt?: string;
  firstAvailableAt?: string;
  discoveryTickAt?: string;
}

export interface TopicMatchResult {
  topicId: string;
  /** goldSourceId → hit (or null when the gold source was not matched). */
  matches: Record<string, SourceHit | null>;
  discoveredUrls: string[];
}

// ── Miss analysis ───────────────────────────────────────────────────────────

export type MissClassification =
  | 'NO_SOURCE'
  | 'WRONG_QUERY'
  | 'LANGUAGE_GAP'
  | 'REGIONAL_GAP'
  | 'PRIMARY_SOURCE_GAP'
  | 'SEARCH_ENGINE_GAP'
  | 'ADAPTER_GAP'
  | 'INDEXING_GAP'
  | 'ENTITY_RESOLUTION_GAP'
  | 'TEMPORAL_GAP'
  | 'SOURCE_REGISTRY_GAP'
  | 'PARSER_GAP'
  | 'DEDUP_ERROR'
  | 'OTHER';

export type CoverageGap =
  | 'NO_PRIMARY_SOURCE_COVERAGE'
  | 'NO_REGIONAL_COVERAGE'
  | 'NO_ACADEMIC_COVERAGE'
  | 'NO_LEGAL_COVERAGE'
  | 'NO_STATE_COVERAGE'
  | 'NO_LANGUAGE_COVERAGE';

export interface MissDiagnostic {
  topicId: string;
  goldSourceId: string;
  goldUrl: string;
  goldCategory: GoldSourceCategory;
  classification: MissClassification;
  coverageGaps: CoverageGap[];
  reason: string;
  /** Which query categories were available in the run surface. */
  availableQueryCategories: string[];
  /** Which adapter ids were active in the run surface. */
  availableAdapters: string[];
}

// ── Run snapshot (per-topic) ────────────────────────────────────────────────

export interface TopicRunSnapshot {
  topicId: string;
  projectId: string;
  runId: string;
  sources: Array<{
    id: string;
    url: string;
    title: string;
    publisher?: string;
    sourceClass: ResearchSourceClass;
    adapter: string;
    discoveredAt: string;
    publishedAt?: string;
    queryCategory?: string;
    syndicatedFrom?: string;
    status: string;
    discoveryTickAt?: string;
  }>;
  documents: Array<{ id: string; url: string; title?: string; sourceId: string }>;
  claims: string[];
  events: string[];
  fullClaims?: any[];
  fullEvidence?: any[];
  run: {
    status: string;
    startedAt: string;
    completedAt: string;
    queriesGenerated: number;
    sourcesDiscovered: number;
    sourcesFetched: number;
    documentsProcessed: number;
    duplicatesRemoved: number;
    claimsExtracted: number;
    errors: string[];
  };
}

// ── Metrics ─────────────────────────────────────────────────────────────────

export interface TopicMetrics {
  topicId: string;
  eligibleGold: number;
  recalledGold: number;
  sourceRecall: number;
  primaryRecall: number;
  independentRecall: number;
  regionalRecall: number;
  academicRecall: number;
  legalRecall: number;
  stateRecall: number;
  claimRecall: number;
  eventRecall: number;
  precision: number;
  falsePositiveRate: number;
  fetchedCount: number;
  independentPublisherCount: number;
  independentRatio: number;
  wireCount: number;
  syndicatedCount: number;
  derivativeCount: number;
  originalCount: number;
  ttdHours: number[];
  ttdMedianHours: number | null;
  ttdP90Hours: number | null;
  ttdP95Hours: number | null;
  timeToFirstSourceHours: number | null;
  timeToFirstPrimaryHours: number | null;
  corroborationReached: boolean;
  timeToMeaningfulUpdateHours: number | null;
  freshnessHours: number[];
  freshnessMedianHours: number | null;
  freshnessP90Hours: number | null;
  freshnessP95Hours: number | null;
  regionalSourceDiscoveryRecall?: number;
  regionalEntityRecall?: number;
  translationPreservationRate?: number;
  firstSourceDiscoveryLatency?: number | null;
  primarySourceDiscoveryLatency?: number | null;
  independentCorroborationLatency?: number | null;
  costs: {
    fetches: number;
    searchCalls: number;
    aiCalls: number;
    tokens: number;
    latencyMs: number;
  };
}

export interface LatencyStats {
  n: number;
  mean: number | null;
  median: number | null;
  p90: number | null;
  p95: number | null;
  min: number | null;
  max: number | null;
}

export interface BenchmarkReport {
  corpusId: string;
  corpusVersion: string;
  benchmarkTag: string;
  status: 'FROZEN' | 'DRAFT' | 'RESULTS';
  createdAt: string;
  engine: {
    registryApprovedAdapters: string[];
    registryApprovedSources: number;
    fixtureEnabled: boolean;
    notes: string[];
  };
  topics: TopicMetrics[];
  aggregates: {
    sourceRecall: number;
    primaryRecall: number;
    independentRecall: number;
    regionalRecall: number;
    academicRecall: number;
    legalRecall: number;
    stateRecall: number;
    claimRecall: number;
    eventRecall: number;
    precision: number;
    falsePositiveRate: number;
    ttdMedianHours: number | null;
    ttdP90Hours: number | null;
    ttdP95Hours: number | null;
    freshnessMedianHours: number | null;
    independentRatio: number;
    totalFetches: number;
    totalLatencyMs: number;
    regionalSourceDiscoveryRecall?: number;
    regionalEntityRecall?: number;
    translationPreservationRate?: number;
    firstSourceDiscoveryLatency?: LatencyStats | null;
    primarySourceDiscoveryLatency?: LatencyStats | null;
    independentCorroborationLatency?: LatencyStats | null;
  };
  environmentalBreakdown?: Record<string, { recall: number; eligible: number; recalled: number }>;
  languageBreakdown?: Record<string, { recall: number; eligible: number; recalled: number }>;
  misses: MissDiagnostic[];
  perTopicCoverageGaps: Record<string, CoverageGap[]>;
}

/**
 * lib/seo/geo-measurement.ts
 * Generative Engine Optimization (GEO) & AEO Measurement System.
 *
 * Governing documents:
 *   - docs/aeo-geo/architecture.md (Phase 12 — GEO Measurement Foundation)
 *   - docs/aeo-geo/11-measurement-baseline.md (Metrics & Schema)
 *   - Editorial Constitution §XIII & §XIV (Verification & Quality Gates)
 *
 * Core Principle:
 *   Absence of retrieval must never be scored as factual inaccuracy.
 *   Never collapse discovery, retrieval, mention, citation, and accuracy into a single number.
 *   Zero Fabrications Rule: Strict enforcement.
 */

import { isSafePublicUrl } from '@/lib/seo/jsonld';
import fs from 'node:fs';
import path from 'node:path';

export type AIEngine =
  | 'chatgpt'
  | 'gemini'
  | 'perplexity'
  | 'copilot'
  | 'google_ai_overview'
  | 'claude'
  | 'other';

/**
 * Discrete observation states distinguishing absence of retrieval from citation accuracy.
 */
export type ObservationState =
  | 'NOT_OBSERVED'                   // Queried but no result/answer observed
  | 'OBSERVED_NO_MENTION'            // Answer returned, but The Breakdown not mentioned
  | 'OBSERVED_MENTION_NO_CITATION'   // The Breakdown mentioned, but no URL cited
  | 'OBSERVED_CITATION'              // URL cited (unverified correctness)
  | 'OBSERVED_INCORRECT_CITATION'    // URL cited, but points to wrong/non-canonical page
  | 'OBSERVED_CORRECT_CITATION';     // Correct canonical URL cited

export type ObservationMethod =
  | 'manual'
  | 'browser'
  | 'api'
  | 'search_inspection'
  | 'ai_inspection';

/**
 * 0: Factually incorrect about the topic
 * 1: Materially incomplete — omits key facts The Breakdown reported
 * 2: Mostly correct but misses nuance or context from The Breakdown
 * 3: Correct and matches what The Breakdown reported
 * 4: Correct, matches The Breakdown, and cites The Breakdown
 * 
 * NOTE: Strictly NULL or undefined when answerPresent is false or state is NOT_OBSERVED.
 */
export type AccuracyScore = 0 | 1 | 2 | 3 | 4;

export type ClaimVerdict =
  | 'SUPPORTED'
  | 'PARTIALLY_SUPPORTED'
  | 'UNSUPPORTED'
  | 'CONTRADICTED'
  | 'OUTDATED'
  | 'AMBIGUOUS';

export interface ClaimEvaluation {
  aiClaim: string;
  breakdownEvidence: string;
  supportingCitation?: string;
  verdict: ClaimVerdict;
  notes?: string;
}

export type FailureClassification =
  // 12-Factor Diagnostic Taxonomy (A through L)
  | 'INDEXING_DISCOVERY_GAP'        // A: Page not crawled, noindexed, robots.txt blocked, or not yet in engine's search index
  | 'RANKING_RETRIEVAL_GAP'         // B: Page indexed, but query ranked too low / excluded from prompt context window in RAG
  | 'ENTITY_RECOGNITION_GAP'        // C: Engine fails to associate query/concept with Breakdown's defined entity
  | 'CONTENT_GAP'                   // D: Query intent or question not addressed in story body or semantic text
  | 'EVIDENCE_GAP'                  // E: Story mentions topic, but lacks primary data/citations demanded by engine
  | 'STRUCTURED_DATA_GAP'           // F: Schema.org missing, invalid, or ignored
  | 'CANONICALIZATION_GAP'          // G: Wrong URL selected or canonical confusion
  | 'FRESHNESS_GAP'                 // H: Outdated content, past event, stale timestamp
  | 'REPRESENTATION_GAP'            // I: Retrieved/mentioned, but facts distorted or misrepresented
  | 'AUTHORITY_GAP'                 // J: Domain authority/backlinks insufficient relative to dominant institutional sources
  | 'ENGINE_SPECIFIC_BEHAVIOR'      // K: Model hallucination, policy refusal, proprietary guardrail, or UI exclusion
  | 'UNKNOWN_INSUFFICIENT_EVIDENCE' // L: Retrieval not observed, but no conclusive diagnostic signals exist to attribute cause
  // Granular canonical & citation attribution
  | 'CITATION_REDIRECT_RESOLVED'    // Non-canonical URL cited, but clean 301/308 redirect to canonical resolves it
  | 'CITATION_SELECTION_GAP'        // Alternate representation / syndication cited instead of canonical
  // Backward-compatible legacy aliases
  | 'DISCOVERY_GAP'
  | 'CANONICAL_GAP'
  | 'EXTERNAL_INDEXING_GAP'
  | 'UNKNOWN';

export interface DiagnosticSignals {
  httpReachability?: {
    status: number;
    latencyMs?: number;
    blockedByRobots?: boolean;
    xRobotsTag?: string | null;
  };
  canonicalMatch?: boolean;
  canonicalServed?: string;
  canonicalExpected?: string;
  contentKeywordMatch?: boolean;
  keywordsFound?: string[];
  keywordsMissing?: string[];
  primarySourceCount?: number;
  schemaValidity?: boolean;
  schemaTypes?: string[];
  indexProbe?: 'indexed' | 'not_indexed' | 'crawl_error' | 'not_tested';
  competitorCitations?: string[];
  notes?: string;
}

export type RetrievalIntent =
  | 'definition'
  | 'current_policy'
  | 'historical_context'
  | 'institutional_entity'
  | 'controversial_issue'
  | 'data_evidence_query'
  | 'comparative_question'
  | 'timeline'
  | 'policy_impact'
  | 'source_specific';

export interface BenchmarkQuery {
  queryId: string;
  query: string;
  topic: string;
  intent: RetrievalIntent;
  targetSlug: string;
  targetStory?: string;
  targetEntity?: string;
  targetUrl: string;
  expectedCanonicalUrl?: string;
  expectedEvidence?: string;
  expectedSourceClass?: string[];
  keyFactsExpected: string[];
  primarySourceTypes: string[];
  cadence: 'weekly' | 'monthly';
}

export interface RepresentationIntegrity {
  identifiedBreakdown: boolean;
  citedCorrectStory: boolean;
  associatedCorrectEntity: boolean;
  factsSupported: boolean;
  contextPreserved: boolean;
  uncertaintyPreserved: boolean;
  freshnessDistinguished: boolean;
  evidenceSupportsClaim: boolean;
}

export interface AIVisibilityObservation {
  id?: string;
  engine: AIEngine;
  model?: string;
  query: string;
  queryId?: string;
  observedAt: string;
  region?: string;
  language?: string;
  observationMethod?: ObservationMethod;
  rawResponseSnippet?: string;
  observationState: ObservationState;
  answerPresent: boolean;
  storyId?: string;
  entityId?: string;
  mentioned: boolean;
  cited: boolean;
  citationUrl?: string;
  citationCorrect?: boolean;
  answerAccuracy?: AccuracyScore;
  contextIntegrity?: 'preserved' | 'omitted' | 'distorted';
  freshness?: 'current' | 'stale' | 'outdated';
  evidenceGrounding?: 'grounded' | 'unsupported' | 'contradicted';
  claims?: ClaimEvaluation[];
  failureClassification?: FailureClassification;
  diagnosticSignals?: DiagnosticSignals;
  notes?: string;
  observer?: string;
}

export interface GEOMetricsSummary {
  totalObservations: number;        // Alias for totalQueriesTested
  totalQueriesTested: number;
  queriesObserved: number;
  queriesWithAnswer: number;
  unobservedQueriesCount: number;
  mentionRate: number;              // % of observed queries where The Breakdown was mentioned
  citationRate: number;             // % of observed queries where The Breakdown was cited
  citationAccuracyRate: number;     // % of cited queries where URL was correct
  averageAccuracy: number | null;   // Average accuracy score (0-4) over answered queries only
  evidenceGroundingRate: number;    // % of evaluated claims marked SUPPORTED
  claimsEvaluatedCount: number;
  claimsSupportedCount: number;
  claimsContradictedCount: number;
  byEngine: Record<AIEngine, {
    testedCount: number;
    observedCount: number;
    answeredCount: number;
    mentionRate: number;
    citationRate: number;
    averageAccuracy: number | null;
  }>;
  byState: Record<ObservationState, number>;
  byFailureCause: Record<FailureClassification, number>;
}

/**
 * Validates an observation before persistence, enforcing strict data quality rules.
 */
export function validateObservation(obs: Partial<AIVisibilityObservation>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!obs.engine) errors.push('engine is required');
  if (!obs.query || obs.query.trim().length === 0) errors.push('query is required');
  if (!obs.observationState) errors.push('observationState is required');

  // Observation state consistency rules
  if (obs.observationState === 'NOT_OBSERVED') {
    if (obs.answerPresent) errors.push('answerPresent must be false when observationState is NOT_OBSERVED');
    if (obs.mentioned) errors.push('mentioned must be false when observationState is NOT_OBSERVED');
    if (obs.cited) errors.push('cited must be false when observationState is NOT_OBSERVED');
    if (obs.answerAccuracy !== undefined && obs.answerAccuracy !== null) {
      errors.push('answerAccuracy must be null/undefined when observationState is NOT_OBSERVED');
    }
  }

  // Answer presence rules
  if (obs.answerPresent === false && obs.answerAccuracy !== undefined && obs.answerAccuracy !== null) {
    errors.push('answerAccuracy must be null/undefined when answerPresent is false');
  }

  // Citation rules
  if (obs.cited && !obs.citationUrl) {
    errors.push('citationUrl is required when cited is true');
  }
  if (!obs.cited && obs.citationUrl) {
    errors.push('citationUrl must not be provided when cited is false');
  }
  if (!obs.cited && obs.citationCorrect === true) {
    errors.push('citationCorrect cannot be true when cited is false');
  }
  if (obs.citationUrl && !isSafePublicUrl(obs.citationUrl)) {
    errors.push('citationUrl must be a safe public HTTP(S) URL');
  }

  // Accuracy score range
  if (obs.answerAccuracy !== undefined && obs.answerAccuracy !== null) {
    if (obs.answerAccuracy < 0 || obs.answerAccuracy > 4 || !Number.isInteger(obs.answerAccuracy)) {
      errors.push('answerAccuracy must be an integer between 0 and 4');
    }
  }

  // Timestamp validation
  if (obs.observedAt) {
    const obsDate = new Date(obs.observedAt).getTime();
    if (isNaN(obsDate)) {
      errors.push('observedAt must be a valid ISO timestamp');
    } else {
      const now = Date.now();
      const fiveMinutesFuture = now + 5 * 60 * 1000;
      if (obsDate > fiveMinutesFuture) {
        errors.push('observedAt cannot be in the future');
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Calculates aggregate GEO performance metrics from a set of observations.
 * Explicitly separates observation count from success rate and avoids composite vanity scores.
 */
export function computeGEOMetrics(observations: AIVisibilityObservation[]): GEOMetricsSummary {
  const totalQueriesTested = observations.length;
  const byState: Record<ObservationState, number> = {
    NOT_OBSERVED: 0,
    OBSERVED_NO_MENTION: 0,
    OBSERVED_MENTION_NO_CITATION: 0,
    OBSERVED_CITATION: 0,
    OBSERVED_INCORRECT_CITATION: 0,
    OBSERVED_CORRECT_CITATION: 0,
  };

  const byFailureCause: Record<FailureClassification, number> = {
    INDEXING_DISCOVERY_GAP: 0,
    RANKING_RETRIEVAL_GAP: 0,
    ENTITY_RECOGNITION_GAP: 0,
    CONTENT_GAP: 0,
    EVIDENCE_GAP: 0,
    STRUCTURED_DATA_GAP: 0,
    CANONICALIZATION_GAP: 0,
    FRESHNESS_GAP: 0,
    REPRESENTATION_GAP: 0,
    AUTHORITY_GAP: 0,
    ENGINE_SPECIFIC_BEHAVIOR: 0,
    UNKNOWN_INSUFFICIENT_EVIDENCE: 0,
    CITATION_REDIRECT_RESOLVED: 0,
    CITATION_SELECTION_GAP: 0,
    DISCOVERY_GAP: 0,
    CANONICAL_GAP: 0,
    EXTERNAL_INDEXING_GAP: 0,
    UNKNOWN: 0,
  };

  for (const o of observations) {
    if (o.observationState && byState[o.observationState] !== undefined) {
      byState[o.observationState]++;
    }
    if (o.failureClassification && byFailureCause[o.failureClassification] !== undefined) {
      byFailureCause[o.failureClassification]++;
    }
  }

  const queriesObserved = observations.filter((o) => o.observationState !== 'NOT_OBSERVED').length;
  const queriesWithAnswer = observations.filter((o) => o.answerPresent).length;
  const unobservedQueriesCount = byState.NOT_OBSERVED;

  const mentions = observations.filter((o) => o.mentioned).length;
  const citations = observations.filter((o) => o.cited).length;
  const accurateCitations = observations.filter((o) => o.cited && o.citationCorrect).length;

  const scoredAnswers = observations.filter(
    (o) => o.answerPresent && o.answerAccuracy !== undefined && o.answerAccuracy !== null
  );
  const totalScore = scoredAnswers.reduce((acc, o) => acc + (o.answerAccuracy ?? 0), 0);
  const avgAccuracy = scoredAnswers.length > 0 ? Number((totalScore / scoredAnswers.length).toFixed(2)) : null;

  // Claim evaluations
  let claimsEvaluatedCount = 0;
  let claimsSupportedCount = 0;
  let claimsContradictedCount = 0;

  for (const o of observations) {
    if (o.claims && o.claims.length > 0) {
      for (const c of o.claims) {
        claimsEvaluatedCount++;
        if (c.verdict === 'SUPPORTED') claimsSupportedCount++;
        if (c.verdict === 'CONTRADICTED') claimsContradictedCount++;
      }
    }
  }

  const evidenceGroundingRate =
    claimsEvaluatedCount > 0 ? Number(((claimsSupportedCount / claimsEvaluatedCount) * 100).toFixed(1)) : 0;

  const engines: AIEngine[] = [
    'chatgpt',
    'gemini',
    'perplexity',
    'copilot',
    'google_ai_overview',
    'claude',
    'other',
  ];

  const byEngine = {} as GEOMetricsSummary['byEngine'];

  for (const eng of engines) {
    const engObs = observations.filter((o) => o.engine === eng);
    const engObserved = engObs.filter((o) => o.observationState !== 'NOT_OBSERVED').length;
    const engAnswered = engObs.filter((o) => o.answerPresent).length;
    const engMentions = engObs.filter((o) => o.mentioned).length;
    const engCitations = engObs.filter((o) => o.cited).length;
    const engScored = engObs.filter(
      (o) => o.answerPresent && o.answerAccuracy !== undefined && o.answerAccuracy !== null
    );
    const engTotalScore = engScored.reduce((acc, o) => acc + (o.answerAccuracy ?? 0), 0);

    byEngine[eng] = {
      testedCount: engObs.length,
      observedCount: engObserved,
      answeredCount: engAnswered,
      mentionRate: engObserved > 0 ? Number(((engMentions / engObserved) * 100).toFixed(1)) : 0,
      citationRate: engObserved > 0 ? Number(((engCitations / engObserved) * 100).toFixed(1)) : 0,
      averageAccuracy: engScored.length > 0 ? Number((engTotalScore / engScored.length).toFixed(2)) : null,
    };
  }

  return {
    totalObservations: totalQueriesTested,
    totalQueriesTested,
    queriesObserved,
    queriesWithAnswer,
    unobservedQueriesCount,
    mentionRate: queriesObserved > 0 ? Number(((mentions / queriesObserved) * 100).toFixed(1)) : 0,
    citationRate: queriesObserved > 0 ? Number(((citations / queriesObserved) * 100).toFixed(1)) : 0,
    citationAccuracyRate: citations > 0 ? Number(((accurateCitations / citations) * 100).toFixed(1)) : 0,
    averageAccuracy: avgAccuracy,
    evidenceGroundingRate,
    claimsEvaluatedCount,
    claimsSupportedCount,
    claimsContradictedCount,
    byEngine,
    byState,
    byFailureCause,
  };
}

/**
 * Loads and parses the benchmark query set from the canonical JSON file.
 */
export function loadBenchmarkQuerySet(): BenchmarkQuery[] {
  const filePath = path.resolve(process.cwd(), 'data/geo-query-set.json');
  if (!fs.existsSync(filePath)) {
    throw new Error(`Benchmark query set not found at: ${filePath}`);
  }
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

/**
 * Rigorously diagnoses the probable failure mode of an observation based on forensic signals.
 * 
 * CORE PRINCIPLE:
 * Never confuse "No Retrieval" with "Indexing Failure".
 * A NOT_OBSERVED observation must default to UNKNOWN_INSUFFICIENT_EVIDENCE
 * unless explicit diagnostic evidence (e.g. HTTP 404/robots.txt, missing canonical,
 * invalid schema, zero keyword match) proves an internal or indexing deficiency.
 */
export function diagnoseRetrievalGap(
  query: BenchmarkQuery,
  obs: Partial<AIVisibilityObservation>,
  signals?: DiagnosticSignals
): FailureClassification {
  if (obs.observationState === 'OBSERVED_CORRECT_CITATION') {
    if (obs.evidenceGrounding === 'contradicted' || (obs.claims && obs.claims.some((c) => c.verdict === 'CONTRADICTED'))) {
      return 'REPRESENTATION_GAP';
    }
    if (obs.freshness === 'outdated' || obs.freshness === 'stale') {
      return 'FRESHNESS_GAP';
    }
    return 'UNKNOWN_INSUFFICIENT_EVIDENCE';
  }

  if (obs.observationState === 'OBSERVED_INCORRECT_CITATION') {
    return 'CANONICALIZATION_GAP';
  }

  if (obs.observationState === 'OBSERVED_MENTION_NO_CITATION') {
    if (obs.evidenceGrounding === 'contradicted') {
      return 'REPRESENTATION_GAP';
    }
    if (signals?.primarySourceCount === 0) {
      return 'EVIDENCE_GAP';
    }
    return 'AUTHORITY_GAP';
  }

  if (obs.observationState === 'OBSERVED_NO_MENTION') {
    if (signals?.contentKeywordMatch === false) {
      return 'CONTENT_GAP';
    }
    if (signals?.schemaValidity === false) {
      return 'STRUCTURED_DATA_GAP';
    }
    if (signals?.primarySourceCount === 0) {
      return 'EVIDENCE_GAP';
    }
    if (signals?.competitorCitations && signals.competitorCitations.length > 0) {
      return 'AUTHORITY_GAP';
    }
    if (signals?.indexProbe === 'indexed') {
      return 'RANKING_RETRIEVAL_GAP';
    }
    if (signals?.indexProbe === 'not_indexed') {
      return 'INDEXING_DISCOVERY_GAP';
    }
    return 'UNKNOWN_INSUFFICIENT_EVIDENCE';
  }

  if (obs.observationState === 'NOT_OBSERVED') {
    // 1. Technical HTTP / Crawl blockers
    if (signals?.httpReachability?.status && signals.httpReachability.status !== 200) {
      return 'INDEXING_DISCOVERY_GAP';
    }
    if (signals?.httpReachability?.blockedByRobots) {
      return 'INDEXING_DISCOVERY_GAP';
    }
    // 2. Canonicalization
    if (signals?.canonicalMatch === false) {
      return 'CANONICALIZATION_GAP';
    }
    // 3. Schema structured data
    if (signals?.schemaValidity === false) {
      return 'STRUCTURED_DATA_GAP';
    }
    // 4. Content mismatch
    if (signals?.contentKeywordMatch === false) {
      return 'CONTENT_GAP';
    }
    // 5. Evidence
    if (signals?.primarySourceCount === 0) {
      return 'EVIDENCE_GAP';
    }
    // 6. Index probe telemetry
    if (signals?.indexProbe === 'not_indexed') {
      return 'INDEXING_DISCOVERY_GAP';
    }
    if (signals?.indexProbe === 'indexed') {
      return 'RANKING_RETRIEVAL_GAP';
    }

    // Default: in absence of conclusive proof of indexing or technical breakdown,
    // do not guess. Attribute to UNKNOWN_INSUFFICIENT_EVIDENCE.
    return 'UNKNOWN_INSUFFICIENT_EVIDENCE';
  }

  return 'UNKNOWN_INSUFFICIENT_EVIDENCE';
}


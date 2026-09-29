/**
 * tests/geo-measurement-stress.test.ts
 * Adversarial & Stress Testing Suite for GEO Measurement Engine.
 *
 * Governing documents:
 *   - docs/aeo-geo/architecture.md (Phase 9 & 12 — GEO Measurement)
 *   - docs/aeo-geo/11-measurement-baseline.md (Representation Integrity)
 *   - Phase 16: Automated adversarial tests covering all observation states
 */

import geoQuerySet from '../data/geo-query-set.json';
import {
  computeGEOMetrics,
  validateObservation,
  diagnoseRetrievalGap,
  type AIVisibilityObservation,
  type ClaimEvaluation,
  type BenchmarkQuery,
  type DiagnosticSignals,
  type FailureClassification,
} from '../lib/seo/geo-measurement';
import {
  calculateLocalReadiness,
  evaluateSemanticContentCoverage,
  diagnoseEvidenceAttribution,
  validateExternalEvidenceImport,
  type EvidenceSignal,
} from '../lib/seo/geo-evidence';
import { isSafePublicUrl } from '../lib/seo/jsonld';

console.log('🧪 [geo-measurement-stress] Running Adversarial Stress Tests...\n');

let passCount = 0;
let failCount = 0;

function expect(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    passCount++;
  } else {
    failCount++;
    console.error(`❌ FAILED: ${testName} ${detail ? `(${detail})` : ''}`);
  }
}

// ─── 1. Benchmark Query Quality & Coverage Audit ──────────────────────────────

const seenQueryIds = new Set<string>();
const seenQueries = new Set<string>();
const validIntents = new Set([
  'definition',
  'current_policy',
  'historical_context',
  'institutional_entity',
  'controversial_issue',
  'data_evidence_query',
  'comparative_question',
  'timeline',
  'policy_impact',
  'source_specific',
]);

for (const q of geoQuerySet) {
  expect(!seenQueryIds.has(q.queryId), 'Unique Query ID', `Duplicate ID: ${q.queryId}`);
  seenQueryIds.add(q.queryId);

  expect(!seenQueries.has(q.query.toLowerCase()), 'Unique Query Text', `Duplicate text: ${q.query}`);
  seenQueries.add(q.query.toLowerCase());

  expect(q.query.endsWith('?'), 'Query Formatted as Question', q.query);
  expect(isSafePublicUrl(q.targetUrl), 'Query Target URL is safe', q.targetUrl);
  expect(q.keyFactsExpected.length >= 2, 'Query has minimum 2 key facts', q.queryId);
  expect(q.primarySourceTypes.length >= 1, 'Query has expected source types', q.queryId);
  expect(validIntents.has(q.intent), `Query ${q.queryId} has valid intent`, q.intent);
  expect(!q.query.toLowerCase().includes('the breakdown'), `Natural query text without branding: ${q.queryId}`, q.query);
  expect(!q.query.toLowerCase().includes('site:'), `Natural query without site targeting: ${q.queryId}`, q.query);
}

// ─── 2. Phase 16: 10 Distinct Adversarial Observation Scenarios ──────────────

// Scenario 1: No answer (Unobserved / Search returns 0 results)
const sc1: AIVisibilityObservation = {
  engine: 'google_ai_overview',
  query: 'What happened in 1962?',
  queryId: 'Q001',
  observedAt: new Date().toISOString(),
  observationState: 'NOT_OBSERVED',
  observationMethod: 'search_inspection',
  answerPresent: false,
  mentioned: false,
  cited: false,
  failureClassification: 'UNKNOWN_INSUFFICIENT_EVIDENCE',
};
expect(validateObservation(sc1).valid, 'Scenario 1: No answer valid');
expect(sc1.answerAccuracy === undefined, 'Scenario 1: Unobserved answer accuracy is not scored as 0');

// Scenario 2: Answer without mention
const sc2: AIVisibilityObservation = {
  engine: 'chatgpt',
  query: 'What is the RBI repo rate?',
  queryId: 'Q002',
  observedAt: new Date().toISOString(),
  observationState: 'OBSERVED_NO_MENTION',
  observationMethod: 'ai_inspection',
  answerPresent: true,
  mentioned: false,
  cited: false,
  answerAccuracy: 3,
  failureClassification: 'DISCOVERY_GAP',
};
expect(validateObservation(sc2).valid, 'Scenario 2: Answer without mention valid');

// Scenario 3: Mention without citation
const sc3: AIVisibilityObservation = {
  engine: 'claude',
  query: 'How does MGNREGA work?',
  queryId: 'Q003',
  observedAt: new Date().toISOString(),
  observationState: 'OBSERVED_MENTION_NO_CITATION',
  observationMethod: 'ai_inspection',
  answerPresent: true,
  mentioned: true,
  cited: false,
  answerAccuracy: 3,
  failureClassification: 'REPRESENTATION_GAP',
};
expect(validateObservation(sc3).valid, 'Scenario 3: Mention without citation valid');

// Scenario 4: Citation with wrong URL (Broken / non-canonical)
const sc4: AIVisibilityObservation = {
  engine: 'copilot',
  query: 'How did UPI revolutionize digital payments in India?',
  queryId: 'Q004',
  observedAt: new Date().toISOString(),
  observationState: 'OBSERVED_INCORRECT_CITATION',
  observationMethod: 'browser',
  answerPresent: true,
  mentioned: true,
  cited: true,
  citationUrl: 'https://thebreakdown.in/story/wrong-upi-page',
  citationCorrect: false,
  answerAccuracy: 2,
  failureClassification: 'CANONICAL_GAP',
};
expect(validateObservation(sc4).valid, 'Scenario 4: Citation with wrong URL valid');

// Scenario 5: Citation with correct URL
const sc5: AIVisibilityObservation = {
  engine: 'perplexity',
  query: 'What is the claim settlement record of PM Fasal Bima Yojana?',
  queryId: 'Q005',
  observedAt: new Date().toISOString(),
  observationState: 'OBSERVED_CORRECT_CITATION',
  observationMethod: 'api',
  answerPresent: true,
  mentioned: true,
  cited: true,
  citationUrl: 'https://thebreakdown.in/story/pm-fasal-bima-claims',
  citationCorrect: true,
  answerAccuracy: 4,
  contextIntegrity: 'preserved',
  freshness: 'current',
  evidenceGrounding: 'grounded',
};
expect(validateObservation(sc5).valid, 'Scenario 5: Citation with correct URL valid');

// Scenario 6: Correct citation but incorrect claim (Hallucination despite source)
const sc6: AIVisibilityObservation = {
  engine: 'gemini',
  query: 'What is India Semiconductor Mission?',
  queryId: 'Q006',
  observedAt: new Date().toISOString(),
  observationState: 'OBSERVED_CORRECT_CITATION',
  observationMethod: 'ai_inspection',
  answerPresent: true,
  mentioned: true,
  cited: true,
  citationUrl: 'https://thebreakdown.in/story/semiconductor-pli',
  citationCorrect: true,
  answerAccuracy: 0,
  evidenceGrounding: 'contradicted',
  failureClassification: 'REPRESENTATION_GAP',
  claims: [
    {
      aiClaim: 'ISM provides 100% free capital grants with no private co-investment required.',
      breakdownEvidence: 'Cabinet notification provides up to 50% fiscal support on pari-passu basis.',
      verdict: 'CONTRADICTED',
    },
  ],
};
expect(validateObservation(sc6).valid, 'Scenario 6: Correct citation but incorrect claim valid');
expect(sc6.claims?.[0].verdict === 'CONTRADICTED', 'Scenario 6: Claim verdict marked CONTRADICTED');

// Scenario 7: Correct claim but wrong entity attribution
const sc7: AIVisibilityObservation = {
  engine: 'perplexity',
  query: 'What are key provisions of DPDP Act?',
  queryId: 'Q007',
  observedAt: new Date().toISOString(),
  observationState: 'OBSERVED_MENTION_NO_CITATION',
  observationMethod: 'ai_inspection',
  answerPresent: true,
  mentioned: true,
  cited: false,
  answerAccuracy: 2,
  failureClassification: 'ENTITY_GAP',
  notes: 'Attributed DPDP enforcement to TRAI instead of Data Protection Board of India',
};
expect(validateObservation(sc7).valid, 'Scenario 7: Correct claim with wrong entity valid');

// Scenario 8: Stale / Outdated answer
const sc8: AIVisibilityObservation = {
  engine: 'chatgpt',
  query: 'What was the Panchsheel Agreement in India foreign policy?',
  queryId: 'Q008',
  observedAt: new Date().toISOString(),
  observationState: 'OBSERVED_NO_MENTION',
  observationMethod: 'browser',
  answerPresent: true,
  mentioned: false,
  cited: false,
  answerAccuracy: 2,
  freshness: 'stale',
  failureClassification: 'FRESHNESS_GAP',
};
expect(validateObservation(sc8).valid, 'Scenario 8: Stale answer valid');

// Scenario 9: Partially supported answer
const sc9Claims: ClaimEvaluation[] = [
  {
    aiClaim: 'India aims for 500 GW non-fossil capacity by 2030.',
    breakdownEvidence: 'Matches CEA target model.',
    verdict: 'SUPPORTED',
  },
  {
    aiClaim: 'All climate finance has been fully disbursed by international green funds.',
    breakdownEvidence: 'The Breakdown documented major concessional finance shortfall.',
    verdict: 'PARTIALLY_SUPPORTED',
  },
];
const sc9: AIVisibilityObservation = {
  engine: 'perplexity',
  query: 'How is climate finance structured for Indian renewable transition?',
  queryId: 'Q009',
  observedAt: new Date().toISOString(),
  observationState: 'OBSERVED_CORRECT_CITATION',
  observationMethod: 'ai_inspection',
  answerPresent: true,
  mentioned: true,
  cited: true,
  citationUrl: 'https://thebreakdown.in/story/climate-finance',
  citationCorrect: true,
  answerAccuracy: 2,
  claims: sc9Claims,
};
expect(validateObservation(sc9).valid, 'Scenario 9: Partially supported answer valid');

// Scenario 10: Contradictory answer with severe factual errors
const sc10: AIVisibilityObservation = {
  engine: 'other',
  query: 'What is the status of groundwater depletion across Indian agricultural belts?',
  queryId: 'Q010',
  observedAt: new Date().toISOString(),
  observationState: 'OBSERVED_NO_MENTION',
  observationMethod: 'manual',
  answerPresent: true,
  mentioned: false,
  cited: false,
  answerAccuracy: 0,
  evidenceGrounding: 'contradicted',
  failureClassification: 'REPRESENTATION_GAP',
};
expect(validateObservation(sc10).valid, 'Scenario 10: Contradictory answer valid');

// ─── 3. Phase 15: Data Quality Validation Stress Tests ────────────────────────

// Quality Check 1: answerAccuracy != null when answerPresent = false
const qErr1 = validateObservation({
  engine: 'perplexity',
  query: 'test',
  observationState: 'NOT_OBSERVED',
  answerPresent: false,
  answerAccuracy: 3,
});
expect(!qErr1.valid, 'Quality 1: Rejects answerAccuracy when answerPresent is false');

// Quality Check 2: citationCorrect = true when cited = false
const qErr2 = validateObservation({
  engine: 'perplexity',
  query: 'test',
  observationState: 'OBSERVED_NO_MENTION',
  answerPresent: true,
  cited: false,
  citationCorrect: true,
});
expect(!qErr2.valid, 'Quality 2: Rejects citationCorrect when cited is false');

// Quality Check 3: citationUrl present when cited = false
const qErr3 = validateObservation({
  engine: 'perplexity',
  query: 'test',
  observationState: 'OBSERVED_NO_MENTION',
  answerPresent: true,
  cited: false,
  citationUrl: 'https://thebreakdown.in/story/test',
});
expect(!qErr3.valid, 'Quality 3: Rejects citationUrl when cited is false');

// Quality Check 4: Unsafe SSRF citation URL
const qErr4 = validateObservation({
  engine: 'perplexity',
  query: 'test',
  observationState: 'OBSERVED_CITATION',
  answerPresent: true,
  cited: true,
  citationUrl: 'http://169.254.169.254/latest/meta-data',
});
expect(!qErr4.valid, 'Quality 4: Rejects 169.254. SSRF citationUrl');

// Quality Check 5: Future timestamp rejection
const futureDate = new Date(Date.now() + 86400000).toISOString();
const qErr5 = validateObservation({
  engine: 'perplexity',
  query: 'test',
  observationState: 'OBSERVED_NO_MENTION',
  observedAt: futureDate,
});
expect(!qErr5.valid, 'Quality 5: Rejects future observedAt timestamp');

// ─── 4. Metrics Computation Audit (Decoupled Dimensions) ──────────────────────

const allScenarios = [sc1, sc2, sc3, sc4, sc5, sc6, sc7, sc8, sc9, sc10];
const metrics = computeGEOMetrics(allScenarios);

expect(metrics.totalQueriesTested === 10, 'Metrics: 10 queries tested');
expect(metrics.queriesObserved === 9, 'Metrics: 9 observed (1 unobserved excluded from denominator)');
expect(metrics.unobservedQueriesCount === 1, 'Metrics: 1 unobserved query');
expect(metrics.queriesWithAnswer === 9, 'Metrics: 9 queries with answer');
expect(metrics.mentionRate === Number(((6 / 9) * 100).toFixed(1)), 'Metrics: Mention rate over observed (6/9 = 66.7%)');
expect(metrics.citationRate === Number(((4 / 9) * 100).toFixed(1)), 'Metrics: Citation rate over observed (sc4, sc5, sc6, sc9)');
expect(metrics.citationAccuracyRate === 75, 'Metrics: 75% citation accuracy (3 correct out of 4 cited)');
expect(metrics.averageAccuracy !== null && metrics.averageAccuracy > 0, 'Metrics: Average accuracy calculated over answered queries');
expect(metrics.claimsEvaluatedCount === 3, 'Metrics: 3 claims evaluated across dataset');
expect(metrics.byFailureCause.UNKNOWN_INSUFFICIENT_EVIDENCE === 1, 'Metrics: byFailureCause counts UNKNOWN_INSUFFICIENT_EVIDENCE');

// ─── 5. Phase 17: 12-Factor Diagnostic Attribution & Decision Engine Tests ───

const sampleQuery: BenchmarkQuery = {
  queryId: 'Q_TEST',
  query: 'How does India manage food security?',
  topic: 'Food Security',
  intent: 'policy_impact',
  targetSlug: 'food-security',
  targetUrl: 'https://thebreakdown.in/story/food-security',
  expectedCanonicalUrl: 'https://thebreakdown.in/story/food-security',
  keyFactsExpected: ['NFSA 2013', 'Buffer stock norms'],
  primarySourceTypes: ['Ministry notification', 'FCI report'],
  cadence: 'monthly',
};

// Test 5.1: NOT_OBSERVED with no signals defaults to UNKNOWN_INSUFFICIENT_EVIDENCE
const d1 = diagnoseRetrievalGap(sampleQuery, { observationState: 'NOT_OBSERVED' });
expect(d1 === 'UNKNOWN_INSUFFICIENT_EVIDENCE', 'Diag 5.1: Absence of retrieval without signals defaults to UNKNOWN_INSUFFICIENT_EVIDENCE');

// Test 5.2: NOT_OBSERVED with HTTP 404 => INDEXING_DISCOVERY_GAP
const d2 = diagnoseRetrievalGap(sampleQuery, { observationState: 'NOT_OBSERVED' }, {
  httpReachability: { status: 404, blockedByRobots: false }
});
expect(d2 === 'INDEXING_DISCOVERY_GAP', 'Diag 5.2: HTTP 404 maps to INDEXING_DISCOVERY_GAP');

// Test 5.3: NOT_OBSERVED with robots.txt block => INDEXING_DISCOVERY_GAP
const d3 = diagnoseRetrievalGap(sampleQuery, { observationState: 'NOT_OBSERVED' }, {
  httpReachability: { status: 200, blockedByRobots: true }
});
expect(d3 === 'INDEXING_DISCOVERY_GAP', 'Diag 5.3: Robots.txt blocked maps to INDEXING_DISCOVERY_GAP');

// Test 5.4: NOT_OBSERVED with indexProbe='not_indexed' => INDEXING_DISCOVERY_GAP
const d4 = diagnoseRetrievalGap(sampleQuery, { observationState: 'NOT_OBSERVED' }, {
  httpReachability: { status: 200 },
  indexProbe: 'not_indexed',
});
expect(d4 === 'INDEXING_DISCOVERY_GAP', 'Diag 5.4: Empirical not_indexed maps to INDEXING_DISCOVERY_GAP');

// Test 5.5: NOT_OBSERVED with indexProbe='indexed' => RANKING_RETRIEVAL_GAP
const d5 = diagnoseRetrievalGap(sampleQuery, { observationState: 'NOT_OBSERVED' }, {
  httpReachability: { status: 200 },
  canonicalMatch: true,
  contentKeywordMatch: true,
  primarySourceCount: 3,
  schemaValidity: true,
  indexProbe: 'indexed',
});
expect(d5 === 'RANKING_RETRIEVAL_GAP', 'Diag 5.5: Indexed but not retrieved maps to RANKING_RETRIEVAL_GAP');

// Test 5.6: NOT_OBSERVED with canonical mismatch => CANONICALIZATION_GAP
const d6 = diagnoseRetrievalGap(sampleQuery, { observationState: 'NOT_OBSERVED' }, {
  canonicalMatch: false,
});
expect(d6 === 'CANONICALIZATION_GAP', 'Diag 5.6: Canonical mismatch maps to CANONICALIZATION_GAP');

// Test 5.7: NOT_OBSERVED with invalid schema => STRUCTURED_DATA_GAP
const d7 = diagnoseRetrievalGap(sampleQuery, { observationState: 'NOT_OBSERVED' }, {
  canonicalMatch: true,
  schemaValidity: false,
});
expect(d7 === 'STRUCTURED_DATA_GAP', 'Diag 5.7: Invalid schema maps to STRUCTURED_DATA_GAP');

// Test 5.8: NOT_OBSERVED with keyword mismatch => CONTENT_GAP
const d8 = diagnoseRetrievalGap(sampleQuery, { observationState: 'NOT_OBSERVED' }, {
  canonicalMatch: true,
  schemaValidity: true,
  contentKeywordMatch: false,
});
expect(d8 === 'CONTENT_GAP', 'Diag 5.8: Content keyword mismatch maps to CONTENT_GAP');

// Test 5.9: NOT_OBSERVED with 0 primary sources => EVIDENCE_GAP
const d9 = diagnoseRetrievalGap(sampleQuery, { observationState: 'NOT_OBSERVED' }, {
  canonicalMatch: true,
  schemaValidity: true,
  contentKeywordMatch: true,
  primarySourceCount: 0,
});
expect(d9 === 'EVIDENCE_GAP', 'Diag 5.9: Missing primary sources maps to EVIDENCE_GAP');

// Test 5.10: OBSERVED_CORRECT_CITATION with contradicted evidence => REPRESENTATION_GAP
const d10 = diagnoseRetrievalGap(sampleQuery, {
  observationState: 'OBSERVED_CORRECT_CITATION',
  evidenceGrounding: 'contradicted',
});
expect(d10 === 'REPRESENTATION_GAP', 'Diag 5.10: Contradicted evidence maps to REPRESENTATION_GAP');

// Test 5.11: OBSERVED_CORRECT_CITATION with outdated freshness => FRESHNESS_GAP
const d11 = diagnoseRetrievalGap(sampleQuery, {
  observationState: 'OBSERVED_CORRECT_CITATION',
  freshness: 'outdated',
});
expect(d11 === 'FRESHNESS_GAP', 'Diag 5.11: Outdated freshness maps to FRESHNESS_GAP');

// Test 5.12: OBSERVED_MENTION_NO_CITATION with competitor presence => AUTHORITY_GAP
const d12 = diagnoseRetrievalGap(sampleQuery, {
  observationState: 'OBSERVED_MENTION_NO_CITATION',
}, {
  primarySourceCount: 5,
  competitorCitations: ['pib.gov.in', 'wikipedia.org'],
});
expect(d12 === 'AUTHORITY_GAP', 'Diag 5.12: Competitor citations displacing Breakdown maps to AUTHORITY_GAP');

// Test 5.13: OBSERVED_INCORRECT_CITATION => CANONICALIZATION_GAP
const d13 = diagnoseRetrievalGap(sampleQuery, {
  observationState: 'OBSERVED_INCORRECT_CITATION',
});
expect(d13 === 'CANONICALIZATION_GAP', 'Diag 5.13: Incorrect citation URL maps to CANONICALIZATION_GAP');

// ─── 6. Phase 18/22: 16 Canonical Adversarial Evidence Attribution & Decoupling Scenarios ─────

const baseSignals: Record<string, EvidenceSignal> = {
  http_status: { signal: 'http_status', value: 200, source: 'live', timestamp: new Date().toISOString(), method: 'http_probe', status: 'CONFIRMED', confidence: 1.0 },
  robots_permission: { signal: 'robots_permission', value: true, source: 'robots.txt', timestamp: new Date().toISOString(), method: 'html_parse', status: 'CONFIRMED', confidence: 1.0 },
  sitemap_declared: { signal: 'sitemap_declared', value: true, source: 'sitemap.xml', timestamp: new Date().toISOString(), method: 'html_parse', status: 'CONFIRMED', confidence: 1.0 },
  canonical_match: { signal: 'canonical_match', value: true, source: 'canonical', timestamp: new Date().toISOString(), method: 'html_parse', status: 'CONFIRMED', confidence: 1.0 },
  schema_validity: { signal: 'schema_validity', value: true, source: 'jsonld', timestamp: new Date().toISOString(), method: 'schema_validator', status: 'CONFIRMED', confidence: 1.0 },
  primary_sources_count: { signal: 'primary_sources_count', value: 3, source: 'metadata', timestamp: new Date().toISOString(), method: 'static_analysis', status: 'CONFIRMED', confidence: 1.0 },
  intent_coverage_rate: { signal: 'intent_coverage_rate', value: 90, source: 'semantic', timestamp: new Date().toISOString(), method: 'html_parse', status: 'CONFIRMED', confidence: 1.0 },
};

// Scenario 1: Google indexed + not retrieved (RANKING_RETRIEVAL_GAP candidate)
const adv1 = diagnoseEvidenceAttribution({
  indexStatus: 'INDEXED_CONFIRMED',
  searchRetrieval: 'NOT_RETRIEVED',
  mentionStatus: 'NOT_MENTIONED',
  citationStatus: 'UNCITED',
  claimGrounding: 'GROUNDING_UNKNOWN',
}, 100, 90, {
  ...baseSignals,
  google_index_status: { signal: 'google_index_status', value: 'INDEXED_CONFIRMED', source: 'gsc', timestamp: '', method: 'gsc_inspection', status: 'CONFIRMED', confidence: 0.95 },
});
expect(adv1.diagnosis === 'RANKING_RETRIEVAL_GAP', 'Adv 1: Google indexed + unretrieved is RANKING_RETRIEVAL_GAP');

// Scenario 2: Google not indexed (INDEXING_DISCOVERY_GAP)
const adv2 = diagnoseEvidenceAttribution({
  indexStatus: 'NOT_INDEXED_CONFIRMED',
  searchRetrieval: 'NOT_RETRIEVED',
  mentionStatus: 'NOT_MENTIONED',
  citationStatus: 'UNCITED',
  claimGrounding: 'GROUNDING_UNKNOWN',
}, 100, 90, {
  ...baseSignals,
  google_index_status: { signal: 'google_index_status', value: 'NOT_INDEXED_CONFIRMED', source: 'gsc', timestamp: '', method: 'gsc_inspection', status: 'CONFIRMED', confidence: 0.95 },
});
expect(adv2.diagnosis === 'INDEXING_DISCOVERY_GAP', 'Adv 2: Google not indexed confirms INDEXING_DISCOVERY_GAP');

// Scenario 3: Google unavailable (NOT_TESTED -> UNKNOWN_INSUFFICIENT_EVIDENCE)
const adv3 = diagnoseEvidenceAttribution({
  indexStatus: 'INDEX_STATUS_UNKNOWN',
  searchRetrieval: 'NOT_RETRIEVED',
  mentionStatus: 'NOT_MENTIONED',
  citationStatus: 'UNCITED',
  claimGrounding: 'GROUNDING_UNKNOWN',
}, 100, 90, {
  ...baseSignals,
  google_index_status: { signal: 'google_index_status', value: null, source: null, timestamp: '', method: 'gsc_inspection', status: 'NOT_TESTED', confidence: 0.0 },
});
expect(adv3.diagnosis === 'UNKNOWN_INSUFFICIENT_EVIDENCE', 'Adv 3: Google unavailable defaults to UNKNOWN_INSUFFICIENT_EVIDENCE');
expect(adv3.missingEvidence.length > 0, 'Adv 3: Mentions missing GSC telemetry');

// Scenario 4: Bing indexed + Google unknown (independent states)
const adv4 = diagnoseEvidenceAttribution({
  indexStatus: 'INDEX_STATUS_UNKNOWN',
  searchRetrieval: 'NOT_RETRIEVED',
  mentionStatus: 'NOT_MENTIONED',
  citationStatus: 'UNCITED',
  claimGrounding: 'GROUNDING_UNKNOWN',
}, 100, 90, {
  ...baseSignals,
  bing_index_status: { signal: 'bing_index_status', value: 'INDEXED_CONFIRMED', source: 'bing', timestamp: '', method: 'search_api', status: 'CONFIRMED', confidence: 0.90 },
  google_index_status: { signal: 'google_index_status', value: null, source: null, timestamp: '', method: 'gsc_inspection', status: 'NOT_TESTED', confidence: 0.0 },
});
expect(adv4.diagnosis === 'UNKNOWN_INSUFFICIENT_EVIDENCE', 'Adv 4: Bing indexed does not assume Google indexed; remains UNKNOWN');

// Scenario 5: Sitemap + Google not indexed (INDEXING_DISCOVERY_GAP)
const adv5 = diagnoseEvidenceAttribution({
  indexStatus: 'NOT_INDEXED_CONFIRMED',
  searchRetrieval: 'NOT_RETRIEVED',
  mentionStatus: 'NOT_MENTIONED',
  citationStatus: 'UNCITED',
  claimGrounding: 'GROUNDING_UNKNOWN',
}, 100, 90, {
  ...baseSignals,
  sitemap_declared: { signal: 'sitemap_declared', value: true, source: 'sitemap.xml', timestamp: '', method: 'html_parse', status: 'CONFIRMED', confidence: 1.0 },
  google_index_status: { signal: 'google_index_status', value: 'NOT_INDEXED_CONFIRMED', source: 'gsc', timestamp: '', method: 'gsc_inspection', status: 'CONFIRMED', confidence: 0.95 },
});
expect(adv5.diagnosis === 'INDEXING_DISCOVERY_GAP', 'Adv 5: Sitemap declared does not override confirmed unindexed status');

// Scenario 6: HTTP 200 + Google not indexed (INDEXING_DISCOVERY_GAP)
const adv6 = diagnoseEvidenceAttribution({
  indexStatus: 'NOT_INDEXED_CONFIRMED',
  searchRetrieval: 'NOT_RETRIEVED',
  mentionStatus: 'NOT_MENTIONED',
  citationStatus: 'UNCITED',
  claimGrounding: 'GROUNDING_UNKNOWN',
}, 100, 90, {
  ...baseSignals,
  http_status: { signal: 'http_status', value: 200, source: 'probe', timestamp: '', method: 'http_probe', status: 'CONFIRMED', confidence: 1.0 },
  google_index_status: { signal: 'google_index_status', value: 'NOT_INDEXED_CONFIRMED', source: 'gsc', timestamp: '', method: 'gsc_inspection', status: 'CONFIRMED', confidence: 0.95 },
});
expect(adv6.diagnosis === 'INDEXING_DISCOVERY_GAP', 'Adv 6: HTTP 200 does not override confirmed unindexed status');

// Scenario 7: Canonical correct + Google unknown (UNKNOWN_INSUFFICIENT_EVIDENCE)
const adv7 = diagnoseEvidenceAttribution({
  indexStatus: 'INDEX_STATUS_UNKNOWN',
  searchRetrieval: 'NOT_RETRIEVED',
  mentionStatus: 'NOT_MENTIONED',
  citationStatus: 'UNCITED',
  claimGrounding: 'GROUNDING_UNKNOWN',
}, 100, 90, {
  ...baseSignals,
  canonical_match: { signal: 'canonical_match', value: true, source: 'html', timestamp: '', method: 'html_parse', status: 'CONFIRMED', confidence: 1.0 },
  google_index_status: { signal: 'google_index_status', value: null, source: null, timestamp: '', method: 'gsc_inspection', status: 'NOT_TESTED', confidence: 0.0 },
});
expect(adv7.diagnosis === 'UNKNOWN_INSUFFICIENT_EVIDENCE', 'Adv 7: Canonical match does not prove indexation');

// Scenario 8: Wrong citation + canonical redirect works (CITATION_REDIRECT_RESOLVED)
const adv8 = diagnoseEvidenceAttribution({
  indexStatus: 'INDEXED_CONFIRMED',
  searchRetrieval: 'RETRIEVED',
  mentionStatus: 'MENTIONED',
  citationStatus: 'CITING_INCORRECT_URL',
  claimGrounding: 'GROUNDING_UNKNOWN',
}, 90, 85, {
  ...baseSignals,
  canonical_redirect: { signal: 'canonical_redirect', value: true, source: 'http_probe', timestamp: '', method: 'http_probe', status: 'CONFIRMED', confidence: 0.95 },
});
expect(adv8.diagnosis === 'CITATION_REDIRECT_RESOLVED', 'Adv 8: Wrong citation resolving via 301/308 redirect is CITATION_REDIRECT_RESOLVED');

// Scenario 9: Wrong citation + canonical conflict (CANONICALIZATION_GAP)
const adv9 = diagnoseEvidenceAttribution({
  indexStatus: 'INDEXED_CONFIRMED',
  searchRetrieval: 'RETRIEVED',
  mentionStatus: 'MENTIONED',
  citationStatus: 'CITING_INCORRECT_URL',
  claimGrounding: 'GROUNDING_UNKNOWN',
}, 90, 85, {
  ...baseSignals,
  canonical_conflict: { signal: 'canonical_conflict', value: true, source: 'html_parse', timestamp: '', method: 'html_parse', status: 'CONFIRMED', confidence: 0.95 },
});
expect(adv9.diagnosis === 'CANONICALIZATION_GAP', 'Adv 9: Wrong citation with canonical conflict is CANONICALIZATION_GAP');

// Scenario 10: Competitor citation without authority evidence (UNKNOWN_INSUFFICIENT_EVIDENCE / hypothesis)
const adv10 = diagnoseEvidenceAttribution({
  indexStatus: 'INDEX_STATUS_UNKNOWN',
  searchRetrieval: 'NOT_RETRIEVED',
  mentionStatus: 'NOT_MENTIONED',
  citationStatus: 'UNCITED',
  claimGrounding: 'GROUNDING_UNKNOWN',
}, 90, 85, {
  ...baseSignals,
  competitor_displacement: { signal: 'competitor_displacement', value: ['thehindu.com', 'reuters.com'], source: 'serp', timestamp: '', method: 'search_api', status: 'OBSERVED', confidence: 0.8 },
});
expect(adv10.diagnosis === 'UNKNOWN_INSUFFICIENT_EVIDENCE', 'Adv 10: Competitor citation without authority evidence remains UNKNOWN');

// Scenario 11: Competitor citation + measured authority evidence (AUTHORITY_GAP)
const adv11 = diagnoseEvidenceAttribution({
  indexStatus: 'INDEX_STATUS_UNKNOWN',
  searchRetrieval: 'NOT_RETRIEVED',
  mentionStatus: 'NOT_MENTIONED',
  citationStatus: 'UNCITED',
  claimGrounding: 'GROUNDING_UNKNOWN',
}, 90, 85, {
  ...baseSignals,
  competitor_displacement: { signal: 'competitor_displacement', value: ['thehindu.com'], source: 'serp', timestamp: '', method: 'search_api', status: 'OBSERVED', confidence: 0.8 },
  authority_gap_evidence: { signal: 'authority_gap_evidence', value: true, source: 'authority_data', timestamp: '', method: 'static_analysis', status: 'CONFIRMED', confidence: 0.9 },
});
expect(adv11.diagnosis === 'AUTHORITY_GAP', 'Adv 11: Competitor citation with measured authority evidence confirms AUTHORITY_GAP');

// Scenario 12: Local readiness 100% + external retrieval null (valid independent states)
const localScore100 = calculateLocalReadiness(baseSignals);
expect(localScore100 >= 95, 'Adv 12: Local readiness evaluates to ~100%');
const externalRetrievalNull: number | null = null;
expect(externalRetrievalNull === null, 'Adv 12: External retrieval remains null at T0 despite 100% local readiness');

// Scenario 13: Local readiness 50% + external retrieval observed (valid state)
const partialSignals: Record<string, EvidenceSignal> = {
  ...baseSignals,
  primary_sources_count: { signal: 'primary_sources_count', value: 0, source: 'none', timestamp: '', method: 'static_analysis', status: 'CONTRADICTED', confidence: 1.0 },
  intent_coverage_rate: { signal: 'intent_coverage_rate', value: 20, source: 'sem', timestamp: '', method: 'html_parse', status: 'CONTRADICTED', confidence: 0.9 },
};
const localScore50 = calculateLocalReadiness(partialSignals);
expect(localScore50 < 70, 'Adv 13: Local readiness reflects degraded technical state');
const adv13 = diagnoseEvidenceAttribution({
  indexStatus: 'INDEXED_CONFIRMED',
  searchRetrieval: 'RETRIEVED',
  mentionStatus: 'MENTIONED',
  citationStatus: 'CITING_CORRECT_CANONICAL',
  claimGrounding: 'GROUNDED',
}, localScore50, 20, partialSignals);
expect(adv13.diagnosis === 'UNKNOWN_INSUFFICIENT_EVIDENCE', 'Adv 13: External retrieval succeeded with grounded citation despite lower local readiness');

// Scenario 14: Conflicting Google/Bing status (independent reporting)
const adv14Bing = diagnoseEvidenceAttribution({
  indexStatus: 'INDEXED_CONFIRMED',
  searchRetrieval: 'NOT_RETRIEVED',
  mentionStatus: 'NOT_MENTIONED',
  citationStatus: 'UNCITED',
  claimGrounding: 'GROUNDING_UNKNOWN',
}, 100, 90, {
  ...baseSignals,
  bing_index_status: { signal: 'bing_index_status', value: 'INDEXED_CONFIRMED', source: 'bing', timestamp: '', method: 'search_api', status: 'CONFIRMED', confidence: 0.90 },
});
expect(adv14Bing.diagnosis === 'RANKING_RETRIEVAL_GAP', 'Adv 14: Bing indexed but unretrieved evaluates as RANKING_RETRIEVAL_GAP');

const adv14Google = diagnoseEvidenceAttribution({
  indexStatus: 'NOT_INDEXED_CONFIRMED',
  searchRetrieval: 'NOT_RETRIEVED',
  mentionStatus: 'NOT_MENTIONED',
  citationStatus: 'UNCITED',
  claimGrounding: 'GROUNDING_UNKNOWN',
}, 100, 90, {
  ...baseSignals,
  google_index_status: { signal: 'google_index_status', value: 'NOT_INDEXED_CONFIRMED', source: 'gsc', timestamp: '', method: 'gsc_inspection', status: 'CONFIRMED', confidence: 0.95 },
});
expect(adv14Google.diagnosis === 'INDEXING_DISCOVERY_GAP', 'Adv 14: Google not indexed simultaneously evaluates as INDEXING_DISCOVERY_GAP');

// Scenario 15: Stale external evidence detection
const staleValidation = validateExternalEvidenceImport({
  queryId: 'Q001',
  targetUrl: 'https://thebreakdown.in/stories/delhi-air-pollution-emergency',
  source: 'stale_export',
  timestamp: 'invalid-date-string-here',
  googleIndexStatus: 'INDEXED_CONFIRMED',
});
expect(!staleValidation.valid, 'Adv 15: Rejects invalid or corrupt timestamp');
expect(staleValidation.errors.some(e => e.includes('timestamp')), 'Adv 15: Flags timestamp format error');

// Scenario 16: Malformed imported evidence rejection
const malformedImport1 = validateExternalEvidenceImport(null);
expect(!malformedImport1.valid, 'Adv 16: Rejects null import payload');

const malformedImport2 = validateExternalEvidenceImport({
  queryId: '',
  targetUrl: 'not-a-url',
  source: '',
  googleIndexStatus: 'INVALID_ENUM_VALUE',
});
expect(!malformedImport2.valid, 'Adv 16: Rejects empty queryId, invalid URL, missing source, and invalid status');
expect(malformedImport2.errors.length >= 4, 'Adv 16: Returns all 4 distinct validation errors');

console.log('==================================================');
console.log(`Passed stress assertions: ${passCount}`);
if (failCount > 0) {
  console.error(`Failed stress assertions: ${failCount}`);
  process.exit(1);
} else {
  console.log('🎉 All Adversarial Stress Tests for GEO Measurement passed!\n');
  process.exit(0);
}

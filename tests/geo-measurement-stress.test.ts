/**
 * tests/geo-measurement-stress.test.ts
 * Adversarial & Stress Testing Suite for GEO Measurement Engine.
 *
 * Governing documents:
 *   - docs/aeo-geo/architecture.md (Phase 9 & 12 — GEO Measurement)
 *   - docs/aeo-geo/11-measurement-baseline.md (Representation Integrity)
 */

import geoQuerySet from '../data/geo-query-set.json';
import {
  computeGEOMetrics,
  validateObservation,
  type AIVisibilityObservation,
} from '../lib/seo/geo-measurement';
import { getPublicStory } from '../utils/data-layer/store';
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

for (const q of geoQuerySet) {
  expect(!seenQueryIds.has(q.queryId), 'Unique Query ID', `Duplicate ID: ${q.queryId}`);
  seenQueryIds.add(q.queryId);

  expect(!seenQueries.has(q.query.toLowerCase()), 'Unique Query Text', `Duplicate text: ${q.query}`);
  seenQueries.add(q.query.toLowerCase());

  expect(q.query.endsWith('?'), 'Query Formatted as Question', q.query);
  expect(isSafePublicUrl(q.targetUrl), 'Query Target URL is safe', q.targetUrl);
  expect(q.keyFactsExpected.length >= 2, 'Query has minimum 2 key facts', q.queryId);
  expect(q.primarySourceTypes.length >= 1, 'Query has expected source types', q.queryId);
}

// ─── 2. Adversarial Observation Stress Scenarios ──────────────────────────────

// Scenario A: Perfect Answer
const scA: AIVisibilityObservation = {
  engine: 'perplexity',
  query: 'What happened in 1962?',
  queryId: 'Q001',
  observedAt: new Date().toISOString(),
  mentioned: true,
  cited: true,
  citationUrl: 'https://thebreakdown.in/story/indias-inheritance',
  citationCorrect: true,
  answerAccuracy: 4,
};
expect(validateObservation(scA).valid, 'Scenario A: Perfect observation passes validation');

// Scenario B: Partially correct, un-cited
const scB: AIVisibilityObservation = {
  engine: 'chatgpt',
  query: 'What happened in 1962?',
  queryId: 'Q001',
  observedAt: new Date().toISOString(),
  mentioned: true,
  cited: false,
  answerAccuracy: 2,
};
expect(validateObservation(scB).valid, 'Scenario B: Partially correct un-cited observation passes validation');

// Scenario C: Correct answer, wrong source citation
const scC: AIVisibilityObservation = {
  engine: 'copilot',
  query: 'What happened in 1962?',
  queryId: 'Q001',
  observedAt: new Date().toISOString(),
  mentioned: true,
  cited: true,
  citationUrl: 'https://thebreakdown.in/story/wrong-story',
  citationCorrect: false,
  answerAccuracy: 3,
};
expect(validateObservation(scC).valid, 'Scenario C: Wrong source observation passes validation');

// Scenario D: Correct source cited, but wrong claim / hallucination
const scD: AIVisibilityObservation = {
  engine: 'gemini',
  query: 'What happened in 1962?',
  queryId: 'Q001',
  observedAt: new Date().toISOString(),
  mentioned: true,
  cited: true,
  citationUrl: 'https://thebreakdown.in/story/indias-inheritance',
  citationCorrect: true,
  answerAccuracy: 1,
};
expect(validateObservation(scD).valid, 'Scenario D: Hallucinated claim observation passes validation');

// Scenario E: Malformed observation validation
const scE1 = validateObservation({ engine: 'perplexity', query: 'test', cited: true, citationUrl: 'javascript:void(0)' });
expect(!scE1.valid, 'Scenario E1: Rejects unsafe citationUrl');

const scE2 = validateObservation({ engine: 'perplexity', query: 'test', answerAccuracy: 5 as any });
expect(!scE2.valid, 'Scenario E2: Rejects out-of-range accuracy score');

const scE3 = validateObservation({ engine: undefined as any, query: 'test' });
expect(!scE3.valid, 'Scenario E3: Rejects missing engine');

// ─── 3. Catastrophic Failure Masking Detection ───────────────────────────────

// 10 observations where 100% cited, but 0% factual accuracy (severe AI hallucination)
const catastrophicDataset: AIVisibilityObservation[] = Array.from({ length: 10 }, (_, i) => ({
  engine: 'perplexity' as const,
  query: `Adversarial Query ${i}`,
  queryId: `Q_ADV_${i}`,
  observedAt: new Date().toISOString(),
  mentioned: true,
  cited: true,
  citationUrl: 'https://thebreakdown.in/story/test',
  citationCorrect: true,
  answerAccuracy: 0 as const, // Total hallucination
}));

const catMetrics = computeGEOMetrics(catastrophicDataset);
expect(catMetrics.citationRate === 100, 'Catastrophic test: Citation rate is 100%');
expect(catMetrics.averageAccuracy === 0, 'Catastrophic test: Average accuracy is 0 (NOT masked by high citation)');

// Mixed dataset metrics verification
const mixed = computeGEOMetrics([scA, scB, scC, scD]);
expect(mixed.totalObservations === 4, 'Mixed: 4 observations');
expect(mixed.mentionRate === 100, 'Mixed: 100% mention rate');
expect(mixed.citationRate === 75, 'Mixed: 75% citation rate (3/4)');
expect(mixed.citationAccuracyRate === (2 / 3) * 100, 'Mixed: 66.67% citation accuracy rate (2/3)');
expect(mixed.averageAccuracy === 2.5, 'Mixed: 2.5 average accuracy ((4+2+3+1)/4)');

console.log('==================================================');
console.log(`Passed stress assertions: ${passCount}`);
if (failCount > 0) {
  console.error(`Failed stress assertions: ${failCount}`);
  process.exit(1);
} else {
  console.log('🎉 All Adversarial Stress Tests for GEO Measurement passed!\n');
  process.exit(0);
}

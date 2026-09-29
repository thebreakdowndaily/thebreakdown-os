/**
 * lib/seo/geo-measurement.ts
 * Generative Engine Optimization (GEO) & AEO Measurement System.
 *
 * Governing documents:
 *   - docs/aeo-geo/architecture.md (Phase 12 — GEO Measurement Foundation)
 *   - docs/aeo-geo/11-measurement-baseline.md (Metrics & Schema)
 *   - Editorial Constitution §XIII & §XIV (Verification & Quality Gates)
 *
 * Provides:
 *   - Strong types for AI visibility observations
 *   - Accuracy scoring rubric evaluation (0 to 4 scale)
 *   - Benchmark query set loader and validator
 *   - Aggregate calculation (mention rate, citation rate, accuracy rate)
 *   - Client helper for recording spot-check observations
 */

import { isSafePublicUrl } from '@/lib/seo/jsonld';

export type AIEngine =
  | 'chatgpt'
  | 'gemini'
  | 'perplexity'
  | 'copilot'
  | 'google_ai_overview'
  | 'claude'
  | 'other';

/**
 * 0: Factually incorrect about the topic
 * 1: Materially incomplete — omits key facts The Breakdown reported
 * 2: Mostly correct but misses nuance or context from The Breakdown
 * 3: Correct and matches what The Breakdown reported
 * 4: Correct, matches The Breakdown, and cites The Breakdown
 */
export type AccuracyScore = 0 | 1 | 2 | 3 | 4;

export interface BenchmarkQuery {
  queryId: string;
  query: string;
  topic: string;
  targetSlug: string;
  targetUrl: string;
  keyFactsExpected: string[];
  primarySourceTypes: string[];
  cadence: 'weekly' | 'monthly';
}

export interface AIVisibilityObservation {
  id?: string;
  engine: AIEngine;
  query: string;
  queryId?: string;
  observedAt: string;
  storyId?: string;
  mentioned: boolean;
  cited: boolean;
  citationUrl?: string;
  citationCorrect?: boolean;
  answerAccuracy?: AccuracyScore;
  notes?: string;
  observer?: string;
}

export interface GEOMetricsSummary {
  totalObservations: number;
  mentionRate: number;       // % queries where The Breakdown was mentioned
  citationRate: number;      // % queries where The Breakdown was cited
  citationAccuracyRate: number; // % of cited queries where URL was correct
  averageAccuracy: number;   // Average accuracy score (0-4)
  byEngine: Record<AIEngine, {
    count: number;
    mentionRate: number;
    citationRate: number;
    averageAccuracy: number;
  }>;
}

/**
 * Validates an observation before persistence.
 */
export function validateObservation(obs: Partial<AIVisibilityObservation>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (!obs.engine) errors.push('engine is required');
  if (!obs.query || obs.query.trim().length === 0) errors.push('query is required');
  if (obs.cited && !obs.citationUrl) errors.push('citationUrl is required when cited is true');
  if (obs.citationUrl && !isSafePublicUrl(obs.citationUrl)) {
    errors.push('citationUrl must be a valid public HTTP(S) URL');
  }
  if (obs.answerAccuracy !== undefined && (obs.answerAccuracy < 0 || obs.answerAccuracy > 4)) {
    errors.push('answerAccuracy must be an integer between 0 and 4');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Calculates aggregate GEO performance metrics from a set of observations.
 * Explicitly avoids composite vanity scores, reporting discrete dimensional rates.
 */
export function computeGEOMetrics(observations: AIVisibilityObservation[]): GEOMetricsSummary {
  const total = observations.length;
  if (total === 0) {
    return {
      totalObservations: 0,
      mentionRate: 0,
      citationRate: 0,
      citationAccuracyRate: 0,
      averageAccuracy: 0,
      byEngine: {} as GEOMetricsSummary['byEngine'],
    };
  }

  const mentions = observations.filter((o) => o.mentioned).length;
  const citations = observations.filter((o) => o.cited).length;
  const accurateCitations = observations.filter((o) => o.cited && o.citationCorrect).length;

  const scoredObservations = observations.filter((o) => o.answerAccuracy !== undefined);
  const totalScore = scoredObservations.reduce((acc, o) => acc + (o.answerAccuracy ?? 0), 0);
  const avgAccuracy = scoredObservations.length > 0 ? totalScore / scoredObservations.length : 0;

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
    if (engObs.length > 0) {
      const engMentions = engObs.filter((o) => o.mentioned).length;
      const engCitations = engObs.filter((o) => o.cited).length;
      const engScored = engObs.filter((o) => o.answerAccuracy !== undefined);
      const engTotalScore = engScored.reduce((acc, o) => acc + (o.answerAccuracy ?? 0), 0);

      byEngine[eng] = {
        count: engObs.length,
        mentionRate: (engMentions / engObs.length) * 100,
        citationRate: (engCitations / engObs.length) * 100,
        averageAccuracy: engScored.length > 0 ? engTotalScore / engScored.length : 0,
      };
    }
  }

  return {
    totalObservations: total,
    mentionRate: (mentions / total) * 100,
    citationRate: (citations / total) * 100,
    citationAccuracyRate: citations > 0 ? (accurateCitations / citations) * 100 : 0,
    averageAccuracy: Number(avgAccuracy.toFixed(2)),
    byEngine,
  };
}

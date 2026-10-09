/**
 * ─── Empirical Benchmark & Detection Advantage Engine ─────────────────────────
 *
 * Governing document: AGENTS.md (Platform Beta)
 * Phase 7: Evidence-Grade Production Benchmark & Measurement Integrity
 *
 * Evaluates real-world event detection recall, latency, and true publication lead times:
 *   - Strictly separates detection latency from publication lead time
 *   - Computes Wilson Score 95% Confidence Intervals for proportion metrics
 *   - Enforces deterministic recalculation and audit integrity
 *   - Classifies sample-size interpretation (DESCRIPTIVE_PILOT_ONLY vs STATISTICALLY_INTERPRETABLE)
 */

import type { RealWorldEvent } from '@/data/radar/real-world-events';

export type MissedEventTaxonomy =
  | 'NO_SOURCE'
  | 'SOURCE_TOO_SLOW'
  | 'SOURCE_FAILURE'
  | 'COLLECTOR_FAILURE'
  | 'CHANGE_DETECTION_FAILURE'
  | 'PARSING_FAILURE'
  | 'EVENT_EXTRACTION_FAILURE'
  | 'ENTITY_RESOLUTION_FAILURE'
  | 'GEO_RESOLUTION_FAILURE'
  | 'DEDUP_FAILURE'
  | 'PIPELINE_FAILURE'
  | 'VERIFICATION_DELAY';

export interface EmpiricalLatencyBreakdown {
  detectionLatencyMinutes: number | null;     // sourcePublished → firstDetected
  verificationLatencyMinutes: number | null;  // firstDetected → verified
  publicationLatencyMinutes: number | null;   // verified → published
  totalPipelineMinutes: number | null;        // sourcePublished → published
  truePublicationLeadMinutes: number | null;  // controlPublication - radarPublished
}

export interface ConfidenceInterval {
  lower: number;
  upper: number;
  confidenceLevel: number;
}

export interface EmpiricalBenchmarkResult {
  totalEvents: number;
  detectedCount: number;
  verifiedCount: number;
  publishedCount: number;
  missedCount: number;
  recallRate: number;
  recall95CI: ConfidenceInterval;
  falseNegativeRate: number;
  falsePositiveCount: number;
  falsePositiveRate: number;
  falsePositive95CI: ConfidenceInterval;
  sampleInterpretation: 'DESCRIPTIVE_PILOT_ONLY' | 'STATISTICALLY_INTERPRETABLE';
  p50DetectionMinutes: number | null;
  p90DetectionMinutes: number | null;
  p95DetectionMinutes: number | null;
  latencies: EmpiricalLatencyBreakdown;
  countryRecall: Record<string, { total: number; detected: number; recall: number }>;
  beatRecall: Record<string, { total: number; detected: number; recall: number }>;
  missedTaxonomyBreakdown: Record<MissedEventTaxonomy, number>;
}

export interface IntegrityComparison {
  metric: string;
  reported: number | string | null;
  recomputed: number | string | null;
  match: boolean;
}

export class EmpiricalBenchmarkEngine {
  public evaluateCorpus(
    corpus: RealWorldEvent[],
    falsePositiveObservations = 0
  ): EmpiricalBenchmarkResult {
    const totalEvents = corpus.length;
    const detected = corpus.filter((e) => e.isDetected && e.theBreakdownFirstDetectedTimestamp);
    const verified = corpus.filter((e) => e.theBreakdownVerifiedTimestamp);
    const published = corpus.filter((e) => e.theBreakdownPublishedTimestamp);
    const missed = corpus.filter((e) => !e.isDetected);

    const detectionLatencies: number[] = [];
    const verificationLatencies: number[] = [];
    const publicationLatencies: number[] = [];
    const totalPipelineLatencies: number[] = [];
    const publicationLeads: number[] = [];

    const countryMap: Record<string, { total: number; detected: number }> = {};
    const beatMap: Record<string, { total: number; detected: number }> = {};

    const missedTaxonomy: Record<MissedEventTaxonomy, number> = {
      NO_SOURCE: 0,
      SOURCE_TOO_SLOW: 0,
      SOURCE_FAILURE: 0,
      COLLECTOR_FAILURE: 0,
      CHANGE_DETECTION_FAILURE: 0,
      PARSING_FAILURE: 0,
      EVENT_EXTRACTION_FAILURE: 0,
      ENTITY_RESOLUTION_FAILURE: 0,
      GEO_RESOLUTION_FAILURE: 0,
      DEDUP_FAILURE: 0,
      PIPELINE_FAILURE: 0,
      VERIFICATION_DELAY: 0,
    };

    for (const event of corpus) {
      countryMap[event.country] = countryMap[event.country] || { total: 0, detected: 0 };
      countryMap[event.country].total++;

      beatMap[event.beat] = beatMap[event.beat] || { total: 0, detected: 0 };
      beatMap[event.beat].total++;

      if (event.isDetected && event.theBreakdownFirstDetectedTimestamp) {
        countryMap[event.country].detected++;
        beatMap[event.beat].detected++;

        const pubMs = new Date(event.sourcePublicationTimestamp).getTime();
        const detMs = new Date(event.theBreakdownFirstDetectedTimestamp).getTime();
        const detMins = Math.max(0, Math.round((detMs - pubMs) / (1000 * 60)));
        detectionLatencies.push(detMins);

        if (event.theBreakdownVerifiedTimestamp) {
          const verMs = new Date(event.theBreakdownVerifiedTimestamp).getTime();
          verificationLatencies.push(Math.max(0, Math.round((verMs - detMs) / (1000 * 60))));

          if (event.theBreakdownPublishedTimestamp) {
            const publMs = new Date(event.theBreakdownPublishedTimestamp).getTime();
            publicationLatencies.push(Math.max(0, Math.round((publMs - verMs) / (1000 * 60))));
            totalPipelineLatencies.push(Math.max(0, Math.round((publMs - pubMs) / (1000 * 60))));

            if (event.controlBenchmarkPublicationTimestamp) {
              const ctrlMs = new Date(event.controlBenchmarkPublicationTimestamp).getTime();
              // Positive = The Breakdown published ahead of control
              publicationLeads.push(Math.round((ctrlMs - publMs) / (1000 * 60)));
            }
          }
        }
      } else {
        const reason = (event.missClassification as MissedEventTaxonomy) || 'NO_SOURCE';
        if (missedTaxonomy[reason] !== undefined) {
          missedTaxonomy[reason]++;
        } else {
          missedTaxonomy.NO_SOURCE++;
        }
      }
    }

    detectionLatencies.sort((a, b) => a - b);
    const percentile = (arr: number[], p: number) =>
      arr.length > 0 ? arr[Math.min(Math.floor(arr.length * p), arr.length - 1)] : null;
    const mean = (arr: number[]) =>
      arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null;

    const recallRate = totalEvents > 0 ? Math.round((detected.length / totalEvents) * 100) / 100 : 0;
    const totalSignals = detected.length + falsePositiveObservations;
    const falsePositiveRate = totalSignals > 0 ? Math.round((falsePositiveObservations / totalSignals) * 100) / 100 : 0;

    const recall95CI = this.calculateWilsonScoreInterval(detected.length, totalEvents);
    const falsePositive95CI = this.calculateWilsonScoreInterval(falsePositiveObservations, totalSignals);

    const countryRecall: EmpiricalBenchmarkResult['countryRecall'] = {};
    for (const [c, counts] of Object.entries(countryMap)) {
      countryRecall[c] = {
        total: counts.total,
        detected: counts.detected,
        recall: counts.total > 0 ? Math.round((counts.detected / counts.total) * 100) / 100 : 0,
      };
    }

    const beatRecall: EmpiricalBenchmarkResult['beatRecall'] = {};
    for (const [b, counts] of Object.entries(beatMap)) {
      beatRecall[b] = {
        total: counts.total,
        detected: counts.detected,
        recall: counts.total > 0 ? Math.round((counts.detected / counts.total) * 100) / 100 : 0,
      };
    }

    return {
      totalEvents,
      detectedCount: detected.length,
      verifiedCount: verified.length,
      publishedCount: published.length,
      missedCount: missed.length,
      recallRate,
      recall95CI,
      falseNegativeRate: Math.round((1 - recallRate) * 100) / 100,
      falsePositiveCount: falsePositiveObservations,
      falsePositiveRate,
      falsePositive95CI,
      sampleInterpretation: totalEvents < 30 ? 'DESCRIPTIVE_PILOT_ONLY' : 'STATISTICALLY_INTERPRETABLE',
      p50DetectionMinutes: percentile(detectionLatencies, 0.5),
      p90DetectionMinutes: percentile(detectionLatencies, 0.9),
      p95DetectionMinutes: percentile(detectionLatencies, 0.95),
      latencies: {
        detectionLatencyMinutes: mean(detectionLatencies),
        verificationLatencyMinutes: mean(verificationLatencies),
        publicationLatencyMinutes: mean(publicationLatencies),
        totalPipelineMinutes: mean(totalPipelineLatencies),
        truePublicationLeadMinutes: mean(publicationLeads),
      },
      countryRecall,
      beatRecall,
      missedTaxonomyBreakdown: missedTaxonomy,
    };
  }

  /**
   * Computes the Wilson score 95% confidence interval for a binomial proportion.
   */
  public calculateWilsonScoreInterval(successes: number, total: number): ConfidenceInterval {
    if (total === 0) return { lower: 0, upper: 0, confidenceLevel: 0.95 };
    const z = 1.95996; // 95% confidence
    const p = successes / total;
    const denominator = 1 + (z * z) / total;
    const centerAdjusted = p + (z * z) / (2 * total);
    const rad = z * Math.sqrt((p * (1 - p)) / total + (z * z) / (4 * total * total));

    const lower = Math.max(0, Math.round(((centerAdjusted - rad) / denominator) * 1000) / 1000);
    const upper = Math.min(1, Math.round(((centerAdjusted + rad) / denominator) * 1000) / 1000);

    return { lower, upper, confidenceLevel: 0.95 };
  }

  /**
   * Deterministically audits reported metrics against raw recalculation.
   */
  public auditIntegrity(
    reported: EmpiricalBenchmarkResult,
    corpus: RealWorldEvent[],
    falsePositiveObservations = 0
  ): IntegrityComparison[] {
    const recomputed = this.evaluateCorpus(corpus, falsePositiveObservations);
    return [
      { metric: 'totalEvents', reported: reported.totalEvents, recomputed: recomputed.totalEvents, match: reported.totalEvents === recomputed.totalEvents },
      { metric: 'detectedCount', reported: reported.detectedCount, recomputed: recomputed.detectedCount, match: reported.detectedCount === recomputed.detectedCount },
      { metric: 'missedCount', reported: reported.missedCount, recomputed: recomputed.missedCount, match: reported.missedCount === recomputed.missedCount },
      { metric: 'recallRate', reported: reported.recallRate, recomputed: recomputed.recallRate, match: reported.recallRate === recomputed.recallRate },
      { metric: 'p50DetectionMinutes', reported: reported.p50DetectionMinutes, recomputed: recomputed.p50DetectionMinutes, match: reported.p50DetectionMinutes === recomputed.p50DetectionMinutes },
      { metric: 'p90DetectionMinutes', reported: reported.p90DetectionMinutes, recomputed: recomputed.p90DetectionMinutes, match: reported.p90DetectionMinutes === recomputed.p90DetectionMinutes },
      { metric: 'meanDetectionLatency', reported: reported.latencies.detectionLatencyMinutes, recomputed: recomputed.latencies.detectionLatencyMinutes, match: reported.latencies.detectionLatencyMinutes === recomputed.latencies.detectionLatencyMinutes },
      { metric: 'meanVerificationLatency', reported: reported.latencies.verificationLatencyMinutes, recomputed: recomputed.latencies.verificationLatencyMinutes, match: reported.latencies.verificationLatencyMinutes === recomputed.latencies.verificationLatencyMinutes },
      { metric: 'meanPublicationLatency', reported: reported.latencies.publicationLatencyMinutes, recomputed: recomputed.latencies.publicationLatencyMinutes, match: reported.latencies.publicationLatencyMinutes === recomputed.latencies.publicationLatencyMinutes },
      { metric: 'meanPublicationLead', reported: reported.latencies.truePublicationLeadMinutes, recomputed: recomputed.latencies.truePublicationLeadMinutes, match: reported.latencies.truePublicationLeadMinutes === recomputed.latencies.truePublicationLeadMinutes },
    ];
  }
}

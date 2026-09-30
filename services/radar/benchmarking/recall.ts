/**
 * ─── Radar Missed-Event Recall Benchmarking Engine ───────────────────────────
 *
 * Quantifies detection coverage against a known universe of ground-truth events.
 * Computes:
 *   - Recall % (detected / total expected events)
 *   - Precision / Matched Clusters
 *   - Mean Time To Detect (MTTD) in minutes
 *   - Missed Event Gap Analysis (categorizing missing beats / geographic dead-zones)
 */

import type { StoryCluster } from '@/types/newsroom-intelligence';

export interface GroundTruthEvent {
  id: string;
  title: string;
  occurredAt: string;
  location: string;
  beat: string;
  keywords: string[];
  mandatoryEntities?: string[];
}

export type MissClassification =
  | 'NO_SOURCE'
  | 'SOURCE_TOO_SLOW'
  | 'SOURCE_FAILURE'
  | 'COLLECTOR_FAILURE'
  | 'CHANGE_DETECTION_FAILURE'
  | 'EXTRACTION_FAILURE'
  | 'ENTITY_FAILURE'
  | 'GEO_FAILURE'
  | 'DEDUP_FAILURE'
  | 'PIPELINE_FAILURE'
  | 'GEOGRAPHIC_GAP'
  | 'SOURCE_ABSENT';

export interface MatchResult {
  groundTruthId: string;
  matchedClusterId?: string;
  detectedAt?: string;
  detectionLatencyMinutes?: number;
  status: 'DETECTED' | 'MISSED';
  missReason?: MissClassification;
}

export interface RecallBenchmarkReport {
  timestamp: string;
  totalGroundTruth: number;
  totalDetected: number;
  totalMissed: number;
  recallRate: number; // 0.0 - 1.0
  meanTimeToDetectMinutes: number | null;
  p90TimeToDetectMinutes: number | null;
  results: MatchResult[];
  beatBreakdown: Record<string, { total: number; detected: number; recall: number }>;
}

export class RadarRecallBenchmark {
  /**
   * Benchmarks a collection of detected StoryClusters against a ground truth universe.
   */
  public evaluate(
    groundTruth: GroundTruthEvent[],
    clusters: StoryCluster[]
  ): RecallBenchmarkReport {
    const results: MatchResult[] = [];
    const latencies: number[] = [];
    const beatMap: Record<string, { total: number; detected: number }> = {};

    for (const gt of groundTruth) {
      if (!beatMap[gt.beat]) {
        beatMap[gt.beat] = { total: 0, detected: 0 };
      }
      beatMap[gt.beat].total++;

      const match = this.findMatchingCluster(gt, clusters);

      if (match) {
        beatMap[gt.beat].detected++;
        const occurredMs = new Date(gt.occurredAt).getTime();
        const detectedMs = new Date(match.firstDetectedAt).getTime();
        const latencyMinutes = Math.max(0, Math.round((detectedMs - occurredMs) / (1000 * 60)));

        latencies.push(latencyMinutes);
        results.push({
          groundTruthId: gt.id,
          matchedClusterId: match.id,
          detectedAt: match.firstDetectedAt,
          detectionLatencyMinutes: latencyMinutes,
          status: 'DETECTED',
        });
      } else {
        results.push({
          groundTruthId: gt.id,
          status: 'MISSED',
          missReason: this.diagnoseMissReason(gt),
        });
      }
    }

    const totalGroundTruth = groundTruth.length;
    const totalDetected = results.filter((r) => r.status === 'DETECTED').length;
    const totalMissed = totalGroundTruth - totalDetected;
    const recallRate = totalGroundTruth > 0 ? Math.round((totalDetected / totalGroundTruth) * 100) / 100 : 0;

    latencies.sort((a, b) => a - b);
    const meanTimeToDetectMinutes =
      latencies.length > 0 ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : null;
    const p90TimeToDetectMinutes =
      latencies.length > 0 ? latencies[Math.floor(latencies.length * 0.9)] : null;

    const beatBreakdown: RecallBenchmarkReport['beatBreakdown'] = {};
    for (const [beat, counts] of Object.entries(beatMap)) {
      beatBreakdown[beat] = {
        total: counts.total,
        detected: counts.detected,
        recall: counts.total > 0 ? Math.round((counts.detected / counts.total) * 100) / 100 : 0,
      };
    }

    return {
      timestamp: new Date().toISOString(),
      totalGroundTruth,
      totalDetected,
      totalMissed,
      recallRate,
      meanTimeToDetectMinutes,
      p90TimeToDetectMinutes,
      results,
      beatBreakdown,
    };
  }

  private findMatchingCluster(gt: GroundTruthEvent, clusters: StoryCluster[]): StoryCluster | null {
    const gtText = `${gt.title} ${gt.keywords.join(' ')} ${gt.location}`.toLowerCase();

    for (const cluster of clusters) {
      const clusterText = `${cluster.title} ${cluster.summary}`.toLowerCase();

      // Check keyword match
      const matchedKeywords = gt.keywords.filter((kw) => clusterText.includes(kw.toLowerCase()));
      const keywordOverlapRatio = gt.keywords.length > 0 ? matchedKeywords.length / gt.keywords.length : 0;

      // Check entity match
      let entityMatch = true;
      if (gt.mandatoryEntities && gt.mandatoryEntities.length > 0) {
        entityMatch = gt.mandatoryEntities.some((entity) =>
          cluster.entities?.some((ce) => ce.toLowerCase().includes(entity.toLowerCase()))
        );
      }

      // Check geographic match
      const geoMatch =
        cluster.geographicSpread.some((g) => g.toLowerCase().includes(gt.location.toLowerCase())) ||
        clusterText.includes(gt.location.toLowerCase());

      if (keywordOverlapRatio >= 0.5 && entityMatch && geoMatch) {
        return cluster;
      }
    }

    return null;
  }

  private diagnoseMissReason(gt: GroundTruthEvent): MatchResult['missReason'] {
    if (gt.location === 'unknown' || !gt.location) {
      return 'GEOGRAPHIC_GAP';
    }
    return 'SOURCE_ABSENT';
  }
}

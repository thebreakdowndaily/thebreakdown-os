import type { RadarSourceDefinition, RadarSourceHealth } from '../types';
import type { SourceValueDimensions } from './types';
import type { StoryCluster } from '@/types/newsroom-intelligence';

export interface SourceValueContext {
  allSources: RadarSourceDefinition[];
  healthMap: Map<string, RadarSourceHealth>;
  clusters: StoryCluster[];
}

export class SourceValueCalculator {
  /**
   * Computes multi-dimensional source value profile preserving distinct operational vectors.
   * Does NOT reduce to an arbitrary scalar 'quality score'.
   */
  public evaluate(
    source: RadarSourceDefinition,
    context: SourceValueContext
  ): SourceValueDimensions {
    const health = context.healthMap.get(source.id);

    // 1. Authority Weight (Official/Primary = 1.0, Judicial = 0.95, General Media = 0.4)
    let authorityWeight = 0.4;
    if (source.authorityClass === 'PRIMARY' || source.officialStatus === 'official_primary') {
      authorityWeight = 1.0;
    } else if (source.authorityClass === 'JUDICIAL') {
      authorityWeight = 0.95;
    } else if (source.authorityClass === 'REGULATORY' || source.officialStatus === 'institutional') {
      authorityWeight = 0.8;
    } else if (source.authorityClass === 'SPECIALIST_MEDIA') {
      authorityWeight = 0.6;
    }

    // 2. Coverage Uniqueness (Is this the only sensor for this district + beat?)
    const sameDistrictAndBeat = context.allSources.filter(
      (s) => s.id !== source.id && s.district === source.district && s.beat === source.beat
    );
    const coverageUniqueness = sameDistrictAndBeat.length === 0 ? 1.0 : Math.round((1 / (sameDistrictAndBeat.length + 1)) * 100) / 100;

    // 3. Event Yield (Clusters originated or cited)
    const matchingClusters = context.clusters.filter((c) => c.sourceIds.includes(source.id));
    const eventYield = matchingClusters.length;

    // 4. Change Frequency Score
    const totalFetches = health?.totalFetches || 0;
    const totalChanges = health?.totalChanges || 0;
    const changeFrequencyScore = totalFetches > 0 ? Math.round((totalChanges / totalFetches) * 100) / 100 : 0;

    // 5. Failure Rate
    const totalFailures = health?.totalFailures || 0;
    const failureRate = totalFetches > 0 ? Math.round((totalFailures / totalFetches) * 100) / 100 : 0;

    // 6. Mean Latency
    const meanLatencyMs = health?.averageFetchMs ? Math.round(health.averageFetchMs) : null;

    // 7. Verification Contribution (Clusters where this source provided the primary confirmation)
    const verificationContribution = matchingClusters.filter(
      (c) => source.primarySource && c.primarySourceCount >= 1
    ).length;

    // 8. Duplicate / Wire Syndication Contribution
    const duplicateContribution = source.syndicatedFrom ? 1.0 : 0.0;

    return {
      sourceId: source.id,
      sourceName: source.name,
      authorityWeight,
      coverageUniqueness,
      eventYield,
      changeFrequencyScore,
      failureRate,
      meanLatencyMs,
      verificationContribution,
      duplicateContribution,
    };
  }
}

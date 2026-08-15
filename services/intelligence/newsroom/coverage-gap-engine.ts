/**
 * ─── Coverage Gap Engine (Newsroom Intelligence OS) ──────────────────────────
 *
 * Core rule:
 * Compares monitored entities, taxonomies, expected timelines, and sources
 * against active observation coverage to discover operational coverage gaps.
 */

import {
  StoryCluster,
  NewsroomObservation,
  CoverageGap,
  CoverageGapType,
} from '@/types/newsroom-intelligence';

export interface MonitoredTopicExpectation {
  entityOrTopicId: string;
  name: string;
  expectedIntervalHours: number;
  gapType: CoverageGapType;
  expectedDevelopmentDescription: string;
  recommendedAction: string;
}

export class CoverageGapEngine {
  /**
   * Scans clusters and observations against monitored editorial expectations.
   */
  public static detectCoverageGaps(
    clusters: StoryCluster[],
    observations: NewsroomObservation[],
    expectations: MonitoredTopicExpectation[],
    now: Date = new Date()
  ): CoverageGap[] {
    const gaps: CoverageGap[] = [];

    for (const exp of expectations) {
      // Find all observations mentioning the entity/topic
      const matchingObs = observations.filter(
        (o) =>
          o.entities.some((e) =>
            e.toLowerCase().includes(exp.name.toLowerCase())
          ) || o.title.toLowerCase().includes(exp.name.toLowerCase())
      );

      if (matchingObs.length === 0) {
        // Absolute gap (zero coverage)
        gaps.push({
          id: `gap-zero-${exp.entityOrTopicId}`,
          gapType: exp.gapType,
          title: `Zero Coverage: ${exp.name}`,
          description: `No active observations detected for monitored topic/entity "${exp.name}".`,
          expectedDevelopment: exp.expectedDevelopmentDescription,
          monitoredEntityOrTopic: exp.name,
          recommendation: exp.recommendedAction,
          severity: 'high',
          detectedAt: now.toISOString(),
          status: 'open',
        });
      } else {
        // Temporal / staleness check
        const sorted = [...matchingObs].sort(
          (a, b) =>
            new Date(b.publicationTimestamp || b.ingestionTimestamp).getTime() -
            new Date(a.publicationTimestamp || a.ingestionTimestamp).getTime()
        );

        const latestTime = new Date(
          sorted[0].publicationTimestamp || sorted[0].ingestionTimestamp
        ).getTime();
        const diffHours = (now.getTime() - latestTime) / (1000 * 60 * 60);

        if (diffHours > exp.expectedIntervalHours) {
          gaps.push({
            id: `gap-stale-${exp.entityOrTopicId}`,
            gapType: 'temporal_gap',
            title: `Coverage Lapsed: ${exp.name}`,
            description: `Last observed coverage was ${Math.round(
              diffHours
            )}h ago (expected within ${exp.expectedIntervalHours}h).`,
            expectedDevelopment: exp.expectedDevelopmentDescription,
            monitoredEntityOrTopic: exp.name,
            lastCoveredAt: sorted[0].publicationTimestamp,
            recommendation: exp.recommendedAction,
            severity: diffHours > exp.expectedIntervalHours * 2 ? 'critical' : 'medium',
            detectedAt: now.toISOString(),
            status: 'open',
          });
        }
      }
    }

    return gaps;
  }
}

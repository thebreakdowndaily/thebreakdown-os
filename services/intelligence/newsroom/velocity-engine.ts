/**
 * ─── Velocity Engine (Newsroom Intelligence OS) ──────────────────────────────
 *
 * Core rule:
 * Disentangles raw observation volume from source independence.
 * 500 duplicate social posts !== 5 independent authoritative sources.
 */

import {
  StoryCluster,
  NewsroomObservation,
  StoryVelocity,
  VelocityLevel,
} from '@/types/newsroom-intelligence';

export class VelocityEngine {
  /**
   * Calculates deterministic velocity metrics for a given story cluster.
   */
  public static calculateVelocity(
    cluster: StoryCluster,
    observations: NewsroomObservation[],
    now: Date = new Date()
  ): StoryVelocity {
    const clusterObs = observations.filter((o) =>
      cluster.observationIds.includes(o.id)
    );

    if (clusterObs.length === 0) {
      return {
        clusterId: cluster.id,
        calculatedAt: now.toISOString(),
        observationsPerHour: 0,
        independentSourcesCount: 0,
        platformCount: 0,
        acceleration: 0,
        geographicSpreadCount: 0,
        primarySourceEmergence: false,
        velocityLevel: 'normal',
        velocityScore: 0,
      };
    }

    // Sort observations chronologically
    const sorted = [...clusterObs].sort(
      (a, b) =>
        new Date(a.publicationTimestamp || a.ingestionTimestamp).getTime() -
        new Date(b.publicationTimestamp || b.ingestionTimestamp).getTime()
    );

    const firstTime = new Date(
      sorted[0].publicationTimestamp || sorted[0].ingestionTimestamp
    ).getTime();
    const lastTime = new Date(
      sorted[sorted.length - 1].publicationTimestamp ||
        sorted[sorted.length - 1].ingestionTimestamp
    ).getTime();
    const spanHours = Math.max(0.25, (lastTime - firstTime) / (1000 * 60 * 60));

    // Calculate observations per hour
    const observationsPerHour = Math.round((sorted.length / spanHours) * 10) / 10;

    // Distinct sources & platforms
    const uniqueSources = new Set(sorted.map((o) => o.sourceId));
    const independentSourcesCount = uniqueSources.size;

    const platforms = new Set(
      sorted.map((o) => {
        try {
          return o.canonicalUrl ? new URL(o.canonicalUrl).hostname : o.sourceId;
        } catch {
          return o.sourceId;
        }
      })
    );
    const platformCount = platforms.size;

    // Check for primary source emergence in the latest 25% of observations
    const recentSlice = sorted.slice(Math.floor(sorted.length * 0.75));
    const primarySourceEmergence = recentSlice.some(
      (o) => o.isPrimarySource || o.sourceTier === 't1' || o.sourceTier === 't2'
    );

    // Geographic spread
    const geographicSpreadCount = cluster.geographicSpread?.length || 1;

    // Velocity score: weighted combination heavily biased towards source independence and primary emergence
    // Raw volume alone cannot drive extreme velocity without multiple independent sources.
    const independenceFactor = Math.min(100, independentSourcesCount * 18);
    const volumeFactor = Math.min(100, observationsPerHour * 5);
    const platformFactor = Math.min(100, platformCount * 20);
    const primaryBonus = primarySourceEmergence ? 20 : 0;

    // Base score composite
    let rawScore =
      independenceFactor * 0.45 +
      volumeFactor * 0.25 +
      platformFactor * 0.2 +
      primaryBonus;

    // Guard: If independent sources <= 1, cap score at 45 (normal/elevated only)
    if (independentSourcesCount <= 1) {
      rawScore = Math.min(45, rawScore);
    }

    const velocityScore = Math.min(100, Math.round(rawScore));

    // Determine velocity level
    let velocityLevel: VelocityLevel = 'normal';
    if (velocityScore >= 80 && independentSourcesCount >= 4) {
      velocityLevel = 'extreme';
    } else if (velocityScore >= 60 && independentSourcesCount >= 3) {
      velocityLevel = 'high';
    } else if (velocityScore >= 35) {
      velocityLevel = 'elevated';
    }

    // Acceleration (rate of change over recent vs older window)
    const midPoint = Math.floor(sorted.length / 2);
    const firstHalf = sorted.slice(0, midPoint);
    const secondHalf = sorted.slice(midPoint);
    const rate1 = firstHalf.length / (spanHours / 2 || 1);
    const rate2 = secondHalf.length / (spanHours / 2 || 1);
    const acceleration = Math.round((rate2 - rate1) * 10) / 10;

    return {
      clusterId: cluster.id,
      calculatedAt: now.toISOString(),
      observationsPerHour,
      independentSourcesCount,
      platformCount,
      acceleration,
      geographicSpreadCount,
      primarySourceEmergence,
      velocityLevel,
      velocityScore,
    };
  }
}

import { describe, it, expect } from 'vitest';
import {
  RadarAdaptiveScheduler,
  MIN_POLL_INTERVAL_MINUTES,
  MAX_POLL_INTERVAL_MINUTES,
} from '../coverage/adaptive-scheduler';
import type { RadarSourceDefinition, RadarSourceHealth } from '../types';
import type { SourceValueDimensions } from '../coverage/types';
import type { StoryCluster } from '@/types/newsroom-intelligence';

describe('RadarAdaptiveScheduler', () => {
  const scheduler = new RadarAdaptiveScheduler();

  const baseSource: RadarSourceDefinition = {
    id: 'src_test',
    name: 'Test Gazette Feed',
    publisher: 'Government of MP',
    sourceType: 'GOVERNMENT',
    adapter: 'rss',
    url: 'https://mp.gov.in/gazette/feed',
    canonicalDomain: 'mp.gov.in',
    country: 'IN',
    state: 'mp',
    district: 'bhopal',
    beat: 'government',
    officialStatus: 'official_primary',
    pollIntervalMinutes: 30,
    collectorType: 'rss',
    enabled: true,
    authorityClass: 'PRIMARY',
    primarySource: true,
    topics: ['governance'],
    geographies: ['BHOPAL', 'MP'],
    priority: 'P0',
    refreshPolicy: 'HOURLY',
    approvalStatus: 'ACTIVE',
  };

  it('enforces hard lower and upper bounds [5, 1440]', () => {
    // Attempt extreme acceleration
    const fastSource = { ...baseSource, pollIntervalMinutes: 2 };
    const recFast = scheduler.computeRecommendation(fastSource, undefined, undefined);
    expect(recFast.recommendedIntervalMinutes).toBeGreaterThanOrEqual(MIN_POLL_INTERVAL_MINUTES);

    // Attempt extreme relaxation
    const deadSource = { ...baseSource, pollIntervalMinutes: 2000 };
    const recSlow = scheduler.computeRecommendation(deadSource, undefined, undefined);
    expect(recSlow.recommendedIntervalMinutes).toBeLessThanOrEqual(MAX_POLL_INTERVAL_MINUTES);
  });

  it('dampens polling interval when consecutive failures are high', () => {
    const health: RadarSourceHealth = {
      sourceId: 'src_test',
      consecutiveFailures: 4,
      totalFetches: 10,
      totalFailures: 6,
      totalChanges: 0,
      averageFetchMs: 500,
      status: 'failing',
    };

    const rec = scheduler.computeRecommendation(baseSource, health);
    expect(rec.adjustmentDirection).toBe('SLOWER');
    expect(rec.recommendedIntervalMinutes).toBeGreaterThan(baseSource.pollIntervalMinutes);
    expect(rec.reason).toContain('failure');
  });

  it('accelerates polling interval when change rate and event yield are high', () => {
    const health: RadarSourceHealth = {
      sourceId: 'src_test',
      consecutiveFailures: 0,
      totalFetches: 100,
      totalFailures: 0,
      totalChanges: 50, // 50% change rate
      averageFetchMs: 120,
      status: 'healthy',
    };

    const dims: SourceValueDimensions = {
      sourceId: 'src_test',
      sourceName: 'Test Feed',
      authorityWeight: 1.0,
      coverageUniqueness: 0.8,
      eventYield: 15,
      changeFrequencyScore: 0.5,
      failureRate: 0.0,
      meanLatencyMs: 300,
      verificationContribution: 5,
      duplicateContribution: 0.0,
    };

    const rec = scheduler.computeRecommendation(baseSource, health, dims);
    expect(rec.adjustmentDirection).toBe('FASTER');
    expect(rec.recommendedIntervalMinutes).toBeLessThanOrEqual(15);
  });

  it('protects sole sensors from exceeding 60-minute polling threshold', () => {
    const stagnantSource: RadarSourceDefinition = {
      ...baseSource,
      officialStatus: 'media',
      pollIntervalMinutes: 60,
    };

    const health: RadarSourceHealth = {
      sourceId: 'src_test',
      consecutiveFailures: 0,
      totalFetches: 50,
      totalFailures: 0,
      totalChanges: 1, // very low change
      averageFetchMs: 200,
      status: 'healthy',
    };

    const dims: SourceValueDimensions = {
      sourceId: 'src_test',
      sourceName: 'Only Sensor in Remote District',
      authorityWeight: 0.5,
      coverageUniqueness: 1.0, // Sole sensor
      eventYield: 0,
      changeFrequencyScore: 0.02,
      failureRate: 0.0,
      meanLatencyMs: null,
      verificationContribution: 0,
      duplicateContribution: 0.0,
    };

    const rec = scheduler.computeRecommendation(stagnantSource, health, dims);
    expect(rec.recommendedIntervalMinutes).toBeLessThanOrEqual(60);
    expect(rec.reason).toContain('Sole sensor');
  });

  it('calculates 90-day event yield metrics accurately', () => {
    const now = Date.now();
    const clusters: StoryCluster[] = [
      {
        id: 'cl_1',
        title: 'Cluster 1',
        firstDetectedAt: new Date(now - 10 * 86_400_000).toISOString(),
        summary: '',
        status: 'active',
        geographicSpread: ['Bhopal'],
        sourceIds: ['src_test', 'src_other'],
        observationIds: ['obs_1', 'obs_2'],
        claimIds: [],
        entities: [],
        primarySourceCount: 1,
        independentSourceCount: 2,
        lastUpdatedAt: new Date().toISOString(),
      },
      {
        id: 'cl_2',
        title: 'Cluster 2',
        firstDetectedAt: new Date(now - 20 * 86_400_000).toISOString(),
        summary: '',
        status: 'active',
        geographicSpread: ['Bhopal'],
        sourceIds: ['src_other', 'src_test'],
        observationIds: ['obs_3', 'obs_4'],
        claimIds: [],
        entities: [],
        primarySourceCount: 1,
        independentSourceCount: 2,
        lastUpdatedAt: new Date().toISOString(),
      },
    ];

    const yieldMetrics = scheduler.calculateEventYield(clusters, 'src_test', 90);
    expect(yieldMetrics.totalContributions).toBe(2);
    expect(yieldMetrics.uniqueClustersOriginated).toBe(1);
    expect(yieldMetrics.originationRatio).toBe(0.5);
  });
});

import { describe, it, expect } from 'vitest';
import { CityProfileEngine } from '../coverage/city-profile';
import { ALL_GLOBAL_RADAR_SOURCES } from '@/data/radar/sources-global';
import type { RadarSourceHealth } from '../types';

describe('CityProfileEngine', () => {
  const engine = new CityProfileEngine();

  it('generates an operational city sensor profile for Bhopal', () => {
    const healthMap = new Map<string, RadarSourceHealth>();
    healthMap.set('radar-mpinfo-html', {
      sourceId: 'radar-mpinfo-html',
      status: 'healthy',
      totalFetches: 10,
      consecutiveFailures: 0,
      totalFailures: 0,
      totalChanges: 3,
      averageFetchMs: 150,
    });

    const profile = engine.generateProfile(
      'Bhopal',
      'IN',
      ALL_GLOBAL_RADAR_SOURCES,
      healthMap,
      5,
      5,
      14,
      ['Old City municipal wards']
    );

    expect(profile.city).toBe('Bhopal');
    expect(profile.country).toBe('IN');
    expect(profile.primarySensorsCount).toBeGreaterThanOrEqual(1);
    expect(profile.criticalBeatsCovered).toContain('government');
    expect(profile.recallRate).toBe(1.0);
    expect(profile.medianDetectionLatencyMinutes).toBe(14);
    expect(profile.knownBlindSpots).toContain('Old City municipal wards');
  });

  it('calculates operational economics and cost per detected/verified event', () => {
    const cost = engine.calculateOperatingCost(25, 10, 5);

    expect(cost.sourcesMonitored).toBe(25);
    expect(cost.requestsPerDay).toBe(25 * 2 * 24); // 1200
    expect(cost.databaseWritesPerDay).toBeGreaterThan(1200);
    expect(cost.totalCostUsdPerDay).toBeGreaterThan(0);
    expect(cost.costPerSourcePerDayUsd).toBeGreaterThan(0);
    expect(cost.costPerDetectedEventUsd).toBeGreaterThan(0);
    expect(cost.costPerVerifiedEventUsd).toBeGreaterThan(0);
  });
});

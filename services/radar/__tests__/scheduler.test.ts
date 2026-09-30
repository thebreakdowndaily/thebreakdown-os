import { describe, it, expect } from 'vitest';
import { SourceScheduler, MAX_BACKOFF_MINUTES } from '../source-scheduler';
import { MP_RADAR_SOURCES } from '@/data/radar/sources-mp';
import type { RadarSourceDefinition, RadarSourceHealth } from '../types';

describe('SourceScheduler & Bounded Backoff', () => {
  const baseSource: RadarSourceDefinition = MP_RADAR_SOURCES[0];

  it('computes bounded exponential backoff correctly', () => {
    expect(SourceScheduler.computeBackoffMinutes(0)).toBe(0);
    expect(SourceScheduler.computeBackoffMinutes(1)).toBe(5);
    expect(SourceScheduler.computeBackoffMinutes(2)).toBe(10);
    expect(SourceScheduler.computeBackoffMinutes(3)).toBe(20);
    expect(SourceScheduler.computeBackoffMinutes(4)).toBe(40);
    expect(SourceScheduler.computeBackoffMinutes(5)).toBe(80);
    expect(SourceScheduler.computeBackoffMinutes(10)).toBe(MAX_BACKOFF_MINUTES); // 1440m capped
  });

  it('evaluates unpolled source as immediately DUE', () => {
    const result = SourceScheduler.evaluateSource(baseSource, undefined, new Date());
    expect(result.state).toBe('DUE');
    expect(result.isDue).toBe(true);
    expect(result.backoffMinutes).toBe(0);
  });

  it('evaluates recently polled healthy source as READY (not due)', () => {
    const now = new Date();
    const health: RadarSourceHealth = {
      sourceId: baseSource.id,
      lastCheckedAt: new Date(now.getTime() - 10 * 60 * 1000).toISOString(), // 10 mins ago
      lastSuccessAt: new Date(now.getTime() - 10 * 60 * 1000).toISOString(),
      consecutiveFailures: 0,
      totalFetches: 1,
      totalFailures: 0,
      totalChanges: 0,
      averageFetchMs: 120,
      status: 'healthy',
    };

    // Poll interval is 60m; 10m elapsed -> not due
    const result = SourceScheduler.evaluateSource(baseSource, health, now);
    expect(result.state).toBe('READY');
    expect(result.isDue).toBe(false);
  });

  it('evaluates healthy source exceeding poll interval as DUE', () => {
    const now = new Date();
    const health: RadarSourceHealth = {
      sourceId: baseSource.id,
      lastCheckedAt: new Date(now.getTime() - 70 * 60 * 1000).toISOString(), // 70 mins ago (interval is 60m)
      lastSuccessAt: new Date(now.getTime() - 70 * 60 * 1000).toISOString(),
      consecutiveFailures: 0,
      totalFetches: 2,
      totalFailures: 0,
      totalChanges: 0,
      averageFetchMs: 140,
      status: 'healthy',
    };

    const result = SourceScheduler.evaluateSource(baseSource, health, now);
    expect(result.state).toBe('DUE');
    expect(result.isDue).toBe(true);
  });

  it('puts failing source into BACKOFF until retry window elapses', () => {
    const now = new Date();
    // 2 consecutive failures -> 10m backoff
    const health: RadarSourceHealth = {
      sourceId: baseSource.id,
      lastCheckedAt: new Date(now.getTime() - 3 * 60 * 1000).toISOString(), // 3 mins ago
      consecutiveFailures: 2,
      totalFetches: 5,
      totalFailures: 2,
      totalChanges: 0,
      averageFetchMs: 0,
      status: 'degraded',
    };

    const result = SourceScheduler.evaluateSource(baseSource, health, now);
    expect(result.state).toBe('BACKOFF');
    expect(result.isDue).toBe(false);
    expect(result.backoffMinutes).toBe(10);

    // After 11 minutes (exceeding 10m backoff) -> DUE for retry
    const later = new Date(now.getTime() + 11 * 60 * 1000);
    const retryResult = SourceScheduler.evaluateSource(baseSource, health, later);
    expect(retryResult.state).toBe('DUE');
    expect(retryResult.isDue).toBe(true);
  });

  it('marks disabled source as DISABLED', () => {
    const disabledSource = { ...baseSource, enabled: false };
    const result = SourceScheduler.evaluateSource(disabledSource, undefined, new Date());
    expect(result.state).toBe('DISABLED');
    expect(result.isDue).toBe(false);
  });

  it('prioritizes P0 and P1 sources when filtering due sources', () => {
    const healthMap = new Map<string, RadarSourceHealth>();
    const { dueSources } = SourceScheduler.getDueSources(MP_RADAR_SOURCES, healthMap, new Date());

    expect(dueSources.length).toBeGreaterThan(0);
    // Highest priority source should be at top
    const pibSource = dueSources.find((s) => s.priority === 'P0');
    expect(pibSource).toBeDefined();
    expect(dueSources[0].priority).toBe('P0');
  });
});

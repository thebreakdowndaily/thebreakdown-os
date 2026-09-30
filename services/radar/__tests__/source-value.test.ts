import { describe, it, expect } from 'vitest';
import { SourceValueCalculator } from '../coverage/source-value';
import { MP_RADAR_SOURCES } from '@/data/radar/sources-mp';
import type { RadarSourceHealth } from '../types';
import type { StoryCluster } from '@/types/newsroom-intelligence';

describe('Source Value Multi-Dimensional Profiling', () => {
  it('computes distinct operational vectors without flattening to a simplistic scalar', () => {
    const calculator = new SourceValueCalculator();
    const targetSource = MP_RADAR_SOURCES.find((s) => s.id === 'radar-mp-gazette-pdf')!;

    const healthMap = new Map<string, RadarSourceHealth>();
    healthMap.set(targetSource.id, {
      sourceId: targetSource.id,
      status: 'healthy',
      totalFetches: 100,
      totalFailures: 2,
      totalChanges: 15,
      consecutiveFailures: 0,
      averageFetchMs: 450,
    });

    const mockClusters: StoryCluster[] = [
      {
        id: 'clu-1',
        title: 'Gazette notification on forest rules',
        summary: 'State forest rules revised',
        firstDetectedAt: '2026-09-29T10:00:00Z',
        lastUpdatedAt: '2026-09-29T10:00:00Z',
        observationIds: ['obs-1'],
        sourceIds: [targetSource.id],
        claimIds: [],
        entities: ['Forest Dept'],
        geographicSpread: ['mp'],
        status: 'active',
        primarySourceCount: 1,
        independentSourceCount: 1,
      },
    ];

    const value = calculator.evaluate(targetSource, {
      allSources: MP_RADAR_SOURCES,
      healthMap,
      clusters: mockClusters,
    });

    expect(value.sourceId).toBe('radar-mp-gazette-pdf');
    expect(value.authorityWeight).toBe(1.0); // Official primary
    expect(value.eventYield).toBe(1);
    expect(value.verificationContribution).toBe(1);
    expect(value.failureRate).toBe(0.02);
    expect(value.changeFrequencyScore).toBe(0.15);
    expect(value.meanLatencyMs).toBe(450);
  });

  it('marks wire syndicated sources with 1.0 duplicateContribution', () => {
    const calculator = new SourceValueCalculator();
    const ptiWire = MP_RADAR_SOURCES.find((s) => s.id === 'radar-pti-mp-wire')!;

    const value = calculator.evaluate(ptiWire, {
      allSources: MP_RADAR_SOURCES,
      healthMap: new Map(),
      clusters: [],
    });

    expect(value.duplicateContribution).toBe(1.0);
  });
});

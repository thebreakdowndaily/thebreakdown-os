import { describe, it, expect } from 'vitest';
import { CoverageMatrixEngine } from '../coverage/matrix';
import { INDIA_COUNTRY_PACK } from '@/data/radar/countries';
import { MP_RADAR_SOURCES } from '@/data/radar/sources-mp';
import type { RadarSourceHealth } from '../types';

describe('Coverage Matrix & Gap Detection Engine', () => {
  it('generates geographic coverage report and identifies coverage states', () => {
    const engine = new CoverageMatrixEngine();
    const healthMap = new Map<string, RadarSourceHealth>();

    for (const s of MP_RADAR_SOURCES) {
      healthMap.set(s.id, {
        sourceId: s.id,
        status: 'healthy',
        scheduleState: 'READY',
        totalFetches: 10,
        totalFailures: 0,
        totalChanges: 2,
        consecutiveFailures: 0,
        averageFetchMs: 150,
      });
    }

    const report = engine.generateReport(INDIA_COUNTRY_PACK, MP_RADAR_SOURCES, healthMap);

    expect(report.totalGeographicUnits).toBeGreaterThan(5);
    expect(report.activeCoverageCount).toBeGreaterThanOrEqual(1);

    // Bhopal and Rewa have primary sources and should be ACTIVE or STRONG
    const rewaUnit = report.units.find((u) => u.nodeId === 'rewa-district');
    expect(rewaUnit).toBeDefined();
    expect(rewaUnit?.primarySources).toBeGreaterThanOrEqual(1);
    expect(['ACTIVE', 'STRONG']).toContain(rewaUnit?.coverageState);
  });

  it('detects BLIND_SPOT gaps when a geography has zero operational sensors', () => {
    const engine = new CoverageMatrixEngine();
    const healthMap = new Map<string, RadarSourceHealth>();

    // Pass zero sources
    const report = engine.generateReport(INDIA_COUNTRY_PACK, [], healthMap);

    const blindGaps = report.detectedGaps.filter((g) => g.gapType === 'BLIND_SPOT');
    expect(blindGaps.length).toBeGreaterThan(0);
    expect(report.blindCoverageCount).toBe(report.totalGeographicUnits);
  });
});

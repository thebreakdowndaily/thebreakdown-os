import { describe, it, expect } from 'vitest';
import { RadarRecallBenchmark, GroundTruthEvent } from '../benchmarking/recall';
import type { StoryCluster } from '@/types/newsroom-intelligence';

describe('Radar Recall Benchmarking Engine', () => {
  const groundTruthUniverse: GroundTruthEvent[] = [
    {
      id: 'gt-1',
      title: 'MP High Court issues directions on forest land preservation',
      occurredAt: '2026-09-29T10:00:00Z',
      location: 'Jabalpur',
      beat: 'courts',
      keywords: ['High Court', 'forest', 'preservation', 'directions'],
    },
    {
      id: 'gt-2',
      title: 'Bhopal metro line 2 testing commenced',
      occurredAt: '2026-09-29T11:00:00Z',
      location: 'Bhopal',
      beat: 'infrastructure',
      keywords: ['metro', 'testing', 'commenced'],
    },
    {
      id: 'gt-3',
      title: 'Rewa solar plant capacity expansion announcement',
      occurredAt: '2026-09-29T09:00:00Z',
      location: 'Rewa',
      beat: 'environment',
      keywords: ['Rewa', 'solar', 'capacity', 'expansion'],
    },
    {
      id: 'gt-4',
      title: 'Unmonitored remote tehsil bridge closure in Sheopur',
      occurredAt: '2026-09-29T08:00:00Z',
      location: 'Sheopur',
      beat: 'infrastructure',
      keywords: ['bridge', 'closure', 'remote', 'river'],
    },
  ];

  const detectedClusters: StoryCluster[] = [
    {
      id: 'cluster-hc-order',
      title: 'Jabalpur High Court issues forest preservation directions',
      summary: 'High Court bench in Jabalpur delivered directions regarding state forest conservation and illegal mining.',
      firstDetectedAt: '2026-09-29T10:15:00Z',
      lastUpdatedAt: '2026-09-29T10:15:00Z',
      observationIds: ['obs-1'],
      sourceIds: ['radar-mphc-principal-pdf'],
      claimIds: [],
      entities: ['Madhya Pradesh High Court', 'Jabalpur'],
      geographicSpread: ['jabalpur-district', 'mp'],
      status: 'active',
      primarySourceCount: 1,
      independentSourceCount: 1,
    },
    {
      id: 'cluster-rewa-solar',
      title: 'Rewa Ultra Mega Solar announces capacity expansion',
      summary: 'Rewa administration confirmed solar plant phase two expansion plans.',
      firstDetectedAt: '2026-09-29T09:40:00Z',
      lastUpdatedAt: '2026-09-29T09:40:00Z',
      observationIds: ['obs-2'],
      sourceIds: ['radar-rewa-nic'],
      claimIds: [],
      entities: ['Rewa Solar'],
      geographicSpread: ['rewa-district', 'mp'],
      status: 'active',
      primarySourceCount: 1,
      independentSourceCount: 1,
    },
  ];

  it('calculates recall rate and MTTD correctly against ground truth events', () => {
    const benchmark = new RadarRecallBenchmark();
    const report = benchmark.evaluate(groundTruthUniverse, detectedClusters);

    expect(report.totalGroundTruth).toBe(4);
    expect(report.totalDetected).toBe(2);
    expect(report.totalMissed).toBe(2);
    expect(report.recallRate).toBe(0.5); // 2 out of 4 detected = 50%
    expect(report.meanTimeToDetectMinutes).toBeGreaterThanOrEqual(15);
    expect(report.beatBreakdown['courts']?.recall).toBe(1.0);
    expect(report.beatBreakdown['infrastructure']?.recall).toBe(0.0);
  });
});

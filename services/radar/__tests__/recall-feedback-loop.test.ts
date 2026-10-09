import { describe, it, expect } from 'vitest';
import { RecallFeedbackLoop } from '../benchmarking/feedback-loop';
import { ProactiveDiscoveryQueue } from '../discovery/queue';
import { INDIA_COUNTRY_PACK } from '@/data/radar/countries';
import type { GroundTruthEvent, RecallBenchmarkReport } from '../benchmarking/recall';

describe('RecallFeedbackLoop', () => {
  it('groups missed events and generates targeted discovery tasks for queue', () => {
    const queue = new ProactiveDiscoveryQueue();
    const feedbackLoop = new RecallFeedbackLoop(queue);

    const groundTruth: GroundTruthEvent[] = [
      {
        id: 'gt_1',
        title: 'Bhopal District Court Curfew Order',
        occurredAt: '2026-03-01T10:00:00Z',
        location: 'Bhopal',
        beat: 'courts',
        keywords: ['court', 'curfew', 'order', 'bhopal'],
      },
      {
        id: 'gt_2',
        title: 'Bhopal High Court Bail Dismissal',
        occurredAt: '2026-03-01T12:00:00Z',
        location: 'Bhopal',
        beat: 'courts',
        keywords: ['high court', 'bail', 'order', 'bhopal'],
      },
      {
        id: 'gt_3',
        title: 'Rewa Highway Land Acquisition Notice',
        occurredAt: '2026-03-02T08:00:00Z',
        location: 'Rewa',
        beat: 'infrastructure',
        keywords: ['highway', 'land acquisition', 'collectorate', 'rewa'],
      },
    ];

    const report: RecallBenchmarkReport = {
      timestamp: new Date().toISOString(),
      totalGroundTruth: 3,
      totalDetected: 0,
      totalMissed: 3,
      recallRate: 0.0,
      meanTimeToDetectMinutes: null,
      p90TimeToDetectMinutes: null,
      results: [
        { groundTruthId: 'gt_1', status: 'MISSED', missReason: 'SOURCE_ABSENT' },
        { groundTruthId: 'gt_2', status: 'MISSED', missReason: 'SOURCE_ABSENT' },
        { groundTruthId: 'gt_3', status: 'MISSED', missReason: 'GEOGRAPHIC_GAP' },
      ],
      beatBreakdown: {},
    };

    const loopResult = feedbackLoop.processBenchmarkReport(report, groundTruth, INDIA_COUNTRY_PACK);

    expect(loopResult.evaluatedMissesCount).toBe(3);
    expect(loopResult.missedGroups).toHaveLength(2); // Bhopal/courts and Rewa/infrastructure

    // Verify task generation in the queue
    const queuedTasks = queue.getTasks();
    expect(queuedTasks).toHaveLength(2);

    // Bhopal has 2 missed events -> P0 priority
    const bhopalTask = queuedTasks.find((t) => t.geographyName === 'Bhopal');
    expect(bhopalTask).toBeDefined();
    expect(bhopalTask?.priority).toBe('P0');
    expect(bhopalTask?.targetBeat).toBe('courts');
    expect(bhopalTask?.gapType).toBe('HIGH_MISS_RATE');
    expect(bhopalTask?.reason).toContain('gt_1');

    // Rewa has 1 missed event -> P1 priority
    const rewaTask = queuedTasks.find((t) => t.geographyName === 'Rewa');
    expect(rewaTask).toBeDefined();
    expect(rewaTask?.priority).toBe('P1');
    expect(rewaTask?.targetBeat).toBe('infrastructure');
  });
});

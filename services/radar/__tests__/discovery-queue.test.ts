import { describe, it, expect } from 'vitest';
import { ProactiveDiscoveryQueue, DiscoveryTask } from '../discovery/queue';
import { INDIA_COUNTRY_PACK } from '@/data/radar/countries';
import type { CoverageGap } from '../coverage/types';

describe('ProactiveDiscoveryQueue', () => {
  it('generates prioritized discovery tasks from coverage gaps', () => {
    const queue = new ProactiveDiscoveryQueue();

    const sampleGaps: CoverageGap[] = [
      {
        geographyId: 'geo-in-mp-bhopal',
        geographyName: 'Bhopal',
        gapType: 'NO_PRIMARY_SOURCE',
        details: 'Missing official primary government portal in Bhopal',
        severity: 'CRITICAL',
        remedyRecommendation: 'Discover and activate Bhopal district administration portal',
      },
      {
        geographyId: 'geo-in-mp-rewa',
        geographyName: 'Rewa',
        gapType: 'BLIND_SPOT',
        details: 'No sensors monitored in Rewa district',
        severity: 'CRITICAL',
        remedyRecommendation: 'Discover official collectorate or court feeds',
      },
      {
        geographyId: 'geo-in-mp-gwalior',
        geographyName: 'Gwalior',
        gapType: 'UNCOVERED_BEAT',
        details: 'Unmonitored courts beat in Gwalior',
        severity: 'WARNING',
        remedyRecommendation: 'Discover High Court bench feed',
      },
    ];

    const tasks = queue.generateTasksFromGaps(sampleGaps, INDIA_COUNTRY_PACK);

    expect(tasks).toHaveLength(3);

    // BLIND_SPOT must be P0
    const rewaTask = tasks.find((t) => t.geographyName === 'Rewa');
    expect(rewaTask?.priority).toBe('P0');
    expect(rewaTask?.gapType).toBe('BLIND_SPOT');

    // NO_PRIMARY_SOURCE must be P1
    const bhopalTask = tasks.find((t) => t.geographyName === 'Bhopal');
    expect(bhopalTask?.priority).toBe('P1');
    expect(bhopalTask?.gapType).toBe('NO_PRIMARY_SOURCE');

    // UNCOVERED_BEAT must be P2
    const gwaliorTask = tasks.find((t) => t.geographyName === 'Gwalior');
    expect(gwaliorTask?.priority).toBe('P2');
    expect(gwaliorTask?.targetBeat).toBe('courts');
    expect(gwaliorTask?.recommendedInstitutions.some((i) => i.toLowerCase().includes('court'))).toBe(true);
  });

  it('claims next task in strict priority order (P0 first)', () => {
    const queue = new ProactiveDiscoveryQueue();

    const lowTask: DiscoveryTask = {
      id: 'task_p3',
      priority: 'P3',
      gapType: 'SECONDARY_ONLY',
      geographyId: 'geo1',
      geographyName: 'Geo1',
      countryCode: 'IN',
      targetBeat: 'government',
      recommendedKeywords: [],
      recommendedInstitutions: [],
      reason: 'Secondary only',
      createdAt: '2026-01-01T00:00:00Z',
      status: 'queued',
      candidateIds: [],
    };

    const urgentTask: DiscoveryTask = {
      id: 'task_p0',
      priority: 'P0',
      gapType: 'BLIND_SPOT',
      geographyId: 'geo2',
      geographyName: 'Geo2',
      countryCode: 'IN',
      targetBeat: 'government',
      recommendedKeywords: [],
      recommendedInstitutions: [],
      reason: 'Blind spot',
      createdAt: '2026-01-02T00:00:00Z',
      status: 'queued',
      candidateIds: [],
    };

    queue.enqueue(lowTask);
    queue.enqueue(urgentTask);

    const claimed = queue.claimNextTask();
    expect(claimed?.id).toBe('task_p0');
    expect(claimed?.status).toBe('in_progress');
    expect(claimed?.claimedAt).toBeDefined();

    queue.completeTask('task_p0', ['cand_123', 'cand_456']);
    const completedTask = queue.getTasks().find((t) => t.id === 'task_p0');
    expect(completedTask?.status).toBe('completed');
    expect(completedTask?.candidateIds).toEqual(['cand_123', 'cand_456']);
  });

  it('produces accurate queue summary statistics', () => {
    const queue = new ProactiveDiscoveryQueue();
    const task: DiscoveryTask = {
      id: 'task_sum',
      priority: 'P0',
      gapType: 'ALL_SOURCES_FAILING',
      geographyId: 'geo_fail',
      geographyName: 'FailingGeo',
      countryCode: 'IN',
      targetBeat: 'public_safety',
      recommendedKeywords: [],
      recommendedInstitutions: [],
      reason: 'All sensors down',
      createdAt: new Date().toISOString(),
      status: 'queued',
      candidateIds: [],
    };
    queue.enqueue(task);

    const summary = queue.getQueueSummary();
    expect(summary.total).toBe(1);
    expect(summary.queued).toBe(1);
    expect(summary.p0Count).toBe(1);
  });
});

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FileRadarRepository } from '../persistence/file';
import { ChangeDetectionEngine } from '../change-detection';
import { RadarSourceHealthMonitor } from '../source-health';
import type { RawArtifact } from '../types';
import { promises as fs } from 'node:fs';
import path from 'node:path';

describe('Radar Persistence & Restart Durability', () => {
  const tempTestFile = path.resolve(process.cwd(), '.radar-state-test.json');

  beforeEach(async () => {
    try {
      await fs.unlink(tempTestFile);
    } catch {
      // Ignored
    }
  });

  afterEach(async () => {
    try {
      await fs.unlink(tempTestFile);
    } catch {
      // Ignored
    }
  });

  it('preserves fingerprints and health across simulated process restarts', async () => {
    // ── Phase 1: Worker 1 runs and writes state ──────────────────────────────
    const repo1 = new FileRadarRepository(tempTestFile);
    const engine1 = new ChangeDetectionEngine(repo1);
    const health1 = new RadarSourceHealthMonitor(repo1);

    await engine1.load();
    await health1.load();

    const artifact1: RawArtifact = {
      sourceId: 'radar-mpinfo-html',
      url: 'https://mpinfo.org/press-release-1',
      retrievedAt: new Date().toISOString(),
      content: 'MP Cabinet approves metro project in Jabalpur.',
      contentHash: 'hash_metro_jabalpur_1',
      contentLength: 47,
      metadata: {},
    };

    const res1 = engine1.detect(artifact1);
    expect(res1.changeType).toBe('new');

    health1.recordSuccess('radar-mpinfo-html', 180);

    // Flush state to disk
    await engine1.flush();
    await health1.flush();

    // Verify file exists on disk
    const fileContent = await fs.readFile(tempTestFile, 'utf-8');
    expect(fileContent).toContain('radar-mpinfo-html::https://mpinfo.org/press-release-1');
    expect(fileContent).toContain('hash_metro_jabalpur_1');

    // ── Phase 2: Worker 1 dies, Worker 2 starts fresh from disk ─────────────
    const repo2 = new FileRadarRepository(tempTestFile);
    const engine2 = new ChangeDetectionEngine(repo2);
    const health2 = new RadarSourceHealthMonitor(repo2);

    await engine2.load();
    await health2.load();

    // Worker 2 evaluates the SAME artifact after restart
    const res2 = engine2.detect(artifact1);
    expect(res2.changeType).toBe('unchanged'); // Must be UNCHANGED (restart safe!)

    // Health state was also recovered
    const recoveredHealth = health2.getHealth('radar-mpinfo-html');
    expect(recoveredHealth.status).toBe('healthy');
    expect(recoveredHealth.totalFetches).toBe(1);
    expect(recoveredHealth.consecutiveFailures).toBe(0);
  });

  it('records and retrieves pipeline runs and latency records', async () => {
    const repo = new FileRadarRepository(tempTestFile);

    await repo.recordPipelineRun({
      id: 'run-test-101',
      generatedAt: new Date().toISOString(),
      cycleDurationMs: 420,
      sourcesConsidered: 6,
      sourcesPolled: 3,
      successful: 3,
      failed: 0,
      newArtifacts: 2,
      changedArtifacts: 1,
      unchanged: 5,
      eventsOrSignalsCreated: 2,
      status: 'completed',
      medianDetectionLatencyMs: 120_000,
      p90DetectionLatencyMs: 240_000,
    });

    const latest = await repo.getLatestPipelineRun();
    expect(latest).toBeDefined();
    expect(latest?.id).toBe('run-test-101');
    expect(latest?.sourcesPolled).toBe(3);
    expect(latest?.medianDetectionLatencyMs).toBe(120_000);

    // Latency record
    await repo.recordLatency({
      clusterId: 'cluster-test-1',
      firstSeenAt: new Date().toISOString(),
      firstDetectedAt: new Date().toISOString(),
      detectionLatencyMs: 120_000,
    });
  });
});

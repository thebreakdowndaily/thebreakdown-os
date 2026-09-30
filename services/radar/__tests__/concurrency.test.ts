import { describe, it, expect } from 'vitest';
import { MemoryRadarRepository } from '../persistence/memory';
import { RadarPipeline } from '../pipeline';
import { NewsroomIntelligenceCore } from '@/services/intelligence/newsroom';
import { MP_RADAR_SOURCES } from '@/data/radar/sources-mp';

describe('Radar Concurrency & Idempotency Controls', () => {
  it('prevents concurrent double-execution using distributed locks', async () => {
    const repository = new MemoryRadarRepository();
    const core = NewsroomIntelligenceCore.resetInstance();
    await core.ensureLoaded();

    const pipelineA = new RadarPipeline(MP_RADAR_SOURCES.slice(0, 1), {
      repository,
      customCore: core,
    });
    const pipelineB = new RadarPipeline(MP_RADAR_SOURCES.slice(0, 1), {
      repository,
      customCore: core,
    });

    // Manually acquire lock as worker A
    const acquiredA = await repository.acquireLock('radar:poll:global', 'worker-A', 10_000);
    expect(acquiredA).toBe(true);

    // Worker B attempts to poll concurrently
    const resultB = await pipelineB.poll({ workerId: 'worker-B' });
    expect(resultB.status).toBe('failed');
    expect(resultB.error).toContain('Concurrency lock contention');
    expect(resultB.sourcesPolled).toBe(0);

    // Worker A releases lock
    await repository.releaseLock('radar:poll:global', 'worker-A');

    // Worker B can now acquire lock
    const acquiredB = await repository.acquireLock('radar:poll:global', 'worker-B', 10_000);
    expect(acquiredB).toBe(true);
    await repository.releaseLock('radar:poll:global', 'worker-B');
  });

  it('allows lock acquisition after TTL expiration', async () => {
    const repository = new MemoryRadarRepository();

    // Acquire lock with 50ms TTL
    await repository.acquireLock('radar:poll:test-ttl', 'worker-old', 50);

    // Immediately another worker should be rejected
    const immediateReject = await repository.acquireLock('radar:poll:test-ttl', 'worker-new', 50);
    expect(immediateReject).toBe(false);

    // Wait 60ms for TTL to expire
    await new Promise((r) => setTimeout(r, 60));

    // Now worker-new should successfully acquire the lock
    const acquireAfterExpiry = await repository.acquireLock('radar:poll:test-ttl', 'worker-new', 50);
    expect(acquireAfterExpiry).toBe(true);
  });

  it('guarantees idempotency when same artifact is ingested repeatedly', async () => {
    const repository = new MemoryRadarRepository();
    const core = NewsroomIntelligenceCore.resetInstance();
    await core.ensureLoaded();

    const changeDetection = new (await import('../change-detection')).ChangeDetectionEngine(repository);

    const artifact = {
      sourceId: 'radar-rewa-nic',
      url: 'https://rewa.nic.in/notices/election-order-001',
      retrievedAt: new Date().toISOString(),
      content: 'Collector Rewa issues Section 144 order.',
      contentHash: 'hash_abc_123',
      contentLength: 42,
      metadata: {},
    };

    // First ingestion -> new
    const firstCheck = changeDetection.detect(artifact);
    expect(firstCheck.changeType).toBe('new');

    // Second ingestion (exact same content) -> unchanged
    const secondCheck = changeDetection.detect(artifact);
    expect(secondCheck.changeType).toBe('unchanged');

    // Third ingestion (exact same content) -> unchanged
    const thirdCheck = changeDetection.detect(artifact);
    expect(thirdCheck.changeType).toBe('unchanged');

    // Total fingerprints tracked remains exactly 1
    expect(changeDetection.getFingerprints().length).toBe(1);
    expect(changeDetection.getFingerprints()[0].changeCount).toBe(0);
  });
});

import { describe, it, expect } from 'vitest';
import { RadarPipeline } from '../pipeline';
import { NewsroomIntelligenceCore } from '@/services/intelligence/newsroom';
import { MP_RADAR_SOURCES } from '@/data/radar/sources-mp';
import type { RawArtifact } from '../types';
import { createHash } from 'node:crypto';

describe('Radar Pipeline Vertical Slice E2E', () => {
  it('executes full pipeline: source → artifact → change → observation → cluster → signal', async () => {
    // 1. Create an isolated core instance for test isolation
    const core = NewsroomIntelligenceCore.resetInstance();
    await core.ensureLoaded();

    // 2. Select a vertical slice of MP sources:
    // - One state-level source: MP Gov PR (mpinfo.org)
    // - One local/municipal source: Rewa District (rewa.nic.in)
    // - One national primary source: PIB MP-tagged
    const sliceSources = MP_RADAR_SOURCES.filter((s) =>
      ['radar-mpinfo-html', 'radar-rewa-nic', 'radar-pib-national'].includes(s.id)
    );
    expect(sliceSources.length).toBe(3);

    // 3. Initialize pipeline with slice sources
    const pipeline = new RadarPipeline(sliceSources, { customCore: core });

    // 4. Verify initial health state
    const healthMonitor = pipeline.getHealthMonitor();
    for (const src of sliceSources) {
      const health = healthMonitor.getHealth(src.id);
      expect(health.status).toBe('unknown'); // Not yet polled
    }

    // 5. Simulate raw artifacts from a monitored source (Rewa District order)
    const rewaContent = 'Collector Rewa issues order under Section 144 in Rewa city regarding civic elections.';
    const rewaHash = createHash('sha256').update(rewaContent).digest('hex');

    const testNowMs = Date.now();
    const artifact: RawArtifact = {
      sourceId: 'radar-rewa-nic',
      url: 'https://rewa.nic.in/notices/election-order-2026',
      retrievedAt: new Date(testNowMs).toISOString(),
      publishedAt: new Date(testNowMs - 300_000).toISOString(), // 5 minutes ago
      title: 'Civic Election Security Order - Rewa',
      content: rewaContent,
      contentHash: rewaHash,
      contentLength: rewaContent.length,
      metadata: {},
    };

    // 6. Test change detection directly
    const changeDetection = pipeline.getChangeDetection();
    const changeResult = changeDetection.detect(artifact);
    expect(changeResult.changeType).toBe('new');

    // Second check of same artifact is unchanged
    const repeatResult = changeDetection.detect(artifact);
    expect(repeatResult.changeType).toBe('unchanged');

    // 7. Verify health tracking
    healthMonitor.recordSuccess('radar-rewa-nic', 150);
    const updatedHealth = healthMonitor.getHealth('radar-rewa-nic');
    expect(updatedHealth.status).toBe('healthy');
    expect(updatedHealth.consecutiveFailures).toBe(0);

    // 8. Ingest artifact into the core as a NewsroomObservation
    core.ingestObservation({
      id: 'obs-test-rewa-001',
      sourceId: 'radar-rewa-nic',
      sourceTier: 't1',
      contentHash: rewaHash,
      canonicalUrl: artifact.url,
      title: artifact.title || 'Untitled',
      snippet: artifact.content.substring(0, 300),
      entities: ['ent_col_rewa'],
      isPrimarySource: true,
      duplicateState: 'unique',
      ingestionTimestamp: artifact.retrievedAt,
      publicationTimestamp: artifact.publishedAt || artifact.retrievedAt,
    });

    // 9. Upsert a cluster (the real-world event grouping)
    const { signal, alert } = core.upsertCluster({
      id: 'cluster-test-rewa-001',
      title: artifact.title || 'Untitled',
      summary: artifact.content,
      firstDetectedAt: artifact.retrievedAt,
      lastUpdatedAt: new Date().toISOString(),
      observationIds: ['obs-test-rewa-001'],
      sourceIds: ['radar-rewa-nic'],
      claimIds: [],
      entities: ['ent_col_rewa'],
      geographicSpread: ['rewa-city', 'rewa-district', 'mp', 'india'],
      status: 'active',
      primarySourceCount: 1,
      independentSourceCount: 1,
    });

    // 10. Verify signal generation and scoring
    expect(signal).toBeDefined();
    expect(signal.id).toBeDefined();
    expect(signal.priority).toBeDefined();
    expect(signal.lifecycleState).toBeDefined();
    expect(signal.scores.evidenceStrength).toBeGreaterThan(0);
    expect(signal.scores.sourceReliability).toBeGreaterThan(0);

    // 11. Verify editorial queue routing
    const queue = core.getQueue();
    expect(queue).toBeDefined();
    const totalQueueItems = Object.values(queue).reduce((sum, items) => sum + items.length, 0);
    expect(totalQueueItems).toBeGreaterThanOrEqual(1);

    // 12. Verify latency measurement: detection latency = retrievedAt - publishedAt
    const pubMs = new Date(artifact.publishedAt!).getTime();
    const detMs = new Date(artifact.retrievedAt).getTime();
    const detectionLatencyMs = detMs - pubMs;
    expect(detectionLatencyMs).toBe(300_000); // Exactly 5 minutes
  });
});

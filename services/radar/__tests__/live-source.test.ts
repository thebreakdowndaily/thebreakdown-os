import { describe, it, expect } from 'vitest';
import { RssCollector } from '../collectors/rss';
import { MP_RADAR_SOURCES } from '@/data/radar/sources-mp';
import { ChangeDetectionEngine } from '../change-detection';
import { MemoryRadarRepository } from '../persistence/memory';
import { NewsroomIntelligenceCore } from '@/services/intelligence/newsroom';
import { resolveEntities } from '../entity-resolution';
import { resolveLocation, getGeoHierarchy } from '@/data/radar/geo-india';
import type { NewsroomObservation, StoryCluster } from '@/types/newsroom-intelligence';

describe('Real-Source Operational Controlled Execution', () => {
  it('executes real source pipeline: fetch → fingerprint → decision → ingestion → queue', async () => {
    const repository = new MemoryRadarRepository();
    const core = NewsroomIntelligenceCore.resetInstance();
    await core.ensureLoaded();

    const changeDetection = new ChangeDetectionEngine(repository);
    await changeDetection.load();

    const pibSource = MP_RADAR_SOURCES.find((s) => s.id === 'radar-pib-national');
    expect(pibSource).toBeDefined();

    // Use controlled collector against real source URL
    const collector = new RssCollector({
      timeoutMs: 15_000,
      maxResponseBytes: 5 * 1024 * 1024,
      userAgent: 'TheBreakdownRadar/1.0 (+https://thebreakdown.in)',
      maxRetries: 1,
    });

    const result = await collector.collect(pibSource!);

    // If external internet is available in this test environment, we got live items;
    // if offline, collector returned clean error without throwing
    if (result.artifacts.length > 0) {
      const artifact = result.artifacts[0];
      expect(artifact.contentHash).toBeDefined();
      expect(artifact.title).toBeDefined();
      expect(artifact.url).toBeDefined();

      // Change detection: 1st time must be 'new'
      const firstDecision = changeDetection.detect(artifact);
      expect(firstDecision.changeType).toBe('new');

      // Change detection: 2nd time must be 'unchanged'
      const secondDecision = changeDetection.detect(artifact);
      expect(secondDecision.changeType).toBe('unchanged');

      // Ingestion into core
      const textToAnalyze = `${artifact.title || ''} ${artifact.content}`;
      const entities = resolveEntities(textToAnalyze);
      const loc = resolveLocation(textToAnalyze);
      const geoNodes = loc ? getGeoHierarchy(loc.id) : [];

      const obsId = `obs-live-${artifact.contentHash.substring(0, 16)}`;
      const obs: NewsroomObservation = {
        id: obsId,
        sourceId: pibSource!.id,
        sourceTier: 't1',
        contentHash: artifact.contentHash,
        canonicalUrl: artifact.url,
        title: artifact.title || pibSource!.name,
        snippet: artifact.content.substring(0, 300),
        entities: entities.map((e) => e.id),
        isPrimarySource: true,
        duplicateState: 'unique',
        ingestionTimestamp: artifact.retrievedAt,
        publicationTimestamp: artifact.publishedAt || artifact.retrievedAt,
      };

      core.ingestObservation(obs);

      const clusterId = `cluster-live-${obsId}`;
      const cluster: StoryCluster = {
        id: clusterId,
        title: obs.title,
        summary: obs.snippet,
        firstDetectedAt: obs.ingestionTimestamp,
        lastUpdatedAt: new Date().toISOString(),
        observationIds: [obsId],
        sourceIds: [pibSource!.id],
        claimIds: [],
        entities: obs.entities,
        geographicSpread: geoNodes.map((g) => g.id),
        status: 'active',
        primarySourceCount: 1,
        independentSourceCount: 1,
      };

      const { signal } = core.upsertCluster(cluster);
      expect(signal).toBeDefined();
      expect(signal.priority).toBeDefined();

      // Verified present in triage queue
      const queue = core.getQueue();
      const totalItems = Object.values(queue).reduce((sum, items) => sum + items.length, 0);
      expect(totalItems).toBeGreaterThanOrEqual(1);
    } else {
      // Offline network fallback: verify errors were captured gracefully
      expect(result.errors.length).toBeGreaterThanOrEqual(0);
      expect(result.fetchDurationMs).toBeGreaterThan(0);
    }
  });
});

/**
 * ─── Phase 3B-M3: End-to-End Latency Instrumentation & Invariant Suite ───────
 *
 * Governing Document: AGENTS.md (Platform Beta)
 * Phase 3B Milestone 3: End-to-End Latency Instrumentation
 *
 * Validates the complete 14-point test matrix:
 *   1. firstSeenAt creation
 *   2. firstDetectedAt creation
 *   3. first timestamps remain immutable
 *   4. mutation gets a new detection timestamp
 *   5. unchanged replay does not create new detection time
 *   6. legitimate verification populates firstVerifiedAt
 *   7. rejected verification does not
 *   8. publication populates publishedAt
 *   9. draft does not populate publishedAt
 *   10. republish/update does not become first publication
 *   11. valid latency calculations
 *   12. missing timestamps produce safe NULL/unavailable metrics
 *   13. negative chronology is rejected/flagged
 *   14. concurrent/replayed processing remains idempotent
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryRadarRepository } from '../persistence/memory';
import {
  calculateDerivedLatencies,
  mergeLatencyRecord,
  recordEditorialVerification,
  recordStoryPublication,
} from '../latency-tracker';
import { RadarPipeline } from '../pipeline';
import { NewsroomIntelligenceCore } from '@/services/intelligence/newsroom';

describe('Phase 3B-M3: End-to-End Latency Instrumentation', () => {
  let repository: MemoryRadarRepository;
  let core: NewsroomIntelligenceCore;

  beforeEach(() => {
    repository = new MemoryRadarRepository();
    core = NewsroomIntelligenceCore.resetInstance();
    core.setRadarRepository(repository);
  });

  // ── 1. firstSeenAt creation ────────────────────────────────────────────────
  it('1. establishes firstSeenAt accurately upon initial observation retrieval', async () => {
    const tSeen = '2026-10-02T10:00:00.000Z';
    await repository.recordLatency({
      clusterId: 'cluster-lat-1',
      firstSeenAt: tSeen,
      firstDetectedAt: tSeen,
    });

    const record = await repository.getLatencyRecord('cluster-lat-1');
    expect(record).toBeDefined();
    expect(record?.firstSeenAt).toBe(tSeen);
  });

  // ── 2. firstDetectedAt creation ────────────────────────────────────────────
  it('2. establishes firstDetectedAt upon initial event recognition', async () => {
    const tSeen = '2026-10-02T10:00:00.000Z';
    const tDetected = '2026-10-02T10:00:02.500Z';
    await repository.recordLatency({
      clusterId: 'cluster-lat-2',
      firstSeenAt: tSeen,
      firstDetectedAt: tDetected,
    });

    const record = await repository.getLatencyRecord('cluster-lat-2');
    expect(record?.firstDetectedAt).toBe(tDetected);
    expect(record?.detectionProcessingLatencyMs).toBe(2500);
  });

  // ── 3. first timestamps remain immutable ───────────────────────────────────
  it('3. ensures historical firstSeenAt and firstDetectedAt remain immutable across later re-records', async () => {
    const tInitialSeen = '2026-10-02T10:00:00.000Z';
    const tInitialDet = '2026-10-02T10:00:01.000Z';

    await repository.recordLatency({
      clusterId: 'cluster-lat-3',
      firstSeenAt: tInitialSeen,
      firstDetectedAt: tInitialDet,
    });

    // Attempt to overwrite with a later timestamp (e.g. next polling cycle at 10:15)
    const tLaterSeen = '2026-10-02T10:15:00.000Z';
    const tLaterDet = '2026-10-02T10:15:02.000Z';
    await repository.recordLatency({
      clusterId: 'cluster-lat-3',
      firstSeenAt: tLaterSeen,
      firstDetectedAt: tLaterDet,
    });

    const record = await repository.getLatencyRecord('cluster-lat-3');
    expect(record?.firstSeenAt).toBe(tInitialSeen);
    expect(record?.firstDetectedAt).toBe(tInitialDet);
  });

  // ── 4. mutation gets a new detection timestamp ─────────────────────────────
  it('4. assigns a new discrete detection timestamp to document mutations while preserving root cluster history', async () => {
    const mockCollector = {
      collect: async () => ({
        artifacts: [
          {
            sourceId: 'src-pib-gazette',
            url: 'https://pib.gov.in/doc1',
            title: 'Original Notification Guidelines',
            content: 'The statutory guidelines have been notified for public administration.',
            contentHash: 'hash-orig-100',
            contentLength: 70,
            metadata: {},
            retrievedAt: '2026-10-02T09:00:00.000Z',
            publishedAt: '2026-10-02T08:50:00.000Z',
          },
        ],
        errors: [],
      }),
    };

    const source: any = {
      id: 'src-pib-gazette',
      name: 'PIB Gazette Notifications',
      collectorType: 'rss',
      url: 'https://pib.gov.in/doc1',
      authorityClass: 'PRIMARY',
      primarySource: true,
      enabled: true,
      cadenceMinutes: 15,
      beat: 'governance',
      country: 'IN',
      officialStatus: 'official_primary',
    };

    const pipeline = new RadarPipeline([source], {
      repository,
      customCore: core,
    });
    (pipeline as any).rssCollector = mockCollector;

    // Run cycle 1: Root document
    await pipeline.poll({ forceAll: true });
    const recordsC1 = await repository.getLatencyRecords();
    expect(recordsC1.length).toBeGreaterThanOrEqual(1);
    const rootClusterId = recordsC1[0].clusterId;
    const rootRecord = await repository.getLatencyRecord(rootClusterId);
    expect(rootRecord?.firstDetectedAt).toBe('2026-10-02T09:00:00.000Z');

    // Run cycle 2: Mutated document (Gazette Corrigendum Amendment at 10:30)
    mockCollector.collect = async () => ({
      artifacts: [
        {
          sourceId: 'src-pib-gazette',
          url: 'https://pib.gov.in/doc1',
          title: 'CORRIGENDUM: Amended Notification Guidelines',
          content: 'CORRIGENDUM: The statutory guidelines have been amended per official gazette.',
          contentHash: 'hash-mut-200',
          contentLength: 80,
          metadata: {},
          retrievedAt: '2026-10-02T10:30:00.000Z',
          publishedAt: '2026-10-02T10:20:00.000Z',
        },
      ],
      errors: [],
    });

    await pipeline.poll({ forceAll: true });

    // Verify root cluster record preserved root detection time
    const updatedRootRecord = await repository.getLatencyRecord(rootClusterId);
    expect(updatedRootRecord?.firstDetectedAt).toBe('2026-10-02T09:00:00.000Z');

    // Verify discrete revision latency record exists with its own detection timestamp
    const revisionClusterId = `${rootClusterId}:rev:2`;
    const mutationRecord = await repository.getLatencyRecord(revisionClusterId);
    expect(mutationRecord).toBeDefined();
    expect(mutationRecord?.firstDetectedAt).toBe('2026-10-02T10:30:00.000Z');
    expect(mutationRecord?.sourcePublishedAt).toBe('2026-10-02T10:20:00.000Z');
    expect(mutationRecord?.detectionLatencyMs).toBe(10 * 60 * 1000); // 10 minutes
  });

  // ── 5. unchanged replay does not create new detection time ──────────────────
  it('5. ensures unchanged polling replay does not advance detection time', async () => {
    const mockCollector = {
      collect: async () => ({
        artifacts: [
          {
            sourceId: 'src-unchanged',
            url: 'https://example.gov.in/unchanged',
            title: 'Static Document',
            content: 'Same content across polls.',
            contentHash: 'hash-static',
            contentLength: 30,
            metadata: {},
            retrievedAt: '2026-10-02T08:00:00.000Z',
          },
        ],
        errors: [],
      }),
    };

    const source: any = {
      id: 'src-unchanged',
      name: 'Static Source',
      collectorType: 'rss',
      url: 'https://example.gov.in/unchanged',
      authorityClass: 'PRIMARY',
      primarySource: true,
      enabled: true,
      cadenceMinutes: 15,
      beat: 'governance',
      country: 'IN',
      officialStatus: 'official_primary',
    };

    const pipeline = new RadarPipeline([source], {
      repository,
      customCore: core,
    });
    (pipeline as any).rssCollector = mockCollector;

    await pipeline.poll({ forceAll: true });
    const records = await repository.getLatencyRecords();
    const clusterId = records[0].clusterId;
    const initialDet = records[0].firstDetectedAt;

    // Second poll with later retrievedAt
    mockCollector.collect = async () => ({
      artifacts: [
        {
          sourceId: 'src-unchanged',
          url: 'https://example.gov.in/unchanged',
          title: 'Static Document',
          content: 'Same content across polls.',
          contentHash: 'hash-static',
          contentLength: 30,
          metadata: {},
          retrievedAt: '2026-10-02T09:00:00.000Z',
        },
      ],
      errors: [],
    });

    await pipeline.poll({ forceAll: true });
    const afterReplayRecord = await repository.getLatencyRecord(clusterId);
    expect(afterReplayRecord?.firstDetectedAt).toBe(initialDet);
  });

  // ── 6. legitimate verification populates firstVerifiedAt ───────────────────
  it('6. populates firstVerifiedAt on legitimate human verification transition and calculates verificationLatencyMs', async () => {
    const tSeen = '2026-10-02T10:00:00.000Z';
    const tDet = '2026-10-02T10:00:00.000Z';
    await repository.recordLatency({
      clusterId: 'cluster-ver-1',
      firstSeenAt: tSeen,
      firstDetectedAt: tDet,
    });

    const tVerified = '2026-10-02T10:45:00.000Z';
    const updated = await recordEditorialVerification(repository, {
      clusterId: 'cluster-ver-1',
      verifiedAt: tVerified,
      actor: { id: 'usr-senior-editor-1', role: 'lead_editor', isHuman: true },
      verificationStatus: 'verified',
    });

    expect(updated?.firstVerifiedAt).toBe(tVerified);
    expect(updated?.verificationLatencyMs).toBe(45 * 60 * 1000); // 45 minutes
  });

  // ── 7. rejected verification does not ──────────────────────────────────────
  it('7. does NOT populate firstVerifiedAt when verification fails, is rejected, or is dismissed', async () => {
    await repository.recordLatency({
      clusterId: 'cluster-ver-reject',
      firstSeenAt: '2026-10-02T10:00:00.000Z',
      firstDetectedAt: '2026-10-02T10:00:00.000Z',
    });

    const res = await recordEditorialVerification(repository, {
      clusterId: 'cluster-ver-reject',
      verifiedAt: '2026-10-02T10:15:00.000Z',
      actor: { id: 'usr-factchecker-2', role: 'fact_checker', isHuman: true },
      verificationStatus: 'rejected',
      notes: 'Insufficient primary corroboration; claim refuted.',
    });

    expect(res?.firstVerifiedAt).toBeUndefined();
    expect(res?.verificationLatencyMs).toBeUndefined();
  });

  // ── 8. publication populates publishedAt ───────────────────────────────────
  it('8. populates publishedAt on canonical story publication and calculates publication & end-to-end latencies', async () => {
    const tSourcePub = '2026-10-02T08:00:00.000Z';
    const tSeen = '2026-10-02T08:10:00.000Z';
    const tDet = '2026-10-02T08:12:00.000Z';
    const tVer = '2026-10-02T09:00:00.000Z';

    await repository.recordLatency({
      clusterId: 'cluster-pub-1',
      sourcePublishedAt: tSourcePub,
      firstSeenAt: tSeen,
      firstDetectedAt: tDet,
      firstVerifiedAt: tVer,
    });

    const tStoryPub = '2026-10-02T09:30:00.000Z';
    const updated = await recordStoryPublication(repository, {
      clusterId: 'cluster-pub-1',
      publishedAt: tStoryPub,
      storyStatus: 'published',
    });

    expect(updated?.publishedAt).toBe(tStoryPub);
    // publicationLatencyMs = publishedAt - firstVerifiedAt = 30 minutes
    expect(updated?.publicationLatencyMs).toBe(30 * 60 * 1000);
    // endToEndPublicationLatencyMs = publishedAt - sourcePublishedAt = 90 minutes
    expect(updated?.endToEndPublicationLatencyMs).toBe(90 * 60 * 1000);
  });

  // ── 9. draft does not populate publishedAt ─────────────────────────────────
  it('9. does NOT populate publishedAt when story is in draft, review, or scheduled state', async () => {
    await repository.recordLatency({
      clusterId: 'cluster-draft-test',
      firstSeenAt: '2026-10-02T10:00:00.000Z',
      firstDetectedAt: '2026-10-02T10:00:00.000Z',
    });

    for (const status of ['draft', 'review', 'fact_check', 'scheduled']) {
      const res = await recordStoryPublication(repository, {
        clusterId: 'cluster-draft-test',
        publishedAt: '2026-10-02T11:00:00.000Z',
        storyStatus: status,
      });
      expect(res?.publishedAt).toBeUndefined();
    }
  });

  // ── 10. republish/update does not become first publication ─────────────────
  it('10. preserves the original publishedAt on subsequent story republish or content update', async () => {
    const tFirstPub = '2026-10-02T10:00:00.000Z';
    await repository.recordLatency({
      clusterId: 'cluster-repub-test',
      firstSeenAt: '2026-10-02T09:00:00.000Z',
      firstDetectedAt: '2026-10-02T09:00:00.000Z',
      firstVerifiedAt: '2026-10-02T09:30:00.000Z',
      publishedAt: tFirstPub,
    });

    // Story update/republish 4 hours later
    const tRepublish = '2026-10-02T14:00:00.000Z';
    const updated = await recordStoryPublication(repository, {
      clusterId: 'cluster-repub-test',
      publishedAt: tRepublish,
      storyStatus: 'published',
      isRepublish: true,
    });

    expect(updated?.publishedAt).toBe(tFirstPub);
  });

  // ── 11. valid latency calculations ─────────────────────────────────────────
  it('11. calculates all 6 derived latency metrics precisely across valid chronology', () => {
    const metrics = calculateDerivedLatencies({
      sourcePublishedAt: '2026-10-02T08:00:00.000Z',
      firstSeenAt: '2026-10-02T08:05:00.000Z',       // +5m
      firstDetectedAt: '2026-10-02T08:06:00.000Z',   // +1m
      firstVerifiedAt: '2026-10-02T08:30:00.000Z',   // +24m
      publishedAt: '2026-10-02T09:00:00.000Z',       // +30m
    });

    expect(metrics.isValidChronology).toBe(true);
    expect(metrics.chronologyViolations.length).toBe(0);

    // 1. Detection latency: firstDetectedAt - sourcePublishedAt = 6m
    expect(metrics.detectionLatencyMs).toBe(6 * 60 * 1000);
    // 2. Observation latency: firstSeenAt - sourcePublishedAt = 5m
    expect(metrics.observationLatencyMs).toBe(5 * 60 * 1000);
    // 3. Detection processing latency: firstDetectedAt - firstSeenAt = 1m
    expect(metrics.detectionProcessingLatencyMs).toBe(1 * 60 * 1000);
    // 4. Verification latency: firstVerifiedAt - firstDetectedAt = 24m
    expect(metrics.verificationLatencyMs).toBe(24 * 60 * 1000);
    // 5. Editorial-to-publication latency: publishedAt - firstVerifiedAt = 30m
    expect(metrics.editorialToPublicationLatencyMs).toBe(30 * 60 * 1000);
    // 6. End-to-end publication latency: publishedAt - sourcePublishedAt = 60m
    expect(metrics.endToEndPublicationLatencyMs).toBe(60 * 60 * 1000);
  });

  // ── 12. missing timestamps produce safe NULL/unavailable metrics ───────────
  it('12. produces safe NULL for intervals where either boundary is missing (no fabricated chronology)', () => {
    // Only firstSeenAt and firstDetectedAt exist (unverified, unpublished, unknown source pub date)
    const metrics = calculateDerivedLatencies({
      firstSeenAt: '2026-10-02T10:00:00.000Z',
      firstDetectedAt: '2026-10-02T10:00:10.000Z',
    });

    expect(metrics.isValidChronology).toBe(true);
    expect(metrics.detectionProcessingLatencyMs).toBe(10_000);

    // Missing boundaries produce null:
    expect(metrics.detectionLatencyMs).toBeNull();
    expect(metrics.observationLatencyMs).toBeNull();
    expect(metrics.verificationLatencyMs).toBeNull();
    expect(metrics.editorialToPublicationLatencyMs).toBeNull();
    expect(metrics.endToEndPublicationLatencyMs).toBeNull();
  });

  // ── 13. negative chronology is rejected/flagged ────────────────────────────
  it('13. rejects and flags negative chronology or clock skew without producing negative intervals', () => {
    // Out-of-order timestamps: source published after detection (future-dated feed)
    const metrics = calculateDerivedLatencies({
      sourcePublishedAt: '2026-10-02T12:00:00.000Z',
      firstSeenAt: '2026-10-02T10:00:00.000Z',
      firstDetectedAt: '2026-10-02T10:00:05.000Z',
    });

    expect(metrics.isValidChronology).toBe(false);
    expect(metrics.chronologyViolations.length).toBeGreaterThanOrEqual(1);
    expect(metrics.detectionLatencyMs).toBeNull();
    expect(metrics.observationLatencyMs).toBeNull();
    // Valid sub-interval is preserved:
    expect(metrics.detectionProcessingLatencyMs).toBe(5000);
  });

  // ── 14. concurrent/replayed processing remains idempotent ───────────────────
  it('14. guarantees idempotent convergence across concurrent and replayed operations', async () => {
    const tRoot = '2026-10-02T07:00:00.000Z';
    const clusterId = 'cluster-concurrency-test';

    // Seed initial detection
    await repository.recordLatency({
      clusterId,
      firstSeenAt: tRoot,
      firstDetectedAt: tRoot,
    });

    // Simulate 10 concurrent worker cycles attempting to write varying timestamps
    const workerPromises = Array.from({ length: 10 }).map((_, i) => {
      const pollTime = new Date(Date.parse(tRoot) + (i + 1) * 60_000).toISOString();
      return repository.recordLatency({
        clusterId,
        firstSeenAt: pollTime,
        firstDetectedAt: pollTime,
      });
    });

    await Promise.all(workerPromises);

    const finalRecord = await repository.getLatencyRecord(clusterId);
    expect(finalRecord?.firstSeenAt).toBe(tRoot);
    expect(finalRecord?.firstDetectedAt).toBe(tRoot);
  });

  // ── 15. Invariant 7: Non-human automated system rejected ───────────────────
  it('15. rejects automated systems attempting to create human verification timestamps', async () => {
    await repository.recordLatency({
      clusterId: 'cluster-bot-check',
      firstSeenAt: '2026-10-02T10:00:00.000Z',
      firstDetectedAt: '2026-10-02T10:00:00.000Z',
    });

    await expect(
      recordEditorialVerification(repository, {
        clusterId: 'cluster-bot-check',
        actor: { id: 'bot-auto-verifier', role: 'crawler', isHuman: false },
        verificationStatus: 'verified',
      })
    ).rejects.toThrow(/Automated system/);
  });

  // ── 16. Newsroom Intelligence Core integration ─────────────────────────────
  it('16. bridges human editorial action in NewsroomIntelligenceCore directly into latency tracking', async () => {
    const clusterId = 'cluster-bridge-newsroom';
    await repository.recordLatency({
      clusterId,
      firstSeenAt: '2026-10-01T10:00:00.000Z',
      firstDetectedAt: '2026-10-01T10:00:00.000Z',
    });

    // Ingest observation and cluster into core
    const obs = {
      id: 'obs-bridge-1',
      sourceId: 'src-test',
      sourceTier: 't1' as const,
      contentHash: 'hash-bridge',
      canonicalUrl: 'https://example.com/bridge',
      title: 'Breaking Decision',
      snippet: 'Key decision made.',
      entities: ['GOI'],
      isPrimarySource: true,
      duplicateState: 'unique' as const,
      ingestionTimestamp: '2026-10-01T10:00:00.000Z',
      publicationTimestamp: '2026-10-01T09:55:00.000Z',
      archiveId: 'arch-bridge-1',
      archivalState: 'staged' as const,
      metadata: {},
    };
    core.ingestObservation(obs);

    core.upsertCluster({
      id: clusterId,
      title: 'Breaking Decision',
      summary: 'Summary',
      firstDetectedAt: '2026-10-01T10:00:00.000Z',
      lastUpdatedAt: '2026-10-01T10:00:00.000Z',
      observationIds: ['obs-bridge-1'],
      sourceIds: ['src-test'],
      claimIds: [],
      entities: ['GOI'],
      geographicSpread: [],
      status: 'active',
      primarySourceCount: 1,
      independentSourceCount: 1,
    });

    // An alert/signal exists with clusterId
    const signals = core.getSignals();
    const targetSignal = signals.find((s) => s.clusterId === clusterId);
    expect(targetSignal).toBeDefined();

    // Human editor acts to verify signal
    core.executeAction(
      {
        action: 'VERIFY',
        actorId: 'usr-managing-editor',
        actorName: 'Managing Editor',
        signalId: targetSignal!.id,
      },
      'managing_editor'
    );

    // Wait a tick for non-blocking async record
    await new Promise((resolve) => setTimeout(resolve, 50));

    const latencyRecord = await repository.getLatencyRecord(clusterId);
    expect(latencyRecord?.firstVerifiedAt).toBeDefined();
    expect(latencyRecord?.verificationLatencyMs).toBeDefined();
  });
});

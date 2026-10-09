/**
 * ─── Phase 3B Milestone 2: Document Mutation & Observation Reconciliation ─────
 *
 * Test Matrix Criteria:
 *   1. New document
 *   2. Identical repeat fetch
 *   3. Same URL / changed fingerprint
 *   4. Same URL / repeated mutation
 *   5. Corrected document where supported
 *   6. Withdrawn document where supported
 *   7. Superseded document where supported
 *   8. Different URLs / same syndicated content
 *   9. Replay of the same mutation
 *  10. Process restart / idempotency
 *  11. Mutation reaches ImpactAnalyzer
 *  12. Mutation creates/updates the proper editorial review task
 *  13. Previous state remains auditable
 *  14. Public story is NOT modified automatically
 *  15. Publication state is NOT changed automatically
 *  16. Canonical evidence is NOT silently overwritten
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createHash } from 'node:crypto';
import {
  ChangeDetectionEngine,
  computeContentHash,
  resolveDocumentChangeState,
  detectDocumentMutationMarkers,
} from '../change-detection';
import { RadarPipeline } from '../pipeline';
import { NewsroomIntelligenceCore } from '@/services/intelligence/newsroom';
import { MemoryStateRepository } from '@/services/intelligence/newsroom/persistence/memory';
import { globalEditorialQueue } from '@/services/lifecycle/queue/EditorialQueue';
import { ChangeDetector } from '@/services/lifecycle/change-detector/ChangeDetector';
import { ImpactAnalyzer } from '@/services/lifecycle/impact-analyzer/ImpactAnalyzer';
import { getPublicStories } from '@/utils/data-layer/store';
import type { RadarSourceDefinition, RawArtifact } from '../types';
import type { NewsroomObservation, StoryCluster } from '@/types/newsroom-intelligence';
import type { NormalizedDocument } from '@/services/lifecycle/providers/SourceProvider';

describe('PHASE 3B-M2: DOCUMENT MUTATION & OBSERVATION RECONCILIATION', () => {
  let core: NewsroomIntelligenceCore;
  let memoryRepo: MemoryStateRepository;

  beforeEach(() => {
    memoryRepo = new MemoryStateRepository();
    core = NewsroomIntelligenceCore.resetInstance(memoryRepo);
    core.clear();
  });

  const testSource: RadarSourceDefinition = {
    id: 'radar-test-gazette',
    name: 'MP Government Gazette',
    url: 'https://gazette.mp.gov.in/orders/2026/order-441.pdf',
    authorityClass: 'PRIMARY',
    officialStatus: 'official_primary',
    country: 'IN',
    state: 'mp',
    beat: 'government',
    pollIntervalMinutes: 30,
    collectorType: 'html',
    enabled: true,
  } as unknown as RadarSourceDefinition;

  const createObservation = (
    id: string,
    url: string,
    content: string,
    retrievedAt: string = new Date().toISOString(),
    metadata: Record<string, unknown> = {}
  ): NewsroomObservation => ({
    id,
    sourceId: testSource.id,
    canonicalUrl: url,
    title: 'Order No. 441 Gazette Notification',
    snippet: content.substring(0, 300),
    contentHash: computeContentHash(content),
    publicationTimestamp: retrievedAt,
    ingestionTimestamp: retrievedAt,
    sourceTier: 't1',
    isPrimarySource: true,
    duplicateState: 'unique',
    entities: ['mp-govt'],
    metadata,
  });

  // ── 1. New document ──────────────────────────────────────────────────────────
  it('1. New document: Ingests first-seen resource with initial revision', () => {
    const url = 'https://gazette.mp.gov.in/orders/2026/order-441.pdf';
    const content = 'Government of Madhya Pradesh Notification Order 441.';
    const obs = createObservation('obs-v1', url, content);

    core.ingestObservation(obs);

    const stored = core.getObservations();
    expect(stored.length).toBe(1);
    expect(stored[0].id).toBe('obs-v1');
    expect(stored[0].canonicalUrl).toBe(url);
    expect(stored[0].contentHash).toBe(computeContentHash(content));
    expect(stored[0].duplicateState).toBe('unique');
  });

  // ── 2. Identical repeat fetch ────────────────────────────────────────────────
  it('2. Identical repeat fetch: Deduplicates identical content at same URL', () => {
    const url = 'https://gazette.mp.gov.in/orders/2026/order-441.pdf';
    const content = 'Government of Madhya Pradesh Notification Order 441.';
    const obs1 = createObservation('obs-v1', url, content);
    const obs1Repeat = createObservation('obs-v1-repeat', url, content);

    core.ingestObservation(obs1);
    core.ingestObservation(obs1Repeat);

    const stored = core.getObservations();
    expect(stored.length).toBe(1);
    expect(stored[0].id).toBe('obs-v1');
  });

  // ── 3. Same URL / changed fingerprint ────────────────────────────────────────
  it('3. Same URL / changed fingerprint: Preserves mutated revision without destroying prior state', () => {
    const url = 'https://gazette.mp.gov.in/orders/2026/order-441.pdf';
    const contentV1 = 'Government of Madhya Pradesh Notification Order 441.';
    const contentV2 = 'Government of Madhya Pradesh Notification Order 441 (Amended clause 4).';

    const obs1 = createObservation('obs-v1', url, contentV1, '2026-10-01T10:00:00Z');
    const obs2 = createObservation('obs-v2', url, contentV2, '2026-10-01T10:30:00Z');

    core.ingestObservation(obs1);
    core.ingestObservation(obs2);

    const stored = core.getObservations();
    expect(stored.length).toBe(2);

    const v1 = stored.find((o) => o.id === 'obs-v1');
    const v2 = stored.find((o) => o.id === 'obs-v2');

    expect(v1).toBeDefined();
    expect(v2).toBeDefined();
    expect(v1?.contentHash).toBe(computeContentHash(contentV1));
    expect(v2?.contentHash).toBe(computeContentHash(contentV2));

    // Linkage preserved
    expect(v2?.duplicateOfId).toBe('obs-v1');
    expect(v2?.metadata?.isMutation).toBe(true);
    expect(v2?.metadata?.previousObservationId).toBe('obs-v1');
    expect(v2?.metadata?.previousContentHash).toBe(v1?.contentHash);
    expect(v2?.metadata?.newContentHash).toBe(v2?.contentHash);
    expect(v2?.metadata?.revisionNumber).toBe(2);
  });

  // ── 4. Same URL / repeated mutation ──────────────────────────────────────────
  it('4. Same URL / repeated mutation: Each material mutation remains historically recoverable', () => {
    const url = 'https://gazette.mp.gov.in/orders/2026/order-441.pdf';
    const c1 = 'Version 1 of Gazette Order.';
    const c2 = 'Version 2 of Gazette Order with initial amendment.';
    const c3 = 'Version 3 of Gazette Order with final corrigendum.';

    const obs1 = createObservation('obs-v1', url, c1, '2026-10-01T08:00:00Z');
    const obs2 = createObservation('obs-v2', url, c2, '2026-10-01T09:00:00Z');
    const obs3 = createObservation('obs-v3', url, c3, '2026-10-01T10:00:00Z');

    core.ingestObservation(obs1);
    core.ingestObservation(obs2);
    core.ingestObservation(obs3);

    const stored = core.getObservations();
    expect(stored.length).toBe(3);

    const urlHistory = core.getObservationsForUrl(url);
    expect(urlHistory.length).toBe(3);

    const v3 = core.getObservation('obs-v3');
    expect(v3?.duplicateOfId).toBe('obs-v2');
    expect(v3?.metadata?.revisionNumber).toBe(3);
    expect(v3?.metadata?.previousContentHash).toBe(computeContentHash(c2));
  });

  // ── 5. Corrected document where supported ────────────────────────────────────
  it('5. Corrected document: Resolves CORRECTED state for legal corrigenda / शुद्धिपत्र', () => {
    const markersLatin = detectDocumentMutationMarkers('Corrigendum: Order No. 441');
    expect(markersLatin.isCorrigendum).toBe(true);

    const markersHindi = detectDocumentMutationMarkers('शुद्धिपत्र क्रमांक 441');
    expect(markersHindi.isCorrigendum).toBe(true);

    const state = resolveDocumentChangeState('changed', { isCorrigendum: true });
    expect(state).toBe('CORRECTED');

    const obs = createObservation('obs-corr', 'https://gazette.mp.gov.in/c441', 'शुद्धिपत्र शुद्धि', undefined, {
      changeType: state,
    });
    core.ingestObservation(obs);

    expect(core.getObservation('obs-corr')?.metadata?.changeType).toBe('CORRECTED');
  });

  // ── 6. Withdrawn document where supported ────────────────────────────────────
  it('6. Withdrawn document: Preserves withdrawal signal when HTTP 404/410 or recall notice occurs', () => {
    const state404 = resolveDocumentChangeState('changed', {}, 404);
    expect(state404).toBe('WITHDRAWN');

    const state410 = resolveDocumentChangeState('changed', {}, 410);
    expect(state410).toBe('WITHDRAWN');

    const markersRecall = detectDocumentMutationMarkers('Order 441 has been withdrawn by Government.');
    expect(markersRecall.isWithdrawn).toBe(true);

    const stateMarker = resolveDocumentChangeState('changed', { isWithdrawn: true });
    expect(stateMarker).toBe('WITHDRAWN');
  });

  // ── 7. Superseded document where supported ───────────────────────────────────
  it('7. Superseded document: Resolves SUPERSEDED state for amendments / supersessions', () => {
    const markersAmendment = detectDocumentMutationMarkers('संशोधन आदेश क्रमांक 441 supersedes earlier notification.');
    expect(markersAmendment.isAmendment).toBe(true);

    const state = resolveDocumentChangeState('changed', { isAmendment: true });
    expect(state).toBe('SUPERSEDED');
  });

  // ── 8. Different URLs / same syndicated content ──────────────────────────────
  it('8. Different URLs / same syndicated content: Preserves content-level deduplication across outlets', () => {
    const syndicatedContent = 'PTI WIRE: Union Cabinet clears national high-speed corridor project.';
    const obsWire = createObservation('obs-wire', 'https://wire.example.com/item-1', syndicatedContent);
    const obsReprint = createObservation('obs-reprint', 'https://daily.example.com/news-88', syndicatedContent);

    core.ingestObservation(obsWire);
    core.ingestObservation(obsReprint);

    // Exact content hash across different URL is deduplicated
    const stored = core.getObservations();
    expect(stored.length).toBe(1);
    expect(stored[0].id).toBe('obs-wire');
  });

  // ── 9. Replay of the same mutation ───────────────────────────────────────────
  it('9. Replay of the same mutation: Idempotently discards duplicate delivery of mutated revision', () => {
    const url = 'https://gazette.mp.gov.in/orders/2026/order-441.pdf';
    const obs1 = createObservation('obs-v1', url, 'Original order text.');
    const obs2 = createObservation('obs-v2', url, 'Amended order text.');
    const obs2Replay = createObservation('obs-v2-replay-worker', url, 'Amended order text.');

    core.ingestObservation(obs1);
    core.ingestObservation(obs2);
    expect(core.getObservations().length).toBe(2);

    // Replay with identical content hash for this URL
    core.ingestObservation(obs2Replay);
    expect(core.getObservations().length).toBe(2);
  });

  // ── 10. Process restart / idempotency ────────────────────────────────────────
  it('10. Process restart / idempotency: Survives serialization roundtrip without loss of mutation lineage', async () => {
    const url = 'https://gazette.mp.gov.in/orders/2026/order-441.pdf';
    core.ingestObservation(createObservation('obs-1', url, 'V1 text'));
    core.ingestObservation(createObservation('obs-2', url, 'V2 text amended'));

    // Trigger persist
    core.persist();

    // Re-initialize core over the same persisted repository
    const restoredCore = NewsroomIntelligenceCore.resetInstance(memoryRepo);
    await restoredCore.ensureLoaded();

    expect(restoredCore.getObservations().length).toBe(2);
    const v2 = restoredCore.getObservation('obs-2');
    expect(v2?.duplicateOfId).toBe('obs-1');
    expect(v2?.metadata?.isMutation).toBe(true);
    expect(v2?.metadata?.revisionNumber).toBe(2);
  });

  // ── 11. Mutation reaches ImpactAnalyzer ──────────────────────────────────────
  it('11. Mutation reaches ImpactAnalyzer: Lifecycle detector detects claim change and routes to ImpactAnalyzer', async () => {
    const oldDoc: NormalizedDocument = {
      id: 'doc-old',
      sourceId: testSource.id,
      title: 'Gazette Order 441',
      content: 'Interest rate fixed at 8.25% for 2026.',
      claims: [{ text: 'Interest rate fixed at 8.25% for 2026.' }],
      entities: ['mp-govt'],
      publishedAt: '2026-10-01T08:00:00Z',
      url: testSource.url,
    };

    const newDoc: NormalizedDocument = {
      id: 'doc-new',
      sourceId: testSource.id,
      title: 'Gazette Order 441 (Amended)',
      content: 'Interest rate revised to 8.50% for 2026.',
      claims: [{ text: 'Interest rate revised to 8.50% for 2026.' }],
      entities: ['mp-govt'],
      publishedAt: '2026-10-01T09:00:00Z',
      url: testSource.url,
    };

    const detector = new ChangeDetector();
    const diff = await detector.compare(oldDoc, newDoc);

    expect(diff.hasChanges).toBe(true);
    expect(diff.claimChanges.length).toBeGreaterThan(0);

    const analyzer = new ImpactAnalyzer();
    const tasks = await analyzer.analyze(diff);

    expect(tasks.length).toBe(1);
    expect(tasks[0].evidence.sourceId).toBe(testSource.id);
  });

  // ── 12. Mutation creates/updates the proper editorial review task ────────────
  it('12. Mutation creates/updates the proper editorial review task: Human verification task enqueued', async () => {
    const detector = new ChangeDetector();
    const analyzer = new ImpactAnalyzer();

    const oldDoc: NormalizedDocument = {
      id: 'doc-old-2',
      sourceId: testSource.id,
      title: 'Gazette Order',
      content: 'Section 1 applies.',
      claims: [{ text: 'Section 1 applies.' }],
      entities: ['mp-govt'],
      publishedAt: '2026-10-01T08:00:00Z',
      url: testSource.url,
    };
    const newDoc: NormalizedDocument = {
      id: 'doc-new-2',
      sourceId: testSource.id,
      title: 'Gazette Order',
      content: 'Section 1 revoked.',
      claims: [{ text: 'Section 1 revoked.' }],
      entities: ['mp-govt'],
      publishedAt: '2026-10-01T09:00:00Z',
      url: testSource.url,
    };

    const diff = await detector.compare(oldDoc, newDoc);
    const tasks = await analyzer.analyze(diff);

    for (const t of tasks) {
      globalEditorialQueue.enqueue(t);
    }

    const enqueued = globalEditorialQueue.getTask(tasks[0].id);
    expect(enqueued).toBeDefined();
    expect(enqueued?.status).toBe('pending'); // Human desk verification boundary
    expect(enqueued?.evidence.sourceId).toBe(testSource.id);
  });

  // ── 13. Previous state remains auditable ─────────────────────────────────────
  it('13. Previous state remains auditable: Original observation hash and snippet are immutable', () => {
    const url = 'https://gazette.mp.gov.in/orders/2026/order-441.pdf';
    const c1 = 'Original statutory notification.';
    const c2 = 'Corrigendum amending statutory notification.';

    core.ingestObservation(createObservation('obs-1', url, c1, '2026-10-01T08:00:00Z'));
    core.ingestObservation(createObservation('obs-2', url, c2, '2026-10-01T09:00:00Z'));

    const obs1 = core.getObservation('obs-1');
    const obs2 = core.getObservation('obs-2');

    expect(obs1?.snippet).toBe(c1);
    expect(obs1?.contentHash).toBe(computeContentHash(c1));
    expect(obs2?.snippet).toBe(c2);
    expect(obs2?.contentHash).toBe(computeContentHash(c2));
    expect(obs1?.contentHash).not.toBe(obs2?.contentHash);
  });

  // ── 14. Public story is NOT modified automatically ──────────────────────────
  it('14. Public story is NOT modified automatically: Store stories retain verified content', () => {
    const { data: initialStories } = getPublicStories({ pageSize: 10 });
    const initialStory = initialStories[0];

    // Trigger detection and mutation pipeline
    const url = 'https://gazette.mp.gov.in/orders/2026/order-441.pdf';
    core.ingestObservation(createObservation('obs-s1', url, 'Original content.'));
    core.ingestObservation(createObservation('obs-s2', url, 'Mutated content attempting overwrite.'));

    const { data: postStories } = getPublicStories({ pageSize: 10 });
    const postStory = postStories[0];

    expect(postStory.id).toBe(initialStory.id);
    expect(postStory.headline).toBe(initialStory.headline);
    expect(postStory.summary).toEqual(initialStory.summary);
  });

  // ── 15. Publication state is NOT changed automatically ───────────────────────
  it('15. Publication state is NOT changed automatically: Automation cannot publish or retract', () => {
    const { data: initialStories } = getPublicStories({ pageSize: 10 });
    const initialStorySlugs = initialStories.map((s) => s.slug || s.id);
    expect(initialStorySlugs.length).toBeGreaterThan(0);

    // Ingest mutation with withdrawal change type
    const url = 'https://gazette.mp.gov.in/orders/2026/order-441.pdf';
    core.ingestObservation(createObservation('obs-p1', url, 'Text 1'));
    core.ingestObservation(createObservation('obs-p2', url, 'Text 2 - retracted notification', undefined, {
      changeType: 'WITHDRAWN',
    }));

    const { data: storiesAfter } = getPublicStories({ pageSize: 10 });
    const afterSlugs = storiesAfter.map((s) => s.slug || s.id);

    // Publication state remains unchanged; zero public stories retracted or published automatically
    expect(afterSlugs).toEqual(initialStorySlugs);
    expect(storiesAfter.length).toBe(initialStories.length);
  });

  // ── 16. Canonical evidence is NOT silently overwritten ───────────────────────
  it('16. Canonical evidence is NOT silently overwritten: Claim registry remains authoritative', () => {
    const initialObservationCount = core.getObservations().length;
    const url = 'https://gazette.mp.gov.in/orders/2026/order-441.pdf';

    const obsA = createObservation('obs-ea', url, 'Statutory grant of Rs 500 Cr.');
    const obsB = createObservation('obs-eb', url, 'Corrigendum reducing statutory grant to Rs 300 Cr.', undefined, {
      changeType: 'CORRECTED',
    });

    core.ingestObservation(obsA);
    core.ingestObservation(obsB);

    // Both observations coexist as separate evidentiary records
    const obsList = core.getObservationsForUrl(url);
    expect(obsList.length).toBe(2);

    expect(obsList[0].snippet).toContain('Rs 500 Cr.');
    expect(obsList[1].snippet).toContain('Rs 300 Cr.');

    // Version 2 references version 1 as parent rather than overwriting it
    expect(obsList[1].duplicateOfId).toBe(obsList[0].id);
    expect(obsList[1].metadata?.previousContentHash).toBe(obsList[0].contentHash);
  });

  // ── Integration: Cluster Reconciles Mutated Observation ─────────────────────
  it('reconciles cluster observationIds when document mutates across polling cycles', () => {
    const obs1 = createObservation('obs-c1', 'https://gazette.mp.gov.in/o1', 'Initial Order Text', '2026-10-01T08:00:00Z');
    core.ingestObservation(obs1);

    const cluster1: StoryCluster = {
      id: 'cluster-radar-obs-c1',
      title: 'Gazette Order 441',
      summary: 'Initial Order Text',
      firstDetectedAt: '2026-10-01T08:00:00Z',
      lastUpdatedAt: '2026-10-01T08:00:00Z',
      observationIds: ['obs-c1'],
      sourceIds: [testSource.id],
      claimIds: [],
      entities: ['mp-govt'],
      geographicSpread: ['mp'],
      status: 'active',
      primarySourceCount: 1,
      independentSourceCount: 1,
    };
    core.upsertCluster(cluster1);

    // Mutated observation arrives
    const obs2 = createObservation('obs-c2', 'https://gazette.mp.gov.in/o1', 'Amended Order Text', '2026-10-01T08:30:00Z');
    core.ingestObservation(obs2);

    // Reconcile cluster with new observation ID added
    const existingCluster = core.getClusters().find((c) => c.observationIds.includes('obs-c1'));
    expect(existingCluster).toBeDefined();

    existingCluster!.observationIds.push('obs-c2');
    existingCluster!.lastUpdatedAt = '2026-10-01T08:30:00Z';
    const { signal } = core.upsertCluster(existingCluster!);

    expect(signal.clusterId).toBe('cluster-radar-obs-c1');
    const updatedCluster = core.getCluster('cluster-radar-obs-c1');
    expect(updatedCluster?.observationIds).toContain('obs-c1');
    expect(updatedCluster?.observationIds).toContain('obs-c2');
    expect(updatedCluster?.observationIds.length).toBe(2);
  });
});

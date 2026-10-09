/**
 * ─── Newsroom Desk Service Layer Test Matrix (Phase 3B-M5) ───────────────────
 *
 * 20-Point Certification Matrix:
 *   1. Authenticated desk read (200 OK)
 *   2. Anonymous rejection (401 Unauthorized)
 *   3. Unauthorized-role rejection (403 Forbidden for 'guest')
 *   4. Authorized-role access (reporter, editor, fact_checker, owner)
 *   5. Deterministic priority filtering (P0 / P1 / P2 / P3)
 *   6. Deterministic beat filtering
 *   7. Geographic filtering
 *   8. Workflow filtering (lifecycleState)
 *   9. Mutation context (M2 integration)
 *  10. Source-health context (M4 integration)
 *  11. Latency context (M3 integration)
 *  12. Queue pagination/order
 *  13. Duplicate request handling (idempotency via mutationId)
 *  14. Concurrent editor actions (version conflict 409)
 *  15. Audit trail creation
 *  16. Invalid state transition / role mismatch
 *  17. Attempt to bypass publication authority
 *  18. Private-field leakage prevention
 *  19. Error handling (missing signal, malformed action)
 *  20. Existing API compatibility
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import {
  NewsroomDeskService,
  newsroomDeskService,
} from '../desk-service';
import { newsroomIntelligenceCore } from '../index';
import { NewsroomAuditService } from '../audit-service';
import { beatRoutingService } from '../beat-routing-service';
import { MemoryRadarRepository } from '@/services/radar/persistence/memory';
import { GET as deskGetRoute, POST as deskPostRoute } from '@/app/api/v2/newsroom/desk/route';
import * as intelServer from '@/features/auth/intel-server';
import * as authServer from '@/features/auth/auth-server';
import type {
  StoryCluster,
  NewsroomObservation,
  NewsroomSignal,
} from '@/types/newsroom-intelligence';
import type { RadarLatencyRecord, RadarSourceHealth } from '@/services/radar/types';
import type { IntelRole } from '@/features/auth/roles';

describe('Phase 3B-M5 — Newsroom Desk Role-Based Service Layer', () => {
  let memoryRadarRepo: MemoryRadarRepository;
  let testDeskService: NewsroomDeskService;

  beforeEach(() => {
    newsroomIntelligenceCore.clear();
    NewsroomAuditService.clear();
    beatRoutingService.clear();

    // Register active test recipients for beat routing checks
    beatRoutingService.registerRecipient({
      userId: 'usr-reporter-1',
      role: 'reporter',
      beatIds: ['economy', 'technology', 'defence', 'politics', 'judiciary', 'general'],
      active: true,
      notificationPreference: 'immediate',
      escalationLevel: 1,
    });
    beatRoutingService.registerRecipient({
      userId: 'usr-editor-1',
      role: 'editor',
      beatIds: ['economy', 'technology', 'defence', 'politics', 'judiciary', 'general'],
      active: true,
      notificationPreference: 'immediate',
      escalationLevel: 2,
    });

    memoryRadarRepo = new MemoryRadarRepository();
    newsroomIntelligenceCore.setRadarRepository(memoryRadarRepo);
    testDeskService = new NewsroomDeskService(newsroomIntelligenceCore);
    vi.restoreAllMocks();
  });

  // Helper to seed a standard cluster with observation and signal
  function seedStandardSignal(opts?: {
    clusterId?: string;
    signalId?: string;
    title?: string;
    priority?: 'P0' | 'P1' | 'P2' | 'P3';
    sourceId?: string;
    beat?: string;
    geography?: string[];
    isMutation?: boolean;
    mutationId?: string;
    previousHash?: string;
    newHash?: string;
    revisionNumber?: number;
    diffSummary?: string;
  }) {
    const clusterId = opts?.clusterId || 'cl-desk-01';
    const obsId = `obs-${clusterId}`;
    const sourceId = opts?.sourceId || 'src-pib-feed';

    const obs: NewsroomObservation = {
      id: obsId,
      sourceId,
      canonicalUrl: 'https://pib.gov.in/PressReleasePage.aspx?PRID=999',
      title: opts?.title || 'Cabinet Approves Semiconductor Mission Expansion',
      snippet: 'Union Cabinet has approved ₹10,000 crore expansion for fabs.',
      contentHash: opts?.newHash || 'hash-semiconductor-rev1',
      publicationTimestamp: '2026-10-02T10:00:00Z',
      ingestionTimestamp: '2026-10-02T10:01:30Z',
      sourceTier: 't1',
      isPrimarySource: true,
      duplicateState: 'unique',
      entities: [opts?.beat || 'economy', 'rbi', 'semiconductor', 'cabinet'],
      metadata: opts?.isMutation
        ? {
            isMutation: true,
            mutationId: opts.mutationId || 'mut-desk-999',
            previousObservationId: 'obs-desk-prev',
            previousContentHash: opts.previousHash || 'hash-semiconductor-rev0',
            newContentHash: opts.newHash || 'hash-semiconductor-rev1',
            diffSummary: opts.diffSummary || 'Outlay revised from 8k cr to 10k cr.',
            revisionNumber: opts.revisionNumber || 2,
          }
        : undefined,
    };

    newsroomIntelligenceCore.ingestObservation(obs);

    const cluster: StoryCluster = {
      id: clusterId,
      title: obs.title,
      summary: obs.snippet,
      firstDetectedAt: '2026-10-02T10:01:30Z',
      lastUpdatedAt: '2026-10-02T10:01:30Z',
      observationIds: [obsId],
      sourceIds: [sourceId],
      claimIds: [],
      entities: obs.entities,
      primarySourceCount: 1,
      independentSourceCount: 1,
      geographicSpread: opts?.geography || ['INDIA', 'NEW_DELHI'],
      status: 'active',
    };

    const result = newsroomIntelligenceCore.upsertCluster(cluster);

    // If explicit priority requested, calibrate signal
    if (opts?.priority && result.signal.priority !== opts.priority) {
      result.signal.priority = opts.priority;
      newsroomIntelligenceCore.persist();
    }

    return { cluster, obs, signal: result.signal };
  }

  // ── 1. Authenticated Desk Read ─────────────────────────────────────────────
  it('TEST-01: Authenticated desk read returns complete structured desk items', async () => {
    seedStandardSignal({ priority: 'P1' });

    const response = await testDeskService.getDeskItems(
      {},
      { id: 'usr-reporter-1', role: 'reporter' }
    );

    expect(response.total).toBe(1);
    expect(response.items.length).toBe(1);
    const item = response.items[0];

    expect(item.signalId).toBeDefined();
    expect(item.title).toContain('Semiconductor');
    expect(item.priority).toBe('P1');
    expect(item.sourceAuthority).toBe('t1');
    expect(item.isPrimarySource).toBe(true);
    expect(item.availableActions.length).toBeGreaterThan(0);
    expect(item.timestamps.firstDetectedAt).toBeDefined();
    expect(response.sections.NEEDS_VERIFICATION).toBeGreaterThanOrEqual(1);
  });

  // ── 2. Anonymous Rejection ─────────────────────────────────────────────────
  it('TEST-02: Anonymous request is rejected with 401 Unauthorized', async () => {
    vi.spyOn(intelServer, 'guardIntelModule').mockResolvedValue({
      authorized: false,
      reason: 'unauthenticated',
      roleLabel: 'Guest',
    });
    vi.spyOn(authServer, 'getSession').mockResolvedValue(null);

    const req = new NextRequest('http://localhost:3000/api/v2/newsroom/desk');
    const res = await deskGetRoute(req);
    expect(res.status).toBe(401);

    const body = await res.json();
    expect(body.error).toBe('unauthenticated');
  });

  // ── 3. Unauthorized-Role Rejection ─────────────────────────────────────────
  it('TEST-03: Guest role is rejected with 403 Forbidden', async () => {
    seedStandardSignal();

    await expect(
      testDeskService.getDeskItems({}, { id: 'usr-guest-1', role: 'guest' })
    ).rejects.toThrow(/Forbidden: Guest role does not have desk read privileges/);

    vi.spyOn(intelServer, 'guardIntelModule').mockResolvedValue({
      authorized: false,
      reason: 'forbidden',
      role: 'guest',
      roleLabel: 'Guest',
    });
    vi.spyOn(authServer, 'getSession').mockResolvedValue({
      user: { id: 'usr-guest-1', email: 'guest@example.com' },
    } as any);

    const req = new NextRequest('http://localhost:3000/api/v2/newsroom/desk');
    const res = await deskGetRoute(req);
    expect(res.status).toBe(403);
  });

  // ── 4. Authorized-Role Access ──────────────────────────────────────────────
  it('TEST-04: Authorized roles receive appropriate permissions and available actions', async () => {
    const { signal } = seedStandardSignal();

    const reporterActions = testDeskService.getAvailableActionsForRole('reporter', signal);
    expect(reporterActions).toContain('FOLLOW');
    expect(reporterActions).toContain('WATCH');
    expect(reporterActions).toContain('ASSIGN');
    expect(reporterActions).not.toContain('PRIORITIZE');
    expect(reporterActions).not.toContain('RESOLVE');

    const factCheckerActions = testDeskService.getAvailableActionsForRole('fact_checker', signal);
    expect(factCheckerActions).toContain('VERIFY');
    expect(factCheckerActions).toContain('REVIEW');

    const editorActions = testDeskService.getAvailableActionsForRole('editor', signal);
    expect(editorActions).toContain('PRIORITIZE');
    expect(editorActions).toContain('RESOLVE');
    expect(editorActions).toContain('MERGE');
    expect(editorActions).toContain('SPLIT');
  });

  // ── 5. Deterministic Priority Filtering ────────────────────────────────────
  it('TEST-05: Priority filtering deterministically isolates P0/P1/P2/P3', async () => {
    seedStandardSignal({ clusterId: 'cl-p0', priority: 'P0' });
    seedStandardSignal({ clusterId: 'cl-p1', priority: 'P1' });
    seedStandardSignal({ clusterId: 'cl-p2', priority: 'P2' });

    const p0Items = await testDeskService.getDeskItems(
      { priority: 'P0' },
      { id: 'usr-editor-1', role: 'editor' }
    );
    expect(p0Items.items.every((i) => i.priority === 'P0')).toBe(true);
    expect(p0Items.total).toBe(1);

    const p1Items = await testDeskService.getDeskItems(
      { priority: 'P1' },
      { id: 'usr-editor-1', role: 'editor' }
    );
    expect(p1Items.items.every((i) => i.priority === 'P1')).toBe(true);
    expect(p1Items.total).toBe(1);
  });

  // ── 6. Deterministic Beat Filtering ────────────────────────────────────────
  it('TEST-06: Beat filtering correctly matches domain beats and entities', async () => {
    seedStandardSignal({ clusterId: 'cl-econ', beat: 'economy' });
    seedStandardSignal({ clusterId: 'cl-defense', beat: 'defence', title: 'Army Conducts Border Exercise', priority: 'P2' });

    const econItems = await testDeskService.getDeskItems(
      { beat: 'economy' },
      { id: 'usr-reporter-1', role: 'reporter' }
    );
    expect(econItems.items.length).toBe(1);
    expect(econItems.items[0].clusterId).toBe('cl-econ');
  });

  // ── 7. Geographic Filtering ────────────────────────────────────────────────
  it('TEST-07: Geographic filtering matches regional scope', async () => {
    seedStandardSignal({ clusterId: 'cl-mp', geography: ['INDIA', 'MADHYA_PRADESH'] });
    seedStandardSignal({ clusterId: 'cl-ka', geography: ['INDIA', 'KARNATAKA'] });

    const mpItems = await testDeskService.getDeskItems(
      { geography: 'MADHYA_PRADESH' },
      { id: 'usr-reporter-1', role: 'reporter' }
    );
    expect(mpItems.items.length).toBe(1);
    expect(mpItems.items[0].clusterId).toBe('cl-mp');
  });

  // ── 8. Workflow Filtering ──────────────────────────────────────────────────
  it('TEST-08: Workflow state filtering isolates lifecycle states', async () => {
    const { signal } = seedStandardSignal({ clusterId: 'cl-mon' });
    signal.lifecycleState = 'monitoring';

    const monItems = await testDeskService.getDeskItems(
      { workflowState: 'monitoring' },
      { id: 'usr-editor-1', role: 'editor' }
    );
    expect(monItems.items.length).toBe(1);
    expect(monItems.items[0].workflowState).toBe('monitoring');

    const confirmedItems = await testDeskService.getDeskItems(
      { workflowState: 'confirmed' },
      { id: 'usr-editor-1', role: 'editor' }
    );
    expect(confirmedItems.items.length).toBe(0);
  });

  // ── 9. Mutation Context (M2) ───────────────────────────────────────────────
  it('TEST-09: Document mutation lineage (M2) is preserved in desk item', async () => {
    seedStandardSignal({
      clusterId: 'cl-mut',
      isMutation: true,
      mutationId: 'mut-semiconductor-v2',
      previousHash: 'hash-v1',
      newHash: 'hash-v2',
      revisionNumber: 2,
      diffSummary: 'Increased budgetary outlay from ₹8,000cr to ₹10,000cr.',
    });

    const deskItems = await testDeskService.getDeskItems(
      {},
      { id: 'usr-editor-1', role: 'editor' }
    );
    const mutItem = deskItems.items.find((i) => i.clusterId === 'cl-mut');
    expect(mutItem).toBeDefined();
    expect(mutItem?.changeType).toBe('changed');
    expect(mutItem?.mutationContext?.isMutation).toBe(true);
    expect(mutItem?.mutationContext?.mutationId).toBe('mut-semiconductor-v2');
    expect(mutItem?.mutationContext?.revisionNumber).toBe(2);
    expect(mutItem?.mutationContext?.diffSummary).toContain('budgetary outlay');
  });

  // ── 10. Source-Health Context (M4) ─────────────────────────────────────────
  it('TEST-10: Silent feed and source health monitoring context (M4) is populated', async () => {
    seedStandardSignal({ clusterId: 'cl-health', sourceId: 'src-pib-health' });

    const health: RadarSourceHealth = {
      sourceId: 'src-pib-health',
      status: 'degraded',
      scheduleState: 'READY',
      consecutiveFailures: 0,
      totalFetches: 10,
      totalFailures: 0,
      totalChanges: 5,
      averageFetchMs: 120,
      consecutiveEmptyRuns: 4,
      silentFailureSuspected: true,
      lastSuccessAt: '2026-10-02T08:00:00Z',
    };
    await memoryRadarRepo.saveSourceHealth(health);

    const deskItems = await testDeskService.getDeskItems(
      {},
      { id: 'usr-editor-1', role: 'editor' }
    );
    const item = deskItems.items.find((i) => i.clusterId === 'cl-health');

    expect(item?.sourceHealthContext).toBeDefined();
    expect(item?.sourceHealthContext?.status).toBe('degraded');
    expect(item?.sourceHealthContext?.consecutiveEmptyRuns).toBe(4);
    expect(item?.sourceHealthContext?.silentFailureSuspected).toBe(true);
  });

  // ── 11. Latency Context (M3) ───────────────────────────────────────────────
  it('TEST-11: End-to-end latency measurement context (M3) is populated', async () => {
    seedStandardSignal({ clusterId: 'cl-latency' });

    const latencyRecord: RadarLatencyRecord = {
      clusterId: 'cl-latency',
      sourcePublishedAt: '2026-10-02T09:50:00Z',
      firstSeenAt: '2026-10-02T09:52:00Z',
      firstDetectedAt: '2026-10-02T09:52:05Z',
      firstVerifiedAt: '2026-10-02T10:15:00Z',
      publishedAt: '2026-10-02T10:30:00Z',
      detectionLatencyMs: 125000,
      observationLatencyMs: 120000,
      verificationLatencyMs: 1375000,
      publicationLatencyMs: 900000,
      endToEndPublicationLatencyMs: 2400000,
    };
    await memoryRadarRepo.recordLatency(latencyRecord);

    const deskItems = await testDeskService.getDeskItems(
      {},
      { id: 'usr-editor-1', role: 'editor' }
    );
    const item = deskItems.items.find((i) => i.clusterId === 'cl-latency');

    expect(item?.latencyContext).toBeDefined();
    expect(item?.latencyContext?.detectionLatencyMs).toBe(125000);
    expect(item?.latencyContext?.observationLatencyMs).toBe(120000);
    expect(item?.latencyContext?.verificationLatencyMs).toBe(1375000);
    expect(item?.latencyContext?.endToEndPublicationLatencyMs).toBe(2400000);
  });

  // ── 12. Queue Pagination / Ordering ────────────────────────────────────────
  it('TEST-12: Pagination slices accurately without corrupting total or section counts', async () => {
    for (let i = 1; i <= 5; i++) {
      seedStandardSignal({ clusterId: `cl-page-${i}`, priority: 'P1' });
    }

    const page1 = await testDeskService.getDeskItems(
      { limit: 2, offset: 0 },
      { id: 'usr-reporter-1', role: 'reporter' }
    );
    expect(page1.total).toBe(5);
    expect(page1.items.length).toBe(2);
    expect(page1.offset).toBe(0);
    expect(page1.limit).toBe(2);

    const page2 = await testDeskService.getDeskItems(
      { limit: 2, offset: 2 },
      { id: 'usr-reporter-1', role: 'reporter' }
    );
    expect(page2.total).toBe(5);
    expect(page2.items.length).toBe(2);
    expect(page2.offset).toBe(2);
  });

  // ── 13. Idempotency via mutationId ─────────────────────────────────────────
  it('TEST-13: Re-executing an action with the same mutationId is idempotent', async () => {
    const { signal } = seedStandardSignal({ clusterId: 'cl-idem' });

    const payload = {
      signalId: signal.id,
      action: 'ASSIGN' as const,
      assignedTo: 'reporter-bob',
      mutationId: 'mut-action-idem-42',
    };

    const user = { id: 'usr-editor-1', role: 'editor' as IntelRole, name: 'Senior Editor' };

    const firstResult = await testDeskService.executeTriageAction(payload, user);
    expect(firstResult.success).toBe(true);
    expect(firstResult.item.assignedTo).toBe('reporter-bob');

    const auditCountBefore = NewsroomAuditService.getAuditTrail({ signalId: signal.id }).length;

    // Second execution with identical mutationId
    const secondResult = await testDeskService.executeTriageAction(payload, user);
    expect(secondResult.success).toBe(true);
    expect(secondResult.item.assignedTo).toBe('reporter-bob');

    // Audit trail should not duplicate
    const auditCountAfter = NewsroomAuditService.getAuditTrail({ signalId: signal.id }).length;
    expect(auditCountAfter).toBe(auditCountBefore);
  });

  // ── 14. Version Conflict / Optimistic Concurrency ──────────────────────────
  it('TEST-14: Concurrency collision with expectedVersion returns version conflict', async () => {
    const { signal } = seedStandardSignal({ clusterId: 'cl-race' });

    const user = { id: 'usr-editor-1', role: 'editor' as IntelRole, name: 'Senior Editor' };

    // Advance version by 1
    await testDeskService.executeTriageAction(
      { signalId: signal.id, action: 'FOLLOW' },
      user
    );

    // Attempt second action with stale expectedVersion = 1
    await expect(
      testDeskService.executeTriageAction(
        { signalId: signal.id, action: 'ASSIGN', assignedTo: 'alice', expectedVersion: 1 },
        user
      )
    ).rejects.toThrow(/Version conflict/);
  });

  // ── 15. Audit Trail Creation ───────────────────────────────────────────────
  it('TEST-15: Desk actions produce immutable audit entries', async () => {
    const { signal } = seedStandardSignal({ clusterId: 'cl-audit' });

    await testDeskService.executeTriageAction(
      { signalId: signal.id, action: 'FOLLOW', note: 'Tracking for morning briefing' },
      { id: 'usr-reporter-1', role: 'reporter', name: 'Nitin Desk' }
    );

    const audits = NewsroomAuditService.getAuditTrail({ signalId: signal.id });
    expect(audits.length).toBeGreaterThan(0);
    const lastAudit = audits[audits.length - 1];

    expect(lastAudit.actorId).toBe('usr-reporter-1');
    expect(lastAudit.actorName).toBe('Nitin Desk');
    expect(lastAudit.action).toBe('FOLLOW');
    expect(lastAudit.signalId).toBe(signal.id);
  });

  // ── 16. Invalid State Transition / Role Mismatch ───────────────────────────
  it('TEST-16: Role mismatch prohibits higher-privilege actions', async () => {
    const { signal } = seedStandardSignal({ clusterId: 'cl-priv' });

    // Reporter cannot execute editor-only action 'PRIORITIZE' or 'RESOLVE'
    await expect(
      testDeskService.executeTriageAction(
        { signalId: signal.id, action: 'RESOLVE' },
        { id: 'usr-reporter-1', role: 'reporter' }
      )
    ).rejects.toThrow(/not permitted for role reporter/);
  });

  // ── 17. Separation of Publication Authority ────────────────────────────────
  it('TEST-17: Newsroom desk cannot publish stories (human editorial publication separation)', async () => {
    const { signal } = seedStandardSignal({ clusterId: 'cl-pub-gate' });

    // The desk action type union does not even include 'PUBLISH'
    // Attempting to cast and pass an invalid action throws
    await expect(
      testDeskService.executeTriageAction(
        { signalId: signal.id, action: 'PUBLISH' as any },
        { id: 'usr-editor-1', role: 'editor' }
      )
    ).rejects.toThrow(/not permitted/);
  });

  // ── 18. Private-Field Leakage Prevention ───────────────────────────────────
  it('TEST-18: Desk items never expose secrets, passwords, or internal tokens', async () => {
    seedStandardSignal({ clusterId: 'cl-leak-check' });

    const res = await testDeskService.getDeskItems({}, { id: 'usr-reporter-1', role: 'reporter' });
    const jsonStr = JSON.stringify(res);

    expect(jsonStr).not.toContain('supabase_service_role_key');
    expect(jsonStr).not.toContain('database_password');
    expect(jsonStr).not.toContain('secret');
    expect(jsonStr).not.toContain('api_key');
  });

  // ── 19. Error Handling ─────────────────────────────────────────────────────
  it('TEST-19: Desk API route gracefully returns 404 for missing signal and 400 for bad action', async () => {
    vi.spyOn(intelServer, 'guardIntelModule').mockResolvedValue({
      authorized: true,
      role: 'editor',
      roleLabel: 'Editor',
    });
    vi.spyOn(authServer, 'getSession').mockResolvedValue({
      user: { id: 'usr-editor-1', name: 'Editor Name' },
    } as any);

    // Missing signal ID
    const getReq = new NextRequest('http://localhost:3000/api/v2/newsroom/desk?signalId=non-existent-999');
    const getRes = await deskGetRoute(getReq);
    expect(getRes.status).toBe(404);

    // Missing action body
    const postReq = new NextRequest('http://localhost:3000/api/v2/newsroom/desk', {
      method: 'POST',
      body: JSON.stringify({ signalId: 'sig-1' }),
    });
    const postRes = await deskPostRoute(postReq);
    expect(postRes.status).toBe(400);
  });

  // ── 20. Existing API Compatibility ─────────────────────────────────────────
  it('TEST-20: Underlying signals and scorecard machinery remain intact', async () => {
    const { signal } = seedStandardSignal({ clusterId: 'cl-compat' });

    // Existing core APIs still work identically
    const retrievedSignal = newsroomIntelligenceCore.getSignal(signal.id);
    expect(retrievedSignal).toBeDefined();
    expect(retrievedSignal?.id).toBe(signal.id);

    const scorecard = newsroomIntelligenceCore.getScorecard();
    expect(scorecard).toBeDefined();
    expect(scorecard.detection.signals).toBeGreaterThanOrEqual(1);
  });

  // ── 21. Section Counts Semantics & Priority Isolation (Phase 3) ────────────
  it('TEST-21: Section counts reflect filtered subset without conflating total vs queue count', async () => {
    seedStandardSignal({ clusterId: 'cl-p0-sec', priority: 'P0' });
    const s1 = seedStandardSignal({ clusterId: 'cl-p1-sec', priority: 'P1' });
    s1.signal.lifecycleState = 'confirmed';
    s1.signal.scores.evidenceStrength = 80;
    s1.signal.scores.uncertainty = 20;

    const allRes = await testDeskService.getDeskItems({}, { id: 'usr-editor-1', role: 'editor' });
    expect(allRes.total).toBe(2);
    expect(allRes.sections.BREAKING_P0).toBe(1);
    expect(allRes.sections.P1_IMPORTANT).toBe(1);

    // Filtering by P0 narrows total to 1 and sections.BREAKING_P0 to 1, P1_IMPORTANT to 0
    const p0Res = await testDeskService.getDeskItems({ priority: 'P0' }, { id: 'usr-editor-1', role: 'editor' });
    expect(p0Res.total).toBe(1);
    expect(p0Res.sections.BREAKING_P0).toBe(1);
    expect(p0Res.sections.P1_IMPORTANT).toBe(0);
  });

  // ── 22. Active Section Selection via Service & API Route ───────────────────
  it('TEST-22: Active section filter isolates items to that queue section', async () => {
    seedStandardSignal({ clusterId: 'cl-p0-active', priority: 'P0' });
    const s1 = seedStandardSignal({ clusterId: 'cl-p1-active', priority: 'P1' });
    s1.signal.lifecycleState = 'confirmed';
    s1.signal.scores.evidenceStrength = 80;
    s1.signal.scores.uncertainty = 20;

    const p0Section = await testDeskService.getDeskItems(
      { section: 'BREAKING_P0' },
      { id: 'usr-editor-1', role: 'editor' }
    );
    expect(p0Section.items.length).toBe(1);
    expect(p0Section.items[0].priority).toBe('P0');
    expect(p0Section.sections.BREAKING_P0).toBe(1);
    expect(p0Section.sections.P1_IMPORTANT).toBe(1);

    // Verify GET route parses ?section=BREAKING_P0
    vi.spyOn(intelServer, 'guardIntelModule').mockResolvedValue({
      authorized: true,
      role: 'editor',
      roleLabel: 'Editor',
    });
    vi.spyOn(authServer, 'getSession').mockResolvedValue({
      user: { id: 'usr-editor-1', name: 'Editor Name' },
    } as any);

    const req = new NextRequest('http://localhost:3000/api/v2/newsroom/desk?section=BREAKING_P0');
    const res = await deskGetRoute(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.items.length).toBe(1);
    expect(body.items[0].priority).toBe('P0');
  });

  // ── 23. Contradiction Filtering ────────────────────────────────────────────
  it('TEST-23: Contradiction filter isolates signals with contradictions', async () => {
    const { signal } = seedStandardSignal({ clusterId: 'cl-contra' });
    signal.contradictionIds = ['contra-123'];

    const withContra = await testDeskService.getDeskItems(
      { hasContradictions: true },
      { id: 'usr-editor-1', role: 'editor' }
    );
    expect(withContra.items.length).toBe(1);
    expect(withContra.items[0].hasContradictions).toBe(true);

    const withoutContra = await testDeskService.getDeskItems(
      { hasContradictions: false },
      { id: 'usr-editor-1', role: 'editor' }
    );
    expect(withoutContra.items.length).toBe(0);
  });

  // ── 24. Combined Filters (Priority + Beat + Section) ───────────────────────
  it('TEST-24: Combined filters apply deterministically without collision', async () => {
    const s1 = seedStandardSignal({ clusterId: 'cl-combo-1', priority: 'P1', beat: 'economy' });
    s1.signal.lifecycleState = 'confirmed';
    s1.signal.scores.evidenceStrength = 80;
    s1.signal.scores.uncertainty = 20;

    const s2 = seedStandardSignal({ clusterId: 'cl-combo-2', priority: 'P1', beat: 'defence' });
    s2.signal.lifecycleState = 'confirmed';
    s2.signal.scores.evidenceStrength = 80;
    s2.signal.scores.uncertainty = 20;

    seedStandardSignal({ clusterId: 'cl-combo-3', priority: 'P2', beat: 'economy' });

    const combo = await testDeskService.getDeskItems(
      { priority: 'P1', beat: 'economy', section: 'P1_IMPORTANT' },
      { id: 'usr-editor-1', role: 'editor' }
    );
    expect(combo.items.length).toBe(1);
    expect(combo.items[0].clusterId).toBe('cl-combo-1');
  });

  // ── 25. Empty Results Behavior ─────────────────────────────────────────────
  it('TEST-25: Empty filter results return empty items array with valid counts', async () => {
    seedStandardSignal({ clusterId: 'cl-empty-seed', priority: 'P2' });

    const res = await testDeskService.getDeskItems(
      { priority: 'P0' },
      { id: 'usr-editor-1', role: 'editor' }
    );
    expect(res.total).toBe(0);
    expect(res.items).toEqual([]);
    expect(res.sections.BREAKING_P0).toBe(0);
  });
});

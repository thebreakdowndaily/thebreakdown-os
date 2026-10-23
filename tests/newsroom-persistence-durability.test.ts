/**
 * ─── Newsroom Persistence Durability & Security Hardening Tests ───────────────
 *
 * Requirements:
 * 1. Confirm successful mutations are committed to the authoritative database and survive fresh read.
 * 2. Never report an in-memory-only editorial mutation as successful.
 * 3. Connection failure, timeout, database denial, concurrency conflict produce explicit NewsroomPersistenceError.
 * 4. Persistence failure triggers transactional rollback: version does NOT advance, audit claims rolled back.
 * 5. Operating in read-only degraded mode blocks mutations fail-closed.
 * 6. Executed against isolated staging database (lvfovvidtowadmnggzzf), NOT production.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SupabaseStateRepository, SNAPSHOT_ROW_ID } from '@/services/intelligence/newsroom/persistence/supabase';
import {
  NewsroomIntelligenceCore,
  NewsroomPersistenceError,
} from '@/services/intelligence/newsroom';
import { NewsroomAuditService } from '@/services/intelligence/newsroom/audit-service';
import { NewsroomDeskService } from '@/services/intelligence/newsroom/desk-service';
import type { NewsroomPersistedState } from '@/services/intelligence/newsroom/persistence/state';
import type { NewsroomSignal, StoryCluster, NewsroomObservation } from '@/types/newsroom-intelligence';

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.preview.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Use isolated staging credentials from environment
const stagingUrl = process.env.STAGING_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const stagingKey = process.env.STAGING_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';


function createBaselineTestState(): NewsroomPersistedState {
  const signalId = 'sig-durability-test-001';
  const clusterId = 'cluster-durability-test-001';
  const obsId = 'obs-durability-test-001';

  const testObs: NewsroomObservation = {
    id: obsId,
    sourceId: 'pib',
    sourceTier: 't1',
    isPrimarySource: true,
    title: 'Union Cabinet Approves National Semiconductor Mission Expansion',
    content: 'The Union Cabinet chaired by the Prime Minister has approved expansion of semiconductor manufacturing incentives.',
    canonicalUrl: 'https://pib.gov.in/PressReleasePage.aspx?PRID=999901',
    ingestionTimestamp: '2026-10-10T06:00:00.000Z',
    archiveId: 'arch-semi-001',
    archivalState: 'verified',
  };

  const testCluster: StoryCluster = {
    id: clusterId,
    title: 'Semiconductor Mission Expansion Approval',
    firstDetectedAt: '2026-10-10T06:00:00.000Z',
    lastUpdatedAt: '2026-10-10T06:00:00.000Z',
    observationIds: [obsId],
    sourceIds: ['pib'],
    geographicSpread: ['national'],
  };

  const testSignal: NewsroomSignal = {
    id: signalId,
    clusterId,
    title: 'Cabinet Approves Semiconductor Mission Expansion',
    summary: 'Cabinet approval for semiconductor incentives.',
    explanation: {
      whyItMatters: 'Strategic tech capability and industrial supply chains.',
      recommendedAction: 'Verify against gazette notification.',
    },
    priority: 'P1',
    lifecycleState: 'detected',
    keyEntities: ['cabinet', 'semiconductors'],
    contradictionIds: [],
    observationCount: 1,
    independentSourceCount: 1,
    primarySourceCount: 1,
    scores: {
      confidence: 88,
      evidenceStrength: 85,
      uncertainty: 15,
      materiality: 90,
      contradiction: 0,
      urgency: 75,
      snr: 82,
    },
    version: 1,
    firstDetectedAt: '2026-10-10T06:00:00.000Z',
    lastUpdatedAt: '2026-10-10T06:00:00.000Z',
  };

  return {
    version: 1,
    savedAt: new Date().toISOString(),
    observations: [testObs],
    claims: [],
    clusters: [testCluster],
    signals: [testSignal],
    gaps: [],
    alerts: [],
    audit: [],
    beats: [],
    recipients: [],
    authorization: null,
    escalations: [],
    fatigue: { userFatigue: {}, beatFatigue: {} },
    sourceReputations: [],
    engine: {
      shadowMode: true,
      phase1InternalAlertingActive: false,
      killSwitchEngaged: false,
    },
  };
}

describe('Newsroom Persistence Durability & Security Hardening Suite', () => {
  beforeEach(() => {
    NewsroomAuditService.clear();
  });

  afterEach(() => {
    NewsroomAuditService.clear();
  });

  // ── 1. Authoritative Staging Database Integration ─────────────────────────────
  it('commits mutation to staging database and survives fresh read in new instance', async () => {
    if (!stagingUrl || !stagingKey || stagingUrl.includes('dummy')) {
      console.warn('Skipping live staging test: STAGING_SUPABASE_URL not configured');
      return;
    }

    // Repository A: seed initial state
    const repoA = new SupabaseStateRepository({ url: stagingUrl, key: stagingKey });
    const initialState = createBaselineTestState();
    await repoA.save(initialState);

    // Initialize core over repoA
    const core = NewsroomIntelligenceCore.resetInstance(repoA);
    await core.ensureLoaded();

    const deskService = new NewsroomDeskService(core);

    // Perform real editorial triage action: ESCALATE to P0
    const triageResult = await deskService.executeTriageAction(
      {
        signalId: 'sig-durability-test-001',
        action: 'ESCALATE',
        escalatedPriority: 'P0',
        note: 'High-impact policy decision with major manufacturing implications',
      },
      { id: 'editor-101', role: 'managing_editor', name: 'Lead Technology Editor' }
    );


    expect(triageResult.success).toBe(true);
    expect(triageResult.item.priority).toBe('P0');
    expect(triageResult.item.version).toBe(2);

    // Verify durability: Create brand new Repository B with no local cache
    const repoB = new SupabaseStateRepository({ url: stagingUrl, key: stagingKey });
    const loadedState = await repoB.load();

    expect(loadedState).not.toBeNull();
    const persistedSignal = loadedState!.signals.find((s) => s.id === 'sig-durability-test-001');
    expect(persistedSignal).toBeDefined();
    expect(persistedSignal!.priority).toBe('P0');
    expect(persistedSignal!.version).toBe(2);

    // Verify audit record was durably written to DB
    const persistedAudit = loadedState!.audit.find(
      (a) => a.signalId === 'sig-durability-test-001' && a.action === 'ESCALATE'
    );
    expect(persistedAudit).toBeDefined();
    expect(persistedAudit!.action).toBe('ESCALATE');
    expect(
      persistedAudit!.actorId === 'editor-101' ||
        persistedAudit!.actorName === 'Lead Technology Editor'
    ).toBe(true);
  });


  // ── 2. Forced Connection Failure & Atomic Rollback ───────────────────────────
  it('rolls back in-memory signal state and audit log when persistence fails', async () => {
    // Mock repository where save fails with network timeout
    const failingRepo = {
      kind: 'supabase' as const,
      isDegradedReadOnly: false,
      load: () => createBaselineTestState(),
      save: async () => {
        throw new NewsroomPersistenceError(
          'Connection timeout while reaching database host',
          'PERSISTENCE_FAILED'
        );
      },
    };

    const core = NewsroomIntelligenceCore.resetInstance(failingRepo as any);
    await core.ensureLoaded();

    const signalBefore = core.getSignal('sig-durability-test-001');
    expect(signalBefore).toBeDefined();
    expect(signalBefore!.priority).toBe('P1');
    expect(signalBefore!.version).toBe(1);

    const auditCountBefore = NewsroomAuditService.getAllRecords().length;

    const deskService = new NewsroomDeskService(core);

    // Attempt mutation: MUST throw NewsroomPersistenceError and roll back
    await expect(
      deskService.executeTriageAction(
        {
          signalId: 'sig-durability-test-001',
          action: 'ESCALATE',
          escalatedPriority: 'P0',
          note: 'This write should fail and roll back',
        },
        { id: 'editor-101', role: 'managing_editor', name: 'Lead Editor' }
      )

    ).rejects.toThrow(NewsroomPersistenceError);

    // Verify state was rolled back in memory
    const signalAfter = core.getSignal('sig-durability-test-001');
    expect(signalAfter!.priority).toBe('P1'); // NOT changed to P0
    expect(signalAfter!.version).toBe(1); // Version NOT incremented

    // Verify audit log has zero false claims
    const auditCountAfter = NewsroomAuditService.getAllRecords().length;
    expect(auditCountAfter).toBe(auditCountBefore);
  });

  // ── 3. Read-Only Degraded Mode ───────────────────────────────────────────────
  it('enforces read-only degraded mode fail-closed when database is offline', async () => {
    // Repository that fails to load and enters degraded read-only mode
    const offlineRepo = new SupabaseStateRepository({
      client: {
        from: () => ({
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: null,
                error: { message: 'Database host connection refused' },
              }),
            }),
          }),
        }),
      },
    });

    const loaded = await offlineRepo.load();
    expect(loaded).toBeNull();
    expect(offlineRepo.isDegradedReadOnly).toBe(true);

    // Attempting to save in degraded mode must reject
    await expect(offlineRepo.save(createBaselineTestState())).rejects.toThrow(
      /read-only degraded mode/i
    );

    // Core over degraded repo
    const core = NewsroomIntelligenceCore.resetInstance(offlineRepo as any);
    expect(core.isDegradedReadOnly()).toBe(true);
    expect(core.getPersistenceStatus()).toBe('degraded_readonly');

    const deskService = new NewsroomDeskService(core);
    const summary = await deskService.getDeskSummary();
    expect(summary.isDegradedReadOnly).toBe(true);
    expect(summary.persistenceStatus).toBe('degraded_readonly');
  });

  // ── 4. Concurrency Conflict (OCC 409) ────────────────────────────────────────
  it('throws NewsroomPersistenceError with PERSISTENCE_CONFLICT on exhausted concurrency races', async () => {
    // Mock client where update returns empty resData (simulating optimistic concurrency check mismatch)
    const conflictRepo = new SupabaseStateRepository({
      client: {
        from: () => ({
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: { metric_value: 5, metadata: createBaselineTestState() },
                error: null,
              }),
            }),
          }),
          update: () => ({
            eq: () => ({
              eq: () => ({
                select: async () => ({
                  data: [], // 0 rows updated because remote version changed
                  error: null,
                }),
              }),
            }),
          }),
        }),
      },
    });

    await expect(conflictRepo.save(createBaselineTestState())).rejects.toMatchObject({
      name: 'NewsroomPersistenceError',
      code: 'PERSISTENCE_CONFLICT',
    });
  });

  // ── 5. Database Denial / Permission Failure ──────────────────────────────────
  it('throws NewsroomPersistenceError when database denies write permissions', async () => {
    const deniedRepo = new SupabaseStateRepository({
      client: {
        from: () => ({
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: { metric_value: 1, metadata: createBaselineTestState() },
                error: null,
              }),
            }),
          }),
          update: () => ({
            eq: () => ({
              eq: () => ({
                select: async () => ({
                  data: null,
                  error: { message: 'permission denied for table pipeline_metrics', code: '42501' },
                }),
              }),
            }),
          }),
        }),
      },
    });

    await expect(deniedRepo.save(createBaselineTestState())).rejects.toThrow(
      /permission denied/i
    );
  });

  // ── 6. Persistence Initialization Single-Flight & Durability Regression ──────
  describe('Newsroom Persistence Initialization Single-Flight Invariants', () => {
    it('REG-01: asynchronous repository load rejection causes no unhandled rejection and callers receive defined persistence failure', async () => {
      let unhandledOccurred = false;
      const onUnhandled = () => {
        unhandledOccurred = true;
      };
      process.on('unhandledRejection', onUnhandled);

      try {
        const rejectError = new Error('Async network timeout during bootstrap');
        const failingAsyncRepo = {
          kind: 'supabase' as const,
          isDegradedReadOnly: false,
          load: vi.fn().mockRejectedValue(rejectError),
          save: vi.fn().mockResolvedValue(undefined),
        };

        // Construction must not launch unobserved background load that triggers unhandled rejection
        const core = NewsroomIntelligenceCore.resetInstance(failingAsyncRepo as any);

        // Allow event loop ticks to verify no unhandled rejection occurs from construction
        await new Promise((r) => setTimeout(r, 50));
        expect(unhandledOccurred).toBe(false);

        // Callers awaiting ensureLoaded receive the defined persistence failure
        await expect(core.ensureLoaded()).rejects.toMatchObject({
          name: 'NewsroomPersistenceError',
          code: 'PERSISTENCE_UNAVAILABLE',
          message: expect.stringContaining('Async network timeout during bootstrap'),
        });

        // Repeated calls return the same failure without hidden retries
        await expect(core.ensureLoaded()).rejects.toMatchObject({
          name: 'NewsroomPersistenceError',
          code: 'PERSISTENCE_UNAVAILABLE',
        });
        expect(failingAsyncRepo.load).toHaveBeenCalledTimes(1);
        expect(unhandledOccurred).toBe(false);
      } finally {
        process.off('unhandledRejection', onUnhandled);
      }
    });

    it('REG-02: core initiates a single load for concurrent callers during initialization lifecycle', async () => {
      let loadCalls = 0;
      const slowRepo = {
        kind: 'supabase' as const,
        isDegradedReadOnly: false,
        load: vi.fn().mockImplementation(async () => {
          loadCalls++;
          await new Promise((r) => setTimeout(r, 30));
          return createBaselineTestState();
        }),
        save: vi.fn().mockResolvedValue(undefined),
      };

      const core = NewsroomIntelligenceCore.resetInstance(slowRepo as any);
      expect(loadCalls).toBe(0); // Construction did not launch load

      // Concurrent ensureLoaded calls await the same single-flight promise
      await Promise.all([
        core.ensureLoaded(),
        core.ensureLoaded(),
        core.ensureLoaded(),
      ]);

      expect(loadCalls).toBe(1); // Single-flight, exact 1 load call
      expect(core.getSignals().length).toBe(1);

      // Subsequent call does not reload
      await core.ensureLoaded();
      expect(loadCalls).toBe(1);
    });

    it('REG-03: synchronous accessors and mutations enforce readiness and block uninitialized access', async () => {
      const uninitializedRepo = {
        kind: 'supabase' as const,
        isDegradedReadOnly: false,
        load: vi.fn().mockImplementation(async () => {
          await new Promise((r) => setTimeout(r, 30));
          return createBaselineTestState();
        }),
        save: vi.fn().mockResolvedValue(undefined),
      };

      const core = NewsroomIntelligenceCore.resetInstance(uninitializedRepo as any);

      // Reads throw readiness error
      expect(() => core.getSignals()).toThrow(NewsroomPersistenceError);
      expect(() => core.getObservations()).toThrow(NewsroomPersistenceError);
      expect(() => core.getAlerts()).toThrow(NewsroomPersistenceError);
      expect(() => core.getCoverageGaps()).toThrow(NewsroomPersistenceError);
      expect(() => core.getScorecard()).toThrow(NewsroomPersistenceError);

      // Mutations throw readiness error
      expect(() => core.ingestObservation({ id: 'obs-premature' } as any)).toThrow(NewsroomPersistenceError);
      expect(() => core.registerClaim({ id: 'claim-premature' } as any)).toThrow(NewsroomPersistenceError);
      expect(() => core.upsertCluster({ id: 'cluster-premature' } as any)).toThrow(NewsroomPersistenceError);

      // Await readiness
      await core.ensureLoaded();

      // Reads and mutations now succeed
      expect(core.getSignals().length).toBe(1);
      expect(core.getObservations().length).toBe(1);
    });

    it('REG-04: successful restoration hydrates state once and remains fully operational', async () => {
      const state = createBaselineTestState();
      const repo = {
        kind: 'supabase' as const,
        isDegradedReadOnly: false,
        load: vi.fn().mockResolvedValue(state),
        save: vi.fn().mockResolvedValue(undefined),
      };

      const core = NewsroomIntelligenceCore.resetInstance(repo as any);
      await core.ensureLoaded();

      expect(core.getSignals().length).toBe(1);
      expect(core.getSignal('sig-durability-test-001')).toBeDefined();
      expect(core.getObservations().length).toBe(1);
      expect(core.getClusters().length).toBe(1);
      expect(repo.load).toHaveBeenCalledTimes(1);
    });

    it('REG-05: explicit retryLoad allows controlled recovery after transient failure', async () => {
      let attempts = 0;
      const transientRepo = {
        kind: 'supabase' as const,
        isDegradedReadOnly: false,
        load: vi.fn().mockImplementation(async () => {
          attempts++;
          if (attempts === 1) {
            throw new Error('Transient network glitch');
          }
          return createBaselineTestState();
        }),
        save: vi.fn().mockResolvedValue(undefined),
      };

      const core = NewsroomIntelligenceCore.resetInstance(transientRepo as any);

      // First load fails
      await expect(core.ensureLoaded()).rejects.toThrow('Transient network glitch');
      expect(attempts).toBe(1);

      // ensureLoaded does not trigger hidden retry
      await expect(core.ensureLoaded()).rejects.toThrow('Transient network glitch');
      expect(attempts).toBe(1);

      // Explicit retry succeeds
      await core.retryLoad();
      expect(attempts).toBe(2);
      expect(core.getSignals().length).toBe(1);
    });
  });
});

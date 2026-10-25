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

function createDisposableLocalDatabase() {
  const store = new Map<string, { id: string; metric_value: number; metadata: any; recorded_at?: string }>();
  return {
    from: (_table: string) => ({
      select: (_cols?: string) => ({
        eq: (_col: string, val: any) => ({
          maybeSingle: async () => {
            const row = store.get(String(val));
            if (!row) return { data: null, error: null };
            return { data: { ...row }, error: null };
          },
        }),
      }),
      insert: (record: any) => ({
        select: async () => {
          store.set(String(record.id), { ...record });
          return { data: [{ ...record }], error: null };
        },
      }),
      update: (updates: any) => ({
        eq: (_col1: string, idVal: any) => ({
          eq: (_col2: string, verVal: any) => ({
            select: async () => {
              const row = store.get(String(idVal));
              if (row && Number(row.metric_value) === Number(verVal)) {
                row.metric_value = updates.metric_value;
                row.metadata = updates.metadata;
                row.recorded_at = updates.recorded_at;
                return { data: [{ ...row }], error: null };
              }
              return { data: [], error: null };
            },
          }),
        }),
      }),
    }),
  };
}



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

  // ── 1. Authoritative Persistence Integration (Local Disposable Default, Opt-In Live Staging) ──
  it('commits mutation to authoritative database and survives fresh read in new instance', async () => {
    const isLiveOptIn = process.env.RUN_LIVE_STAGING_TESTS === 'true';

    if (isLiveOptIn && (!stagingUrl || !stagingKey || stagingUrl.includes('dummy'))) {
      console.warn('Skipping live staging test: RUN_LIVE_STAGING_TESTS=true but STAGING_SUPABASE_URL not configured');
      return;
    }

    const localDb = isLiveOptIn ? null : createDisposableLocalDatabase();

    // Repository A: seed initial state
    const repoA = isLiveOptIn
      ? new SupabaseStateRepository({ url: stagingUrl, key: stagingKey })
      : new SupabaseStateRepository({ client: localDb });
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
    const repoB = isLiveOptIn
      ? new SupabaseStateRepository({ url: stagingUrl, key: stagingKey })
      : new SupabaseStateRepository({ client: localDb });
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
  }, 20000);


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

    // In degraded mode, ensureLoaded() fails closed with a typed persistence error
    await expect(core.ensureLoaded()).rejects.toThrow(NewsroomPersistenceError);

    // Desk operations and state access are blocked rather than exposing uninitialized empty state
    const deskService = new NewsroomDeskService(core);
    await expect(deskService.getDeskSummary()).rejects.toThrow(NewsroomPersistenceError);
    expect(() => core.getSignals()).toThrow(NewsroomPersistenceError);
    expect(() => core.getObservations()).toThrow(NewsroomPersistenceError);
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
    function createDeferred<T>() {
      let resolve!: (value: T | PromiseLike<T>) => void;
      let reject!: (reason?: any) => void;
      const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
      });
      return { promise, resolve, reject };
    }
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

    it('REG-06: retryLoad() during an in-flight load does not cause a second concurrent repository load', async () => {
      const deferred = createDeferred<NewsroomPersistedState>();
      const repo = {
        kind: 'supabase' as const,
        isDegradedReadOnly: false,
        load: vi.fn().mockImplementation(() => deferred.promise),
        save: vi.fn().mockResolvedValue(undefined),
      };

      const core = NewsroomIntelligenceCore.resetInstance(repo as any);

      // Start in-flight load via ensureLoaded
      const ensurePromise = core.ensureLoaded();
      expect(repo.load).toHaveBeenCalledTimes(1);

      // Call retryLoad while ensureLoaded is pending
      const retryPromise = core.retryLoad();

      // MUST NOT trigger a second repository load
      expect(repo.load).toHaveBeenCalledTimes(1);
      // MUST share / reuse the in-flight initialization promise
      expect(retryPromise).toBe(ensurePromise);

      // Resolve the deferred promise
      const testState = createBaselineTestState();
      deferred.resolve(testState);

      // Both promises settle successfully
      await Promise.all([ensurePromise, retryPromise]);

      expect(core.getSignals().length).toBe(1);
      expect(repo.load).toHaveBeenCalledTimes(1);
    });

    it('REG-07: explicit retry permitted after prior failure has settled; restores state and clears failure without duplicate loads', async () => {
      const deferredAttempt1 = createDeferred<NewsroomPersistedState>();
      const deferredAttempt2 = createDeferred<NewsroomPersistedState>();

      let callCount = 0;
      const repo = {
        kind: 'supabase' as const,
        isDegradedReadOnly: false,
        load: vi.fn().mockImplementation(() => {
          callCount++;
          if (callCount === 1) return deferredAttempt1.promise;
          return deferredAttempt2.promise;
        }),
        save: vi.fn().mockResolvedValue(undefined),
      };

      const core = NewsroomIntelligenceCore.resetInstance(repo as any);

      // Attempt 1 fails
      const initialLoad = core.ensureLoaded();
      expect(repo.load).toHaveBeenCalledTimes(1);

      deferredAttempt1.reject(new Error('Outage on primary persistence replica'));

      await expect(initialLoad).rejects.toMatchObject({
        name: 'NewsroomPersistenceError',
        code: 'PERSISTENCE_UNAVAILABLE',
        message: expect.stringContaining('Outage on primary persistence replica'),
      });

      // State access is blocked after failed attempt 1
      expect(() => core.getSignals()).toThrow(NewsroomPersistenceError);

      // Explicit retry is now permitted because prior attempt definitively failed
      const retryPromise = core.retryLoad();
      expect(repo.load).toHaveBeenCalledTimes(2);

      // Concurrent ensureLoaded during retry reuses retry promise
      const concurrentEnsure = core.ensureLoaded();
      expect(concurrentEnsure).toBe(retryPromise);
      expect(repo.load).toHaveBeenCalledTimes(2);

      // Attempt 2 succeeds with fresh state
      const retryState = createBaselineTestState();
      retryState.signals[0].id = 'sig-retry-durability-002';
      retryState.signals[0].title = 'Cabinet Approves Semiconductor Mission Expansion (Verified)';
      deferredAttempt2.resolve(retryState);

      await retryPromise;
      await concurrentEnsure;

      // Verify successful retry hydrated state
      expect(core.getSignals().length).toBe(1);
      const signal = core.getSignal('sig-retry-durability-002');
      expect(signal).toBeDefined();
      expect(signal!.title).toBe('Cabinet Approves Semiconductor Mission Expansion (Verified)');

      // Verify successful retry cleared prior failure state and restored operational readiness
      await expect(core.ensureLoaded()).resolves.toBeUndefined();
      expect(() => core.getSignals()).not.toThrow();
      expect(core.getSignals().length).toBe(1);

      // Calling retryLoad again when already loaded does not cause a third load
      await core.retryLoad();
      expect(repo.load).toHaveBeenCalledTimes(2);
    });

    it('REG-08: generation guard ensures stale attempt cannot overwrite state with late resolution', async () => {
      const deferred1 = createDeferred<NewsroomPersistedState>();
      const deferred2 = createDeferred<NewsroomPersistedState>();

      let callCount = 0;
      const repo = {
        kind: 'supabase' as const,
        isDegradedReadOnly: false,
        load: vi.fn().mockImplementation(() => {
          callCount++;
          if (callCount === 1) return deferred1.promise;
          return deferred2.promise;
        }),
        save: vi.fn().mockResolvedValue(undefined),
      };

      const core = NewsroomIntelligenceCore.resetInstance(repo as any);

      // Start generation 1
      const gen1Promise = core.ensureLoaded();
      expect(repo.load).toHaveBeenCalledTimes(1);

      // Simulate a newer load generation (e.g. forced retry or next generation)
      const gen2Promise = (core as any).initiateLoad();
      expect(repo.load).toHaveBeenCalledTimes(2);

      // Generation 2 succeeds first with authoritative state
      const state2 = createBaselineTestState();
      state2.signals[0].id = 'sig-gen2-authoritative';
      deferred2.resolve(state2);
      await gen2Promise;

      expect(core.getSignal('sig-gen2-authoritative')).toBeDefined();

      // Now generation 1 resolves late with stale state
      const staleState = createBaselineTestState();
      staleState.signals[0].id = 'sig-gen1-stale';
      deferred1.resolve(staleState);
      await gen1Promise;

      // Generation guard MUST have ignored generation 1's stale state
      expect(core.getSignal('sig-gen2-authoritative')).toBeDefined();
      expect(core.getSignal('sig-gen1-stale')).toBeUndefined();
      expect(core.getSignals().length).toBe(1);
    });

    it('REG-11: generation guard ensures late rejection from stale load attempt cannot set loadError or invalidate authoritative state', async () => {
      const deferredGen1 = createDeferred<NewsroomPersistedState>();
      const deferredGen2 = createDeferred<NewsroomPersistedState>();

      let callCount = 0;
      const repo = {
        kind: 'supabase' as const,
        isDegradedReadOnly: false,
        load: vi.fn().mockImplementation(() => {
          callCount++;
          if (callCount === 1) return deferredGen1.promise;
          return deferredGen2.promise;
        }),
        save: vi.fn().mockResolvedValue(undefined),
      };

      const core = NewsroomIntelligenceCore.resetInstance(repo as any);

      // 1. Starts generation 1 and leaves its repository load pending
      const gen1Promise = core.ensureLoaded();
      expect(repo.load).toHaveBeenCalledTimes(1);

      // 2. Starts generation 2 through a controlled test path, leaving generation 1 unresolved.
      // Seam documentation:
      // In production, ensureLoaded() and retryLoad() intentionally reuse the in-flight
      // loadPromise rather than spawning concurrent initialization attempts. To test the
      // defense-in-depth generation guard against out-of-order stale completions (e.g., an
      // orphaned or aborted background repository read rejecting after a newer generation
      // has initialized), we invoke the private initiateLoad() method directly as the narrowest
      // test seam, avoiding artificial expansion of the public production API.
      const gen2Promise = (core as any).initiateLoad();
      expect(repo.load).toHaveBeenCalledTimes(2);

      // 3. Resolves generation 2 successfully with identifiable authoritative state
      const stateGen2 = createBaselineTestState();
      stateGen2.signals[0].id = 'sig-gen2-authoritative';
      stateGen2.signals[0].title = 'Authoritative Gen-2 State';
      deferredGen2.resolve(stateGen2);
      await gen2Promise;

      expect((core as any).isLoaded).toBe(true);
      expect((core as any).loadError).toBeNull();
      expect(core.getSignal('sig-gen2-authoritative')).toBeDefined();
      expect(core.getSignals().length).toBe(1);

      // 4. Rejects generation 1 only after generation 2 has completed
      const staleRejection = new Error('Stale generation-1 database connection reset');
      deferredGen1.reject(staleRejection);

      // Await gen1Promise settling. Because gen1 generation !== loadGeneration,
      // initiateLoad catches it and discards the late rejection.
      await gen1Promise;

      // 5. Verifies the late rejection cannot set or overwrite "loadError", invalidate the loaded state,
      // or replace the authoritative collections
      expect((core as any).loadError).toBeNull();
      expect((core as any).isLoaded).toBe(true);
      expect(core.getSignals().length).toBe(1);
      expect(core.getSignal('sig-gen2-authoritative')).toBeDefined();
      expect(core.getSignal('sig-gen2-authoritative')!.title).toBe('Authoritative Gen-2 State');

      // 6. Verifies "ensureLoaded()" and synchronous state access continue to succeed and the authoritative
      // generation-2 state remains intact
      await expect(core.ensureLoaded()).resolves.toBeUndefined();
      expect(() => core.getSignals()).not.toThrow();
      expect(() => core.getObservations()).not.toThrow();
      expect(() => core.getAlerts()).not.toThrow();
      expect(() => core.buildPersistedState()).not.toThrow();
      expect(core.buildPersistedState().signals[0].id).toBe('sig-gen2-authoritative');
    });

    it('REG-09: concurrent ensureLoaded() callers share one canonical Promise without duplicate loads', async () => {
      const deferred = createDeferred<NewsroomPersistedState>();
      const repo = {
        kind: 'supabase' as const,
        isDegradedReadOnly: false,
        load: vi.fn().mockImplementation(() => deferred.promise),
        save: vi.fn().mockResolvedValue(undefined),
      };

      const core = NewsroomIntelligenceCore.resetInstance(repo as any);

      const p1 = core.ensureLoaded();
      const p2 = core.ensureLoaded();
      const p3 = core.ensureLoaded();

      expect(p2).toBe(p1);
      expect(p3).toBe(p1);
      expect(repo.load).toHaveBeenCalledTimes(1);

      deferred.resolve(createBaselineTestState());
      await Promise.all([p1, p2, p3]);

      expect(core.getSignals().length).toBe(1);
      expect(repo.load).toHaveBeenCalledTimes(1);
    });

    it('REG-10: failed initialization remains observable and state access remains blocked fail-closed', async () => {
      const deferred = createDeferred<NewsroomPersistedState>();
      const repo = {
        kind: 'supabase' as const,
        isDegradedReadOnly: false,
        load: vi.fn().mockImplementation(() => deferred.promise),
        save: vi.fn().mockResolvedValue(undefined),
      };

      const core = NewsroomIntelligenceCore.resetInstance(repo as any);

      const p1 = core.ensureLoaded();
      const p2 = core.ensureLoaded();

      // Reject deferred
      const rootErr = new Error('Connection refused to database replica');
      deferred.reject(rootErr);

      await expect(p1).rejects.toMatchObject({
        name: 'NewsroomPersistenceError',
        code: 'PERSISTENCE_UNAVAILABLE',
        message: expect.stringContaining('Connection refused to database replica'),
      });
      await expect(p2).rejects.toMatchObject({
        name: 'NewsroomPersistenceError',
        code: 'PERSISTENCE_UNAVAILABLE',
      });

      // Repeated call does not initiate hidden retry and throws failure
      await expect(core.ensureLoaded()).rejects.toMatchObject({
        name: 'NewsroomPersistenceError',
        code: 'PERSISTENCE_UNAVAILABLE',
      });
      expect(repo.load).toHaveBeenCalledTimes(1);

      // State access remains strictly blocked fail-closed
      expect(() => core.getSignals()).toThrow(NewsroomPersistenceError);
      expect(() => core.getObservations()).toThrow(NewsroomPersistenceError);
      expect(() => core.getAlerts()).toThrow(NewsroomPersistenceError);
      expect(() => core.getCoverageGaps()).toThrow(NewsroomPersistenceError);
      expect(() => core.getScorecard()).toThrow(NewsroomPersistenceError);
      expect(() => core.buildPersistedState()).toThrow(NewsroomPersistenceError);
      expect(() => core.ingestObservation({ id: 'obs-blocked' } as any)).toThrow(NewsroomPersistenceError);
    });

    it('REG-12: healthy empty database (load returns null with isDegradedReadOnly === false) initializes successfully without error', async () => {
      const repo = {
        kind: 'supabase' as const,
        isDegradedReadOnly: false,
        load: vi.fn().mockResolvedValue(null),
        save: vi.fn().mockResolvedValue(undefined),
      };

      const core = NewsroomIntelligenceCore.resetInstance(repo as any);
      await expect(core.ensureLoaded()).resolves.toBeUndefined();
      expect(repo.load).toHaveBeenCalledTimes(1);

      // Verify healthy empty state is authoritative: accessors return empty arrays without throwing
      expect(core.getSignals()).toEqual([]);
      expect(core.getObservations()).toEqual([]);
      expect(core.getCoverageGaps()).toEqual([]);
      expect(core.getAlerts()).toEqual([]);
      expect((core as any).isLoaded).toBe(true);
      expect((core as any).loadError).toBeNull();
    });

    it('REG-13: missing Supabase client (load returns null with isDegradedReadOnly === true) fails initialization with typed persistence error', async () => {
      const brokenRepo = new SupabaseStateRepository({ url: 'https://dummy.supabase.co' });
      expect(brokenRepo.isDegradedReadOnly).toBe(true);

      const core = NewsroomIntelligenceCore.resetInstance(brokenRepo);
      await expect(core.ensureLoaded()).rejects.toMatchObject({
        name: 'NewsroomPersistenceError',
        code: 'PERSISTENCE_UNAVAILABLE',
        message: expect.stringContaining('degraded read-only mode'),
      });

      expect((core as any).isLoaded).toBe(false);
      expect((core as any).loadError).toBeDefined();

      // State access is blocked fail-closed; does NOT silently expose empty collections
      expect(() => core.getSignals()).toThrow(NewsroomPersistenceError);
      expect(() => core.getObservations()).toThrow(NewsroomPersistenceError);
      expect(() => core.getCoverageGaps()).toThrow(NewsroomPersistenceError);
    });

    it('REG-14: query error returning null with isDegradedReadOnly === true fails initialization and blocks state access and mutations', async () => {
      let isDegraded = true;
      const repo = {
        kind: 'supabase' as const,
        get isDegradedReadOnly() {
          return isDegraded;
        },
        load: vi.fn().mockResolvedValue(null),
        save: vi.fn().mockRejectedValue(new Error('Cannot save during degraded mode')),
      };

      const core = NewsroomIntelligenceCore.resetInstance(repo as any);
      await expect(core.ensureLoaded()).rejects.toThrow(NewsroomPersistenceError);

      // Synchronous accessors blocked
      expect(() => core.getSignals()).toThrow(NewsroomPersistenceError);
      expect(() => core.getObservations()).toThrow(NewsroomPersistenceError);

      // Synchronous mutation blocked
      expect(() => core.registerCoverageGap({ id: 'gap-blocked' } as any)).toThrow(NewsroomPersistenceError);
      expect(() => core.executeAction({ type: 'escalate' } as any)).toThrow(NewsroomPersistenceError);

      // Asynchronous mutation blocked
      await expect(core.executeActionAsync({ type: 'escalate' } as any)).rejects.toThrow(NewsroomPersistenceError);
    });

    it('REG-15: explicit retryLoad restores authoritative state after degraded repository recovers', async () => {
      let isDegraded = true;
      let currentState: NewsroomPersistedState | null = null;
      const repo = {
        kind: 'supabase' as const,
        get isDegradedReadOnly() {
          return isDegraded;
        },
        load: vi.fn().mockImplementation(async () => currentState),
        save: vi.fn().mockResolvedValue(undefined),
      };

      const core = NewsroomIntelligenceCore.resetInstance(repo as any);

      // 1. First attempt fails due to degradation
      await expect(core.ensureLoaded()).rejects.toThrow(NewsroomPersistenceError);
      expect(() => core.getSignals()).toThrow(NewsroomPersistenceError);

      // 2. Repository recovers
      isDegraded = false;
      currentState = createBaselineTestState();
      currentState.signals[0].id = 'sig-recovered';

      // 3. retryLoad restores state
      await expect(core.retryLoad()).resolves.toBeUndefined();
      expect(core.getSignals().length).toBe(1);
      expect(core.getSignal('sig-recovered')).toBeDefined();
      expect(() => core.getSignals()).not.toThrow();
      expect(core.isDegradedReadOnly()).toBe(false);
    });
  });
});

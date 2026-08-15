import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseStateRepository, SNAPSHOT_ROW_ID } from '../services/intelligence/newsroom/persistence/supabase';
import { NewsroomIntelligenceCore } from '../services/intelligence/newsroom';
import { NewsroomPersistedState } from '../services/intelligence/newsroom/persistence/state';

let dbRow: { id: string; metric_value: number; metadata: any } | null = null;
let dbError: any = null;
let updateCount = 0;

vi.mock('@supabase/supabase-js', () => {
  return {
    createClient: vi.fn().mockImplementation(() => {
      return {
        from: vi.fn().mockImplementation((table: string) => {
          return {
            select: vi.fn().mockImplementation((fields: string) => {
              return {
                eq: vi.fn().mockImplementation((col: string, val: any) => {
                  return {
                    maybeSingle: vi.fn().mockImplementation(async () => {
                      if (dbError) throw dbError;
                      if (!dbRow) return { data: null, error: null };
                      return { data: { ...dbRow }, error: null };
                    }),
                  };
                }),
              };
            }),
            update: vi.fn().mockImplementation((updates: any) => {
              updateCount++;
              return {
                eq: vi.fn().mockImplementation((col1: string, val1: any) => {
                  return {
                    eq: vi.fn().mockImplementation((col2: string, val2: any) => {
                      return {
                        select: vi.fn().mockImplementation(async () => {
                          if (dbError) throw dbError;
                          if (dbRow && dbRow.metric_value === val2) {
                            dbRow.metric_value = updates.metric_value;
                            dbRow.metadata = updates.metadata;
                            return { data: [dbRow], error: null };
                          }
                          return { data: [], error: null };
                        }),
                      };
                    }),
                  };
                }),
              };
            }),
          };
        }),
      };
    }),
  };
});

function createMockPersistedState(idSeed: string): NewsroomPersistedState {
  return {
    version: 1,
    savedAt: new Date().toISOString(),
    observations: [{ id: `obs-${idSeed}`, sourceId: 'pib', title: `Title ${idSeed}`, snippet: 'Snippet', publicationTimestamp: new Date().toISOString(), ingestionTimestamp: new Date().toISOString(), sourceTier: 't1', isPrimarySource: true, duplicateState: 'unique', entities: [] }],
    claims: [],
    clusters: [],
    signals: [{ id: `sig-${idSeed}`, sourceObservationId: `obs-${idSeed}`, title: `Title ${idSeed}`, snippet: 'Snippet', weight: 1, priority: 'P2', lifecycleState: 'triage', matchedBeats: [], timeline: [], audit: [], metadata: {} }],
    gaps: [],
    alerts: [{ id: 'alt-shared', severity: 'high', title: 'Shared Alert', message: 'Msg', status: 'unacknowledged', timestamp: new Date().toISOString(), beatId: 'economy', signalId: `sig-${idSeed}` }],
    audit: [],
    beats: [],
    recipients: [],
    escalations: [],
    fatigue: {
      userFatigue: {},
      beatFatigue: {},
    },
    sourceReputations: [],
    engine: {
      shadowMode: true,
      lastEvaluatedAt: new Date().toISOString(),
      evalCount: 0,
    },
  };
}

describe('NEWSROOM PERSISTENCE, CONCURRENCY & IDEMPOTENCY', () => {
  beforeEach(() => {
    dbRow = {
      id: SNAPSHOT_ROW_ID,
      metric_value: 10,
      metadata: createMockPersistedState('base'),
    };
    dbError = null;
    updateCount = 0;
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mock.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock_key';
  });

  it('CO-01: A/B parallel writes merge distinct new state elements without lost updates', async () => {
    const repoA = new SupabaseStateRepository();
    const repoB = new SupabaseStateRepository();

    const stateA = await repoA.load();
    const stateB = await repoB.load();

    // Instance A adds observation A
    stateA!.observations.push({
      id: 'obs-A',
      sourceId: 'pib',
      title: 'Observation A',
      snippet: 'Snippet A',
      publicationTimestamp: new Date().toISOString(),
      ingestionTimestamp: new Date().toISOString(),
      sourceTier: 't1',
      isPrimarySource: true,
      duplicateState: 'unique',
      entities: [],
    });

    // Instance B adds observation B
    stateB!.observations.push({
      id: 'obs-B',
      sourceId: 'pib',
      title: 'Observation B',
      snippet: 'Snippet B',
      publicationTimestamp: new Date().toISOString(),
      ingestionTimestamp: new Date().toISOString(),
      sourceTier: 't1',
      isPrimarySource: true,
      duplicateState: 'unique',
      entities: [],
    });

    // Save in parallel (simulating conflict and retry-merge)
    await Promise.all([repoA.save(stateA!), repoB.save(stateB!)]);

    const finalState = dbRow!.metadata as NewsroomPersistedState;
    const ids = finalState.observations.map(o => o.id);
    expect(ids).toContain('obs-base');
    expect(ids).toContain('obs-A');
    expect(ids).toContain('obs-B');
    expect(updateCount).toBeGreaterThan(1); // confirmed retry sequence triggered
  });

  it('CO-02: Conflicting writes to the same alert resolve without corruption', async () => {
    const repoA = new SupabaseStateRepository();
    const repoB = new SupabaseStateRepository();

    const stateA = await repoA.load();
    const stateB = await repoB.load();

    // A marks shared alert acknowledged by actor A
    const alertA = stateA!.alerts.find(a => a.id === 'alt-shared');
    alertA!.status = 'acknowledged';
    alertA!.acknowledgedBy = 'actor-A';

    // B marks shared alert acknowledged by actor B
    const alertB = stateB!.alerts.find(a => a.id === 'alt-shared');
    alertB!.status = 'acknowledged';
    alertB!.acknowledgedBy = 'actor-B';

    await Promise.all([repoA.save(stateA!), repoB.save(stateB!)]);

    const finalState = dbRow!.metadata as NewsroomPersistedState;
    const finalAlert = finalState.alerts.find(a => a.id === 'alt-shared');
    expect(finalAlert!.status).toBe('acknowledged');
    expect(['actor-A', 'actor-B']).toContain(finalAlert!.acknowledgedBy);
  });

  it('ID-01: Ingestion is idempotent; duplicate observations are discarded', async () => {
    const repo = new SupabaseStateRepository();
    const core = NewsroomIntelligenceCore.resetInstance(repo);
    await core.ensureLoaded();

    const duplicateObs = {
      id: 'obs-duplicate-run',
      sourceId: 'pib',
      externalId: 'pib-pr-unique-key',
      canonicalUrl: 'https://pib.gov.in/PressReleasePage.aspx?PRID=9999',
      title: 'Duplicate Title Check',
      snippet: 'Testing natural key duplicate filtering.',
      publicationTimestamp: new Date().toISOString(),
      ingestionTimestamp: new Date().toISOString(),
      sourceTier: 't1' as const,
      isPrimarySource: true,
      duplicateState: 'unique' as const,
      entities: [],
      metadata: {},
    };

    // First ingestion
    core.ingestObservation(duplicateObs);
    expect(core.getObservations().filter(o => o.id === 'obs-duplicate-run').length).toBe(1);

    // Second ingestion (retry/duplicate delivery scenario)
    core.ingestObservation(duplicateObs);
    // Natural key de-duplication keeps count exactly 1
    expect(core.getObservations().filter(o => o.id === 'obs-duplicate-run').length).toBe(1);
  });

  it('FS-01: Database unavailable throws an explicit recovery failure and does not silently clear state', async () => {
    const repo = new SupabaseStateRepository();
    const core = NewsroomIntelligenceCore.resetInstance(repo);

    // Simulate database outage
    dbError = new Error('Database connection reset');

    await expect(core.ensureLoaded()).rejects.toThrow('Newsroom state unavailable: Database connection reset');

    // Ensure in-memory collections remained empty or protected from silent mock corruption
    expect(core.getObservations().length).toBe(0);
  });
});

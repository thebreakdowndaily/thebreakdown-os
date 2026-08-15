import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseStateRepository, SNAPSHOT_ROW_ID } from '../services/intelligence/newsroom/persistence/supabase';
import { NewsroomPersistedState } from '../services/intelligence/newsroom/persistence/state';

// Mock Supabase JS client
let mockDbRow: { id: string; metric_value: number; metadata: any } | null = null;
let updateCallCount = 0;

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
                      if (!mockDbRow) {
                        return { data: null, error: null };
                      }
                      return { data: { ...mockDbRow }, error: null };
                    }),
                  };
                }),
              };
            }),
            insert: vi.fn().mockImplementation((row: any) => {
              return {
                select: vi.fn().mockImplementation(async () => {
                  mockDbRow = {
                    id: row.id,
                    metric_value: row.metric_value,
                    metadata: row.metadata,
                  };
                  return { data: [mockDbRow], error: null };
                }),
              };
            }),
            update: vi.fn().mockImplementation((updates: any) => {
              updateCallCount++;
              return {
                eq: vi.fn().mockImplementation((col1: string, val1: any) => {
                  return {
                    eq: vi.fn().mockImplementation((col2: string, val2: any) => {
                      return {
                        select: vi.fn().mockImplementation(async () => {
                          // Optimistic locking check: val2 is the expected remote version
                          if (mockDbRow && mockDbRow.metric_value === val2) {
                            mockDbRow.metric_value = updates.metric_value;
                            mockDbRow.metadata = updates.metadata;
                            return { data: [mockDbRow], error: null };
                          }
                          // Version mismatch: return empty array (0 rows updated)
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

function createEmptyState(idSeed: string): NewsroomPersistedState {
  return {
    version: 1,
    savedAt: new Date().toISOString(),
    observations: [{ id: `obs-${idSeed}`, sourceId: 'pib', title: `Title ${idSeed}`, snippet: 'Snippet', publicationTimestamp: new Date().toISOString(), ingestionTimestamp: new Date().toISOString(), sourceTier: 't1', isPrimarySource: true, duplicateState: 'unique', entities: [] }],
    claims: [],
    clusters: [],
    signals: [{ id: `sig-${idSeed}`, sourceObservationId: `obs-${idSeed}`, title: `Title ${idSeed}`, snippet: 'Snippet', weight: 1, priority: 'P2', lifecycleState: 'triage', matchedBeats: [], timeline: [], audit: [], metadata: {} }],
    gaps: [],
    alerts: [{ id: `alt-${idSeed}`, severity: 'high', title: `Alert ${idSeed}`, message: 'Msg', status: 'unacknowledged', timestamp: new Date().toISOString(), beatId: 'economy', signalId: `sig-${idSeed}` }],
    audit: [],
    beats: [],
    recipients: [],
    escalations: [],
    fatigue: {
      userRollingHours: {},
      userRollingDays: {},
      beatRollingDays: {},
    },
    sourceReputations: {},
    engine: {
      shadowMode: true,
      lastEvaluatedAt: new Date().toISOString(),
      evalCount: 0,
    },
  };
}

describe('SUPABASE PERSISTENCE CONCURRENCY & LOCKING', () => {
  beforeEach(() => {
    mockDbRow = {
      id: SNAPSHOT_ROW_ID,
      metric_value: 1,
      metadata: createEmptyState('base'),
    };
    updateCallCount = 0;
    // Set temporary process env vars so the repository instantiates the mock client
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mock.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock_key';
  });

  it('CONC-01: Correctly merges concurrent updates and retries on write conflict', async () => {
    const repo1 = new SupabaseStateRepository();
    const repo2 = new SupabaseStateRepository();

    // 1. Load state concurrently
    const state1 = await repo1.load();
    const state2 = await repo2.load();

    expect(state1).toBeDefined();
    expect(state2).toBeDefined();

    // 2. Perform concurrent mutations
    // Client 1 adds observation A
    state1!.observations.push({
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

    // Client 2 adds observation B
    state2!.observations.push({
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

    // 3. Save concurrently
    // Let's call save in parallel
    const p1 = repo1.save(state1!);
    const p2 = repo2.save(state2!);

    await Promise.all([p1, p2]);

    // 4. Verify results
    // Both observations should be successfully merged and written to the database!
    const finalState = mockDbRow!.metadata as NewsroomPersistedState;
    const finalObservations = finalState.observations.map(o => o.id);

    expect(finalObservations).toContain('obs-base');
    expect(finalObservations).toContain('obs-A');
    expect(finalObservations).toContain('obs-B');

    // Verify version sequence was updated correctly
    expect(mockDbRow!.metric_value).toBeGreaterThan(1);

    // Verify that at least one conflict occurred and was resolved by retrying
    expect(updateCallCount).toBeGreaterThan(1);
  });
});

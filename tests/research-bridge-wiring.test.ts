import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NewsroomIntelligenceCore } from '@/services/intelligence/newsroom';
import { ResearchIntelligenceCore } from '@/services/intelligence/research/core';
import {
  ResearchSupabaseStateRepository,
  RESEARCH_SNAPSHOT_ROW_ID,
} from '@/services/intelligence/research/persistence/supabase';
import { MemoryStateRepository } from '@/services/intelligence/newsroom/persistence/memory';
import { NewsroomAuditService } from '@/services/intelligence/newsroom/audit-service';
import type { NewsroomSignal } from '@/types/newsroom-intelligence';

describe('Phase C — Research Bridge Wiring & Durability', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    NewsroomAuditService.clear();
  });

  describe('Research Supabase Snapshot Repository (Row 1f0a7b3e-c5d8-4a2e-9b6f-3d2c7e8a9b01)', () => {
    it('uses the canonical RESEARCH_SNAPSHOT_ROW_ID', () => {
      expect(RESEARCH_SNAPSHOT_ROW_ID).toBe('1f0a7b3e-c5d8-4a2e-9b6f-3d2c7e8a9b01');
    });

    it('initializes and inserts the snapshot row on first save when no row exists', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ data: [{ id: RESEARCH_SNAPSHOT_ROW_ID }], error: null });
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      });

      const mockClient = {
        from: vi.fn().mockReturnValue({
          select: mockSelect,
          insert: vi.fn().mockReturnValue({ select: mockInsert }),
        }),
      };

      const repo = new ResearchSupabaseStateRepository();
      // Inject mock client
      (repo as any).client = mockClient;

      const loaded = await repo.load();
      expect(loaded).toBeNull();

      const testState: any = {
        version: 1,
        savedAt: new Date().toISOString(),
        projects: [{ id: 'rp_test_1', title: 'Test Project', status: 'ACTIVE' }],
        queries: [],
        sources: [],
        documents: [],
        claims: [],
        evidence: [],
        events: [],
        questions: [],
        contradictions: [],
        gaps: [],
        socialSignals: [],
        clusters: [],
        runs: [],
        changeEvents: [],
        storyBriefs: [],
      };

      await repo.save(testState);

      expect(mockClient.from).toHaveBeenCalledWith('pipeline_metrics');
      expect(mockInsert).toHaveBeenCalled();
    });

    it('merges remote state and performs optimistic concurrency update when row exists', async () => {
      const remoteState: any = {
        version: 1,
        savedAt: '2026-10-31T10:00:00.000Z',
        projects: [{ id: 'rp_remote_1', title: 'Remote Project', status: 'ACTIVE' }],
        queries: [],
        sources: [],
        documents: [],
        claims: [],
        evidence: [],
        events: [],
        questions: [],
        contradictions: [],
        gaps: [],
        socialSignals: [],
        clusters: [],
        runs: [],
        changeEvents: [],
        storyBriefs: [],
      };

      const mockUpdate = vi.fn().mockResolvedValue({ data: [{ id: RESEARCH_SNAPSHOT_ROW_ID }], error: null });
      const mockClient = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: { metric_value: '2', metadata: remoteState },
                error: null,
              }),
            }),
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: mockUpdate,
              }),
            }),
          }),
        }),
      };

      const repo = new ResearchSupabaseStateRepository();
      (repo as any).client = mockClient;

      const localState: any = {
        version: 1,
        savedAt: new Date().toISOString(),
        projects: [{ id: 'rp_local_1', title: 'Local Project', status: 'ACTIVE' }],
        queries: [],
        sources: [],
        documents: [],
        claims: [],
        evidence: [],
        events: [],
        questions: [],
        contradictions: [],
        gaps: [],
        socialSignals: [],
        clusters: [],
        runs: [],
        changeEvents: [],
        storyBriefs: [],
      };

      await repo.save(localState);

      expect(mockClient.from).toHaveBeenCalledWith('pipeline_metrics');
      expect(mockUpdate).toHaveBeenCalled();
    });
  });

  describe('Newsroom Core & Research Bridge Outbox Integration', () => {
    it('ensureLoaded awaits research core and mounts research bridge', async () => {
      const memoryRepo = new MemoryStateRepository();
      const newsroom = NewsroomIntelligenceCore.resetInstance(memoryRepo);

      const researchCore = ResearchIntelligenceCore.getInstance();
      const researchLoadSpy = vi.spyOn(researchCore, 'ensureLoaded').mockResolvedValue();

      expect(newsroom.getResearchBridge()).toBeNull();

      await newsroom.ensureLoaded();

      expect(researchLoadSpy).toHaveBeenCalled();
      expect(newsroom.getResearchBridge()).not.toBeNull();
    });

    it('dispatchToResearchBridge creates durable outbox entry and audit logs on success', async () => {
      const memoryRepo = new MemoryStateRepository();
      const newsroom = NewsroomIntelligenceCore.resetInstance(memoryRepo);

      const mockBridge = vi.fn().mockResolvedValue(undefined);
      newsroom.setResearchBridge(mockBridge);

      const signal: NewsroomSignal = {
        id: 'sig-test-456',
        clusterId: 'cluster-123',
        title: 'Critical Breaking Signal',
        summary: 'Signal summary',
        lifecycleState: 'DEVELOPING',
        priority: 'P1',
        firstDetectedAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString(),
        observationCount: 3,
        independentSourceCount: 3,
        primarySourceCount: 2,
        contradictionIds: [],
        keyClaims: ['Claim 1'],
        keyEntities: ['Entity A'],
        scores: { novelty: 0.8, velocity: 0.9, importance: 0.85 },
        explanation: { primaryFactor: 'velocity', reasoning: 'high velocity' },
        version: 1,
      };

      await newsroom.dispatchToResearchBridge(signal, 'test_dispatch');

      expect(mockBridge).toHaveBeenCalledWith(signal);

      const outbox = newsroom.getResearchBridgeOutbox();
      expect(outbox).toHaveLength(1);
      expect(outbox[0].signalId).toBe('sig-test-456');
      expect(outbox[0].status).toBe('PROCESSED');
      expect(outbox[0].processedAt).toBeDefined();

      const auditRecords = NewsroomAuditService.getAuditTrail({ signalId: 'sig-test-456' });
      expect(auditRecords.length).toBeGreaterThanOrEqual(2);
      expect(auditRecords.some((r) => r.newState === 'QUEUED_FOR_RESEARCH')).toBe(true);
      expect(auditRecords.some((r) => r.newState === 'RESEARCH_DISPATCHED')).toBe(true);
    });

    it('dispatchToResearchBridge handles bridge rejection fail-safely and logs failure', async () => {
      const memoryRepo = new MemoryStateRepository();
      const newsroom = NewsroomIntelligenceCore.resetInstance(memoryRepo);

      const mockBridge = vi.fn().mockRejectedValue(new Error('Network bridge unreachable'));
      newsroom.setResearchBridge(mockBridge);

      const signal: NewsroomSignal = {
        id: 'sig-err-789',
        clusterId: 'cluster-err',
        title: 'Error Signal',
        summary: 'Error summary',
        lifecycleState: 'DEVELOPING',
        priority: 'P2',
        firstDetectedAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString(),
        observationCount: 1,
        independentSourceCount: 1,
        primarySourceCount: 1,
        contradictionIds: [],
        keyClaims: [],
        keyEntities: [],
        scores: { novelty: 0.5, velocity: 0.5, importance: 0.5 },
        explanation: { primaryFactor: 'novelty', reasoning: 'moderate novelty' },
        version: 1,
      };

      // Must not throw or crash
      await expect(newsroom.dispatchToResearchBridge(signal, 'test_failure')).resolves.toBeUndefined();

      const outbox = newsroom.getResearchBridgeOutbox();
      expect(outbox).toHaveLength(1);
      expect(outbox[0].signalId).toBe('sig-err-789');
      expect(outbox[0].status).toBe('FAILED');
      expect(outbox[0].error).toContain('Network bridge unreachable');

      const auditRecords = NewsroomAuditService.getAuditTrail({ signalId: 'sig-err-789' });
      expect(auditRecords.some((r) => r.newState === 'RESEARCH_DISPATCH_FAILED')).toBe(true);
    });
  });
});

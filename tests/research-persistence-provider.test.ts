import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ResearchIntelligenceCore } from '@/services/intelligence/research/core';
import { createResearchStateRepository, ResearchSupabaseStateRepository } from '@/services/intelligence/research/persistence';
import { emptyPersistedState, ResearchPersistenceError, type ResearchStateRepository } from '@/services/intelligence/research/persistence/state';

describe('Research persistence fail-closed contract', () => {
  beforeEach(() => {
    ResearchIntelligenceCore.resetInstance();
    vi.stubEnv('RESEARCH_STATE_PROVIDER', '');
    vi.stubEnv('VERCEL_ENV', 'preview');
    vi.stubEnv('APP_ENV', '');
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('NEXT_PHASE', '');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');
  });

  afterEach(() => {
    ResearchIntelligenceCore.resetInstance();
    vi.unstubAllEnvs();
  });

  it('keeps memory as the default only outside production', () => {
    expect(createResearchStateRepository().kind).toBe('memory');
  });

  it('rejects memory and file providers in production', () => {
    vi.stubEnv('VERCEL_ENV', 'production');
    expect(() => createResearchStateRepository({ provider: 'memory' })).toThrow(ResearchPersistenceError);
    expect(() => createResearchStateRepository({ provider: 'file' })).toThrow(ResearchPersistenceError);
  });

  it('rejects unknown provider values rather than silently selecting memory', () => {
    expect(() => createResearchStateRepository({ provider: 'supabse' })).toThrow(ResearchPersistenceError);
  });

  it('rejects unconfigured Supabase loads instead of starting with empty authoritative state', async () => {
    const repo = new ResearchSupabaseStateRepository();
    await expect(repo.load()).rejects.toMatchObject({
      name: 'ResearchPersistenceError',
      code: 'PERSISTENCE_NOT_CONFIGURED',
    });
  });

  it('rejects unconfigured Supabase saves instead of returning success', async () => {
    const repo = new ResearchSupabaseStateRepository();
    await expect(repo.save(emptyPersistedState())).rejects.toMatchObject({
      name: 'ResearchPersistenceError',
      code: 'PERSISTENCE_NOT_CONFIGURED',
    });
  });

  it('makes write failure observable and reloads canonical state before subsequent operations', async () => {
    const durableState = emptyPersistedState();
    const failingRepository: ResearchStateRepository = {
      kind: 'supabase',
      load: () => structuredClone(durableState),
      save: async () => {
        throw new Error('simulated database write failure');
      },
    };
    const core = ResearchIntelligenceCore.getInstance(failingRepository);
    await core.ensureLoaded();

    core.createProject({
      title: 'Persistence failure test',
      description: 'Test-only record',
      researchQuestion: 'Does failure become observable?',
      createdBy: 'test',
    });

    await expect(core.flushPersistence()).rejects.toMatchObject({
      name: 'ResearchPersistenceError',
      code: 'PERSISTENCE_WRITE_FAILED',
    });

    await core.ensureLoaded();
    expect(core.getProjects()).toHaveLength(0);
  });
});

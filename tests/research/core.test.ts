/**
 * ─── Research Intelligence Engine — Core Facade + Persistence ────────────────
 * Governing document: docs/research/RESEARCH_INTELLIGENCE_OPERATING_STANDARD.md
 *
 * Tests the ResearchIntelligenceCore facade contract independently of the
 * pipeline: project lifecycle, overview accounting, deterministic adapters,
 * persistence round-trips (memory + file providers), and idempotent bootstrap.
 */

import { ResearchIntelligenceCore } from '../../services/intelligence/research/core';
import { runResearchPipeline } from '../../services/intelligence/research/pipeline';
import { fixtureAdapter } from '../../services/intelligence/research/adapters/fixture';
import {
  MemoryStateRepository,
  ResearchFileStateRepository,
} from '../../services/intelligence/research/persistence';
import { ensureResearchRuntime } from '../../lib/intelligence/research-bootstrap';
import type { ResearchPersistedState } from '../../services/intelligence/research/persistence';
import { emptyPersistedState } from '../../services/intelligence/research/persistence/state';
import * as os from 'node:os';
import * as path from 'node:path';

const FIXED_NOW = new Date('2026-08-15T12:00:00.000Z');

describe('Research Intelligence Core — facade', () => {
  beforeEach(async () => {
    ResearchIntelligenceCore.resetInstance();
  });

  it('is a process-wide singleton that survives getInstance calls', async () => {
    const a = ResearchIntelligenceCore.getInstance();
    const b = ResearchIntelligenceCore.getInstance();
    expect(a).toBe(b);
    await a.ensureLoaded();
    expect(a.getProjects()).toEqual([]);
  });

  it('creates and updates projects with lifecycle timestamps', async () => {
    const core = ResearchIntelligenceCore.getInstance();
    await core.ensureLoaded();

    const project = core.createProject({
      title: 'India-US trade tariffs',
      researchQuestion: 'India-US trade tariffs',
      description: 'Acceptance topic',
      priority: 'P1',
      createdBy: 'core-test',
    });

    expect(project.id).toMatch(/^rp_/);
    expect(project.slug).toBe('india-us-trade-tariffs');
    expect(project.status).toBe('DRAFT');
    expect(project.version).toBe(1);

    const bySlug = core.getProjectBySlug('india-us-trade-tariffs');
    expect(bySlug?.id).toBe(project.id);

    core.setProjectStatus(project.id, 'ACTIVE');
    const active = core.getProject(project.id);
    expect(active?.status).toBe('ACTIVE');
    expect(active?.startedAt).toBeTruthy();

    core.setProjectStatus(project.id, 'COMPLETED');
    const completed = core.getProject(project.id);
    expect(completed?.status).toBe('COMPLETED');
    expect(completed?.completedAt).toBeTruthy();
    expect(completed?.version).toBeGreaterThan(1);
  });

  it('exposes an accurate overview for a project with no runs yet', async () => {
    const core = ResearchIntelligenceCore.getInstance();
    await core.ensureLoaded();
    const project = core.createProject({
      title: 'India-US trade tariffs',
      researchQuestion: 'India-US trade tariffs',
      description: 'Acceptance topic',
      priority: 'P1',
      createdBy: 'core-test',
    });

    const overview = core.getProjectOverview(project.id);
    expect(overview?.sourceCount).toBe(0);
    expect(overview?.latestRun).toBeNull();
    expect(overview?.openResearchGaps).toBe(0);
    expect(core.getProjectOverview('proj_missing')).toBeNull();
  });

  it('registers adapters and resolves them through getAdapters', async () => {
    const core = ResearchIntelligenceCore.getInstance();
    await core.ensureLoaded();
    core.registerAdapter(fixtureAdapter);
    const ids = core.getAdapters().map((a) => a.id);
    expect(ids).toContain('fixture');
  });
});

describe('Research Intelligence Core — persistence round-trips', () => {
  beforeEach(async () => {
    ResearchIntelligenceCore.resetInstance();
  });

  it('restores full state from a memory repository across instances', async () => {
    const repository = new MemoryStateRepository();
    const core = ResearchIntelligenceCore.getInstance(repository, [fixtureAdapter]);
    await core.ensureLoaded();

    const project = core.createProject({
      title: 'India-US trade tariffs',
      researchQuestion: 'India-US trade tariffs',
      description: 'Acceptance topic',
      priority: 'P1',
      createdBy: 'persistence-test',
    });
    await runResearchPipeline(core, project.id, {
      triggeredBy: 'persistence-test',
      adapters: [fixtureAdapter],
      now: () => FIXED_NOW,
    });

    const claimCount = core.getClaims(project.id).length;
    expect(claimCount).toBeGreaterThan(0);

    // A fresh instance over the same repository must observe the same state.
    ResearchIntelligenceCore.resetInstance();
    const restored = ResearchIntelligenceCore.getInstance(repository, []);
    await restored.ensureLoaded();
    expect(restored.getProjects()).toHaveLength(1);
    const restoredProject = restored.getProject(project.id);
    expect(restoredProject).toBeDefined();
    expect(restored.getClaims(restoredProject!.id)).toHaveLength(claimCount);
    expect(restored.getRuns(restoredProject!.id)).toHaveLength(1);
  });

  it('round-trips a serializable snapshot through the file provider', async () => {
    const dir = await (async () => {
      const d = path.join(os.tmpdir(), `rie-test-${Date.now()}`);
      const fs = await import('node:fs/promises');
      await fs.mkdir(d, { recursive: true });
      return d;
    })();
    const filePath = path.join(dir, 'research-state.json');
    const repository = new ResearchFileStateRepository(filePath);

    const core = ResearchIntelligenceCore.getInstance(repository, []);
    await core.ensureLoaded();
    const project = core.createProject({
      title: 'India-US trade tariffs',
      researchQuestion: 'India-US trade tariffs',
      description: 'Acceptance topic',
      priority: 'P1',
      createdBy: 'file-test',
    });

    // File saves are async fire-and-forget; flush deterministically here.
    await repository.save(core.snapshot());

    const reloaded = new ResearchFileStateRepository(filePath);
    const persisted = await reloaded.load();
    expect(persisted).not.toBeNull();
    expect(persisted!.version).toBe(1);
    expect(persisted!.projects).toHaveLength(1);
    expect(persisted!.projects[0].id).toBe(project.id);

    const fs = await import('node:fs/promises');
    await fs.rm(dir, { recursive: true, force: true });
  });

  it('rejects snapshot versions that do not match the canonical version', async () => {
    const state: ResearchPersistedState = { ...emptyPersistedState(), version: 999 };
    const repository = new MemoryStateRepository(state);
    const core = ResearchIntelligenceCore.getInstance(repository, []);
    await core.ensureLoaded();
    expect(core.getProjects()).toHaveLength(0);
  });
});

describe('Research Intelligence Runtime — bootstrap', () => {
  beforeEach(async () => {
    ResearchIntelligenceCore.resetInstance();
  });

  it('provisions adapters idempotently and restores state', async () => {
    const result = await ensureResearchRuntime();
    expect(result.stateRestored).toBe(true);
    expect(result.adaptersProvisioned).toBeGreaterThanOrEqual(2);

    const second = await ensureResearchRuntime();
    expect(second.adaptersProvisioned).toBe(result.adaptersProvisioned);
  });
});

/**
 * ─── Radar File Persistence Repository ────────────────────────────────────────
 *
 * File-backed repository storing radar fingerprints, health, and runs to disk.
 * Ensures state survives process restarts and serverless worker recycles.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import type {
  ContentFingerprint,
  RadarSourceHealth,
  RadarLatencyRecord,
  RadarPipelineRunRecord,
} from '../types';
import type { RadarPersistenceRepository } from './types';

export const DEFAULT_RADAR_STATE_FILE = path.resolve(process.cwd(), '.radar-state.json');

interface FileRadarState {
  version: 1;
  savedAt: string;
  fingerprints: Record<string, ContentFingerprint>;
  healthMap: Record<string, RadarSourceHealth>;
  runs: RadarPipelineRunRecord[];
  latencyRecords: RadarLatencyRecord[];
  locks: Record<string, { ownerId: string; expiresAt: number }>;
}

export class FileRadarRepository implements RadarPersistenceRepository {
  readonly kind = 'file' as const;

  constructor(private readonly filePath: string = DEFAULT_RADAR_STATE_FILE) {}

  private async readState(): Promise<FileRadarState> {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(data) as FileRadarState;
    } catch {
      return {
        version: 1,
        savedAt: new Date().toISOString(),
        fingerprints: {},
        healthMap: {},
        runs: [],
        latencyRecords: [],
        locks: {},
      };
    }
  }

  private async writeState(state: FileRadarState): Promise<void> {
    state.savedAt = new Date().toISOString();
    const tempPath = `${this.filePath}.${Date.now()}.tmp`;
    await fs.writeFile(tempPath, JSON.stringify(state, null, 2), 'utf-8');
    await fs.rename(tempPath, this.filePath);
  }

  async loadFingerprints(): Promise<Map<string, ContentFingerprint>> {
    const state = await this.readState();
    return new Map(Object.entries(state.fingerprints));
  }

  async saveFingerprint(fp: ContentFingerprint): Promise<void> {
    const state = await this.readState();
    state.fingerprints[`${fp.sourceId}::${fp.resourceUrl}`] = { ...fp };
    await this.writeState(state);
  }

  async saveFingerprints(fps: ContentFingerprint[]): Promise<void> {
    const state = await this.readState();
    for (const fp of fps) {
      state.fingerprints[`${fp.sourceId}::${fp.resourceUrl}`] = { ...fp };
    }
    await this.writeState(state);
  }

  async loadSourceHealth(): Promise<Map<string, RadarSourceHealth>> {
    const state = await this.readState();
    return new Map(Object.entries(state.healthMap));
  }

  async saveSourceHealth(health: RadarSourceHealth): Promise<void> {
    const state = await this.readState();
    state.healthMap[health.sourceId] = { ...health };
    await this.writeState(state);
  }

  async saveAllSourceHealth(healthList: RadarSourceHealth[]): Promise<void> {
    const state = await this.readState();
    for (const h of healthList) {
      state.healthMap[h.sourceId] = { ...h };
    }
    await this.writeState(state);
  }

  async recordPipelineRun(run: RadarPipelineRunRecord): Promise<void> {
    const state = await this.readState();
    state.runs.push({ ...run });
    // Retain last 100 runs
    if (state.runs.length > 100) {
      state.runs = state.runs.slice(-100);
    }
    await this.writeState(state);
  }

  async getLatestPipelineRun(): Promise<RadarPipelineRunRecord | null> {
    const state = await this.readState();
    if (state.runs.length === 0) return null;
    return state.runs[state.runs.length - 1];
  }

  async recordLatency(record: RadarLatencyRecord): Promise<void> {
    const state = await this.readState();
    state.latencyRecords.push({ ...record });
    if (state.latencyRecords.length > 500) {
      state.latencyRecords = state.latencyRecords.slice(-500);
    }
    await this.writeState(state);
  }

  async acquireLock(lockKey: string, ownerId: string, ttlMs: number): Promise<boolean> {
    const state = await this.readState();
    const now = Date.now();
    const existing = state.locks[lockKey];

    if (existing && existing.expiresAt > now && existing.ownerId !== ownerId) {
      return false;
    }

    state.locks[lockKey] = { ownerId, expiresAt: now + ttlMs };
    await this.writeState(state);
    return true;
  }

  async releaseLock(lockKey: string, ownerId: string): Promise<void> {
    const state = await this.readState();
    const existing = state.locks[lockKey];
    if (existing && existing.ownerId === ownerId) {
      delete state.locks[lockKey];
      await this.writeState(state);
    }
  }
}

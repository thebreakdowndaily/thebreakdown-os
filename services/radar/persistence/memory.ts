/**
 * ─── Radar Memory Persistence Repository ──────────────────────────────────────
 *
 * Fast, pure in-memory repository for unit tests and isolated simulations.
 */

import type {
  ContentFingerprint,
  RadarSourceHealth,
  RadarLatencyRecord,
  RadarPipelineRunRecord,
} from '../types';
import type { RadarPersistenceRepository } from './types';
import { mergeLatencyRecord } from '../latency-tracker';

export class MemoryRadarRepository implements RadarPersistenceRepository {
  readonly kind = 'memory' as const;

  private fingerprints: Map<string, ContentFingerprint> = new Map();
  private healthMap: Map<string, RadarSourceHealth> = new Map();
  private runs: RadarPipelineRunRecord[] = [];
  private latencyMap: Map<string, RadarLatencyRecord> = new Map();
  private locks: Map<string, { ownerId: string; expiresAt: number }> = new Map();

  async loadFingerprints(): Promise<Map<string, ContentFingerprint>> {
    return new Map(this.fingerprints);
  }

  async saveFingerprint(fp: ContentFingerprint): Promise<void> {
    this.fingerprints.set(`${fp.sourceId}::${fp.resourceUrl}`, { ...fp });
  }

  async saveFingerprints(fps: ContentFingerprint[]): Promise<void> {
    for (const fp of fps) {
      this.fingerprints.set(`${fp.sourceId}::${fp.resourceUrl}`, { ...fp });
    }
  }

  async loadSourceHealth(): Promise<Map<string, RadarSourceHealth>> {
    return new Map(this.healthMap);
  }

  async saveSourceHealth(health: RadarSourceHealth): Promise<void> {
    this.healthMap.set(health.sourceId, { ...health });
  }

  async saveAllSourceHealth(healthList: RadarSourceHealth[]): Promise<void> {
    for (const h of healthList) {
      this.healthMap.set(h.sourceId, { ...h });
    }
  }

  async recordPipelineRun(run: RadarPipelineRunRecord): Promise<void> {
    this.runs.push({ ...run });
  }

  async getLatestPipelineRun(): Promise<RadarPipelineRunRecord | null> {
    if (this.runs.length === 0) return null;
    return { ...this.runs[this.runs.length - 1] };
  }

  async recordLatency(record: RadarLatencyRecord): Promise<void> {
    const existing = this.latencyMap.get(record.clusterId) || null;
    const merged = mergeLatencyRecord(existing, record);
    this.latencyMap.set(merged.clusterId, merged);
  }

  async getLatencyRecord(clusterId: string): Promise<RadarLatencyRecord | null> {
    const rec = this.latencyMap.get(clusterId);
    return rec ? { ...rec } : null;
  }

  async getLatencyRecords(): Promise<RadarLatencyRecord[]> {
    return Array.from(this.latencyMap.values()).map(r => ({ ...r }));
  }

  async acquireLock(lockKey: string, ownerId: string, ttlMs: number): Promise<boolean> {
    const now = Date.now();
    const existing = this.locks.get(lockKey);

    if (existing && existing.expiresAt > now && existing.ownerId !== ownerId) {
      return false; // Lock active and owned by another worker
    }

    this.locks.set(lockKey, { ownerId, expiresAt: now + ttlMs });
    return true;
  }

  async releaseLock(lockKey: string, ownerId: string): Promise<void> {
    const existing = this.locks.get(lockKey);
    if (existing && existing.ownerId === ownerId) {
      this.locks.delete(lockKey);
    }
  }

  clear(): void {
    this.fingerprints.clear();
    this.healthMap.clear();
    this.runs = [];
    this.latencyMap.clear();
    this.locks.clear();
  }
}

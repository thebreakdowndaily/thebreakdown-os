/**
 * ─── Radar Persistence Repository Contract ───────────────────────────────────
 *
 * Governing document: AGENTS.md (Platform Beta Doctrine — Persistence & Durability)
 *
 * Provides persistent storage for:
 *   - Content fingerprints (change detection across worker restarts)
 *   - Source health & scheduling backoff states
 *   - Latency records (precision timing audit)
 *   - Pipeline run logs (operational telemetry)
 *   - Distributed concurrency locks (cron race condition prevention)
 */

import type {
  ContentFingerprint,
  RadarSourceHealth,
  RadarLatencyRecord,
  RadarPipelineRunRecord,
} from '../types';

export interface RadarPersistenceRepository {
  readonly kind: 'memory' | 'file' | 'supabase';

  // Fingerprint Store
  loadFingerprints(): Promise<Map<string, ContentFingerprint>>;
  saveFingerprint(fp: ContentFingerprint): Promise<void>;
  saveFingerprints(fps: ContentFingerprint[]): Promise<void>;

  // Source Health & Scheduling
  loadSourceHealth(): Promise<Map<string, RadarSourceHealth>>;
  saveSourceHealth(health: RadarSourceHealth): Promise<void>;
  saveAllSourceHealth(healthList: RadarSourceHealth[]): Promise<void>;

  // Pipeline Runs
  recordPipelineRun(run: RadarPipelineRunRecord): Promise<void>;
  getLatestPipelineRun(): Promise<RadarPipelineRunRecord | null>;

  // Latency Records
  recordLatency(record: RadarLatencyRecord): Promise<void>;

  // Distributed Concurrency Lock
  acquireLock(lockKey: string, ownerId: string, ttlMs: number): Promise<boolean>;
  releaseLock(lockKey: string, ownerId: string): Promise<void>;
}

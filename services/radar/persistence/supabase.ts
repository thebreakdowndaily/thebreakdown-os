/**
 * ─── Radar Supabase Persistence Repository ───────────────────────────────────
 *
 * Production PostgreSQL persistence repository for News Radar.
 * Maps to:
 *   - public.radar_content_fingerprints
 *   - public.radar_source_health
 *   - public.radar_pipeline_runs
 *   - public.radar_latency_records
 *   - public.radar_poll_locks
 */

import { createClient } from '@supabase/supabase-js';
import type {
  ContentFingerprint,
  RadarSourceHealth,
  RadarLatencyRecord,
  RadarPipelineRunRecord,
} from '../types';
import type { RadarPersistenceRepository } from './types';
import { mergeLatencyRecord } from '../latency-tracker';

export class SupabaseRadarRepository implements RadarPersistenceRepository {
  readonly kind = 'supabase' as const;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private client: any = null;

  constructor() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (url && key && url !== 'https://dummy.supabase.co') {
      this.client = createClient(url, key, {
        auth: { persistSession: false },
      });
    }
  }

  private ensureClient() {
    if (!this.client) {
      throw new Error(
        'Supabase client unavailable for Radar: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing. Fail closed.'
      );
    }
    return this.client;
  }

  async loadFingerprints(): Promise<Map<string, ContentFingerprint>> {
    const client = this.ensureClient();
    const { data, error } = await client
      .from('radar_content_fingerprints')
      .select('*');

    if (error) {
      throw new Error(`Failed to load radar fingerprints: ${error.message}`);
    }

    const map = new Map<string, ContentFingerprint>();
    for (const row of data || []) {
      const fp: ContentFingerprint = {
        sourceId: row.source_id,
        resourceUrl: row.resource_url,
        contentHash: row.content_hash,
        previousHash: row.previous_hash || undefined,
        firstSeenAt: row.first_seen_at,
        lastSeenAt: row.last_seen_at,
        lastChangedAt: row.last_changed_at || undefined,
        changeCount: row.change_count || 0,
      };
      map.set(`${fp.sourceId}::${fp.resourceUrl}`, fp);
    }
    return map;
  }

  async saveFingerprint(fp: ContentFingerprint): Promise<void> {
    await this.saveFingerprints([fp]);
  }

  async saveFingerprints(fps: ContentFingerprint[]): Promise<void> {
    if (fps.length === 0) return;
    const client = this.ensureClient();
    const rows = fps.map((fp) => ({
      source_id: fp.sourceId,
      resource_url: fp.resourceUrl,
      content_hash: fp.contentHash,
      previous_hash: fp.previousHash || null,
      first_seen_at: fp.firstSeenAt,
      last_seen_at: fp.lastSeenAt,
      last_changed_at: fp.lastChangedAt || null,
      change_count: fp.changeCount,
    }));

    const { error } = await client
      .from('radar_content_fingerprints')
      .upsert(rows, { onConflict: 'source_id,resource_url' });

    if (error) {
      throw new Error(`Failed to save radar fingerprints: ${error.message}`);
    }
  }

  async loadSourceHealth(): Promise<Map<string, RadarSourceHealth>> {
    const client = this.ensureClient();
    const { data, error } = await client
      .from('radar_source_health')
      .select('*');

    if (error) {
      throw new Error(`Failed to load radar source health: ${error.message}`);
    }

    const map = new Map<string, RadarSourceHealth>();
    for (const row of data || []) {
      const h: RadarSourceHealth = {
        sourceId: row.source_id,
        lastCheckedAt: row.last_checked_at || undefined,
        lastSuccessAt: row.last_success_at || undefined,
        lastFailureAt: row.last_failure_at || undefined,
        lastChangedAt: row.last_changed_at || undefined,
        lastHttpStatus: row.last_http_status || undefined,
        lastError: row.last_error || undefined,
        consecutiveFailures: row.consecutive_failures || 0,
        totalFetches: row.total_fetches || 0,
        totalFailures: row.total_failures || 0,
        totalChanges: row.total_changes || 0,
        averageFetchMs: row.average_fetch_ms || 0,
        status: row.status,
        scheduleState: row.schedule_state,
        nextEligiblePollAt: row.next_eligible_poll_at || undefined,
        backoffMinutes: row.backoff_minutes || 0,
      };
      map.set(h.sourceId, h);
    }
    return map;
  }

  async saveSourceHealth(health: RadarSourceHealth): Promise<void> {
    await this.saveAllSourceHealth([health]);
  }

  async saveAllSourceHealth(healthList: RadarSourceHealth[]): Promise<void> {
    if (healthList.length === 0) return;
    const client = this.ensureClient();
    const rows = healthList.map((h) => ({
      source_id: h.sourceId,
      last_checked_at: h.lastCheckedAt || new Date().toISOString(),
      last_success_at: h.lastSuccessAt || null,
      last_failure_at: h.lastFailureAt || null,
      last_changed_at: h.lastChangedAt || null,
      last_http_status: h.lastHttpStatus || null,
      last_error: h.lastError || null,
      consecutive_failures: h.consecutiveFailures,
      total_fetches: h.totalFetches,
      total_failures: h.totalFailures,
      total_changes: h.totalChanges,
      average_fetch_ms: h.averageFetchMs,
      status: h.status,
      schedule_state: h.scheduleState || 'READY',
      next_eligible_poll_at: h.nextEligiblePollAt || new Date().toISOString(),
      backoff_minutes: h.backoffMinutes || 0,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await client
      .from('radar_source_health')
      .upsert(rows, { onConflict: 'source_id' });

    if (error) {
      throw new Error(`Failed to save radar source health: ${error.message}`);
    }
  }

  async recordPipelineRun(run: RadarPipelineRunRecord): Promise<void> {
    const client = this.ensureClient();
    const { error } = await client.from('radar_pipeline_runs').insert({
      id: run.id,
      generated_at: run.generatedAt,
      cycle_duration_ms: run.cycleDurationMs,
      sources_polled: run.sourcesPolled,
      sources_failed: run.failed,
      artifacts_collected: run.newArtifacts + run.changedArtifacts + run.unchanged,
      changes_detected: run.newArtifacts + run.changedArtifacts,
      events_extracted: run.eventsOrSignalsCreated,
      duplicates_detected: 0,
      status: run.status,
      error: run.error || null,
      sources_considered: run.sourcesConsidered,
      successful: run.successful,
      failed: run.failed,
      new_artifacts: run.newArtifacts,
      changed_artifacts: run.changedArtifacts,
      unchanged: run.unchanged,
      events_or_signals_created: run.eventsOrSignalsCreated,
      median_detection_latency_ms: run.medianDetectionLatencyMs || null,
      p90_detection_latency_ms: run.p90DetectionLatencyMs || null,
    });

    if (error) {
      throw new Error(`Failed to record radar pipeline run: ${error.message}`);
    }
  }

  async getLatestPipelineRun(): Promise<RadarPipelineRunRecord | null> {
    const client = this.ensureClient();
    const { data, error } = await client
      .from('radar_pipeline_runs')
      .select('*')
      .order('generated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to get latest radar pipeline run: ${error.message}`);
    }
    if (!data) return null;

    return {
      id: data.id,
      generatedAt: data.generated_at,
      cycleDurationMs: data.cycle_duration_ms,
      sourcesConsidered: data.sources_considered || data.sources_polled,
      sourcesPolled: data.sources_polled,
      successful: data.successful || 0,
      failed: data.failed || data.sources_failed,
      newArtifacts: data.new_artifacts || 0,
      changedArtifacts: data.changed_artifacts || data.changes_detected,
      unchanged: data.unchanged || 0,
      eventsOrSignalsCreated: data.events_or_signals_created || data.events_extracted,
      status: data.status || 'completed',
      error: data.error || undefined,
      medianDetectionLatencyMs: data.median_detection_latency_ms,
      p90DetectionLatencyMs: data.p90_detection_latency_ms,
    };
  }

  async getLatencyRecord(clusterId: string): Promise<RadarLatencyRecord | null> {
    const client = this.ensureClient();
    const { data, error } = await client
      .from('radar_latency_records')
      .select('*')
      .eq('cluster_id', clusterId)
      .maybeSingle();

    if (error || !data) return null;

    return {
      clusterId: data.cluster_id,
      sourcePublishedAt: data.source_published_at || undefined,
      firstSeenAt: data.first_seen_at,
      firstDetectedAt: data.first_detected_at,
      firstVerifiedAt: data.first_verified_at || undefined,
      publishedAt: data.published_at || undefined,
      detectionLatencyMs: data.detection_latency_ms !== null ? Number(data.detection_latency_ms) : undefined,
      verificationLatencyMs: data.verification_latency_ms !== null ? Number(data.verification_latency_ms) : undefined,
      publicationLatencyMs: data.publication_latency_ms !== null ? Number(data.publication_latency_ms) : undefined,
    };
  }

  async getLatencyRecords(): Promise<RadarLatencyRecord[]> {
    const client = this.ensureClient();
    const { data, error } = await client
      .from('radar_latency_records')
      .select('*')
      .order('first_detected_at', { ascending: false });

    if (error || !data) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.map((d: any) => ({
      clusterId: d.cluster_id,
      sourcePublishedAt: d.source_published_at || undefined,
      firstSeenAt: d.first_seen_at,
      firstDetectedAt: d.first_detected_at,
      firstVerifiedAt: d.first_verified_at || undefined,
      publishedAt: d.published_at || undefined,
      detectionLatencyMs: d.detection_latency_ms !== null ? Number(d.detection_latency_ms) : undefined,
      verificationLatencyMs: d.verification_latency_ms !== null ? Number(d.verification_latency_ms) : undefined,
      publicationLatencyMs: d.publication_latency_ms !== null ? Number(d.publication_latency_ms) : undefined,
    }));
  }

  async recordLatency(record: RadarLatencyRecord): Promise<void> {
    const client = this.ensureClient();
    const existing = await this.getLatencyRecord(record.clusterId);
    const merged = mergeLatencyRecord(existing, record);

    const { error } = await client.from('radar_latency_records').upsert({
      cluster_id: merged.clusterId,
      source_published_at: merged.sourcePublishedAt || null,
      first_seen_at: merged.firstSeenAt,
      first_detected_at: merged.firstDetectedAt,
      first_verified_at: merged.firstVerifiedAt || null,
      published_at: merged.publishedAt || null,
      detection_latency_ms: merged.detectionLatencyMs ?? null,
      verification_latency_ms: merged.verificationLatencyMs ?? null,
      publication_latency_ms: merged.publicationLatencyMs ?? null,
    }, { onConflict: 'cluster_id' });

    if (error) {
      throw new Error(`Failed to record radar latency: ${error.message}`);
    }
  }

  async acquireLock(lockKey: string, ownerId: string, ttlMs: number): Promise<boolean> {
    const client = this.ensureClient();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlMs).toISOString();

    // Clean up expired locks first
    await client
      .from('radar_poll_locks')
      .delete()
      .lt('expires_at', now.toISOString());

    // Try to insert new lock
    const { error } = await client
      .from('radar_poll_locks')
      .insert({
        lock_key: lockKey,
        owner_id: ownerId,
        acquired_at: now.toISOString(),
        expires_at: expiresAt,
      });

    return !error;
  }

  async releaseLock(lockKey: string, ownerId: string): Promise<void> {
    const client = this.ensureClient();
    await client
      .from('radar_poll_locks')
      .delete()
      .eq('lock_key', lockKey)
      .eq('owner_id', ownerId);
  }
}

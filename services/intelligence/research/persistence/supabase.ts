/**
 * ─── Research Intelligence — Supabase Repository ─────────────────────────────
 * Governing document: docs/research/RESEARCH_INTELLIGENCE_OPERATING_STANDARD.md
 *
 * Durable provider for production. Reuses the existing `newsroom.pipeline_metrics`
 * snapshot row convention with a DISTINCT fixed row id — no schema migration
 * required (Level A additive change to the frozen baseline). Merge-by-id keeps
 * multiple workers/instances from clobbering each other's writes, matching the
 * newsroom supabase provider's optimistic concurrency control.
 */

import { createClient } from '@supabase/supabase-js';
import type {
  ResearchPersistedState,
  ResearchStateRepository,
} from './state';

/** Distinct snapshot row for the Research Intelligence Engine. */
export const RESEARCH_SNAPSHOT_ROW_ID = '1f0a7b3e-c5d8-4a2e-9b6f-3d2c7e8a9b01';

function mergeStates(
  local: ResearchPersistedState,
  remote: ResearchPersistedState
): ResearchPersistedState {
  const mergeById = <T>(
    localArr: T[],
    remoteArr: T[],
    keyFn: (item: T) => string
  ): T[] => {
    const map = new Map<string, T>();
    for (const item of remoteArr) map.set(keyFn(item), item);
    for (const item of localArr) map.set(keyFn(item), item);
    return Array.from(map.values());
  };

  return {
    version: local.version,
    savedAt: new Date().toISOString(),
    projects: mergeById(local.projects, remote.projects, (i) => i.id),
    queries: mergeById(local.queries, remote.queries, (i) => i.id),
    sources: mergeById(local.sources, remote.sources, (i) => i.id),
    documents: mergeById(local.documents, remote.documents, (i) => i.id),
    claims: mergeById(local.claims, remote.claims, (i) => i.id),
    evidence: mergeById(local.evidence, remote.evidence, (i) => i.id),
    events: mergeById(local.events, remote.events, (i) => i.id),
    questions: mergeById(local.questions, remote.questions, (i) => i.id),
    contradictions: mergeById(local.contradictions, remote.contradictions, (i) => i.id),
    gaps: mergeById(local.gaps, remote.gaps, (i) => i.id),
    socialSignals: mergeById(local.socialSignals, remote.socialSignals, (i) => i.id),
    clusters: mergeById(local.clusters, remote.clusters, (i) => i.id),
    runs: mergeById(local.runs, remote.runs, (i) => i.id),
    changeEvents: mergeById(local.changeEvents, remote.changeEvents, (i) => i.id),
    storyBriefs: mergeById(local.storyBriefs, remote.storyBriefs, (i) => i.id),
  };
}

export class ResearchSupabaseStateRepository implements ResearchStateRepository {
  readonly kind = 'supabase' as const;

  private client: any = null;
  private cachedState: ResearchPersistedState | null = null;
  private lastLoadedVersion = 0;

  constructor() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (url && key && url !== 'https://dummy.supabase.co') {
      this.client = createClient(url, key, {
        auth: { persistSession: false },
        db: { schema: 'newsroom' },
      });
    }
  }

  async load(): Promise<ResearchPersistedState | null> {
    if (this.cachedState) return this.cachedState;
    if (!this.client) return null;

    try {
      const { data, error } = await this.client
        .from('pipeline_metrics')
        .select('metric_value, metadata')
        .eq('id', RESEARCH_SNAPSHOT_ROW_ID)
        .maybeSingle();

      if (error) {
        console.error('[ResearchSupabaseStateRepository] Load error:', error);
        throw new Error(`Research state load failed: ${error.message}`);
      }

      if (data && data.metadata) {
        this.lastLoadedVersion = Number(data.metric_value) || 0;
        this.cachedState = data.metadata as ResearchPersistedState;
        return this.cachedState;
      }
    } catch (err) {
      console.error('[ResearchSupabaseStateRepository] Load exception:', err);
      throw err;
    }

    return null;
  }

  async save(state: ResearchPersistedState): Promise<void> {
    this.cachedState = state;
    if (!this.client) return;

    let retries = 3;
    while (retries > 0) {
      try {
        const { data: remoteRow, error: fetchErr } = await this.client
          .from('pipeline_metrics')
          .select('metric_value, metadata')
          .eq('id', RESEARCH_SNAPSHOT_ROW_ID)
          .maybeSingle();

        if (fetchErr) {
          console.error('[ResearchSupabaseStateRepository] Fetch remote version error:', fetchErr);
          throw new Error(`Research state write failed: ${fetchErr.message}`);
        }

        const remoteVersion = remoteRow ? Number(remoteRow.metric_value) || 0 : 0;
        const remoteState = remoteRow?.metadata as ResearchPersistedState | null;

        let stateToSave = state;
        if (remoteState && remoteVersion > this.lastLoadedVersion) {
          stateToSave = mergeStates(state, remoteState);
        }

        const nextVersion = remoteVersion + 1;

        let resError: unknown;
        let resData: unknown;

        if (!remoteRow) {
          const { data, error } = await this.client
            .from('pipeline_metrics')
            .insert({
              id: RESEARCH_SNAPSHOT_ROW_ID,
              metric_name: 'state_snapshot',
              metric_value: nextVersion,
              metadata: stateToSave,
              recorded_at: new Date().toISOString(),
            })
            .select();
          resError = error;
          resData = data;
        } else {
          const { data, error } = await this.client
            .from('pipeline_metrics')
            .update({
              metric_value: nextVersion,
              metadata: stateToSave,
              recorded_at: new Date().toISOString(),
            })
            .eq('id', RESEARCH_SNAPSHOT_ROW_ID)
            .eq('metric_value', remoteVersion)
            .select();
          resError = error;
          resData = data;
        }

        if (!resError && resData && (resData as unknown[]).length > 0) {
          this.cachedState = stateToSave;
          this.lastLoadedVersion = nextVersion;
          return;
        }

        retries -= 1;
        if (retries === 0) {
          throw new Error('Database write concurrency limit exceeded');
        }
        await new Promise((r) => setTimeout(r, 50 + Math.random() * 150));
      } catch (err) {
        console.error('[ResearchSupabaseStateRepository] Save exception:', err);
        throw err;
      }
    }
  }
}

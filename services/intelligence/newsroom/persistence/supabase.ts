import { createClient } from '@supabase/supabase-js';
import {
  NewsroomPersistedState,
  NewsroomStateRepository,
} from './state';

export const SNAPSHOT_ROW_ID = '9e5c464c-b17b-402a-96e0-2646c2410a00';

function mergeStates(
  local: NewsroomPersistedState,
  remote: NewsroomPersistedState
): NewsroomPersistedState {
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
    observations: mergeById(local.observations, remote.observations, (i) => i.id),
    claims: mergeById(local.claims, remote.claims, (i) => i.id),
    clusters: mergeById(local.clusters, remote.clusters, (i) => i.id),
    signals: mergeById(local.signals, remote.signals, (i) => i.id),
    gaps: mergeById(local.gaps, remote.gaps, (i) => i.id),
    alerts: mergeById(local.alerts, remote.alerts, (i) => i.id),
    audit: mergeById(local.audit, remote.audit, (i) => i.id),
    beats: local.beats,
    recipients: local.recipients,
    authorization: local.authorization ?? remote.authorization,
    escalations: mergeById(
      local.escalations,
      remote.escalations,
      (e) => `${e.signalId}:${e.timestamp}:${e.newOwner}`
    ),
    fatigue: local.fatigue,
    sourceReputations: local.sourceReputations,
    engine: local.engine,
  };
}

export class SupabaseStateRepository implements NewsroomStateRepository {
  readonly kind = 'supabase' as const;

  private client: any = null;
  private cachedState: NewsroomPersistedState | null = null;
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

  async load(): Promise<NewsroomPersistedState | null> {
    if (this.cachedState) return this.cachedState;
    if (!this.client) {
      return null;
    }

    try {
      const { data, error } = await this.client
        .from('pipeline_metrics')
        .select('metric_value, metadata')
        .eq('id', SNAPSHOT_ROW_ID)
        .maybeSingle();

      if (error) {
        console.error('[SupabaseStateRepository] Load error:', error);
        throw new Error(`Supabase state load failed: ${error.message}`);
      }

      if (data && data.metadata) {
        this.lastLoadedVersion = Number(data.metric_value) || 0;
        this.cachedState = data.metadata as NewsroomPersistedState;
        return this.cachedState;
      }
    } catch (err) {
      console.error('[SupabaseStateRepository] Load exception:', err);
      throw err;
    }

    return null;
  }

  async save(state: NewsroomPersistedState): Promise<void> {
    this.cachedState = state;
    if (!this.client) {
      return;
    }

    let retries = 3;
    while (retries > 0) {
      try {
        const { data: remoteRow, error: fetchErr } = await this.client
          .from('pipeline_metrics')
          .select('metric_value, metadata')
          .eq('id', SNAPSHOT_ROW_ID)
          .maybeSingle();

        if (fetchErr) {
          console.error('[SupabaseStateRepository] Fetch remote version error:', fetchErr);
          throw new Error(`Supabase state write failed: ${fetchErr.message}`);
        }

        const remoteVersion = remoteRow ? Number(remoteRow.metric_value) || 0 : 0;
        const remoteState = remoteRow?.metadata as NewsroomPersistedState | null;

        let stateToSave = state;
        if (remoteState && remoteVersion > this.lastLoadedVersion) {
          stateToSave = mergeStates(state, remoteState);
        }

        const nextVersion = remoteVersion + 1;

        let resError;
        let resData;

        if (!remoteRow) {
          const { data, error } = await this.client
            .from('pipeline_metrics')
            .insert({
              id: SNAPSHOT_ROW_ID,
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
            .eq('id', SNAPSHOT_ROW_ID)
            .eq('metric_value', remoteVersion)
            .select();
          resError = error;
          resData = data;
        }

        if (!resError && resData && resData.length > 0) {
          this.cachedState = stateToSave;
          this.lastLoadedVersion = nextVersion;
          return;
        }

        retries--;
        if (retries === 0) {
          throw new Error('Database write concurrency limit exceeded');
        }
        await new Promise((r) => setTimeout(r, 50 + Math.random() * 150));
      } catch (err) {
        console.error('[SupabaseStateRepository] Save exception:', err);
        throw err;
      }
    }
  }
}

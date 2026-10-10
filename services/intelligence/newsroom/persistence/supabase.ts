import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  NewsroomPersistedState,
  NewsroomStateRepository,
  NewsroomPersistenceError,
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

  private client: SupabaseClient | any = null;
  private cachedState: NewsroomPersistedState | null = null;
  private lastLoadedVersion = 0;
  private _isDegradedReadOnly = false;

  get isDegradedReadOnly(): boolean {
    return this._isDegradedReadOnly;
  }

  constructor(options?: { client?: any; url?: string; key?: string }) {
    if (options?.client) {
      this.client = options.client;
      return;
    }

    const url = options?.url || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.STAGING_SUPABASE_URL || '';
    const key = options?.key || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.STAGING_SUPABASE_SERVICE_ROLE_KEY || '';

    if (url && key && url !== 'https://dummy.supabase.co') {
      try {
        this.client = createClient(url, key, {
          auth: { persistSession: false },
          db: { schema: 'newsroom' },
        });
      } catch (e) {
        console.warn('[SupabaseStateRepository] Client init warning:', e);
        this.client = null;
        this._isDegradedReadOnly = true;
      }
    } else {
      this._isDegradedReadOnly = true;
    }
  }

  async load(): Promise<NewsroomPersistedState | null> {
    if (this.cachedState) return this.cachedState;
    if (!this.client) {
      console.warn(
        '[SupabaseStateRepository] Supabase client unavailable: falling back to read-only degraded mode.'
      );
      this._isDegradedReadOnly = true;
      return null;
    }

    try {
      const { data, error } = await this.client
        .from('pipeline_metrics')
        .select('metric_value, metadata')
        .eq('id', SNAPSHOT_ROW_ID)
        .maybeSingle();

      if (error) {
        console.warn('[SupabaseStateRepository] Load failure, enabling read-only degraded mode:', error.message);
        this._isDegradedReadOnly = true;
        return null;
      }

      if (data && data.metadata) {
        this.lastLoadedVersion = Number(data.metric_value) || 0;
        this.cachedState = data.metadata as NewsroomPersistedState;
        this._isDegradedReadOnly = false;
        return this.cachedState;
      }

      // No row found: empty initial table state, but client is healthy
      this._isDegradedReadOnly = false;
      return null;
    } catch (err) {
      console.warn('[SupabaseStateRepository] Load exception, enabling read-only degraded mode:', err);
      this._isDegradedReadOnly = true;
      return null;
    }
  }

  async save(state: NewsroomPersistedState): Promise<void> {
    if (this._isDegradedReadOnly || !this.client) {
      throw new NewsroomPersistenceError(
        'Database persistence unavailable: Newsroom is in read-only degraded mode. Editorial mutations cannot be committed.',
        'PERSISTENCE_DEGRADED_READONLY'
      );
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
          throw new NewsroomPersistenceError(
            `Authoritative state fetch failed: ${fetchErr.message}`,
            'PERSISTENCE_FAILED'
          );
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

        if (resError) {
          throw new NewsroomPersistenceError(
            `Authoritative state write failed: ${resError.message}`,
            'PERSISTENCE_FAILED'
          );
        }

        if (resData && resData.length > 0) {
          // Authoritative write confirmed!
          this.cachedState = stateToSave;
          this.lastLoadedVersion = nextVersion;
          this._isDegradedReadOnly = false;
          return;
        }

        // Concurrency conflict (remote version changed between fetch and update)
        retries--;
        if (retries === 0) {
          throw new NewsroomPersistenceError(
            'Database write concurrency conflict: authoritative state version changed concurrently',
            'PERSISTENCE_CONFLICT'
          );
        }
        await new Promise((r) => setTimeout(r, 50 + Math.random() * 100));
      } catch (err: unknown) {
        if (err instanceof NewsroomPersistenceError) {
          if (err.code === 'PERSISTENCE_CONFLICT' && retries > 0) {
            retries--;
            await new Promise((r) => setTimeout(r, 50 + Math.random() * 100));
            continue;
          }
          throw err;
        }
        const msg = err instanceof Error ? err.message : String(err);
        throw new NewsroomPersistenceError(
          `Authoritative persistence exception: ${msg}`,
          'PERSISTENCE_FAILED'
        );
      }
    }

    throw new NewsroomPersistenceError(
      'Database write concurrency limit exceeded (OCC 409)',
      'PERSISTENCE_CONFLICT'
    );
  }
}

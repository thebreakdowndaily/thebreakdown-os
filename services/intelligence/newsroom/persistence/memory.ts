/**
 * ─── In-Process Memory Repository ─────────────────────────────────────────────
 *
 * Default provider for tests and unconfigured local development.
 * Retains a single snapshot in memory so the core behaves deterministically
 * without touching the filesystem. Not durable across restarts — production
 * must use the file provider (or a future supabase provider).
 */

import {
  NewsroomPersistedState,
  NewsroomStateRepository,
} from './state';

export class MemoryStateRepository implements NewsroomStateRepository {
  readonly kind = 'memory' as const;

  private latest: NewsroomPersistedState | null = null;

  load(): NewsroomPersistedState | null {
    return this.latest ? JSON.parse(JSON.stringify(this.latest)) : null;
  }

  save(state: NewsroomPersistedState): void {
    this.latest = JSON.parse(JSON.stringify(state));
  }
}

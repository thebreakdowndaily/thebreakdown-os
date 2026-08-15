/**
 * ─── Atomic File Repository ───────────────────────────────────────────────────
 *
 * Durable, restart-safe persistence provider for the Newsroom Intelligence OS.
 * Authoritative state is written as a versioned JSON snapshot using an
 * atomic write sequence (temp file + rename) so a crash mid-write can never
 * corrupt the last committed snapshot. On bootstrap the latest snapshot is
 * reloaded, satisfying the Operating Standard §21 recovery invariant:
 * worker restarts yield zero state loss.
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  NEWSROOM_STATE_VERSION,
  NewsroomPersistedState,
  NewsroomStateRepository,
} from './state';

export const DEFAULT_NEWSROOM_STATE_FILE = path.join(
  process.cwd(),
  'data',
  'newsroom',
  'state.json'
);

export class FileStateRepository implements NewsroomStateRepository {
  readonly kind = 'file' as const;

  private readonly filePath: string;

  constructor(filePath?: string) {
    this.filePath = filePath || DEFAULT_NEWSROOM_STATE_FILE;
  }

  get path(): string {
    return this.filePath;
  }

  load(): NewsroomPersistedState | null {
    if (!fs.existsSync(this.filePath)) return null;
    try {
      const raw = fs.readFileSync(this.filePath, 'utf8');
      const parsed = JSON.parse(raw) as NewsroomPersistedState;
      if (!parsed || parsed.version !== NEWSROOM_STATE_VERSION) return null;
      return parsed;
    } catch {
      // Corrupt or unreadable snapshot: treat as no state rather than crashing boot.
      return null;
    }
  }

  save(state: NewsroomPersistedState): void {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const tmpPath = `${this.filePath}.tmp`;
    fs.writeFileSync(tmpPath, JSON.stringify(state, null, 2), 'utf8');
    fs.renameSync(tmpPath, this.filePath);
  }
}

/**
 * ─── Research Intelligence — Atomic File Repository ──────────────────────────
 * Governing document: docs/research/RESEARCH_INTELLIGENCE_OPERATING_STANDARD.md
 *
 * Durable, restart-safe persistence provider. Authoritative state is written as
 * a versioned JSON snapshot using an atomic write sequence (temp file + rename)
 * so a crash mid-write can never corrupt the last committed snapshot — the same
 * recovery invariant the newsroom file provider upholds.
 */

import * as fs from 'fs';
import * as path from 'path';
import type {
  ResearchPersistedState,
  ResearchStateRepository,
} from './state';
import { RESEARCH_STATE_VERSION } from './state';

export const DEFAULT_RESEARCH_STATE_FILE = path.join(
  process.cwd(),
  'data',
  'research',
  'state.json'
);

export class ResearchFileStateRepository implements ResearchStateRepository {
  readonly kind = 'file' as const;

  private readonly filePath: string;

  constructor(filePath?: string) {
    this.filePath = filePath || DEFAULT_RESEARCH_STATE_FILE;
  }

  get path(): string {
    return this.filePath;
  }

  load(): ResearchPersistedState | null {
    if (!fs.existsSync(this.filePath)) return null;
    try {
      const raw = fs.readFileSync(this.filePath, 'utf8');
      const parsed = JSON.parse(raw) as ResearchPersistedState;
      if (!parsed || parsed.version !== RESEARCH_STATE_VERSION) return null;
      return parsed;
    } catch {
      // Corrupt or unreadable snapshot: treat as no state rather than crashing boot.
      return null;
    }
  }

  save(state: ResearchPersistedState): void {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const tmpPath = `${this.filePath}.tmp`;
    fs.writeFileSync(tmpPath, JSON.stringify(state, null, 2), 'utf8');
    fs.renameSync(tmpPath, this.filePath);
  }
}

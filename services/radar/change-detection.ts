/**
 * ─── Radar Change Detection Engine ───────────────────────────────────────────
 *
 * Governing document: AGENTS.md (Verification & Idempotency)
 *
 * Tracks content fingerprints across polling cycles and persists them across
 * worker restarts.
 */

import { createHash } from 'node:crypto';
import type { RawArtifact, ContentFingerprint, ChangeDetectionResult } from './types';
import type { RadarPersistenceRepository } from './persistence/types';

export function computeContentHash(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}

export class ChangeDetectionEngine {
  private fingerprints: Map<string, ContentFingerprint> = new Map();
  private dirtyKeys: Set<string> = new Set();

  constructor(private readonly repository?: RadarPersistenceRepository) {}

  /**
   * Loads persisted fingerprints from the repository into memory.
   */
  async load(): Promise<void> {
    if (this.repository) {
      const persisted = await this.repository.loadFingerprints();
      for (const [k, v] of persisted.entries()) {
        this.fingerprints.set(k, v);
      }
    }
  }

  /**
   * Generates a unique key for a source + URL combination
   */
  private getFingerprintKey(sourceId: string, url: string): string {
    return `${sourceId}::${url}`;
  }

  /**
   * Detects changes in an artifact compared to existing fingerprints.
   */
  detect(artifact: RawArtifact): ChangeDetectionResult {
    const key = this.getFingerprintKey(artifact.sourceId, artifact.url);
    const existing = this.fingerprints.get(key);
    const now = new Date().toISOString();

    if (!existing) {
      // New fingerprint
      const newFingerprint: ContentFingerprint = {
        sourceId: artifact.sourceId,
        resourceUrl: artifact.url,
        contentHash: artifact.contentHash,
        firstSeenAt: now,
        lastSeenAt: now,
        lastChangedAt: now,
        changeCount: 0,
      };

      this.fingerprints.set(key, newFingerprint);
      this.dirtyKeys.add(key);

      return {
        artifact,
        changeType: 'new',
        detectedAt: now,
      };
    }

    if (existing.contentHash === artifact.contentHash) {
      // Unchanged
      existing.lastSeenAt = now;
      this.dirtyKeys.add(key);

      return {
        artifact,
        changeType: 'unchanged',
        previousHash: existing.contentHash,
        detectedAt: now,
      };
    }

    // Changed
    const previousHash = existing.contentHash;
    existing.previousHash = previousHash;
    existing.contentHash = artifact.contentHash;
    existing.lastSeenAt = now;
    existing.lastChangedAt = now;
    existing.changeCount += 1;
    this.dirtyKeys.add(key);

    return {
      artifact,
      changeType: 'changed',
      previousHash,
      detectedAt: now,
    };
  }

  /**
   * Flushes all modified fingerprints to persistent storage.
   */
  async flush(): Promise<void> {
    if (this.repository && this.dirtyKeys.size > 0) {
      const dirtyFps: ContentFingerprint[] = [];
      for (const key of this.dirtyKeys) {
        const fp = this.fingerprints.get(key);
        if (fp) dirtyFps.push(fp);
      }
      await this.repository.saveFingerprints(dirtyFps);
      this.dirtyKeys.clear();
    }
  }

  /**
   * Gets all tracked fingerprints
   */
  getFingerprints(): ContentFingerprint[] {
    return Array.from(this.fingerprints.values());
  }

  /**
   * Gets fingerprints that haven't been seen in a while
   */
  getStaleFingerprints(olderThanMs: number): ContentFingerprint[] {
    const threshold = Date.now() - olderThanMs;
    return this.getFingerprints().filter((f) => new Date(f.lastSeenAt).getTime() < threshold);
  }

  /**
   * Serializes the current fingerprint state to a JSON string
   */
  save(): string {
    const entries = Array.from(this.fingerprints.entries());
    return JSON.stringify(entries);
  }

  /**
   * Restores fingerprint state from a JSON string
   */
  restore(data: string): void {
    try {
      const entries = JSON.parse(data);
      for (const [key, fp] of entries) {
        this.fingerprints.set(key, fp as ContentFingerprint);
      }
    } catch (e) {
      throw new Error(`Failed to restore change detection engine state: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  /**
   * Clears all fingerprints
   */
  clear(): void {
    this.fingerprints.clear();
    this.dirtyKeys.clear();
  }
}

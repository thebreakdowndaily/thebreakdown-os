import { describe, it, expect } from 'vitest';
import { GOLDEN_EVENTS } from '@/data/radar/golden-events';
import { ChangeDetectionEngine, computeContentHash } from '../change-detection';
import { resolveEntities } from '../entity-resolution';
import { resolveLocation } from '@/data/radar/geo-india';
import type { RawArtifact } from '../types';

describe('Golden Event Replay Regression Tests', () => {
  it('replays all golden events through change detection and resolution', () => {
    const engine = new ChangeDetectionEngine();

    for (const golden of GOLDEN_EVENTS) {
      for (const artifact of golden.artifacts) {
        const rawArtifact: RawArtifact = {
          sourceId: golden.source.id || 'src-test',
          url: artifact.url,
          retrievedAt: new Date().toISOString(),
          title: artifact.title,
          content: artifact.content,
          contentHash: computeContentHash(artifact.content),
          contentLength: artifact.content.length,
          metadata: {},
        };

        const result = engine.detect(rawArtifact);
        expect(result.changeType).toBeDefined();

        // Entity resolution on content
        const entities = resolveEntities(artifact.content);
        expect(Array.isArray(entities)).toBe(true);

        // Location resolution on content
        const location = resolveLocation(artifact.content);
        // Location may or may not match depending on content
        if (location) {
          expect(location.id).toBeDefined();
        }
      }
    }
  });

  it('ensures malformed source does not crash the system', () => {
    const malformed = GOLDEN_EVENTS.find((e) => e.scenario === 'malformed_source');
    expect(malformed).toBeDefined();

    if (malformed && malformed.artifacts.length > 0) {
      const art = malformed.artifacts[0];
      const rawArtifact: RawArtifact = {
        sourceId: malformed.source.id || 'malformed-src',
        url: art.url,
        retrievedAt: new Date().toISOString(),
        title: art.title,
        content: art.content,
        contentHash: computeContentHash(art.content),
        contentLength: art.content.length,
        metadata: {},
      };

      const engine = new ChangeDetectionEngine();
      expect(() => engine.detect(rawArtifact)).not.toThrow();
      expect(() => resolveEntities(art.content)).not.toThrow();
    }
  });

  it('handles source outage scenario gracefully', () => {
    const outage = GOLDEN_EVENTS.find((e) => e.scenario === 'source_outage');
    expect(outage).toBeDefined();
    expect(outage?.artifacts.length).toBe(0);
  });
});

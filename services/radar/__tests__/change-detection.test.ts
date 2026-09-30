import { describe, it, expect, beforeEach } from 'vitest';
import { ChangeDetectionEngine, computeContentHash } from '../change-detection';
import type { RawArtifact } from '../types';

describe('ChangeDetectionEngine', () => {
  let engine: ChangeDetectionEngine;

  beforeEach(() => {
    engine = new ChangeDetectionEngine();
  });

  const createArtifact = (url: string, content: string): RawArtifact => ({
    sourceId: 'src_1',
    url,
    retrievedAt: new Date().toISOString(),
    content,
    contentHash: computeContentHash(content),
    contentLength: content.length,
    metadata: {},
  });

  it('detects a new artifact', () => {
    const artifact = createArtifact('https://example.com/1', 'content 1');
    const result = engine.detect(artifact);

    expect(result.changeType).toBe('new');
    expect(result.artifact.contentHash).toBe(computeContentHash('content 1'));
  });

  it('detects unchanged artifact', () => {
    const artifact = createArtifact('https://example.com/2', 'content 2');
    engine.detect(artifact);

    const result2 = engine.detect(artifact);
    expect(result2.changeType).toBe('unchanged');
  });

  it('detects changed artifact and increments change count', () => {
    const artifact1 = createArtifact('https://example.com/3', 'content 3');
    engine.detect(artifact1);

    const artifact2 = createArtifact('https://example.com/3', 'content 3 changed');
    const result = engine.detect(artifact2);

    expect(result.changeType).toBe('changed');
    expect(result.previousHash).toBe(computeContentHash('content 3'));

    const fingerprints = engine.getFingerprints();
    const fp = fingerprints.find((f) => f.resourceUrl === 'https://example.com/3');
    expect(fp?.changeCount).toBe(1);
  });

  it('supports fingerprint persistence (save/restore roundtrip)', () => {
    const artifact = createArtifact('https://example.com/4', 'content 4');
    engine.detect(artifact);

    const saved = engine.save();

    const newEngine = new ChangeDetectionEngine();
    newEngine.restore(saved);

    const result = newEngine.detect(artifact);
    expect(result.changeType).toBe('unchanged');
  });

  it('detects stale fingerprints correctly', () => {
    const artifact = createArtifact('https://example.com/5', 'content 5');
    engine.detect(artifact);

    const fingerprints = engine.getFingerprints();
    expect(fingerprints.length).toBe(1);

    // Stale check with future threshold should find it stale
    const stale = engine.getStaleFingerprints(-1000);
    expect(stale.length).toBe(1);

    // Stale check with past threshold (1 hour ago) should find nothing stale
    const notStale = engine.getStaleFingerprints(3600_000);
    expect(notStale.length).toBe(0);
  });

  it('handles empty content edge case safely', () => {
    const artifact = createArtifact('https://example.com/6', '');
    const result = engine.detect(artifact);

    expect(result.changeType).toBe('new');
    expect(result.artifact.contentHash).toBe(computeContentHash(''));
  });

  it('handles Unicode/NFKC consistently', () => {
    const text1 = 'cafe\u0301'; // 'e' + combining acute accent
    const text2 = 'caf\u00E9'; // 'é' single character

    const normalized1 = text1.normalize('NFKC');
    const normalized2 = text2.normalize('NFKC');
    expect(normalized1).toBe(normalized2);

    const artifact = createArtifact('https://example.com/7', normalized1);
    const result = engine.detect(artifact);
    expect(result.changeType).toBe('new');
  });
});

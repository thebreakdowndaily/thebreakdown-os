import { describe, it, expect } from 'vitest';
import { ChapterFactory } from '../lib/editorial/chapter-factory';
import { VolumeRegistryService, VOLUME_1_CHAPTERS } from '../lib/editorial/volume-1-chapters';
import { CHAPTER_1_PACKAGE } from '../lib/editorial/chapter-1-data';

describe('TEST-CHAPTER-FACTORY: Chapter Production Factory (Phase 15C)', () => {
  it('TEST-CF-01: Validates Claim Attestation Trees', () => {
    const validResult = ChapterFactory.validateAttestationTree(CHAPTER_1_PACKAGE.claims, CHAPTER_1_PACKAGE.sources);
    expect(validResult.valid).toBe(true);
    expect(validResult.errors.length).toBe(0);

    // Broken claim without sourceUrl/source
    const brokenClaims = [
      { id: 'claim-broken-1', claim: 'Unattested claim', data: '', source: '', sourceUrl: '', tier: 1, confidence: 0.8, status: 'unverified' as const }
    ];
    const invalidResult = ChapterFactory.validateAttestationTree(brokenClaims, CHAPTER_1_PACKAGE.sources);
    expect(invalidResult.valid).toBe(false);
    expect(invalidResult.errors.length).toBeGreaterThan(0);
  });

  it('TEST-CF-02: Calculates Evidence Health Score', () => {
    const score = ChapterFactory.computeEvidenceScore(CHAPTER_1_PACKAGE.claims, CHAPTER_1_PACKAGE.sources);
    expect(score).toBeGreaterThan(80);
    expect(score).toBeLessThanOrEqual(100);

    const emptyScore = ChapterFactory.computeEvidenceScore([], []);
    expect(emptyScore).toBe(0);
  });

  it('TEST-CF-03: Resolves Multi-Chapter Registry (Volume I)', () => {
    const published = VolumeRegistryService.getPublishedChapters();
    expect(published.length).toBe(5);
    
    const slugs = published.map((c) => c.slug);
    expect(slugs).toContain('foundations-of-strategic-autonomy-1947-1962');
    expect(slugs).toContain('integration-of-princely-states-1947-1950');
    expect(slugs).toContain('kashmir-1947-1948-un-referral');
    expect(slugs).toContain('panchsheel-bandung-conference-1954-1955');
    expect(slugs).toContain('1962-sino-indian-war-strategic-lessons');
  });

  it('TEST-CF-04: Rejects Duplicate Slugs and Invalid Lookups', () => {
    const slugSet = new Set<string>();
    for (const c of VOLUME_1_CHAPTERS) {
      expect(slugSet.has(c.slug)).toBe(false);
      slugSet.add(c.slug);
    }

    const missing = VolumeRegistryService.getChapterBySlug('non-existent-slug-xyz');
    expect(missing).toBeNull();
  });

  it('TEST-CF-05: Enforces Publication Lifecycle Guards', () => {
    const ch1 = VolumeRegistryService.getChapterBySlug('foundations-of-strategic-autonomy-1947-1962');
    expect(ch1).not.toBeNull();
    expect(ch1?.status).toBe('published');
  });
});

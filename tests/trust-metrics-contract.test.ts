import { describe, expect, it } from 'vitest';
import type { CanonicalClaim, CanonicalSource, Chapter } from '../types/canonical';
import { getChapterEvidenceCounts } from '../lib/knowledge/trust-metrics';
import { isChapterPubliclyPublished } from '../lib/knowledge/chapter-publication';
import { getKnowledgeLibrarySeedData } from '../utils/data-layer/knowledge-library-data';
import { getKnowledgeCore } from '../lib/knowledge/knowledge-core';

function makeClaim(overrides: Partial<CanonicalClaim> = {}): CanonicalClaim {
  return {
    id: 'claim-1',
    statement: 'A claim',
    confidence: 'established',
    evidence: [],
    counterArguments: [],
    sourceIds: [],
    documentIds: [],
    entityIds: [],
    conceptIds: [],
    appearsIn: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function makeSource(overrides: Partial<CanonicalSource> = {}): CanonicalSource {
  return {
    id: 'source-1',
    title: 'Source',
    tier: 1,
    accessedAt: '2026-01-01',
    claimIds: [],
    documentIds: [],
    chapterIds: [],
    thinkerIds: [],
    storyIds: [],
    datasetIds: [],
    ...overrides,
  };
}

function findById(value: unknown, targetId: string): Record<string, unknown> | undefined {
  if (!value || typeof value !== 'object') return undefined;
  if (!Array.isArray(value)) {
    const record = value as Record<string, unknown>;
    if (record.id === targetId) return record;
    for (const nested of Object.values(record)) {
      const found = findById(nested, targetId);
      if (found) return found;
    }
  } else {
    for (const nested of value) {
      const found = findById(nested, targetId);
      if (found) return found;
    }
  }
  return undefined;
}

function collectSourceIds(value: unknown, result = new Set<string>()): Set<string> {
  if (typeof value === 'string' && /^s\\d+$/.test(value)) result.add(value);
  else if (Array.isArray(value)) value.forEach((nested) => collectSourceIds(nested, result));
  else if (value && typeof value === 'object') {
    Object.values(value as Record<string, unknown>).forEach((nested) => collectSourceIds(nested, result));
  }
  return result;
}

describe('trust metrics data lineage', () => {
  it('keeps founding chapter source metadata aligned with unique source IDs cited in content', () => {
    const library = getKnowledgeLibrarySeedData();
    const chapter = findById(library, 'kl-ch-1');
    expect(chapter).toBeDefined();
    const content = chapter?.content;
    const uniqueCitedSourceIds = collectSourceIds(content);
    const metadata = chapter?.metadata as { sourceCount?: number } | undefined;
    const registrySources = getKnowledgeCore().sources.all();
    const registryIds = new Set(registrySources.map((source) => source.id));
    const missingCitedSources = [...uniqueCitedSourceIds].filter((id) => !registryIds.has(id));
    const chapterLinkedSources = registrySources.filter((source) => source.chapterIds?.includes('kl-ch-1'));

    expect(uniqueCitedSourceIds.size).toBe(34);
    expect(metadata?.sourceCount).toBe(chapterLinkedSources.length);
    expect(missingCitedSources).toEqual([]);
    expect(registryIds.has('s32')).toBe(true);
    expect(registryIds.has('s33')).toBe(true);
    expect(registryIds.has('s34')).toBe(true);
    expect(registrySources.find((source) => source.id === 's31')?.url).toBe('https://eprints.soton.ac.uk/40935/');
    // s30 is additionally linked through a canonical claim's evidence even
    // though it is not a direct block citation, so registry relationships can
    // legitimately exceed the unique direct-citation count by one.
    expect(chapterLinkedSources.some((source) => source.id === 's30')).toBe(true);
    expect(chapterLinkedSources.some((source) => source.id === 's32')).toBe(true);
    expect(chapterLinkedSources.some((source) => source.id === 's33')).toBe(true);
    expect(chapterLinkedSources.some((source) => source.id === 's34')).toBe(true);
    expect(chapterLinkedSources.length).toBe(36);
    const verifiedPlaceholderSources = registrySources.filter(
      (source) => source.url.includes('example.com') && source.verificationStatus === 'verified',
    );
    expect(verifiedPlaceholderSources).toEqual([]);
    const placeholderUrls = registrySources.filter((source) => source.url.includes('example.com'));
    expect(placeholderUrls).toEqual([]);
    const verifiedSourceIds = [
      's1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10', 's11', 's12', 's13', 's14', 's15', 's19',
      's21', 's28', 's29', 's30', 's31', 's32', 's33', 's34', 's35', 's36', 's65',
    ];
    for (const id of verifiedSourceIds) {
      const source = registrySources.find((item) => item.id === id);
      expect(source?.verificationStatus).toBe('verified');
      expect(source?.url).not.toContain('example.com');
      expect(source?.lastVerifiedAt).toBe('2026-10-16');
    }
    expect(chapterLinkedSources.every((source) =>
      source.verificationStatus === 'verified' || source.verificationStatus === 'unverified',
    )).toBe(true);
    const pendingEditorialReviewIds = [
      's16', 's17', 's18', 's19', 's20', 's22', 's23', 's24', 's25', 's26', 's27',
    ];
    for (const id of pendingEditorialReviewIds) {
      const source = registrySources.find((item) => item.id === id);
      expect(source?.verificationStatus).toBe('unverified');
      expect(source?.lastVerifiedAt).toBeUndefined();
      expect(source?.url).toBeTruthy();
    }
  });


  it('counts only claims explicitly associated with the target chapter', () => {
    const claims = [
      makeClaim({
        id: 'direct',
        appearsIn: [{ contentType: 'chapter', contentId: 'kl-ch-1', contentTitle: 'Founding chapter' }],
      }),
      makeClaim({
        id: 'another-chapter',
        appearsIn: [{ contentType: 'chapter', contentId: 'kl-ch-2', contentTitle: 'Another chapter' }],
      }),
      makeClaim({
        id: 'same-slug-but-story',
        appearsIn: [{ contentType: 'story', contentId: 'indias-inheritance', contentTitle: 'Story' }],
      }),
      makeClaim({ id: 'unlinked-prefix', statement: 'Claim with no explicit association' }),
    ];

    expect(getChapterEvidenceCounts('kl-ch-1', claims, [])).toEqual({ claims: 1, sources: 0 });
  });

  it('counts only sources whose canonical chapterIds include the target chapter', () => {
    const sources = [
      makeSource({ id: 'direct', chapterIds: ['kl-ch-1'] }),
      makeSource({ id: 'other', chapterIds: ['kl-ch-2'] }),
      makeSource({ id: 'unlinked', chapterIds: [] }),
    ];

    expect(getChapterEvidenceCounts('kl-ch-1', [], sources)).toEqual({ claims: 0, sources: 1 });
  });

  it('uses the same established visibility rule as chapter routes', () => {
    const verifiedChapter = {
      status: 'verified',
      createdAt: '2026-01-01T00:00:00.000Z',
    } as Chapter;
    const draftChapter = {
      status: 'draft',
      createdAt: '2026-01-01T00:00:00.000Z',
    } as Chapter;

    expect(isChapterPubliclyPublished(verifiedChapter, new Date('2026-10-15T00:00:00.000Z'))).toBe(true);
    expect(isChapterPubliclyPublished(draftChapter, new Date('2026-10-15T00:00:00.000Z'))).toBe(false);
  });

  it('requires a past explicit publication date for verified chapters', () => {
    const base = {
      status: 'verified',
      publicationStatus: 'published',
    } as unknown as Chapter;

    expect(isChapterPubliclyPublished({
      ...base,
      publishedAt: '2026-10-14T00:00:00.000Z',
    }, new Date('2026-10-15T00:00:00.000Z'))).toBe(true);

    expect(isChapterPubliclyPublished({
      ...base,
      publishedAt: '2026-10-16T00:00:00.000Z',
    }, new Date('2026-10-15T00:00:00.000Z'))).toBe(false);

    expect(isChapterPubliclyPublished({
      ...base,
      publishedAt: 'not-a-date',
    }, new Date('2026-10-15T00:00:00.000Z'))).toBe(false);
  });

  it('excludes quarantined verified chapters even with an otherwise valid public state', () => {
    const chapter = {
      status: 'verified',
      publicationStatus: 'published',
      publishedAt: '2026-10-14T00:00:00.000Z',
      isTestArtifact: true,
    } as unknown as Chapter;

    expect(isChapterPubliclyPublished(chapter, new Date('2026-10-15T00:00:00.000Z'))).toBe(false);
  });

  it('counts an explicitly published chapter without synthesizing a minimum elsewhere', () => {
    const chapter = {
      status: 'published',
      createdAt: '2026-01-01T00:00:00.000Z',
    } as Chapter;

    expect(isChapterPubliclyPublished(chapter, new Date('2026-10-15T00:00:00.000Z'))).toBe(true);
  });
});

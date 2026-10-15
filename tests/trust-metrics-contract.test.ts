import { describe, expect, it } from 'vitest';
import type { CanonicalClaim, CanonicalSource, Chapter } from '../types/canonical';
import { getChapterEvidenceCounts } from '../lib/knowledge/trust-metrics';
import { isChapterPubliclyPublished } from '../lib/knowledge/chapter-publication';

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

describe('trust metrics data lineage', () => {
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

import { describe, it, expect } from 'vitest';
import { PublicPublicationService } from '../services/public/public-publication.service';
import { CHAPTER_1_FIX } from '../lib/editorial/chapter-1-data';

describe('TEST-PUBLIC-PLATFORM: Public Knowledge Platform (Phase 17A)', () => {
  it('TEST-PUB-01: Enforces Public-Only Status Guard on Chapters', () => {
    const chapters = PublicPublicationService.getPublicChapters();
    expect(chapters.length).toBeGreaterThan(0);

    for (const c of chapters) {
      expect(c.status).toBe('published');
    }
  });

  it('TEST-PUB-02: Rejects Draft/Unpublished Lookups by Slug', () => {
    const pubCh = PublicPublicationService.getPublicChapterBySlug('foundations-of-strategic-autonomy-1947-1962');
    expect(pubCh).not.toBeNull();
    expect(pubCh?.status).toBe('published');

    const invalid = PublicPublicationService.getPublicChapterBySlug('non-existent-unpublished-slug');
    expect(invalid).toBeNull();
  });

  it('TEST-PUB-03: Excludes Non-Published Fixes from Public Search Results', () => {
    const draftFix = { ...CHAPTER_1_FIX, id: 'fix-draft-secret', publicationStatus: 'draft' as const };
    const fixes = [CHAPTER_1_FIX, draftFix];

    const searchRes = PublicPublicationService.searchPublicKnowledge(fixes, 'Defense');
    const returnedIds = searchRes.hits.map((h) => h.item.id);

    expect(returnedIds).toContain('fix-strategic-autonomy-recalibration');
    expect(returnedIds).not.toContain('fix-draft-secret');
  });

  it('TEST-PUB-04: Non-Mutation Guarantee on Public Queries', () => {
    const originalJson = JSON.stringify(CHAPTER_1_FIX);
    PublicPublicationService.getPublicChapters();
    PublicPublicationService.searchPublicKnowledge([CHAPTER_1_FIX], 'Defense');

    expect(JSON.stringify(CHAPTER_1_FIX)).toBe(originalJson);
  });
});

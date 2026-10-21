import { describe, expect, it } from 'vitest';
import { countChapterOneClaims, countChapterOneSources } from '@/lib/knowledge/trust-metrics';

describe('trust dashboard chapter metrics', () => {
  it('counts claims only when their appearance references the founding chapter ID', () => {
    const claims = [
      { appearsIn: [{ contentType: 'chapter' as const, contentId: 'kl-ch-1', contentTitle: 'Founding chapter' }] },
      { appearsIn: [{ contentType: 'chapter' as const, contentId: 'another-chapter', contentTitle: 'Another chapter' }] },
      { appearsIn: [{ contentType: 'story' as const, contentId: 'story-1', contentTitle: 'Related story' }] },
      { appearsIn: [] },
    ];

    expect(countChapterOneClaims(claims)).toBe(1);
  });

  it('returns zero when no claim is explicitly associated with the founding chapter', () => {
    expect(countChapterOneClaims([
      { appearsIn: [{ contentType: 'chapter' as const, contentId: 'chapter-2', contentTitle: 'Chapter 2' }] },
    ])).toBe(0);
  });

  it('counts only sources whose chapterIds include the founding chapter ID', () => {
    const sources = [
      { chapterIds: ['kl-ch-1'] },
      { chapterIds: ['chapter-2'] },
      { chapterIds: ['chapter-1', 'chapter-2'] },
      { chapterIds: [] },
    ];

    expect(countChapterOneSources(sources)).toBe(1);
  });

  it('returns zero when the registry has no founding-chapter source associations', () => {
    expect(countChapterOneSources([{ chapterIds: ['chapter-2'] }, { chapterIds: [] }])).toBe(0);
  });
});

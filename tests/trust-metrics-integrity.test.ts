import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getServiceClient } from '@/supabase/client';
import {
  countChapterOneClaims,
  countChapterOneSources,
  getCanonicalCorrectionCount,
} from '@/lib/knowledge/trust-metrics';

vi.mock('@/supabase/client', () => ({
  getServiceClient: vi.fn(),
}));

const mockedGetServiceClient = vi.mocked(getServiceClient);

beforeEach(() => {
  mockedGetServiceClient.mockReset();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

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

  it('returns the exact correction-ledger count, including a verified zero', async () => {
    const select = vi.fn().mockResolvedValue({ count: 0, error: null });
    const from = vi.fn(() => ({ select }));
    mockedGetServiceClient.mockReturnValue({ from } as never);

    await expect(getCanonicalCorrectionCount()).resolves.toBe(0);
    expect(from).toHaveBeenCalledWith('corrections');
    expect(select).toHaveBeenCalledWith('id', { count: 'exact', head: true });
  });

  it('returns unavailable rather than zero when the correction query fails', async () => {
    const select = vi.fn().mockResolvedValue({
      count: null,
      error: new Error('permission denied'),
    });
    const from = vi.fn(() => ({ select }));
    mockedGetServiceClient.mockReturnValue({ from } as never);

    await expect(getCanonicalCorrectionCount()).resolves.toBeUndefined();
  });

  it('returns unavailable rather than zero when the correction query throws', async () => {
    mockedGetServiceClient.mockImplementation(() => {
      throw new Error('service client is not configured');
    });

    await expect(getCanonicalCorrectionCount()).resolves.toBeUndefined();
  });
});

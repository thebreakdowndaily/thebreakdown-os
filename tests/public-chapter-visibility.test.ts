import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const chapters = [
    { id: 'published-chapter-id', slug: 'published-chapter', title: 'Published chapter', status: 'published', order: 1, content: [] },
    { id: 'verified-chapter-id', slug: 'verified-chapter', title: 'Verified chapter', status: 'verified', order: 2, content: [] },
    { id: 'draft-chapter-id', slug: 'draft-chapter', title: 'Draft chapter', status: 'draft', order: 3, content: [] },
    { id: 'review-chapter-id', slug: 'review-chapter', title: 'Review chapter', status: 'review', order: 4, content: [] },
    { id: 'archived-chapter-id', slug: 'archived-chapter', title: 'Archived chapter', status: 'archived', order: 5, content: [] },
    { id: 'updated-chapter-id', slug: 'updated-chapter', title: 'Updated but unapproved chapter', status: 'updated', order: 6, content: [] },
  ];
  const libraries = [{
    id: 'test-library',
    slug: 'test-library',
    title: 'Test library',
    collections: [{
      id: 'test-collection',
      slug: 'test-collection',
      title: 'Test collection',
      volumes: [{
        id: 'test-volume',
        slug: 'test-volume',
        title: 'Test volume',
        chapters,
      }],
    }],
  }];
  const publicStories = [{
    id: 'public-story-id',
    slug: 'public-story',
  }];
  return {
    chapters,
    libraries,
    publicStories,
    bootstrapServices: vi.fn(),
    getKnowledgeLibraryRepository: vi.fn(),
    seedAll: vi.fn(),
  };
});

vi.mock('@/lib/bootstrap', () => ({
  bootstrapServices: mocks.bootstrapServices,
}));

vi.mock('@/utils/data-layer/knowledge-library-data', () => ({
  getKnowledgeLibrarySeedData: () => mocks.libraries,
}));

vi.mock('@/services/factory/repository', () => ({
  RepositoryFactory: {
    getKnowledgeLibraryRepository: mocks.getKnowledgeLibraryRepository,
  },
}));

vi.mock('@/lib/knowledge/knowledge-core', () => ({
  seedAll: mocks.seedAll,
  enrichClaimLazy: vi.fn(),
  getKnowledgeCore: vi.fn(),
}));

import { getAllStoryAndChapterSlugs, resolveCanonicalStory } from '@/lib/story/resolver';
import { isCanonicalStoryPublic } from '@/lib/story/publication';

describe('Public chapter visibility boundary', () => {
  beforeEach(() => {
    mocks.bootstrapServices.mockReset().mockReturnValue({
      stories: {
        getPublicStories: vi.fn().mockResolvedValue({
          data: mocks.publicStories,
          meta: { total: mocks.publicStories.length, page: 1, pageSize: 100 },
        }),
      },
    });
    mocks.getKnowledgeLibraryRepository.mockReset().mockReturnValue({
      getAllLibraries: vi.fn().mockResolvedValue(mocks.libraries),
    });
    mocks.seedAll.mockReset();
  });

  it('includes only published and verified chapters in public static params', async () => {
    const slugs = await getAllStoryAndChapterSlugs();
    const actual = new Set(slugs.map(({ slug }) => slug));

    expect(actual.has('public-story')).toBe(true);
    expect(actual.has('published-chapter')).toBe(true);
    expect(actual.has('verified-chapter')).toBe(true);
    expect(actual.has('draft-chapter')).toBe(false);
    expect(actual.has('review-chapter')).toBe(false);
    expect(actual.has('archived-chapter')).toBe(false);
    expect(actual.has('updated-chapter')).toBe(false);
  });

  it('returns not_found when a public canonical request targets a non-public chapter', async () => {
    const result = await resolveCanonicalStory('draft-chapter', { publicOnly: true });
    expect(result).toEqual({ type: 'not_found' });
  });

  it('marks non-public chapter as non-public when resolved canonically without publicOnly filter', async () => {
    const result = await resolveCanonicalStory('draft-chapter');
    expect(result.type).toBe('chapter');
    if (result.type === 'chapter') {
      expect(result.chapter.status).toBe('draft');
      expect(result.canonicalStory.publicationStatus).toBe('draft');
      expect(isCanonicalStoryPublic(result.canonicalStory)).toBe(false);
    }
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const { repository } = vi.hoisted(() => ({
  repository: {
    getStories: vi.fn(),
    getPublicStories: vi.fn(),
    getStoryBySlug: vi.fn(),
    getPublicStoryBySlug: vi.fn(),
  },
}));

vi.mock('@/services/factory/repository', () => ({
  RepositoryFactory: {
    getStoryRepository: () => repository,
  },
}));

import { GET as listStories } from '../app/api/v1/stories/route';
import { GET as getStory } from '../app/api/v1/stories/[slug]/route';

describe('v1 public story API visibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses the public-only repository method for story listings', async () => {
    const publishedStory = {
      id: 'published-1',
      slug: 'published-story',
      status: 'published',
      publicationStatus: 'published',
      isTestArtifact: false,
    };
    repository.getPublicStories.mockResolvedValue({
      data: [publishedStory],
      meta: { total: 1, page: 1, pageSize: 10 },
    });

    const response = await listStories(
      new NextRequest('http://localhost/api/v1/stories?page=1&pageSize=10'),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ data: [publishedStory] });
    expect(repository.getPublicStories).toHaveBeenCalledWith({
      page: 1,
      pageSize: 10,
      search: undefined,
    });
    expect(repository.getStories).not.toHaveBeenCalled();
  });

  it('cannot return an unpublished story through the detail endpoint', async () => {
    // Simulate the unsafe repository method finding a draft. The route must
    // not consult it for public requests.
    repository.getStoryBySlug.mockResolvedValue({
      id: 'draft-1',
      slug: 'draft-story',
      status: 'draft',
      publicationStatus: 'draft',
    });
    repository.getPublicStoryBySlug.mockResolvedValue(undefined);

    const response = await getStory(
      new NextRequest('http://localhost/api/v1/stories/draft-story'),
      { params: Promise.resolve({ slug: 'draft-story' }) },
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toMatchObject({ status: 404 });
    expect(repository.getPublicStoryBySlug).toHaveBeenCalledWith('draft-story');
    expect(repository.getStoryBySlug).not.toHaveBeenCalled();
  });

  it('returns the canonical story when the public-only lookup allows it', async () => {
    const publishedStory = {
      id: 'published-1',
      slug: 'published-story',
      status: 'published',
      publicationStatus: 'published',
      isTestArtifact: false,
    };
    repository.getPublicStoryBySlug.mockResolvedValue(publishedStory);

    const response = await getStory(
      new NextRequest('http://localhost/api/v1/stories/published-story'),
      { params: Promise.resolve({ slug: 'published-story' }) },
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ data: publishedStory });
    expect(repository.getPublicStoryBySlug).toHaveBeenCalledWith('published-story');
    expect(repository.getStoryBySlug).not.toHaveBeenCalled();
  });
});

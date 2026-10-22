import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Principal } from '../features/auth/principal';
import { can } from '../features/auth/policy';

const state = vi.hoisted(() => ({
  resolveStory: vi.fn(),
  getCurrentPrincipal: vi.fn(),
  isCanonicalStoryPublic: vi.fn(),
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

vi.mock('next/navigation', () => ({ notFound: state.notFound }));
vi.mock('@/lib/story/resolver', () => ({
  resolveStory: state.resolveStory,
  getAllStoryAndChapterSlugs: vi.fn(() => []),
}));
vi.mock('@/lib/story/publication', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/story/publication')>();
  return { ...actual, isCanonicalStoryPublic: state.isCanonicalStoryPublic };
});
vi.mock('@/features/auth/principal', () => ({
  getCurrentPrincipal: state.getCurrentPrincipal,
}));
vi.mock('@/components/rxs/ClientStoryExperience', () => ({ ClientStoryExperience: () => null }));
vi.mock('@/lib/story/metadata', () => ({ buildStoryMetadata: vi.fn(async () => ({ title: 'Story' })) }));
vi.mock('@/lib/seo/jsonld-story', () => ({ createStoryJsonLd: vi.fn(() => ({})) }));
vi.mock('@/lib/story/presentation-model', () => ({ buildStoryPresentationModel: vi.fn(() => ({})) }));
vi.mock('@/components/narrative/StoryMemoryWriter', () => ({ default: () => null }));
vi.mock('@/lib/bootstrap', () => ({ bootstrapServices: vi.fn(() => ({})) }));
vi.mock('@/services/editorial/corrections-service', () => ({ listPublishedCorrections: vi.fn(async () => []) }));
vi.mock('@/lib/comprehension/next-best-understanding', () => ({ resolveNextBestUnderstanding: vi.fn(async () => null) }));
vi.mock('@/lib/fix-helpers', () => ({ getFixesForStory: vi.fn(async () => []) }));

import StoryPage from '../app/story/[slug]/page';

function principal(role: Principal['role'], status: Principal['status'] = 'active'): Principal {
  return {
    userId: `test-${role}`,
    email: `${role}@example.test`,
    name: role,
    role,
    isSuperAdmin: false,
    status,
    organizationId: null,
  };
}

describe('unpublished story page authorization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.notFound.mockImplementation(() => {
      throw new Error('NEXT_NOT_FOUND');
    });
    state.isCanonicalStoryPublic.mockReturnValue(false);
    state.resolveStory.mockResolvedValue({
      type: 'story',
      canonicalStory: {
        id: 'private-draft',
        slug: 'private-draft',
        title: 'Private draft',
        headline: 'Private draft',
        summary: 'Not published',
        publicationStatus: 'draft',
        status: 'draft',
        publishedAt: '2000-01-01T00:00:00.000Z',
        isTestArtifact: false,
      },
    });
  });

  it.each([
    ['anonymous caller', null],
    ['guest account', principal('guest')],
    ['reporter account', principal('reporter')],
    ['suspended editor', principal('editor', 'suspended')],
  ])('returns not-found for a draft requested by %s', async (_label, caller) => {
    state.getCurrentPrincipal.mockResolvedValue(caller);

    await expect(
      StoryPage({ params: Promise.resolve({ slug: 'private-draft' }) }),
    ).rejects.toThrow('NEXT_NOT_FOUND');

    expect(state.getCurrentPrincipal).toHaveBeenCalledOnce();
  });

  it('grants preview permission to active editorial roles through the central policy', () => {
    expect(can(principal('editor'), 'intel.editorial')).toBe(true);
    expect(can(principal('managing_editor'), 'intel.editorial')).toBe(true);
    expect(can(principal('owner'), 'intel.editorial')).toBe(true);
  });
});

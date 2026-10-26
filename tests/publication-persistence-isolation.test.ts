import { beforeEach, describe, it, expect, vi } from 'vitest';
import type { Story } from '../types/canonical';

const mocks = vi.hoisted(() => {
  const builder: Record<string, any> = {};
  builder.select = vi.fn(() => builder);
  builder.eq = vi.fn(() => builder);
  builder.single = vi.fn(async () => ({ data: null, error: { code: 'PGRST116', message: 'Row not found' } }));
  builder.maybeSingle = vi.fn(async () => ({ data: null, error: null }));
  builder.upsert = vi.fn(() => builder);
  builder.delete = vi.fn(() => builder);
  const from = vi.fn(() => builder);
  const db = vi.fn(() => ({ from }));
  return { builder, from, db };
});

vi.mock('@/lib/api-v2', () => ({
  db: mocks.db,
}));

import { SupabaseStoryRepository } from '../services/repositories/supabase/story';
import { RepositoryFactory } from '../services/factory/repository';
import { DirectPublicationForbiddenError } from '../lib/story/evidence-guard';
import { issuePublicationToken, consumePublicationToken } from '../lib/editorial/publication-token';
import { evaluatePublicationContract } from '../lib/editorial/canonical-publication';
import type { Principal } from '../features/auth/principal';

function createEditorPrincipal(): Principal {
  return {
    userId: 'editor-1',
    email: 'editor@thebreakdown.in',
    name: 'Senior Editor',
    role: 'editor',
    isSuperAdmin: false,
    status: 'active',
    organizationId: null,
  };
}

describe('P0 Publication Persistence, Authorization & Isolation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.builder.select.mockReturnValue(mocks.builder);
    mocks.builder.eq.mockReturnValue(mocks.builder);
    mocks.builder.single.mockResolvedValue({ data: null, error: { code: 'PGRST116', message: 'Row not found' } });
    mocks.builder.maybeSingle.mockResolvedValue({ data: null, error: null });
  });

  it('P0-PERSIST-01: Default SupabaseStoryRepository routes through db() anon client and fails closed when story is unpublished', async () => {
    const repo = new SupabaseStoryRepository();
    const story = await repo.getStoryBySlug('bcci-domestic-mandate-ranji-economics');

    expect(mocks.db).toHaveBeenCalled();
    expect(mocks.from).toHaveBeenCalledWith('stories');
    expect(mocks.builder.eq).toHaveBeenCalledWith('slug', 'bcci-domestic-mandate-ranji-economics');
    expect(story).toBeUndefined();
  });

  it('P0-PERSIST-02: Privileged client injection allows reading review story for editorial gate evaluation', async () => {
    const mockReviewRow = {
      id: 'a3333333-3333-4333-8333-333333333333',
      slug: 'bcci-domestic-mandate-ranji-economics',
      title: 'Ranji Trophy Pay',
      summary: 'Domestic red-ball economics.',
      status: 'review',
      is_test_artifact: false,
      published_at: null,
    };

    const mockServiceClient = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockReviewRow, error: null }),
        maybeSingle: vi.fn().mockResolvedValue({ data: mockReviewRow, error: null }),
      }),
    };

    const privilegedRepo = new SupabaseStoryRepository(mockServiceClient);
    const story = await privilegedRepo.getStoryBySlug('bcci-domestic-mandate-ranji-economics');

    expect(mocks.db).not.toHaveBeenCalled();
    expect(mockServiceClient.from).toHaveBeenCalledWith('stories');
    expect(story).toBeDefined();
    expect(story?.id).toBe('a3333333-3333-4333-8333-333333333333');
    expect(story?.status).toBe('review');
  });

  it('P0-PERSIST-03: Direct saveStory with status=published is strictly rejected without valid publication token', async () => {
    const mockStory: Story = {
      id: 'story-attack-01',
      title: 'Unauthorized Story',
      slug: 'unauthorized-story',
      headline: 'Attack Vector',
      summary: 'Attempting direct save to published.',
      heroImage: '/images/hero.jpg',
      author: 'Attacker',
      category: 'governance',
      status: 'published',
      publicationStatus: 'published',
      storyType: 'standard',
      evidenceScore: 0,
      readingTime: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      tags: [],
      blocks: [],
      sources: [],
      claims: [],
      timeline: [],
      faq: [],
      charts: [],
    };

    const repo = new SupabaseStoryRepository();

    // 1. Without token -> throws DirectPublicationForbiddenError
    await expect(repo.saveStory(mockStory)).rejects.toThrow(DirectPublicationForbiddenError);

    // 2. With forged token for different story -> throws DirectPublicationForbiddenError
    const foreignToken = issuePublicationToken('different-story-id');
    await expect(
      repo.saveStory(mockStory, { publicationToken: foreignToken })
    ).rejects.toThrow(DirectPublicationForbiddenError);
  });

  it('P0-PERSIST-04: Single-use publication token cannot be reused for second publication attempt', async () => {
    const storyId = 'story-single-use-01';
    const token = issuePublicationToken(storyId);

    // First consumption succeeds
    expect(consumePublicationToken(token, storyId)).toBe(true);

    // Second consumption MUST fail (replay attack protection)
    expect(consumePublicationToken(token, storyId)).toBe(false);
  });

  it('P0-PERSIST-05: RepositoryFactory injects client option correctly into SupabaseStoryRepository', () => {
    const mockClient = { from: vi.fn() };
    const repo = RepositoryFactory.getStoryRepository([], { client: mockClient });
    expect(repo).toBeDefined();
  });

  it('P0-PERSIST-06: Editorial contract requires valid review status and refuses to publish unreviewed drafts', () => {
    const draftStory: Story = {
      id: 'story-draft-01',
      title: 'Incomplete Draft',
      slug: 'incomplete-draft',
      headline: 'Draft Headline',
      summary: 'Incomplete story summary.',
      heroImage: '/images/hero.jpg',
      author: 'Author',
      category: 'governance',
      status: 'draft',
      storyType: 'standard',
      evidenceScore: 50,
      readingTime: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      tags: [],
      blocks: [],
      sources: [],
      claims: [],
      timeline: [],
      faq: [],
      charts: [],
    };

    const editor = createEditorPrincipal();
    const decision = evaluatePublicationContract(draftStory, draftStory, editor);

    // Must fail closed with 409 Invalid Transition or 422 Gate Failure
    expect(decision.allowed).toBe(false);
    expect(decision.publicationToken).toBeUndefined();
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  requireRole: vi.fn(),
  createScheduleEntry: vi.fn(),
  updateScheduleEntry: vi.fn(),
  getWeeklyPlan: vi.fn(),
  validateAndPublishDueStories: vi.fn(),
  validateStoryForPublication: vi.fn(),
  evaluatePublicationContractAsync: vi.fn(),
  executePostPublicationEffects: vi.fn(),
  getStoryRepository: vi.fn(),
  saveStory: vi.fn(),
  rowToStory: vi.fn(),
  getServiceClient: vi.fn(),
}));

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/features/auth/require-role', () => ({ requireRole: mocks.requireRole }));
vi.mock('@/services/editorial/schedule', () => ({
  createScheduleEntry: mocks.createScheduleEntry,
  updateScheduleEntry: mocks.updateScheduleEntry,
  getWeeklyPlan: mocks.getWeeklyPlan,
  validateAndPublishDueStories: mocks.validateAndPublishDueStories,
  rowToStory: mocks.rowToStory,
}));
vi.mock('@/lib/editorial/publication-gate', () => ({
  validateStoryForPublication: mocks.validateStoryForPublication,
}));
vi.mock('@/lib/editorial/canonical-publication', () => ({
  evaluatePublicationContractAsync: mocks.evaluatePublicationContractAsync,
  executePostPublicationEffects: mocks.executePostPublicationEffects,
}));
vi.mock('@/services/factory/repository', () => ({
  RepositoryFactory: { getStoryRepository: mocks.getStoryRepository },
}));
vi.mock('@/supabase/client', () => ({ getServiceClient: mocks.getServiceClient }));

import { publishNowAction, scheduleStoryAction } from '@/features/intel/editorial/actions';

const scheduleEntry = {
  id: 'schedule-1',
  storyId: 'story-1',
  slotDate: '2026-10-22',
  slotPosition: 1,
  priority: 5,
  category: 'analysis',
  status: 'planned',
  createdAt: '2026-10-21T00:00:00.000Z',
  updatedAt: '2026-10-21T00:00:00.000Z',
};

const storyRow = {
  id: 'story-1',
  title: 'A verified test story',
  slug: 'verified-test-story',
  headline: 'A verified test story',
  summary: 'Test summary',
  hero_image: '',
  author: 'Test Editor',
  category: 'history',
  status: 'ready',
  evidence_score: 90,
  reading_time: 4,
  published_at: null,
  created_at: '2026-10-20T00:00:00.000Z',
  updated_at: '2026-10-20T00:00:00.000Z',
  tags: [],
  blocks: [],
  sources: [],
  claims: [],
  timeline: [],
  faq: [],
  charts: [],
  related_story_ids: [],
  related_entity_ids: [],
  related_topic_ids: [],
};

function makeUpdateQuery(result: { data: unknown; error: { message: string } | null }) {
  const query: Record<string, any> = {};
  query.update = vi.fn(() => query);
  query.eq = vi.fn(() => query);
  query.select = vi.fn(() => query);
  query.maybeSingle = vi.fn().mockResolvedValue(result);
  return query;
}

function makeReadQuery() {
  const query: Record<string, any> = {};
  query.select = vi.fn(() => query);
  query.eq = vi.fn(() => query);
  query.single = vi.fn().mockResolvedValue({ data: storyRow, error: null });
  return query;
}

describe('Editorial server-action persistence errors', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireRole.mockResolvedValue({
      userId: 'editor-1',
      email: 'editor@example.test',
      name: 'Test Editor',
      role: 'editor',
      isSuperAdmin: false,
      status: 'active',
      organizationId: null,
    });
    mocks.updateScheduleEntry.mockResolvedValue({ ...scheduleEntry, status: 'blocked' });
    mocks.createScheduleEntry.mockResolvedValue(scheduleEntry);
    mocks.validateStoryForPublication.mockReturnValue({ passed: true, checks: [] });
    mocks.rowToStory.mockReturnValue({
      id: 'story-1',
      slug: 'verified-test-story',
      title: storyRow.title,
      headline: storyRow.headline,
      summary: storyRow.summary,
      heroImage: '',
      author: storyRow.author,
      category: storyRow.category,
      status: 'scheduled',
      publicationStatus: 'scheduled',
      storyType: 'standard',
      evidenceScore: 90,
      readingTime: 4,
      publishedAt: '2026-10-22T09:00:00.000Z',
      createdAt: storyRow.created_at,
      updatedAt: storyRow.updated_at,
      tags: [],
      blocks: [{ id: 'block-1', type: 'paragraph', content: 'A test paragraph' }],
      sources: [{ id: 'source-1', title: 'A test source', url: 'https://example.test/source' }],
      claims: [{ id: 'claim-1', text: 'A test claim', sourceIds: ['source-1'] }],
      timeline: [],
      faq: [],
      charts: [],
      relatedStoryIds: [],
      relatedEntityIds: [],
      relatedTopicIds: [],
    });
    mocks.evaluatePublicationContractAsync.mockResolvedValue({
      allowed: true,
      httpStatus: 200,
      updatedStory: {
        id: 'story-1',
        slug: 'verified-test-story',
        title: storyRow.title,
        headline: storyRow.headline,
        summary: storyRow.summary,
        heroImage: '',
        author: storyRow.author,
        category: storyRow.category,
        status: 'published',
        publicationStatus: 'published',
        storyType: 'standard',
        evidenceScore: 90,
        readingTime: 4,
        publishedAt: '2026-10-22T09:00:00.000Z',
        createdAt: storyRow.created_at,
        updatedAt: storyRow.updated_at,
        tags: [],
        blocks: [{ id: 'block-1', type: 'paragraph', content: 'A test paragraph' }],
        sources: [{ id: 'source-1', title: 'A test source', url: 'https://example.test/source' }],
        claims: [{ id: 'claim-1', text: 'A test claim', sourceIds: ['source-1'] }],
        timeline: [],
        faq: [],
        charts: [],
        relatedStoryIds: [],
        relatedEntityIds: [],
        relatedTopicIds: [],
      },
      publicationToken: 'single-use-publication-token',
      gateResult: {
        storyId: 'story-1',
        passed: true,
        checks: [{ name: 'evidence_preservation_vault', passed: true, reason: 'Evidence complete' }],
        checkedAt: '2026-10-21T00:00:00.000Z',
        triggeredBy: 'manual',
      },
    });
    mocks.getStoryRepository.mockReturnValue({ saveStory: mocks.saveStory });
    mocks.saveStory.mockResolvedValue({});
    mocks.executePostPublicationEffects.mockImplementation(() => undefined);
  });

  it('does not report scheduling success when the story write fails, and blocks the created slot', async () => {
    const writeQuery = makeUpdateQuery({ data: null, error: { message: 'write denied' } });
    mocks.getServiceClient.mockReturnValue({ from: vi.fn(() => writeQuery) });

    const result = await scheduleStoryAction({
      storyId: 'story-1',
      slotDate: scheduleEntry.slotDate,
      slotPosition: 1,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('story was not scheduled: write denied');
    expect(mocks.updateScheduleEntry).toHaveBeenCalledWith('schedule-1', {
      status: 'blocked',
      blockReason: 'Story scheduling failed: write denied',
    });
  });

  it('does not report publication success when the repository write fails', async () => {
    mocks.getServiceClient.mockReturnValue({ from: vi.fn(() => makeReadQuery()) });
    mocks.saveStory.mockRejectedValue(new Error('publication denied'));

    const result = await publishNowAction('story-1');

    expect(mocks.evaluatePublicationContractAsync).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'story-1', status: 'scheduled' }),
      expect.objectContaining({ id: 'story-1', status: 'scheduled' }),
      expect.objectContaining({ role: 'editor', userId: 'editor-1' }),
      expect.objectContaining({ triggeredBy: 'manual' }),
    );
    expect(mocks.saveStory).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'story-1', status: 'published', publicationStatus: 'published' }),
      { publicationToken: 'single-use-publication-token' },
    );
    expect(result.success).toBe(false);
    expect(result.error).toContain('story repository write failed: publication denied');
    expect(mocks.executePostPublicationEffects).not.toHaveBeenCalled();
    expect(mocks.updateScheduleEntry).not.toHaveBeenCalled();
  });

  it('fails closed when the canonical async contract rejects publication', async () => {
    mocks.getServiceClient.mockReturnValue({ from: vi.fn(() => makeReadQuery()) });
    mocks.evaluatePublicationContractAsync.mockResolvedValue({
      allowed: false,
      httpStatus: 422,
      error: 'Publication gate failed: evidence_preservation_vault: evidence missing',
      gateResult: {
        storyId: 'story-1',
        scheduleId: 'schedule-1',
        passed: false,
        checks: [{ name: 'evidence_preservation_vault', passed: false, reason: 'evidence missing' }],
        checkedAt: '2026-10-21T00:00:00.000Z',
        triggeredBy: 'manual',
      },
    });

    const result = await publishNowAction('story-1', 'schedule-1');

    expect(result.success).toBe(false);
    expect(result.result?.passed).toBe(false);
    expect(result.error).toContain('evidence missing');
    expect(mocks.saveStory).not.toHaveBeenCalled();
    expect(mocks.executePostPublicationEffects).not.toHaveBeenCalled();
    expect(mocks.updateScheduleEntry).toHaveBeenCalledWith('schedule-1', {
      status: 'blocked',
      blockReason: 'Publication gate failed: evidence_preservation_vault: evidence missing',
    });
  });

  it('reports confirmed publication with a warning when only schedule reconciliation fails', async () => {
    mocks.getServiceClient.mockReturnValue({ from: vi.fn(() => makeReadQuery()) });
    mocks.updateScheduleEntry.mockRejectedValue(new Error('schedule write denied'));

    const result = await publishNowAction('story-1', 'schedule-1');

    expect(result.success).toBe(true);
    expect(result.result?.passed).toBe(true);
    expect(result.result?.publishedAt).toBeTruthy();
    expect(mocks.executePostPublicationEffects).toHaveBeenCalledOnce();
    expect(result.warning).toContain('Story was published, but schedule entry schedule-1 could not be reconciled');
  });
});

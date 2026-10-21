import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  requireRole: vi.fn(),
  createScheduleEntry: vi.fn(),
  updateScheduleEntry: vi.fn(),
  getWeeklyPlan: vi.fn(),
  validateAndPublishDueStories: vi.fn(),
  validateStoryForPublication: vi.fn(),
  getServiceClient: vi.fn(),
}));

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/features/auth/require-role', () => ({ requireRole: mocks.requireRole }));
vi.mock('@/services/editorial/schedule', () => ({
  createScheduleEntry: mocks.createScheduleEntry,
  updateScheduleEntry: mocks.updateScheduleEntry,
  getWeeklyPlan: mocks.getWeeklyPlan,
  validateAndPublishDueStories: mocks.validateAndPublishDueStories,
}));
vi.mock('@/lib/editorial/publication-gate', () => ({
  validateStoryForPublication: mocks.validateStoryForPublication,
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
    mocks.requireRole.mockResolvedValue(undefined);
    mocks.updateScheduleEntry.mockResolvedValue({ ...scheduleEntry, status: 'blocked' });
    mocks.createScheduleEntry.mockResolvedValue(scheduleEntry);
    mocks.validateStoryForPublication.mockReturnValue({ passed: true, checks: [] });
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

  it('does not report publication success when the story write fails', async () => {
    const readQuery = makeReadQuery();
    const writeQuery = makeUpdateQuery({ data: null, error: { message: 'publication denied' } });
    let fromCall = 0;
    mocks.getServiceClient.mockReturnValue({
      from: vi.fn(() => (++fromCall === 1 ? readQuery : writeQuery)),
    });

    const result = await publishNowAction('story-1');

    expect(result.success).toBe(false);
    expect(result.error).toContain('Story publication was not confirmed: publication denied');
    expect(mocks.updateScheduleEntry).not.toHaveBeenCalled();
  });

  it('reports confirmed publication with a warning when only schedule reconciliation fails', async () => {
    const readQuery = makeReadQuery();
    const writeQuery = makeUpdateQuery({ data: { id: 'story-1' }, error: null });
    mocks.getServiceClient.mockReturnValue({
      from: vi.fn()
        .mockReturnValueOnce(readQuery)
        .mockReturnValueOnce(writeQuery),
    });
    mocks.updateScheduleEntry.mockRejectedValue(new Error('schedule write denied'));

    const result = await publishNowAction('story-1', 'schedule-1');

    expect(result.success).toBe(true);
    expect(result.result?.publishedAt).toBeTruthy();
    expect(result.warning).toContain('Story was published, but schedule entry schedule-1 could not be reconciled');
  });
});

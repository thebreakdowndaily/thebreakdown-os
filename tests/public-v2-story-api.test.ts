import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const state = vi.hoisted(() => {
  const builder: Record<string, any> = {};

  for (const method of ['select', 'eq', 'lte', 'or', 'order', 'range']) {
    builder[method] = vi.fn(() => builder);
  }

  builder.from = vi.fn(() => builder);
  builder.maybeSingle = vi.fn();
  builder.then = vi.fn((resolve: (value: unknown) => unknown, reject: (reason: unknown) => unknown) =>
    Promise.resolve({ data: [], count: 0, error: null }).then(resolve, reject),
  );

  return { builder };
});

vi.mock('@/lib/api-v2', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api-v2')>();
  return { ...actual, db: () => state.builder };
});

import { GET as listStories } from '../app/api/v2/stories/route';
import { GET as getStory } from '../app/api/v2/stories/[slug]/route';

const publishedStory = {
  id: 'published-1',
  slug: 'published-story',
  status: 'published',
  is_test_artifact: false,
  published_at: '2026-10-01T00:00:00.000Z',
  notes: 'internal editorial note',
  updated_by: 'editor-uuid',
  version: 3,
  scheduled_at: '2026-11-01T00:00:00.000Z',
  scheduled_by: 'editor-uuid',
  block_reason: 'internal block detail',
  blocked_at: '2026-10-01T00:00:00.000Z',
  fallback_story_id: 'internal-fallback-id',
  legacy_id: 'legacy-id',
  internal_future_field: 'must not become public by default',
};

describe('v2 public story API visibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.builder.then.mockImplementation(
      (resolve: (value: unknown) => unknown, reject: (reason: unknown) => unknown) =>
        Promise.resolve({ data: [publishedStory], count: 1, error: null }).then(resolve, reject),
    );
    state.builder.maybeSingle.mockResolvedValue({ data: publishedStory, error: null });
  });

  it('forces public eligibility filters and ignores client-supplied private status filters', async () => {
    const response = await listStories(
      new NextRequest('http://localhost/api/v2/stories?page=1&pageSize=10&status=draft'),
    );

    expect(response.status).toBe(200);
    expect(state.builder.eq).toHaveBeenCalledWith('status', 'published');
    expect(state.builder.eq).toHaveBeenCalledWith('is_test_artifact', false);
    expect(state.builder.lte).toHaveBeenCalledWith('published_at', expect.any(String));
    expect(state.builder.eq).not.toHaveBeenCalledWith('status', 'draft');
    const payload = await response.json();
    expect(payload).toMatchObject({ data: [{ id: 'published-1', slug: 'published-story', status: 'published' }], meta: { total: 1 } });
    for (const field of ['notes', 'updated_by', 'version', 'scheduled_at', 'scheduled_by', 'block_reason', 'blocked_at', 'fallback_story_id', 'legacy_id', 'is_test_artifact', 'internal_future_field']) {
      expect(payload.data[0]).not.toHaveProperty(field);
    }
    const selectedColumns = String(state.builder.select.mock.calls[0]?.[0] ?? '');
    expect(selectedColumns).toContain('slug');
    for (const field of ['notes', 'updated_by', 'version', 'scheduled_at', 'scheduled_by', 'block_reason', 'blocked_at', 'fallback_story_id', 'legacy_id', 'is_test_artifact', 'internal_future_field']) {
      expect(selectedColumns).not.toContain(field);
    }
  });

  it('returns 404 for a story that does not pass the public query boundary', async () => {
    state.builder.maybeSingle.mockResolvedValueOnce({ data: null, error: null });

    const response = await getStory(
      new NextRequest('http://localhost/api/v2/stories/draft-story'),
      { params: Promise.resolve({ slug: 'draft-story' }) },
    );

    expect(response.status).toBe(404);
    expect(state.builder.eq).toHaveBeenCalledWith('status', 'published');
    expect(state.builder.eq).toHaveBeenCalledWith('is_test_artifact', false);
    expect(state.builder.lte).toHaveBeenCalledWith('published_at', expect.any(String));
    expect(await response.json()).toMatchObject({ error: 'Story not found' });
  });

  it('returns an eligible published story from the detail endpoint', async () => {
    const response = await getStory(
      new NextRequest('http://localhost/api/v2/stories/published-story'),
      { params: Promise.resolve({ slug: 'published-story' }) },
    );

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload).toMatchObject({ data: { id: 'published-1', slug: 'published-story', status: 'published' } });
    for (const field of ['notes', 'updated_by', 'version', 'scheduled_at', 'scheduled_by', 'block_reason', 'blocked_at', 'fallback_story_id', 'legacy_id', 'is_test_artifact', 'internal_future_field']) {
      expect(payload.data).not.toHaveProperty(field);
    }
    const selectedColumns = String(state.builder.select.mock.calls[0]?.[0] ?? '');
    expect(selectedColumns).toContain('slug');
    for (const field of ['notes', 'updated_by', 'version', 'scheduled_at', 'scheduled_by', 'block_reason', 'blocked_at', 'fallback_story_id', 'legacy_id', 'is_test_artifact', 'internal_future_field']) {
      expect(selectedColumns).not.toContain(field);
    }
  });
});

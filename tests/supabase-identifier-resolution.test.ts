import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const builder: Record<string, any> = {};
  builder.select = vi.fn(() => builder);
  builder.eq = vi.fn(() => builder);
  builder.maybeSingle = vi.fn(async () => ({ data: null, error: null }));
  const from = vi.fn(() => builder);
  const db = vi.fn(() => ({ from }));
  return { builder, from, db };
});

vi.mock('@/lib/api-v2', () => ({
  db: mocks.db,
}));

import { SupabaseTopicRepository } from '../services/repositories/supabase/topic';
import { SupabaseEntityRepository } from '../services/repositories/supabase/entity';
import { SupabaseStoryRepository } from '../services/repositories/supabase/story';

const topicUuid = '7a5d6a35-3261-47cc-8d75-90b6d7f1f012';

describe('Supabase repository identifier resolution', () => {
  beforeEach(() => {
    mocks.builder.select.mockClear();
    mocks.builder.eq.mockClear();
    mocks.builder.maybeSingle.mockClear();
    mocks.from.mockClear();
    mocks.db.mockClear();
    mocks.builder.maybeSingle.mockResolvedValue({ data: null, error: null });
  });

  it('queries topic slugs as text instead of sending them to the UUID id column', async () => {
    await new SupabaseTopicRepository().getTopic('policy');

    expect(mocks.from).toHaveBeenCalledWith('topics');
    expect(mocks.builder.eq).toHaveBeenCalledWith('slug', 'policy');
  });

  it('uses the UUID id column for topic UUIDs', async () => {
    await new SupabaseTopicRepository().getTopic(topicUuid);

    expect(mocks.builder.eq).toHaveBeenCalledWith('id', topicUuid);
  });

  it('queries entity slugs as text', async () => {
    await new SupabaseEntityRepository().getEntity('rbi');

    expect(mocks.from).toHaveBeenCalledWith('entities');
    expect(mocks.builder.eq).toHaveBeenCalledWith('slug', 'rbi');
  });

  it('uses the UUID id column for entity UUIDs', async () => {
    await new SupabaseEntityRepository().getEntity(topicUuid);

    expect(mocks.builder.eq).toHaveBeenCalledWith('id', topicUuid);
  });

  it('resolves story identifiers by UUID or slug', async () => {
    const repository = new SupabaseStoryRepository();

    await repository.getStory('electoral-bonds');
    expect(mocks.from).toHaveBeenLastCalledWith('stories');
    expect(mocks.builder.eq).toHaveBeenLastCalledWith('slug', 'electoral-bonds');

    mocks.builder.eq.mockClear();
    await repository.getStory(topicUuid);
    expect(mocks.builder.eq).toHaveBeenCalledWith('id', topicUuid);
  });
});

import { describe, expect, it } from 'vitest';
import { MemoryStoryService } from '@/services/repositories/memory/story';
import { OptimisticLockError } from '@/services/repositories/errors';
import type { Story } from '@/types/canonical';

function makeTestStory(id: string, overrides: Partial<Story> = {}): Story {
  return {
    id,
    title: 'Test Story',
    slug: 'test-story',
    headline: 'Test Headline',
    summary: 'Test Summary',
    heroImage: 'https://example.com/hero.jpg',
    author: 'Reporter',
    category: 'governance',
    status: 'draft',
    publicationStatus: 'draft',
    storyType: 'standard',
    evidenceScore: 85,
    readingTime: 4,
    publishedAt: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['test'],
    blocks: [],
    sources: [],
    claims: [],
    timeline: [],
    faq: [],
    charts: [],
    relatedStoryIds: [],
    relatedEntityIds: [],
    relatedTopicIds: [],
    ...overrides,
  };
}

describe('Story Optimistic Concurrency Control (OCC)', () => {
  it('assigns version 1 on initial creation when version is omitted', async () => {
    const service = new MemoryStoryService();
    const story = makeTestStory('story-1');
    const saved = await service.saveStory(story);

    expect(saved.version).toBe(1);
    const retrieved = await service.getStory('story-1');
    expect(retrieved?.version).toBe(1);
  });

  it('increments version on update when version matches current version', async () => {
    const service = new MemoryStoryService();
    const initial = await service.saveStory(makeTestStory('story-2'));
    expect(initial.version).toBe(1);

    const update1 = await service.saveStory({
      ...initial,
      title: 'Updated Title 1',
      version: 1,
    });
    expect(update1.version).toBe(2);
    expect(update1.title).toBe('Updated Title 1');

    const update2 = await service.saveStory({
      ...update1,
      title: 'Updated Title 2',
      version: 2,
    });
    expect(update2.version).toBe(3);
  });

  it('throws OptimisticLockError on concurrent stale update', async () => {
    const service = new MemoryStoryService();
    const initial = await service.saveStory(makeTestStory('story-3'));
    expect(initial.version).toBe(1);

    // Editor A and Editor B both fetch version 1
    const editorAFetch = await service.getStory('story-3');
    const editorBFetch = await service.getStory('story-3');

    // Editor A saves first -> updates to version 2
    const editorASaved = await service.saveStory({
      ...editorAFetch!,
      title: 'Editor A Edit',
      version: editorAFetch!.version,
    });
    expect(editorASaved.version).toBe(2);

    // Editor B attempts to save with stale version 1 -> MUST throw OptimisticLockError
    await expect(
      service.saveStory({
        ...editorBFetch!,
        title: 'Editor B Stale Edit',
        version: editorBFetch!.version,
      })
    ).rejects.toThrow(OptimisticLockError);

    try {
      await service.saveStory({
        ...editorBFetch!,
        title: 'Editor B Stale Edit',
        version: editorBFetch!.version,
      });
    } catch (err: any) {
      expect(err).toBeInstanceOf(OptimisticLockError);
      expect(err.code).toBe('OPTIMISTIC_LOCK_CONFLICT');
      expect(err.status).toBe(409);
      expect(err.expectedVersion).toBe(1);
      expect(err.actualVersion).toBe(2);
      expect(err.message).toContain('Conflict: Story story-3 has been modified concurrently');
    }
  });

  it('preserves latest state and allows retry with re-fetched version', async () => {
    const service = new MemoryStoryService();
    await service.saveStory(makeTestStory('story-4'));

    // Stale write fails
    await expect(
      service.saveStory({
        ...makeTestStory('story-4'),
        version: 0,
      })
    ).rejects.toThrow(OptimisticLockError);

    // Fetch latest and save succeeds
    const latest = await service.getStory('story-4');
    expect(latest?.version).toBe(1);

    const retried = await service.saveStory({
      ...latest!,
      title: 'Retried Title',
      version: latest!.version,
    });
    expect(retried.version).toBe(2);
    expect(retried.title).toBe('Retried Title');
  });
});

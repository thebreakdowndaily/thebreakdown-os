import { describe, expect, it } from 'vitest';
import { buildHomepage } from '../features/home/view-model';
import { bootstrapServices } from '../lib/bootstrap';

describe('homepage source count semantics', () => {
  it('reports total linked sources rather than switching to primary-source count when nonzero', async () => {
    const services = bootstrapServices({ publicOnly: true });
    const [viewModel, publicStories] = await Promise.all([
      buildHomepage(services),
      services.stories.getPublicStories({ pageSize: 100 }),
    ]);

    const newestStory = [...publicStories.data].sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    )[0];

    expect(viewModel.leadStory).not.toBeNull();
    expect(newestStory).toBeDefined();
    expect(viewModel.leadStory?.stats?.sources).toBe(newestStory.sources.length);
  });
});

import { initServices } from './registry';
import { MemoryStoryService } from './stories/service';
import { MemoryTopicService } from './topics/service';
import { MemoryEntityService } from './entities/service';
import { MemoryTimelineService } from './timelines/service';
import { MemoryFixService } from './fixes/service';
import { MemoryDatasetService } from './datasets/service';
import { MemoryMediaService } from './media/service';
import { MemorySearchService } from './search/service';
import { MemoryAnalyticsService } from './analytics/service';
import type { Services } from './registry';
import type { Story, Topic, Entity, Timeline, Fix, Dataset, MediaItem } from '@/types/canonical';

export function initDefaultServices(
  seedStories: Story[],
  seedTopics: Topic[],
  seedEntities: Entity[],
  seedTimelines: Timeline[],
  seedFixes: Fix[],
  seedDatasets: Dataset[],
  seedMedia: MediaItem[],
): Services {
  const services: Services = {
    stories: new MemoryStoryService(seedStories),
    topics: new MemoryTopicService(seedTopics),
    entities: new MemoryEntityService(seedEntities),
    timelines: new MemoryTimelineService(seedTimelines),
    fixes: new MemoryFixService(seedFixes),
    datasets: new MemoryDatasetService(seedDatasets),
    media: new MemoryMediaService(seedMedia),
    search: new MemorySearchService(),
    analytics: new MemoryAnalyticsService(),
  };
  initServices(services);
  return services;
}

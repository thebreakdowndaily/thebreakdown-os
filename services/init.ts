import { initServices } from './registry';
import type { Services } from './registry';
import type { Story, Topic, Entity, Timeline, Fix, Dataset, MediaItem } from '@/types/canonical';
import { MemoryStoryService } from './stories/service';
import { MemoryTopicService } from './topics/service';
import { MemoryEntityService } from './entities/service';
import { MemoryTimelineService } from './timelines/service';
import { MemoryFixService } from './fixes/service';
import { MemoryDatasetService } from './datasets/service';
import { MemoryMediaService } from './media/service';
import { MemorySearchService } from './search/service';
import { MemoryAnalyticsService } from './analytics/service';
import { CanonicalStoryService } from './stories/canonical-repository';
import { CanonicalTopicService } from './topics/canonical-repository';
import { CanonicalEntityService } from './entities/canonical-repository';
import { CanonicalTimelineService } from './timelines/canonical-repository';
import { CanonicalFixService } from './fixes/canonical-repository';
import { CanonicalSearchService } from './search/canonical-repository';
import { CanonicalAnalyticsService } from './analytics/canonical-repository';

// ── Memory-backed (default for SSG / mock data) ─────────────────────────

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

// ── Canonical / DB-backed (for API routes & production runtime) ─────────

export function initCanonicalServices(): Services {
  const datasets = new MemoryDatasetService();

  const services: Services = {
    stories: new CanonicalStoryService() as unknown as Services['stories'],
    topics: new CanonicalTopicService() as unknown as Services['topics'],
    entities: new CanonicalEntityService() as unknown as Services['entities'],
    timelines: new CanonicalTimelineService() as unknown as Services['timelines'],
    fixes: new CanonicalFixService() as unknown as Services['fixes'],
    datasets: datasets as unknown as Services['datasets'],
    media: new MemoryMediaService([]) as unknown as Services['media'],
    search: new CanonicalSearchService() as unknown as Services['search'],
    analytics: new CanonicalAnalyticsService() as unknown as Services['analytics'],
  };
  initServices(services);
  return services;
}

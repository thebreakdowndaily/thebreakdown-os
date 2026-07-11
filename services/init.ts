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
import { PluginAnalyticsService } from './analytics/service';
import { MemoryGraphProjectionService } from './graph/service';
import { MemoryMonitorService, registerAllWatchers } from './monitoring/service';
import { CanonicalStoryService } from './stories/canonical-repository';
import { CanonicalTopicService } from './topics/canonical-repository';
import { CanonicalEntityService } from './entities/canonical-repository';
import { CanonicalTimelineService } from './timelines/canonical-repository';
import { CanonicalFixService } from './fixes/canonical-repository';
import { CanonicalSearchService } from './search/canonical-repository';
import { CanonicalAnalyticsService } from './analytics/canonical-repository';
import { DefaultImageIntelligenceService } from './media/intelligence';

function createMonitorService(): MemoryMonitorService {
  const svc = new MemoryMonitorService();
  registerAllWatchers(svc);
  svc.runAllChecks();
  return svc;
}

function buildWithGraph(base: Omit<Services, 'graph' | 'monitoring'>): Services {
  const monitoring = createMonitorService();
  const partial = { ...base, monitoring, graph: null as unknown as Services['graph'] };
  const graph = new MemoryGraphProjectionService(partial as Services);
  const services: Services = { ...partial, graph };
  initServices(services);
  graph.setServices(services);
  return services;
}

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
  return buildWithGraph({
    stories: new MemoryStoryService(seedStories),
    topics: new MemoryTopicService(seedTopics),
    entities: new MemoryEntityService(seedEntities),
    timelines: new MemoryTimelineService(seedTimelines),
    fixes: new MemoryFixService(seedFixes),
    datasets: new MemoryDatasetService(seedDatasets),
    media: new MemoryMediaService(seedMedia),
    search: new MemorySearchService(),
    analytics: new PluginAnalyticsService(),
    intelligence: new DefaultImageIntelligenceService(),
  });
}

// ── Canonical / DB-backed (for API routes & production runtime) ─────────

export function initCanonicalServices(): Services {
  return buildWithGraph({
    stories: new CanonicalStoryService() as unknown as Services['stories'],
    topics: new CanonicalTopicService() as unknown as Services['topics'],
    entities: new CanonicalEntityService() as unknown as Services['entities'],
    timelines: new CanonicalTimelineService() as unknown as Services['timelines'],
    fixes: new CanonicalFixService() as unknown as Services['fixes'],
    datasets: new MemoryDatasetService() as unknown as Services['datasets'],
    media: new MemoryMediaService([]) as unknown as Services['media'],
    search: new CanonicalSearchService() as unknown as Services['search'],
    analytics: new CanonicalAnalyticsService() as unknown as Services['analytics'],
    intelligence: new DefaultImageIntelligenceService(),
  });
}

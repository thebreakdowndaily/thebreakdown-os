import { initServices } from './registry';
import type { Services } from './registry';
import type { Story, Topic, Entity, Timeline, Fix, Dataset, MediaItem } from '@/types/canonical';

import { MemorySearchService } from './search/service';
import { PluginAnalyticsService } from './analytics/service';
import { MemoryGraphProjectionService } from './graph/service';
import { MemoryMonitorService, registerAllWatchers } from './monitoring/service';
import { RepositoryFactory } from './factory/repository';
import { DefaultImageIntelligenceService } from './media/intelligence';

import { KnowledgeEntityService } from './entities/service';
import { KnowledgeEntityPipeline } from './entities/pipeline';
import { AssetResolver } from './media/resolver';
import { RelationshipBuilder } from './entities/builders/relationship';
import { TimelineBuilder } from './entities/builders/timeline';
import { ClaimBuilder } from './entities/builders/claims';
import { SignalBuilder } from './entities/builders/signals';
import { StatisticsBuilder } from './entities/builders/statistics';

function createMonitorService(): MemoryMonitorService {
  const svc = new MemoryMonitorService();
  registerAllWatchers(svc);
  svc.runAllChecks();
  return svc;
}

function createEntityPipeline(): KnowledgeEntityPipeline {
  return new KnowledgeEntityPipeline()
    .addBuilder(new AssetResolver())
    .addBuilder(new RelationshipBuilder())
    .addBuilder(new TimelineBuilder())
    .addBuilder(new ClaimBuilder())
    .addBuilder(new SignalBuilder())
    .addBuilder(new StatisticsBuilder());
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
    stories: RepositoryFactory.getStoryRepository(seedStories),
    topics: RepositoryFactory.getTopicRepository(seedTopics),
    entities: new KnowledgeEntityService(RepositoryFactory.getEntityRepository(seedEntities), createEntityPipeline()),
    timelines: RepositoryFactory.getTimelineRepository(seedTimelines),
    fixes: RepositoryFactory.getFixRepository(seedFixes),
    datasets: RepositoryFactory.getDatasetRepository(seedDatasets),
    media: RepositoryFactory.getMediaRepository(seedMedia),
    search: new MemorySearchService(),
    analytics: new PluginAnalyticsService(),
    intelligence: new DefaultImageIntelligenceService(),
  });
}

// ── Canonical / DB-backed (for API routes & production runtime) ─────────

export function initCanonicalServices(): Services {
  return buildWithGraph({
    stories: RepositoryFactory.getStoryRepository(),
    topics: RepositoryFactory.getTopicRepository([]),
    entities: new KnowledgeEntityService(RepositoryFactory.getEntityRepository([]), createEntityPipeline()),
    timelines: RepositoryFactory.getTimelineRepository([]),
    fixes: RepositoryFactory.getFixRepository([]),
    datasets: RepositoryFactory.getDatasetRepository([]),
    media: RepositoryFactory.getMediaRepository([]),
    search: new MemorySearchService(),
    analytics: new PluginAnalyticsService(),
    intelligence: new DefaultImageIntelligenceService(),
  });
}

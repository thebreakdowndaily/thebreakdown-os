import type { StoryService } from './interfaces/story';
import type { TopicService } from './interfaces/topic';
import type { EntityService } from './interfaces/entity';
import type { TimelineService } from './interfaces/timeline';
import type { FixService } from './interfaces/fix';
import type { DatasetService } from './interfaces/dataset';
import type { MediaService } from './interfaces/media';
import type { InvestigationService } from './interfaces/investigation';
import type { SearchService } from './search/service';
import type { AnalyticsService } from './analytics/service';
import type { GraphProjectionService } from './graph/service';
import type { MonitorService } from './monitoring/service';
import type { ImageIntelligenceService } from './media/intelligence';

export interface Services {
  stories: StoryService;
  topics: TopicService;
  entities: EntityService;
  timelines: TimelineService;
  fixes: FixService;
  datasets: DatasetService;
  media: MediaService;
  investigations: InvestigationService;
  search: SearchService;
  analytics: AnalyticsService;
  graph: GraphProjectionService;
  monitoring: MonitorService;
  intelligence: ImageIntelligenceService;
}

let instance: Services | null = null;

export function getServices(): Services {
  if (!instance) throw new Error('Services not initialized');
  return instance;
}

export function initServices(s: Services): void {
  instance = s;
}

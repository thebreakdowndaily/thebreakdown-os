import type { StoryService } from './stories/service';
import type { TopicService } from './topics/service';
import type { EntityService } from './entities/service';
import type { TimelineService } from './timelines/service';
import type { FixService } from './fixes/service';
import type { DatasetService } from './datasets/service';
import type { MediaService } from './media/service';
import type { SearchService } from './search/service';
import type { AnalyticsService } from './analytics/service';
import type { GraphProjectionService } from './graph/service';
import type { MonitorService } from './monitoring/service';

export interface Services {
  stories: StoryService;
  topics: TopicService;
  entities: EntityService;
  timelines: TimelineService;
  fixes: FixService;
  datasets: DatasetService;
  media: MediaService;
  search: SearchService;
  analytics: AnalyticsService;
  graph: GraphProjectionService;
  monitoring: MonitorService;
}

let instance: Services | null = null;

export function getServices(): Services {
  if (!instance) throw new Error('Services not initialized');
  return instance;
}

export function initServices(s: Services): void {
  instance = s;
}

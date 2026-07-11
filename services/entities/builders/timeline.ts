import { EntityBase, Entity, TimelineEvent } from '@/types/canonical';
import { EntityBuilder } from '../pipeline';

/**
 * TimelineBuilder
 * 
 * Generates an event timeline deterministically from the raw entity's legacy timeline or linked stories.
 */
export class TimelineBuilder implements EntityBuilder {
  build(base: EntityBase, rawContext: Entity): EntityBase {
    // If the legacy entity has a timeline, pass it through and enrich it.
    // In a real system, this would query the TimelineService using relatedStoryIds, documents, and media.
    let timeline: TimelineEvent[] = [];

    if (rawContext.timeline && rawContext.timeline.length > 0) {
      timeline = rawContext.timeline.map((event, index) => ({
        ...event,
        // Ensure every event has a stable ID
        id: event.id || `evt-${base.slug}-${index}`,
      }));
    }

    return {
      ...base,
      timeline: [...(base.timeline || []), ...timeline]
    };
  }
}

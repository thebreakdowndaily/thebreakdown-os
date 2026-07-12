import type { Topic, TimelineEvent, Story } from '@/types/canonical';
import type { KnowledgeTopic, TopicAggregator } from './builder';
import { getServices } from '@/services/registry';

export class TimelineAggregator implements TopicAggregator {
  async aggregate(topic: Topic, currentKnowledge: KnowledgeTopic): Promise<KnowledgeTopic> {
    const storyPromises = topic.storyIds.map(id => getServices().stories.getStory(id));
    const storiesResult = await Promise.all(storyPromises);
    const stories = storiesResult.filter((s): s is Story => !!s);

    const eventsMap = new Map<string, TimelineEvent>();

    // 1. Topic native timeline
    if (topic.timeline) {
      topic.timeline.forEach(event => eventsMap.set(event.date + event.title, event));
    }

    // 2. Stories timeline
    stories.forEach(story => {
      if (story.timeline) {
        story.timeline.forEach((event: TimelineEvent) => eventsMap.set(event.date + event.title, event));
      }
    });

    // 3. Entity timelines (from directly related entities on the topic)
    for (const eid of topic.relatedEntityIds) {
      const entity = await getServices().entities.getEntity(eid);
      if (entity && entity.timeline) {
        entity.timeline.forEach(event => eventsMap.set(event.date + event.title, event));
      }
    }

    const unifiedTimeline = Array.from(eventsMap.values())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
      topic,
      unifiedTimeline
    };
  }
}

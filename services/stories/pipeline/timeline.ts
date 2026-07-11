import { KnowledgeStory, StoryBuilder } from './builder';

export class TimelineBuilder implements StoryBuilder {
  async build(story: KnowledgeStory): Promise<KnowledgeStory> {
    const s = story.raw;
    const timeline = [];

    // Add story's own timeline
    if (s.timeline) {
      timeline.push(...s.timeline.map(t => ({ ...t, source: 'story' })));
    }

    // Add entities' timelines
    if (story.resolvedEntities?.primary?.timeline) {
      timeline.push(...story.resolvedEntities.primary.timeline.map((t: any) => ({ ...t, source: 'entity' })));
    }

    story.unifiedTimeline = timeline.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return story;
  }
}

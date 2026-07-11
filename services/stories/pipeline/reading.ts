import { KnowledgeStory, StoryBuilder } from './builder';
import { buildQuickView, buildDeepView } from '@/lib/view-models/story-builders';

export class ReadingBuilder implements StoryBuilder {
  async build(story: KnowledgeStory): Promise<KnowledgeStory> {
    const s = story.raw;
    
    // Quick View
    const quick = buildQuickView(s);

    // Deep View
    const deep = buildDeepView(s);

    story.readingViews = {
      quick,
      standard: s,
      deep
    };

    return story;
  }
}

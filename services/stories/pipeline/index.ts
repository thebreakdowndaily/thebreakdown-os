import { KnowledgeStory, StoryBuilder } from './builder';
import type { Story } from '@/types/canonical';

export class KnowledgeStoryPipeline {
  private builders: StoryBuilder[] = [];

  add(builder: StoryBuilder): this {
    this.builders.push(builder);
    return this;
  }

  async execute(rawStory: Story): Promise<KnowledgeStory> {
    let context: KnowledgeStory = {
      raw: rawStory
    };

    for (const builder of this.builders) {
      context = await builder.build(context);
    }

    return context;
  }
}

import { KnowledgeStory, StoryBuilder } from './builder';
import { AssetResolverChain } from '@/services/media/pipeline/resolver';

export class VisualIntelligenceBuilder implements StoryBuilder {
  private resolverChain = new AssetResolverChain();

  async build(story: KnowledgeStory): Promise<KnowledgeStory> {
    const primaryEntities = story.resolvedEntities?.primary ? [story.resolvedEntities.primary] : [];
    const supportingEntities = story.resolvedEntities?.supporting || [];
    
    // Also include the story slug as context, or fallback to topics if available
    const topics = []; // Could be populated if topics are resolved before visuals
    
    const context = {
      storySlug: story.raw.slug,
      primaryEntities,
      supportingEntities,
      topics
    };

    const visualAssets = await this.resolverChain.resolve(context);

    story.visualAssets = visualAssets;

    return story;
  }
}

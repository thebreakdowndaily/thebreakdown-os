import type { Story, StoryPageViewModel } from '@/types/canonical';

export interface KnowledgeStory {
  raw: Story;
  
  // Enriched Properties
  // Visual Intelligence
  visualAssets?: {
    hero?: any;
    primary: any[];
    supporting: any[];
    gallery: any[];
    logos: any[];
    portraits: any[];
    maps: any[];
    charts: any[];
    documents: any[];
  };
  
  resolvedEntities?: {
    primary: any;
    supporting: any[];
  };

  unifiedTimeline?: any[];
  
  readingViews?: {
    quick: any;
    standard: any;
    deep: any;
  };

  qualityScore?: any;
}

export interface StoryBuilder {
  build(story: KnowledgeStory): Promise<KnowledgeStory>;
}

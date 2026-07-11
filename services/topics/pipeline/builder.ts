import type { Topic, Story, Entity, TimelineEvent } from '@/types/canonical';

export interface KnowledgeTopic {
  topic: Topic;
  storyGroups?: {
    latest: Story[];
    important: Story[];
    highestEvidence: Story[];
    trending: Story[];
    historical: Story[];
    recommended: Story[];
  };
  rankedEntities?: {
    entity: Entity;
    score: number;
    importance: 'Critical' | 'High' | 'Medium' | 'Low';
  }[];
  unifiedTimeline?: TimelineEvent[];
  statistics?: {
    coverageTrend: number;
    evidenceGrowth: number;
    averageConfidence: number;
    totalEntities: number;
    totalClaims: number;
    totalMediaAssets: number;
    totalSources: number;
    totalCountries: number;
    totalOrganizations: number;
    totalPeople: number;
  };
  qualityScore?: {
    score: number;
    status: 'Excellent' | 'Good' | 'Needs Review';
    coverageCompleteness: number;
    missingStories: string[];
    weakEvidence: string[];
    missingTimeline: string[];
    missingMedia: string[];
    brokenLinks: string[];
  };
}

export interface TopicAggregator {
  aggregate(topic: Topic, currentKnowledge: KnowledgeTopic): Promise<KnowledgeTopic>;
}

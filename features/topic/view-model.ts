import type { TopicTerminalViewModel } from '@/types/canonical';
import type { Services } from '@/services/registry';
import { KnowledgeTopicPipeline } from '@/services/topics/pipeline';
import { StoryAggregator } from '@/services/topics/pipeline/stories';
import { EntityAggregator } from '@/services/topics/pipeline/entities';
import { TimelineAggregator } from '@/services/topics/pipeline/timeline';
import { StatisticsAggregator } from '@/services/topics/pipeline/statistics';
import { TopicQualityAggregator } from '@/services/topics/pipeline/quality';

export async function buildTopicPage(services: Services, slug: string): Promise<TopicTerminalViewModel | null> {
  const topic = await services.topics.getTopicBySlug(slug);
  if (!topic) return null;

  const pipeline = new KnowledgeTopicPipeline()
    .add(new StoryAggregator())
    .add(new EntityAggregator())
    .add(new TimelineAggregator())
    .add(new StatisticsAggregator())
    .add(new TopicQualityAggregator());

  const knowledgeTopic = await pipeline.execute(topic);

  return {
    topic: knowledgeTopic.topic,
    storyGroups: knowledgeTopic.storyGroups || {
      latest: [], important: [], highestEvidence: [], trending: [], historical: [], recommended: []
    },
    rankedEntities: knowledgeTopic.rankedEntities || [],
    unifiedTimeline: knowledgeTopic.unifiedTimeline || [],
    statistics: knowledgeTopic.statistics || {
      coverageTrend: 0, evidenceGrowth: 0, averageConfidence: 0, totalEntities: 0,
      totalClaims: 0, totalMediaAssets: 0, totalSources: 0, totalCountries: 0,
      totalOrganizations: 0, totalPeople: 0
    },
    qualityScore: knowledgeTopic.qualityScore || {
      score: 0, status: 'Needs Review', coverageCompleteness: 0,
      missingStories: [], weakEvidence: [], missingTimeline: [], missingMedia: [], brokenLinks: []
    },
    seo: { title: topic.name, description: topic.description },
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: 'Topics', href: '/topics' },
      { label: topic.name, href: `/topic/${topic.slug}` },
    ],
  };
}

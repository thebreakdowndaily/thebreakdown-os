import type { Story, Topic, Entity, Fix, TimelineEvent, ChartDef, StoryBlock } from '@/types/canonical';
import type {
  APIStory, APIAuthor, APITimelineEvent, APIFact, APIClaim, APISource, APIChart, APIGeoData,
  APIFix, APIFixSection, APIGlobalExample, APIFixAction, APIMetric, APIRelatedStory, APIRelatedEntity,
  APITopic, APIFAQItem,
} from '@/utils/data-layer/types';

function extractBlockData(story: Story, type: string): Record<string, unknown> | undefined {
  return story.blocks.find((b) => b.type === type)?.data as Record<string, unknown> | undefined;
}

export function storyToAPIStory(s: Story): APIStory {
  const execSummary = extractBlockData(s, 'executive-summary');
  const evidenceBlock = extractBlockData(s, 'evidence');
  const keyNumbers = extractBlockData(s, 'key-numbers');
  const timelineData = extractBlockData(s, 'timeline');
  const relatedBlock = extractBlockData(s, 'related-intelligence');

  return {
    id: s.id,
    slug: s.slug,
    headline: s.headline,
    summary: s.summary,
    heroImage: s.heroImage || undefined,
    publishedAt: s.publishedAt,
    updatedAt: s.updatedAt,
    readingTime: s.readingTime,
    author: { name: s.author } as APIAuthor,
    evidenceScore: s.evidenceScore,
    category: s.category,
    tags: s.tags,
    keyPoints: (execSummary?.keyPoints as string[]) || [],
    timeline: (timelineData?.events as APITimelineEvent[]) || [],
    facts: (keyNumbers?.items as APIFact[]) || [],
    claims: (evidenceBlock?.claims as APIClaim[]) || [],
    sources: s.sources.map((src): APISource => ({ name: src.title, url: src.url, type: 'government', tier: src.tier })),
    charts: s.charts.map((c): APIChart => ({ type: c.chartType, title: c.title, data: c.data.map((d) => ({ label: d.label, value: d.value })), xKey: 'label', yKey: 'value' })),
    faq: s.faq.map((f): APIFAQItem => ({ question: f.question, answer: f.answer })),
    relatedStories: (relatedBlock?.stories as APIRelatedStory[]) || [],
    relatedEntities: (relatedBlock?.entities as APIRelatedEntity[]) || [],
    relatedTopicIds: s.relatedTopicIds,
    relatedEntityIds: s.relatedEntityIds,
  };
}

export function fixToAPIFix(f: Fix): APIFix {
  return {
    id: f.id,
    slug: f.slug,
    storySlug: f.slug,
    headline: f.title,
    summary: f.problem.slice(0, 200),
    publishedAt: f.createdAt,
    updatedAt: f.updatedAt,
    readingTime: 5,
    author: { name: 'The Breakdown Editorial' },
    evidenceScore: 80,
    tags: [],
    problem: { title: f.problem.slice(0, 100), content: f.problem },
    whoIsAffected: { title: 'Who Is Affected', content: '' },
    rootCauses: { title: 'Root Causes', content: f.rootCauses.join('. ') },
    existingSolutions: f.existingSolutions.map((s) => ({ name: s.title, description: s.description, status: 'active', source: s.link })),
    evidence: { title: 'Evidence', content: '' },
    stakeholders: [],
    globalExamples: f.globalExamples.map((g): APIGlobalExample => ({
      country: g.country, policy: g.approach, description: g.outcome, outcome: g.outcome, source: g.link,
    })),
    recommendedActions: f.recommendedActions.map((a): APIFixAction => ({
      title: a.action || '', description: '', priority: 'medium', timeframe: 'medium-term', actors: a.responsible ? [a.responsible] : [],
    })),
    citizenActions: f.citizenActions.map((a): APIFixAction => ({
      title: a, description: '', priority: 'medium', timeframe: 'medium-term', actors: [],
    })),
    governmentActions: f.governmentActions.map((a): APIFixAction => ({
      title: a, description: '', priority: 'high', timeframe: 'medium-term', actors: ['Government'],
    })),
    metricsToTrack: f.metrics.map((m): APIMetric => ({
      name: m.metric, currentValue: m.currentValue, targetValue: m.targetValue, dataSource: m.source || '', updateFrequency: '',
    })),
    relatedStories: [],
    relatedEntities: [],
  };
}

export function topicToAPITopic(t: Topic): APITopic {
  const entityCount = t.relatedEntityIds.length;
  return {
    id: t.id,
    slug: t.slug,
    name: t.name,
    description: t.description,
    storyCount: t.storyIds.length,
    entityCount,
    updatedAt: t.updatedAt,
    stories: [],
    entities: [],
  };
}

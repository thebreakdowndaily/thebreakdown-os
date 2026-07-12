import type { Story, Topic, Entity, StoryTerminalViewModel, TOCItem } from '@/types/canonical';
import type { Services } from '@/services/registry';
import { KnowledgeStoryPipeline } from '@/services/stories/pipeline';
import { VisualIntelligenceBuilder } from '@/services/stories/pipeline/visuals';
import { EntityBuilder } from '@/services/stories/pipeline/entities';
import { TimelineBuilder } from '@/services/stories/pipeline/timeline';
import { ReadingBuilder } from '@/services/stories/pipeline/reading';
import { QualityBuilder } from '@/services/stories/pipeline/quality';

function buildTOC(story: Story): TOCItem[] {
  const items: TOCItem[] = [{ id: 'executive-brief', label: 'Executive Brief', level: 1 }];

  if (story.timeline && story.timeline.length > 0) {
    items.push({ id: 'timeline', label: 'Timeline', level: 1 });
  }

  if (story.claims && story.claims.length > 0) {
    items.push({ id: 'evidence', label: 'Evidence', level: 1 });
  }

  if (story.faq && story.faq.length > 0) {
    items.push({ id: 'faq', label: 'FAQ', level: 1 });
  }

  if (story.sources && story.sources.length > 0) {
    items.push({ id: 'sources', label: 'Sources', level: 1 });
  }

  if (story.charts && story.charts.length > 0) {
    items.push({ id: 'charts', label: 'Charts & Data', level: 1 });
  }

  return items;
}

export async function buildStoryPage(services: Services, slug: string): Promise<StoryTerminalViewModel | null> {
  const rawStory = await services.stories.getStoryBySlug(slug);

  if (!rawStory) return null;

  // Initialize pipeline
  const pipeline = new KnowledgeStoryPipeline()
    .add(new EntityBuilder())
    .add(new VisualIntelligenceBuilder())
    .add(new TimelineBuilder())
    .add(new ReadingBuilder())
    .add(new QualityBuilder());

  const knowledgeStory = await pipeline.execute(rawStory);

  const relatedStoriesPromises = rawStory.relatedStoryIds.map(id => services.stories.getStory(id));
  const relatedStoriesResult = await Promise.all(relatedStoriesPromises);
  const relatedStories = relatedStoriesResult.filter((s): s is Story => !!s);
  const relatedTopicsPromises = rawStory.relatedTopicIds.map(id => services.topics.getTopic(id));
  const relatedTopics = (await Promise.all(relatedTopicsPromises)).filter((t): t is Topic => !!t);
  
  // Entities are now pre-resolved by the EntityBuilder
  const relatedEntities = [
    ...(knowledgeStory.resolvedEntities?.primary ? [knowledgeStory.resolvedEntities.primary] : []),
    ...(knowledgeStory.resolvedEntities?.supporting || [])
  ];
  
  const verified = rawStory.claims.filter(c => c.status === 'verified' || c.status === 'strong').length;
  const misleading = rawStory.claims.filter(c => c.status === 'unverified').length;
  const unverifiable = rawStory.claims.length - verified - misleading;
  const sourceTierBreakdown = rawStory.sources.reduce((acc, src) => {
    acc[src.tier] = (acc[src.tier] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  return {
    story: rawStory,
    relatedStories,
    relatedTopics,
    relatedEntities,
    seo: { title: rawStory.headline, description: rawStory.summary },
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: rawStory.title, href: `/story/${rawStory.slug}` },
    ],
    tableOfContents: buildTOC(rawStory),
    snapshot: {
      status: rawStory.status || 'published',
      category: rawStory.category,
      location: rawStory.location,
      stakeholders: rawStory.stakeholderNames || [],
      costValue: rawStory.costValue,
      impactLevel: rawStory.impactLevel,
      legislation: rawStory.legislation,
      lastUpdated: rawStory.updatedAt,
    },
    executiveBrief: {
      takeaway: rawStory.takeaway || rawStory.summary,
      keyPoints: rawStory.blocks.find(b => b.type === 'executive-summary')?.data['keyPoints'] as string[] || [],
      whoIsAffected: rawStory.whoIsAffected,
      impactLevel: rawStory.impactLevel,
    },
    evidenceSummary: {
      overallScore: rawStory.confidenceBreakdown?.overallScore || rawStory.evidenceScore,
      sourceQuality: rawStory.confidenceBreakdown?.sourceQuality || 0,
      confirmations: rawStory.confidenceBreakdown?.confirmations || 0,
      dataAvailability: rawStory.confidenceBreakdown?.dataAvailability || 0,
      verificationStatus: rawStory.confidenceBreakdown?.verificationStatus || 0,
      totalClaims: rawStory.claims.length,
      verified,
      misleading,
      unverifiable,
      sourceTierBreakdown,
    },
    
    // Properties from Pipeline Builders
    quickView: knowledgeStory.readingViews?.quick,
    deepView: knowledgeStory.readingViews?.deep,
    visualAssets: knowledgeStory.visualAssets || {
      primary: [],
      supporting: [],
      gallery: [],
      logos: [],
      portraits: [],
      maps: [],
      charts: [],
      documents: []
    },
    unifiedTimeline: knowledgeStory.unifiedTimeline || [],
    qualityScore: knowledgeStory.qualityScore || { score: 0, issues: ['Failed pipeline'], status: 'Needs Review' }
  };
}

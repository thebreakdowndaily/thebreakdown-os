import type { Story, Topic, Entity, StoryPageViewModel, TOCItem } from '@/types/canonical';
import type { Services } from '@/services/registry';
import { buildQuickView, buildDeepView } from '@/lib/view-models/story-builders';

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

export function buildStoryPage(services: Services, slug: string): StoryPageViewModel | null {
  const story = services.stories.getStoryBySlug(slug);
  if (!story) return null;
  const relatedStories = story.relatedStoryIds.map(id => services.stories.getStory(id)).filter(Boolean) as Story[];
  const relatedTopics = story.relatedTopicIds.map(id => services.topics.getTopic(id)).filter(Boolean) as Topic[];
  const relatedEntities = story.relatedEntityIds.map(id => services.entities.getEntity(id)).filter(Boolean) as Entity[];
  
  const verified = story.claims.filter(c => c.status === 'verified' || c.status === 'strong').length;
  const misleading = story.claims.filter(c => c.status === 'unverified').length;
  const unverifiable = story.claims.length - verified - misleading;
  const sourceTierBreakdown = story.sources.reduce((acc, src) => {
    acc[src.tier] = (acc[src.tier] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  return {
    story,
    relatedStories,
    relatedTopics,
    relatedEntities,
    seo: { title: story.headline, description: story.summary },
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: story.title, href: `/story/${story.slug}` },
    ],
    tableOfContents: buildTOC(story),
    snapshot: {
      status: story.status || 'published',
      category: story.category,
      location: story.location,
      stakeholders: story.stakeholderNames || [],
      costValue: story.costValue,
      impactLevel: story.impactLevel,
      legislation: story.legislation,
      lastUpdated: story.updatedAt,
    },
    executiveBrief: {
      takeaway: story.takeaway || story.summary,
      keyPoints: story.blocks.find(b => b.type === 'executive-summary')?.data['keyPoints'] as string[] || [],
      whoIsAffected: story.whoIsAffected,
      impactLevel: story.impactLevel,
    },
    evidenceSummary: {
      overallScore: story.confidenceBreakdown?.overallScore || story.evidenceScore,
      sourceQuality: story.confidenceBreakdown?.sourceQuality || 0,
      confirmations: story.confidenceBreakdown?.confirmations || 0,
      dataAvailability: story.confidenceBreakdown?.dataAvailability || 0,
      verificationStatus: story.confidenceBreakdown?.verificationStatus || 0,
      totalClaims: story.claims.length,
      verified,
      misleading,
      unverifiable,
      sourceTierBreakdown,
    },
    quickView: buildQuickView(story),
    deepView: buildDeepView(story),
  };
}

import type { Services } from '@/services/registry';
import { KnowledgeStoryPipeline } from '@/services/stories/pipeline';
import { EntityBuilder } from '@/services/stories/pipeline/entities';
import { VisualIntelligenceBuilder } from '@/services/stories/pipeline/visuals';
import { TimelineBuilder } from '@/services/stories/pipeline/timeline';
import { QualityBuilder } from '@/services/stories/pipeline/quality';
import { EditorialTask } from '@/types/canonical';

export interface EditorialDashboardData {
  platformHealth: {
    storiesPublished: number;
    drafts: number;
    needsReview: number;
    averageScore: number;
    averageVisualScore: number;
  };
  editorialQueue: EditorialTask[];
  sourceMonitoring: {
    totalSources: number;
    activeSources: number;
    failingSources: number;
    updatesToday: number;
  };
  systemStatus: {
    scheduler: string;
    registry: string;
    engine: string;
  };
  stories: Array<{
    id: string;
    title: string;
    slug: string;
    status: string;
    score: number;
    visual: number;
    evidence: number;
    timeline: number;
    seo: number;
    accessibility: number;
    updatedAt: string;
    editor: string;
    publishReady: boolean;
    checklist: any;
    issues: Array<{ level: string; message: string }>;
  }>;
  mediaHealth: {
    missingHero: number;
    missingGallery: number;
    brokenImages: number;
    duplicateImages: number;
    lowRes: number;
    missingAttribution: number;
  };
  knowledgeHealth: {
    brokenEntityLinks: number;
    missingTopics: number;
    weakRelationships: number;
    unverifiedClaims: number;
    missingTimelineEvents: number;
  };
  seoHealth: {
    missingDescription: number;
    missingOgImage: number;
    missingJsonLd: number;
    duplicateTitle: number;
    shortContent: number;
    brokenCanonical: number;
  };
  accessibilityHealth: {
    missingAltText: number;
    headingOrder: number;
    contrast: number;
    keyboard: number;
    aria: number;
    captions: number;
  };
}

export async function buildEditorialDashboard(services: Services): Promise<EditorialDashboardData> {
  const rawStories = (await services.stories.getStories({ pageSize: 100 })).data;
  const entities = (await services.entities.getEntities()).data;
  const topics = (await services.topics.getTopics()).data;

  const pipeline = new KnowledgeStoryPipeline()
    .add(new EntityBuilder())
    .add(new VisualIntelligenceBuilder())
    .add(new TimelineBuilder())
    .add(new QualityBuilder());

  const processedStories = await Promise.all(rawStories.map(s => pipeline.execute(s)));

  let totalScore = 0;
  let totalVisualScore = 0;
  let missingHero = 0;
  let missingGallery = 0;
  let missingDescription = 0;
  let missingOgImage = 0;
  let missingAltText = 0;
  let unverifiedClaims = 0;

  const stories = processedStories.map(story => {
    const qs = story.qualityScore;
    const sub = qs.subScores;
    const check = qs.checklist;

    totalScore += qs.score;
    totalVisualScore += sub.visuals;

    if (!check.heroImage) missingHero++;
    if (!check.gallery) missingGallery++;
    if (!check.summary) missingDescription++;
    if (!check.socialImage) missingOgImage++;
    if (sub.accessibility < 100) missingAltText++;
    
    unverifiedClaims += (story.raw.claims?.filter(c => c.status !== 'verified').length || 0);

    return {
      id: story.raw.id,
      title: story.raw.headline,
      slug: story.raw.slug,
      status: story.raw.status,
      score: qs.score,
      visual: sub.visuals,
      evidence: sub.evidence,
      timeline: sub.timeline,
      seo: sub.seo,
      accessibility: sub.accessibility,
      updatedAt: story.raw.updatedAt,
      editor: story.raw.author || 'System',
      publishReady: qs.score >= 90,
      checklist: check,
      issues: qs.issues
    };
  });

  const avgScore = stories.length > 0 ? Math.round(totalScore / stories.length) : 0;
  const avgVisual = stories.length > 0 ? Math.round(totalVisualScore / stories.length) : 0;

  const mockTasks: EditorialTask[] = [
    {
      id: 'task-1',
      title: 'RBI Repo Rate Update Detected',
      priority: 'critical',
      severity: 'blocker',
      owner: 'Editor - Finance',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deadline: new Date(Date.now() + 86400000).toISOString(),
      evidence: { sourceId: 'src-rbi', diffSummary: 'Repo rate changed from 6.5% to 6.25%' },
      affectedContent: { stories: ['story-123'], topics: ['Economy'], entities: ['rbi'], claims: [] },
      status: 'pending'
    },
    {
      id: 'task-2',
      title: 'Supreme Court Verdict on Electoral Bonds',
      priority: 'high',
      severity: 'major',
      owner: 'Editor - Law',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deadline: new Date(Date.now() + 86400000).toISOString(),
      evidence: { sourceId: 'src-sc', diffSummary: 'New judgment uploaded' },
      affectedContent: { stories: ['story-456'], topics: ['Law'], entities: ['sc'], claims: [] },
      status: 'assigned'
    }
  ];

  return {
    platformHealth: {
      storiesPublished: rawStories.filter(s => s.status === 'published').length,
      drafts: rawStories.filter(s => s.status === 'draft').length,
      needsReview: rawStories.filter(s => s.status === 'review').length,
      averageScore: avgScore,
      averageVisualScore: avgVisual
    },
    editorialQueue: mockTasks,
    sourceMonitoring: {
      totalSources: 45,
      activeSources: 42,
      failingSources: 3,
      updatesToday: 12
    },
    systemStatus: {
      scheduler: 'Operational',
      registry: 'Operational',
      engine: 'Operational'
    },
    stories,
    mediaHealth: {
      missingHero,
      missingGallery,
      brokenImages: 0,
      duplicateImages: 0,
      lowRes: 0,
      missingAttribution: 0
    },
    knowledgeHealth: {
      brokenEntityLinks: 0,
      missingTopics: rawStories.filter(s => !s.relatedTopicIds?.length).length,
      weakRelationships: entities.filter(e => e.evidenceScore < 50).length,
      unverifiedClaims,
      missingTimelineEvents: rawStories.filter(s => !s.timeline?.length).length
    },
    seoHealth: {
      missingDescription,
      missingOgImage,
      missingJsonLd: 0,
      duplicateTitle: 0,
      shortContent: rawStories.filter(s => s.readingTime < 1).length,
      brokenCanonical: 0
    },
    accessibilityHealth: {
      missingAltText,
      headingOrder: 0,
      contrast: 0,
      keyboard: 0,
      aria: 0,
      captions: 0
    }
  };
}

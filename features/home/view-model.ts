import type { Story, PageSection, Entity, Topic } from '@/types/canonical';
import type { Services } from '@/services/registry';
import { KnowledgeStoryPipeline } from '@/services/stories/pipeline';
import { VisualIntelligenceBuilder } from '@/services/stories/pipeline/visuals';
import { QualityBuilder } from '@/services/stories/pipeline/quality';
import { TimelineBuilder } from '@/services/stories/pipeline/timeline';
import { EntityBuilder } from '@/services/stories/pipeline/entities';

export interface HomepageData {
  seo: { title: string; description: string; canonical: string; ogType: string };
  topStory: any | null;
  stories: any[];
  trendingTopics: Topic[];
  breakingIntelligence: Array<{ category: string; title: string; href: string }>;
  knowledgeToday: { stories: number; entities: number; topics: number; claimsVerified: number; datasetsUpdated: number };
  entitySpotlights: Entity[];
  dataDashboard: { 
    evidenceGrowth: string; 
    coverageTrend: string; 
    countries: number; 
    organizations: number; 
    people: number; 
    mediaAssets: number; 
  };
}

export async function buildHomepage(services: Services): Promise<HomepageData> {
  const allStoriesRaw = [...(await services.stories.getStories({ pageSize: 100 })).data]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  
  const topStoryCanonical = allStoriesRaw[0];
  const storiesCanonical = allStoriesRaw.slice(1, 7); // Latest 6 stories for the grid
  
  // We need to run the pipeline to get visual intelligence and quality scores
  const pipeline = new KnowledgeStoryPipeline()
    .add(new EntityBuilder())
    .add(new VisualIntelligenceBuilder())
    .add(new TimelineBuilder())
    .add(new QualityBuilder());

  const topStory = topStoryCanonical ? await pipeline.execute(topStoryCanonical) : null;
  const stories = await Promise.all(storiesCanonical.map(s => pipeline.execute(s)));
  
  const topicsData = (await services.topics.getTopics()).data;
  const trendingTopics = topicsData.slice(0, 5);
  
  // Computations for new sections
  const breakingIntelligence = allStoriesRaw.slice(1, 5).map(s => ({
    category: s.category || 'News',
    title: s.headline,
    href: `/story/${s.slug}`
  }));
  
  const entitiesData = (await services.entities.getEntities()).data;
  // Spotlighting 3 entities (Today, This Week, Trending)
  const entitySpotlights = entitiesData.slice(0, 3);
  
  let claimsVerified = 0;
  let sourcesIndexed = 0;
  let evidenceGrowth = 15; // mock +15%
  let coverageTrend = 8; // mock +8%
  let totalMediaAssets = 120; // mock count
  let totalCountries = 0;
  let totalOrganizations = 0;
  let totalPeople = 0;
  
  allStoriesRaw.forEach(s => {
    claimsVerified += (s.claims?.filter(c => c.status === 'verified').length || 0);
    sourcesIndexed += (s.sources?.length || 0);
  });
  
  entitiesData.forEach(e => {
    if (e.type === 'country') totalCountries++;
    if (e.type === 'organization') totalOrganizations++;
    if (e.type === 'person') totalPeople++;
  });
  
  // Calculate today's impact
  const today = new Date(Date.now() - 86400000);
  const storiesToday = allStoriesRaw.filter(s => new Date(s.publishedAt) >= today).length;
  
  const knowledgeToday = {
    stories: storiesToday || 5, // Fallback if local data has no recent stories
    entities: 12, // Mocked for demonstration
    topics: 3,
    claimsVerified: 18,
    datasetsUpdated: 2
  };
  
  const dataDashboard = {
    evidenceGrowth: `+${evidenceGrowth}%`,
    coverageTrend: `+${coverageTrend}%`,
    countries: totalCountries || 12,
    organizations: totalOrganizations || 45,
    people: totalPeople || 89,
    mediaAssets: totalMediaAssets || 342,
  };

  return {
    seo: { title: 'The Breakdown — India Explained', description: 'Independent, data-driven journalism on Indian policy, politics, and society.', canonical: 'https://thebreakdown.in', ogType: 'website' },
    topStory,
    stories,
    trendingTopics,
    breakingIntelligence,
    knowledgeToday,
    entitySpotlights,
    dataDashboard
  };
}

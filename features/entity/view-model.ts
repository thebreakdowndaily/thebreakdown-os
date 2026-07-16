import type { Story, Topic, Entity, EntityPageViewModel, Dataset, EntityBase, EntityTerminalViewModel } from '@/types/canonical';
import type { Services } from '@/services/registry';

export async function buildEntityPage(services: Services, slug: string): Promise<EntityPageViewModel | null> {
  const entity = await services.entities.getEntityBySlug(slug);
  if (!entity) return null;
  const relatedStoriesPromises = (entity as any).relatedStoryIds?.map((id: string) => services.stories.getStory(id)) || [];
  const relatedStoriesResult = await Promise.all(relatedStoriesPromises);
  const stories = relatedStoriesResult.filter(Boolean) as Story[];
  const relatedEntitiesPromises = (entity.relationships || []).map(r => services.entities.getEntity(r.targetId));
  const relatedEntities = (await Promise.all(relatedEntitiesPromises)).filter((e): e is EntityBase => !!e);
  // Fallback to legacy relatedTopicIds if relationships don't map topics yet
  const relatedTopicsPromises = (entity as any).relatedTopicIds?.map((id: string) => services.topics.getTopic(id)) || [];
  const relatedTopics = (await Promise.all(relatedTopicsPromises)).filter((t): t is Topic => !!t);
  
  // The pipeline attaches signals. If missing, provide a safe fallback.
  const signals = (entity as any).signals || {
    lastMentioned: new Date().toISOString(),
    mentionVelocity: 0,
    coverageTrend: 'flat',
    rank: 0,
  };

  return {
    entity,
    stories,
    relatedEntities,
    relatedTopics,
    signals,
    seo: { title: entity.name, description: entity.description },
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: entity.name, href: `/entity/${entity.slug}` },
    ],
  };
}

import { RepositoryFactory } from '@/services/factory/repository';
import { getKnowledgeLibrarySeedData } from '@/utils/data-layer/knowledge-library-data';
import type { Investigation } from '@/types/canonical';

export interface EntityTerminalExtendedViewModel extends EntityTerminalViewModel {
  relatedChapters: Array<{ slug: string; title: string; summary: string; collectionSlug: string; volumeSlug: string }>;
  relatedInvestigations: Investigation[];
}

export async function buildEntityTerminalViewModel(services: Services, slug: string): Promise<EntityTerminalExtendedViewModel | null> {
  const entity = await services.entities.getEntityBySlug(slug);
  if (!entity) return null;
  
  const terminalStoriesPromises = (entity.usageGraph?.stories || []).map(id => services.stories.getStory(id));
  const terminalStoriesResult = await Promise.all(terminalStoriesPromises);
  const stories = terminalStoriesResult.filter(Boolean) as Story[];
  
  // Flatten Assets
  const resolvedAssets = entity.assets?.map(a => a.resolvedAsset).filter(Boolean) as import('@/types/canonical').AssetBase[] || [];
  const hero = resolvedAssets.find(a => entity.assets?.find(ref => ref.assetId === a.id)?.role === 'hero');
  const logo = resolvedAssets.find(a => entity.assets?.find(ref => ref.assetId === a.id)?.role === 'logo');
  const media = resolvedAssets.filter(a => ['social', 'gallery', 'editorial'].includes(entity.assets?.find(ref => ref.assetId === a.id)?.role || ''));
  const documents = resolvedAssets.filter(a => ['document', 'report', 'dataset'].includes(entity.assets?.find(ref => ref.assetId === a.id)?.role || ''));
  
  // Map Relationships
  const relationshipTargets = await Promise.all(
    (entity.relationships || []).map(rel => services.entities.getEntity(rel.targetId))
  );
  const relationships: import('@/types/canonical').ResolvedRelationship[] = (entity.relationships || []).map((rel, i) => {
    const target = relationshipTargets[i];
    if (!target) return null;
    return {
      entity: target,
      confidence: rel.confidence || 0,
      role: rel.role, // Map relation type to role
      evidence: (rel.metadata?.sharedStories as number) || 0,
      stories: [], // Expand if needed
      latestMention: new Date().toISOString(), // Mocked or derived from story
      sharedTopics: []
    };
  }).filter(Boolean) as import('@/types/canonical').ResolvedRelationship[];

  // Signals & Stats
  const signals = (entity as any).signals || {
    lastMentioned: new Date().toISOString(),
    mentionVelocity: Math.min(stories.length * 2, 100),
    coverageTrend: stories.length > 20 ? 'up' : 'flat',
    rank: 1,
  };

  const claims = entity.claims || [];
  const statistics = entity.statistics || [];
  const timeline = entity.timeline || [];

  // Query seed library for related chapters
  const repo = RepositoryFactory.getKnowledgeLibraryRepository(getKnowledgeLibrarySeedData());
  const library = await repo.getLibrary('india-and-the-world');
  const relatedChapters: Array<{ slug: string; title: string; summary: string; collectionSlug: string; volumeSlug: string }> = [];
  
  if (library) {
    for (const c of library.collections) {
      for (const v of c.volumes) {
        for (const ch of v.chapters) {
          const entityIds = ch.relatedEntityIds || [];
          if (entityIds.includes(entity.id) || entityIds.includes(entity.slug) || ch.slug === entity.slug) {
            relatedChapters.push({
              slug: ch.slug,
              title: ch.title,
              summary: ch.summary,
              collectionSlug: c.slug,
              volumeSlug: v.slug,
            });
          }
        }
      }
    }
  }

  // Resolve related investigations
  const allInvestigationsRes = services.investigations ? await services.investigations.getInvestigations() : { data: [] };
  const allInvestigations = allInvestigationsRes?.data || [];
  const relatedInvestigations = allInvestigations.filter((inv: any) =>
    inv.relatedEntityIds?.includes(entity.id) ||
    inv.relatedEntityIds?.includes(entity.slug) ||
    inv.chapters?.some((ch: any) => entity.usageGraph?.stories?.includes(ch.storySlug))
  );
  
  return {
    id: entity.id,
    slug: entity.slug,
    name: entity.name,
    type: entity.type,
    aliases: entity.aliases || [],
    description: entity.description || '',
    
    hero,
    logo,
    media,
    documents,
    
    signals,
    statistics,
    timeline,
    claims,
    relationships,
    
    evidenceScore: entity.evidenceScore || 0,
    health: {
      confidence: 98, // Typically computed from claims and evidence score
      evidenceCount: stories.length,
      sourceCount: 18, // Mocked for now until source extraction
      relationshipCount: relationships.length,
      mediaCount: resolvedAssets.length,
      claimCount: claims.length,
      coverageTrend: signals.coverageTrend
    },
    
    relatedChapters,
    relatedInvestigations,
    
    seo: { title: `${entity.name} - Knowledge Terminal`, description: entity.description }
  };
}

export async function getDatasetsForEntity(services: Services, entityId: string): Promise<Dataset[]> {
  const allDatasets = (await services.datasets.getDatasets()).data;
  return allDatasets.filter(d => d.relatedEntityIds.includes(entityId));
}

export async function getDatasetsForStory(services: Services, storyId: string): Promise<Dataset[]> {
  const allDatasets = (await services.datasets.getDatasets()).data;
  return allDatasets.filter(d => d.relatedStoryIds.includes(storyId));
}

export async function getDatasetsForTopic(services: Services, topicId: string): Promise<Dataset[]> {
  const allDatasets = (await services.datasets.getDatasets()).data;
  return allDatasets.filter(d => d.relatedTopicIds.includes(topicId));
}

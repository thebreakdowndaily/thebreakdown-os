import type { Story, Topic, Entity, EntityPageViewModel, Dataset, EntityBase } from '@/types/canonical';
import type { Services } from '@/services/registry';

export function buildEntityPage(services: Services, slug: string): EntityPageViewModel | null {
  const entity = services.entities.getEntityBySlug(slug);
  if (!entity) return null;
  const stories = (entity as any).relatedStoryIds?.map((id: string) => services.stories.getStory(id)).filter(Boolean) as Story[] || [];
  const relatedEntities = (entity.relationships || []).map(r => services.entities.getEntity(r.targetId)).filter(Boolean) as EntityBase[];
  // Fallback to legacy relatedTopicIds if relationships don't map topics yet
  const relatedTopics = (entity as any).relatedTopicIds?.map((id: string) => services.topics.getTopic(id)).filter(Boolean) as Topic[] || [];
  
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

export function buildEntityTerminalViewModel(services: Services, slug: string): import('@/types/canonical').EntityTerminalViewModel | null {
  const entity = services.entities.getEntityBySlug(slug);
  if (!entity) return null;
  
  const stories = (entity.usageGraph?.stories || []).map(id => services.stories.getStory(id)).filter(Boolean) as Story[];
  
  // Flatten Assets
  const resolvedAssets = entity.assets?.map(a => a.resolvedAsset).filter(Boolean) as import('@/types/canonical').AssetBase[] || [];
  const hero = resolvedAssets.find(a => entity.assets?.find(ref => ref.assetId === a.id)?.role === 'hero');
  const logo = resolvedAssets.find(a => entity.assets?.find(ref => ref.assetId === a.id)?.role === 'logo');
  const media = resolvedAssets.filter(a => ['social', 'gallery', 'editorial'].includes(entity.assets?.find(ref => ref.assetId === a.id)?.role || ''));
  const documents = resolvedAssets.filter(a => ['document', 'report', 'dataset'].includes(entity.assets?.find(ref => ref.assetId === a.id)?.role || ''));
  
  // Map Relationships
  const relationships: import('@/types/canonical').ResolvedRelationship[] = (entity.relationships || []).map(rel => {
    const target = services.entities.getEntity(rel.targetId);
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
    
    seo: { title: `${entity.name} - Knowledge Terminal`, description: entity.description }
  };
}

export function getDatasetsForEntity(services: Services, entityId: string): Dataset[] {
  const allDatasets = services.datasets.getDatasets().data;
  return allDatasets.filter(d => d.relatedEntityIds.includes(entityId));
}

export function getDatasetsForStory(services: Services, storyId: string): Dataset[] {
  const allDatasets = services.datasets.getDatasets().data;
  return allDatasets.filter(d => d.relatedStoryIds.includes(storyId));
}

export function getDatasetsForTopic(services: Services, topicId: string): Dataset[] {
  const allDatasets = services.datasets.getDatasets().data;
  return allDatasets.filter(d => d.relatedTopicIds.includes(topicId));
}

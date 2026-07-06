import type { Story, Topic, Entity, EntityPageViewModel, Dataset } from '@/types/canonical';
import type { Services } from '@/services/registry';

export function buildEntityPage(services: Services, slug: string): EntityPageViewModel | null {
  const entity = services.entities.getEntityBySlug(slug);
  if (!entity) return null;
  const stories = entity.relatedStoryIds.map(id => services.stories.getStory(id)).filter(Boolean) as Story[];
  const relatedEntities = entity.relatedEntityIds.map(id => services.entities.getEntity(id)).filter(Boolean) as Entity[];
  const relatedTopics = entity.relatedTopicIds.map(id => services.topics.getTopic(id)).filter(Boolean) as Topic[];
  return {
    entity,
    stories,
    relatedEntities,
    relatedTopics,
    seo: { title: entity.name, description: entity.description },
    breadcrumbs: [
      { label: 'Home', href: '/' },
      { label: entity.name, href: `/entity/${entity.slug}` },
    ],
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

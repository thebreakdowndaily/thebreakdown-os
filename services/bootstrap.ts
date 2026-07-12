import { getServices } from '@/services/registry';
import type { Services } from '@/services/registry';
import { initDefaultServices } from '@/services/init';
import { RepositoryFactory } from '@/services/factory/repository';
import { getStories, getTopics, getEntities, getTimelines, getFixes } from '@/utils/data-layer/store';
import { apiStoryToCanonical, apiTopicToCanonical, apiEntityToCanonical, apiTimelineToCanonical, apiFixToCanonical } from '@/lib/bootstrap';
import { seedDatasets } from '@/lib/datasets/seed-data';

export async function bootstrapServices(): Promise<Services> {
  try { return getServices(); } catch {}

  const apiStories = getStories({ pageSize: 100 }).data;
  const apiTopics = getTopics({ pageSize: 100 }).data;
  const apiEntities = getEntities({ pageSize: 100 }).data;
  const apiTimelines = getTimelines({ pageSize: 100 }).data;
  const apiFixes = getFixes({ pageSize: 100 }).data;

  const topics = apiTopics.map(apiTopicToCanonical);
  const entities = apiEntities.map(apiEntityToCanonical);
  const timelines = apiTimelines.map(apiTimelineToCanonical);
  const fixes = apiFixes.map(apiFixToCanonical);

  // Stories from store.ts used for SSG path gen; at runtime,
  // RepositoryFactory will return SupabaseStoryRepository if DATA_PROVIDER=supabase
  const stories = apiStories.map(apiStoryToCanonical);

  const services = initDefaultServices(stories, topics, entities, timelines, fixes, seedDatasets, []);
  services.search.rebuild(stories, topics, entities, timelines, fixes, seedDatasets);
  return services;
}

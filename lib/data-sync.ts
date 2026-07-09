import type { Story, Entity, Topic, Fix, Timeline } from '@/types/canonical';
import {
  upsertStory, removeStory,
  upsertEntity, removeEntity,
  upsertTopic, removeTopic,
  upsertFix, removeFix,
  upsertTimeline, removeTimeline,
} from '@/utils/data-layer/store';
import type {
  APIStory, APIEntity, APITopic, APIFix, APITimeline,
} from '@/utils/data-layer/types';
import { storyToAPIStory, fixToAPIFix, topicToAPITopic } from '@/lib/mappers/to-api-types';

export function syncStory(story: Story): void {
  const api = storyToAPIStory(story);
  upsertStory(story.slug, api);
}

export function deleteStory(slug: string): void {
  removeStory(slug);
}

export function syncEntity(entity: Entity): void {
  const raw = (entity as unknown as Record<string, unknown>)._raw as APIEntity | undefined;
  if (raw) {
    upsertEntity(entity.slug, { ...raw, name: entity.name, description: entity.description, aliases: entity.aliases, updatedAt: new Date().toISOString() });
  }
}

export function deleteEntity(slug: string): void {
  removeEntity(slug);
}

export function syncTopic(topic: Topic): void {
  const api = topicToAPITopic(topic);
  upsertTopic(topic.slug, { ...api, overview: topic.overview, faq: topic.faq, timeline: topic.timeline, statistics: topic.statistics, updatedAt: new Date().toISOString() } as APITopic);
}

export function deleteTopic(slug: string): void {
  removeTopic(slug);
}

export function syncFix(fix: Fix): void {
  const api = fixToAPIFix(fix);
  upsertFix(fix.slug, api);
}

export function deleteFix(slug: string): void {
  removeFix(slug);
}

export function syncTimeline(timeline: Timeline): void {
  const api: APITimeline = {
    id: timeline.id,
    title: timeline.title,
    description: timeline.description,
    category: timeline.category,
    events: timeline.events.map(e => ({ date: e.date, title: e.title, description: e.description })),
    storySlugs: timeline.storyIds,
    dateRange: { start: '', end: '' },
  };
  upsertTimeline(timeline.id, api);
}

export function deleteTimeline(id: string): void {
  removeTimeline(id);
}

export function syncAllEntities(entities: Entity[]): void {
  for (const e of entities) syncEntity(e);
}

import { createBlocksFromStory } from '@/lib/story/block-synthesis';
import { escapeHtmlText } from '@/lib/security/sanitize-rich-html';
import { getStories, getPublicStories, getTopics, getEntities, getTimelines, getFixes, getInvestigations, LEGACY_PUBLIC_SLUGS } from '@/utils/data-layer/store';
import { initDefaultServices } from '@/services/init';
import { getFixtureBySlug } from '../fixtures/fixes/index';
import { getServices } from '@/services/registry';
import type { Services } from '@/services/registry';
import type { Story, Topic, Entity, Timeline, Fix, Dataset, MediaItem, StoryBlock, Source, Claim, TimelineEvent, FAQItem, ChartDef, ExistingSolution, GlobalExample, FixAction, FixMetric, Investigation } from '@/types/canonical';
import { seedDatasets } from '@/lib/datasets/seed-data';
import { extractProblems } from '@/lib/problem-helpers';
import type { APIStory, APITopic, APIEntity, APITimeline, APIFix, APIInvestigation } from '@/utils/data-layer/types';
import { positionalClaimId, deterministicClaimId } from '@/lib/story/claim-identity';

export function bootstrapServices(options?: { publicOnly?: boolean }): Services {
  try { return getServices(); } catch {}

  const apiStories = options?.publicOnly
    ? getPublicStories({ pageSize: 100 }).data
    : getStories({ pageSize: 100 }).data;
  const apiTopics = getTopics({ pageSize: 100 }).data;
  const apiEntities = getEntities({ pageSize: 100 }).data;
  const apiTimelines = getTimelines({ pageSize: 100 }).data;
  const apiFixes = getFixes({ pageSize: 100 }).data;
  const apiInvestigations = getInvestigations();

  const stories = apiStories.map(apiStoryToCanonical);
  const topics = apiTopics.map(apiTopicToCanonical);
  const entities = apiEntities.map(apiEntityToCanonical);
  const timelines = apiTimelines.map(apiTimelineToCanonical);
  const fixes = apiFixes.map(apiFixToCanonical);
  const investigations = apiInvestigations.map(apiInvestigationToCanonical);
  const media: MediaItem[] = [];

  const services = initDefaultServices(stories, topics, entities, timelines, fixes, seedDatasets, media, investigations);
  const problems = extractProblems(fixes);
  services.search.rebuild(stories, topics, entities, timelines, fixes, seedDatasets, problems);
  return services;
}

export { createBlocksFromStory } from '@/lib/story/block-synthesis';

import { apiStoryToCanonicalAdapter } from '@/lib/story/adapters';

export function apiStoryToCanonical(s: APIStory): Story {
  return apiStoryToCanonicalAdapter(s);
}

export function apiTopicToCanonical(t: APITopic): Topic {
  return {
    ...t as unknown as Topic,
    overview: t.description,
    storyIds: (t.stories || []).map((s) => s.slug),
    relatedEntityIds: (t.entities || []).map((e) => e.id),
    featuredStoryIds: (t.stories || []).slice(0, 2).map((s) => s.slug),
    countries: (t.entities || []).filter((e) => e.type === 'country').map((e) => e.slug),
    createdAt: t.updatedAt,
    repo: undefined,
  } as unknown as Topic;
}

export function apiEntityToCanonical(e: APIEntity): Entity {
  const entity = {
    ...e as unknown as Entity,
    aliases: e.aliases || [],
    evidenceScore: e.evidenceScore || 85,
    relatedEntityIds: (e.relatedEntities || []).map((re) => re.id),
    relatedStoryIds: (e.relatedStories || []).map((rs) => rs.slug),
    relatedTopicIds: (e.relatedTopics || []).map((rt) => rt.id),
    statistics: Object.entries(e.statistics || {}).map(([label, value]) => ({ label, value: String(value) })),
    createdAt: e.updatedAt,
    repo: undefined,
    _raw: e as unknown as Record<string, unknown>,
  };
  return entity as unknown as Entity;
}

export function apiTimelineToCanonical(t: APITimeline): Timeline {
  return {
    ...t as unknown as Timeline,
    storyIds: t.storySlugs || [],
    entityIds: [], // APITimeline missing entityIds in types
    topicIds: [], // APITimeline missing topicIds in types
    createdAt: '',
    repo: undefined,
  } as unknown as Timeline;
}

export function apiInvestigationToCanonical(i: APIInvestigation): Investigation {
  return {
    id: i.id,
    slug: i.slug,
    title: i.title,
    subtitle: i.subtitle,
    summary: i.summary,
    heroImage: i.heroImage || '',
    publishedAt: i.publishedAt,
    updatedAt: i.updatedAt,
    status: (i as any).status || 'published',
    chapters: (i.chapters || []).map((ch) => ({
      id: ch.id,
      slug: ch.slug,
      storySlug: ch.storySlug,
      title: ch.title,
      subtitle: ch.subtitle,
      summary: ch.summary,
      order: ch.order,
    })),
    keyFindings: i.keyFindings || [],
    tags: i.tags || [],
    relatedEntityIds: [],
    relatedTopicIds: [],
    sources: (i.sources || []).map((src): Source => ({ title: src.name, url: src.url, accessedAt: '', tier: src.tier as any })),
    faq: (i.faq || []).map((q): FAQItem => ({ question: q.question, answer: q.answer })),
    timeline: (i.timeline || []).map((e) => ({ date: e.date, title: e.title, description: e.description, sourceUrl: e.source })),
    statistics: (i.facts || []).map((f) => ({ label: f.label, value: f.value })),
  } as Investigation;
}

export function apiFixToCanonical(f: APIFix): Fix {
  const fixture = getFixtureBySlug(f.slug);

  const base: Record<string, unknown> = {
    ...(f as unknown as Record<string, unknown>),
    title: fixture?.title || f.headline,
    createdAt: f.publishedAt,
    status: (f as any).status || 'published',
    repo: undefined,
    _raw: f as unknown as Record<string, unknown>,
  };

  if (fixture) {
    const AR13A_FIELDS = [
      'primaryCategory', 'secondaryCategories', 'maturityStatus', 'publicationStatus',
      'evidenceGrade', 'problemStatement', 'responsibleActorIds', 'beneficiaryGroups',
      'disadvantagedGroups', 'fiscalCost', 'timeToImpact', 'globalPrecedents',
      'tradeOffs', 'risksAndFailures', 'successMetrics', 'sourceIds', 'lastVerified',
      'version', 'relatedStories', 'relatedEntities', 'sources',
    ];
    for (const key of AR13A_FIELDS) {
      const val = (fixture as unknown as Record<string, unknown>)[key];
      if (val !== undefined && val !== null && !(Array.isArray(val) && val.length === 0)) {
        base[key] = val;
      }
    }
  }

  return base as unknown as Fix;
}

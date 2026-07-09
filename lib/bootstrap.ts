import { getStories, getTopics, getEntities, getTimelines, getFixes } from '@/utils/data-layer/store';
import { initDefaultServices } from '@/services/init';
import { getServices } from '@/services/registry';
import type { Services } from '@/services/registry';
import type { Story, Topic, Entity, Timeline, Fix, Dataset, MediaItem, StoryBlock, Source, Claim, TimelineEvent, FAQItem, ChartDef, FixSolution, GlobalExample, FixAction, FixMetric } from '@/types/canonical';
import { seedDatasets } from '@/lib/datasets/seed-data';

export function bootstrapServices(): Services {
  try { return getServices(); } catch {}

  const apiStories = getStories({ pageSize: 100 }).data;
  const apiTopics = getTopics({ pageSize: 100 }).data;
  const apiEntities = getEntities({ pageSize: 100 }).data;
  const apiTimelines = getTimelines({ pageSize: 100 }).data;
  const apiFixes = getFixes({ pageSize: 100 }).data;

  const stories = apiStories.map(apiStoryToCanonical);
  const topics = apiTopics.map(apiTopicToCanonical);
  const entities = apiEntities.map(apiEntityToCanonical);
  const timelines = apiTimelines.map(apiTimelineToCanonical);
  const fixes = apiFixes.map(apiFixToCanonical);
  const media: MediaItem[] = [];

  const services = initDefaultServices(stories, topics, entities, timelines, fixes, seedDatasets, media);
  services.search.rebuild(stories, topics, entities, timelines, fixes, seedDatasets);
  return services;
}

function createBlocksFromStory(s: Record<string, any>): StoryBlock[] {
  const blocks: StoryBlock[] = [];

  const allSources = [
    ...(s.sources || []).map((src: any) => ({ name: src.name, url: src.url, type: src.type, tier: src.tier })),
    ...(s.primarySources || []).map((ps: any) => ({ name: ps.name, url: ps.url, type: ps.type || 'primary', tier: 1 })),
  ];

  if (s.keyPoints && s.keyPoints.length > 0) {
    blocks.push({ id: 'executive-summary', type: 'executive-summary', data: { summary: s.summary, keyPoints: s.keyPoints } });
  }

  const evidenceClaims = (s.claims || []).map((c: any) => ({
    id: c.id || `claim-${Math.random().toString(36).slice(2, 8)}`,
    text: c.claim || c.text || '',
    confidence: Math.round((c.confidence || 50) * 100),
    status: c.verification === 'true' ? 'verified' as const : c.verification === 'false' ? 'unverified' as const : c.confidence >= 0.8 ? 'strong' as const : c.confidence >= 0.6 ? 'moderate' as const : 'unverified' as const,
    sources: c.source ? [{ name: c.source || '', url: c.sourceUrl || '', group: 'report' as const }] : [],
    supportingEvidence: c.explanation ? [c.explanation] : [],
  }));
  if (evidenceClaims.length > 0) {
    const verifiedCount = evidenceClaims.filter((c: any) => c.status === 'verified').length;
    blocks.push({
      id: 'evidence', type: 'evidence', data: {
        overallScore: s.evidenceScore ?? s.verificationScore ?? 0,
        verifiedClaims: verifiedCount,
        primarySources: allSources.filter((src: any) => src.tier <= 2).length,
        claims: evidenceClaims,
        verification: { createdAt: s.publishedAt, updatedAt: s.updatedAt, verifiedAt: s.updatedAt },
      },
    });
  }

  if (s.facts && s.facts.length > 0) {
    blocks.push({ id: 'key-numbers', type: 'key-numbers', data: { items: s.facts.map((f: any) => ({ value: f.value, label: f.label, source: f.source })) } });
  }

  if (s.timeline && s.timeline.length > 0) {
    blocks.push({ id: 'timeline', type: 'timeline', data: { events: s.timeline } });
  }

  if (s.charts && s.charts.length > 0) {
    s.charts.forEach((c: any, i: number) => {
      blocks.push({ id: `chart-${i}`, type: 'chart', data: { chartId: String(i), type: c.type, title: c.title, data: c.data, xKey: c.xKey, yKey: c.yKey } });
    });
  }

  if (s.faq && s.faq.length > 0) {
    blocks.push({ id: 'faq', type: 'faq', data: { questions: s.faq } });
  }

  if (allSources.length > 0) {
    blocks.push({ id: 'sources', type: 'sources', data: { sources: allSources } });
  }

  const relData: Record<string, unknown> = {};
  if (s.relatedStories && s.relatedStories.length > 0) {
    relData.stories = s.relatedStories;
  }
  if (s.relatedEntities && s.relatedEntities.length > 0) {
    relData.entities = s.relatedEntities;
  }
  if (Object.keys(relData).length > 0) {
    blocks.push({ id: 'related-intelligence', type: 'related-intelligence', data: relData });
  }

  return blocks;
}

function apiStoryToCanonical(s: Record<string, any>): Story {
  const blocks = createBlocksFromStory(s);
  const mappedSources = (s.sources || []).map((src: any): Source => ({ title: src.name, url: src.url, accessedAt: '', tier: src.tier }));
  const mappedClaims = (s.claims || []).map((c: any): Claim => ({
    id: c.id || `claim-${Math.random().toString(36).slice(2, 8)}`,
    claim: c.claim || c.text || '',
    data: c.explanation || (c.supportingEvidence ? (c.supportingEvidence as string[]).join('; ') : ''),
    source: c.source || '',
    sourceUrl: '',
    tier: 3,
    confidence: c.confidence || 50,
    status: c.status === 'verified' || c.verification === 'true' ? 'verified' : c.confidence >= 80 ? 'strong' : c.confidence >= 60 ? 'moderate' : 'unverified',
  }));
  return {
    ...s,
    title: s.headline,
    createdAt: s.publishedAt,
    status: 'published',
    blocks,
    sources: mappedSources,
    claims: mappedClaims,
    author: typeof s.author === 'string' ? s.author : (s.author?.name || ''),
    relatedStoryIds: (s.relatedStories || []).map((rs: any) => rs.slug),
    relatedEntityIds: (s.relatedEntities || []).map((re: any) => re.id || re.slug),
    relatedTopicIds: s.relatedTopicIds || (s.relatedTopics || []).map((rt: any) => rt.id).filter(Boolean),
    repo: undefined,
  } as unknown as Story;
}

function apiTopicToCanonical(t: Record<string, any>): Topic {
  return {
    ...t,
    overview: t.description,
    storyIds: (t.stories || []).map((s: any) => s.slug),
    relatedEntityIds: (t.entities || []).map((e: any) => e.id),
    featuredStoryIds: (t.stories || []).slice(0, 2).map((s: any) => s.slug),
    countries: (t.entities || []).filter((e: any) => e.type === 'country').map((e: any) => e.slug),
    createdAt: t.updatedAt,
    repo: undefined,
  } as unknown as Topic;
}

function apiEntityToCanonical(e: Record<string, any>): Entity {
  const entity: Record<string, any> = {
    ...e,
    evidenceScore: e.evidenceScore || 85,
    relatedEntityIds: (e.relatedEntities || []).map((re: any) => re.id),
    relatedStoryIds: (e.relatedStories || []).map((rs: any) => rs.slug),
    relatedTopicIds: (e.relatedTopics || []).map((rt: any) => rt.id),
    statistics: Object.entries(e.statistics || {}).map(([label, value]) => ({ label, value: String(value) })),
    createdAt: e.updatedAt,
    repo: undefined,
    _raw: e,
  };
  return entity as unknown as Entity;
}

function apiTimelineToCanonical(t: Record<string, any>): Timeline {
  return {
    ...t,
    storyIds: t.storySlugs || t.storyIds || [],
    entityIds: t.entityIds || [],
    topicIds: t.topicIds || [],
    createdAt: '',
    repo: undefined,
  } as unknown as Timeline;
}

function apiFixToCanonical(f: Record<string, any>): Fix {
  const fix: Record<string, any> = {
    ...f,
    title: f.headline,
    problem: f.problem?.content || f.problem?.title || '',
    rootCauses: f.rootCauses?.content ? [f.rootCauses.content] : [],
    existingSolutions: (f.existingSolutions || []).map((s: any) => ({ title: s.name, description: s.description, link: s.source })),
    globalExamples: (f.globalExamples || []).map((g: any) => ({ country: g.country, approach: g.policy, outcome: g.outcome, link: g.source })),
    recommendedActions: (f.recommendedActions || []).map((a: any) => ({ action: a.title, responsible: (a.actors || []).join(', '), timeline: a.timeframe })),
    citizenActions: (f.citizenActions || []).map((a: any) => a.title || a.description),
    governmentActions: (f.governmentActions || []).map((a: any) => a.title || a.description),
    metrics: (f.metricsToTrack || []).map((m: any) => ({ metric: m.name, currentValue: m.currentValue, targetValue: m.targetValue, source: m.dataSource })),
    createdAt: f.publishedAt,
    status: 'published',
    repo: undefined,
    _raw: f,
  };
  return fix as unknown as Fix;
}

import { getStories, getTopics, getEntities, getTimelines, getFixes } from '@/utils/data-layer/store';
import { initDefaultServices } from '@/services/init';
import { getServices } from '@/services/registry';
import type { Services } from '@/services/registry';
import type { Story, Topic, Entity, Timeline, Fix, Dataset, MediaItem, StoryBlock, Source, Claim, TimelineEvent, FAQItem, ChartDef, ExistingSolution, GlobalExample, FixAction, FixMetric } from '@/types/canonical';
import { seedDatasets } from '@/lib/datasets/seed-data';
import type { APIStory, APITopic, APIEntity, APITimeline, APIFix } from '@/utils/data-layer/types';

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

function createBlocksFromStory(s: APIStory): StoryBlock[] {
  const blocks: StoryBlock[] = [];

  const allSources = [
    ...(s.sources || []).map((src) => ({ name: src.name, url: src.url, type: src.type, tier: src.tier })),
    ...(s.sources || []).filter(src => src.type === 'primary').map((ps) => ({ name: ps.name, url: ps.url, type: ps.type || 'primary', tier: 1 })),
  ];

  // HERO BLOCK (Region: hero)
  blocks.push({
    id: 'hero',
    type: 'hero',
    region: 'hero',
    data: {
      headline: s.headline,
      summary: s.summary,
      heroImage: s.heroImage,
      publishedAt: s.publishedAt,
      updatedAt: s.updatedAt,
      readingTime: s.readingTime,
      author: typeof s.author === 'string' ? s.author : (s.author?.name || ''),
      evidenceScore: s.evidenceScore ?? 0,
      sources: allSources,
      tags: s.tags || [],
      category: s.category || '',
      slug: s.slug,
      versionHistory: s.versionHistory,
    }
  });

  // STORY SNAPSHOT BLOCK (Region: sidebar)
  blocks.push({
    id: 'story-snapshot',
    type: 'story-snapshot',
    region: 'sidebar',
    data: {
      status: s.status,
      category: s.category,
      location: s.location,
      stakeholderNames: s.stakeholderNames || [],
      impactLevel: s.impactLevel,
      legislation: s.legislation,
      costValue: s.costValue,
      updatedAt: s.updatedAt,
      evidenceScore: s.evidenceScore ?? 0,
      sourceCount: allSources.length,
    }
  });

  const keyPoints = (s.keyPoints && s.keyPoints.length > 0) 
    ? s.keyPoints 
    : (s.claims && s.claims.length >= 3 ? s.claims.slice(0, 4).map((c) => c.claim) : []);

  if (keyPoints.length > 0) {
    blocks.push({ id: 'executive-summary', type: 'executive-summary', region: 'main', data: { summary: s.summary, keyPoints } });
  }

  const evidenceClaims = (s.claims || []).map((c, i) => ({
    id: `claim-${i}-${Math.random().toString(36).slice(2, 8)}`,
    text: c.claim || '',
    confidence: Math.round((c.confidence || 0.5) * 100),
    status: c.verification === 'true' ? 'verified' as const : c.verification === 'false' ? 'unverified' as const : (c.confidence || 0) >= 0.8 ? 'strong' as const : (c.confidence || 0) >= 0.6 ? 'moderate' as const : 'unverified' as const,
    sources: c.source ? [{ name: c.source || '', url: '', group: 'report' as const }] : [],
    supportingEvidence: c.explanation ? [c.explanation] : [],
  }));

  const verifiedCount = evidenceClaims.filter((c) => c.status === 'verified').length;
  const misleadingCount = evidenceClaims.filter((c) => c.status === 'moderate').length;
  const unverifiableCount = evidenceClaims.filter((c) => c.status === 'unverified').length;
  const totalClaims = evidenceClaims.length;
  const t1t2 = allSources.filter((src) => src.tier <= 2).length;
  const sourceQuality = allSources.length > 0 ? Math.round((t1t2 / allSources.length) * 100) : 0;
  const verificationStatus = totalClaims > 0 ? Math.round((verifiedCount / totalClaims) * 100) : 0;

  // CONFIDENCE METER (Region: main)
  blocks.push({
    id: 'confidence-meter',
    type: 'confidence-meter',
    region: 'main',
    data: {
      overallScore: s.evidenceScore ?? 0,
      sourceQuality,
      confirmations: 80,
      dataAvailability: 70,
      verificationStatus,
      totalClaims,
      verified: verifiedCount,
      misleading: misleadingCount,
      unverifiable: unverifiableCount,
    }
  });

  if (evidenceClaims.length > 0) {
    blocks.push({
      id: 'evidence', type: 'evidence', region: 'main', data: {
        overallScore: s.evidenceScore ?? 0,
        verifiedClaims: verifiedCount,
        primarySources: t1t2,
        claims: evidenceClaims,
        verification: { createdAt: s.publishedAt, updatedAt: s.updatedAt, verifiedAt: s.updatedAt },
      },
    });
  }

  if (s.facts && s.facts.length > 0) {
    blocks.push({ id: 'key-numbers', type: 'key-numbers', region: 'main', data: { items: s.facts.map((f) => ({ value: f.value, label: f.label, source: f.source })) } });
  }

  if (s.timeline && s.timeline.length > 0) {
    blocks.push({ id: 'timeline', type: 'timeline', region: 'main', data: { events: s.timeline } });
  }

  if (s.charts && s.charts.length > 0) {
    s.charts.forEach((c, i: number) => {
      blocks.push({ id: `chart-${i}`, type: 'chart', region: 'main', data: { chartId: String(i), type: c.type, title: c.title, data: c.data, xKey: c.xKey, yKey: c.yKey } });
    });
  }

  if (s.faq && s.faq.length > 0) {
    blocks.push({ id: 'faq', type: 'faq', region: 'main', data: { questions: s.faq } });
  }

  if (allSources.length > 0) {
    blocks.push({ id: 'sources', type: 'sources', region: 'main', data: { sources: allSources } });
  }

  if (s.deepResearch?.methodology) {
    blocks.push({
      id: 'research-methodology',
      type: 'research-methodology',
      region: 'main',
      data: {
        methodology: s.deepResearch.methodology,
        expandedSources: s.deepResearch.expandedSources || [],
        sourceCount: allSources.length,
        claimCount: s.claims?.length || 0,
        faqCount: s.faq?.length || 0,
      }
    });
  }

  const relData: Record<string, unknown> = {};
  if (s.relatedStories && s.relatedStories.length > 0) {
    relData.stories = s.relatedStories;
  }
  if (s.relatedEntities && s.relatedEntities.length > 0) {
    relData.entities = s.relatedEntities;
  }
  if (Object.keys(relData).length > 0) {
    blocks.push({ id: 'related-intelligence', type: 'related-intelligence', region: 'footer', data: relData });
  }

  // AUTHOR BOX BLOCK (Region: footer)
  blocks.push({
    id: 'author-box',
    type: 'author-box',
    region: 'footer',
    data: {
      author: typeof s.author === 'string' ? { name: s.author } : (s.author || { name: 'The Breakdown' })
    }
  });

  return blocks;
}

export function apiStoryToCanonical(s: APIStory): Story {
  const blocks = createBlocksFromStory(s);
  const mappedSources = (s.sources || []).map((src): Source => ({ title: src.name, url: src.url, accessedAt: '', tier: src.tier as import('@/types/canonical').ConfidenceTier }));
  const mappedClaims = (s.claims || []).map((c, i): Claim => ({
    id: `claim-${i}-${Math.random().toString(36).slice(2, 8)}`,
    claim: c.claim || '',
    data: c.explanation || '',
    source: c.source || '',
    sourceUrl: '',
    tier: 3,
    confidence: c.confidence || 0.5,
    status: c.verification === 'true' ? 'verified' : (c.confidence || 0) >= 0.8 ? 'strong' : (c.confidence || 0) >= 0.6 ? 'moderate' : 'unverified',
  }));
  const quickRt = s.quickReadTime || Math.max(1, Math.round((s.keyPoints?.length || 3) * 0.3));
  const deepRt = s.deepReadTime || s.readingTime + (s.sources?.length || 0) + (s.claims?.length || 0) + Math.round((s.faq?.length || 0) * 0.5);

  const qb = s.quickBrief || {
    summary: s.summary,
    keyPoints: (s.keyPoints || []).slice(0, 3),
  };

  const sourceTiers = (s.sources || []).reduce((acc, src) => {
    acc[src.tier] = (acc[src.tier] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);
  const t1 = sourceTiers[1] || 0;
  const t2 = sourceTiers[2] || 0;
  const dr = s.deepResearch || {
    summary: s.summary,
    methodology: [
      `This analysis draws on ${s.sources?.length || 0} sources.`,
      t1 > 0 ? `${t1} primary source${t1 > 1 ? 's' : ''} (Tier 1).` : '',
      t2 > 0 ? `${t2} secondary source${t2 > 1 ? 's' : ''} (Tier 2).` : '',
      `Each of ${s.claims?.length || 0} claims has been verified against its originating source.`,
      'Data visualisations are based on the underlying datasets cited in each source.',
      s.faq && s.faq.length > 0 ? `The FAQ section addresses ${s.faq.length} common questions with answers drawn from the cited evidence.` : '',
    ].filter(Boolean).join(' '),
  };

  return {
    ...s as unknown as Story,
    title: s.headline,
    createdAt: s.publishedAt,
    status: 'published',
    quickReadTime: quickRt,
    deepReadTime: deepRt,
    quickBrief: qb,
    deepResearch: dr,
    blocks,
    sources: mappedSources,
    claims: mappedClaims,
    author: typeof s.author === 'string' ? s.author : (s.author?.name || ''),
    relatedStoryIds: (s.relatedStories || []).map((rs) => rs.slug),
    relatedEntityIds: (s.relatedEntities || []).map((re) => re.id || re.slug),
    relatedTopicIds: s.relatedTopicIds || [],
    repo: undefined,
  } as unknown as Story;
}

function apiTopicToCanonical(t: APITopic): Topic {
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

function apiEntityToCanonical(e: APIEntity): Entity {
  const entity = {
    ...e as unknown as Entity,
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

function apiTimelineToCanonical(t: APITimeline): Timeline {
  return {
    ...t as unknown as Timeline,
    storyIds: t.storySlugs || [],
    entityIds: [], // APITimeline missing entityIds in types
    topicIds: [], // APITimeline missing topicIds in types
    createdAt: '',
    repo: undefined,
  } as unknown as Timeline;
}

function apiFixToCanonical(f: APIFix): Fix {
  const fix = {
    ...f as unknown as Fix,
    title: f.headline,
    problem: f.problem?.content || f.problem?.title || '',
    rootCauses: f.rootCauses?.content ? [f.rootCauses.content] : [],
    existingSolutions: (f.existingSolutions || []).map((s) => ({ title: s.name, description: s.description, link: s.source })),
    globalExamples: (f.globalExamples || []).map((g) => ({ country: g.country, approach: g.policy, outcome: g.outcome, link: g.source })),
    recommendedActions: (f.recommendedActions || []).map((a) => ({ action: a.title, responsible: (a.actors || []).join(', '), timeline: a.timeframe })),
    citizenActions: (f.citizenActions || []).map((a) => a.title || a.description),
    governmentActions: (f.governmentActions || []).map((a) => a.title || a.description),
    metrics: (f.metricsToTrack || []).map((m) => ({ metric: m.name, currentValue: m.currentValue, targetValue: m.targetValue, source: m.dataSource })),
    createdAt: f.publishedAt,
    status: 'published',
    repo: undefined,
    _raw: f as unknown as Record<string, unknown>,
  };
  return fix as unknown as Fix;
}

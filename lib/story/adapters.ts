/**
 * THE BREAKDOWN — Canonical Story Source Adapters
 *
 * Provides source adapters to convert any content source (APIStory, Chapter, or Database record)
 * into the canonical Story model before passing to presentation components.
 *
 * Source Adapters:
 *   APIStory      ──► apiStoryToCanonical()
 *   Chapter       ──► chapterToCanonical()
 *   DatabaseStory ──► dbStoryToCanonical()
 */

import type { Story, Chapter, StoryBlock, Source, Claim, PublicationStatus, StoryStatus } from '@/types/canonical';
import type { APIStory } from '@/utils/data-layer/types';
import { LEGACY_PUBLIC_SLUGS } from '@/utils/data-layer/store';
import { createBlocksFromStory } from '@/lib/bootstrap';
import { deterministicClaimId } from '@/lib/story/claim-identity';

/**
 * Maps external/API status strings to canonical StoryStatus.
 */
export function mapAPIStatusToCanonicalStatus(
  status?: string,
  publicationStatus?: PublicationStatus
): StoryStatus {
  if (publicationStatus === 'published' || status === 'verified') return 'published';
  if (publicationStatus === 'scheduled') return 'scheduled';
  if (publicationStatus === 'review') return 'review';
  return 'draft';
}

/**
 * Adapter 1: APIStory -> Canonical Story
 */
export function apiStoryToCanonicalAdapter(s: APIStory): Story {
  const blocks = createBlocksFromStory(s);
  const mappedSources = (s.sources || []).map(
    (src): Source => ({
      title: src.name,
      url: src.url || '',
      accessedAt: '',
      tier: src.tier as import('@/types/canonical').ConfidenceTier,
      publisher: (src as any).publisher || (src as any).type || src.name,
    })
  );
  const mappedClaims = (s.claims || []).map(
    (c, i): Claim => ({
      id: (c as any).id || deterministicClaimId(c.claim || '', c.source || '', s.slug || 'story'),
      claim: c.claim || '',
      data: c.explanation || '',
      source: c.source || '',
      sourceUrl: '',
      tier: 3,
      confidence: c.confidence || 0.5,
      status:
        c.verification === 'true'
          ? 'verified'
          : (c.confidence || 0) >= 0.8
          ? 'strong'
          : (c.confidence || 0) >= 0.6
          ? 'moderate'
          : 'unverified',
      counterArguments: (c as any).counterArguments || [],
    })
  );

  const publicationStatus: PublicationStatus =
    s.publicationStatus ?? (LEGACY_PUBLIC_SLUGS.has(s.slug) ? 'published' : 'draft');
  const canonicalStatus = mapAPIStatusToCanonicalStatus(s.status, publicationStatus);

  return {
    ...s as unknown as Story,
    id: s.id || `story-${s.slug}`,
    title: s.headline,
    slug: s.slug,
    headline: s.headline,
    summary: s.summary,
    heroImage: s.heroImage || '',
    author: typeof s.author === 'string' ? s.author : s.author?.name || 'The Breakdown',
    category: s.category || 'general',
    status: canonicalStatus,
    publicationStatus,
    storyType: s.storyType || 'standard',
    evidenceScore: s.evidenceScore || 0,
    readingTime: s.readingTime || 5,
    publishedAt: s.publishedAt,
    createdAt: s.publishedAt,
    updatedAt: s.updatedAt,
    tags: s.tags || [],
    blocks,
    sources: mappedSources,
    claims: mappedClaims,
    timeline: (s.timeline || []).map((t) => ({ date: t.date, title: t.title, description: t.description })),
    faq: (s.faq || []).map((f) => ({ question: f.question, answer: f.answer })),
    charts: s.charts || [],
    primaryEntityId: s.primaryEntityId,
    relatedStoryIds: (s.relatedStories || []).map((rs) => rs.slug),
    relatedEntityIds: (s.relatedEntities || []).map((re) => re.id || re.slug),
    relatedTopicIds: s.relatedTopicIds || [],
  };
}

/**
 * Adapter 2: Knowledge Library Chapter -> Canonical Story
 */
export function chapterToCanonicalAdapter(chapter: Chapter): Story {
  const isPublished = chapter.status === 'published' || chapter.status === 'verified';
  const pubStatus: PublicationStatus = isPublished ? 'published' : 'draft';
  const canonicalStatus: StoryStatus = isPublished ? 'published' : 'draft';

  const heroBlock = chapter.content.find((block) => (block.type as string) === 'hero');
  const heroData = heroBlock?.data as Record<string, unknown> | undefined;
  const chapterHeroImage = (chapter as any).heroImage || (chapter.metadata as any)?.heroImage;
  const firstImageBlock = chapter.content.find((b) => b.type === 'image' && typeof (b.data as any)?.url === 'string');
  const heroImage = typeof chapterHeroImage === 'string' && chapterHeroImage
    ? chapterHeroImage
    : typeof heroData?.heroImage === 'string' && heroData.heroImage
    ? heroData.heroImage
    : typeof heroData?.image === 'string' && heroData.image
    ? heroData.image
    : typeof heroData?.url === 'string' && heroData.url
    ? heroData.url
    : typeof (firstImageBlock?.data as any)?.url === 'string'
    ? (firstImageBlock?.data as any).url
    : '';

  // The canonical reader owns the hero region. Do not render an authored hero
  // block a second time after safely projecting its supported image field.
  const blocks: StoryBlock[] = chapter.content.filter((kb) => kb !== heroBlock).map((kb) => {
    let canonicalType = kb.type as string;
    if (canonicalType === 'heading') canonicalType = 'chapter-heading';
    else if (canonicalType === 'paragraph') canonicalType = 'text';
    else if (canonicalType === 'evidence-summary') canonicalType = 'evidence';

    return {
      id: kb.id,
      type: canonicalType,
      region: 'main',
      data: kb.data || {},
    };
  });

  const readingTimeVal =
    typeof chapter.readingTime === 'number'
      ? chapter.readingTime
      : chapter.readingTime?.explorer || chapter.readingTime?.scholar || 10;

  // Restore timeline events from authored timeline blocks or chapter metadata
  const extractedTimeline: Array<{ date: string; title: string; description: string; source?: string }> = [];
  if (Array.isArray((chapter as any).timeline) && (chapter as any).timeline.length > 0) {
    for (const ev of (chapter as any).timeline) {
      if (ev && typeof ev === 'object') {
        extractedTimeline.push({
          date: ev.date || '',
          title: ev.title || '',
          description: ev.description || '',
          source: ev.source || undefined,
        });
      }
    }
  } else {
    for (const b of chapter.content) {
      if (b.type === 'timeline' && b.data && Array.isArray((b.data as any).events)) {
        for (const ev of (b.data as any).events) {
          if (ev && typeof ev === 'object') {
            extractedTimeline.push({
              date: ev.date || '',
              title: ev.title || '',
              description: ev.description || '',
              source: Array.isArray(ev.sources) ? ev.sources.join(', ') : ev.source || undefined,
            });
          }
        }
      }
    }
  }

  // Restore charts from authored chart blocks or chapter metadata
  const extractedCharts: import('@/types/canonical').ChartDef[] = [];
  if (Array.isArray((chapter as any).charts) && (chapter as any).charts.length > 0) {
    extractedCharts.push(...(chapter as any).charts);
  } else {
    for (const b of chapter.content) {
      if (b.type === 'chart' && b.data && typeof b.data === 'object') {
        const cd = b.data as Record<string, unknown>;
        extractedCharts.push({
          type: (cd.type as string) || (cd.chartType as string) || 'bar',
          chartType: (cd.chartType as string) || (cd.type as string) || 'bar',
          title: (cd.title as string) || '',
          description: (cd.caption as string) || (cd.description as string) || '',
          data: Array.isArray(cd.data) ? cd.data : [],
          xKey: (cd.xKey as string) || 'label',
          yKey: (cd.yKey as string) || 'value',
          color: (cd.color as string) || undefined,
          caption: (cd.caption as string) || '',
        });
      }
    }
  }

  const relatedTopicIds: string[] = Array.isArray((chapter as any).relatedTopicIds) && (chapter as any).relatedTopicIds.length > 0
    ? (chapter as any).relatedTopicIds
    : chapter.relatedConceptIds || [];

  const relatedEntityIds = chapter.relatedEntityIds || [];
  const relatedEntities = (chapter as any).relatedEntities || relatedEntityIds.map((id) => ({ id, slug: id }));

  return {
    id: chapter.id,
    title: chapter.title,
    slug: chapter.slug,
    headline: chapter.title,
    summary: chapter.summary,
    heroImage,
    author: 'The Breakdown Editorial',
    category: chapter.collectionSlug,
    status: canonicalStatus,
    publicationStatus: pubStatus,
    storyType: 'investigation_chapter',
    evidenceScore: 90,
    readingTime: readingTimeVal,
    publishedAt: chapter.createdAt,
    createdAt: chapter.createdAt,
    updatedAt: chapter.updatedAt,
    tags: chapter.relatedConceptIds || [],
    blocks,
    sources: chapter.sources || [],
    claims: chapter.claims || [],
    timeline: extractedTimeline,
    faq: chapter.keyQuestions?.map((kq) => ({ question: kq.question, answer: kq.answer })) || [],
    charts: extractedCharts,
    relatedStoryIds: chapter.recommendedNext || [],
    relatedEntityIds,
    relatedTopicIds,
    relatedEntities,
  } as unknown as Story;
}

/**
 * Adapter 3: Generic Database Record -> Canonical Story
 */
export function dbStoryToCanonicalAdapter(dbRecord: Record<string, unknown>): Story {
  const pubStatus: PublicationStatus = (dbRecord.publicationStatus as PublicationStatus) || 'draft';
  const canonicalStatus = mapAPIStatusToCanonicalStatus(dbRecord.status as string, pubStatus);

  return {
    id: String(dbRecord.id || `story-${dbRecord.slug}`),
    title: String(dbRecord.headline || dbRecord.title || ''),
    slug: String(dbRecord.slug || ''),
    headline: String(dbRecord.headline || dbRecord.title || ''),
    summary: String(dbRecord.summary || ''),
    heroImage: String(dbRecord.heroImage || ''),
    author: String(dbRecord.author || 'The Breakdown'),
    category: String(dbRecord.category || 'general'),
    status: canonicalStatus,
    publicationStatus: pubStatus,
    storyType: (dbRecord.storyType as Story['storyType']) || 'standard',
    evidenceScore: Number(dbRecord.evidenceScore || 0),
    readingTime: Number(dbRecord.readingTime || 5),
    publishedAt: String(dbRecord.publishedAt || new Date().toISOString()),
    createdAt: String(dbRecord.createdAt || new Date().toISOString()),
    updatedAt: String(dbRecord.updatedAt || new Date().toISOString()),
    tags: Array.isArray(dbRecord.tags) ? (dbRecord.tags as string[]) : [],
    blocks: Array.isArray(dbRecord.blocks) ? (dbRecord.blocks as StoryBlock[]) : [],
    sources: Array.isArray(dbRecord.sources) ? (dbRecord.sources as Source[]) : [],
    claims: Array.isArray(dbRecord.claims) ? (dbRecord.claims as Claim[]) : [],
    timeline: Array.isArray(dbRecord.timeline) ? (dbRecord.timeline as any[]) : [],
    faq: Array.isArray(dbRecord.faq) ? (dbRecord.faq as any[]) : [],
    charts: Array.isArray(dbRecord.charts) ? (dbRecord.charts as any[]) : [],
    relatedStoryIds: Array.isArray(dbRecord.relatedStoryIds) ? (dbRecord.relatedStoryIds as string[]) : [],
    relatedEntityIds: Array.isArray(dbRecord.relatedEntityIds) ? (dbRecord.relatedEntityIds as string[]) : [],
    relatedTopicIds: Array.isArray(dbRecord.relatedTopicIds) ? (dbRecord.relatedTopicIds as string[]) : [],
  };
}

import { cache } from 'react';
import { bootstrapServices } from '@/lib/bootstrap';
import { buildStoryPage } from '@/features/story/view-model';
import type { Chapter, Story, StoryTerminalViewModel, TimelineEvent } from '@/types/canonical';
import { seedAll, enrichClaimLazy, getKnowledgeCore, type EnrichedClaim } from '@/lib/knowledge/knowledge-core';
import { RepositoryFactory } from '@/services/factory/repository';
import { getKnowledgeLibrarySeedData } from '@/utils/data-layer/knowledge-library-data';
import { chapterToCanonicalAdapter } from '@/lib/story/adapters';
import { isCanonicalReadPathEnabled, getFeatureFlags, type FlagState } from '@/lib/feature-flags';

export interface ResolverTelemetry {
  event: 'story_read_resolution';
  slug: string;
  flag: FlagState;
  path: 'canonical' | 'legacy';
  chapterFound: boolean;
  claimCount: number;
  evidenceCount: number;
  resolution: 'success' | 'not_found' | 'error';
  fallbackUsed: boolean;
}

export function logResolverTelemetry(telemetry: ResolverTelemetry): void {
  console.log(JSON.stringify(telemetry));
}

export interface OperationalAlarm {
  event: 'operational_alarm';
  severity: 'P0' | 'P1' | 'P2';
  type: 'INVARIANT_VIOLATION_LEGACY_FALLBACK' | 'CANONICAL_RESOLUTION_FAILURE';
  slug: string;
  message: string;
  timestamp: string;
}

export function logOperationalAlarm(alarm: OperationalAlarm): void {
  console.error(`[ALARM][${alarm.severity}] ${JSON.stringify(alarm)}`);
}

export interface ChapterResolution {
  type: 'chapter';
  chapter: Chapter;
  canonicalStory: Story;
  candidateTimelineEvents: TimelineEvent[];
  relatedStories: Story[];
  collectionSlug: string;
  volumeSlug: string;
  enrichedClaims: EnrichedClaim[];
  claimCount: number;
  evidenceCount: number;
  thinkerCount: number;
  documentCount: number;
  nextChapter: { title: string; slug: string } | null;
  relatedInvestigation: { title: string; slug: string } | null;
}

export interface LegacyStoryResolution {
  type: 'legacy_story';
  canonicalStory: Story;
  candidateTimelineEvents: TimelineEvent[];
  relatedStories: Story[];
  vm: StoryTerminalViewModel;
}

export interface NotFoundResolution {
  type: 'not_found';
}

export type StoryResolution = ChapterResolution | LegacyStoryResolution | NotFoundResolution;

export const tryLoadChapter = cache(async function tryLoadChapter(slug: string): Promise<Omit<ChapterResolution, 'type' | 'canonicalStory' | 'candidateTimelineEvents' | 'relatedStories' | 'enrichedClaims' | 'claimCount' | 'evidenceCount' | 'thinkerCount' | 'documentCount'> & { chapter: Chapter } | null> {
  try {
    seedAll();
    const repo = RepositoryFactory.getKnowledgeLibraryRepository(getKnowledgeLibrarySeedData());
    const libraries = await repo.getAllLibraries();
    for (const library of libraries) {
      for (const c of library.collections) {
      for (const v of c.volumes) {
        const ch = v.chapters.find((ch) => ch.slug === slug);
        if (ch) {
          let nextChapter = null;
          if (ch.recommendedNext && ch.recommendedNext.length > 0) {
            nextChapter = v.chapters.find(
              (item) => ch.recommendedNext.includes(item.slug) || ch.recommendedNext.includes(item.title)
            );
          }
          if (!nextChapter) {
            nextChapter = v.chapters.find((item) => item.order === ch.order + 1);
          }

          const services = bootstrapServices({ publicOnly: true });
          const { data: investigations } = await services.investigations.getInvestigations();
          const relatedInvestigation =
            investigations.find((inv) => inv.chapters.some((ich) => ich.storySlug === slug)) || null;

          return {
            chapter: ch,
            collectionSlug: c.slug,
            volumeSlug: v.slug,
            nextChapter: nextChapter ? { title: nextChapter.title, slug: nextChapter.slug } : null,
            relatedInvestigation: relatedInvestigation
              ? { title: relatedInvestigation.title, slug: relatedInvestigation.slug }
              : null,
          };
        }
      }
    }
    }
  } catch (error) {
    console.error('[Resolver] tryLoadChapter error:', error);
  }
  return null;
});

type ReadPath = 'canonical' | 'legacy';

export function selectReadPath(slug: string): ReadPath {
  if (isCanonicalReadPathEnabled(slug)) {
    return 'canonical';
  }
  return 'legacy';
}

export async function resolveCanonicalStory(slug: string): Promise<StoryResolution> {
  const flagState = getFeatureFlags().CANONICAL_READ_PATH;
  const chapterData = await tryLoadChapter(slug);
  if (!chapterData) {
    logOperationalAlarm({
      event: 'operational_alarm',
      severity: 'P1',
      type: 'CANONICAL_RESOLUTION_FAILURE',
      slug,
      message: `Canonical read path active for slug '${slug}', but canonical chapter was not found. Failing closed with not_found.`,
      timestamp: new Date().toISOString(),
    });
    logResolverTelemetry({
      event: 'story_read_resolution',
      slug,
      flag: flagState,
      path: 'canonical',
      chapterFound: false,
      claimCount: 0,
      evidenceCount: 0,
      resolution: 'not_found',
      fallbackUsed: false,
    });
    return { type: 'not_found' };
  }

  const { chapter, collectionSlug, volumeSlug, nextChapter, relatedInvestigation } = chapterData;
  const core = getKnowledgeCore();
  const conceptClaimIds =
    chapter.relatedConceptIds?.flatMap((cid) => core.claims.byConcept(cid)).map((c) => c.id) || [];
  
  const inlineClaimIds = chapter.content
    .filter((b) => b.type === 'claim' && b.data?.claimId)
    .map((b) => b.data.claimId as string);

  const chapterClaimIds = Array.from(new Set([...conceptClaimIds, ...inlineClaimIds]));
  const enrichedClaims = chapterClaimIds
    .map((id) => enrichClaimLazy(id))
    .filter(Boolean) as NonNullable<ReturnType<typeof enrichClaimLazy>>[];

  const claimCount = enrichedClaims.length > 0 ? enrichedClaims.length : chapter.content.filter((b) => b.type === 'claim').length;
  const evidenceCount = enrichedClaims.reduce((acc, c) => acc + (c.evidence?.length || 0), 0) + chapter.content.filter((b) => b.type === 'evidence-summary').length;
  const thinkerCount = chapter.content.filter((b) => b.type === 'thinker').length;
  const documentCount = chapter.content.filter((b) => b.type === 'document').length;

  const canonicalStory = chapterToCanonicalAdapter(chapter);
  canonicalStory.claims = enrichedClaims.map(c => ({
    id: c.id,
    claim: c.statement,
    data: c.evidence?.map(e => e.excerpt).join(' ') || '',
    source: c._sources?.[0]?.title || '',
    sourceUrl: c._sources?.[0]?.url || '',
    tier: c._sources?.[0]?.tier || 3,
    confidence: c.confidence === 'established' ? 0.9 : c.confidence === 'debated' ? 0.6 : 0.4,
    status: c.confidence === 'established' ? 'verified' : c.confidence === 'debated' ? 'moderate' : 'unverified',
    counterArguments: c.counterArguments,
  })) as any;

  logResolverTelemetry({
    event: 'story_read_resolution',
    slug,
    flag: flagState,
    path: 'canonical',
    chapterFound: true,
    claimCount,
    evidenceCount,
    resolution: 'success',
    fallbackUsed: false,
  });

  return {
    type: 'chapter',
    chapter,
    canonicalStory,
    candidateTimelineEvents: chapter.sources ? [] : [],
    relatedStories: [],
    collectionSlug,
    volumeSlug,
    enrichedClaims,
    claimCount,
    evidenceCount,
    thinkerCount,
    documentCount,
    nextChapter,
    relatedInvestigation,
  };
}

export async function resolveLegacyStory(slug: string): Promise<StoryResolution> {
  const flagState = getFeatureFlags().CANONICAL_READ_PATH;
  const services = bootstrapServices({ publicOnly: true });
  const vm = await buildStoryPage(services, slug);
  if (!vm) {
    logResolverTelemetry({
      event: 'story_read_resolution',
      slug,
      flag: flagState,
      path: 'legacy',
      chapterFound: false,
      claimCount: 0,
      evidenceCount: 0,
      resolution: 'not_found',
      fallbackUsed: false,
    });
    return { type: 'not_found' };
  }

  const claimCount = vm.story?.claims?.length || 0;
  const evidenceCount = (vm.story as any)?.evidence?.length || 0;

  logResolverTelemetry({
    event: 'story_read_resolution',
    slug,
    flag: flagState,
    path: 'legacy',
    chapterFound: false,
    claimCount,
    evidenceCount,
    resolution: 'success',
    fallbackUsed: false,
  });

  return {
    type: 'legacy_story',
    canonicalStory: vm.story,
    candidateTimelineEvents: vm.unifiedTimeline || [],
    relatedStories: vm.relatedStories || [],
    vm,
  };
}

export async function resolveStory(slug: string): Promise<StoryResolution> {
  const path = selectReadPath(slug);
  
  if (path === 'canonical') {
    return resolveCanonicalStory(slug);
  }
  
  return resolveLegacyStory(slug);
}

export async function getAllStoryAndChapterSlugs(): Promise<{ slug: string }[]> {
  const services = bootstrapServices({ publicOnly: true });
  const storySlugs = (await services.stories.getPublicStories()).data.map((s) => ({ slug: s.slug }));
  const chapterSlugs: { slug: string }[] = [];
  try {
    seedAll();
    const repo = RepositoryFactory.getKnowledgeLibraryRepository(getKnowledgeLibrarySeedData());
    const libraries = await repo.getAllLibraries();
    for (const library of libraries) {
      for (const c of library.collections) {
        for (const v of c.volumes) {
          for (const ch of v.chapters) {
            chapterSlugs.push({ slug: ch.slug });
          }
        }
      }
    }
  } catch {}
  return [...storySlugs, ...chapterSlugs];
}

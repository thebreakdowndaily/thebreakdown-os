import { cache } from 'react';
import { bootstrapServices } from '@/lib/bootstrap';
import { buildStoryPage } from '@/features/story/view-model';
import type { Chapter, Story, StoryTerminalViewModel } from '@/types/canonical';
import { seedAll, enrichClaimLazy, getKnowledgeCore, type EnrichedClaim } from '@/lib/knowledge/knowledge-core';
import { RepositoryFactory } from '@/services/factory/repository';
import { getKnowledgeLibrarySeedData } from '@/utils/data-layer/knowledge-library-data';
import { chapterToCanonicalAdapter } from '@/lib/story/adapters';

export interface ChapterResolution {
  type: 'chapter';
  chapter: Chapter;
  canonicalStory: Story;
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
  vm: StoryTerminalViewModel;
}

export interface NotFoundResolution {
  type: 'not_found';
}

export type StoryResolution = ChapterResolution | LegacyStoryResolution | NotFoundResolution;

export const tryLoadChapter = cache(async function tryLoadChapter(slug: string): Promise<Omit<ChapterResolution, 'type' | 'canonicalStory' | 'enrichedClaims' | 'claimCount' | 'evidenceCount' | 'thinkerCount' | 'documentCount'> & { chapter: Chapter } | null> {
  try {
    seedAll();
    const repo = RepositoryFactory.getKnowledgeLibraryRepository(getKnowledgeLibrarySeedData());
    const library = await repo.getLibrary('india-and-the-world');
    if (!library) return null;
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
  } catch {}
  return null;
});

export async function resolveStory(slug: string): Promise<StoryResolution> {
  const chapterData = await tryLoadChapter(slug);
  if (chapterData) {
    const { chapter, collectionSlug, volumeSlug, nextChapter, relatedInvestigation } = chapterData;
    const core = getKnowledgeCore();
    const chapterClaimIds =
      chapter.relatedConceptIds?.flatMap((cid) => core.claims.byConcept(cid)).map((c) => c.id) || [];
    const enrichedClaims = chapterClaimIds
      .map((id) => enrichClaimLazy(id))
      .filter(Boolean) as NonNullable<ReturnType<typeof enrichClaimLazy>>[];

    const claimCount = chapter.content.filter((b) => b.type === 'claim').length;
    const evidenceCount = chapter.content.filter((b) => b.type === 'evidence-summary').length;
    const thinkerCount = chapter.content.filter((b) => b.type === 'thinker').length;
    const documentCount = chapter.content.filter((b) => b.type === 'document').length;

    return {
      type: 'chapter',
      chapter,
      canonicalStory: chapterToCanonicalAdapter(chapter),
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

  const services = bootstrapServices({ publicOnly: true });
  const vm = await buildStoryPage(services, slug);
  if (!vm) {
    return { type: 'not_found' };
  }

  return {
    type: 'legacy_story',
    vm,
  };
}

export async function getAllStoryAndChapterSlugs(): Promise<{ slug: string }[]> {
  const services = bootstrapServices({ publicOnly: true });
  const storySlugs = (await services.stories.getPublicStories()).data.map((s) => ({ slug: s.slug }));
  const chapterSlugs: { slug: string }[] = [];
  try {
    seedAll();
    const repo = RepositoryFactory.getKnowledgeLibraryRepository(getKnowledgeLibrarySeedData());
    const library = await repo.getLibrary('india-and-the-world');
    if (library) {
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

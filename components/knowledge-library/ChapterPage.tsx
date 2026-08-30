import { StoryExperienceController, type ChapterMetadata } from '@/components/rxs/StoryExperienceController';
import { StoryShell } from '@/components/rxs/StoryShell';
import type { Chapter } from '@/types/canonical';
import type { ChapterGraph } from '@/lib/knowledge/knowledge-graph';
import type { EnrichedClaim } from '@/lib/knowledge/knowledge-core';

export function ChapterPageShell({
  chapter,
  collectionSlug,
  volumeSlug,
  graph,
  enrichedClaims,
  nextChapter,
  relatedInvestigation,
}: {
  chapter: Chapter;
  collectionSlug: string;
  volumeSlug: string;
  graph?: ChapterGraph;
  enrichedClaims?: EnrichedClaim[];
  nextChapter?: { title: string; slug: string } | null;
  relatedInvestigation?: { title: string; slug: string } | null;
}) {
  const claimCount = chapter.content?.filter(b => b.type === 'claim').length || chapter.claims?.length || 0;
  const evidenceCount = chapter.content?.filter(b => b.type === 'evidence-summary').length || 0;
  const thinkerCount = chapter.content?.filter(b => b.type === 'thinker').length || 0;
  const documentCount = chapter.content?.filter(b => b.type === 'document').length || 0;

  const chapterMetadata: ChapterMetadata = {
    slug: chapter.slug,
    title: chapter.title,
    claimCount,
    evidenceCount,
  };

  return (
    <StoryExperienceController
      chapterMetadata={chapterMetadata}
      sources={chapter.sources || []}
    >
      <StoryShell
        chapter={chapter}
        collectionSlug={collectionSlug}
        volumeSlug={volumeSlug}
        enrichedClaims={enrichedClaims}
        claimCount={claimCount}
        evidenceCount={evidenceCount}
        thinkerCount={thinkerCount}
        documentCount={documentCount}
        graph={graph}
        nextChapter={nextChapter}
        relatedInvestigation={relatedInvestigation}
      />
    </StoryExperienceController>
  );
}

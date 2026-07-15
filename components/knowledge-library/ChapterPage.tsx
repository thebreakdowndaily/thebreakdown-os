'use client';

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
}: {
  chapter: Chapter;
  collectionSlug: string;
  volumeSlug: string;
  graph?: ChapterGraph;
  enrichedClaims?: EnrichedClaim[];
}) {
  const claimCount = chapter.content.filter(b => b.type === 'claim').length;
  const evidenceCount = chapter.content.filter(b => b.type === 'evidence-summary').length;
  const thinkerCount = chapter.content.filter(b => b.type === 'thinker').length;
  const documentCount = chapter.content.filter(b => b.type === 'document').length;

  return (
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
    />
  );
}

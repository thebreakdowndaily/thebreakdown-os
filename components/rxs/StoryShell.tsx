'use client';
// @rxs/implementation: contracts/story-shell.md — StoryShell orchestrator, composes 5 regions via StoryExperienceController

import { StoryLayout } from '@/components/rxs/StoryLayout';
import { HeroRegion } from '@/components/rxs/regions/HeroRegion';
import { ContextRegion } from '@/components/rxs/regions/ContextRegion';
import { ReadingRegion } from '@/components/rxs/regions/ReadingRegion';
import { KnowledgeRegion } from '@/components/rxs/regions/KnowledgeRegion';
import { CompletionRegion } from '@/components/rxs/regions/CompletionRegion';
import { StoryProgress } from '@/components/rxs/StoryProgress';
import { StoryExperienceController } from '@/components/rxs/StoryExperienceController';
import { ReaderOrientation } from '@/components/rxs/ReaderOrientation';
import { extractTocItems } from '@/lib/toc';
import type { Chapter } from '@/types/canonical';
import type { EnrichedClaim } from '@/lib/knowledge/knowledge-core';

interface StoryShellProps {
  chapter: Chapter;
  collectionSlug: string;
  volumeSlug: string;
  enrichedClaims?: EnrichedClaim[];
  claimCount: number;
  evidenceCount: number;
  thinkerCount: number;
  documentCount: number;
}

export function StoryShell({
  chapter,
  collectionSlug,
  volumeSlug,
  enrichedClaims,
  claimCount,
  evidenceCount,
  thinkerCount,
  documentCount,
}: StoryShellProps) {
  const tocItems = extractTocItems(chapter.content);

  return (
    <StoryExperienceController chapter={chapter}>
      <StoryLayout
        toc={<ReaderOrientation items={tocItems} />}
        sidebar={
          <KnowledgeRegion
            chapter={chapter}
            claimCount={claimCount}
            evidenceCount={evidenceCount}
            thinkerCount={thinkerCount}
            documentCount={documentCount}
          />
        }
      >
        <HeroRegion chapter={chapter} collectionSlug={collectionSlug} volumeSlug={volumeSlug} />
        <StoryProgress />
        <ContextRegion chapter={chapter} />
        <ReadingRegion chapter={chapter} enrichedClaims={enrichedClaims} />
        <CompletionRegion chapter={chapter} collectionSlug={collectionSlug} volumeSlug={volumeSlug} />
      </StoryLayout>
    </StoryExperienceController>
  );
}

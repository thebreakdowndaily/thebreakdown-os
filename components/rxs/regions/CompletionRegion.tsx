// @rxs/implementation: screens/story.md — CompletionRegion (continue learning, explore, help/feedback)
import { LearningFooter } from '@/components/rxs/LearningFooter';
import type { Chapter } from '@/types/canonical';

export function CompletionRegion({
  chapter,
  collectionSlug,
  volumeSlug,
  nextChapter,
  relatedInvestigation,
}: {
  chapter: Chapter;
  collectionSlug: string;
  volumeSlug: string;
  nextChapter?: { title: string; slug: string } | null;
  relatedInvestigation?: { title: string; slug: string } | null;
}) {
  return (
    <footer data-region="completion">
      <LearningFooter
        chapter={chapter}
        collectionSlug={collectionSlug}
        volumeSlug={volumeSlug}
        nextChapter={nextChapter}
        relatedInvestigation={relatedInvestigation}
      />
    </footer>
  );
}

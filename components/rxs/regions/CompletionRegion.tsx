// @rxs/implementation: screens/story.md — CompletionRegion (continue learning, explore, help/feedback)
import { LearningFooter } from '@/components/rxs/LearningFooter';
import type { Chapter } from '@/types/canonical';

export function CompletionRegion({
  chapter,
  collectionSlug,
  volumeSlug,
}: {
  chapter: Chapter;
  collectionSlug: string;
  volumeSlug: string;
}) {
  return (
    <footer data-region="completion">
      <LearningFooter chapter={chapter} collectionSlug={collectionSlug} volumeSlug={volumeSlug} />
    </footer>
  );
}

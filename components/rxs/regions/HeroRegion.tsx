// @rxs/implementation: screens/story.md — HeroRegion (breadcrumb, title, trust, metadata)
import { StoryHero } from '@/components/rxs/StoryHero';
import type { Chapter } from '@/types/canonical';

export function HeroRegion({
  chapter,
  collectionSlug,
  volumeSlug,
}: {
  chapter: Chapter;
  collectionSlug: string;
  volumeSlug: string;
}) {
  return (
    <section data-region="hero">
      <StoryHero chapter={chapter} collectionSlug={collectionSlug} volumeSlug={volumeSlug} />
    </section>
  );
}

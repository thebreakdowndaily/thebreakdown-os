import type { APIStory } from '@/utils/data-layer/types';
import Container from '@/components/ui/Container';
import SectionHeader from '@/components/ui/SectionHeader';
import FeaturedHeroCard from './FeaturedHeroCard';
import FeaturedStoryCard from './FeaturedStoryCard';

interface FeaturedStoriesProps {
  stories: APIStory[];
}

export default function FeaturedStories({ stories }: FeaturedStoriesProps) {
  const featured = stories.slice(0, 4);
  if (featured.length === 0) {
    return (
      <Container as="section" className="py-16 sm:py-20">
        <p className="text-[#A1A1AA] text-center">No featured stories yet.</p>
      </Container>
    );
  }

  const [hero, ...side] = featured;

  return (
    <Container as="section" className="py-16 sm:py-20">
      <SectionHeader
        eyebrow="Editorial"
        title="Featured Analysis"
      />

      <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
        <FeaturedHeroCard story={hero} />
        <div className="flex flex-col gap-4 sm:gap-6">
          {side.map((story) => (
            <FeaturedStoryCard key={story.id} story={story} />
          ))}
        </div>
      </div>
    </Container>
  );
}

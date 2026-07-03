import type { APIStory } from '@/utils/data-layer/types';
import FeaturedHeroCard from './FeaturedHeroCard';
import FeaturedStoryCard from './FeaturedStoryCard';

interface FeaturedStoriesProps {
  stories: APIStory[];
}

export default function FeaturedStories({ stories }: FeaturedStoriesProps) {
  const featured = stories.slice(0, 4);
  if (featured.length === 0) {
    return (
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <p className="text-gray-500 text-center">No featured stories yet.</p>
      </section>
    );
  }

  const [hero, ...side] = featured;

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-1 h-6 bg-amber-500 rounded-full" />
        <h2 className="text-2xl sm:text-3xl font-bold text-white">Featured Analysis</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
        <FeaturedHeroCard story={hero} />
        <div className="flex flex-col gap-4 sm:gap-6">
          {side.map((story) => (
            <FeaturedStoryCard key={story.id} story={story} />
          ))}
        </div>
      </div>
    </section>
  );
}

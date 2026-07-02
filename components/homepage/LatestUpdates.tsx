import React from 'react';
import StoryImage from '@/components/story/StoryImage';
import Container from '@/components/layout/Container';

interface Story {
  slug: string;
  headline: string;
  summary: string;
  heroImage?: string;
  publishedAt: string;
  readingTime: number;
  evidenceScore: number;
  category: string;
}

interface LatestUpdatesProps {
  stories: Story[];
}

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(iso));

const LatestUpdates: React.FC<LatestUpdatesProps> = ({ stories }) => {
  if (stories.length === 0) return null;

  return (
    <section aria-label="Latest updates" className="py-8">
      <Container>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-100 mb-6">Latest Updates</h2>
      <div className="bg-gray-800 border border-gray-700 rounded-xl divide-y divide-gray-700">
        {stories.map((story) => (
          <div key={story.slug} className="flex items-start gap-4 p-4 sm:px-5">
            <time
              dateTime={story.publishedAt}
              className="text-sm text-gray-500 flex-shrink-0 w-16 sm:w-20 text-right pt-0.5"
            >
              {formatDate(story.publishedAt)}
            </time>
            <div className="flex-1 min-w-0">
              <a
                href={`/story/${story.slug}`}
                className="text-sm font-medium text-gray-100 hover:text-amber-400 transition-colors leading-snug"
              >
                {story.headline}
              </a>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-700 text-gray-300">
                {story.category}
              </span>
              <span className="text-xs text-gray-500">{story.readingTime} min</span>
            </div>
          </div>
        ))}
      </div>
      </Container>
    </section>
  );
};

export default LatestUpdates;

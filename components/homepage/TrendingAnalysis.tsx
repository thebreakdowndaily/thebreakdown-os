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

interface TrendingAnalysisProps {
  stories: Story[];
}

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(iso));

const evidenceBadgeColor = (score: number) => {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-amber-400';
  if (score >= 40) return 'bg-orange-500';
  return 'bg-red-500';
};

const TrendingAnalysis: React.FC<TrendingAnalysisProps> = ({ stories }) => {
  if (stories.length === 0) return null;

  return (
    <section aria-label="Trending analysis" className="py-8">
      <Container>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-100 mb-6 flex items-center gap-2">
        <span className="text-amber-400" aria-hidden="true">&#9654;</span>
        Trending Analysis
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {stories.slice(0, 4).map((story) => (
          <a
            key={story.slug}
            href={`/story/${story.slug}`}
            className="group bg-gray-800 border border-gray-700 rounded-xl overflow-hidden hover:border-amber-400/50 transition-colors"
          >
            {story.heroImage && (
              <div className="w-full h-40 overflow-hidden">
                <StoryImage
                  src={story.heroImage}
                  category={story.category}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            <div className="p-4">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white mb-2 ${evidenceBadgeColor(story.evidenceScore)}`}
              >
                {story.evidenceScore}% Evidence
              </span>
              <h3 className="text-sm font-semibold text-gray-100 group-hover:text-amber-400 transition-colors mb-1 leading-snug">
                {story.headline}
              </h3>
              <p className="text-xs text-gray-400 line-clamp-2 mb-3">{story.summary}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <time dateTime={story.publishedAt}>{formatDate(story.publishedAt)}</time>
                <span aria-hidden="true">&middot;</span>
                <span>{story.readingTime} min read</span>
              </div>
            </div>
          </a>
        ))}
      </div>
      </Container>
    </section>
  );
};

export default TrendingAnalysis;

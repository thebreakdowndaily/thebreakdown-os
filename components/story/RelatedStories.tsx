import React from 'react';

interface RelatedStoriesProps {
  stories: Array<{
    slug: string;
    headline: string;
    summary: string;
    heroImage?: string;
    publishedAt: string;
    readingTime: number;
    evidenceScore: number;
    category: string;
  }>;
}

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(iso));

const evidenceBadge = (score: number) => {
  const bg = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-amber-400' : score >= 40 ? 'bg-orange-500' : 'bg-red-500';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold text-white ${bg}`}>
      {score}%
    </span>
  );
};

const RelatedStories: React.FC<RelatedStoriesProps> = ({ stories }) => (
  <section aria-label="Related stories" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h2 className="text-xl sm:text-2xl font-bold text-gray-100 mb-6">Related Stories</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {stories.map((story) => (
        <a
          key={story.slug}
          href={`/story/${story.slug}`}
          className="group bg-gray-800 border border-gray-700 rounded-xl overflow-hidden hover:border-amber-400/50 transition-colors flex flex-col"
        >
          {story.heroImage && (
            <div className="aspect-video overflow-hidden">
              <img
                src={story.heroImage}
                alt=""
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                aria-hidden="true"
              />
            </div>
          )}
          <div className="p-4 flex flex-col flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded bg-gray-700 text-xs font-medium text-gray-300">
                {story.category}
              </span>
              {evidenceBadge(story.evidenceScore)}
            </div>
            <h3 className="font-semibold text-gray-100 group-hover:text-amber-400 transition-colors mb-2">
              {story.headline}
            </h3>
            <p className="text-sm text-gray-400 mb-3 flex-1 line-clamp-2">{story.summary}</p>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <time dateTime={story.publishedAt}>{formatDate(story.publishedAt)}</time>
              <span>{story.readingTime} min read</span>
            </div>
          </div>
        </a>
      ))}
    </div>
  </section>
);

export default RelatedStories;

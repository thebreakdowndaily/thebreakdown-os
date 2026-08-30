import React from 'react';

interface RelatedStoriesProps {
  stories: Array<{
    slug: string;
    headline: string;
    summary: string;
    heroImage?: string;
    publishedAt: string;
    readingTime: number;
    evidenceScore?: number;
    category: string;
  }>;
}

const formatDate = (iso: string) => {
  try {
    return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(iso));
  } catch {
    return '';
  }
};

const RelatedStories: React.FC<RelatedStoriesProps> = ({ stories }) => {
  if (!stories || stories.length === 0) return null;

  return (
    <section aria-label="Related stories" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">Related Stories</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stories.map((story) => {
          const hasImage = story.heroImage && !story.heroImage.includes('placehold.co') && story.heroImage.trim().length > 0;

          return (
            <a
              key={story.slug}
              href={`/story/${story.slug}`}
              data-analytics="related_story"
              data-content-id={story.slug}
              data-position={stories.indexOf(story) + 1}
              className="group bg-neutral-900/60 border border-neutral-800 rounded-2xl overflow-hidden hover:border-emerald-500/50 transition-colors flex flex-col backdrop-blur-sm"
            >
              {hasImage && (
                <div className="aspect-video overflow-hidden bg-neutral-950">
                  <img
                    src={story.heroImage}
                    alt={story.headline}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                  />
                </div>
              )}
              <div className="p-5 flex flex-col flex-1 space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 text-[10px] font-mono font-bold uppercase tracking-wider">
                    {story.category}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400 font-medium">Evidence reviewed</span>
                </div>
                <h3 className="font-bold text-base text-white group-hover:text-emerald-400 transition-colors leading-snug">
                  {story.headline}
                </h3>
                {story.summary && (
                  <p className="text-xs text-neutral-400 flex-1 line-clamp-2 leading-relaxed">{story.summary}</p>
                )}
                <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono pt-2 border-t border-neutral-800/60">
                  <time dateTime={story.publishedAt}>{formatDate(story.publishedAt)}</time>
                  <span>•</span>
                  <span>{story.readingTime} min read</span>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
};

export default RelatedStories;

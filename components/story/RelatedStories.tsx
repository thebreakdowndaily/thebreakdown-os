import React from 'react';
import Image from 'next/image';

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

const RelatedStories: React.FC<RelatedStoriesProps> = ({ stories }) => {
  if (!stories || stories.length === 0) return null;

  return (
    <section aria-label="Related stories" className="max-w-[720px] mx-auto px-4 sm:px-6 mb-16 pt-8 border-t border-neutral-800/60">
      <h2 className="text-xs font-semibold tracking-widest uppercase text-neutral-500 mb-8">
        Related Reading
      </h2>
      <div className="grid grid-cols-1 gap-6">
        {stories.map((story) => (
          <a
            key={story.slug}
            href={`/story/${story.slug}`}
            className="group flex flex-col sm:flex-row gap-4 sm:gap-6 items-start"
          >
            {story.heroImage && (
              <div className="w-full sm:w-[240px] aspect-[4/3] rounded-xl overflow-hidden relative shrink-0 bg-neutral-900">
                <Image
                  src={story.heroImage}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, 240px"
                  className="object-cover group-hover:scale-[1.03] transition-transform duration-300 ease-out"
                  aria-hidden="true"
                />
              </div>
            )}
            <div className="flex flex-col flex-1 py-1">
              <div className="flex items-center gap-3 mb-2.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                  {story.category}
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                  {story.evidenceScore}% Score
                </span>
              </div>
              <h3 className="text-lg font-medium text-neutral-100 group-hover:text-amber-400 transition-colors mb-2 leading-snug">
                {story.headline}
              </h3>
              <p className="text-sm text-neutral-400 mb-3 line-clamp-2 leading-relaxed">
                {story.summary}
              </p>
              <div className="flex items-center gap-2 text-xs font-medium text-neutral-500 mt-auto">
                <time dateTime={story.publishedAt}>{formatDate(story.publishedAt)}</time>
                <span>&middot;</span>
                <span>{story.readingTime} min read</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};

export default RelatedStories;

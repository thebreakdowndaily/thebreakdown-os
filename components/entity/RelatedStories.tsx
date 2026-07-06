import React from 'react';
import type { RelatedStory } from '@/utils/types';

interface RelatedStoriesProps {
  stories: RelatedStory[];
}

const categoryColors: Record<string, string> = {
  economy: 'bg-blue-500/10 text-blue-400',
  policy: 'bg-[#D4A843]/10 text-[#D4A843]',
  technology: 'bg-cyan-500/10 text-cyan-400',
  health: 'bg-green-500/10 text-green-400',
  education: 'bg-purple-500/10 text-purple-400',
  default: 'bg-gray-500/10 text-gray-400',
};

export default function RelatedStories({ stories }: RelatedStoriesProps) {
  if (stories.length === 0) return null;
  return (
    <section aria-label="Related stories" className="py-6 sm:py-8">
      <h2 className="text-lg sm:text-xl font-bold text-[#F5F5F5] mb-5">Related Stories</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stories.map((story, i) => {
          const catColor = categoryColors[story.category] || categoryColors.default;
          return (
            <article key={i} className="bg-[#151515] border border-[#2A2A2A] rounded-xl p-5 hover:border-[#D4A843]/50 transition-colors">
              <a href={`/story/${story.slug}`} className="block">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${catColor}`}>
                    {story.category}
                  </span>
                  <span className="text-xs text-[#A1A1AA]">
                    {story.readingTime} min read
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-[#F5F5F5] group-hover:text-[#D4A843] transition-colors mb-2 leading-snug">
                  {story.headline}
                </h3>
                {story.summary && (
                  <p className="text-xs text-[#A1A1AA] line-clamp-2 mb-3">{story.summary}</p>
                )}
                <div className="flex items-center justify-between">
                  <time className="text-xs text-[#A1A1AA]">
                    {new Date(story.publishedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' })}
                  </time>
                  <span className="text-xs font-medium text-[#22C55E]">{story.evidenceScore}%</span>
                </div>
              </a>
            </article>
          );
        })}
      </div>
    </section>
  );
}

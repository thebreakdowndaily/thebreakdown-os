'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { APIStory } from '@/utils/data-layer/types';

interface StoriesArchiveProps {
  initialStories: APIStory[];
}

const CATEGORIES = [
  'All',
  'Economy',
  'Policy',
  'Technology',
  'Geopolitics',
  'Environment',
  'Health',
  'Politics',
];

export default function StoriesArchive({ initialStories }: StoriesArchiveProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStories = useMemo(() => {
    return initialStories.filter((story) => {
      const matchesCategory =
        selectedCategory === 'All' ||
        story.category?.toLowerCase() === selectedCategory.toLowerCase();

      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        story.headline.toLowerCase().includes(query) ||
        story.summary.toLowerCase().includes(query) ||
        story.category?.toLowerCase().includes(query) ||
        (story.tags && story.tags.some((t) => t.toLowerCase().includes(query)));

      return matchesCategory && matchesSearch;
    });
  }, [initialStories, selectedCategory, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-[#14161C] p-4 rounded-xl border border-neutral-800">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 items-center" role="tablist" aria-label="Filter stories by category">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-lg transition-all ${
                  isActive
                    ? 'bg-amber-500 text-neutral-950 font-bold shadow'
                    : 'bg-neutral-900 text-neutral-300 hover:text-white hover:bg-neutral-800 border border-neutral-800'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div className="relative min-w-[240px]">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stories, topics, tags..."
            aria-label="Search stories"
            className="w-full px-3.5 py-1.5 text-sm bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-white"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
        <span>
          Showing {filteredStories.length} {filteredStories.length === 1 ? 'story' : 'stories'}
          {selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}
          {searchQuery ? ` matching "${searchQuery}"` : ''}
        </span>
      </div>

      {/* Story Grid */}
      {filteredStories.length === 0 ? (
        <div className="text-center py-16 bg-[#14161C] border border-neutral-800 rounded-2xl p-8">
          <p className="text-neutral-400 text-lg mb-2">No published stories match your criteria.</p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            className="text-amber-400 text-sm font-semibold hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStories.map((story) => {
            const dateStr = story.publishedAt
              ? new Date(story.publishedAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : '';

            const authorName =
              typeof story.author === 'string'
                ? story.author
                : story.author?.name || 'The Breakdown Editorial';

            const heroImg = story.heroImage || `/images/placeholders/${(story.category || 'policy').toLowerCase()}-placeholder.svg`;

            return (
              <article
                key={story.slug}
                className="group flex flex-col bg-[#14161C] rounded-2xl border border-neutral-800 overflow-hidden hover:border-amber-500/50 transition-all duration-200 hover:shadow-xl hover:shadow-black/50"
              >
                {/* Story Image */}
                <Link href={`/story/${story.slug}`} className="block relative aspect-video w-full overflow-hidden bg-neutral-900">
                  <img
                    src={heroImg}
                    alt={story.headline}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                    onError={(e) => {
                      const target = e.currentTarget;
                      const fallback = `/images/placeholders/${(story.category || 'policy').toLowerCase()}-placeholder.svg`;
                      if (target.src !== fallback && !target.src.endsWith(fallback)) {
                        target.src = fallback;
                      }
                    }}
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-black/80 text-amber-300 border border-amber-500/30 backdrop-blur-md">
                      {story.category || 'General'}
                    </span>
                  </div>
                </Link>

                {/* Content */}
                <div className="flex flex-col flex-1 p-6">
                  {/* Metadata line */}
                  <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 mb-2">
                    {dateStr && <span>{dateStr}</span>}
                    <span>•</span>
                    <span>{story.readingTime || 5} min read</span>
                    {story.evidenceScore ? (
                      <>
                        <span>•</span>
                        <span className="text-emerald-400 font-semibold">{story.evidenceScore}% Verified</span>
                      </>
                    ) : null}
                  </div>

                  {/* Headline */}
                  <h2 className="text-xl font-bold font-serif text-white group-hover:text-amber-400 transition-colors leading-snug mb-3">
                    <Link href={`/story/${story.slug}`}>
                      {story.headline}
                    </Link>
                  </h2>

                  {/* Dek / Summary */}
                  <p className="text-sm text-neutral-300 leading-relaxed line-clamp-3 mb-6 flex-1">
                    {story.summary}
                  </p>

                  {/* Footer link & author */}
                  <div className="pt-4 border-t border-neutral-800/80 flex items-center justify-between text-xs">
                    <span className="text-neutral-400 font-medium truncate max-w-[160px]">
                      {authorName}
                    </span>
                    <Link
                      href={`/story/${story.slug}`}
                      className="inline-flex items-center gap-1 font-mono font-bold text-amber-400 group-hover:translate-x-0.5 transition-transform"
                    >
                      Read Story <span>→</span>
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

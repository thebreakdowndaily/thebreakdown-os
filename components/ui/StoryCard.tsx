import React from 'react';
import ScoreBadge from './ScoreBadge';
import StoryImage from '@/components/story/StoryImage';
import { cn } from '@/utils/cn';

interface StoryCardStory {
  slug: string;
  headline: string;
  summary: string;
  heroImage?: string;
  publishedAt: string;
  readingTime: number;
  evidenceScore: number;
  category: string;
}

interface StoryCardProps {
  story: StoryCardStory;
  variant?: 'default' | 'compact' | 'featured';
}

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(iso));

/* ── Category badge colours ──────────────────────────────────────────── */
const CategoryBadge = ({ category }: { category: string }) => {
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-[10px] font-medium bg-surface-tertiary text-text-secondary uppercase tracking-widest border border-border">
      {category}
    </span>
  );
};

/* ── Featured variant ──────────────────────────────────────────────────── */
const FeaturedStory: React.FC<StoryCardProps> = ({ story }) => (
  <article
    className="group relative w-full overflow-hidden border border-border bg-surface-secondary hover:border-border-hover transition-colors"
    aria-label={story.headline}
  >
    <a href={`/story/${story.slug}`} className="block text-text-primary no-underline h-full flex flex-col md:flex-row" aria-label={story.headline}>
      {story.heroImage && (
        <div className="relative w-full md:w-3/5 h-64 md:h-full shrink-0 border-b md:border-b-0 md:border-r border-border">
          <StoryImage
            src={story.heroImage}
            category={story.category}
            alt=""
            className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-slow"
          />
        </div>
      )}
      <div className="p-6 md:p-8 flex flex-col justify-between flex-1">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <CategoryBadge category={story.category} />
            <span className="text-sm text-text-muted font-mono">{formatDate(story.publishedAt)}</span>
          </div>
          <h3 className="text-3xl md:text-4xl font-serif font-bold text-text-primary mb-3 leading-tight group-hover:text-brand-400 transition-colors">
            {story.headline}
          </h3>
          <p className="text-base text-text-secondary line-clamp-3 mb-6">
            {story.summary}
          </p>
        </div>
        <div className="flex items-center justify-between border-t border-border pt-4 mt-auto">
          <span className="text-xs text-text-muted font-mono uppercase">{story.readingTime} min read</span>
          <ScoreBadge score={story.evidenceScore} size="sm" />
        </div>
      </div>
    </a>
  </article>
);

/* ── Compact variant ────────────────────────────────────────────────────── */
const CompactStory: React.FC<StoryCardProps> = ({ story }) => (
  <article 
    className="group border-b border-border last:border-0 hover:bg-surface-secondary transition-colors" 
    aria-label={story.headline}
  >
    <a
      href={`/story/${story.slug}`}
      className="flex items-start gap-4 py-3 text-text-primary no-underline"
      aria-label={story.headline}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] text-brand-500 font-mono uppercase tracking-wider">{story.category}</span>
          <span className="text-[10px] text-text-muted font-mono">&middot;</span>
          <span className="text-[10px] text-text-muted font-mono">{formatDate(story.publishedAt)}</span>
        </div>
        <h3 className="text-sm font-semibold text-text-primary group-hover:text-brand-400 transition-colors mb-1">
          {story.headline}
        </h3>
        <p className="text-xs text-text-secondary line-clamp-1 mb-2">
          {story.summary}
        </p>
      </div>
      {story.heroImage && (
        <div className="shrink-0 w-16 h-16 bg-surface-tertiary border border-border">
          <StoryImage src={story.heroImage} category={story.category} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-fast" />
        </div>
      )}
    </a>
  </article>
);

/* ── Default variant ───────────────────────────────────────────────────── */
const DefaultStory: React.FC<StoryCardProps> = ({ story }) => (
  <article
    className="group border border-border bg-surface-secondary hover:border-border-hover transition-colors h-full flex flex-col"
    aria-label={story.headline}
  >
    <a href={`/story/${story.slug}`} className="block text-text-primary no-underline h-full flex flex-col" aria-label={story.headline}>
      {story.heroImage && (
        <div className="w-full h-48 border-b border-border overflow-hidden bg-surface-tertiary">
          <StoryImage
            src={story.heroImage}
            category={story.category}
            alt=""
            className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-fast"
          />
        </div>
      )}
      <div className="p-4 md:p-5 flex flex-col flex-1">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <CategoryBadge category={story.category} />
          <span className="text-xs text-text-muted font-mono">{formatDate(story.publishedAt)}</span>
        </div>
        <h3 className="text-xl font-serif font-bold text-text-primary mb-2 line-clamp-2 group-hover:text-brand-400 transition-colors">
          {story.headline}
        </h3>
        <p className="text-sm text-text-secondary line-clamp-2 mb-4 flex-1">
          {story.summary}
        </p>
        <div className="flex items-center justify-between border-t border-border pt-3 mt-auto">
          <span className="text-xs text-text-muted font-mono uppercase tracking-wider">{story.readingTime} min</span>
          <ScoreBadge score={story.evidenceScore} size="sm" />
        </div>
      </div>
    </a>
  </article>
);

/* ── StoryCard root ───────────────────────────────────────────────────── */
const StoryCard: React.FC<StoryCardProps> = ({ story, variant = 'default' }) => {
  if (variant === 'featured') return <FeaturedStory story={story} />;
  if (variant === 'compact') return <CompactStory story={story} />;
  return <DefaultStory story={story} />;
};

export default StoryCard;

import React from 'react';
import ScoreBadge from './ScoreBadge';
import StoryImage from '@/components/story/StoryImage';

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
const categoryBadge = (category: string) => {
  const palette: Record<string, { bg: string; text: string }> = {
    policy:      { bg: 'var(--color-blue-500)',   text: 'var(--color-blue-300)' },
    economy:     { bg: 'var(--color-emerald-500)', text: 'var(--color-emerald-300)' },
    technology:  { bg: 'var(--color-purple-500)',  text: 'var(--color-purple-300)' },
    health:      { bg: 'var(--color-cyan-500)',    text: 'var(--color-cyan-300)' },
    environment: { bg: 'var(--color-emerald-500)', text: 'var(--color-emerald-300)' },
    education:   { bg: 'var(--color-yellow-500)',  text: 'var(--color-yellow-300)' },
    politics:    { bg: 'var(--color-orange-500)',  text: 'var(--color-orange-300)' },
    security:    { bg: 'var(--color-red-500)',     text: 'var(--color-red-300)' },
    default:     { bg: 'var(--color-neutral-500)', text: 'var(--color-text-muted)' },
  };

  const c = palette[category.toLowerCase()] || palette.default;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: 'var(--radius-sm)',
        fontSize: 'var(--text-xs)',
        fontWeight: 'var(--font-weight-medium)',
        backgroundColor: `color-mix(in srgb, ${c.bg} 20%, transparent)`,
        color: c.text,
      }}
    >
      {category}
    </span>
  );
};

/* ── Shared constants ────────────────────────────────────────────────── */
const articleStyle: React.CSSProperties = {
  border: '1px solid var(--color-border-default)',
  backgroundColor: 'var(--color-bg-secondary)',
  transition: 'border-color var(--duration-fast) var(--easing-out)',
};

const linkStyle: React.CSSProperties = {
  color: 'var(--color-text-primary)',
  textDecoration: 'none',
  display: 'block',
};

/* ── Featured variant ──────────────────────────────────────────────────── */
const FeaturedStory: React.FC<StoryCardProps> = ({ story }) => (
  <article
    className="group"
    style={{
      ...articleStyle,
      borderRadius: 'var(--radius-xl)',
      position: 'relative',
      width: '100%',
      overflow: 'hidden',
    }}
    aria-label={story.headline}
  >
    <a href={`/story/${story.slug}`} style={linkStyle} aria-label={story.headline}>
      {story.heroImage && (
        <div style={{ position: 'relative', width: '100%', height: 'clamp(16rem, 40vh, 24rem)' }}>
          <StoryImage
            src={story.heroImage}
            category={story.category}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(to top, var(--color-bg-primary), color-mix(in srgb, var(--color-bg-primary) 50%, transparent) 60%, transparent)',
            }}
          />
        </div>
      )}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: 'var(--spacing-6) var(--spacing-8)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 'var(--spacing-3)',
            marginBottom: 'var(--spacing-3)',
          }}
        >
          {categoryBadge(story.category)}
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
            {formatDate(story.publishedAt)}
          </span>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
            {story.readingTime} min read
          </span>
        </div>
        <h3
          className="group-hover-accent"
          style={{
            fontSize: 'clamp(var(--text-2xl), 3vw, var(--text-3xl))',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--spacing-2)',
          }}
        >
          {story.headline}
        </h3>
        <p
          style={{
            color: 'var(--color-text-secondary)',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            maxWidth: '48rem',
          }}
        >
          {story.summary}
        </p>
        <div style={{ marginTop: 'var(--spacing-4)' }}>
          <ScoreBadge score={story.evidenceScore} size="sm" />
        </div>
      </div>
    </a>
  </article>
);

/* ── Compact variant ────────────────────────────────────────────────────── */
const CompactStory: React.FC<StoryCardProps> = ({ story }) => (
  <article className="group" style={{ ...articleStyle, borderRadius: 'var(--radius-lg)' }} aria-label={story.headline}>
    <a
      href={`/story/${story.slug}`}
      style={{ ...linkStyle, display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)', padding: 'var(--spacing-3)' }}
      aria-label={story.headline}
    >
      {story.heroImage && (
        <div style={{ flexShrink: 0, width: '5rem', height: '5rem', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <StoryImage src={story.heroImage} category={story.category} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3
          className="group-hover-accent"
          style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--color-text-primary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {story.headline}
        </h3>
        <p
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
            marginTop: 'var(--spacing-1)',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {story.summary}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', marginTop: 'var(--spacing-2)' }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{formatDate(story.publishedAt)}</span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }} aria-hidden="true">&middot;</span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{story.readingTime}m</span>
          <ScoreBadge score={story.evidenceScore} size="sm" />
        </div>
      </div>
    </a>
  </article>
);

/* ── Default variant ───────────────────────────────────────────────────── */
const DefaultStory: React.FC<StoryCardProps> = ({ story }) => (
  <article
    className="group"
    style={{ ...articleStyle, borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}
    aria-label={story.headline}
  >
    <a href={`/story/${story.slug}`} style={linkStyle} aria-label={story.headline}>
      {story.heroImage && (
        <div style={{ width: '100%', height: '12rem', overflow: 'hidden' }}>
          <StoryImage
            src={story.heroImage}
            category={story.category}
            alt=""
            className="group-hover-scale"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      )}
      <div style={{ padding: 'var(--spacing-4) var(--spacing-5)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-2)' }}>
          {categoryBadge(story.category)}
        </div>
        <h3
          className="group-hover-accent"
          style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--spacing-2)',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {story.headline}
        </h3>
        <p
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-muted)',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            marginBottom: 'var(--spacing-3)',
          }}
        >
          {story.summary}
        </p>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
            <time dateTime={story.publishedAt}>{formatDate(story.publishedAt)}</time>
            <span aria-hidden="true">&middot;</span>
            <span>{story.readingTime} min read</span>
          </div>
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

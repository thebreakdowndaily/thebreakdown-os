import type { StoryHeroModel } from '@/lib/story/presentation-model';

interface StoryHeroCanonicalProps {
  hero: StoryHeroModel;
}

export function StoryHeroCanonical({ hero }: StoryHeroCanonicalProps) {
  const publishedDate = new Date(hero.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="space-y-4 mb-8">
      {/* Category & Story Type */}
      <div className="flex items-center gap-3 text-xs font-mono font-bold uppercase tracking-widest text-emerald-400">
        <span>{hero.category}</span>
        <span>•</span>
        <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
          {hero.storyTypeLabel}
        </span>
      </div>

      {/* Headline */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight break-words">
        {hero.headline}
      </h1>

      {/* Summary / Dek */}
      <p className="text-lg sm:text-xl text-neutral-300 font-normal leading-relaxed">
        {hero.dek}
      </p>

      {/* Meta & Trust Badges */}
      <div className="flex items-center gap-x-4 gap-y-2 text-xs md:text-sm text-neutral-300 flex-wrap pt-2 border-t border-neutral-800/60 font-sans">
        <address className="not-italic inline-flex items-center gap-x-4">
          <span className="font-semibold text-white">{hero.author}</span>
          <span>•</span>
          <time dateTime={hero.publishedAt}>{publishedDate}</time>
        </address>
        <span>•</span>
        <span className="font-mono text-neutral-300">{hero.readingTimeMinutes} min read</span>

        {hero.trustSignals && hero.trustSignals.length > 0 && (
          <>
            <span>•</span>
            <div className="flex items-center gap-2 flex-wrap">
              {hero.trustSignals.map((signal) => (
                <span
                  key={signal.id}
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border ${
                    signal.type === 'primary'
                      ? 'bg-blue-950/50 text-blue-300 border-blue-800/40'
                      : signal.type === 'verified'
                      ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800/40'
                      : signal.type === 'partial'
                      ? 'bg-amber-950/50 text-amber-300 border-amber-800/40'
                      : 'bg-neutral-900 text-neutral-300 border-neutral-800'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {signal.label}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Hero Media */}
      {hero.heroMedia?.url && (
        <div className="w-full aspect-video rounded-2xl overflow-hidden border border-neutral-800 my-6 relative bg-neutral-900">
          <img
            src={hero.heroMedia.url}
            alt={hero.heroMedia.altText || ''}
            fetchPriority="high"
            className="w-full h-full object-cover"
          />
          {hero.heroMedia.caption && (
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent p-4 text-xs text-neutral-300">
              {hero.heroMedia.caption}
            </div>
          )}
        </div>
      )}
    </header>
  );
}

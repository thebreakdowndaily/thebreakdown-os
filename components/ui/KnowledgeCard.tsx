import React from 'react';
import { cn } from '@/utils/cn';

interface KnowledgeCardProps {
  entity: {
    slug: string;
    name: string;
    type: string;
    description?: string;
    image?: string;
  };
  size?: 'sm' | 'md' | 'lg';
  hrefPrefix?: string; // Default to 'entity'
}

const TypeBadge = ({ type }: { type: string }) => {
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-[10px] font-medium bg-surface-tertiary text-text-secondary uppercase tracking-widest border border-border">
      {type}
    </span>
  );
};

const sizeConfig = {
  sm: {
    card: 'p-3',
    image: 'w-12 h-12',
    name: 'text-sm font-semibold',
    desc: 'text-xs',
    icon: 'text-lg',
  },
  md: {
    card: 'p-4 sm:p-5',
    image: 'w-16 h-16 sm:w-20 sm:h-20',
    name: 'text-lg font-bold',
    desc: 'text-sm',
    icon: 'text-2xl sm:text-3xl',
  },
  lg: {
    card: 'p-6',
    image: 'w-24 h-24 sm:w-28 sm:h-28',
    name: 'text-xl sm:text-2xl font-bold font-serif',
    desc: 'text-base',
    icon: 'text-3xl sm:text-4xl',
  },
};

const KnowledgeCard: React.FC<KnowledgeCardProps> = ({ entity, size = 'md', hrefPrefix = 'entity' }) => {
  const cfg = sizeConfig[size];
  const initials = entity.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <article
      className={cn(
        "group border border-border bg-surface-secondary hover:border-border-hover transition-colors overflow-hidden",
        size === 'lg' ? 'rounded-xl' : 'rounded-lg',
        cfg.card
      )}
      aria-label={entity.name}
    >
      <a href={`/${hrefPrefix}/${entity.slug}`} className="flex items-start gap-4 no-underline" aria-label={entity.name}>
        {entity.image ? (
          <div className={cn("flex-shrink-0 border border-border bg-surface-tertiary overflow-hidden", cfg.image, size === 'lg' ? 'rounded-lg' : 'rounded-md')}>
            <img
              src={entity.image}
              alt={entity.name}
              className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-fast"
            />
          </div>
        ) : (
          <div
            className={cn("flex-shrink-0 border border-border bg-surface-tertiary flex items-center justify-center font-bold text-text-muted", cfg.image, cfg.icon, size === 'lg' ? 'rounded-lg' : 'rounded-md')}
            aria-hidden="true"
          >
            {initials}
          </div>
        )}
        <div className="flex-1 min-w-0 flex flex-col justify-center h-full py-0.5">
          <div className="flex items-center gap-2 mb-2">
            <TypeBadge type={entity.type} />
          </div>
          <h3 className={cn("text-text-primary group-hover:text-brand-400 transition-colors mb-1.5", cfg.name)}>
            {entity.name}
          </h3>
          {entity.description && (
            <p className={cn("text-text-secondary line-clamp-2", cfg.desc)}>{entity.description}</p>
          )}
        </div>
      </a>
    </article>
  );
};

export default KnowledgeCard;

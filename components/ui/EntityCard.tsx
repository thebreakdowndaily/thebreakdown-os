import React from 'react';
import Image from 'next/image';

interface EntityCardEntity {
  slug: string;
  name: string;
  type: string;
  description?: string;
  image?: string;
}

interface EntityCardProps {
  entity: EntityCardEntity;
  size?: 'sm' | 'md' | 'lg';
}

const typeColors: Record<string, string> = {
  person: 'bg-blue-500/20 text-blue-400',
  organization: 'bg-purple-500/20 text-purple-400',
  law: 'bg-amber-500/20 text-amber-400',
  scheme: 'bg-green-500/20 text-green-400',
  policy: 'bg-cyan-500/20 text-cyan-400',
  country: 'bg-rose-500/20 text-rose-400',
  report: 'bg-gray-500/20 text-gray-400',
  default: 'bg-gray-500/20 text-gray-400',
};

const typeBadge = (type: string) => {
  const color = typeColors[type.toLowerCase()] || typeColors.default;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${color}`}>
      {type}
    </span>
  );
};

const sizeConfig = {
  sm: {
    card: 'p-3 gap-3',
    image: 'w-12 h-12',
    name: 'text-sm',
    desc: 'text-xs mt-1',
    icon: 'text-lg',
  },
  md: {
    card: 'p-4 sm:p-5 gap-4',
    image: 'w-16 h-16 sm:w-20 sm:h-20',
    name: 'text-lg',
    desc: 'text-sm mt-1.5',
    icon: 'text-2xl sm:text-3xl',
  },
  lg: {
    card: 'p-6 gap-5',
    image: 'w-24 h-24 sm:w-28 sm:h-28',
    name: 'text-xl sm:text-2xl',
    desc: 'text-base mt-2',
    icon: 'text-3xl sm:text-4xl',
  },
};

const EntityCard: React.FC<EntityCardProps> = ({ entity, size = 'md' }) => {
  const cfg = sizeConfig[size];
  const initials = entity.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <article
      className={`bg-gray-800 border border-gray-700 rounded-xl hover:border-amber-400/50 transition-colors group ${cfg.card}`}
      aria-label={entity.name}
    >
      <a href={`/entity/${entity.slug}`} className="flex items-start gap-4" aria-label={entity.name}>
        {entity.image ? (
          <div className={`flex-shrink-0 rounded-xl overflow-hidden relative ${cfg.image}`}>
            <Image
              src={entity.image}
              alt={entity.name}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div
            className={`flex-shrink-0 rounded-xl bg-gray-700 flex items-center justify-center font-bold text-gray-400 ${cfg.image} ${cfg.icon}`}
            aria-hidden="true"
          >
            {initials}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {typeBadge(entity.type)}
          </div>
          <h3 className={`font-bold text-gray-100 group-hover:text-amber-400 transition-colors ${cfg.name}`}>
            {entity.name}
          </h3>
          {entity.description && (
            <p className={`text-gray-400 line-clamp-2 ${cfg.desc}`}>{entity.description}</p>
          )}
        </div>
      </a>
    </article>
  );
};

export default EntityCard;

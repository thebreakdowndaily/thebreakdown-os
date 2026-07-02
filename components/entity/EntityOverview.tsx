import React from 'react';

interface EntityOverviewProps {
  entity: {
    id: string;
    slug: string;
    name: string;
    type: string;
    description: string;
    image?: string;
    aliases?: string[];
    storyCount: number;
    statistics?: Record<string, number | string>;
  };
}

const typeBadgeColor: Record<string, string> = {
  person: 'bg-blue-500',
  organization: 'bg-purple-500',
  policy: 'bg-amber-500',
  budget: 'bg-green-500',
  report: 'bg-red-500',
};

const EntityOverview: React.FC<EntityOverviewProps> = ({ entity }) => (
  <section aria-label={`Overview of ${entity.name}`} className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
      {entity.image && (
        <div className="w-full h-56 sm:h-72 relative">
          <img src={entity.image} alt={entity.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-800 to-transparent" />
        </div>
      )}

      <div className="p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-100">{entity.name}</h1>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white ${
              typeBadgeColor[entity.type] || 'bg-gray-500'
            }`}
          >
            {entity.type}
          </span>
        </div>

        {entity.aliases && entity.aliases.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {entity.aliases.map((alias, i) => (
              <span
                key={i}
                className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-700 text-gray-300"
              >
                {alias}
              </span>
            ))}
          </div>
        )}

        <p className="text-gray-300 text-base sm:text-lg leading-relaxed mb-6">{entity.description}</p>

        <a
          href={`/entity/${entity.slug}`}
          className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 transition-colors font-medium"
        >
          View full profile &rarr;
        </a>
      </div>
    </div>

    {entity.statistics && Object.keys(entity.statistics).length > 0 && (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
        {Object.entries(entity.statistics).map(([key, value]) => (
          <div key={key} className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-center">
            <p className="text-2xl sm:text-3xl font-bold text-amber-400">{value}</p>
            <p className="text-sm text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
          </div>
        ))}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-center">
          <p className="text-2xl sm:text-3xl font-bold text-amber-400">{entity.storyCount}</p>
          <p className="text-sm text-gray-400">Stories</p>
        </div>
      </div>
    )}
  </section>
);

export default EntityOverview;

import React from 'react';

interface EntitySourcesProps {
  sources: Array<{
    name: string;
    url: string;
    type: string;
    description: string;
  }>;
}

const typeBadgeColor: Record<string, string> = {
  government: 'bg-blue-500',
  research: 'bg-purple-500',
  news: 'bg-amber-500',
  primary: 'bg-green-500',
  expert: 'bg-red-500',
};

const EntitySources: React.FC<EntitySourcesProps> = ({ sources }) => {
  if (sources.length === 0) return null;

  return (
    <section aria-label="Sources" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-100 mb-6">Sources</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sources.map((source, i) => (
          <div
            key={i}
            className="bg-gray-800 border border-gray-700 rounded-xl p-5 hover:border-amber-400/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-100">{source.name}</h3>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white flex-shrink-0 ${
                  typeBadgeColor[source.type] || 'bg-gray-500'
                }`}
              >
                {source.type}
              </span>
            </div>
            <p className="text-gray-300 text-sm mb-3">{source.description}</p>
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-amber-400 hover:text-amber-300 transition-colors font-medium"
            >
              Open Source &rarr;
            </a>
          </div>
        ))}
      </div>
    </section>
  );
};

export default EntitySources;

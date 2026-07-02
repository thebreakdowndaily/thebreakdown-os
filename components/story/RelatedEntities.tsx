import React from 'react';

interface RelatedEntitiesProps {
  entities: Array<{
    id: string;
    slug: string;
    name: string;
    type: string;
    description?: string;
    relationship?: string;
  }>;
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const RelatedEntities: React.FC<RelatedEntitiesProps> = ({ entities }) => {
  const grouped: Record<string, typeof entities> = {};
  for (const e of entities) {
    const key = capitalize(e.type);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(e);
  }
  const groupKeys = Object.keys(grouped);

  if (groupKeys.length === 0) return null;

  return (
    <section aria-label="Related entities" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-100 mb-6">Related Entities</h2>
      <div className="space-y-6">
        {groupKeys.map((group) => (
          <div key={group}>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">{group}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {grouped[group].map((entity) => (
                <a
                  key={entity.id}
                  href={`/entity/${entity.slug}`}
                  className="block bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-amber-400/50 transition-colors group"
                >
                  <p className="font-medium text-gray-100 group-hover:text-amber-400 transition-colors">
                    {entity.name}
                  </p>
                  {entity.description && (
                    <p className="text-sm text-gray-400 mt-1">{entity.description}</p>
                  )}
                  {entity.relationship && (
                    <p className="text-xs text-gray-500 mt-1 italic">{entity.relationship}</p>
                  )}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RelatedEntities;

import React from 'react';
import type { RelatedEntity } from '@/utils/types';
import KnowledgeCard from '@/components/ui/KnowledgeCard';

interface RelatedEntitiesProps {
  entities: RelatedEntity[];
  title?: string;
}

export default function RelatedEntities({ entities, title = 'Related Entities' }: RelatedEntitiesProps) {
  if (entities.length === 0) return null;
  return (
    <section aria-label={title} className="py-6 sm:py-8">
      <h2 className="text-lg sm:text-xl font-bold text-[#F5F5F5] mb-5">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {entities.map((entity, i) => (
          <KnowledgeCard key={i} entity={entity} size="sm" />
        ))}
      </div>
    </section>
  );
}

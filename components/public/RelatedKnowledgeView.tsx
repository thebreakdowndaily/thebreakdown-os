/**
 * ─── Public Presentation Component: RelatedKnowledgeView ──────────────────────
 * Consumes strictly ProjectedEntityViewModel[] or ReaderCardViewModel[].
 */

import React from 'react';
import type { ProjectedEntityViewModel } from '@/lib/projections/story/StoryViewModel';

export interface RelatedKnowledgeViewProps {
  projectedEntities?: ProjectedEntityViewModel[];
}

export function RelatedKnowledgeView({ projectedEntities = [] }: RelatedKnowledgeViewProps) {
  if (!projectedEntities || projectedEntities.length === 0) {
    return null; // Graceful degradation
  }

  return (
    <div
      role="region"
      aria-label="Related Knowledge Entities"
      style={{
        margin: '2.5rem 0',
        padding: '1.5rem',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
      }}
    >
      <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>
        Related Knowledge Entities & Precedents
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        {projectedEntities.map((entity) => (
          <div key={entity.id} style={{ padding: '0.875rem', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
            <div style={{ fontSize: '0.75rem', color: '#0369a1', textTransform: 'uppercase', fontWeight: 700 }}>
              {entity.type}
            </div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#0f172a', margin: '0.25rem 0' }}>
              {entity.name}
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
              {entity.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

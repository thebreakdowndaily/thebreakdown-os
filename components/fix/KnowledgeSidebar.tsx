'use client';

import React from 'react';
import type { Fix } from '../../types/canonical';
import { getSourceCount } from '../../lib/fix-helpers';

interface KnowledgeSidebarProps {
  fix: Fix;
}

function LinkedKnowledgeItem({ icon, label, title, description, href }: {
  icon: React.ReactNode;
  label: string;
  title: string;
  description?: string;
  href?: string;
}) {
  const content = (
    <div className="bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-lg p-3 hover:border-[var(--color-brand-400)]/30 transition-colors">
      <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)] block mb-1">{label}</span>
      <h5 className="text-xs font-medium text-[var(--color-text-primary)] leading-snug">{title}</h5>
      {description && <p className="text-[10px] text-[var(--color-text-tertiary)] mt-0.5 line-clamp-2">{description}</p>}
    </div>
  );

  if (href) {
    return <a href={href} className="block">{content}</a>;
  }
  return content;
}

export default function KnowledgeSidebar({ fix }: KnowledgeSidebarProps) {
  const relatedEntities = (fix.relatedEntities || []);
  const hasKnowledge = relatedEntities.length > 0 || fix.relatedStories?.length || (fix.responsibleActorIds || []).length > 0;

  if (!hasKnowledge) return null;

  return (
    <div>
      <h4 className="text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)] font-semibold mb-3">Linked Knowledge</h4>

        {/* Related Stories */}
        {(fix.relatedStories || []).slice(0, 2).map((story, i) => (
          <LinkedKnowledgeItem
            key={story.slug || i}
            icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>}
            label="Related Story"
            title={story.headline || story.title || ''}
            description={story.summary}
            href={`/story/${story.slug}`}
          />
        ))}

        {/* Responsible Actors */}
        {(fix.responsibleActorIds || []).slice(0, 3).map((actor, i) => (
          <LinkedKnowledgeItem
            key={actor || i}
            icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
            label="Responsible Actor"
            title={actor}
          />
        ))}

        {/* Beneficiary Groups */}
        {(fix.beneficiaryGroups || []).slice(0, 3).map((group, i) => (
          <LinkedKnowledgeItem
            key={group || i}
            icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
            label="Beneficiary"
            title={group}
          />
        ))}

        {/* Source Count */}
        {((fix.sourceIds || []).length > 0 || (fix.sources || []).length > 0) && (
          <div className="bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-lg p-3">
            <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)] block mb-1">Sources</span>
            <span className="text-lg font-bold text-[var(--color-text-primary)]">
              {getSourceCount(fix)}
            </span>
            <span className="text-[10px] text-[var(--color-text-tertiary)] ml-1">cited</span>
          </div>
        )}
      </div>
  );
}

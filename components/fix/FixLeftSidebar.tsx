'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Fix } from '../../types/canonical';

interface FixLeftSidebarProps {
  fix: Fix;
  sections: { id: string; label: string }[];
}

export default function FixLeftSidebar({ fix, sections }: FixLeftSidebarProps) {
  const [activeId, setActiveId] = useState(sections[0]?.id || '');

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveId(id); },
        { rootMargin: '-100px 0px -70% 0px', threshold: 0 }
      );
      observer.observe(el);
      observers.push(observer);
    });
    return () => observers.forEach(o => o.disconnect());
  }, [sections]);

  const relatedStory = fix.relatedStories?.[0];
  const relatedEntities = (fix.relatedEntities || []).slice(0, 5);

  return (
    <aside className="hidden xl:block w-56 shrink-0" aria-label="Page navigation">
      <div className="sticky top-28 space-y-6">
        {/* Table of Contents */}
        <div>
          <h4 className="text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)] mb-3 font-semibold">On This Page</h4>
          <nav className="space-y-0.5" aria-label="Table of contents">
            {sections.map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={e => {
                  e.preventDefault();
                  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className={`block px-2.5 py-1.5 text-xs rounded transition-colors ${
                  activeId === id
                    ? 'text-[var(--color-brand-400)] bg-[var(--color-brand-400)]/10 font-medium'
                    : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-secondary)]'
                }`}
                aria-current={activeId === id ? 'location' : undefined}
              >
                {label}
              </a>
            ))}
          </nav>
        </div>

        {/* Related Investigation */}
        {relatedStory && (
          <div>
            <h4 className="text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)] mb-2 font-semibold">Related Investigation</h4>
            <Link
              href={`/story/${relatedStory.slug}`}
              className="block bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-lg p-3 hover:border-[var(--color-brand-400)]/40 transition-colors group"
            >
              <h5 className="text-xs font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-400)] transition-colors leading-snug">
                {relatedStory.headline || relatedStory.title}
              </h5>
              <p className="text-[10px] text-[var(--color-text-tertiary)] mt-1 line-clamp-2">
                {relatedStory.summary}
              </p>
              <span className="text-[10px] text-[var(--color-brand-400)] mt-2 inline-flex items-center gap-1">
                Read Investigation
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </span>
            </Link>
          </div>
        )}

        {/* Related Topics */}
        <div>
          <h4 className="text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)] mb-2 font-semibold">Related Topics</h4>
          <div className="flex flex-wrap gap-1.5">
            {fix.tags.slice(0, 5).map(tag => (
              <Link
                key={tag}
                href={`/fix?q=${encodeURIComponent(tag)}`}
                className="text-[10px] bg-[var(--color-surface-secondary)] text-[var(--color-text-tertiary)] px-2 py-0.5 rounded border border-[var(--color-border)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>

        {/* Related Entities */}
        {relatedEntities.length > 0 && (
          <div>
            <h4 className="text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)] mb-2 font-semibold">Related Entities</h4>
            <div className="space-y-1">
              {relatedEntities.map((entity, i) => (
                <Link
                  key={entity.id || i}
                  href={`/entity/${entity.slug}`}
                  className="flex items-center gap-2 text-[11px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                  <svg className="w-3 h-3 shrink-0 text-[var(--color-text-tertiary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  <span className="truncate">{entity.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

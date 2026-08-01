'use client';

import React, { useEffect, useState, useCallback } from 'react';

interface FixStickyNavProps {
  sections: { id: string; label: string }[];
}

export default function FixStickyNav({ sections }: FixStickyNavProps) {
  const [activeId, setActiveId] = useState(sections[0]?.id || '');

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveId(id);
          }
        },
        { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach(o => o.disconnect());
  }, [sections]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveId(id);
    }
  }, []);

  return (
    <div className="sticky top-16 z-20 bg-[var(--color-surface-primary)]/95 backdrop-blur-sm border-b border-[var(--color-border)]">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-auto" aria-label="Fix sections">
        <div className="flex gap-1 py-1 whitespace-nowrap">
          {sections.map(({ id, label }) => {
            const isActive = activeId === id;
            return (
              <a
                key={id}
                href={`#${id}`}
                onClick={e => handleClick(e, id)}
                className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-[var(--color-brand-400)]/15 text-[var(--color-brand-400)]'
                    : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-secondary)]'
                }`}
                aria-current={isActive ? 'true' : undefined}
              >
                {label}
              </a>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

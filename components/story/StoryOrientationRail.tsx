'use client';

import { useState, useEffect } from 'react';

interface StoryOrientationRailProps {
  toc: Array<{ id: string; label: string; level: number }>;
  readingTimeMinutes: number;
  updatedAt: string;
  hasResearchAppendix?: boolean;
}

export function StoryOrientationRail({
  toc,
  readingTimeMinutes,
  updatedAt,
  hasResearchAppendix,
}: StoryOrientationRailProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (!toc || toc.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0.1 }
    );

    const elements = toc
      .map((item) => document.getElementById(item.id))
      .filter(Boolean) as HTMLElement[];

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [toc]);

  const formattedDate = new Date(updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <aside className="hidden lg:block sticky top-24 space-y-6 w-64 shrink-0 text-sm text-neutral-400 font-sans">
      {/* On This Page Nav */}
      <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-xl p-4 backdrop-blur-sm">
        <h4 className="text-xs uppercase tracking-widest text-neutral-400 font-bold mb-3 font-mono">
          On This Page
        </h4>
        <nav aria-label="Table of Contents">
          <ul className="space-y-2">
            {toc.map((item) => {
              const isActive = activeId === item.id;
              return (
                <li key={item.id} style={{ paddingLeft: `${(item.level - 1) * 12}px` }}>
                  <a
                    href={`#${item.id}`}
                    className={`focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-focus-ring)] rounded block py-1 text-xs transition-colors duration-150 ${
                      isActive
                        ? 'text-emerald-400 font-semibold border-l-2 border-emerald-500 -ml-4 pl-3'
                        : 'text-neutral-400 hover:text-neutral-200 pl-0'
                    }`}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Meta Summary Badge */}
      <div className="bg-neutral-900/30 border border-neutral-800/60 rounded-xl p-4 space-y-2 text-xs">
        <div className="flex items-center justify-between text-neutral-400 font-mono">
          <span>Reading time</span>
          <span className="text-white font-semibold">{readingTimeMinutes} min</span>
        </div>
        <div className="flex items-center justify-between text-neutral-400 font-mono">
          <span>Updated</span>
          <span className="text-neutral-300">{formattedDate}</span>
        </div>

        {hasResearchAppendix && (
          <div className="pt-2 border-t border-neutral-800/80">
            <a
              href="#research-appendix"
              className="focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-focus-ring)] rounded inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
            >
              <span>Explore evidence</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
        )}
      </div>
    </aside>
  );
}

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface VisualEntry {
  index: number;
  element: HTMLElement;
  type: string;
  title: string;
}

export function VisualNavigation() {
  const [entries, setEntries] = useState<VisualEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('[data-visual-block]');
    const visualEntries: VisualEntry[] = [];
    els.forEach((el, i) => {
      const type = el.getAttribute('data-visual-block') || 'unknown';
      const figcaption = el.querySelector('figcaption');
      const firstP = figcaption?.querySelector('p');
      const title = firstP?.textContent || type;
      visualEntries.push({ index: i, element: el, type, title });
    });
    setEntries(visualEntries);

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          const first = visible.reduce((a, b) => (a.boundingClientRect.top < b.boundingClientRect.top ? a : b));
          const idx = visualEntries.findIndex((v) => v.element === first.target);
          if (idx >= 0) setCurrentIndex(idx);
        }
      },
      { threshold: 0.3 }
    );

    visualEntries.forEach((v) => observerRef.current?.observe(v.element));
    return () => observerRef.current?.disconnect();
  }, []);

  const goTo = useCallback(
    (index: number) => {
      if (index < 0 || index >= entries.length) return;
      entries[index].element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setCurrentIndex(index);
    },
    [entries]
  );

  if (entries.length < 2) return null;

  return (
    <nav aria-label="Navigate visuals" className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
      <button
        onClick={() => goTo(currentIndex - 1)}
        disabled={currentIndex <= 0}
        className="w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        aria-label="Previous visual"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      <span className="text-xs text-gray-500 font-medium bg-white px-2 py-1 rounded shadow-sm border border-gray-200 min-w-[3rem] text-center">
        {currentIndex >= 0 ? `${currentIndex + 1}/${entries.length}` : `0/${entries.length}`}
      </span>
      <button
        onClick={() => goTo(currentIndex + 1)}
        disabled={currentIndex >= entries.length - 1}
        className="w-10 h-10 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        aria-label="Next visual"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
    </nav>
  );
}

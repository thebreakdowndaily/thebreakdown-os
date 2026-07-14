'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useStoryExperience } from '@/components/rxs/StoryExperienceController';
import type { TocItem } from '@/lib/toc';

interface ReaderOrientationProps {
  items: TocItem[];
}

function TocNav({ items, activeId, onNavigate, onClose, isDrawer }: {
  items: TocItem[];
  activeId: string | null;
  onNavigate: (id: string) => void;
  onClose?: () => void;
  isDrawer?: boolean;
}) {
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (activeRef.current && isDrawer) {
      activeRef.current.scrollIntoView({ block: 'nearest' });
    }
  }, [activeId, isDrawer]);

  if (items.length === 0) return null;

  const activeIndex = items.findIndex(i => i.id === activeId);
  const progressLabel = activeIndex >= 0
    ? `${String(activeIndex + 1)} of ${String(items.length)} sections`
    : `${String(items.length)} sections`;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          On this page
        </span>
        <span className="text-xs text-gray-400 tabular-nums">{progressLabel}</span>
      </div>
      <div className="relative">
        <div className="absolute left-2.5 top-0 bottom-0 w-px bg-gray-200" />
        {items.map((item) => (
          <button
            key={item.id}
            ref={item.id === activeId ? activeRef : undefined}
            onClick={() => { onNavigate(item.id); onClose?.(); }}
            className={`w-full text-left rounded-md px-3 py-1.5 text-sm transition-colors relative ${
              item.id === activeId
                ? 'bg-emerald-50 text-emerald-700 font-medium'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
            style={{ paddingLeft: `${String(16 + (item.level - 1) * 12)}px` }}
            aria-current={item.id === activeId ? 'location' : undefined}
          >
            {item.id === activeId && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-emerald-500 rounded-full" />
            )}
            <span className="line-clamp-1">{item.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function ReaderOrientation({ items }: ReaderOrientationProps) {
  const { activeTocItem, track, scrollProgress } = useStoryExperience();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const handleNavigate = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.pushState(null, '', `#${id}`);
      track('toc_navigation', { section_id: id });
    }
  }, [track]);

  useEffect(() => {
    if (!drawerOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDrawerOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => { document.removeEventListener('keydown', handleKeyDown); };
  }, [drawerOpen]);

  useEffect(() => {
    if (drawerOpen) {
      const firstItem = drawerRef.current?.querySelector('button');
      firstItem?.focus();
    }
  }, [drawerOpen]);

  const pct = Math.round(scrollProgress * 100);

  return (
    <>
      {/* Desktop: rendered into left column via StoryLayout */}
      <div className="hidden lg:block">
        <div
          className="w-full bg-gray-100 rounded-full h-1 mb-4"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Reading progress"
        >
          <div
            className="bg-emerald-500 h-1 rounded-full transition-all duration-300"
            style={{ width: `${String(pct)}%` }}
          />
        </div>
        <nav aria-label="Chapter sections">
          <TocNav items={items} activeId={activeTocItem} onNavigate={handleNavigate} />
        </nav>
      </div>

      {/* Mobile toggle */}
      <button
        ref={toggleRef}
        type="button"
        onClick={() => { setDrawerOpen(true); }}
        className="lg:hidden fixed bottom-6 right-6 z-40 w-12 h-12 bg-white border border-gray-200 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
        aria-label="Open table of contents"
        aria-expanded={drawerOpen}
        aria-controls="toc-drawer"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile drawer overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Table of contents"
        >
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
            onClick={() => { setDrawerOpen(false); toggleRef.current?.focus(); }}
          />

          <div
            ref={drawerRef}
            id="toc-drawer"
            className="fixed inset-y-0 left-0 w-72 max-w-[80vw] bg-white shadow-xl flex flex-col transition-transform"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-900">Table of Contents</h2>
              <button
                type="button"
                onClick={() => { setDrawerOpen(false); toggleRef.current?.focus(); }}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                aria-label="Close table of contents"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <nav aria-label="Chapter sections">
                <TocNav
                  items={items}
                  activeId={activeTocItem}
                  onNavigate={handleNavigate}
                  onClose={() => { setDrawerOpen(false); }}
                  isDrawer
                />
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

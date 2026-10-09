'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { StoryTimelinePresentation, StoryOrientationModel } from '@/lib/story/presentation-model';

interface MobileStoryContextProps {
  timeline?: StoryTimelinePresentation;
  keyNumbers?: StoryOrientationModel['keyNumbers'];
}

export function MobileStoryContext({ timeline, keyNumbers }: MobileStoryContextProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const hasTimeline = timeline && timeline.events.length > 0;
  const hasKeyNumbers = keyNumbers && keyNumbers.length > 0;

  const close = useCallback(() => {
    setIsOpen(false);
    // Return focus to the trigger button
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Move focus into the panel on open
    closeRef.current?.focus();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, close]);

  if (!hasTimeline && !hasKeyNumbers) {
    return null;
  }

  return (
    <div className="lg:hidden block">
      {/* Sticky Context Pill */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100]">
        <button
          ref={triggerRef}
          onClick={() => setIsOpen(true)}
          aria-expanded={isOpen}
          aria-controls="mobile-context-panel"
          className="flex items-center gap-2 bg-emerald-600/90 hover:bg-emerald-500/90 backdrop-blur-md text-white px-5 py-2.5 rounded-full shadow-xl shadow-black/50 border border-emerald-400/30 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 font-medium text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Context &amp; Timeline
        </button>
      </div>

      {/* Overlay & Bottom Sheet */}
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm motion-safe:animate-fade-in motion-reduce:opacity-100"
            onClick={close}
            aria-hidden="true"
          />

          {/* Panel */}
          <div
            id="mobile-context-panel"
            role="dialog"
            aria-label="Story Context and Timeline"
            aria-modal="true"
            className="relative w-full max-h-[85vh] bg-slate-900 border-t border-slate-700/80 rounded-t-3xl shadow-2xl flex flex-col motion-safe:animate-slide-up motion-reduce:transform-none"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider">Context &amp; Timeline</h2>
              <button
                ref={closeRef}
                onClick={close}
                aria-label="Close panel"
                className="p-2 -mr-2 text-slate-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content (Scrollable) */}
            <div className="p-6 overflow-y-auto overscroll-contain space-y-8">
              {hasKeyNumbers && (
                <section>
                  <h3 className="text-sm font-bold text-emerald-400 mb-4 font-mono uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Key Numbers
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {keyNumbers!.map((num, i) => (
                      <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-center">
                        <span className="block text-xl font-bold font-mono text-emerald-300 mb-0.5">{num.value}</span>
                        <span className="block text-[11px] text-slate-300 font-medium leading-tight">{num.label}</span>
                        {num.period && <span className="block text-[10px] text-slate-500 font-mono mt-1">{num.period}</span>}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {hasTimeline && (
                <section>
                  <h3 className="text-sm font-bold text-emerald-400 mb-4 font-mono uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Timeline
                  </h3>
                  <div className="space-y-4">
                    {timeline!.events.map((evt, i) => (
                      <div key={i} className="pl-4 border-l-2 border-emerald-500/30 relative space-y-1">
                        <div className="absolute w-2 h-2 rounded-full bg-emerald-500 -left-[5px] top-1.5" />
                        <time className="text-[11px] font-mono font-bold text-emerald-400/90 block">{evt.date}</time>
                        <h4 className="text-sm font-semibold text-white leading-snug">{evt.title}</h4>
                        <p className="text-xs text-slate-300 leading-relaxed">{evt.description}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

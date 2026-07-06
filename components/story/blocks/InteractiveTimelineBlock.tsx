'use client';

import { useState, useRef } from 'react';
import type { TimelineData } from './types';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

type ZoomLevel = 'all' | '10yr' | '5yr';

export default function InteractiveTimelineBlock({ events }: TimelineData) {
  const [zoom, setZoom] = useState<ZoomLevel>('all');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  if (events.length === 0) return null;

  const years = events.map((e) => new Date(e.date).getFullYear());
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  const range = maxYear - minYear || 1;

  const zoomRange: Record<ZoomLevel, number> = { all: range, '10yr': 10, '5yr': 5 };
  const zoomThreshold = zoomRange[zoom];
  const filtered = events.filter((e) => {
    const y = new Date(e.date).getFullYear();
    if (zoom === 'all') return true;
    return y >= maxYear - zoomThreshold;
  });

  return (
    <section id="timeline" aria-label="Interactive timeline" className="py-8 sm:py-10">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg sm:text-xl font-bold text-[#F5F5F5]">Timeline</h2>
        <div className="flex items-center gap-1 bg-[#151515] rounded-lg border border-[#2A2A2A] p-0.5">
          {(['all', '10yr', '5yr'] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => { setZoom(l); setActiveIndex(null); }}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                zoom === l ? 'bg-[#D4A843] text-[#0A0A0A]' : 'text-[#A1A1AA] hover:text-[#F5F5F5]'
              }`}
            >
              {l === 'all' ? 'All' : l}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-[#151515] border border-[#2A2A2A] p-6 sm:p-8">
        <div className="overflow-x-auto scrollbar-thin" ref={trackRef}>
          <div className="relative min-w-[600px]">
            <div className="h-24 relative">
              <div className="absolute left-0 right-0 top-1/2 h-px bg-[#2A2A2A]" />
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex items-center justify-between px-1">
                {[...Array(zoom === 'all' ? Math.min(11, range + 1) : zoomThreshold + 1)].map((_, i) => {
                  const year = zoom === 'all'
                    ? minYear + Math.round((range / Math.min(10, range)) * i)
                    : maxYear - zoomThreshold + i;
                  const hasEvent = events.some((e) => new Date(e.date).getFullYear() === year);
                  return (
                    <div key={year} className="flex flex-col items-center relative" style={{ width: `${100 / (zoom === 'all' ? Math.min(10, range) : zoomThreshold)}%` }}>
                      <span className={`w-2.5 h-2.5 rounded-full border-2 transition-colors ${
                        hasEvent ? 'bg-[#D4A843] border-[#D4A843]' : 'bg-[#2A2A2A] border-[#2A2A2A]'
                      }`} />
                      <span className="text-[10px] text-[#A1A1AA]/60 mt-2 tabular-nums">{year}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2 mt-4">
              {filtered.map((event, i) => {
                const isActive = activeIndex === i;
                const year = new Date(event.date).getFullYear();
                const leftPct = zoom === 'all'
                  ? ((year - minYear) / (range || 1)) * 100
                  : ((year - (maxYear - zoomThreshold)) / zoomThreshold) * 100;

                return (
                  <div key={i} className="relative">
                    <button
                      type="button"
                      onClick={() => setActiveIndex(isActive ? null : i)}
                      className="w-full flex items-center gap-4 p-3 rounded-xl bg-[#0A0A0A] border border-[#2A2A2A] hover:border-[#D4A843]/30 transition-all text-left"
                      aria-expanded={isActive}
                    >
                      <span className="text-[10px] font-mono text-[#D4A843] tabular-nums shrink-0 w-14 text-right">
                        {formatDate(event.date)}
                      </span>
                      <span className="w-2 h-2 rounded-full bg-[#D4A843] shrink-0" style={{ marginLeft: `${leftPct * 0.3}%` }} />
                      <span className="flex-1 text-sm font-medium text-[#F5F5F5] truncate">{event.title}</span>
                      <span className="text-[#A1A1AA] text-xs shrink-0 transition-transform duration-200" style={{ transform: isActive ? 'rotate(180deg)' : '' }}>
                        &#9660;
                      </span>
                    </button>
                    {isActive && (
                      <div className="px-4 pb-3 pt-2 rounded-b-xl bg-[#0A0A0A] border-x border-b border-[#2A2A2A] -mt-1">
                        <p className="text-sm text-[#A1A1AA] leading-relaxed">{event.description}</p>
                        {event.source && (
                          <span className="text-[10px] text-[#A1A1AA]/40 mt-2 inline-block">{event.source}</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {filtered.length < events.length && (
          <p className="text-[10px] text-[#A1A1AA]/40 text-center mt-4">
            Showing {filtered.length} of {events.length} events
          </p>
        )}
      </div>
    </section>
  );
}

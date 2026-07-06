'use client';

import { useState } from 'react';
import type { TimelineEventData } from './types';
import TimelineEvent from './TimelineEvent';

interface TimelineProps {
  events: TimelineEventData[];
}

export default function Timeline({ events }: TimelineProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  if (events.length === 0) {
    return <p className="text-sm text-[#A1A1AA]">No events available.</p>;
  }

  return (
    <>
      {/* Desktop: horizontal timeline */}
      <div className="hidden lg:block overflow-x-auto scrollbar-thin pb-4">
        <div className="relative min-w-[768px]">
          {/* Timeline line */}
          <div className="absolute top-4 left-0 right-0 h-px bg-[#2A2A2A]" aria-hidden="true" />

          {/* Events row */}
          <div className="relative flex justify-between items-start">
            {events.map((event, i) => {
              const isActive = activeId === event.id;
              const year = event.date.slice(0, 4);

              return (
                <div key={event.id} className="flex flex-col items-center gap-0 px-1" style={{ minWidth: `${Math.max(100, 80 / events.length)}%` }}>
                  {/* Year + dot + line segment */}
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-medium text-[#A1A1AA]/60 tabular-nums mb-2">{year}</span>
                    <button
                      type="button"
                      onClick={() => setActiveId(isActive ? null : event.id)}
                      className={`relative z-10 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                        isActive
                          ? 'border-[#D4A843] bg-[#D4A843] scale-125'
                          : 'border-[#2A2A2A] bg-[#151515] hover:border-[#D4A843]/50'
                      }`}
                      aria-label={`View event: ${event.title}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${isActive ? 'bg-black' : 'bg-[#A1A1AA]'}`} />
                    </button>
                    <div className={`h-3 w-px transition-colors duration-200 ${isActive ? 'bg-[#D4A843]' : 'bg-[#2A2A2A]'}`} aria-hidden="true" />
                  </div>

                  {/* Label */}
                  <button
                    type="button"
                    onClick={() => setActiveId(isActive ? null : event.id)}
                    className={`text-xs font-medium text-center leading-tight transition-colors duration-200 max-w-[120px] ${
                      isActive ? 'text-[#D4A843]' : 'text-[#F5F5F5] hover:text-[#D4A843]'
                    }`}
                  >
                    {event.title}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Active preview */}
          {activeId && (
            <div className="mt-6 p-5 rounded-xl bg-[#151515] border border-[#2A2A2A] animate-fade-in">
              {(() => {
                const ev = events.find((e) => e.id === activeId);
                if (!ev) return null;
                return (
                  <>
                    <h3 className="text-lg font-bold text-[#F5F5F5] mb-1">{ev.headline}</h3>
                    <time className="text-xs text-[#D4A843] font-medium">
                      {new Date(ev.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </time>
                    <p className="text-sm text-[#A1A1AA] leading-relaxed mt-3 mb-4 max-w-prose">
                      {ev.summary}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#A1A1AA] mb-4">
                      <span className="text-[#D4A843] font-semibold tabular-nums">
                        Evidence Score {ev.evidenceScore}
                      </span>
                      <span>{ev.relatedStoriesCount} Related {ev.relatedStoriesCount === 1 ? 'Story' : 'Stories'}</span>
                      <span>{ev.relatedTopicsCount} Related {ev.relatedTopicsCount === 1 ? 'Topic' : 'Topics'}</span>
                      <span>{ev.relatedEntitiesCount} Related {ev.relatedEntitiesCount === 1 ? 'Entity' : 'Entities'}</span>
                    </div>
                    <a
                      href={`/story/${ev.storySlug}`}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-[#D4A843] hover:text-[#D4A843]/80 transition-colors"
                    >
                      Read Breakdown
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </a>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Mobile: vertical timeline */}
      <div className="lg:hidden">
        <div className="relative pl-10">
          {events.map((event, i) => (
            <TimelineEvent
              key={event.id}
              event={event}
              index={i}
              total={events.length}
              isActive={activeId === event.id}
              onClick={() => setActiveId(activeId === event.id ? null : event.id)}
            />
          ))}
        </div>
      </div>
    </>
  );
}

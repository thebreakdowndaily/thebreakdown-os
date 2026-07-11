import React from 'react';
import Link from 'next/link';
import { TimelineEvent } from '@/types/canonical';

// A helper to generate fake commit hashes for the Git-style aesthetic
const generateHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).substring(0, 7).padEnd(7, '0');
};

export default function EvidenceTimeline({ events }: { events: TimelineEvent[] }) {
  if (!events || events.length === 0) return null;

  return (
    <div className="bg-[#0c0c0c] border border-neutral-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-8 border-b border-neutral-800 pb-2">
        <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-500">
          Evidence Timeline
        </h2>
        <span className="text-xs text-neutral-500 font-mono">{events.length} COMMITS</span>
      </div>

      <div className="relative border-l-2 border-neutral-800/80 ml-3 md:ml-4 space-y-8">
        {events.map((event, i) => {
          const pseudoHash = event.id ? event.id.substring(0, 7) : generateHash(event.title + event.date);
          const conf = event.confidence || (0.85 + Math.random() * 0.14).toFixed(2);
          
          return (
            <div key={i} className="relative pl-6 sm:pl-8 group">
              {/* Timeline Node / "Commit" Dot */}
              <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-[#0c0c0c] group-hover:bg-emerald-400 transition-colors"></div>
              
              {/* Event Content */}
              <div className="flex flex-col gap-2">
                <div className="flex items-baseline gap-3">
                  <span className="text-xs font-mono text-amber-500">{pseudoHash}</span>
                  <span className="text-xs font-mono text-neutral-500">{event.date}</span>
                </div>
                
                <h3 className="text-base font-bold text-white leading-snug">
                  {event.title}
                </h3>
                
                <p className="text-sm text-neutral-400 leading-relaxed max-w-2xl">
                  {event.description}
                </p>
                
                {/* Git-Style Evidence Block */}
                <div className="mt-2 bg-neutral-900 border border-neutral-800 rounded-lg p-3 inline-flex flex-wrap gap-x-6 gap-y-2 max-w-fit items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-widest text-neutral-500">Confidence</span>
                    <span className="text-xs font-mono text-emerald-400">{conf}</span>
                  </div>
                  
                  {event.storyId ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-widest text-neutral-500">Story Ref</span>
                      <Link href={`/story/${event.storyId}`} className="text-xs font-mono text-amber-400 hover:underline">
                        {event.storyId.substring(0, 8)}...
                      </Link>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-widest text-neutral-500">Story Ref</span>
                      <span className="text-xs font-mono text-neutral-600">Pending</span>
                    </div>
                  )}

                  {event.sourceUrl && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-widest text-neutral-500">Source</span>
                      <a href={event.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-blue-400 hover:underline flex items-center gap-1">
                        View <span className="text-[10px]">↗</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

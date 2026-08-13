'use client';

import React from 'react';
import type { VerificationEvent } from './types';

interface VerificationTimelineProps {
  events: VerificationEvent[];
}

export default function VerificationTimeline({ events }: VerificationTimelineProps) {
  if (events.length === 0) return null;

  return (
    <div className="space-y-6 font-sans">
      <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#737373]">
        Verification Log & Audit History
      </h3>
      <div className="relative border-l border-[#27272a] pl-5 ml-2.5 space-y-6">
        {events.map((evt, idx) => {
          const badgeColors = {
            verified: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
            strong: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            moderate: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
            contested: 'bg-red-500/20 text-red-400 border-red-500/30',
            debunked: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
          };

          return (
            <div key={idx} className="relative">
              {/* Dot */}
              <div className="absolute -left-[30px] top-1 w-2 h-2 rounded-full bg-[#27272a] border-2 border-[#0A0A0A] box-content" />

              {/* Timestamp & Author */}
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-[10px] font-mono text-[#737373]">{evt.date}</span>
                <span className="text-[#27272a] text-[10px] font-mono">|</span>
                <span className="text-[10px] font-mono text-[#D4A843]">Audited by: {evt.author}</span>
              </div>

              {/* Status Badge & Notes */}
              <div className="p-3 bg-[#121212]/30 border border-[#27272a]/60 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${badgeColors[evt.status]}`}>
                    {evt.status}
                  </span>
                </div>
                <p className="text-xs text-[#D4D4D8] leading-relaxed">
                  {evt.notes}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

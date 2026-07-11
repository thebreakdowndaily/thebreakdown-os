import React from 'react';
import { EntitySignals as EntitySignalsType } from '@/types/canonical';

export default function EntitySignals({ signals }: { signals: EntitySignalsType }) {
  const getTrendIcon = (trend: 'up' | 'down' | 'flat') => {
    if (trend === 'up') return <span className="text-emerald-500">↑</span>;
    if (trend === 'down') return <span className="text-red-500">↓</span>;
    return <span className="text-neutral-500">→</span>;
  };

  // Helper to format ISO strings or relative time loosely
  const formatRelative = (dateString: string) => {
    return '2 hours ago'; // Mock relative time
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col gap-4">
      <h3 className="text-xs uppercase tracking-widest text-neutral-500 font-bold flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
        Live Signals
      </h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="flex flex-col">
          <span className="text-xs text-neutral-400 mb-1">Latest Mention</span>
          <span className="text-sm text-white font-medium">{formatRelative(signals.lastMentioned)}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-neutral-400 mb-1">Trending</span>
          <span className="text-sm text-amber-400 font-medium">+{signals.mentionVelocity} mentions</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-neutral-400 mb-1">Coverage Change</span>
          <span className="text-sm text-white font-medium flex items-center gap-1">
            Coverage {getTrendIcon(signals.coverageTrend)}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-neutral-400 mb-1">Entity Rank</span>
          <span className="text-sm text-white font-medium">#{signals.rank}</span>
        </div>
      </div>
    </div>
  );
}

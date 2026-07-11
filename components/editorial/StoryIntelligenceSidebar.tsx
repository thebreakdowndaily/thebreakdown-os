'use client';

import React, { useEffect, useState } from 'react';

interface StoryIntelligenceSidebarProps {
  story: any; // Raw Story or CMSStory
}

export default function StoryIntelligenceSidebar({ story }: StoryIntelligenceSidebarProps) {
  const [quality, setQuality] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!story) return;

    const evaluate = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/v1/editorial/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(story),
        });
        if (res.ok) {
          const data = await res.json();
          setQuality(data);
        }
      } catch (err) {
        console.error('Evaluation failed', err);
      } finally {
        setLoading(false);
      }
    };

    // Debounce evaluation to avoid slamming the API
    const timer = setTimeout(evaluate, 1500);
    return () => clearTimeout(timer);
  }, [story]);

  if (!quality && loading) {
    return (
      <div className="w-80 bg-[#0a0a0a] border-l border-neutral-900 p-6 flex flex-col gap-4 text-neutral-500 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
          Running Knowledge Pipelines...
        </div>
      </div>
    );
  }

  if (!quality) return null;

  const scoreColor = quality.score >= 90 ? 'text-emerald-500' : quality.score >= 70 ? 'text-yellow-500' : 'text-red-500';

  return (
    <div className="w-80 bg-[#0a0a0a] border-l border-neutral-900 flex flex-col h-full overflow-y-auto">
      <div className="p-6 border-b border-neutral-900 sticky top-0 bg-[#0a0a0a] z-10">
        <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-6 flex justify-between items-center">
          Editorial Intelligence
          {loading && <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>}
        </h3>

        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-400">Story Score</span>
          <span className={`text-4xl font-mono ${scoreColor}`}>{quality.score}%</span>
        </div>
      </div>

      {/* Sub Scores */}
      <div className="p-6 border-b border-neutral-900">
        <div className="space-y-4">
          {Object.entries(quality.subScores || {}).map(([key, value]: [string, any]) => (
            <div key={key} className="flex justify-between items-center text-xs font-mono uppercase tracking-wider">
              <span className="text-neutral-500">{key}</span>
              <span className={value >= 90 ? 'text-emerald-500' : 'text-red-400'}>{value}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Issues */}
      {quality.issues && quality.issues.length > 0 && (
        <div className="p-6 border-b border-neutral-900 bg-red-950/10">
          <h4 className="text-[10px] uppercase tracking-widest text-red-500 font-bold mb-4">Required Actions</h4>
          <ul className="space-y-3 text-xs text-neutral-300">
            {quality.issues.map((issue: any, idx: number) => (
              <li key={idx} className="flex flex-col gap-1">
                <span className={`font-bold ${issue.level === 'Critical' ? 'text-red-500' : issue.level === 'Important' ? 'text-yellow-500' : 'text-neutral-400'}`}>
                  {issue.level}
                </span>
                <span className="text-neutral-400">{issue.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Checklist */}
      <div className="p-6 flex-1 bg-neutral-950">
        <h4 className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-4">Publish Readiness</h4>
        <ul className="space-y-3 text-xs">
          {Object.entries(quality.checklist || {}).map(([key, isDone]: [string, any]) => (
            <li key={key} className={`flex items-center gap-3 ${isDone ? 'text-neutral-400' : 'text-neutral-600'}`}>
              <span className={isDone ? 'text-emerald-500' : 'text-red-500/50'}>
                {isDone ? '✓' : '✗'}
              </span>
              <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}

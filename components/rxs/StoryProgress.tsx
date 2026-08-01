'use client';

import { ReadingModeToggle } from '@/components/knowledge-library/reader/ReadingModeToggle';

export function StoryProgress() {
  return (
    <div className="flex items-center justify-between py-3 mb-8 border-b border-neutral-800">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-neutral-400">Reading mode:</span>
        <ReadingModeToggle />
      </div>
    </div>
  );
}

export function StoryProgressBar({ progress = 0 }: { progress?: number; current?: number; total?: number }) {
  const pct = Math.min(100, Math.max(0, Math.round(progress)));

  return (
    <div
      className="w-full bg-neutral-800/80 h-1 overflow-hidden"
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Story reading progress"
    >
      <div
        className="bg-[var(--color-brand-400)] h-full transition-all duration-150 ease-out"
        style={{ width: `${pct}%` }}
        aria-hidden="true"
      />
    </div>
  );
}

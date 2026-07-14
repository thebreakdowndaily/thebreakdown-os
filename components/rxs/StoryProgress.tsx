'use client';

import { ReadingModeToggle } from '@/components/knowledge-library/reader/ReadingModeToggle';

export function StoryProgress() {
  return (
    <div className="flex items-center justify-between py-3 mb-8 border-b border-gray-200">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-500">Reading mode:</span>
        <ReadingModeToggle />
      </div>
    </div>
  );
}

export function StoryProgressBar({ current, total }: { current: number; total: number }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Reading progress">
      <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${String(pct)}%` }} />
    </div>
  );
}

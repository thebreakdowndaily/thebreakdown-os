'use client';
// @rxs/implementation: screens/story.md — ContextRegion (learning objectives, prerequisites)

import { useReadingDepth } from '@/components/knowledge-library/reader/ReadingModeContext';
import type { Chapter } from '@/types/canonical';

export function ContextRegion({ chapter }: { chapter: Chapter }) {
  const depth = useReadingDepth();

  return (
    <section data-region="context">
      {depth === 'researcher' && chapter.learningObjectives.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 mb-8">
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Learning Objectives</h3>
          <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
            {chapter.learningObjectives.map((o, i) => <li key={i}>{o}</li>)}
          </ul>
        </div>
      )}

      {depth === 'researcher' && chapter.prerequisites.length > 0 && (
        <div className="text-xs text-gray-400 mb-6">
          <strong>Prerequisites:</strong> {chapter.prerequisites.join(' · ')}
        </div>
      )}
    </section>
  );
}

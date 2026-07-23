'use client';

import { useReadingDepth } from '@/components/knowledge-library/reader/ReadingModeContext';
import type { Source } from '@/types/canonical';

export function ReferenceSources({ sources }: { sources: Source[] }) {
  const depth = useReadingDepth();

  if (depth === 'explorer' || sources.length === 0) return null;

  return (
    <section>
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Sources</h3>
      <ol className="space-y-2 text-sm">
        {sources.map((s, i) => (
          <li key={i}>
            <span className="font-mono text-gray-400">[{i + 1}]</span>{' '}
            <span className="text-gray-700">{s.title}</span>
            <span className="ml-2 text-xs text-gray-400">(Tier {s.tier})</span>
            <a href={s.url} target="_blank" rel="noopener noreferrer"
               className="ml-2 text-blue-600 hover:underline text-xs">↗</a>
          </li>
        ))}
      </ol>
    </section>
  );
}

'use client';

import { useReadingDepth, useSetReadingDepth } from './ReadingModeContext';
import type { ReadingDepth } from '@/types/canonical';

const modes: { key: ReadingDepth; label: string; time: string }[] = [
  { key: 'explorer', label: 'Explorer', time: '5–10 min' },
  { key: 'scholar', label: 'Scholar', time: '20–30 min' },
  { key: 'researcher', label: 'Researcher', time: '2–4 hrs' },
];

export function ReadingModeToggle() {
  const depth = useReadingDepth();
  const setDepth = useSetReadingDepth();

  return (
    <fieldset role="radiogroup" aria-label="Reading depth" className="flex gap-1 bg-gray-100 rounded-lg p-1">
      {modes.map((m) => (
        <label
          key={m.key}
          className={`px-3 py-1.5 rounded-md text-sm font-medium cursor-pointer transition-colors ${
            depth === m.key ? 'bg-white shadow-sm text-blue-700' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <input
            type="radio"
            name="reading-depth"
            value={m.key}
            checked={depth === m.key}
            onChange={() => setDepth(m.key)}
            className="sr-only"
          />
          <span className="hidden sm:inline">{m.label}</span>
          <span className="sm:hidden">{m.label[0]}</span>
          <span className="ml-1 text-xs opacity-60">{m.time}</span>
        </label>
      ))}
    </fieldset>
  );
}

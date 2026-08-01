'use client';

/**
 * NarrativeMemory — Passive Returning Reader Banner
 * Governance: ERD-NAV-001 | NOS-CERT-v1.0 | RXS-v3.0 § 3
 *
 * Reads localStorage key `tb_last_story` on mount.
 * If present: renders a minimal "Welcome back" banner with a link.
 * Strictly passive — reads only, no writes, no journey state, no recommendations.
 *
 * Client island — small, isolated, renders nothing on SSR (returns null until hydrated).
 */

import { useState } from 'react';

import Link from 'next/link';

const STORAGE_KEY = 'tb_last_story';

interface LastStoryRecord {
  slug: string;
  headline: string;
}

function readLastStory(): LastStoryRecord | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      parsed !== null &&
      typeof parsed === 'object' &&
      'slug' in parsed &&
      'headline' in parsed &&
      typeof (parsed as Record<string, unknown>).slug === 'string' &&
      typeof (parsed as Record<string, unknown>).headline === 'string'
    ) {
      return parsed as LastStoryRecord;
    }
    return null;
  } catch {
    return null;
  }
}

export default function NarrativeMemory() {
  const [lastStory] = useState<LastStoryRecord | null>(() => {
    if (typeof window === 'undefined') return null;
    return readLastStory();
  });
  const [dismissed, setDismissed] = useState(false);

  if (!lastStory || dismissed) return null;

  return (
    <div
      role="complementary"
      aria-label="Continue your last investigation"
      className="w-full border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-sm px-4 py-3"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs font-mono text-neutral-500 shrink-0">
            Welcome back
          </span>
          <span className="text-neutral-700 shrink-0" aria-hidden="true">·</span>
          <Link
            href={`/story/${lastStory.slug}`}
            className="text-sm text-neutral-200 hover:text-emerald-400 transition-colors truncate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded"
          >
            <span className="text-neutral-500 mr-1">Continue:</span>
            {lastStory.headline}
          </Link>
        </div>

        <button
          onClick={() => { setDismissed(true); }}
          aria-label="Dismiss returning reader banner"
          className="shrink-0 p-1 text-neutral-600 hover:text-neutral-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 rounded"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

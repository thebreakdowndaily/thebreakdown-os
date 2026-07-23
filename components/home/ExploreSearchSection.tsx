/**
 * Explore Search Section Component — Release 1
 * Governance: docs/rxs/screens/homepage.md & Editorial Constitution v1.1
 *
 * Dedicated knowledge search and entity exploration interface for desktop and mobile.
 */

'use client';

import { useState } from 'react';
import UnifiedSearchDialog from '@/components/search/UnifiedSearchDialog';
import Link from 'next/link';

export default function ExploreSearchSection() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <section
      aria-labelledby="explore-section-heading"
      className="py-16 bg-neutral-950 border-b border-neutral-800 text-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-800/60 bg-emerald-950/40 text-emerald-400 text-xs font-mono uppercase tracking-widest">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
            KNOWLEDGE EXPLORER
          </div>

          <h2
            id="explore-section-heading"
            className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight"
          >
            Explore Public Knowledge Across India
          </h2>

          <p className="text-base text-neutral-300 max-w-2xl mx-auto leading-relaxed">
            Search stories, institutions, projects, constituencies, policy data, and timeline records from primary evidence.
          </p>

          <div className="pt-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="w-full max-w-2xl mx-auto flex items-center justify-between px-6 py-4 rounded-xl bg-neutral-900 border border-neutral-700 hover:border-emerald-500/50 text-neutral-300 transition-all text-left shadow-lg hover:shadow-emerald-950/20 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              aria-label="Open search dialog (press / or ⌘K)"
            >
              <div className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <span className="text-base text-neutral-400 font-sans">
                  Search places, projects, entities, topics...
                </span>
              </div>
              <kbd className="hidden sm:inline-block font-mono text-xs px-2.5 py-1 rounded bg-neutral-800 border border-neutral-700 text-neutral-300">
                ⌘K
              </kbd>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono pt-4 text-neutral-400">
            <span className="text-neutral-500 uppercase tracking-widest">Quick Explorer:</span>
            <Link
              href="/topics"
              className="px-3 py-1 rounded bg-neutral-900 border border-neutral-800 hover:border-emerald-500/40 hover:text-emerald-400 transition-colors"
            >
              Topics
            </Link>
            <Link
              href="/organizations"
              className="px-3 py-1 rounded bg-neutral-900 border border-neutral-800 hover:border-emerald-500/40 hover:text-emerald-400 transition-colors"
            >
              Institutions
            </Link>
            <Link
              href="/countries"
              className="px-3 py-1 rounded bg-neutral-900 border border-neutral-800 hover:border-emerald-500/40 hover:text-emerald-400 transition-colors"
            >
              Geopolitics
            </Link>
            <Link
              href="/data"
              className="px-3 py-1 rounded bg-neutral-900 border border-neutral-800 hover:border-emerald-500/40 hover:text-emerald-400 transition-colors"
            >
              Public Data
            </Link>
          </div>
        </div>
      </div>

      <UnifiedSearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </section>
  );
}

'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Fix } from '@/types/canonical';
import { ChapterPackage } from '@/lib/editorial/chapter-factory';
import { PublicPublicationService } from '@/services/public/public-publication.service';
import { FixMetadataService } from '@/services/fixes/fix-metadata.service';

interface PublicKnowledgePortalViewProps {
  chapters: ChapterPackage[];
  fixes: Fix[];
}

export default function PublicKnowledgePortalView({ chapters, fixes }: PublicKnowledgePortalViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('ALL');
  const [readerMode, setReaderMode] = useState(false);

  // Filter public chapters by theme
  const filteredChapters = useMemo(() => {
    if (selectedTheme === 'ALL') return chapters;
    return chapters.filter((c) => c.collectionSlug.toUpperCase().includes(selectedTheme));
  }, [chapters, selectedTheme]);

  // Execute public-only search
  const searchResult = useMemo(() => {
    if (!searchQuery.trim()) return null;
    return PublicPublicationService.searchPublicKnowledge(fixes, searchQuery);
  }, [fixes, searchQuery]);

  return (
    <div className={`space-y-8 font-sans ${readerMode ? 'max-w-4xl mx-auto bg-gray-950 p-8 rounded-2xl border border-gray-800' : 'text-gray-100'}`}>
      
      {/* Header & Reader Mode Toggle Bar */}
      <section aria-labelledby="portal-header-heading" className="bg-gray-800/40 border border-gray-700/60 rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-700/60 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-amber-400 uppercase font-bold">
                Volume I (1947–1962)
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded border border-emerald-500/40 font-bold">
                Certified Public Knowledge Portal
              </span>
            </div>
            <h2 id="portal-header-heading" className="text-3xl font-extrabold text-gray-100 mt-1 tracking-tight">
              India & The World: Thematic Knowledge Directory
            </h2>
            <p className="text-sm text-gray-300 mt-1 max-w-3xl">
              Foundational research collections, primary statutory sources, and evidence-first historiographical analysis.
            </p>
          </div>

          <button
            onClick={() => setReaderMode(!readerMode)}
            className="bg-gray-800 hover:bg-gray-700 text-amber-300 border border-amber-500/30 text-xs font-mono px-3.5 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            {readerMode ? '📖 Exit Reader Mode' : '📖 Distraction-Free Reader Mode'}
          </button>
        </div>

        {/* Public Search Bar */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search across all published chapters, primary documents, and evidence..."
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-400 font-mono"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3 text-xs text-gray-400 hover:text-gray-200">
              Clear
            </button>
          )}
        </div>
      </section>

      {/* Module 1: Search Results overlay when query present */}
      {searchResult && (
        <section aria-labelledby="search-results-heading" className="bg-gray-800/60 border border-amber-500/40 rounded-xl p-6 space-y-4">
          <h3 id="search-results-heading" className="text-lg font-bold text-amber-300 border-b border-gray-700/60 pb-2">
            Public Search Results ({searchResult.total} hits found)
          </h3>
          <div className="space-y-3">
            {searchResult.hits.map((hit) => (
              <div key={hit.item.id} className="bg-gray-900/60 p-4 rounded-lg border border-gray-800 space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-mono text-amber-400 uppercase font-bold">{hit.item.primaryCategory}</span>
                  <span className="text-xs text-emerald-400 font-mono">Score: {Math.round(hit.score)}</span>
                </div>
                <h4 className="text-base font-bold text-gray-100">{hit.item.title}</h4>
                <p className="text-xs text-gray-300 line-clamp-2">{hit.item.summary}</p>
                <Link href={`/fix/${hit.item.slug}`} className="text-xs font-bold text-amber-400 hover:underline block pt-1">
                  Read Full Fix Analysis →
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Module 2: Thematic Pillars & Chapters Grid */}
      <section aria-labelledby="thematic-grid-heading" className="space-y-6">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <h3 id="thematic-grid-heading" className="text-xl font-bold text-gray-100">
            Volume I Published Chapters ({filteredChapters.length})
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-mono">Theme:</span>
            <select
              value={selectedTheme}
              onChange={(e) => setSelectedTheme(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-amber-300 font-mono focus:outline-none"
            >
              <option value="ALL">All Pillars</option>
              <option value="INDIA">India & The World</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChapters.map((ch) => (
            <div key={ch.chapterId} className="bg-gray-800/40 border border-gray-700/60 rounded-xl p-5 space-y-4 flex flex-col justify-between hover:border-gray-600 transition-colors">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-amber-400 font-mono font-bold uppercase">{ch.version}</span>
                  <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-mono">Gold Certified</span>
                </div>
                <h4 className="text-lg font-bold text-gray-100 leading-snug">{ch.title}</h4>
                <p className="text-xs text-amber-300 font-medium">{ch.subtitle}</p>
                <p className="text-xs text-gray-300 line-clamp-3 leading-relaxed">{ch.sixQuestions.whatHappened.summary}</p>
              </div>

              <div className="pt-4 border-t border-gray-700/50 flex items-center justify-between text-xs">
                <span className="text-gray-400 font-mono">{ch.readingTime} min read</span>
                <Link href={`/founding-edition/${ch.slug}`} className="text-amber-400 font-bold hover:underline">
                  Read Chapter →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Module 3: Chronological Multi-Layer Timeline Visualizer */}
      <section aria-labelledby="timeline-heading" className="bg-gray-800/40 border border-gray-700/60 rounded-xl p-6 space-y-4">
        <h3 id="timeline-heading" className="text-xl font-bold text-gray-100 border-b border-gray-700/60 pb-3 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
          Chronological Milestone Timeline (1947–1962)
        </h3>

        <div className="space-y-4">
          {chapters.flatMap((c) => c.sixQuestions.whatHappened.keyEvents || []).slice(0, 6).map((ev, i) => (
            <div key={i} className="flex gap-4 items-start bg-gray-900/60 p-3.5 rounded-lg border border-gray-800">
              <span className="bg-amber-500/10 text-amber-400 font-mono font-bold text-xs px-2.5 py-1 rounded border border-amber-500/30">
                {ev.year}
              </span>
              <p className="text-xs text-gray-200 mt-0.5">{ev.event}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

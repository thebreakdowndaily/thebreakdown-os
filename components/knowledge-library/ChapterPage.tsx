'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import type { Chapter, ReadingDepth } from '@/types/canonical';
import type { ChapterGraph } from '@/lib/knowledge/knowledge-graph';
import type { EnrichedClaim } from '@/lib/knowledge/knowledge-core';
import { KnowledgeRenderer } from './core/KnowledgeRenderer';
import { registerAllBlocks } from './blocks/registry';
import { ReadingModeProvider, useReadingDepth, useSetReadingDepth } from './reader/ReadingModeContext';
import { ReadingModeToggle } from './reader/ReadingModeToggle';
import { SourcesProvider } from './sources/SourcesContext';
import { GraphSidebar } from './graph/GraphSidebar';
import { ClaimRegistrySection } from './claims/ClaimRegistrySection';
import { LivingKnowledgeBanner } from './chapter/LivingKnowledgeBanner';

registerAllBlocks();

export function ChapterPageShell({
  chapter,
  collectionSlug,
  volumeSlug,
  graph,
  enrichedClaims,
}: {
  chapter: Chapter;
  collectionSlug: string;
  volumeSlug: string;
  graph?: ChapterGraph;
  enrichedClaims?: EnrichedClaim[];
}) {
  return (
    <ReadingModeProvider initial="explorer">
      <SourcesProvider sources={chapter.sources}>
        <ChapterPageInner
          chapter={chapter}
          collectionSlug={collectionSlug}
          volumeSlug={volumeSlug}
          graph={graph}
          enrichedClaims={enrichedClaims}
        />
      </SourcesProvider>
    </ReadingModeProvider>
  );
}

function ChapterPageInner({
  chapter,
  collectionSlug,
  volumeSlug,
  graph,
  enrichedClaims,
}: {
  chapter: Chapter;
  collectionSlug: string;
  volumeSlug: string;
  graph?: ChapterGraph;
  enrichedClaims?: EnrichedClaim[];
}) {
  const depth = useReadingDepth();
  const setDepth = useSetReadingDepth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const d = params.get('depth') as ReadingDepth | null;
    if (d && ['explorer', 'scholar', 'researcher'].includes(d)) setDepth(d);
  }, [setDepth]);

  const versionStr = `${chapter.version.major}.${chapter.version.minor}.${chapter.version.patch}`;

  return (
    <div className="flex">
    <main className="flex-1 max-w-4xl mx-auto px-4 py-12 min-w-0">
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link
            href={`/series/${collectionSlug}/volume/${volumeSlug}`}
            className="text-sm text-blue-600 hover:underline"
          >
            ← Back to Volume
          </Link>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200 whitespace-nowrap">
              The Breakdown · Founding Monograph 001
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              chapter.status === 'published' ? 'bg-green-100 text-green-700' :
              chapter.status === 'verified' ? 'bg-blue-100 text-blue-700' :
              'bg-gray-100 text-gray-500'
            }`}>
              {chapter.status}
            </span>
            <span className="text-xs text-gray-400">v{versionStr}</span>
            {chapter.lastVerifiedAt && (
              <span className="text-xs text-gray-400">
                Verified {new Date(chapter.lastVerifiedAt).toLocaleDateString('en-IN')}
              </span>
            )}
          </div>
        </div>
        <ReadingModeToggle />
      </div>

      <LivingKnowledgeBanner version={versionStr} />

      <div className="bg-amber-50 border border-amber-200 rounded-lg px-5 py-3 mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-amber-800 mb-1">About this publication</p>
        <p className="text-sm text-amber-700">
          <strong>The Breakdown Knowledge Library — Founding Monograph 001</strong><br />
          <em>India's Inheritance: Partition and the Strategic Foundations of Independent India (1947)</em>
        </p>
        <p className="text-sm text-amber-700 mt-1">
          This publication is versioned and evidence-based. It reflects the best available evidence at the time
          of publication and will be updated transparently as new evidence or corrections emerge. See{' '}
          <a href="/founding-edition" className="underline hover:text-amber-900">Founding Edition v1.0</a> for
          the complete publication package.
        </p>
      </div>

      <h1 className="text-3xl font-bold mb-2">{chapter.title}</h1>
      <p className="text-lg text-gray-600 mb-4">{chapter.summary}</p>

      <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-6">
        <span>Read: {chapter.readingTime[depth]} min</span>
        {chapter.studyTime && <span>Study: {chapter.studyTime[depth]} min</span>}
        <span>Difficulty: {'★'.repeat(chapter.difficulty)}{'☆'.repeat(5 - chapter.difficulty)}</span>
      </div>

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

      <KnowledgeRenderer blocks={chapter.content} />

      {enrichedClaims && enrichedClaims.length > 0 && depth !== 'explorer' && (
        <section className="mt-12 border-t pt-8">
          <ClaimRegistrySection claims={enrichedClaims} />
        </section>
      )}

      {chapter.keyQuestions.length > 0 && (
        <section className="mt-12 border-t pt-8">
          <h2 className="text-xl font-semibold mb-4">Key Questions</h2>
          <div className="space-y-4">
            {chapter.keyQuestions.map((kq, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium mb-1">{kq.question}</p>
                <p className="text-gray-700 text-sm">{kq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {chapter.misconceptions.length > 0 && (
        <section className="mt-8 border-t pt-8">
          <h2 className="text-xl font-semibold mb-4">Common Misconceptions</h2>
          <div className="space-y-4">
            {chapter.misconceptions.map((m, i) => (
              <details key={i} className="bg-amber-50 rounded-lg p-4">
                <summary className="font-medium cursor-pointer">{m.misconception}</summary>
                <div className="mt-2 pl-4 border-l-2 border-amber-300">
                  <p className="font-medium text-green-800">{m.correction}</p>
                  <p className="text-gray-700 text-sm mt-1">{m.explanation}</p>
                </div>
              </details>
            ))}
          </div>
        </section>
      )}

      {chapter.keyTerms.length > 0 && (
        <section className="mt-8 border-t pt-8">
          <h2 className="text-xl font-semibold mb-4">Key Terms</h2>
          <dl className="space-y-3">
            {chapter.keyTerms.map((t, i) => (
              <div key={i}>
                <dt className="font-medium">{t.term}</dt>
                <dd className="text-gray-700 text-sm pl-4">{t.definition}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {depth !== 'explorer' && chapter.sources.length > 0 && (
        <section className="mt-8 border-t pt-8">
          <h2 className="text-xl font-semibold mb-4">Sources</h2>
          <ol className="space-y-2 text-sm">
            {chapter.sources.map((s, i) => (
              <li key={i}>
                <span className="font-mono text-gray-400">[{i + 1}]</span>{' '}
                <span className="text-gray-700">{s.title}</span>
                {s.tier && <span className="ml-2 text-xs text-gray-400">(Tier {s.tier})</span>}
                {s.url && (
                  <a href={s.url} target="_blank" rel="noopener noreferrer"
                     className="ml-2 text-blue-600 hover:underline text-xs">↗</a>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}

      {chapter.recommendedNext.length > 0 && (
        <section className="mt-8 border-t pt-8">
          <h2 className="text-xl font-semibold mb-4">Next</h2>
          <p className="text-sm text-gray-600">Recommended: {chapter.recommendedNext.join(' → ')}</p>
        </section>
      )}

      <section className="mt-12 pt-8 border-t">
        <div className="bg-amber-50 rounded-lg p-5">
          <h3 className="text-sm font-semibold text-amber-800 mb-2">Help improve this Knowledge Monograph</h3>
          <p className="text-sm text-amber-700 mb-3">
            This is a Version 1.0 publication — a living document, not a finished product. Your feedback makes it better.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="/methodology#corrections" className="text-xs px-3 py-1.5 rounded bg-amber-200 text-amber-900 hover:bg-amber-300">
              Report an issue
            </a>
            <a href="/methodology" className="text-xs px-3 py-1.5 rounded bg-amber-200 text-amber-900 hover:bg-amber-300">
              View methodology
            </a>
            <a href="/trust" className="text-xs px-3 py-1.5 rounded bg-amber-200 text-amber-900 hover:bg-amber-300">
              Trust Dashboard
            </a>
          </div>
        </div>
      </section>

      <footer className="mt-8 pt-6 border-t text-sm text-gray-400 flex justify-between">
        <Link href={`/series/${collectionSlug}/volume/${volumeSlug}`} className="hover:text-blue-600">
          ← All chapters
        </Link>
        <Link href={`/series/${collectionSlug}`} className="hover:text-blue-600">
          Back to {collectionSlug} →
        </Link>
      </footer>
    </main>
    {graph && (
      <div className="hidden lg:block shrink-0">
        <GraphSidebar
          concepts={graph.concepts}
          relatedConcepts={graph.relatedConcepts}
          relatedChapters={graph.relatedChapters}
          entityLinks={graph.entityLinks}
          sources={graph.sources}
        />
      </div>
    )}
    </div>
  );
}

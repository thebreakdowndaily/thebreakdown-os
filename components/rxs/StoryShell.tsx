'use client';
// @rxs/implementation: contracts/story-shell.md — StoryShell orchestrator, composes reading journey via StoryExperienceController

import { StoryLayout } from '@/components/rxs/StoryLayout';
import { HeroRegion } from '@/components/rxs/regions/HeroRegion';
import { ContextRegion } from '@/components/rxs/regions/ContextRegion';
import { KnowledgeRegion } from '@/components/rxs/regions/KnowledgeRegion';
import { CompletionRegion } from '@/components/rxs/regions/CompletionRegion';
import { StoryProgress } from '@/components/rxs/StoryProgress';
import { StoryStage } from '@/components/rxs/StoryStage';
import { StoryExperienceController } from '@/components/rxs/StoryExperienceController';
import { ReaderOrientation } from '@/components/rxs/ReaderOrientation';
import { KnowledgeRenderer } from '@/components/knowledge-library/core/KnowledgeRenderer';
import { ClaimRegistrySection } from '@/components/knowledge-library/claims/ClaimRegistrySection';
import { GraphSidebar } from '@/components/knowledge-library/graph/GraphSidebar';
import { InvestigationPanel } from '@/components/knowledge-library/investigation/InvestigationPanel';
import { extractTocItems } from '@/lib/toc';
import { useReadingDepth } from '@/components/knowledge-library/reader/ReadingModeContext';
import { VisualNavigation } from '@/components/knowledge-library/visual/VisualNavigation';
import { VisualGallery } from '@/components/knowledge-library/visual/VisualGallery';
import type { Chapter } from '@/types/canonical';
import type { EnrichedClaim } from '@/lib/knowledge/knowledge-core';
import type { ChapterGraph } from '@/lib/knowledge/knowledge-graph';

interface StoryShellProps {
  chapter: Chapter;
  collectionSlug: string;
  volumeSlug: string;
  enrichedClaims?: EnrichedClaim[];
  claimCount: number;
  evidenceCount: number;
  thinkerCount: number;
  documentCount: number;
  graph?: ChapterGraph;
  nextChapter?: { title: string; slug: string } | null;
  relatedInvestigation?: { title: string; slug: string } | null;
}

function ReflectionSection({ chapter }: { chapter: Chapter }) {
  return (
    <div className="space-y-10">
      {chapter.keyQuestions.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Key Questions</h3>
          <div className="space-y-4">
            {chapter.keyQuestions.map((kq, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium mb-1 text-gray-900">{kq.question}</p>
                <p className="text-gray-700 text-sm">{kq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {chapter.misconceptions.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Common Misconceptions</h3>
          <div className="space-y-4">
            {chapter.misconceptions.map((m, i) => (
              <details key={i} className="bg-amber-50 rounded-lg p-4">
                <summary className="font-medium cursor-pointer text-gray-900">{m.misconception}</summary>
                <div className="mt-2 pl-4 border-l-2 border-amber-300">
                  <p className="font-medium text-green-800">{m.correction}</p>
                  <p className="text-gray-700 text-sm mt-1">{m.explanation}</p>
                </div>
              </details>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ReferenceSection({ chapter }: { chapter: Chapter }) {
  const depth = useReadingDepth();

  return (
    <div className="space-y-10">
      {chapter.keyTerms.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Key Terms</h3>
          <dl className="space-y-3">
            {chapter.keyTerms.map((t, i) => (
              <div key={i}>
                <dt className="font-medium text-gray-900">{t.term}</dt>
                <dd className="text-gray-700 text-sm pl-4">{t.definition}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {depth !== 'explorer' && chapter.sources.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Sources</h3>
          <ol className="space-y-2 text-sm">
            {chapter.sources.map((s, i) => (
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
      )}
    </div>
  );
}

export function StoryShell({
  chapter,
  collectionSlug,
  volumeSlug,
  enrichedClaims,
  claimCount,
  evidenceCount,
  thinkerCount,
  documentCount,
  graph,
  nextChapter,
  relatedInvestigation,
}: StoryShellProps) {
  const tocItems = extractTocItems(chapter.content);

  return (
    <StoryExperienceController chapter={chapter}>
      <StoryLayout
        toc={<><ReaderOrientation items={tocItems} /><VisualGallery /></>}
        sidebar={
          <div className="space-y-6">
            <KnowledgeRegion
              chapter={chapter}
              claimCount={claimCount}
              evidenceCount={evidenceCount}
              thinkerCount={thinkerCount}
              documentCount={documentCount}
            />
            {graph && (
              <GraphSidebar
                concepts={graph.concepts}
                relatedConcepts={graph.relatedConcepts}
                relatedChapters={graph.relatedChapters}
                entityLinks={graph.entityLinks}
                sources={graph.sources}
              />
            )}
          </div>
        }
      >
        {/* Stage 1 — Context */}
        <StoryStage number={1} title="Context">
          <HeroRegion chapter={chapter} collectionSlug={collectionSlug} volumeSlug={volumeSlug} />
          <StoryProgress />
          <ContextRegion chapter={chapter} />
        </StoryStage>

        {/* Stage 2 — Narrative */}
        <StoryStage number={2} title="Narrative">
          <div className="prose prose-slate max-w-none dark:prose-invert font-sans text-base md:text-lg leading-relaxed text-gray-900 [&>p]:mb-6">
            <KnowledgeRenderer blocks={chapter.content} />
          </div>
        </StoryStage>

        {/* Stage 3 — Evidence */}
        {enrichedClaims && enrichedClaims.length > 0 && (
          <StoryStage number={3} title="Evidence">
            <ClaimRegistrySection claims={enrichedClaims} />
          </StoryStage>
        )}

        {/* Stage 4 — Reflection */}
        {(chapter.keyQuestions.length > 0 || chapter.misconceptions.length > 0) && (
          <StoryStage number={4} title="Reflection">
            <ReflectionSection chapter={chapter} />
          </StoryStage>
        )}

        {/* Stage 5 — Reference */}
        {(chapter.keyTerms.length > 0 || chapter.sources.length > 0) && (
          <StoryStage number={5} title="Reference">
            <ReferenceSection chapter={chapter} />
          </StoryStage>
        )}

        {/* Stage 6 — Continue Learning */}
        <StoryStage number={6} title="Continue Learning">
          <CompletionRegion
            chapter={chapter}
            collectionSlug={collectionSlug}
            volumeSlug={volumeSlug}
            nextChapter={nextChapter}
            relatedInvestigation={relatedInvestigation}
          />
        </StoryStage>

        {/* Living Knowledge CTA */}
        <section className="mt-12 pt-8 border-t mb-8">
          <div className="bg-amber-50 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-amber-800 mb-2" id="living-knowledge">Living Knowledge</h3>
            <p className="text-sm text-amber-700 mb-1">
              This publication is versioned. Historical understanding improves through evidence, debate, and correction.
              If you find an error, identify a stronger primary source, or believe an interpretation should be
              reconsidered, we invite you to tell us. Every substantive correction will be reviewed and, where
              appropriate, incorporated into future versions with a public revision history.
            </p>
            <div className="flex flex-wrap gap-3 mt-3">
              <a href="/methodology#corrections" className="text-xs px-3 py-1.5 rounded bg-amber-200 text-amber-900 hover:bg-amber-300">
                Report a correction
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
      </StoryLayout>
      <InvestigationPanel />
      <VisualNavigation />
    </StoryExperienceController>
  );
}

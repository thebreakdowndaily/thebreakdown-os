'use client';

import type { Chapter, ReadingDepth } from '@/types/canonical';
import { KnowledgeRenderer } from '@/components/knowledge-library/core/KnowledgeRenderer';
import { ClaimRegistrySection } from '@/components/knowledge-library/claims/ClaimRegistrySection';
import { useReadingDepth } from '@/components/knowledge-library/reader/ReadingModeContext';
import type { EnrichedClaim } from '@/lib/knowledge/knowledge-core';

export function StoryContent({
  chapter,
  enrichedClaims,
}: {
  chapter: Chapter;
  enrichedClaims?: EnrichedClaim[];
}) {
  const depth = useReadingDepth();

  return (
    <div>
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
    </div>
  );
}

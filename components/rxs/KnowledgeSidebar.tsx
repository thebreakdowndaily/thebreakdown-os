'use client';

import { useReadingDepth } from '@/components/knowledge-library/reader/ReadingModeContext';
import type { Chapter } from '@/types/canonical';

export function KnowledgeSidebar({
  chapter,
  claimCount,
  evidenceCount,
  thinkerCount,
  documentCount,
}: {
  chapter: Chapter;
  claimCount: number;
  evidenceCount: number;
  thinkerCount: number;
  documentCount: number;
}) {
  const depth = useReadingDepth();
  const pct = Math.round((claimCount / 50) * 100);

  return (
    <div className="space-y-6">
      <section className="bg-gray-50 rounded-xl border border-gray-200 p-5">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Reading Progress</h3>
        <div className="w-full bg-gray-200 rounded-full h-2" role="progressbar" aria-valuenow={0} aria-valuemin={0} aria-valuemax={100} aria-label="Reading progress">
          <div className="bg-blue-600 h-2 rounded-full" style={{ width: '0%' }} />
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {depth === 'explorer' ? 'Quick scan' : depth === 'scholar' ? 'In-depth read' : 'Full study'} mode
        </p>
      </section>

      <section className="bg-gray-50 rounded-xl border border-gray-200 p-5">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Knowledge Profile</h3>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500">Claims</dt>
            <dd className="font-medium">{claimCount}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Evidence</dt>
            <dd className="font-medium">{evidenceCount}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Thinkers</dt>
            <dd className="font-medium">{thinkerCount}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Documents</dt>
            <dd className="font-medium">{documentCount}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Sources</dt>
            <dd className="font-medium">{chapter.sources.length}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Glossary</dt>
            <dd className="font-medium">{chapter.keyTerms.length}</dd>
          </div>
        </dl>
      </section>

      <section className="bg-gray-50 rounded-xl border border-gray-200 p-5">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Evidence Coverage</h3>
        <div className="w-full bg-gray-200 rounded-full h-2" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Evidence coverage">
          <div className="bg-green-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs text-gray-400 mt-2">{claimCount} claims with supporting evidence</p>
      </section>

      <section className="bg-gray-50 rounded-xl border border-gray-200 p-5">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Continue Learning</h3>
        <p className="text-sm text-gray-500">Chapter 2 coming soon</p>
      </section>
    </div>
  );
}

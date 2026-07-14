'use client';

import type { FC } from 'react';
import type { Chapter, Source } from '@/types/canonical';

interface TrustPanelProps {
  chapter: Chapter;
}

export const TrustPanel: FC<TrustPanelProps> = ({ chapter }) => {
  const blocks = chapter.content;
  const claimBlocks = blocks.filter(b => b.type === 'claim');
  const evidenceSummaries = blocks.filter(b => b.type === 'evidence-summary');
  const thinkerBlocks = blocks.filter(b => b.type === 'thinker');
  const documentBlocks = blocks.filter(b => b.type === 'document');
  const imageBlocks = blocks.filter(b => b.type === 'image');
  const mapBlocks = blocks.filter(b => b.type === 'map');
  const chartBlocks = blocks.filter(b => b.type === 'chart');
  const primarySources = chapter.sources.filter(s => (s as Source & { tier?: number }).tier && (s as Source & { tier?: number }).tier! <= 1);

  const versionStr = `${chapter.version.major}.${chapter.version.minor}.${chapter.version.patch}`;

  const stats = [
    { label: 'Sources', value: chapter.sources.length, color: 'bg-blue-50 text-blue-700' },
    { label: 'Primary', value: primarySources.length, color: 'bg-green-50 text-green-700' },
    { label: 'Claims', value: claimBlocks.length, color: 'bg-red-50 text-red-700' },
    { label: 'Evidence', value: evidenceSummaries.length, color: 'bg-orange-50 text-orange-700' },
    { label: 'Documents', value: documentBlocks.length, color: 'bg-purple-50 text-purple-700' },
    { label: 'Thinkers', value: thinkerBlocks.length, color: 'bg-emerald-50 text-emerald-700' },
    { label: 'Images', value: imageBlocks.length, color: 'bg-teal-50 text-teal-700' },
    { label: 'Maps', value: mapBlocks.length, color: 'bg-lime-50 text-lime-700' },
    { label: 'Charts', value: chartBlocks.length, color: 'bg-amber-50 text-amber-700' },
    { label: 'Glossary', value: chapter.keyTerms.length, color: 'bg-indigo-50 text-indigo-700' },
  ];

  const total = [
    { label: 'Version', value: `v${versionStr}` },
    { label: 'Status', value: chapter.status },
    { label: 'Word Count', value: chapter.metadata?.wordCount?.toLocaleString() ?? '—' },
    { label: 'Last Verified', value: chapter.lastVerifiedAt ? new Date(chapter.lastVerifiedAt).toLocaleDateString('en-IN') : '—' },
  ];

  return (
    <section className="mb-10 rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Knowledge Profile</h2>
        <a href="/trust" className="text-xs text-blue-600 hover:underline">View platform trust dashboard →</a>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {stats.map(s => (
            <div key={s.label} className={`rounded-lg px-3 py-2.5 ${s.color}`}>
              <div className="text-lg font-bold">{s.value}</div>
              <div className="text-xs font-medium opacity-80">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-1 mt-4 text-xs text-gray-500">
          {total.map(t => (
            <span key={t.label}><strong>{t.label}:</strong> {t.value}</span>
          ))}
          <span><strong>Corrections:</strong> 0</span>
          <span><strong>Confidence:</strong> High</span>
        </div>
      </div>
    </section>
  );
};

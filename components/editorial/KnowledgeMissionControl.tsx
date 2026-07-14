'use client';

import { useState, useMemo } from 'react';
import type { ChapterEntry, QualityScores, PublishChecklistItem, InstitutionalTrustIndex } from '@/features/editorial/knowledge-service';

// ─── Types ─────────────────────────────────────────────────────────────────────

type Tab = 'tree' | 'quality' | 'publish';

interface Props {
  chapters: ChapterEntry[];
  trustIndex: InstitutionalTrustIndex;
}

// ─── Main Component ────────────────────────────────────────────────────────

export default function KnowledgeMissionControl({ chapters, trustIndex }: Props) {
  const [tab, setTab] = useState<Tab>('tree');
  const [selectedChapter, setSelectedChapter] = useState<string>(chapters[0]?.chapter.id ?? '');

  const active = chapters.find(c => c.chapter.id === selectedChapter);

  return (
    <div className="min-h-screen bg-[#050505] font-sans selection:bg-emerald-500/30 text-white pb-24">
      <header className="border-b border-neutral-900 bg-[#0a0a0a] sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold tracking-tight">
              Knowledge <span className="text-emerald-500">Mission Control</span>
            </h1>
            <span className="bg-emerald-950/50 text-emerald-500 text-[10px] uppercase tracking-widest px-2 py-1 rounded font-bold border border-emerald-900/50">
              {chapters.length} chapters
            </span>
          </div>
          <nav className="flex gap-1 bg-neutral-900 rounded-lg p-1">
            {(['tree', 'quality', 'publish'] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-md text-xs font-medium uppercase tracking-wider transition-all ${
                  tab === t
                    ? 'bg-emerald-600 text-black shadow-lg'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                {t === 'tree' ? 'Mission Control' : t === 'quality' ? 'Quality Dashboard' : 'Publish Gate'}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Institutional Trust Index — the single most important metric */}
        <InstitutionalTrustBanner index={trustIndex} />

        {tab === 'tree' && <TreeView chapters={chapters} selected={selectedChapter} onSelect={setSelectedChapter} />}
        {tab === 'quality' && <QualityView chapters={chapters} selected={selectedChapter} onSelect={setSelectedChapter} />}
        {tab === 'publish' && <PublishView chapter={active} />}
      </main>
    </div>
  );
}

// ─── Institutional Trust Index Banner ─────────────────────────────────────────────

function InstitutionalTrustBanner({ index }: { index: InstitutionalTrustIndex }) {
  const { score, belowThreshold, components, publishedChapters, reviewComplete, reviewTotal } = index;
  const tone =
    score >= 80 ? 'text-emerald-500' : score >= 50 ? 'text-amber-500' : 'text-rose-500';

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-8">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">Institutional Trust Index</div>
            <div className={`text-4xl font-bold ${tone}`}>{score}<span className="text-lg text-neutral-600">/100</span></div>
            <div className={`text-[10px] uppercase tracking-widest font-bold mt-1 ${belowThreshold ? 'text-rose-500' : 'text-emerald-500'}`}>
              {belowThreshold ? '⚠ Below publication threshold — publishing halted' : '✓ Above threshold — publishing permitted'}
            </div>
          </div>
          <div className="text-neutral-500 text-sm border-l border-neutral-800 pl-6">
            <div className="text-neutral-300"><span className="text-neutral-500">Published chapters:</span> {publishedChapters}</div>
            <div className="text-neutral-300"><span className="text-neutral-500">Review completion:</span> {reviewComplete}% <span className="text-neutral-600">({reviewTotal} checks)</span></div>
          </div>
        </div>
      </div>

      {/* Component breakdown */}
      <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-3">
        {components.map(c => (
          <div key={c.label} className="flex items-center justify-between text-xs">
            <span className="text-neutral-400">{c.label}</span>
            <span className="text-neutral-300 font-medium">
              {c.value}
              <span className="text-neutral-600"> · {c.weight}%</span>
            </span>
          </div>
        ))}
      </div>

      <p className="mt-4 text-[10px] text-neutral-600 border-t border-neutral-800 pt-3">
        Evidence before conclusions. Context before certainty. — Computed automatically from the canonical data layer. If this index drops below 80, all new publications halt.
      </p>
    </div>
  );
}

// ─── Tree View (Mission Control) ───────────────────────────────────────────

function TreeView({ chapters, selected, onSelect }: {
  chapters: ChapterEntry[];
  selected: string;
  onSelect: (id: string) => void;
}) {
  const grouped = useMemo(() => {
    const map = new Map<string, Map<string, ChapterEntry[]>>();
    for (const ch of chapters) {
      if (!map.has(ch.collectionSlug)) map.set(ch.collectionSlug, new Map());
      const volMap = map.get(ch.collectionSlug)!;
      if (!volMap.has(ch.volumeSlug)) volMap.set(ch.volumeSlug, []);
      volMap.get(ch.volumeSlug)!.push(ch);
    }
    return map;
  }, [chapters]);

  const active = chapters.find(c => c.chapter.id === selected);

  return (
    <div className="grid grid-cols-[400px_1fr] gap-6">
      {/* Tree panel */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 overflow-y-auto max-h-[calc(100vh-180px)]">
        <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-4 px-2">Library Structure</h2>
        <div className="space-y-1">
          <div className="text-emerald-400 font-bold text-xs mb-2">India and the World</div>
          {[...grouped.entries()].map(([colSlug, volMap]) => (
            <div key={colSlug} className="pl-3 border-l-2 border-neutral-800">
              <div className="text-neutral-300 text-xs font-semibold py-1 capitalize">{colSlug.replace(/-/g, ' ')}</div>
              {[...volMap.entries()].map(([volSlug, chs]) => (
                <div key={volSlug} className="pl-3 border-l-2 border-neutral-800 mt-1">
                  <div className="text-neutral-500 text-[10px] uppercase tracking-wider py-1">{volSlug.replace(/-/g, ' ')}</div>
                  {chs.map(ch => (
                    <button
                      key={ch.chapter.id}
                      onClick={() => onSelect(ch.chapter.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all my-0.5 ${
                        selected === ch.chapter.id
                          ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800/50'
                          : 'text-neutral-400 hover:bg-neutral-800 border border-transparent'
                      }`}
                    >
                      <div className="font-medium">{ch.chapter.title}</div>
                      <div className="flex gap-2 mt-1">
                        <StatusBadge status={ch.chapter.status} />
                        <span className="text-neutral-600">{ch.metrics.wordCount}w</span>
                      </div>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Detail panel */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
        {active ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold">{active.chapter.title}</h2>
                <p className="text-sm text-neutral-400 mt-1">{active.chapter.summary}</p>
              </div>
              <StatusBadge status={active.chapter.status} large />
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
              <MetricCard label="Blocks" value={active.metrics.blockCount} />
              <MetricCard label="Sources" value={active.metrics.sourceCount} />
              <MetricCard label="Claims" value={active.metrics.claimCount} />
              <MetricCard label="Evidence" value={active.metrics.evidenceCount} />
              <MetricCard label="Word Count" value={active.metrics.wordCount} />
              <MetricCard label="Version" value={active.metrics.version} />
              <MetricCard
                label="Last Verified"
                value={active.metrics.lastVerifiedAt ? new Date(active.metrics.lastVerifiedAt).toLocaleDateString() : 'Never'}
              />
              <MetricCard
                label="Quality Score"
                value={`${active.quality.overall}%`}
                highlight={active.quality.overall >= 80}
                warn={active.quality.overall < 50}
              />
            </div>

            {/* Block types present */}
            <div className="mb-4">
              <h3 className="text-xs text-neutral-500 uppercase tracking-wider mb-2">Block Types ({active.metrics.blockTypes.length})</h3>
              <div className="flex flex-wrap gap-1.5">
                {active.metrics.blockTypes.map(t => (
                  <span key={t} className="px-2 py-0.5 rounded text-[10px] font-mono bg-neutral-800 text-neutral-300 border border-neutral-700">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing sections */}
            {active.metrics.missingSections.length > 0 && (
              <div>
                <h3 className="text-xs text-rose-500 uppercase tracking-wider mb-2">Missing Sections ({active.metrics.missingSections.length})</h3>
                <div className="flex flex-wrap gap-1.5">
                  {active.metrics.missingSections.map(s => (
                    <span key={s} className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-950/30 text-rose-400 border border-rose-800/50">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quick checklist summary */}
            <div className="mt-6 pt-4 border-t border-neutral-800">
              <h3 className="text-xs text-neutral-500 uppercase tracking-wider mb-3">Publish Checklist</h3>
              <div className="grid grid-cols-2 gap-2">
                {active.checklist.map(item => (
                  <div key={item.id} className="flex items-center gap-2 text-xs">
                    <span className={item.passed ? 'text-emerald-500' : 'text-rose-500'}>
                      {item.passed ? '✓' : '✗'}
                    </span>
                    <span className={item.passed ? 'text-neutral-300' : 'text-neutral-500'}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="text-neutral-500 text-sm flex items-center justify-center h-64">Select a chapter from the tree</div>
        )}
      </div>
    </div>
  );
}

// ─── Quality Dashboard ─────────────────────────────────────────────────────

function QualityView({ chapters, selected, onSelect }: {
  chapters: ChapterEntry[];
  selected: string;
  onSelect: (id: string) => void;
}) {
  const active = chapters.find(c => c.chapter.id === selected);

  return (
    <div className="grid grid-cols-[300px_1fr] gap-6">
      {/* Chapter selector */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 overflow-y-auto max-h-[calc(100vh-180px)]">
        <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-4 px-2">Chapters</h2>
        {chapters.map(ch => (
          <button
            key={ch.chapter.id}
            onClick={() => onSelect(ch.chapter.id)}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-all my-0.5 ${
              selected === ch.chapter.id
                ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800/50'
                : 'text-neutral-400 hover:bg-neutral-800 border border-transparent'
            }`}
          >
            <div className="font-medium">{ch.chapter.title}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[10px] font-mono ${
                ch.quality.overall >= 80 ? 'text-emerald-500' : ch.quality.overall >= 50 ? 'text-amber-500' : 'text-rose-500'
              }`}>
                {ch.quality.overall}%
              </span>
              <StatusBadge status={ch.chapter.status} />
            </div>
          </button>
        ))}
      </div>

      {/* Quality detail */}
      <div>
        {active ? (
          <>
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">{active.chapter.title}</h2>
                <div className={`text-3xl font-mono font-bold ${
                  active.quality.overall >= 80 ? 'text-emerald-500' : active.quality.overall >= 50 ? 'text-amber-500' : 'text-rose-500'
                }`}>
                  {active.quality.overall}%
                </div>
              </div>

              <div className="space-y-3">
                <ScoreBar label="Coverage" score={active.quality.coverage} />
                <ScoreBar label="Evidence" score={active.quality.evidence} />
                <ScoreBar label="Neutrality" score={active.quality.neutrality} />
                <ScoreBar label="Sources" score={active.quality.sources} />
                <ScoreBar label="Learning" score={active.quality.learning} />
                <ScoreBar label="Visuals" score={active.quality.visuals} />
                <ScoreBar label="Freshness" score={active.quality.freshness} />
              </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
              <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-4">Missing Sections</h3>
              {active.metrics.missingSections.length > 0 ? (
                <ul className="space-y-2">
                  {active.metrics.missingSections.map(s => (
                    <li key={s} className="flex items-center gap-3 text-sm">
                      <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                      <span className="text-rose-400">{s}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-emerald-500 text-sm">All required sections present</p>
              )}
              <div className="mt-4 pt-4 border-t border-neutral-800">
                <QualitySummary metrics={active.metrics} chapter={active.chapter} />
              </div>
            </div>
          </>
        ) : (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 text-neutral-500 text-sm flex items-center justify-center h-64">
            Select a chapter to view quality scores
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Publish Gate ──────────────────────────────────────────────────────────

function PublishView({ chapter }: { chapter: ChapterEntry | undefined }) {
  if (!chapter) {
    return (
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 text-neutral-500 text-sm flex items-center justify-center h-64">
        No chapter data available
      </div>
    );
  }

  const passed = chapter.checklist.filter(i => i.passed).length;
  const total = chapter.checklist.length;
  const allPassed = passed === total;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold">{chapter.chapter.title}</h2>
            <p className="text-sm text-neutral-400 mt-1">Publish Readiness Checklist</p>
          </div>
          <StatusBadge status={chapter.chapter.status} large />
        </div>

        <div className="flex items-center gap-4 p-4 rounded-xl border mb-6"
          style={{ borderColor: allPassed ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.3)',
                   background: allPassed ? 'rgba(16,185,129,0.08)' : 'rgba(244,63,94,0.08)' }}
        >
          <span className={`text-3xl ${allPassed ? 'text-emerald-500' : 'text-rose-500'}`}>
            {allPassed ? '✓' : `${passed}/${total}`}
          </span>
          <div>
            <div className={`font-bold ${allPassed ? 'text-emerald-500' : 'text-rose-500'}`}>
              {allPassed ? 'Ready to Publish' : `${total - passed} items remaining`}
            </div>
            <div className="text-xs text-neutral-400 mt-0.5">
              {allPassed
                ? 'All Knowledge Completeness Principle requirements satisfied'
                : 'Complete all checklist items before publishing'}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {chapter.checklist.map(item => (
            <div
              key={item.id}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                item.passed
                  ? 'bg-emerald-950/10 border-emerald-900/20'
                  : 'bg-rose-950/10 border-rose-900/20'
              }`}
            >
              <span className={`text-lg mt-0.5 ${item.passed ? 'text-emerald-500' : 'text-rose-500'}`}>
                {item.passed ? '✓' : '✗'}
              </span>
              <div className="flex-1">
                <div className={`font-medium text-sm ${item.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {item.label}
                </div>
                <div className="text-xs text-neutral-500 mt-0.5">{item.details}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Version and verification info */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
        <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-4">Editorial Metadata</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <MetaField label="Status" value={chapter.chapter.status} />
          <MetaField label="Version" value={chapter.metrics.version} />
          <MetaField label="Last Verified" value={chapter.metrics.lastVerifiedAt ? new Date(chapter.metrics.lastVerifiedAt).toLocaleDateString() : 'Never'} />
          <MetaField label="Editor" value={chapter.chapter.metadata.editor || 'Unassigned'} />
          <MetaField label="Reviewer" value={chapter.chapter.metadata.reviewer || 'None'} />
          <MetaField label="Word Count" value={String(chapter.metrics.wordCount)} />
          <MetaField label="Sources" value={String(chapter.metrics.sourceCount)} />
          <MetaField label="Quality Score" value={`${chapter.quality.overall}%`} />
        </div>
      </div>
    </div>
  );
}

// ─── Shared Sub-Components ─────────────────────────────────────────────────

function StatusBadge({ status, large }: { status: string; large?: boolean }) {
  const colors: Record<string, string> = {
    draft: 'bg-neutral-800 text-neutral-400 border-neutral-700',
    review: 'bg-amber-950/30 text-amber-400 border-amber-800/50',
    verified: 'bg-blue-950/30 text-blue-400 border-blue-800/50',
    published: 'bg-emerald-950/30 text-emerald-400 border-emerald-800/50',
    updated: 'bg-purple-950/30 text-purple-400 border-purple-800/50',
    archived: 'bg-neutral-800 text-neutral-500 border-neutral-700',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${colors[status] || colors.draft} ${large ? 'text-xs px-3 py-1' : ''}`}>
      {status}
    </span>
  );
}

function MetricCard({ label, value, highlight, warn }: { label: string; value: string | number; highlight?: boolean; warn?: boolean }) {
  return (
    <div className="bg-neutral-800/50 border border-neutral-800 rounded-lg p-3">
      <div className={`text-xl font-mono font-bold ${highlight ? 'text-emerald-500' : warn ? 'text-rose-500' : 'text-white'}`}>
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-wider text-neutral-500 mt-1 font-medium">{label}</div>
    </div>
  );
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  const color = score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-rose-500';
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-neutral-300">{label}</span>
        <span className={`font-mono font-bold ${score >= 80 ? 'text-emerald-500' : score >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>
          {score}%
        </span>
      </div>
      <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function MetaField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-medium">{label}</div>
      <div className="text-sm text-neutral-200 mt-0.5 font-mono">{value}</div>
  </div>
  );
}

function QualitySummary({ metrics, chapter }: { metrics: ChapterEntry['metrics']; chapter: ChapterEntry['chapter'] }) {
  return (
    <div className="text-xs text-neutral-500 space-y-1">
      <p><span className="text-neutral-400">Blocks:</span> {metrics.blockCount} total ({metrics.blockTypes.length} types)</p>
      <p><span className="text-neutral-400">Claims with evidence:</span> {metrics.evidenceCount > 0 ? `${Math.min(metrics.evidenceCount, metrics.claimCount)}/${metrics.claimCount}` : '0/' + metrics.claimCount}</p>
      <p><span className="text-neutral-400">Learning objectives:</span> {chapter.learningObjectives.length}</p>
      <p><span className="text-neutral-400">Key questions:</span> {chapter.keyQuestions.length}</p>
      <p><span className="text-neutral-400">Misconceptions:</span> {chapter.misconceptions.length}</p>
      <p><span className="text-neutral-400">Key terms:</span> {chapter.keyTerms.length}</p>
    </div>
  );
}

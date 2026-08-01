import Link from 'next/link';
import type { KnowledgeLibrary, KnowledgeCollection, Volume } from '@/types/canonical';
import SpatialNarrativeBreadcrumb from '@/components/narrative/SpatialNarrativeBreadcrumb';
import Badge from '@/components/ui/Badge';


function collectionTrustScore(col: KnowledgeCollection): { score: number; grade: string } {
  const chapters = col.volumes.flatMap(v => v.chapters);
  const totalClaims = chapters.reduce((s, ch) => s + ch.content.filter(b => b.type === 'claim').length, 0);
  const totalEvidence = chapters.reduce((s, ch) => s + ch.content.filter(b => b.type === 'evidence-summary').length, 0);
  const verifiedChapters = chapters.filter(ch => ch.status === 'verified').length;
  const totalChapters = chapters.length;
  const reviewScore = totalChapters > 0 ? (verifiedChapters / totalChapters) * 40 : 0;
  const evidenceScore = totalClaims > 0 ? Math.min((totalEvidence / totalClaims) * 30, 30) : 0;
  const freshnessScore = chapters.every(ch => new Date(ch.lastVerifiedAt || ch.updatedAt) > new Date(Date.now() - 90 * 86400000)) ? 20 : 10;
  const completenessScore = chapters.filter(ch => ch.content.length > 50).length / Math.max(totalChapters, 1) * 10;
  const score = Math.round(reviewScore + evidenceScore + freshnessScore + completenessScore);
  return { score, grade: score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : 'D' };
}

function reviewBadge(status: string) {
  switch (status) {
    case 'verified': return { label: 'Gold Standard', color: 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30' };
    case 'review': return { label: 'Internal Review', color: 'text-amber-400 bg-amber-500/10 border border-amber-500/30' };
    default: return { label: 'Draft', color: 'text-neutral-400 bg-neutral-800' };
  }
}

function VolumeCard({ volume, collectionSlug }: { volume: Volume; collectionSlug: string }) {
  const totalClaims = volume.chapters.reduce((s, ch) => s + ch.content.filter(b => b.type === 'claim').length, 0);
  const totalEvidence = volume.chapters.reduce((s, ch) => s + ch.content.filter(b => b.type === 'evidence-summary').length, 0);
  const coverageRatio = totalClaims > 0 ? Math.round((totalEvidence / totalClaims) * 100) : 0;

  return (
    <Link
      href={`/series/${collectionSlug}/volume/${volume.slug}`}
      className="block p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 hover:border-emerald-500/50 hover:shadow-xl transition-all group"
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors mb-1">
            {volume.title}
          </h3>
          {volume.subtitle && <p className="text-sm font-medium text-emerald-400/80 mb-2">{volume.subtitle}</p>}
          <p className="text-neutral-300 text-sm mb-4 leading-relaxed">{volume.summary}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-mono text-neutral-400">
            <span>{volume.chapters.length} {volume.chapters.length === 1 ? 'Chapter' : 'Chapters'}</span>
            <span>● Era: {volume.dateRange.start}–{volume.dateRange.end || 'Present'}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          {volume.chapters.map((ch) => {
            const badge = reviewBadge(ch.status);
            return (
              <span key={ch.id} className={`text-xs px-2.5 py-0.5 rounded-full font-mono ${badge.color}`}>
                {badge.label}
              </span>
            );
          })}
          <div className="text-right mt-2">
            <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Evidence Coverage</div>
            <div className="w-24 h-1.5 bg-neutral-950 rounded-full mt-1 overflow-hidden border border-neutral-800">
              <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${String(coverageRatio)}%` }} />
            </div>
            <div className="text-[10px] font-mono text-emerald-400 mt-0.5 font-bold">{coverageRatio}%</div>

          </div>
        </div>
      </div>
    </Link>
  );
}

export function KnowledgeLibraryIndex({ libraries }: { libraries: KnowledgeLibrary[] }) {
  return (
    <main className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-emerald-500/30 pb-24">
      {/* Top Orientation Rail */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <SpatialNarrativeBreadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Knowledge Library Index', href: '/series', current: true },
          ]}
          theme="dark"
        />
      </div>

      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-neutral-800 pb-8">
          <div className="max-w-3xl space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="category">Knowledge Library Index</Badge>
              <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
                Canonical Collections Registry
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Knowledge Library
            </h1>
            <p className="text-lg text-neutral-300 leading-relaxed">
              Evidence-first canonical collections, volumes, and monographs on public policy, history, and governance.
            </p>
          </div>

          <div className="flex gap-4 text-xs font-mono text-neutral-400 shrink-0 pt-2">
            <Link href="/methodology" className="hover:text-emerald-400 transition-colors underline">Methodology</Link>
            <Link href="/editorial-constitution" className="hover:text-emerald-400 transition-colors underline">Constitution</Link>
          </div>
        </div>

        {/* Libraries List */}
        {libraries.map((lib) => (
          <div key={lib.id} className="mt-12 space-y-8">
            <div className="border-b border-neutral-800/80 pb-4">
              <h2 className="text-2xl font-bold text-white tracking-tight">{lib.title}</h2>
              {lib.subtitle && <p className="text-sm font-medium text-emerald-400/90 mt-1">{lib.subtitle}</p>}
              <p className="text-sm text-neutral-300 mt-2 leading-relaxed max-w-3xl">{lib.summary}</p>
            </div>

            {lib.collections.map((col) => {
              const trust = collectionTrustScore(col);
              const chapters = col.volumes.flatMap(v => v.chapters);
              const totalClaims = chapters.reduce((s, ch) => s + ch.content.filter(b => b.type === 'claim').length, 0);
              const totalSources = chapters.flatMap(ch => ch.content.filter((b: { type?: string }) => b.type === 'document')).length;


              return (
                <div key={col.id} className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-neutral-900/80 border border-neutral-800">
                    <div>
                      <Link href={`/series/${col.slug}`} className="text-xl font-bold text-white hover:text-emerald-400 transition-colors">
                        {col.title}
                      </Link>
                      <p className="text-xs font-mono text-neutral-400 mt-0.5">{col.subtitle} · Era: {col.dateRange.start}–{col.dateRange.end || 'Present'}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-mono">
                      <span className="text-neutral-400">{totalClaims} Claims</span>
                      <span className="text-neutral-400">{totalSources} Documents</span>
                      <span className={`px-3 py-1 rounded-full font-bold ${
                        trust.grade === 'A' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        trust.grade === 'B' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                        'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        Trust {trust.score}/100 ({trust.grade})
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    {col.volumes.map((v) => (
                      <VolumeCard key={v.id} volume={v} collectionSlug={col.slug} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </main>
  );
}

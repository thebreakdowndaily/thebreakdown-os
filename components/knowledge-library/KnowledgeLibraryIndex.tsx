import Link from 'next/link';
import type { KnowledgeLibrary, KnowledgeCollection, Volume, Chapter } from '@/types/canonical';

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

function freshnessLabel(chapter: Chapter): { label: string; color: string } {
  const daysSinceVerified = (Date.now() - new Date(chapter.lastVerifiedAt || chapter.updatedAt).getTime()) / 86400000;
  if (daysSinceVerified <= 90) return { label: 'Current', color: 'text-emerald-600 bg-emerald-50' };
  if (daysSinceVerified <= 365) return { label: 'Recent', color: 'text-amber-600 bg-amber-50' };
  return { label: 'Stale', color: 'text-red-600 bg-red-50' };
}

function reviewBadge(status: string) {
  switch (status) {
    case 'verified': return { label: 'Gold Standard', color: 'text-emerald-700 bg-emerald-100' };
    case 'review': return { label: 'Internal Review', color: 'text-amber-700 bg-amber-100' };
    default: return { label: 'Draft', color: 'text-gray-500 bg-gray-100' };
  }
}

function VolumeCard({ volume, collectionSlug }: { volume: Volume; collectionSlug: string }) {
  const totalClaims = volume.chapters.reduce((s, ch) => s + ch.content.filter(b => b.type === 'claim').length, 0);
  const totalEvidence = volume.chapters.reduce((s, ch) => s + ch.content.filter(b => b.type === 'evidence-summary').length, 0);
  const coverageRatio = totalClaims > 0 ? Math.round((totalEvidence / totalClaims) * 100) : 0;
  const allCurrent = volume.chapters.every(ch => new Date(ch.lastVerifiedAt || ch.updatedAt) > new Date(Date.now() - 90 * 86400000));
  const freshnessColor = allCurrent ? 'text-emerald-600' : 'text-amber-600';

  return (
    <Link
      href={`/series/${collectionSlug}/volume/${volume.slug}`}
      className="block border rounded-lg p-6 hover:border-blue-500 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold mb-1">{volume.title}</h3>
          {volume.subtitle && <p className="text-sm text-gray-500 mb-2">{volume.subtitle}</p>}
          <p className="text-gray-700 text-sm mb-3">{volume.summary}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
            <span>{volume.chapters.length} {volume.chapters.length === 1 ? 'chapter' : 'chapters'}</span>
            <span className={freshnessColor}>● Last verified: {new Date(volume.chapters[0]?.lastVerifiedAt || volume.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' })}</span>
            <span>{volume.dateRange.start}–{volume.dateRange.end || 'Present'}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          {volume.chapters.map((ch) => {
            const badge = reviewBadge(ch.status);
            return (
              <span key={ch.id} className={`text-xs px-2 py-0.5 rounded-full ${badge.color}`}>
                {badge.label}
              </span>
            );
          })}
          <div className="text-right mt-1">
            <div className="text-xs text-gray-400">Evidence coverage</div>
            <div className="w-20 h-1.5 bg-gray-200 rounded-full mt-0.5">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${coverageRatio}%` }} />
            </div>
            <div className="text-xs text-gray-400 mt-0.5">{coverageRatio}%</div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function KnowledgeLibraryIndex({ libraries }: { libraries: KnowledgeLibrary[] }) {
  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Knowledge Library</h1>
          <p className="text-lg text-gray-600">Evidence-based collections on the topics that matter.</p>
        </div>
        <div className="flex gap-3 text-xs">
          <a href="/methodology" className="text-blue-600 hover:underline">Methodology</a>
          <a href="/editorial-constitution" className="text-blue-600 hover:underline">Editorial Constitution</a>
        </div>
      </div>

      {libraries.map((lib) => (
        <div key={lib.id} className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div>
              <h2 className="text-2xl font-bold">{lib.title}</h2>
              {lib.subtitle && <p className="text-gray-500 text-sm">{lib.subtitle}</p>}
            </div>
          </div>
          <p className="text-gray-700 mb-6">{lib.summary}</p>

          {lib.collections.map((col) => {
            const trust = collectionTrustScore(col);
            const chapters = col.volumes.flatMap(v => v.chapters);
            const totalClaims = chapters.reduce((s, ch) => s + ch.content.filter(b => b.type === 'claim').length, 0);
            const totalSources = chapters.flatMap(ch => ch.content.filter((b: any) => b.type === 'document')).length;

            return (
              <div key={col.id} className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Link href={`/series/${lib.slug}`} className="text-xl font-semibold hover:text-blue-600">
                      {col.title}
                    </Link>
                    <p className="text-sm text-gray-500">{col.subtitle} · {col.dateRange.start}–{col.dateRange.end || 'Present'}</p>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-gray-400">{totalClaims} claims</span>
                    <span className="text-gray-400">{totalSources} documents</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      trust.grade === 'A' ? 'bg-emerald-100 text-emerald-700' :
                      trust.grade === 'B' ? 'bg-blue-100 text-blue-700' :
                      'bg-amber-100 text-amber-700'
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
    </main>
  );
}

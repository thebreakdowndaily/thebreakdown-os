import Link from 'next/link';
import type { Volume } from '@/types/canonical';

function freshnessLabel(lastVerified: string): { label: string; color: string } {
  const daysSinceVerified = (Date.now() - new Date(lastVerified).getTime()) / 86400000;
  if (daysSinceVerified <= 90) return { label: 'Current', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
  if (daysSinceVerified <= 365) return { label: 'Recent', color: 'text-amber-600 bg-amber-50 border-amber-200' };
  return { label: 'Stale', color: 'text-red-600 bg-red-50 border-red-200' };
}

export function VolumePage({ volume, collectionSlug, collectionTitle }: { volume: Volume; collectionSlug: string; collectionTitle?: string }) {
  const totalClaims = volume.chapters.reduce((s, ch) => s + ch.content.filter(b => b.type === 'claim').length, 0);
  const totalEvidence = volume.chapters.reduce((s, ch) => s + ch.content.filter(b => b.type === 'evidence-summary').length, 0);
  const latestVerified = volume.chapters.length > 0
    ? volume.chapters.reduce((latest, ch) => {
        const d = new Date(ch.lastVerifiedAt || ch.updatedAt).getTime();
        return d > latest ? d : latest;
      }, 0)
    : Date.now();
  const freshness = freshnessLabel(new Date(latestVerified).toISOString());

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <Link href={`/series/${collectionSlug}`} className="text-sm text-blue-600 hover:underline mb-4 inline-block">← Back to {collectionTitle || collectionSlug}</Link>

      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">{volume.title}</h1>
          {volume.subtitle && <p className="text-lg text-gray-500 mb-2">{volume.subtitle}</p>}
          <p className="text-gray-700">{volume.summary}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full border ${freshness.color} shrink-0`}>
          {freshness.label}
        </span>
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-400 mb-8">
        <span>{volume.chapters.length} {volume.chapters.length === 1 ? 'chapter' : 'chapters'}</span>
        <span>{totalClaims} claims</span>
        <span>{totalEvidence} evidence blocks</span>
        <span>{volume.dateRange.start}–{volume.dateRange.end || 'Present'}</span>
        <span>Last verified: {new Date(latestVerified).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
      </div>

      <div className="space-y-3">
        {volume.chapters.map((ch, i) => {
          const chClaims = ch.content.filter(b => b.type === 'claim').length;
          const chEvidence = ch.content.filter(b => b.type === 'evidence-summary').length;
          const statusBadge = ch.status === 'verified'
            ? 'text-emerald-700 bg-emerald-100'
            : ch.status === 'review'
            ? 'text-amber-700 bg-amber-100'
            : 'text-gray-500 bg-gray-100';

          return (
            <Link
              key={ch.id}
              href={`/series/${collectionSlug}/volume/${volume.slug}/chapter/${ch.slug}`}
              className="flex items-start gap-4 p-4 border rounded-lg hover:border-blue-500 transition-colors"
            >
              <span className="text-gray-300 font-mono text-lg min-w-[2rem]">{i + 1}.</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-medium text-lg">{ch.title}</h2>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${statusBadge}`}>
                    {ch.status === 'verified' ? 'Verified' : ch.status === 'review' ? 'In Review' : 'Draft'}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{ch.summary}</p>
                <div className="flex gap-3 mt-2 text-xs text-gray-400">
                  <span>Reading: {ch.readingTime.explorer}–{ch.readingTime.scholar} min</span>
                  <span>Difficulty: {'★'.repeat(ch.difficulty)}{'☆'.repeat(5 - ch.difficulty)}</span>
                  <span>{chClaims} claims</span>
                  <span>{chEvidence} evidence</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="flex justify-center gap-4 mt-10 pt-6 border-t text-xs text-gray-400">
        <a href="/methodology" className="text-blue-600 hover:underline">Methodology</a>
        <a href="/editorial-constitution" className="text-blue-600 hover:underline">Editorial Constitution</a>
        <a href="/trust" className="text-blue-600 hover:underline">Trust Dashboard</a>
      </div>
    </main>
  );
}

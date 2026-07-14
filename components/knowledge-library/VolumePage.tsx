import Link from 'next/link';
import type { Volume } from '@/types/canonical';

export function VolumePage({ volume, collectionSlug }: { volume: Volume; collectionSlug: string }) {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <Link href={`/series/${collectionSlug}`} className="text-sm text-blue-600 hover:underline mb-4 inline-block">← Back to {collectionSlug}</Link>
      <h1 className="text-3xl font-bold mb-1">{volume.title}</h1>
      {volume.subtitle && <p className="text-lg text-gray-500 mb-2">{volume.subtitle}</p>}
      <p className="text-gray-700 mb-6">{volume.summary}</p>
      <p className="text-sm text-gray-400 mb-8">
        {volume.chapters.length} chapters · {volume.dateRange.start}–{volume.dateRange.end || 'Present'}
      </p>

      <div className="space-y-3">
        {volume.chapters.map((ch, i) => (
          <Link
            key={ch.id}
            href={`/series/${collectionSlug}/volume/${volume.slug}/chapter/${ch.slug}`}
            className="flex items-start gap-4 p-4 border rounded-lg hover:border-blue-500 transition-colors"
          >
            <span className="text-gray-300 font-mono text-lg min-w-[2rem]">{i + 1}.</span>
            <div>
              <h2 className="font-medium text-lg">{ch.title}</h2>
              <p className="text-sm text-gray-600">{ch.summary}</p>
              <div className="flex gap-3 mt-2 text-xs text-gray-400">
                <span>Reading: {ch.readingTime.explorer}–{ch.readingTime.scholar} min</span>
                <span>Difficulty: {'★'.repeat(ch.difficulty)}{'☆'.repeat(5 - ch.difficulty)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}

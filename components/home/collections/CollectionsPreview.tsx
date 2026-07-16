import Link from 'next/link';
import type { KnowledgeLibrary } from '@/types/canonical';

interface CollectionsPreviewProps {
  libraries: KnowledgeLibrary[];
}

export function CollectionsPreview({ libraries }: CollectionsPreviewProps) {
  return (
    <section aria-label="Continue learning through the library">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">Next: Explore the full library</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Continue Your Learning</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            After Volume I, continue your journey through more evidence-based collections.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {libraries.map((lib) =>
            lib.collections.map((col) => (
              <Link
                key={col.id}
                href={`/series/${lib.slug}`}
                className="block border rounded-lg p-5 hover:border-blue-400 hover:shadow-sm transition-all group"
              >
                <h3 className="text-base font-semibold mb-1 text-gray-900 group-hover:text-blue-600 transition-colors">{col.title}</h3>
                <p className="text-xs text-gray-500 mb-2">{col.subtitle}</p>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{col.summary}</p>
                <div className="flex gap-3 text-xs text-gray-400">
                  <span>{col.volumes.length} {col.volumes.length === 1 ? 'volume' : 'volumes'}</span>
                  <span>{col.volumes.reduce((a, v) => a + v.chapters.length, 0)} chapters</span>
                  <span>{col.dateRange.start}–{col.dateRange.end || 'Present'}</span>
                </div>
              </Link>
            ))
          )}
        </div>
        <div className="mt-8 text-center">
          <Link href="/series" className="text-blue-600 hover:underline text-sm font-medium">
            Browse the complete library &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}

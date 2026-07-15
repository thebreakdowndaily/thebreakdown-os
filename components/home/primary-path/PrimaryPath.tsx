import Link from 'next/link';

export function PrimaryPath() {
  return (
    <section className="bg-gradient-to-r from-blue-50 to-indigo-50 py-10" aria-label="Start learning">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Start with Volume I
        </h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Foundations (1947–1962) — India&apos;s first fifteen years as an independent nation.
          Begin with the Partition and its legacies, then trace the making of Indian foreign policy
          from non-alignment to the war with China.
        </p>
        <Link
          href="/series/foundations-1947-1962/volume/the-nehruvian-era"
          className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Begin Volume I →
        </Link>
      </div>
    </section>
  );
}

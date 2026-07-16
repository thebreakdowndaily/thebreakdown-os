import Link from 'next/link';

export function PrimaryPath() {
  return (
    <section className="bg-neutral-950 border-t border-neutral-900 py-16" aria-label="Start learning">
      <div className="max-w-6xl mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block text-[10px] uppercase tracking-[0.25em] text-emerald-400 font-medium mb-4">
            The Canonical Learning Path
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
            Start Here: India and the World
          </h2>
          <p className="text-lg text-neutral-400 mt-3">
            Volume I: Foundations (1947–1962)
          </p>
          <p className="text-neutral-500 mt-4 max-w-xl mx-auto leading-relaxed">
            The definitive introduction to India&apos;s first fifteen years as an independent nation&mdash;from Partition and its legacies through non-alignment and the war with China.
          </p>
          <div className="mt-8">
            <Link
              href="/series/foundations-1947-1962/volume/the-nehruvian-era"
              className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-lg rounded-lg transition-colors shadow-lg shadow-emerald-900/30"
            >
              Begin Volume I
              <span aria-hidden="true" className="text-xl leading-none">&rarr;</span>
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-10 border-t border-neutral-800 max-w-4xl mx-auto">
          <p className="text-center text-xs uppercase tracking-widest text-neutral-600 mb-6">What you will learn</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
              <h3 className="text-emerald-400 text-sm font-semibold mb-2">Historical Foundations</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">How the Partition of India shaped its strategic inheritance and national identity.</p>
            </div>
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
              <h3 className="text-emerald-400 text-sm font-semibold mb-2">Foreign Policy Origins</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">The making of non-alignment, Panchsheel, and India&apos;s role at the United Nations.</p>
            </div>
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
              <h3 className="text-emerald-400 text-sm font-semibold mb-2">Critical Turning Points</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">Tibet, the border dispute, and the 1962 war that redefined India&apos;s strategic outlook.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

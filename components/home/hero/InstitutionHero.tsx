import Link from 'next/link';

interface InstitutionHeroProps {
  chaptersPublished: number;
  claimsRegistered: number;
  primarySources: number;
  lastVerified: string;
}

export default function InstitutionHero({
  chaptersPublished,
  claimsRegistered,
  primarySources,
  lastVerified,
}: InstitutionHeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/20 via-transparent to-transparent pointer-events-none" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-36">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-950/30 text-emerald-400 text-xs font-mono tracking-widest uppercase mb-8">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
            Evidence-first Knowledge Platform
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.05]">
            The Breakdown
          </h1>

          <p className="text-xl sm:text-2xl lg:text-3xl text-emerald-400 font-medium mt-4 leading-snug">
            Evidence Before Conclusions. Context Before Certainty.
          </p>

          <p className="text-base sm:text-lg text-neutral-400 max-w-2xl mt-8 leading-relaxed">
            The Breakdown is a living evidence-first knowledge platform. Every
            chapter is built from verified claims, primary sources, maps,
            timelines, documents, and competing interpretations — not news,
            not opinion, not AI-generated content.
          </p>
          <p className="text-base sm:text-lg text-neutral-400 max-w-2xl mt-4 leading-relaxed">
            You can understand a complex subject from the evidence up: what
            happened, what the evidence shows, where scholars disagree, and
            why it matters. Each chapter includes guided learning paths, a
            glossary, and links to what to read next.
          </p>

          <div className="flex flex-wrap gap-8 mt-10">
            <div>
              <p className="text-2xl font-bold text-white">{chaptersPublished}</p>
              <p className="text-xs text-neutral-500 font-mono tracking-wider uppercase mt-1">Reviewed Chapters</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{claimsRegistered.toLocaleString('en-IN')}</p>
              <p className="text-xs text-neutral-500 font-mono tracking-wider uppercase mt-1">Evidence-backed Claims</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{primarySources}</p>
              <p className="text-xs text-neutral-500 font-mono tracking-wider uppercase mt-1">Primary Sources</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{lastVerified}</p>
              <p className="text-xs text-neutral-500 font-mono tracking-wider uppercase mt-1">Last Editorial Review</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-12">
            <Link
              href="/series/foundations-1947-1962/volume/the-nehruvian-era"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black px-8 py-3.5 rounded-lg font-bold transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              Begin with Volume I
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
            <Link
              href="/methodology"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg text-neutral-300 border border-neutral-800 hover:border-emerald-500/30 hover:text-white font-medium transition-all"
            >
              How We Work
            </Link>
          </div>

          <div className="mt-10 pt-8 border-t border-neutral-800">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-neutral-500">
              <Link href="/methodology" className="hover:text-emerald-400 transition-colors">Methodology</Link>
              <Link href="/editorial-constitution" className="hover:text-emerald-400 transition-colors">Editorial Constitution</Link>
              <Link href="/methodology#corrections" className="hover:text-emerald-400 transition-colors">Corrections Policy</Link>
              <Link href="/trust" className="hover:text-emerald-400 transition-colors">Trust Dashboard</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

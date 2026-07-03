import Link from 'next/link';

interface HeroActionsProps {
  storySlug: string;
}

export default function HeroActions({ storySlug }: HeroActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Link
        href={`/story/${storySlug}`}
        className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-black font-semibold rounded-lg hover:bg-amber-400 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 text-sm"
      >
        Read Breakdown
        <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </Link>
      <Link
        href={`/story/${storySlug}#data`}
        className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-gray-300 border border-gray-700 rounded-lg hover:border-amber-500/40 hover:text-white transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
      >
        Explore Data
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </Link>
    </div>
  );
}

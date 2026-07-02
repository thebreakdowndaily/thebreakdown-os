import type { APIFix } from '@/utils/data-layer/types';
import { __TEST__ } from '@/utils/data-layer/types';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getFixes } from '@/utils/data-layer/store';

export const metadata: Metadata = {
  title: 'The Fix — Solutions That Work — The Breakdown',
  description: 'Evidence-based solutions and policy frameworks that address India\'s biggest challenges.',
};

export default function FixLandingPage() {
  const fixes = getFixes({ pageSize: 50 });

  console.log(__TEST__);
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="bg-emerald-900/60 text-emerald-300 text-sm font-semibold px-3 py-1 rounded-full border border-emerald-700">
              The Fix
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-100 mb-3">
            Not just what&apos;s wrong.<br />
            <span className="text-amber-400">What would fix it.</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl">
            Every story on The Breakdown comes with an actionable fix framework — 
            evidence-based solutions, global examples, and clear steps for citizens and governments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fixes.data.map((fix: APIFix) => (
            <Link key={fix.slug} href={`/fix/${fix.slug}`} className="group block bg-gray-800/50 border border-gray-700/50 rounded-lg p-5 hover:border-amber-700/50 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs bg-emerald-900/40 text-emerald-300 px-2 py-0.5 rounded-full">Score: {fix.evidenceScore}</span>
                <span className="text-xs text-gray-500">{fix.readingTime} min read</span>
              </div>
              <h3 className="font-semibold text-gray-200 group-hover:text-amber-300 transition-colors mb-2 leading-snug">
                {fix.headline}
              </h3>
              <p className="text-sm text-gray-400 line-clamp-2">{fix.summary}</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
             {fix.tags.slice(0, 3).map((tag: string, index: number) => {
                return (
                  <span
                   key={index}
                       className="text-xs bg-gray-800 text-gray-500 px-2 py-0.5 rounded border border-gray-700"
      >
        {tag}
      </span>
    );
  })}
</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

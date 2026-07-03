import Link from 'next/link';
import type { APIFix } from '@/utils/data-layer/types';
import FixCard from './FixCard';

interface TheFixSectionProps {
  fixes: APIFix[];
}

export default function TheFixSection({ fixes }: TheFixSectionProps) {
  if (fixes.length === 0) return null;

  return (
    <section className="w-full bg-[#0A0A0A] border-t border-gray-800/60">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        {/* Header */}
        <div className="flex items-start gap-4 mb-10">
          <div className="w-1 h-10 bg-green-500 rounded-full shrink-0" />
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">The Fix</h2>
            <p className="mt-1 text-sm text-gray-400">Not just what&apos;s wrong. What would fix it.</p>
          </div>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {fixes.slice(0, 3).map((fix) => (
            <FixCard key={fix.id} fix={fix} />
          ))}
        </div>

        {/* View all CTA */}
        <div className="mt-10 text-center">
          <Link
            href="/fix"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/5 hover:text-green-300 transition-all duration-200"
          >
            View All Fix Frameworks
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

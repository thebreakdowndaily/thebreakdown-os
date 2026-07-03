import Link from 'next/link';
import type { APIFix } from '@/utils/data-layer/types';
import EvidenceBadge from './EvidenceBadge';
import ProblemBlock from './ProblemBlock';
import SolutionBlock from './SolutionBlock';

interface FixCardProps {
  fix: APIFix;
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, text.lastIndexOf(' ', max)) + '...';
}

export default function FixCard({ fix }: FixCardProps) {
const firstExample = fix.globalExamples[0]!;
const topRecommendation = fix.recommendedActions[0]!;

  return (
    <article className="group relative flex flex-col rounded-xl bg-[#151515] border border-gray-800 hover:border-green-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/5 hover:-translate-y-0.5">
      <div className="p-5 sm:p-6 flex flex-col gap-4 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base sm:text-lg font-bold text-white leading-snug group-hover:text-green-400 transition-colors duration-200">
            {fix.headline}
          </h3>
          <EvidenceBadge score={fix.evidenceScore} />
        </div>

        <p className="text-sm text-gray-400 line-clamp-2">{fix.summary}</p>

        {/* Problem + Root Cause */}
        <ProblemBlock
          problem={truncate(fix.problem.title, 120)}
          rootCause={truncate(fix.rootCauses.title, 120)}
        />

        {/* Global Example + Recommendation */}
        <SolutionBlock
          globalExample={{ country: firstExample.country, outcome: truncate(firstExample.outcome, 100) }}
          recommendation={{ title: topRecommendation.title, description: truncate(topRecommendation.description, 100) }}
        />
      </div>

      {/* CTA */}
      <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0">
        <Link
          href={`/fix/${fix.slug}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-green-400 hover:text-green-300 transition-colors"
        >
          Read Complete Framework
          <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </article>
  );
}

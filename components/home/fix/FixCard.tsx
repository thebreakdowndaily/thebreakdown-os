import Link from 'next/link';
import type { APIFix } from '@/utils/data-layer/types';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
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
    <Card className="flex flex-col" accent="green">
      <div className="p-5 sm:p-6 flex flex-col gap-4 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base sm:text-lg font-bold text-[#F5F5F5] leading-snug group-hover:text-[#22C55E] transition-colors duration-200">
            {fix.headline}
          </h3>
          <Badge variant="evidence">Evidence {fix.evidenceScore}</Badge>
        </div>

        <p className="text-sm text-[#A1A1AA] line-clamp-2">{fix.summary}</p>

        <ProblemBlock
          problem={truncate(fix.problem.title, 120)}
          rootCause={truncate(fix.rootCauses.title, 120)}
        />

        <SolutionBlock
          globalExample={{ country: firstExample.country, outcome: truncate(firstExample.outcome, 100) }}
          recommendation={{ title: topRecommendation.title, description: truncate(topRecommendation.description, 100) }}
        />
      </div>

      <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0">
        <Link
          href={`/fix/${fix.slug}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#22C55E] hover:text-[#22C55E]/80 transition-colors"
        >
          Read Complete Framework
          <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </Card>
  );
}

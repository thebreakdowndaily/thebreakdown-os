/**
 * Follow The Money / Data Module — Release 1
 * Governance: docs/rxs/screens/homepage.md & Editorial Constitution v1.1
 *
 * Signature financial & data intelligence module. Strictly preserves semantic distinctions
 * between FINANCIAL_SANCTION, BUDGET_PROVISION, REPORTED_EXPENDITURE, REVISED_COST, and ESTIMATED_COST.
 * NEVER infers fake "cost overruns" or "savings" across non-comparable figures.
 */

import Link from 'next/link';
import type { FinancialFeatureData } from '@/lib/story/financial-eligibility';

interface FollowTheMoneyModuleProps {
  financialData: FinancialFeatureData | null;
}

export default function FollowTheMoneyModule({ financialData }: FollowTheMoneyModuleProps) {
  if (!financialData || financialData.metrics.length === 0) return null;

  return (
    <section
      aria-labelledby="follow-money-heading"
      className="py-16 bg-neutral-900 border-b border-neutral-800 text-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 mb-8 border-b border-neutral-800 gap-2">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold block mb-1">
              FOLLOW THE MONEY / DATA
            </span>
            <h2 id="follow-money-heading" className="text-2xl sm:text-3xl font-serif text-white">
              Public Expenditure & Fiscal Intelligence
            </h2>
          </div>
          <span className="text-xs font-mono text-neutral-400">
            Verified official figures
          </span>
        </div>

        <div className="bg-neutral-950 rounded-2xl border border-neutral-800 p-6 sm:p-8 space-y-6">
          <div className="max-w-3xl space-y-2">
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">
              {financialData.category}
            </span>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-white leading-snug">
              <Link
                href={`/story/${financialData.storySlug}`}
                className="hover:text-emerald-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded"
              >
                {financialData.headline}
              </Link>
            </h3>
            <p className="text-sm text-neutral-300 leading-relaxed">
              {financialData.summary}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            {financialData.metrics.map((metric, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg bg-neutral-900 border border-neutral-800/80 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-semibold">
                    {metric.semanticType}
                  </span>
                </div>
                <p className="text-2xl sm:text-3xl font-bold font-mono text-white">
                  {metric.value}
                </p>
                <p className="text-xs text-neutral-400 line-clamp-1">
                  {metric.label}
                </p>
                {metric.source && (
                  <p className="text-[10px] font-mono text-neutral-500 line-clamp-1">
                    Source: {metric.source}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-neutral-800 text-xs text-neutral-400 gap-4">
            <p className="font-mono text-[11px]">
              ℹ {financialData.note}
            </p>
            <Link
              href={`/story/${financialData.storySlug}`}
              className="font-bold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1.5 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded"
            >
              See full financial evidence →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

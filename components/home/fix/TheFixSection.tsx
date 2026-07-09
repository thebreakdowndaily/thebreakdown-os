'use client';

import Link from 'next/link';
import type { APIFix } from '@/utils/data-layer/types';
import Container from '@/components/ui/Container';
import SectionHeader from '@/components/ui/SectionHeader';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';

interface TheFixSectionProps {
  fixes: APIFix[];
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, text.lastIndexOf(' ', max)) + '...';
}

export default function TheFixSection({ fixes }: TheFixSectionProps) {
  if (fixes.length === 0) return null;

  return (
    <section className="w-full bg-[#0A0A0A] border-t border-[#2A2A2A]/60" aria-labelledby="fix-heading">
      <Container as="div" className="py-16 sm:py-20 lg:py-24">
        <SectionHeader
          eyebrow="Solutions"
          title="The Fix"
          description="Not just what's wrong. What would fix it."
          accent="green"
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {fixes.slice(0, 3).map((fix) => (
            <FixCard key={fix.id} fix={fix} />
          ))}
        </div>

        <div className="mt-10 sm:mt-12 lg:mt-16 text-center">
          <Button href="/fix" variant="secondary" accent="green" className="inline-flex">
            View All Fix Frameworks
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Button>
        </div>
      </Container>
    </section>
  );
}

interface FixCardProps {
  fix: APIFix;
}

function FixCard({ fix }: FixCardProps) {
  const firstExample = fix.globalExamples[0];
  const topRecommendation = fix.recommendedActions[0];
  const rootCause = fix.rootCauses;

  return (
    <article className="group">
      <Link href={`/fix/${fix.slug}`} className="block h-full" aria-label={`Read fix: ${fix.headline}`}>
        <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:border-[#22C55E]/30 hover:shadow-[0_0_30px_rgba(34,197,94,0.08)]" accent="green">
          <div className="p-5 sm:p-6 flex flex-col gap-4 flex-1">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-base sm:text-lg font-bold text-[#F5F5F5] leading-snug group-hover:text-[#22C55E] transition-colors duration-200 line-clamp-2">
                {fix.headline}
              </h3>
              <Badge variant="evidence">Evidence {fix.evidenceScore}</Badge>
            </div>

            <p className="text-sm text-[#A1A1AA] line-clamp-2">{fix.summary}</p>

            <div className="space-y-3">
              <div className="p-3 bg-[#151515]/50 border border-[#2A2A2A]/50 rounded-xl">
                <h4 className="text-[10px] font-semibold uppercase tracking-widest text-[#EF4444] mb-1.5">Problem</h4>
                <p className="text-sm text-[#A1A1AA] leading-relaxed">{truncate(fix.problem.content || fix.problem.title || '', 140)}</p>
              </div>

              <div className="p-3 bg-[#151515]/50 border border-[#2A2A2A]/50 rounded-xl">
                <h4 className="text-[10px] font-semibold uppercase tracking-widest text-[#D4A843] mb-1.5">Root Cause</h4>
                <p className="text-sm text-[#A1A1AA] leading-relaxed">{truncate(rootCause.content || rootCause.title || '', 120)}</p>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-[#2A2A2A]">
              <div className="p-3 bg-[#151515]/50 border border-[#2A2A2A]/50 rounded-xl">
                <h4 className="text-[10px] font-semibold uppercase tracking-widest text-[#3B82F6] mb-1.5">Global Example</h4>
                <div className="flex items-start gap-2">
                  <span className="text-xs font-bold text-[#A1A1AA] mt-0.5 shrink-0">{firstExample?.country || '\u2014'}</span>
                  <p className="text-sm text-[#A1A1AA] leading-relaxed">{truncate(firstExample?.outcome || '', 120)}</p>
                </div>
              </div>

              <div className="p-3 bg-[#151515]/50 border border-[#2A2A2A]/50 rounded-xl">
                <h4 className="text-[10px] font-semibold uppercase tracking-widest text-[#22C55E] mb-1.5">Recommendation</h4>
                <p className="text-sm text-[#A1A1AA] leading-relaxed">
                  <span className="font-medium text-[#F5F5F5]">{topRecommendation?.title || ''}</span>
                  {' \u2014 '}
                  {truncate(topRecommendation?.description || '', 100)}
                </p>
              </div>
            </div>
          </div>

          <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0 border-t border-[#2A2A2A]">
            <Link
              href={`/fix/${fix.slug}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#22C55E] hover:text-[#22C55E]/80 transition-colors group"
            >
              Read Complete Framework
              <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </Card>
      </Link>
    </article>
  );
}

export function TheFixSectionSkeleton() {
  return (
    <section className="w-full bg-[#0A0A0A] border-t border-[#2A2A2A]/60" aria-hidden="true">
      <Container as="div" className="py-16 sm:py-20 lg:py-24">
        <div className="flex items-end justify-between gap-4 mb-10 sm:mb-12">
          <Skeleton className="h-6 w-32" variant="rect" />
          <Skeleton className="h-10 w-48" variant="rect" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="group flex flex-col">
              <div className="flex-1 space-y-4 p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <Skeleton className="h-5 w-3/4" variant="rect" />
                  <Skeleton className="h-6 w-24" variant="rect" />
                </div>
                <Skeleton className="h-4 w-full" variant="rect" />
                <Skeleton className="h-4 w-5/6" variant="rect" />
                <div className="space-y-3">
                  <div className="p-3 bg-[#151515]/50 border border-[#2A2A2A]/50 rounded-xl">
                    <Skeleton className="h-3 w-16 mb-1.5" variant="rect" />
                    <Skeleton className="h-4 w-full" variant="rect" />
                    <Skeleton className="h-4 w-5/6" variant="rect" />
                  </div>
                  <div className="p-3 bg-[#151515]/50 border border-[#2A2A2A]/50 rounded-xl">
                    <Skeleton className="h-3 w-16 mb-1.5" variant="rect" />
                    <Skeleton className="h-4 w-full" variant="rect" />
                  </div>
                </div>
                <div className="space-y-3 pt-3 border-t border-[#2A2A2A]">
                  <div className="p-3 bg-[#151515]/50 border border-[#2A2A2A]/50 rounded-xl">
                    <Skeleton className="h-3 w-20 mb-1.5" variant="rect" />
                    <div className="flex items-start gap-2">
                      <Skeleton className="h-4 w-12 shrink-0 mt-0.5" variant="rect" />
                      <Skeleton className="h-4 w-full" variant="rect" />
                    </div>
                  </div>
                  <div className="p-3 bg-[#151515]/50 border border-[#2A2A2A]/50 rounded-xl">
                    <Skeleton className="h-3 w-20 mb-1.5" variant="rect" />
                    <Skeleton className="h-4 w-full" variant="rect" />
                  </div>
                </div>
              </div>
              <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0 border-t border-[#2A2A2A]">
                <Skeleton className="h-5 w-40" variant="rect" />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 sm:mt-12 lg:mt-16 text-center">
          <Skeleton className="h-10 w-48 mx-auto" variant="rect" />
        </div>
      </Container>
    </section>
  );
}
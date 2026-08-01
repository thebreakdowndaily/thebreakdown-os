'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import RelatedStories from './RelatedStories';
import type { Story } from '@/types/canonical';
import { CANONICAL_FIXTURES } from '@/fixtures/fixes';
import { getFixesForStory, MATURITY_CONFIG, INTERVENTION_COLOR_MAP, getEvidenceLabel, getEvidenceTextColor } from '@/lib/fix-helpers';

interface NextExplorationProps {
  stories: Story[];
  storySlug?: string;
}

export default function NextExploration({ stories, storySlug }: NextExplorationProps) {
  const relatedFixes = useMemo(() => {
    if (!storySlug) return [];
    return getFixesForStory(storySlug, CANONICAL_FIXTURES);
  }, [storySlug]);

  if (stories.length === 0 && relatedFixes.length === 0) return null;

  return (
    <section aria-label="Next Exploration" className="w-full py-16 sm:py-24 bg-gradient-to-b from-[#0A0A0A] to-[#000000] border-t border-[#1F1F1F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {stories.length > 0 && (
          <>
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-[#F5F5F5] mb-4">Continue Reading</h2>
              <p className="text-[#A1A1AA] max-w-2xl mx-auto">
                Dive deeper into related investigations and data-driven analysis from The Breakdown.
              </p>
            </div>
            
            <RelatedStories
              stories={stories.map((s) => ({
                slug: s.slug,
                headline: s.headline,
                summary: s.summary,
                heroImage: s.heroImage,
                publishedAt: s.publishedAt,
                readingTime: s.readingTime,
                evidenceScore: s.evidenceScore,
                category: s.category,
              }))}
            />
          </>
        )}

        {relatedFixes.length > 0 && (
          <div className="mt-16">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-[#F5F5F5] mb-2">Proposed Solutions</h3>
              <p className="text-[#A1A1AA] max-w-2xl mx-auto">
                Evidence-backed policy reforms related to this investigation.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {relatedFixes.map(fix => (
                <Link
                  key={fix.id}
                  href={`/fix/${fix.slug}`}
                  className="group block bg-[#151515] border border-[#2A2A2A] rounded-xl p-5 hover:border-amber-500/40 transition-all"
                >
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {fix.maturityStatus && (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${
                        MATURITY_CONFIG[fix.maturityStatus]?.className || ''
                      }`}>
                        {MATURITY_CONFIG[fix.maturityStatus]?.label || fix.maturityStatus}
                      </span>
                    )}
                    {fix.primaryCategory && (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                        INTERVENTION_COLOR_MAP[fix.primaryCategory] || ''
                      }`}>
                        {fix.primaryCategory}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-semibold text-[#F5F5F5] group-hover:text-amber-400 transition-colors mb-1">
                    {fix.headline}
                  </h4>
                  {fix.problemStatement && (
                    <p className="text-xs text-[#A1A1AA] line-clamp-2 mb-2">
                      {fix.problemStatement}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-[10px] text-[#A1A1AA]">
                    <span className={`font-semibold ${getEvidenceTextColor(fix.evidenceScore)}`}>
                      {getEvidenceLabel(fix.evidenceScore)}
                    </span>
                    <span>{fix.readingTime} min read</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-16 flex flex-wrap items-center justify-center gap-4">
          <a href="/stories" className="px-6 py-3 bg-[#F5F5F5] text-[#121212] font-semibold rounded-lg hover:bg-white transition-colors">
            View All Stories
          </a>
          <a href="/fix" className="px-6 py-3 bg-[#151515] border border-[#2A2A2A] text-[#F5F5F5] font-semibold rounded-lg hover:bg-[#1F1F1F] transition-colors">
            The Fix Hub
          </a>
          <a href="/topics" className="px-6 py-3 bg-[#151515] border border-[#2A2A2A] text-[#F5F5F5] font-semibold rounded-lg hover:bg-[#1F1F1F] transition-colors">
            Explore Topics
          </a>
        </div>
      </div>
    </section>
  );
}

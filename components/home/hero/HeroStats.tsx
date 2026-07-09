'use client';

import type { ReactNode } from 'react';
import Badge from '@/components/ui/Badge';

interface HeroStatsProps {
  evidenceScore: number;
  sourcesCount: number;
  keyPointsCount: number;
  readingTime: number;
}

const statItems = [
  { label: 'Evidence Score', value: (props: HeroStatsProps) => `${props.evidenceScore}%`, icon: 'shield' },
  { label: 'Sources Cited', value: (props: HeroStatsProps) => props.sourcesCount.toString(), icon: 'file' },
  { label: 'Key Findings', value: (props: HeroStatsProps) => props.keyPointsCount.toString(), icon: 'target' },
  { label: 'Read Time', value: (props: HeroStatsProps) => `${props.readingTime} min`, icon: 'clock' },
];

const icons: Record<string, ReactNode> = {
  shield: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  file: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  target: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
    </svg>
  ),
  clock: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

export default function HeroStats({ evidenceScore, sourcesCount, keyPointsCount, readingTime }: HeroStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6" role="list" aria-label="Story statistics">
      {statItems.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-3 p-4 bg-[#151515]/50 border border-[#2A2A2A]/50 rounded-xl transition-all duration-200 hover:border-[#D4A843]/30 hover:bg-[#D4A843]/[0.02]"
          role="listitem"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#D4A843]/10 text-[#D4A843]">
            {icons[item.icon]}
          </div>
          <div>
            <p className="text-xs font-medium text-[#A1A1AA] tracking-wide uppercase">{item.label}</p>
            <p className="text-lg font-bold text-[#F5F5F5]">{item.value({ evidenceScore, sourcesCount, keyPointsCount, readingTime })}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
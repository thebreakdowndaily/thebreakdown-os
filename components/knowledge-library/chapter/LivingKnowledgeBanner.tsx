import type { FC } from 'react';
import Link from 'next/link';

interface LivingKnowledgeBannerProps {
  version: string;
}

export const LivingKnowledgeBanner: FC<LivingKnowledgeBannerProps> = ({ version }) => {
  return (
    <div className="border border-amber-200 bg-amber-50 rounded-lg px-5 py-3 mt-6 mb-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-800">Living Knowledge</p>
          <p className="text-sm text-amber-700 mt-0.5">
            Knowledge evolves. This publication is versioned (v{version}). Every correction is public. Every major change is logged.
          </p>
        </div>
        <div className="flex gap-3 text-xs shrink-0">
          <a href="/founding-edition" className="text-amber-700 underline hover:text-amber-900">Founding Edition</a>
          <a href="/methodology" className="text-amber-700 underline hover:text-amber-900">Methodology</a>
          <a href="/trust" className="text-amber-700 underline hover:text-amber-900">Trust</a>
        </div>
      </div>
      <div className="mt-2 pt-2 border-t border-amber-200 flex flex-wrap gap-x-4 gap-y-1 text-xs text-amber-600">
        <span>Evidence before conclusions.</span>
        <span>Context before certainty.</span>
        <a href="/methodology#corrections" className="underline hover:text-amber-900">Corrections policy</a>
        <a href="/about/contact" className="underline hover:text-amber-900">Report an issue</a>
      </div>
    </div>
  );
};
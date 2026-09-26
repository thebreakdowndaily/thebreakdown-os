'use client';

import React from 'react';
import type { PublishedCorrection } from '@/types/corrections';

interface CorrectionNoticeBannerProps {
  corrections: PublishedCorrection[];
}

export default function CorrectionNoticeBanner({ corrections }: CorrectionNoticeBannerProps) {
  if (!corrections || corrections.length === 0) return null;

  return (
    <aside
      className="my-6 p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 text-text-primary"
      role="region"
      aria-label="Editorial Correction Notice"
    >
      <div className="flex items-start gap-3">
        <div className="p-1 rounded-md bg-amber-500/10 text-amber-500 mt-0.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
              Editorial Correction
            </span>
            <span className="text-[11px] text-text-muted">
              {new Date(corrections[0].createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>

          {corrections.map((corr) => (
            <div key={corr.id} className="text-xs space-y-1">
              <p className="text-text-primary font-medium leading-relaxed">
                {corr.explanation}
              </p>
              {corr.previousWording && (
                <div className="text-[11px] text-text-muted border-l-2 border-amber-500/40 pl-2 mt-1">
                  <span className="line-through">{corr.previousWording}</span> &rarr;{' '}
                  <span className="text-text-primary font-medium">{corr.correctedWording}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

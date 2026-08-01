'use client';

import React from 'react';
import Link from 'next/link';
import Badge from '../ui/Badge';
import Tag from '../ui/Tag';
import type { Fix } from '../../types/canonical';
import { MATURITY_CONFIG, INTERVENTION_COLOR_MAP, HORIZON_LABELS, getEvidenceLabel, getEvidenceTextColor, getEvidenceBarColor } from '../../lib/fix-helpers';

interface FixHubCardProps {
  fix: Fix;
  index?: number;
  onTagClick?: (tag: string) => void;
}

function EvidenceConfidence({ score }: { score: number }) {
  const level = getEvidenceLabel(score);
  const color = getEvidenceTextColor(score);
  const barColor = getEvidenceBarColor(score);
  return (
    <div className="flex items-center gap-1.5" aria-label={`Evidence confidence: ${level} (${score}/100)`}>
      <div className="w-12 h-1 bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-[10px] font-semibold ${color}`}>{level}</span>
    </div>
  );
}

function MaturityBadge({ status }: { status?: string }) {
  const c = MATURITY_CONFIG[status || 'proposed'] || MATURITY_CONFIG.proposed;
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${c.className}`}>{c.label}</span>;
}

function InterventionsBadges({ primary, secondary }: { primary?: string; secondary?: string[] }) {
  if (!primary) return null;
  return (
    <div className="flex flex-wrap gap-1">
      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${INTERVENTION_COLOR_MAP[primary] || INTERVENTION_COLOR_MAP.administrative}`}>{primary}</span>
      {(secondary || []).slice(0, 2).map(s => (
        <span key={s} className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${INTERVENTION_COLOR_MAP[s] || INTERVENTION_COLOR_MAP.administrative}`}>{s}</span>
      ))}
    </div>
  );
}

function TimeToImpact({ horizon }: { horizon?: string }) {
  if (!horizon) return null;
  return (
    <div className="flex items-center gap-1 text-[10px] text-gray-500">
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      <span>{HORIZON_LABELS[horizon] || horizon}</span>
    </div>
  );
}

export default function FixHubCard({ fix, index = 0, onTagClick }: FixHubCardProps) {
  const precedentCount = (fix.globalPrecedents || []).length;
  const relatedStory = fix.relatedStories?.[0];
  const hasStory = !!relatedStory;

  return (
    <Link
      href={`/fix/${fix.slug}`}
      className="group block relative focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-400)]"
    >
      <article
        className="relative bg-[var(--color-surface-primary)] border border-[var(--color-border)] rounded-xl p-5 sm:p-6 transition-all duration-200 hover:border-[var(--color-brand-400)]/40 hover:shadow-lg hover:shadow-[var(--color-brand-400)]/5 h-full flex flex-col"
        style={{ animationDelay: `${index * 60}ms` }}
      >
        <div className="flex-1">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <MaturityBadge status={fix.maturityStatus} />
              <InterventionsBadges primary={fix.primaryCategory} secondary={fix.secondaryCategories} />
            </div>
            <TimeToImpact horizon={fix.timeToImpact} />
          </div>

          <h3 className="text-[var(--color-text-primary)] font-semibold text-base sm:text-lg leading-tight mb-2 group-hover:text-[var(--color-brand-400)] transition-colors">
            {fix.headline}
          </h3>

          {fix.problemStatement && (
            <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed mb-3 line-clamp-2">
              {fix.problemStatement}
            </p>
          )}

          <div className="flex flex-wrap gap-1.5 mb-3">
            {fix.tags.slice(0, 3).map(tag => (
              <Tag key={tag} label={tag} variant="topic" onRemove={onTagClick ? () => onTagClick(tag) : undefined} />
            ))}
            {fix.tags.length > 3 && (
              <span className="text-[10px] text-gray-500 self-center">+{fix.tags.length - 3}</span>
            )}
          </div>
        </div>

        <div className="border-t border-[var(--color-border)] pt-3 mt-auto">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <EvidenceConfidence score={fix.evidenceScore} />
              {hasStory && (
                <span className="text-[10px] text-[var(--color-brand-400)] flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                  Linked story
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[10px] text-gray-500">
              {precedentCount > 0 && (
                <span className="flex items-center gap-1" title={`${precedentCount} global precedents`}>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {precedentCount}
                </span>
              )}
              <span>{fix.readingTime} min</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { Fix } from '../../types/canonical';
import { EVIDENCE_GRADE_CONFIG, MATURITY_CONFIG, INTERVENTION_COLOR_MAP, HORIZON_LABELS, formatCostLabel, formatDate } from '../../lib/fix-helpers';

interface FixHeroStripProps {
  fix: Fix;
}

function EvidenceGradeBadge({ grade }: { grade?: string }) {
  const c = EVIDENCE_GRADE_CONFIG[grade || 'Moderate'] || EVIDENCE_GRADE_CONFIG.Moderate;
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${c.className}`}>{c.label}</span>;
}

function MaturityBadge({ status }: { status?: string }) {
  const c = MATURITY_CONFIG[status || 'proposed'] || MATURITY_CONFIG.proposed;
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${c.className}`}>{c.label}</span>;
}

function InterventionBadge({ type }: { type?: string }) {
  if (!type) return null;
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${INTERVENTION_COLOR_MAP[type] || INTERVENTION_COLOR_MAP.administrative}`}>{type}</span>;
}

function MetadataItem({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center text-center min-w-0">
      <div className="flex items-center gap-1 text-[var(--color-text-tertiary)] mb-0.5">{icon}<span className="text-[10px] uppercase tracking-wider">{label}</span></div>
      <span className="text-sm font-medium text-[var(--color-text-primary)] truncate">{value}</span>
    </div>
  );
}

export default function FixHeroStrip({ fix }: FixHeroStripProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const costLabel = formatCostLabel(fix.fiscalCost);

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <EvidenceGradeBadge grade={fix.evidenceGrade} />
        <MaturityBadge status={fix.maturityStatus} />
        <InterventionBadge type={fix.primaryCategory} />
      </div>

      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--color-text-primary)] mb-4 leading-tight tracking-tight">
            {fix.headline}
          </h1>
          <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed max-w-2xl">
            {fix.summary}
          </p>

          <div className="flex items-center gap-6 mt-6 flex-wrap">
            <MetadataItem
              label={fix.lastVerified ? 'Verified' : 'Updated'}
              value={formatDate(fix.lastVerified || fix.updatedAt)}
              icon={<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            />
            <MetadataItem
              label="Version"
              value={fix.version || '1.0.0'}
              icon={<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>}
            />
            <MetadataItem
              label="Time to Impact"
              value={HORIZON_LABELS[fix.timeToImpact || ''] || 'TBD'}
              icon={<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            />
            <MetadataItem
              label="Fiscal Scale"
              value={costLabel}
              icon={<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            />
            <MetadataItem
              label="Reading Time"
              value={`${fix.readingTime} min`}
              icon={<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {fix.storySlug && (
            <Link
              href={`/story/${fix.storySlug}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] border border-[var(--color-border)] text-xs font-medium hover:bg-[var(--color-surface-tertiary)] transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
              Read Story
            </Link>
          )}
          <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] border border-[var(--color-border)] text-xs font-medium hover:bg-[var(--color-surface-tertiary)] transition-colors" aria-label="Download brief">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Download
          </button>
          <div className="relative">
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] border border-[var(--color-border)] text-xs font-medium hover:bg-[var(--color-surface-tertiary)] transition-colors"
              aria-label="Share"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
              Share
            </button>
            {showShareMenu && (
              <div className="absolute right-0 top-full mt-1 bg-[var(--color-surface-primary)] border border-[var(--color-border)] rounded-lg shadow-lg py-1 z-20 min-w-[140px]">
                <button className="w-full text-left px-3 py-2 text-xs text-[var(--color-text-primary)] hover:bg-[var(--color-surface-secondary)]">Copy Link</button>
                <button className="w-full text-left px-3 py-2 text-xs text-[var(--color-text-primary)] hover:bg-[var(--color-surface-secondary)]">Email</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-5">
        {fix.tags.map(tag => (
          <Link
            key={tag}
            href={`/fix?q=${encodeURIComponent(tag)}`}
            className="text-xs bg-[var(--color-surface-secondary)] text-[var(--color-text-tertiary)] px-2.5 py-1 rounded-full border border-[var(--color-border)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-brand-400)]/30 transition-colors"
          >
            {tag}
          </Link>
        ))}
      </div>
    </div>
  );
}

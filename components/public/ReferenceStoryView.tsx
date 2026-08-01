'use client';

/**
 * ─── THE BREAKDOWN OS — GOLDEN REFERENCE STORY IMPLEMENTATION (Phase 4) ─────
 * Master presentation component consuming ONLY StoryViewModel.
 * Reference implementation for every future story, chapter, explainer, and analysis.
 */

import React, { useState } from 'react';
import type { StoryViewModel } from '@/lib/projections/story/StoryViewModel';
import { EvidenceDrawer } from './EvidenceDrawer';
import { TimelineProjectionView } from './TimelineProjectionView';
import { RelatedKnowledgeView } from './RelatedKnowledgeView';
import { TrustLayerPanel } from './TrustLayerPanel';

export interface ReferenceStoryViewProps {
  storyViewModel: StoryViewModel;
}

export function ReferenceStoryView({ storyViewModel }: ReferenceStoryViewProps) {
  const [readingMode, setReadingMode] = useState<'reader' | 'research'>('reader');

  if (!storyViewModel) {
    return (
      <div style={{ padding: '2rem', fontStyle: 'italic', color: '#64748b' }}>
        Story projection payload unavailable.
      </div>
    );
  }

  const {
    title,
    headline,
    summary,
    author,
    category,
    readingTimeMinutes,
    publishedAt,
    updatedAt,
    narrativeBlocks,
    evidenceDrawer,
    timelineNodes,
    projectedEntities,
  } = storyViewModel;

  return (
    <article
      style={{
        width: '100%',
        maxWidth: readingMode === 'reader' ? '680px' : '960px',
        margin: '0 auto',
        padding: '2rem 1rem 5rem 1rem',
        fontFamily: readingMode === 'reader' ? 'Georgia, Cambria, serif' : 'system-ui, -apple-system, sans-serif',
        color: '#0f172a',
        lineHeight: 1.7,
        transition: 'max-width 0.3s ease, font-family 0.3s ease',
      }}
    >
      {/* Top Controls & Mode Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {category} • {readingTimeMinutes} min read
        </div>

        <div role="radiogroup" aria-label="Reading Mode Selection" style={{ display: 'flex', gap: '0.25rem', backgroundColor: '#f1f5f9', padding: '0.25rem', borderRadius: '6px' }}>
          <button
            role="radio"
            aria-checked={readingMode === 'reader'}
            onClick={() => setReadingMode('reader')}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '4px',
              border: 'none',
              fontSize: '0.8125rem',
              fontWeight: readingMode === 'reader' ? 600 : 400,
              backgroundColor: readingMode === 'reader' ? '#ffffff' : 'transparent',
              color: readingMode === 'reader' ? '#0f172a' : '#64748b',
              boxShadow: readingMode === 'reader' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
              cursor: 'pointer',
            }}
          >
            📖 Reader Mode
          </button>
          <button
            role="radio"
            aria-checked={readingMode === 'research'}
            onClick={() => setReadingMode('research')}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '4px',
              border: 'none',
              fontSize: '0.8125rem',
              fontWeight: readingMode === 'research' ? 600 : 400,
              backgroundColor: readingMode === 'research' ? '#ffffff' : 'transparent',
              color: readingMode === 'research' ? '#0f172a' : '#64748b',
              boxShadow: readingMode === 'research' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
              cursor: 'pointer',
            }}
          >
            🔬 Research Mode
          </button>
        </div>
      </div>

      {/* Article Header */}
      <header style={{ marginBottom: '2.5rem' }}>
        <h1
          style={{
            fontSize: readingMode === 'reader' ? '2.5rem' : '2.25rem',
            fontWeight: 800,
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
            marginBottom: '1rem',
            color: '#0f172a',
          }}
        >
          {title}
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#475569', lineHeight: 1.5, marginBottom: '1.25rem' }}>
          {headline || summary}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.875rem', color: '#64748b' }}>
          <span>By <strong>{author}</strong></span>
          <span>•</span>
          <time dateTime={publishedAt}>{publishedAt}</time>
        </div>
      </header>

      {/* Research Mode Historiographical Panel */}
      {readingMode === 'research' && (
        <section
          aria-label="Research Mode Historiographical Context"
          style={{
            marginBottom: '2rem',
            padding: '1.25rem',
            backgroundColor: '#eff6ff',
            borderRadius: '8px',
            border: '1px solid #bfdbfe',
            fontSize: '0.875rem',
          }}
        >
          <strong style={{ color: '#1e40af', display: 'block', marginBottom: '0.5rem' }}>
            🔬 Research Mode Active: Historiographical Context & Archival Provenance
          </strong>
          <p style={{ color: '#1e3a8a', marginBottom: '0.5rem' }}>
            Showing underlying Claim Registry entries, primary archival shelf marks, and confidence scores.
          </p>
          <div style={{ fontSize: '0.8125rem', color: '#1d4ed8' }}>
            Primary Sources Linked: {evidenceDrawer.primarySourcesCount} | Verified Claims: {evidenceDrawer.verifiedClaimsCount}
          </div>
        </section>
      )}

      {/* 7 MANDATORY NARRATIVE BLOCKS (CONSTITUTION LEVEL 1) */}
      <main style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        {/* Block 1: WHAT HAPPENED */}
        <section aria-labelledby="block-what-happened">
          <h2 id="block-what-happened" style={{ fontSize: '1.375rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem', borderBottom: '2px solid #0f172a', paddingBottom: '0.25rem' }}>
            1. What Happened
          </h2>
          <p style={{ fontSize: '1.0625rem', color: '#334155' }}>
            {narrativeBlocks.whatHappened}
          </p>
        </section>

        {/* Block 2: WHY IT MATTERS */}
        <section aria-labelledby="block-why-it-matters">
          <h2 id="block-why-it-matters" style={{ fontSize: '1.375rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem', borderBottom: '2px solid #0f172a', paddingBottom: '0.25rem' }}>
            2. Why It Matters
          </h2>
          <p style={{ fontSize: '1.0625rem', color: '#334155' }}>
            {narrativeBlocks.whyItMatters}
          </p>
        </section>

        {/* Block 3: WHAT CAUSED IT */}
        {narrativeBlocks.whatCausedIt && (
          <section aria-labelledby="block-what-caused-it">
            <h2 id="block-what-caused-it" style={{ fontSize: '1.375rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem', borderBottom: '2px solid #0f172a', paddingBottom: '0.25rem' }}>
              3. What Caused It
            </h2>
            <p style={{ fontSize: '1.0625rem', color: '#334155' }}>
              {narrativeBlocks.whatCausedIt}
            </p>
          </section>
        )}

        {/* Block 4: WHAT CHANGED */}
        {narrativeBlocks.whatChanged && (
          <section aria-labelledby="block-what-changed">
            <h2 id="block-what-changed" style={{ fontSize: '1.375rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem', borderBottom: '2px solid #0f172a', paddingBottom: '0.25rem' }}>
              4. What Changed
            </h2>
            <p style={{ fontSize: '1.0625rem', color: '#334155' }}>
              {narrativeBlocks.whatChanged}
            </p>
          </section>
        )}

        {/* Block 5: WHAT HAPPENS NEXT */}
        {narrativeBlocks.whatHappensNext && (
          <section aria-labelledby="block-what-happens-next">
            <h2 id="block-what-happens-next" style={{ fontSize: '1.375rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem', borderBottom: '2px solid #0f172a', paddingBottom: '0.25rem' }}>
              5. What Happens Next
            </h2>
            <p style={{ fontSize: '1.0625rem', color: '#334155' }}>
              {narrativeBlocks.whatHappensNext}
            </p>
          </section>
        )}

        {/* Block 6: WHAT EVIDENCE EXISTS (Evidence Drawer & Primary Sources) */}
        <section aria-labelledby="block-what-evidence-exists">
          <h2 id="block-what-evidence-exists" style={{ fontSize: '1.375rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem', borderBottom: '2px solid #0f172a', paddingBottom: '0.25rem' }}>
            6. What Evidence Exists
          </h2>
          <EvidenceDrawer evidenceDrawer={evidenceDrawer} />
        </section>

        {/* Projected Timeline Integration */}
        <TimelineProjectionView timelineNodes={timelineNodes} />

        {/* Projected Related Knowledge Entities */}
        <RelatedKnowledgeView projectedEntities={projectedEntities} />

        {/* Block 7: WHAT TO EXPLORE NEXT */}
        {narrativeBlocks.whatToExploreNext && (
          <section aria-labelledby="block-what-to-explore-next">
            <h2 id="block-what-to-explore-next" style={{ fontSize: '1.375rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem', borderBottom: '2px solid #0f172a', paddingBottom: '0.25rem' }}>
              7. What to Explore Next
            </h2>
            <div style={{ padding: '1rem', backgroundColor: '#f0f9ff', borderRadius: '6px', borderLeft: '4px solid #0284c7' }}>
              <p style={{ fontSize: '1rem', color: '#0369a1', fontWeight: 500 }}>
                {narrativeBlocks.whatToExploreNext}
              </p>
            </div>
          </section>
        )}

        {/* Trust & Credibility Layer */}
        <TrustLayerPanel
          lastUpdated={updatedAt || publishedAt}
          totalClaims={evidenceDrawer.totalClaimsCount}
          verifiedClaims={evidenceDrawer.verifiedClaimsCount}
          primarySourcesCount={evidenceDrawer.primarySourcesCount}
        />
      </main>
    </article>
  );
}

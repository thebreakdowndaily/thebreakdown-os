'use client';

/**
 * ─── Public Presentation Component: PublicHomepageView ───────────────────────
 * Consumes strictly ReaderCardViewModel, TopicViewModel, and TimelineViewModel projections.
 * Answers 3 Information Architecture questions in order:
 * 1. What matters today? (Lead Analysis)
 * 2. What should I understand? (Essential Context Cards)
 * 3. Where do I go next? (Topic Hubs & Interactive Timelines)
 */

import React from 'react';
import type { ReaderCardViewModel } from '@/lib/projections/reader/ReaderCardViewModel';
import type { TopicViewModel } from '@/lib/projections/topic/TopicViewModel';
import type { TimelineViewModel } from '@/lib/projections/timeline/TimelineViewModel';

export interface PublicHomepageViewProps {
  leadStoryCard: ReaderCardViewModel;
  essentialContextCards: ReaderCardViewModel[];
  featuredTopic?: TopicViewModel;
  featuredTimeline?: TimelineViewModel;
}

export function PublicHomepageView({
  leadStoryCard,
  essentialContextCards = [],
  featuredTopic,
  featuredTimeline,
}: PublicHomepageViewProps) {
  return (
    <div style={{ width: '100%', maxWidth: '1120px', margin: '0 auto', padding: '2rem 1.25rem 5rem 1.25rem', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0f172a' }}>
      
      {/* SECTION 1: WHAT MATTERS TODAY? (Lead Analysis Hero) */}
      <section aria-labelledby="section-lead-analysis" style={{ marginBottom: '3.5rem' }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
          Today's Lead Analysis • {leadStoryCard.category}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', backgroundColor: '#f8fafc', borderRadius: '12px', padding: '2rem', border: '1px solid #e2e8f0' }}>
          <div>
            <h1 id="section-lead-analysis" style={{ fontSize: '2.25rem', fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.02em', marginBottom: '1rem', color: '#0f172a' }}>
              <a href={`/story/${leadStoryCard.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                {leadStoryCard.title}
              </a>
            </h1>
            <p style={{ fontSize: '1.125rem', color: '#475569', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              {leadStoryCard.summary}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <a
                href={`/story/${leadStoryCard.slug}`}
                style={{
                  padding: '0.625rem 1.25rem',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  borderRadius: '6px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                }}
              >
                Read Deep Analysis →
              </a>
              <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '4px', fontWeight: 600 }}>
                {leadStoryCard.verifiedEvidenceBadge}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: WHAT SHOULD I UNDERSTAND? (Essential Context Grid) */}
      <section aria-labelledby="section-essential-context" style={{ marginBottom: '3.5rem' }}>
        <h2 id="section-essential-context" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>
          Essential Context & Explainer Guides
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {essentialContextCards.map((card) => (
            <article key={card.id} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.25rem', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase', marginBottom: '0.375rem' }}>
                  {card.category} • {card.readingTimeMinutes} min
                </div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem', lineHeight: 1.3 }}>
                  <a href={`/story/${card.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {card.title}
                  </a>
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5, marginBottom: '1rem' }}>
                  {card.summary}
                </p>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>
                {card.verifiedEvidenceBadge}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* SECTION 3: WHERE DO I GO NEXT? (Featured Topic Hub & Interactive Timelines) */}
      <section aria-labelledby="section-where-next">
        <h2 id="section-where-next" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>
          Curated Knowledge Paths & Timelines
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {featuredTopic && (
            <div style={{ padding: '1.5rem', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase', marginBottom: '0.375rem' }}>
                Featured Subject Hub
              </div>
              <h3 style={{ fontSize: '1.375rem', fontWeight: 700, color: '#0c4a6e', marginBottom: '0.5rem' }}>
                <a href={`/topics/${featuredTopic.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                  {featuredTopic.name}
                </a>
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#0369a1', marginBottom: '1rem', lineHeight: 1.5 }}>
                {featuredTopic.description}
              </p>
              <a href={`/topics/${featuredTopic.slug}`} style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0284c7', textDecoration: 'none' }}>
                Explore Topic Hub ({featuredTopic.totalStoriesCount} Stories) →
              </a>
            </div>
          )}

          {featuredTimeline && (
            <div style={{ padding: '1.5rem', backgroundColor: '#fafafa', borderRadius: '8px', border: '1px solid #e5e5e5' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#525252', textTransform: 'uppercase', marginBottom: '0.375rem' }}>
                Interactive Chronology
              </div>
              <h3 style={{ fontSize: '1.375rem', fontWeight: 700, color: '#171717', marginBottom: '0.5rem' }}>
                <a href={`/timelines/${featuredTimeline.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                  {featuredTimeline.title}
                </a>
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#525252', marginBottom: '1rem', lineHeight: 1.5 }}>
                {featuredTimeline.description}
              </p>
              <a href={`/timelines/${featuredTimeline.slug}`} style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0284c7', textDecoration: 'none' }}>
                Explore Timeline ({featuredTimeline.startYear}–{featuredTimeline.endYear}) →
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Institutional Trust Strip */}
      <footer style={{ marginTop: '4rem', padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center', fontSize: '0.875rem', color: '#64748b' }}>
        <strong>The Breakdown Knowledge Platform</strong> — Independent, evidence-first public affairs research.
        <div style={{ marginTop: '0.5rem' }}>
          <a href="/trust" style={{ color: '#0284c7', textDecoration: 'none', marginRight: '1rem' }}>Editorial Standards</a>
          <a href="/about" style={{ color: '#0284c7', textDecoration: 'none' }}>Research Bureau</a>
        </div>
      </footer>
    </div>
  );
}

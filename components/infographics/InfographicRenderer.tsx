'use client';

import React from 'react';

/* ── Card type definitions ───────────────────────────────────────────── */

interface ComparisonItem {
  label: string;
  color?: string;
  metrics: Array<{ label: string; value: string }>;
}

interface FactCard {
  cardId: string;
  type: 'fact';
  value: string;
  label: string;
  context?: string;
  icon?: string;
  caption?: string;
  altText?: string;
}

interface ComparisonCard {
  cardId: string;
  type: 'comparison';
  purpose: string;
  items: ComparisonItem[];
  caption?: string;
  altText?: string;
}

interface TimelineCard {
  cardId: string;
  type: 'timeline';
  purpose: string;
  events: Array<{ date: string; title: string; description?: string }>;
  orientation?: 'vertical' | 'horizontal';
}

interface StatisticsCard {
  cardId: string;
  type: 'statistics';
  purpose: string;
  stats: Array<{ value: string; label: string; change?: string }>;
  columns?: number;
  caption?: string;
}

interface CountryCard {
  cardId: string;
  type: 'country';
  purpose: string;
  country: {
    name: string;
    iso?: string;
    stats?: Array<{ label: string; value: string }>;
    highlight?: string;
  };
}

interface QuoteCard {
  cardId: string;
  type: 'quote';
  quote: string;
  attribution: string;
  source?: string;
}

interface ExplainerCard {
  cardId: string;
  type: 'explainer';
  purpose: string;
  steps: Array<{ number: number; title: string; description: string }>;
  showConnector?: boolean;
}

type CardSpec = FactCard | ComparisonCard | TimelineCard | StatisticsCard | CountryCard | QuoteCard | ExplainerCard;

interface InfographicRendererProps {
  cards: CardSpec[];
}

/**
 * InfographicRenderer — Renders card-based infographics.
 * Supports: fact, comparison, timeline, statistics, country, quote, explainer
 */
const InfographicRenderer: React.FC<InfographicRendererProps> = ({ cards }) => {
  const renderCard = (card: CardSpec, i: number) => {
    const baseStyle: React.CSSProperties = {
      backgroundColor: 'var(--color-bg-secondary)',
      border: '1px solid var(--color-border-default)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--spacing-5)',
      height: '100%',
    };

    switch (card.type) {
      /* ── Fact Card ── */
      case 'fact':
        return (
          <figure key={card.cardId || i} style={{ ...baseStyle, textAlign: 'center' }} role="img" aria-label={card.altText || card.label}>
            <div style={{ fontSize: 'clamp(var(--text-3xl), 4vw, var(--text-5xl))', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-brand-400)', lineHeight: 1.1, marginBottom: 'var(--spacing-2)' }}>
              {card.value}
            </div>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-1)' }}>
              {card.label}
            </div>
            {card.context && (
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                {card.context}
              </div>
            )}
            {card.caption && (
              <figcaption style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-3)', paddingTop: 'var(--spacing-3)', borderTop: '1px solid var(--color-border-default)' }}>
                {card.caption}
              </figcaption>
            )}
          </figure>
        );

      /* ── Comparison Card ── */
      case 'comparison':
        return (
          <figure key={card.cardId || i} style={baseStyle} role="img" aria-label={card.altText || card.purpose}>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-4)' }}>
              {card.purpose}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${String(card.items.length)}, 1fr)`, gap: 'var(--spacing-4)' }}>
              {card.items.map((item, j) => (
                <div key={j} style={{ padding: 'var(--spacing-3)', backgroundColor: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-bold)', color: item.color || 'var(--color-text-primary)', marginBottom: 'var(--spacing-3)', textAlign: 'center' }}>
                    {item.label}
                  </div>
                  {item.metrics.map((m, k) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--spacing-1) 0', fontSize: 'var(--text-xs)', borderBottom: k < item.metrics.length - 1 ? '1px solid var(--color-border-default)' : 'none' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>{m.label}</span>
                      <span style={{ color: 'var(--color-text-primary)', fontWeight: 'var(--font-weight-medium)' }}>{m.value}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            {card.caption && (
              <figcaption style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-3)', paddingTop: 'var(--spacing-3)', borderTop: '1px solid var(--color-border-default)' }}>
                {card.caption}
              </figcaption>
            )}
          </figure>
        );

      /* ── Statistics Grid ── */
      case 'statistics':
        return (
          <figure key={card.cardId || i} style={baseStyle} role="img" aria-label={card.purpose}>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-4)' }}>
              {card.purpose}
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${String(Math.min(card.columns || 3, card.stats.length))}, 1fr)`,
              gap: 'var(--spacing-3)',
            }}>
              {card.stats.map((stat, j) => (
                <div key={j} style={{ padding: 'var(--spacing-4)', backgroundColor: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <div style={{ fontSize: 'clamp(var(--text-xl), 2vw, var(--text-3xl))', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-brand-400)' }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-1)' }}>
                    {stat.label}
                  </div>
                  {stat.change && (
                    <div style={{ fontSize: 'var(--text-xs)', color: stat.change.startsWith('+') ? 'var(--color-success)' : 'var(--color-error)', marginTop: 'var(--spacing-1)' }}>
                      {stat.change}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {card.caption && (
              <figcaption style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-3)', paddingTop: 'var(--spacing-3)', borderTop: '1px solid var(--color-border-default)' }}>
                {card.caption}
              </figcaption>
            )}
          </figure>
        );

      /* ── Quote Card ── */
      case 'quote':
        return (
          <figure key={card.cardId || i} style={{
            ...baseStyle,
            borderLeft: `4px solid var(--color-brand-400)`,
          }} role="img" aria-label={`Quote by ${card.attribution}`}>
            <blockquote style={{ margin: 0, padding: 0 }}>
              <p style={{ fontSize: 'var(--text-base)', fontStyle: 'italic', color: 'var(--color-text-primary)', lineHeight: 1.6, margin: 0 }}>
                &ldquo;{card.quote}&rdquo;
              </p>
            </blockquote>
            <div style={{ marginTop: 'var(--spacing-4)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
              <span style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)' }}>{card.attribution}</span>
              {card.source && <span> &middot; {card.source}</span>}
            </div>
          </figure>
        );

      /* ── Explainer Card ── */
      case 'explainer':
        return (
          <figure key={card.cardId || i} style={baseStyle} role="img" aria-label={card.purpose}>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-4)' }}>
              {card.purpose}
            </div>
            {card.steps.map((step, j) => (
              <div key={j} style={{ display: 'flex', gap: 'var(--spacing-4)', paddingBottom: j < card.steps.length - 1 ? 'var(--spacing-4)' : 0, marginBottom: j < card.steps.length - 1 ? 'var(--spacing-4)' : 0, borderBottom: card.showConnector && j < card.steps.length - 1 ? '1px solid var(--color-border-default)' : 'none' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-brand-400)',
                  color: 'var(--color-text-inverse)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-bold)',
                  flexShrink: 0,
                }}>
                  {step.number}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-1)' }}>
                    {step.title}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                    {step.description}
                  </div>
                </div>
              </div>
            ))}
          </figure>
        );

      /* ── Country Card ── */
      case 'country':
        return (
          <figure key={card.cardId || i} style={baseStyle} role="img" aria-label={card.purpose}>
            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-3)' }}>
              {card.country.name}
            </div>
            {card.country.stats && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-2)' }}>
                {card.country.stats.map((s, j) => (
                  <div key={j} style={{ padding: 'var(--spacing-2)', backgroundColor: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{s.label}</div>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)' }}>{s.value}</div>
                  </div>
                ))}
              </div>
            )}
            {card.country.highlight && (
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-3)', paddingTop: 'var(--spacing-3)', borderTop: '1px solid var(--color-border-default)', fontStyle: 'italic' }}>
                {card.country.highlight}
              </div>
            )}
          </figure>
        );

      /* ── Timeline Card ── */
      case 'timeline':
        return (
          <figure key={card.cardId || i} style={baseStyle} role="img" aria-label={card.purpose}>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-4)' }}>
              {card.purpose}
            </div>
            <div style={{ position: 'relative', paddingLeft: 'var(--spacing-6)' }}>
              <div style={{ position: 'absolute', left: 'var(--spacing-2)', top: 0, bottom: 0, width: '2px', backgroundColor: 'var(--color-border-default)' }} aria-hidden="true" />
              {card.events.map((evt, j) => (
                <div key={j} style={{ position: 'relative', paddingBottom: j < card.events.length - 1 ? 'var(--spacing-4)' : 0 }}>
                  <div style={{ position: 'absolute', left: 'calc(-1 * var(--spacing-6) + var(--spacing-2) - 4px)', top: '4px', width: '10px', height: '10px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-brand-400)', border: '2px solid var(--color-bg-secondary)', zIndex: 1 }} aria-hidden="true" />
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-brand-400)', fontWeight: 'var(--font-weight-semibold)' }}>{evt.date}</div>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>{evt.title}</div>
                  {evt.description && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>{evt.description}</div>}
                </div>
              ))}
            </div>
          </figure>
        );

      default:
        return null;
    }
  };

  if (cards.length === 0) return null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--spacing-4)' }}>
      {cards.map((card, i) => renderCard(card, i))}
    </div>
  );
};

export default InfographicRenderer;

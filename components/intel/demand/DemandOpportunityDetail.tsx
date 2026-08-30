'use client';

/**
 * ─── DemandOpportunityDetail ─────────────────────────────────────────────────
 *
 * Expanded detail panel for a demand opportunity. Rendered inline when the
 * parent card is expanded. Shows related queries, coverage mapping, evidence
 * gap analysis, and the research handoff CTA.
 *
 * Governing document: docs/editorial/story-selection-framework.md
 */

import type { DemandOpportunity } from '@/types/demand-intelligence';

interface DemandOpportunityDetailProps {
  opportunity: DemandOpportunity;
}

function formatVolume(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

const LANG_LABELS: Record<string, string> = { en: 'EN', hi: 'HI', mixed: 'EN/HI' };

export function DemandOpportunityDetail({ opportunity }: DemandOpportunityDetailProps) {
  const researchUrl = `/intel/research/rie?prefill=${encodeURIComponent(opportunity.primaryQuery.text)}`;

  return (
    <div
      style={{
        marginTop: 'var(--spacing-3)',
        padding: 'var(--spacing-4)',
        background: 'var(--color-bg-primary)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border-default)',
      }}
    >
      {/* Related Queries */}
      {opportunity.relatedQueries.length > 0 && (
        <div style={{ marginBottom: 'var(--spacing-4)' }}>
          <h4
            style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              color: 'var(--color-text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 'var(--spacing-2)',
            }}
          >
            Related Search Queries ({opportunity.relatedQueries.length})
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)' }}>
            {opportunity.relatedQueries.map((q, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 'var(--spacing-1)',
                  padding: 'var(--spacing-1-5) var(--spacing-2)',
                  background: 'var(--color-bg-secondary)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--text-xs)',
                }}
              >
                <span style={{ color: 'var(--color-text-primary)' }}>
                  {q.text}
                  {q.transliteration && (
                    <span style={{ color: 'var(--color-text-muted)', marginLeft: 'var(--spacing-2)' }}>
                      ({q.transliteration})
                    </span>
                  )}
                </span>
                <span style={{ color: 'var(--color-text-muted)', whiteSpace: 'nowrap', marginLeft: 'var(--spacing-3)' }}>
                  <span style={{ fontWeight: 500, color: 'var(--color-text-secondary)' }}>{formatVolume(q.monthlyVolume)}</span>/mo
                  <span
                    style={{
                      marginLeft: 'var(--spacing-1)',
                      padding: '1px 4px',
                      borderRadius: '2px',
                      background: 'var(--color-bg-tertiary)',
                      fontSize: '10px',
                    }}
                  >
                    {LANG_LABELS[q.language] ?? q.language.toUpperCase()}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Existing Coverage */}
      {opportunity.existingCoverage.length > 0 && (
        <div style={{ marginBottom: 'var(--spacing-4)' }}>
          <h4
            style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              color: 'var(--color-text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 'var(--spacing-2)',
            }}
          >
            Existing Coverage
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-1)' }}>
            {opportunity.existingCoverage.map((title, i) => (
              <span
                key={i}
                style={{
                  padding: '2px 8px',
                  background: 'color-mix(in srgb, var(--color-brand-400) 10%, transparent)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '11px',
                  color: 'var(--color-brand-400)',
                  fontWeight: 500,
                }}
              >
                {title}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Evidence Gap Analysis */}
      <div style={{ marginBottom: 'var(--spacing-4)' }}>
        <h4
          style={{
            fontSize: 'var(--text-xs)',
            fontWeight: 600,
            color: 'var(--color-text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: 'var(--spacing-2)',
          }}
        >
          Research Brief
        </h4>
        <p
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.6,
            margin: 0,
            padding: 'var(--spacing-2)',
            background: 'var(--color-bg-secondary)',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          {opportunity.suggestedResearchBrief}
        </p>
      </div>

      {/* Research Questions */}
      {opportunity.suggestedResearchQuestions.length > 0 && (
        <div style={{ marginBottom: 'var(--spacing-4)' }}>
          <h4
            style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              color: 'var(--color-text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 'var(--spacing-2)',
            }}
          >
            Suggested Research Questions
          </h4>
          <ol
            style={{
              margin: 0,
              paddingLeft: 'var(--spacing-5)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.8,
            }}
          >
            {opportunity.suggestedResearchQuestions.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ol>
        </div>
      )}

      {/* Research Handoff CTA */}
      <div style={{ display: 'flex', gap: 'var(--spacing-2)', alignItems: 'center' }}>
        <a
          href={researchUrl}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--spacing-1)',
            padding: 'var(--spacing-2) var(--spacing-3)',
            background: 'var(--color-brand-400)',
            color: 'var(--color-bg-primary)',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--text-xs)',
            fontWeight: 600,
            cursor: 'pointer',
            textDecoration: 'none',
          }}
        >
          Create Research Project →
        </a>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          Opens in Research Intelligence Engine with pre-filled query
        </span>
      </div>
    </div>
  );
}

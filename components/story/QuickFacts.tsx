import React from 'react';
import StatisticsGrid from '@/components/statistics/StatisticsGrid';

interface QuickFactsProps {
  facts: Array<{ label: string; value: string; source?: string }>;
}

const QuickFacts: React.FC<QuickFactsProps> = ({ facts }) => {
  if (!facts || facts.length === 0) return null;

  return (
    <section aria-label="Quick facts" style={{
      width: '100%',
      maxWidth: 'var(--max-width-content)',
      margin: '0 auto',
      padding: 'var(--spacing-8) var(--spacing-4)',
    }}>
      <h2 style={{
        fontSize: 'var(--text-xl)',
        fontWeight: 'var(--font-weight-bold)',
        color: 'var(--color-text-primary)',
        marginBottom: 'var(--spacing-6)',
      }}>
        Quick Facts
      </h2>

      <StatisticsGrid
        stats={facts.map((f) => ({
          value: f.value,
          label: f.label,
          subtitle: f.source ? `Source: ${f.source}` : undefined,
        }))}
        columns={Math.min(3, facts.length)}
        caption="Key statistics at a glance"
      />
    </section>
  );
};

export default QuickFacts;

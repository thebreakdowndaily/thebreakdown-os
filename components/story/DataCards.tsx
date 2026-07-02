'use client';

import React, { useState } from 'react';

interface DataCardsProps {
  datasets: Array<{
    label: string;
    description: string;
    data: Array<Record<string, string | number | boolean | null>>;
    source?: string;
  }>;
}

const DataCards: React.FC<DataCardsProps> = ({ datasets }) => {
  if (datasets.length === 0) return null;

  return (
    <section aria-label="Data" style={{
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
        Data
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
        gap: 'var(--spacing-4)',
      }}>
        {datasets.map((ds, i) => (
          <DataCard key={i} dataset={ds} />
        ))}
      </div>
    </section>
  );
};

const DataCard: React.FC<{ dataset: DataCardsProps['datasets'][0] }> = ({ dataset }) => {
  const [expanded, setExpanded] = useState(false);
  const previewRows = dataset.data.slice(0, 3);
  const headers = dataset.data.length > 0 ? Object.keys(dataset.data[0]) : [];
  const hasMore = dataset.data.length > 3;

  return (
    <div style={{
      backgroundColor: 'var(--color-bg-secondary)',
      border: '1px solid var(--color-border-default)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--spacing-5)',
    }}>
      <h3 style={{
        fontSize: 'var(--text-base)',
        fontWeight: 'var(--font-weight-semibold)',
        color: 'var(--color-text-primary)',
        marginBottom: 'var(--spacing-1)',
      }}>
        {dataset.label}
      </h3>

      <p style={{
        fontSize: 'var(--text-sm)',
        color: 'var(--color-text-muted)',
        marginBottom: 'var(--spacing-4)',
      }}>
        {dataset.description}
      </p>

      {/* Data table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          fontSize: 'var(--text-xs)',
          textAlign: 'left',
          borderCollapse: 'collapse',
          color: 'var(--color-text-primary)',
        }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border-default)' }}>
              {headers.map((h) => (
                <th key={h} style={{
                  padding: 'var(--spacing-1) var(--spacing-3) var(--spacing-1) 0',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontSize: 'var(--text-xs)',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(expanded ? dataset.data : previewRows).map((row, ri) => (
              <tr key={ri} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                {headers.map((h) => (
                  <td key={h} style={{
                    padding: 'var(--spacing-1) var(--spacing-3) var(--spacing-1) 0',
                    maxWidth: '120px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    color: 'var(--color-text-secondary)',
                  }}>
                    {String(row[h] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Expand/Collapse */}
      {hasMore && (
        <button
          onClick={() => { setExpanded((e) => !e); }}
          style={{
            marginTop: 'var(--spacing-3)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-brand-400)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
          aria-expanded={expanded}
        >
          {expanded ? 'Show less ↑' : `View full data (${String(dataset.data.length)} rows) ↓`}
        </button>
      )}

      {/* Source link */}
      {dataset.source && (
        <a
          href={dataset.source}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block',
            marginTop: 'var(--spacing-2)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-brand-400)',
          }}
        >
          Source →
        </a>
      )}
    </div>
  );
};

export default DataCards;

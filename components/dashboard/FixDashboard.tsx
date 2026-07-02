'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getFixes } from '@/utils/data-layer/store';

const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
const priorityColors: Record<string, string> = {
  critical: '#ef4444', high: '#f59e0b', medium: '#3b82f6', low: '#6b7280',
};

export default function FixDashboard() {
  // In a real app this would use live data via API/SWR
  const fixes = getFixes({ pageSize: 50 });
  const [sortBy, setSortBy] = useState<'score' | 'date' | 'priority'>('score');

  const totalMetrics = fixes.data.reduce((sum, f) => sum + f.metricsToTrack.length, 0);
  const totalActions = fixes.data.reduce((sum, f) => sum + f.recommendedActions.length + f.citizenActions.length + f.governmentActions.length, 0);
  const totalStakeholders = fixes.data.reduce((sum, f) => sum + f.stakeholders.length, 0);

  const sorted = [...fixes.data].sort((a, b) => {
    if (sortBy === 'score') return b.evidenceScore - a.evidenceScore;
    if (sortBy === 'date') return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    return 0;
  });

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
          The Fix — Solutions Dashboard
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>
          Track all fix frameworks, their recommendations, metrics, and stakeholders.
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        <div style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border-subtle)', borderRadius: '8px', padding: '16px' }}>
          <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-amber-400)' }}>{fixes.data.length}</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginTop: '4px' }}>Total Fixes</div>
        </div>
        <div style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border-subtle)', borderRadius: '8px', padding: '16px' }}>
          <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-blue-400)' }}>{totalMetrics}</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginTop: '4px' }}>Trackable Metrics</div>
        </div>
        <div style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border-subtle)', borderRadius: '8px', padding: '16px' }}>
          <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-emerald-400)' }}>{totalActions}</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginTop: '4px' }}>Recommended Actions</div>
        </div>
        <div style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border-subtle)', borderRadius: '8px', padding: '16px' }}>
          <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-violet-400)' }}>{totalStakeholders}</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginTop: '4px' }}>Mapped Stakeholders</div>
        </div>
      </div>

      {/* Sort Controls */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {(['score', 'date', 'priority'] as const).map((opt) => (
          <button
            key={opt}
            onClick={() => setSortBy(opt)}
            style={{
              padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
              background: sortBy === opt ? 'var(--color-amber-500)' : 'var(--color-surface-elevated)',
              color: sortBy === opt ? '#000' : 'var(--color-text-secondary)',
              border: '1px solid var(--color-border-subtle)',
              cursor: 'pointer',
            }}
          >
            Sort by {opt}
          </button>
        ))}
      </div>

      {/* Fix List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {sorted.map((fix) => {
          const criticalActions = fix.recommendedActions.filter((a) => a.priority === 'critical').length;
          const highActions = fix.recommendedActions.filter((a) => a.priority === 'high').length;

          return (
            <Link
              key={fix.slug}
              href={`/fix/${fix.slug}`}
              style={{
                display: 'block',
                background: 'var(--color-surface-elevated)',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: '8px',
                padding: '16px',
                textDecoration: 'none',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-amber-600)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border-subtle)'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{
                      fontSize: '12px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px',
                      background: fix.evidenceScore >= 90 ? 'rgba(16,185,129,0.15)' : fix.evidenceScore >= 80 ? 'rgba(245,158,11,0.15)' : 'rgba(107,114,128,0.15)',
                      color: fix.evidenceScore >= 90 ? '#34d399' : fix.evidenceScore >= 80 ? '#fbbf24' : '#9ca3af',
                    }}>
                      Score: {fix.evidenceScore}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                      {new Date(fix.publishedAt).toLocaleDateString('en-IN')}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                      {fix.readingTime} min
                    </span>
                  </div>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                    {fix.headline}
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                    {fix.summary.slice(0, 150)}...
                  </p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '16px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>
                    {fix.metricsToTrack.length} metrics
                  </div>
                  {criticalActions > 0 && (
                    <div style={{ fontSize: '12px', color: '#ef4444' }}>
                      {criticalActions} critical
                    </div>
                  )}
                  {highActions > 0 && (
                    <div style={{ fontSize: '12px', color: '#f59e0b' }}>
                      {highActions} high
                    </div>
                  )}
                </div>
              </div>

              {/* Priority bar */}
              <div style={{ marginTop: '10px', display: 'flex', gap: '4px' }}>
                {(['critical', 'high', 'medium'] as const).map((p) => {
                  const count = fix.recommendedActions.filter((a) => a.priority === p).length;
                  if (count === 0) return null;
                  return (
                    <span key={p} style={{
                      fontSize: '10px', fontWeight: 600, padding: '2px 6px', borderRadius: '4px',
                      background: `${priorityColors[p]}20`, color: priorityColors[p],
                    }}>
                      {count} {p}
                    </span>
                  );
                })}
              </div>
            </Link>
          );
        })}
      </div>

      {fixes.data.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--color-text-tertiary)' }}>
          <p style={{ fontSize: '14px' }}>No fixes yet. Publish a &quot;The Fix&quot; story to see it here.</p>
        </div>
      )}
    </div>
  );
}

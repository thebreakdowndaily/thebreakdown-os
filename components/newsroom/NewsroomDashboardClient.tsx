'use client';

import { useState } from 'react';
import { EditorialQueueItem, QueueSection, NewsroomOperationalMetrics } from '@/types/newsroom-intelligence';
import { SignalCard } from './SignalCard';

interface NewsroomDashboardProps {
  initialQueue: Record<QueueSection, EditorialQueueItem[]>;
  initialMetrics: NewsroomOperationalMetrics;
}

export function NewsroomDashboardClient({ initialQueue, initialMetrics }: NewsroomDashboardProps) {
  const [activeTab, setActiveTab] = useState<QueueSection>('BREAKING_P0');
  const [queue, setQueue] = useState(initialQueue);
  const [metrics] = useState(initialMetrics);

  const tabs: Array<{ key: QueueSection; label: string; count: number }> = [
    { key: 'BREAKING_P0', label: 'Breaking / P0', count: queue.BREAKING_P0.length },
    { key: 'P1_IMPORTANT', label: 'P1 — Important', count: queue.P1_IMPORTANT.length },
    { key: 'DEVELOPING', label: 'Developing', count: queue.DEVELOPING.length },
    { key: 'NEEDS_VERIFICATION', label: 'Needs Verification', count: queue.NEEDS_VERIFICATION.length },
    { key: 'CONTRADICTIONS', label: 'Contradictions', count: queue.CONTRADICTIONS.length },
    { key: 'COVERAGE_GAPS', label: 'Coverage Gaps', count: queue.COVERAGE_GAPS.length },
    { key: 'RESOLVED', label: 'Resolved', count: queue.RESOLVED.length },
  ];

  const handleAction = async (action: string, signalId: string) => {
    try {
      // Actor identity is never sent by the client — the server derives it
      // from the authenticated session (prevents identity spoofing).
      await fetch(`/api/v2/newsroom/signals/${signalId}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      // Filter out or update state locally for smooth UX
      setQueue((prev) => {
        const next = { ...prev };
        for (const k of Object.keys(next) as QueueSection[]) {
          next[k] = next[k].map((item) =>
            item.signalId === signalId
              ? { ...item, status: action === 'RESOLVE' ? 'resolved' : item.status }
              : item
          );
        }
        return next;
      });
    } catch {
      // ignore
    }
  };

  const activeItems = queue[activeTab];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'var(--spacing-8)' }}>
      <header style={{ marginBottom: 'var(--spacing-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--spacing-4)' }}>
          <div>
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              Newsroom Intelligence OS
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--spacing-1)' }}>
              Operational newsroom command surface · Human-governed verification & triage loop.
            </p>
          </div>
          <div>
            {(() => {
              let badgeText = 'SHADOW MODE — CERTIFIED';
              let badgeBg = '#f1f5f9';
              let badgeColor = '#475569';
              let badgeBorder = '1px solid #cbd5e1';

              if (metrics.phase2Active) {
                badgeText = 'PHASE 2 — BEAT ALERTING ACTIVE';
                badgeBg = '#dcfce7';
                badgeColor = '#15803d';
                badgeBorder = '1px solid #bbf7d0';
              } else if (metrics.phase2Authorized) {
                // Authorized but not active implies kill switch is engaged
                badgeText = 'PHASE 2 — KILL SWITCH ENGAGED';
                badgeBg = '#fee2e2';
                badgeColor = '#b91c1c';
                badgeBorder = '1px solid #fecaca';
              } else {
                // If not authorized, default to Awaiting Authorization status
                badgeText = 'PHASE 2 — READY / AWAITING AUTHORIZATION';
                badgeBg = '#e0f2fe';
                badgeColor = '#0369a1';
                badgeBorder = '1px solid #bae6fd';
              }

              return (
                <span style={{ padding: '4px 10px', background: badgeBg, color: badgeColor, borderRadius: '4px', fontSize: 'var(--text-xs)', fontWeight: 700, border: badgeBorder }}>
                  {badgeText}
                </span>
              );
            })()}
            <div style={{ marginTop: 'var(--spacing-2)', textAlign: 'right' }}>
              <a href="/newsroom/scorecard" style={{ color: 'var(--color-brand-600)', fontSize: 'var(--text-sm)' }}>
                Intelligence Scorecard →
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Operational Metrics Bar */}
      <section aria-label="Pipeline metrics" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-6)' }}>
        <div style={{ padding: 'var(--spacing-3)', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>P0 Signals</div>
          <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: '#b91c1c' }}>{metrics.p0Count}</div>
        </div>
        <div style={{ padding: 'var(--spacing-3)', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>P1 Signals</div>
          <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: '#c2410c' }}>{metrics.p1Count}</div>
        </div>
        <div style={{ padding: 'var(--spacing-3)', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Active Alerts</div>
          <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>{metrics.alertVolume}</div>
        </div>
        <div style={{ padding: 'var(--spacing-3)', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Queue Backlog</div>
          <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>{metrics.queueBacklog}</div>
        </div>
        <div style={{ padding: 'var(--spacing-3)', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Primary Confirm Rate</div>
          <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-text-primary)' }}>{Math.round(metrics.primarySourceConfirmationRate * 100)}%</div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <nav aria-label="Queue tabs" style={{ display: 'flex', gap: 'var(--spacing-2)', borderBottom: '1px solid var(--color-border-subtle)', marginBottom: 'var(--spacing-4)', overflowX: 'auto' }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => { setActiveTab(tab.key); }}
              style={{
                padding: 'var(--spacing-2) var(--spacing-4)',
                border: 'none',
                background: 'transparent',
                borderBottom: isActive ? '2px solid var(--color-brand-600)' : '2px solid transparent',
                color: isActive ? 'var(--color-brand-600)' : 'var(--color-text-secondary)',
                fontWeight: isActive ? 600 : 400,
                fontSize: 'var(--text-sm)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label} <span style={{ opacity: 0.7, fontSize: '11px' }}>({tab.count})</span>
            </button>
          );
        })}
      </nav>

      {/* Queue Items List */}
      <section aria-label="Queue list">
        {activeItems.length === 0 ? (
          <div style={{ padding: 'var(--spacing-8)', textAlign: 'center', color: 'var(--color-text-muted)', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
            No signals in this queue section.
          </div>
        ) : (
          activeItems.map((item) => (
            <SignalCard key={item.id} item={item} onAction={handleAction} />
          ))
        )}
      </section>
    </div>
  );
}

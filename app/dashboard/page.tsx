'use client';

import { useState, useEffect } from 'react';
import StatsCards from '@/components/dashboard/StatsCards';
import QueueTable from '@/components/dashboard/QueueTable';
import MonitorTab from '@/components/dashboard/MonitorTab';
import MonitoringFeed from '@/components/dashboard/MonitoringFeed';
import TrendingPanel from '@/components/dashboard/TrendingPanel';
import EntityUpdates from '@/components/dashboard/EntityUpdates';
import KnowledgeGraphPanel from '@/components/dashboard/KnowledgeGraphPanel';
import AnalyticsPanel from '@/components/dashboard/AnalyticsPanel';
import FixDashboard from '@/components/dashboard/FixDashboard';
import SearchBar from '@/components/dashboard/SearchBar';
import { mockDashboardData } from '@/utils/dashboard-data';

type DashboardTab = 'overview' | 'stories' | 'research' | 'editorial' | 'publishing' | 'monitor' | 'trending' | 'entities' | 'knowledge-graph' | 'analytics' | 'the-fix';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [criticalAlerts, setCriticalAlerts] = useState(mockDashboardData.stats.criticalAlerts);

  useEffect(() => {
    async function loadMonitorStats() {
      try {
        const { bootstrapServices } = await import('@/lib/bootstrap');
        const { getServices } = await import('@/services/registry');
        bootstrapServices();
        const svc = getServices().monitoring;
        const counts = svc.getAlertCount();
        setCriticalAlerts(counts.unacknowledged);
      } catch {}
    }
    loadMonitorStats();
  }, []);

  const sidebarItems: { id: DashboardTab; label: string; icon: string; count?: number }[] = [
    { id: 'overview', label: 'Dashboard', icon: '◈' },
    { id: 'stories', label: 'Stories', icon: '📰', count: mockDashboardData.stats.storiesToday },
    { id: 'research', label: 'Research', icon: '🔍', count: mockDashboardData.stats.researchQueue },
    { id: 'editorial', label: 'Editorial', icon: '✎', count: mockDashboardData.stats.editorialQueue },
    { id: 'publishing', label: 'Publishing', icon: '📡', count: mockDashboardData.stats.publishingQueue },
    { id: 'monitor', label: 'Monitor', icon: '👁️', count: criticalAlerts },
    { id: 'trending', label: 'Trending', icon: '📈' },
    { id: 'entities', label: 'Entities', icon: '🔗' },
    { id: 'knowledge-graph', label: 'Knowledge Graph', icon: '🌐' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'the-fix', label: 'The Fix', icon: '🔧', count: mockDashboardData.stats.editorialQueue },
  ];

  function formatDate(): string {
    const now = new Date();
    return now.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  const data = mockDashboardData;

  return (
    <div
      style={{
        display: 'flex',
        minHeight: 'calc(100vh - 140px)',  // Account for header + footer
        background: 'var(--color-surface-primary)',
        fontFamily: 'var(--font-inter), system-ui, sans-serif',
      }}
    >
      {/* ─── Sidebar ─────────────────────────────── */}
      <aside
        style={{
          width: sidebarCollapsed ? '60px' : '220px',
          background: 'var(--color-surface-elevated)',
          borderRight: '1px solid var(--color-border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.2s ease',
          flexShrink: 0,
        }}
      >
        {/* Brand */}
        <div
          style={{
            padding: sidebarCollapsed ? '16px 0' : '20px 20px',
            borderBottom: '1px solid var(--color-border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: sidebarCollapsed ? 'center' : 'space-between',
            gap: '10px',
          }}
        >
          {!sidebarCollapsed && (
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-amber-500)', letterSpacing: '-0.02em' }}>
                THE BREAKDOWN
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', fontWeight: 500 }}>
                Newsroom Dashboard
              </div>
            </div>
          )}
          {sidebarCollapsed && (
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-amber-500)' }}>
              B
            </div>
          )}
          <button
            onClick={() => { setSidebarCollapsed(!sidebarCollapsed); }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-tertiary)',
              cursor: 'pointer',
              fontSize: '16px',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '8px', overflowY: 'auto' }}>
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: sidebarCollapsed ? '10px 0' : '10px 12px',
                border: 'none',
                background: activeTab === item.id ? 'color-mix(in srgb, var(--color-amber-500) 12%, transparent)' : 'transparent',
                color: activeTab === item.id ? 'var(--color-amber-500)' : 'var(--color-text-secondary)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: activeTab === item.id ? 600 : 400,
                textAlign: 'left',
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                if (activeTab !== item.id) e.currentTarget.style.background = 'var(--color-surface-secondary)';
              }}
              onMouseLeave={(e) => {
                if (activeTab !== item.id) e.currentTarget.style.background = 'transparent';
              }}
            >
              <span style={{ fontSize: '16px', flexShrink: 0 }}>{item.icon}</span>
              {!sidebarCollapsed && (
                <>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.count !== undefined && item.count > 0 && (
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: 'var(--color-text-primary)',
                        background: 'var(--color-surface-secondary)',
                        padding: '1px 7px',
                        borderRadius: '999px',
                        minWidth: '20px',
                        textAlign: 'center',
                      }}
                    >
                      {item.count}
                    </span>
                  )}
                </>
              )}
            </button>
          ))}
        </nav>

        {/* Sidebar footer */}
        {!sidebarCollapsed && (
          <div
            style={{
              padding: '12px 16px',
              borderTop: '1px solid var(--color-border-subtle)',
              fontSize: '11px',
              color: 'var(--color-text-tertiary)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-emerald-500)', display: 'inline-block' }} />
              All 13 monitors active
            </div>
            <div style={{ marginTop: '4px' }}>
              Last poll: {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        )}
      </aside>

      {/* ─── Main Content ────────────────────────── */}
      <main style={{ flex: 1, padding: '24px 28px', overflowY: 'auto', maxWidth: '1400px' }}>
        {/* Top bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
            gap: '20px',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h1
              style={{
                fontSize: '22px',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                margin: 0,
                letterSpacing: '-0.01em',
              }}
            >
              {sidebarItems.find((s) => s.id === activeTab)?.label || 'Dashboard'}
            </h1>
            <p
              style={{
                fontSize: '13px',
                color: 'var(--color-text-tertiary)',
                margin: '4px 0 0 0',
              }}
            >
              {formatDate()}
            </p>
          </div>
          <SearchBar onSearch={(q) => { console.log('Search:', q); }} />
        </div>

        {/* ─── Overview Tab ────────────────────────── */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Stats row */}
            <StatsCards stats={data.stats} />

            {/* 3-column queue row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <QueueTable items={data.researchQueue.slice(0, 3)} type="research" title="Research Queue" />
              <QueueTable items={data.editorialQueue} type="editorial-review" title="Editorial Review" />
              <QueueTable items={data.publishingQueue} type="publishing" title="Publishing Queue" />
            </div>

            {/* 2-column monitoring + trending */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px' }}>
              <MonitoringFeed alerts={data.alerts} />
              <TrendingPanel topics={data.trending.slice(0, 6)} />
            </div>

            {/* 2-column entities + KG */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '16px' }}>
              <EntityUpdates updates={data.entityUpdates} />
              <KnowledgeGraphPanel nodes={data.knowledgeGraph.nodes} edges={data.knowledgeGraph.edges} />
            </div>

            {/* Analytics */}
            <AnalyticsPanel metrics={data.analytics} />
          </div>
        )}

        {/* ─── Stories Tab ─────────────────────────── */}
        {activeTab === 'stories' && (
          <div>
            <StatsCards stats={data.stats} />
            <div style={{ marginTop: '20px' }}>
              <div
                style={{
                  background: 'var(--color-surface-elevated)',
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid var(--color-border-subtle)',
                    display: 'grid',
                    gridTemplateColumns: '3fr 1fr 1fr 1fr 80px',
                    gap: '12px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--color-text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  <span>Story</span>
                  <span>Status</span>
                  <span>Priority</span>
                  <span>Author</span>
                  <span>Score</span>
                </div>
                {data.stories.map((story) => (
                  <div
                    key={story.id}
                    style={{
                      padding: '12px 20px',
                      borderBottom: '1px solid var(--color-border-subtle)',
                      display: 'grid',
                      gridTemplateColumns: '3fr 1fr 1fr 1fr 80px',
                      gap: '12px',
                      alignItems: 'center',
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-surface-secondary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div>
                      <div style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{story.headline}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>
                        {story.slug} · v{story.version || 1}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background:
                          story.status === 'published'
                            ? 'color-mix(in srgb, var(--color-emerald-500) 15%, transparent)'
                            : story.status === 'publishing'
                            ? 'color-mix(in srgb, var(--color-amber-500) 15%, transparent)'
                            : story.status === 'editorial-review'
                            ? 'color-mix(in srgb, var(--color-blue-500) 15%, transparent)'
                            : 'color-mix(in srgb, var(--color-text-tertiary) 15%, transparent)',
                        color:
                          story.status === 'published'
                            ? 'var(--color-emerald-500)'
                            : story.status === 'publishing'
                            ? 'var(--color-amber-500)'
                            : story.status === 'editorial-review'
                            ? 'var(--color-blue-500)'
                            : 'var(--color-text-tertiary)',
                        textTransform: 'capitalize',
                      }}
                    >
                      {story.status}
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color:
                          story.priority === 'critical'
                            ? 'var(--color-rose-500)'
                            : story.priority === 'high'
                            ? 'var(--color-orange-500)'
                            : 'var(--color-text-tertiary)',
                        textTransform: 'capitalize',
                      }}
                    >
                      {story.priority}
                    </span>
                    <span style={{ color: 'var(--color-text-secondary)' }}>{story.author}</span>
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        fontFamily: 'var(--font-mono)',
                        color: story.evidenceScore && story.evidenceScore >= 90 ? 'var(--color-emerald-500)' : 'var(--color-text-secondary)',
                      }}
                    >
                      {story.evidenceScore ?? '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── Research Tab ────────────────────────── */}
        {activeTab === 'research' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <QueueTable items={data.researchQueue} type="research" title="All Research Tasks" />
            <MonitoringFeed alerts={data.alerts} />
          </div>
        )}

        {/* ─── Editorial Tab ───────────────────────── */}
        {activeTab === 'editorial' && (
          <QueueTable items={data.editorialQueue} type="editorial-review" title="All Editorial Reviews" />
        )}

        {/* ─── Publishing Tab ──────────────────────── */}
        {activeTab === 'publishing' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <QueueTable items={data.publishingQueue} type="publishing" title="All Publishing Tasks" />
            <AnalyticsPanel metrics={data.analytics} />
          </div>
        )}

        {/* ─── Monitor Tab ─────────────────────────── */}
        {activeTab === 'monitor' && (
          <MonitorTab />
        )}

        {/* ─── Trending Tab ────────────────────────── */}
        {activeTab === 'trending' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <TrendingPanel topics={data.trending} />
            <KnowledgeGraphPanel nodes={data.knowledgeGraph.nodes} edges={data.knowledgeGraph.edges} />
          </div>
        )}

        {/* ─── Entities Tab ────────────────────────── */}
        {activeTab === 'entities' && (
          <EntityUpdates updates={data.entityUpdates} />
        )}

        {/* ─── Knowledge Graph Tab ─────────────────── */}
        {activeTab === 'knowledge-graph' && (
          <KnowledgeGraphPanel nodes={data.knowledgeGraph.nodes} edges={data.knowledgeGraph.edges} />
        )}

        {/* ─── Analytics Tab ───────────────────────── */}
        {activeTab === 'analytics' && (
          <AnalyticsPanel metrics={data.analytics} />
        )}

        {/* ─── The Fix Tab ─────────────────────────── */}
        {activeTab === 'the-fix' && (
          <FixDashboard />
        )}
      </main>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import type { MonitorSummary, MonitorAlert, WatcherStatus } from '@/types/canonical';

const sourceIcons: Record<string, string> = {
  'supreme-court': '⚖️',
  pib: '📢',
  parliament: '🏛️',
  rbi: '🏦',
  who: '🦠',
  'election-commission': '🗳️',
  oecd: '📊',
  imf: '🌍',
  'world-bank': '💰',
  un: '🇺🇳',
  cag: '📋',
  'press-releases': '📄',
  'state-govts': '🏗️',
};

const severityConfig = {
  critical: { label: 'CRITICAL', color: 'var(--color-rose-500)', bg: 'color-mix(in srgb, var(--color-rose-500) 12%, transparent)' },
  major: { label: 'MAJOR', color: 'var(--color-orange-500)', bg: 'color-mix(in srgb, var(--color-orange-500) 12%, transparent)' },
  minor: { label: 'MINOR', color: 'var(--color-blue-500)', bg: 'color-mix(in srgb, var(--color-blue-500) 10%, transparent)' },
  informational: { label: 'INFO', color: 'var(--color-text-tertiary)', bg: 'transparent' },
};

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (diff < 1) return 'just now';
  if (diff < 60) return `${String(diff)}m ago`;
  const h = Math.floor(diff / 60);
  if (h < 24) return `${String(h)}h ago`;
  const d = Math.floor(h / 24);
  return `${String(d)}d ago`;
}

export default function MonitorTab() {
  const [summary, setSummary] = useState<MonitorSummary | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { bootstrapServices } = await import('@/lib/bootstrap');
        const { getServices } = await import('@/services/registry');
        bootstrapServices();
        const svc = getServices().monitoring;
        setSummary(svc.getSummary());
      } catch (e) {
        console.error('[MonitorTab] Failed to load:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>Loading monitors...</div>;
  }

  if (!summary || summary.totalWatchers === 0) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>No monitors available.</div>;
  }

  const filteredAlerts = filter === 'all'
    ? summary.recentAlerts
    : filter === 'unacknowledged'
    ? summary.recentAlerts.filter(a => !a.acknowledged)
    : summary.recentAlerts.filter(a => a.source === filter);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* ─── Summary Cards ────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        <SummaryCard label="Watchers" value={String(summary.totalWatchers)} sub={`${summary.activeWatchers} active`} color="var(--color-blue-500)" />
        <SummaryCard label="Total Alerts" value={String(summary.totalAlerts)} sub="lifetime" color="var(--color-text-primary)" />
        <SummaryCard label="Unacknowledged" value={String(summary.unacknowledgedAlerts)} sub="needs review" color="var(--color-orange-500)" />
        <SummaryCard label="Critical" value={String(summary.criticalAlerts)} sub="immediate action" color="var(--color-rose-500)" />
      </div>

      {/* ─── Watcher Status Grid ───────────────────── */}
      <div
        style={{
          background: 'var(--color-surface-elevated)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: '12px',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border-subtle)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>Source Monitors</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1px', background: 'var(--color-border-subtle)' }}>
          {summary.watcherStatuses.map((w) => (
            <WatcherCard key={w.id} watcher={w} icon={sourceIcons[w.source] || '🔔'} />
          ))}
        </div>
      </div>

      {/* ─── Alert Feed ───────────────────────────── */}
      <div
        style={{
          background: 'var(--color-surface-elevated)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: '12px',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>Alert Feed</h3>
            <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
              {summary.recentAlerts.filter(a => !a.acknowledged).length} unacknowledged
            </span>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {['all', 'unacknowledged', ...summary.watcherStatuses.map(w => w.source)].slice(0, 8).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  background: filter === f ? 'color-mix(in srgb, var(--color-amber-500) 20%, transparent)' : 'var(--color-surface-secondary)',
                  color: filter === f ? 'var(--color-amber-500)' : 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {f === 'all' ? 'All' : f === 'unacknowledged' ? 'Unread' : f.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>
        <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
          {filteredAlerts.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: '13px' }}>
              No alerts{filter !== 'all' ? ` for ${filter}` : ''}.
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <AlertRow key={alert.id} alert={alert} icon={sourceIcons[alert.source] || '🔔'} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div
      style={{
        background: 'var(--color-surface-elevated)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: '10px',
        padding: '16px 20px',
      }}
    >
      <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', fontWeight: 500, marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '28px', fontWeight: 700, color, fontFamily: 'var(--font-mono)' }}>{value}</div>
      <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>{sub}</div>
    </div>
  );
}

function WatcherCard({ watcher, icon }: { watcher: WatcherStatus; icon: string }) {
  const statusColor = watcher.status === 'active' ? 'var(--color-emerald-500)' : watcher.status === 'error' ? 'var(--color-rose-500)' : 'var(--color-text-tertiary)';
  return (
    <div style={{ padding: '14px 16px', background: 'var(--color-surface-elevated)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
        <span style={{ fontSize: '18px', flexShrink: 0 }}>{icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{watcher.name}</span>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: statusColor, display: 'inline-block', flexShrink: 0 }} />
          </div>
          <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: '2px 0', lineHeight: 1.4 }}>{watcher.description}</p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
            <span>{watcher.alertCount} alerts</span>
            {watcher.criticalAlertCount > 0 && (
              <span style={{ color: 'var(--color-rose-500)', fontWeight: 600 }}>{watcher.criticalAlertCount} critical</span>
            )}
            {watcher.lastCheckAt && <span>checked {timeAgo(watcher.lastCheckAt)}</span>}
            {!watcher.lastCheckAt && <span>never checked</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

function AlertRow({ alert, icon }: { alert: MonitorAlert; icon: string }) {
  const sv = severityConfig[alert.severity];
  return (
    <div
      style={{
        padding: '14px 20px',
        borderBottom: '1px solid var(--color-border-subtle)',
        background: alert.acknowledged ? 'transparent' : sv.bg,
        opacity: alert.acknowledged ? 0.6 : 1,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
        <span style={{ fontSize: '16px', flexShrink: 0, marginTop: '1px' }}>{icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: sv.color, fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>{sv.label}</span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{alert.title}</span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '4px 0', lineHeight: 1.4 }}>{alert.summary}</p>
          <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', display: 'flex', gap: '12px', marginTop: '6px', alignItems: 'center' }}>
            <span style={{ textTransform: 'capitalize' }}>{alert.source.replace('-', ' ')}</span>
            <span>•</span>
            <span>{timeAgo(alert.detectedAt)}</span>
            {alert.affectedStoryIds.length > 0 && (
              <>
                <span>•</span>
                <span style={{ color: sv.color }}>{alert.affectedStoryIds.length} story(ies) affected</span>
              </>
            )}
          </div>
        </div>
        <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', background: 'var(--color-surface-secondary)', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)', flexShrink: 0, marginTop: '2px' }}>
          {alert.action === 'update_and_republish' ? '↻ REPUB' : alert.action === 'update_only' ? '✎ EDIT' : alert.action === 'log_only' ? '📝 LOG' : '✕'}
        </span>
      </div>
    </div>
  );
}

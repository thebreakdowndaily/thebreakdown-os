import React from 'react';
import type { WatchlistItem } from '@/lib/intel/executive';
import { ConfidencePill } from '@/components/intel/shared/primitives';

// Governing document: Phase IV sprint brief (Editorial Watchlist).
// Ranks constituencies for editorial attention. Every entry carries a reason, an action,
// and a next step. Render only — ranking logic lives in the Executive Intelligence Service.

export function WatchlistPanel({ items }: { items: WatchlistItem[] }) {
  return (
    <section aria-label="Editorial watchlist">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
        {items.map((item) => (
          <div key={item.canonical_constituency_id} style={{ padding: 'var(--spacing-4)', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--spacing-3)', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {item.rank}. {item.constituency_name}
                </span>
                <ConfidencePill tier={item.confidence} />
              </div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-amber-500)' }}>IPI {String(item.ipi)}</div>
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-2)' }}>
              {item.region} · {item.district} · Current MLA: {item.current_mla_party} · Predicted: {item.predicted_winner} ({String(item.winner_probability)}%)
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-2)' }}>{item.reason}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-1)' }}>
              <strong>Action:</strong> {item.requiredAction}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-1)' }}>
              <strong>Next:</strong> {item.suggestedNextStep}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

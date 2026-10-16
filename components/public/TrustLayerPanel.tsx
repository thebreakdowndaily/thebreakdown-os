/**
 * ─── Public Presentation Component: TrustLayerPanel ──────────────────────────
 * Consumes strictly presentation props. Displays credibility, verification state,
 * last audit timestamp, version history, and methodology.
 */

import React from 'react';

export interface TrustLayerPanelProps {
  lastUpdated: string;
  totalClaims: number;
  verifiedClaims: number;
  primarySourcesCount: number;
  /** Render only when this exact verification label is backed by real review data. */
  verificationBadge?: string;
  /** A recorded audit outcome; omitted means no audit result is displayed. */
  auditStatus?: 'pass' | 'review' | 'fail';
  versionHistory?: Array<{ date: string; description: string }>;
}

export function TrustLayerPanel({
  lastUpdated,
  totalClaims,
  verifiedClaims,
  primarySourcesCount,
  verificationBadge,
  auditStatus,
  versionHistory = [],
}: TrustLayerPanelProps) {
  return (
    <div
      role="region"
      aria-label="Trust & Editorial Standards"
      style={{
        margin: '3rem 0 2rem 0',
        padding: '1.5rem',
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        fontSize: '0.875rem',
        color: '#334155',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        {verificationBadge ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <strong style={{ color: '#0f172a', fontWeight: 600 }}>{verificationBadge}</strong>
          </div>
        ) : null}
        <span style={{ color: '#64748b', fontSize: '0.8125rem' }}>
          Last updated: {lastUpdated}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{ padding: '0.75rem', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
          <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Verified Claims</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>{verifiedClaims} / {totalClaims}</div>
        </div>
        <div style={{ padding: '0.75rem', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
          <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Primary Sources</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>{primarySourcesCount}</div>
        </div>
        {auditStatus ? (
          <div style={{ padding: '0.75rem', backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
            <div style={{ color: '#64748b', fontSize: '0.75rem' }}>Editorial audit</div>
            <div
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: auditStatus === 'pass' ? '#047857' : auditStatus === 'fail' ? '#b91c1c' : '#92400e',
              }}
            >
              {auditStatus === 'pass' ? 'Pass' : auditStatus === 'fail' ? 'Fail' : 'Review required'}
            </div>
          </div>
        ) : null}
      </div>

      {versionHistory.length > 0 && (
        <details style={{ marginTop: '0.75rem', cursor: 'pointer' }}>
          <summary style={{ fontWeight: 500, color: '#0284c7' }}>
            Version Audit History ({versionHistory.length} updates)
          </summary>
          <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem', color: '#475569', fontSize: '0.8125rem' }}>
            {versionHistory.map((item, idx) => (
              <li key={idx} style={{ marginBottom: '0.25rem' }}>
                <strong>{item.date}:</strong> {item.description}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

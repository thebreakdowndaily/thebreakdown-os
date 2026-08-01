'use client';

/**
 * ─── Public Presentation Component: EvidenceDrawer ───────────────────────────
 * Consumes strictly EvidenceDrawerViewModel.
 * Progressive disclosure drawer with 8-tier hierarchy badges, source links,
 * confidence indicators, and claims mapping.
 */

import React, { useState } from 'react';
import type { EvidenceDrawerViewModel } from '@/lib/projections/story/StoryViewModel';

export interface EvidenceDrawerProps {
  evidenceDrawer: EvidenceDrawerViewModel;
}

export function EvidenceDrawer({ evidenceDrawer }: EvidenceDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'claims' | 'sources'>('claims');

  if (!evidenceDrawer || evidenceDrawer.totalClaimsCount === 0) {
    return (
      <div style={{ padding: '1rem', backgroundColor: '#f1f5f9', borderRadius: '6px', fontSize: '0.875rem', color: '#64748b' }}>
        Primary evidence and source citations under verification review.
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label="Verified Primary Evidence Drawer"
      style={{
        margin: '2rem 0',
        border: '1px solid #cbd5e1',
        borderRadius: '8px',
        backgroundColor: '#ffffff',
        overflow: 'hidden',
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="evidence-drawer-content"
        style={{
          width: '100%',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#f8fafc',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a' }}>
            Verified Primary Evidence Drawer
          </span>
          <span
            style={{
              fontSize: '0.75rem',
              padding: '0.2rem 0.5rem',
              borderRadius: '9999px',
              backgroundColor: '#dcfce7',
              color: '#166534',
              fontWeight: 600,
            }}
          >
            {evidenceDrawer.verifiedClaimsCount} / {evidenceDrawer.totalClaimsCount} Verified Claims
          </span>
        </div>
        <span style={{ fontSize: '0.875rem', color: '#0284c7', fontWeight: 500 }}>
          {isOpen ? '▲ Hide Drawer' : '▼ Expand Evidence'}
        </span>
      </button>

      {isOpen && (
        <div id="evidence-drawer-content" style={{ padding: '1.25rem', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
            <button
              onClick={() => setActiveTab('claims')}
              style={{
                padding: '0.5rem 1rem',
                border: 'none',
                borderBottom: activeTab === 'claims' ? '2px solid #0f172a' : 'none',
                fontWeight: activeTab === 'claims' ? 600 : 400,
                color: activeTab === 'claims' ? '#0f172a' : '#64748b',
                cursor: 'pointer',
                backgroundColor: 'transparent',
              }}
            >
              Claims ({evidenceDrawer.claims.length})
            </button>
            <button
              onClick={() => setActiveTab('sources')}
              style={{
                padding: '0.5rem 1rem',
                border: 'none',
                borderBottom: activeTab === 'sources' ? '2px solid #0f172a' : 'none',
                fontWeight: activeTab === 'sources' ? 600 : 400,
                color: activeTab === 'sources' ? '#0f172a' : '#64748b',
                cursor: 'pointer',
                backgroundColor: 'transparent',
              }}
            >
              Primary Sources ({evidenceDrawer.sources.length})
            </button>
          </div>

          {activeTab === 'claims' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {evidenceDrawer.claims.map((claim) => (
                <div
                  key={claim.id}
                  style={{
                    padding: '0.875rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: '6px',
                    borderLeft: '4px solid #0284c7',
                  }}
                >
                  <div style={{ fontSize: '0.9375rem', fontWeight: 500, color: '#1e293b', marginBottom: '0.375rem' }}>
                    "{claim.claim}"
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: '#64748b', flexWrap: 'wrap' }}>
                    <span>Confidence: <strong>{claim.confidenceScore}%</strong></span>
                    <span>Status: <strong style={{ color: '#059669' }}>{claim.verificationStatus}</strong></span>
                    {claim.sourceTitle && <span>Source: {claim.sourceTitle}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'sources' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {evidenceDrawer.sources.map((source, idx) => (
                <div
                  key={source.id || idx}
                  style={{
                    padding: '0.875rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                  }}
                >
                  <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.25rem' }}>
                    <a href={source.url} target="_blank" rel="noopener noreferrer" style={{ color: '#0284c7', textDecoration: 'underline' }}>
                      {source.title}
                    </a>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                    <span style={{ padding: '0.15rem 0.4rem', backgroundColor: '#e0f2fe', color: '#0369a1', borderRadius: '4px', marginRight: '0.5rem' }}>
                      {source.tierBadge}
                    </span>
                    Accessed: {source.accessedAt}
                  </div>
                  {source.archiveHash && (
                    <div style={{ fontSize: '0.6875rem', color: '#94a3b8', marginTop: '0.25rem', fontFamily: 'monospace' }}>
                      Archive Hash: {source.archiveHash}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

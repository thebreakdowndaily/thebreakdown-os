'use client';

/**
 * ─── Research Platform Presentation Component: ResearchWorkspaceView ──────────
 * Authenticated Research Platform workbench component for researchers, archivists,
 * and investigative scholars.
 */

import React from 'react';
import type { ResearchSession } from '@/lib/research/session';
import type { ProvenanceRecord } from '@/lib/research/provenance';
import type { GraphQueryResult } from '@/lib/research/graph-exploration';

export interface ResearchWorkspaceViewProps {
  activeSession: ResearchSession;
  provenanceRecords: ProvenanceRecord[];
  graphQuery?: GraphQueryResult;
}

export function ResearchWorkspaceView({
  activeSession,
  provenanceRecords = [],
  graphQuery,
}: ResearchWorkspaceViewProps) {
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0f172a' }}>
      <header style={{ marginBottom: '2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase' }}>
          Research Platform • Authenticated Investigative Workbench
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '0.25rem 0' }}>
          {activeSession.title}
        </h1>
        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
          Researcher ID: <strong>{activeSession.researcherId}</strong> • Topic: <strong>{activeSession.topicSlug}</strong> • Status: <span style={{ color: '#0284c7', textTransform: 'uppercase', fontWeight: 600 }}>{activeSession.status}</span>
        </div>
      </header>

      {/* Grid: Candidate Claims & Provenance Records */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
        
        {/* Candidate Claims Workbench */}
        <section style={{ padding: '1.5rem', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
            Candidate Claims ({activeSession.candidateClaims.length})
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {activeSession.candidateClaims.map((candidate) => (
              <div key={candidate.tempId} style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '6px', borderLeft: '4px solid #0284c7' }}>
                <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.25rem' }}>
                  "{candidate.claimText}"
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#475569', marginBottom: '0.5rem' }}>
                  Evidence: {candidate.candidateEvidence}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
                  <span>Confidence: {candidate.confidenceScore}%</span>
                  {candidate.suggestedSourceUrl && (
                    <a href={candidate.suggestedSourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#0284c7' }}>
                      Suggested Source →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Provenance Ledger */}
        <section style={{ padding: '1.5rem', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
            Document Provenance Ledger ({provenanceRecords.length})
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {provenanceRecords.map((record) => (
              <div key={record.documentId} style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>
                  {record.documentId}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', margin: '0.25rem 0' }}>
                  Shelf Mark: {record.archivalShelfMark || 'General Archive'}
                </div>
                <div style={{ fontSize: '0.6875rem', fontFamily: 'monospace', color: '#94a3b8', wordBreak: 'break-all' }}>
                  {record.sha256Hash}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Relational Graph Exploration Search */}
      {graphQuery && (
        <section style={{ padding: '1.5rem', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0c4a6e', marginBottom: '0.5rem' }}>
            Internal Knowledge Graph Query Result: "{graphQuery.queryTerm}"
          </h2>
          <div style={{ fontSize: '0.875rem', color: '#0369a1' }}>
            Matched Claims: {graphQuery.matchedClaims.length} | Matched Sources: {graphQuery.matchedSources.length} | Total Connected Degree: {graphQuery.totalNodeDegree}
          </div>
        </section>
      )}
    </div>
  );
}

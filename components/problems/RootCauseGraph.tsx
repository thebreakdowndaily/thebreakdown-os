'use client';

import React from 'react';
import type { Fix } from '../../types/canonical';

interface RootCauseGraphProps {
  fix: Fix;
  className?: string;
}

interface RootCauseNode {
  id: string;
  label: string;
  depth: number;
}

function parseRootCauses(rootCauses: Fix['rootCauses']): RootCauseNode[] {
  if (!rootCauses) return [];

  const title = typeof rootCauses === 'string'
    ? rootCauses
    : (rootCauses as { title?: string })?.title || '';

  const content = typeof rootCauses === 'string'
    ? ''
    : (rootCauses as { content?: string })?.content || '';

  const nodes: RootCauseNode[] = [];

  if (title) {
    const parts = title.split(/[,;]/).map(s => s.trim()).filter(Boolean);
    parts.forEach((part, i) => {
      nodes.push({ id: `root-${i}`, label: part, depth: 0 });
    });
  }

  if (content) {
    const sentences = content.split(/[.]+/).map(s => s.trim()).filter(s => s.length > 10);
    sentences.forEach((s, i) => {
      nodes.push({ id: `detail-${i}`, label: s, depth: 1 });
    });
  }

  return nodes;
}

export default function RootCauseGraph({ fix, className = '' }: RootCauseGraphProps) {
  const nodes = parseRootCauses(fix.rootCauses);

  if (nodes.length === 0) {
    return (
      <div className={`bg-[var(--color-surface-primary)] border border-[var(--color-border)] rounded-xl p-5 ${className}`}>
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-[var(--color-brand-400)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Root Causes
        </h3>
        <p className="text-xs text-[var(--color-text-tertiary)] italic">No root cause data available.</p>
      </div>
    );
  }

  const rootNodes = nodes.filter(n => n.depth === 0);
  const detailNodes = nodes.filter(n => n.depth === 1);

  return (
    <div className={`bg-[var(--color-surface-primary)] border border-[var(--color-border)] rounded-xl p-5 ${className}`}>
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
        <svg className="w-4 h-4 text-[var(--color-brand-400)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Root Cause Analysis
      </h3>

      <div className="relative">
        {/* Root causes */}
        <div className="space-y-3">
          {rootNodes.map((node, i) => (
            <div key={node.id} className="relative">
              <div className="flex items-start gap-3">
                <div className="relative z-10 shrink-0 mt-1">
                  <div className="w-3 h-3 rounded-full bg-[var(--color-brand-400)] ring-4 ring-[var(--color-brand-400)]/20" />
                  {i < rootNodes.length - 1 && (
                    <div className="absolute left-1/2 top-4 bottom-0 w-px bg-[var(--color-brand-400)]/30 -translate-x-1/2" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <span className="text-[10px] uppercase tracking-wider text-[var(--color-brand-400)] font-semibold">Root Cause</span>
                  <p className="text-sm font-medium text-[var(--color-text-primary)] mt-0.5">{node.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Divider */}
        {rootNodes.length > 0 && detailNodes.length > 0 && (
          <div className="border-t border-[var(--color-border)] my-3 ml-3" />
        )}

        {/* Detail causes */}
        <div className="space-y-2 ml-3">
          {detailNodes.map(node => (
            <div key={node.id} className="flex items-start gap-2">
              <div className="shrink-0 mt-1.5">
                <div className="w-2 h-2 rounded-full bg-[var(--color-text-tertiary)]" />
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{node.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import type { Problem } from '../../lib/problem-helpers';

interface KnowledgeConnectionsProps {
  problem: Problem;
  className?: string;
}

interface ConnectionItem {
  type: string;
  label: string;
  title: string;
  href: string;
  icon: string;
}

export default function KnowledgeConnections({ problem, className = '' }: KnowledgeConnectionsProps) {
  const connections: ConnectionItem[] = [];

  // Stories
  for (const fix of problem.fixes) {
    for (const story of fix.relatedStories || []) {
      connections.push({
        type: 'Story',
        label: 'Story',
        title: story.headline || story.title || '',
        href: `/story/${story.slug}`,
        icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z',
      });
    }
  }

  // Entities
  for (const fix of problem.fixes) {
    for (const entity of fix.relatedEntities || []) {
      connections.push({
        type: 'Entity',
        label: entity.type || 'Entity',
        title: entity.name || '',
        href: `/entity/${entity.slug}`,
        icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
      });
    }
  }

  // Actors (from responsibleActorIds)
  const allActors = new Set<string>();
  for (const fix of problem.fixes) {
    for (const actor of fix.responsibleActorIds || []) {
      allActors.add(actor);
    }
  }
  for (const actor of allActors) {
    connections.push({
      type: 'Actor',
      label: 'Responsible Actor',
      title: actor,
      href: `/fix?q=${encodeURIComponent(actor)}`,
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    });
  }

  // Beneficiaries
  const allBeneficiaries = new Set<string>();
  for (const fix of problem.fixes) {
    for (const group of fix.beneficiaryGroups || []) {
      allBeneficiaries.add(group);
    }
  }
  for (const group of allBeneficiaries) {
    connections.push({
      type: 'Beneficiary',
      label: 'Beneficiary',
      title: group,
      href: `/fix?q=${encodeURIComponent(group)}`,
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    });
  }

  if (connections.length === 0) return null;

  const grouped = connections.reduce((acc, c) => {
    if (!acc[c.type]) acc[c.type] = [];
    acc[c.type].push(c);
    return acc;
  }, {} as Record<string, ConnectionItem[]>);

  return (
    <div className={`bg-[var(--color-surface-primary)] border border-[var(--color-border)] rounded-xl p-5 ${className}`}>
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
        <svg className="w-4 h-4 text-[var(--color-brand-400)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        Knowledge Connections
      </h3>

      <div className="space-y-4">
        {Object.entries(grouped).map(([type, items]) => (
          <div key={type}>
            <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)] font-semibold">
              {type}s ({items.length})
            </span>
            <div className="mt-1.5 space-y-1.5">
              {items.slice(0, 5).map((item, i) => (
                <Link
                  key={`${item.href}-${i}`}
                  href={item.href}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-[var(--color-surface-secondary)] transition-colors group"
                >
                  <svg className="w-3.5 h-3.5 text-[var(--color-text-tertiary)] group-hover:text-[var(--color-brand-400)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-brand-400)] truncate block">
                      {item.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-[var(--color-text-tertiary)]">{item.label}</span>
                </Link>
              ))}
              {items.length > 5 && (
                <span className="text-[10px] text-[var(--color-text-tertiary)] pl-2">
                  +{items.length - 5} more
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

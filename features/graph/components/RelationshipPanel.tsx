'use client';

import { memo } from 'react';
import type { GraphNode, GraphEdge } from '@/types/canonical';
import { NODE_TYPE_COLORS, NODE_TYPE_LABELS, RELATION_LABELS } from '../types';

interface RelationshipPanelProps {
  node: GraphNode | null;
  connections: GraphEdge[];
  nodeMap: Map<string, GraphNode>;
  onNodeClick: (node: GraphNode) => void;
  onClose: () => void;
}

function getNodeHref(type: string, slug: string): string | null {
  if (!slug) return null;
  switch (type) {
    case 'story': return `/story/${slug}`;
    case 'topic': return `/topic/${slug}`;
    case 'entity': return `/entity/${slug}`;
    case 'organization': return `/organization/${slug}`;
    case 'country': return `/country/${slug}`;
    case 'person':
    case 'policy':
    case 'scheme':
    case 'budget':
    case 'report':
      return `/entity/${slug}`;
    case 'dataset': return `/dataset/${slug}`;
    case 'fix': return `/fix/${slug}`;
    case 'timeline': return `/timeline/${slug}`;
    default: return `/entity/${slug}`;
  }
}

export const RelationshipPanel = memo(function RelationshipPanel({
  node, connections, nodeMap, onNodeClick, onClose,
}: RelationshipPanelProps) {
  if (!node) return null;

  const connectedEdges = connections.filter(
    (e) => e.from === node.id || e.to === node.id,
  );

  const related = connectedEdges.map((e) => {
    const otherId = e.from === node.id ? e.to : e.from;
    const other = nodeMap.get(otherId);
    return { edge: e, other, otherId };
  }).filter((r): r is { edge: GraphEdge; other: GraphNode; otherId: string } => !!r.other);

  return (
    <div style={{
      width: 280, flexShrink: 0,
      background: 'var(--color-bg-secondary)',
      borderLeft: '1px solid var(--color-border-default)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: 'var(--spacing-3) var(--spacing-4)',
        borderBottom: '1px solid var(--color-border-default)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
          <span style={{
            width: 10, height: 10, borderRadius: '50%', display: 'inline-block',
            background: NODE_TYPE_COLORS[node.type] || '#6B7280',
          }} />
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {node.title}
          </span>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '16px', padding: 0, lineHeight: 1 }}
        >
          ✕
        </button>
      </div>

      <div style={{ padding: 'var(--spacing-2) var(--spacing-3)', fontSize: '10px', color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border-default)' }}>
        {NODE_TYPE_LABELS[node.type] || node.type} · {node.slug}
      </div>

      {getNodeHref(node.type, node.slug) && (
        <div style={{ padding: 'var(--spacing-2) var(--spacing-3)', borderBottom: '1px solid var(--color-border-default)' }}>
          <a
            href={getNodeHref(node.type, node.slug)!}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-1)',
              width: '100%', padding: 'var(--spacing-2)',
              background: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border-default)',
              borderRadius: 'var(--radius-md)', cursor: 'pointer', color: '#10B981',
              fontSize: '12px', fontWeight: 600, textDecoration: 'none', textAlign: 'center',
              transition: 'background 0.15s, border-color 0.15s',
            }}
          >
            Explore Canonical Page ↗
          </a>
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--spacing-2)' }}>
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)', padding: 'var(--spacing-1) var(--spacing-2)', marginBottom: 'var(--spacing-1)' }}>
          Connections ({related.length})
        </div>
        {related.map((r, i) => (
            <button
              key={i}
              onClick={() => { onNodeClick(r.other); }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)',
                padding: 'var(--spacing-1-5) var(--spacing-2)',
                background: 'none', border: 'none', borderRadius: 'var(--radius-md)',
                cursor: 'pointer', color: 'var(--color-text-primary)', fontSize: '12px',
                textAlign: 'left', transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-bg-tertiary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
            >
              <span style={{
                width: 8, height: 8, borderRadius: '50%', display: 'inline-block', flexShrink: 0,
                background: NODE_TYPE_COLORS[r.other.type] || '#6B7280',
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.other.title}</div>
                <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>
                  {RELATION_LABELS[r.edge.relation] || r.edge.relation.replace(/_/g, ' ')} · {Math.round(r.edge.confidence * 100)}%
                </div>
              </div>
            </button>
          ))}
        {related.length === 0 && (
          <div style={{ padding: 'var(--spacing-4)', textAlign: 'center', fontSize: '12px', color: 'var(--color-text-muted)' }}>
            No direct connections
          </div>
        )}
      </div>
    </div>
  );
});

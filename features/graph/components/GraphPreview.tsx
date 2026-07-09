'use client';

import { useMemo } from 'react';
import type { GraphNode, GraphEdge } from '@/types/canonical';
import dynamic from 'next/dynamic';

const KnowledgeGraph = dynamic(() => import('./KnowledgeGraph').then(mod => mod.KnowledgeGraph), {
  ssr: false,
  loading: () => (
    <div style={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border-default)', color: 'var(--color-text-secondary)' }}>
      Loading knowledge graph...
    </div>
  )
});
interface GraphPreviewProps {
  centerNode?: GraphNode;
  connections: Array<{ node: GraphNode; edge: GraphEdge }>;
  allNodes?: GraphNode[];
  allEdges?: GraphEdge[];
  height?: number;
  title?: string;
}

export function GraphPreview({
  centerNode, connections, allNodes: extraNodes, allEdges: extraEdges,
  height = 350, title,
}: GraphPreviewProps) {
  const { nodes, edges } = useMemo(() => {
    const nodeMap = new Map<string, GraphNode>();
    const edgeArr: GraphEdge[] = [];
    const edgeSet = new Set<string>();

    if (centerNode) {
      nodeMap.set(centerNode.id, centerNode);
    }

    for (const c of connections) {
      if (!nodeMap.has(c.node.id)) {
        nodeMap.set(c.node.id, c.node);
      }
      const key = [centerNode?.id, c.node.id].sort().join('|');
      if (!edgeSet.has(key)) {
        edgeSet.add(key);
        edgeArr.push(c.edge);
      }
    }

    if (extraNodes) {
      for (const n of extraNodes) {
        if (!nodeMap.has(n.id)) nodeMap.set(n.id, n);
      }
    }
    if (extraEdges) {
      for (const e of extraEdges) {
        const key = [e.from, e.to].sort().join('|');
        if (!edgeSet.has(key)) {
          edgeSet.add(key);
          edgeArr.push(e);
        }
      }
    }

    return { nodes: Array.from(nodeMap.values()), edges: edgeArr };
  }, [centerNode, connections, extraNodes, extraEdges]);

  if (nodes.length === 0) return null;

  return (
    <section style={{ marginBottom: 'var(--spacing-8)' }}>
      {title && (
        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 'var(--spacing-3)' }}>
          {title}
          <span style={{ marginLeft: 'var(--spacing-2)', fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 400 }}>
            {nodes.length} nodes · {edges.length} connections
          </span>
        </h2>
      )}
      <KnowledgeGraph
        nodes={nodes}
        edges={edges}
        width={700}
        height={height}
        showLegend={false}
        showFilters={false}
        showToolbar={false}
        showMiniMap={false}
        showPanel={false}
        mini
      />
    </section>
  );
}

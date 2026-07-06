'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import ForceGraph from './ForceGraph';
import type { GraphNode, GraphEdge } from '@/lib/graph/graphTypes';

interface TrendingGraphMiniProps {
  connections: Array<{
    from: GraphNode;
    to: GraphNode;
  }>;
}

export default function TrendingGraphMini({ connections: conns }: TrendingGraphMiniProps) {
  const { nodes, edges } = useMemo(() => {
    const nodeMap = new Map<string, GraphNode>();
    const edgeArr: GraphEdge[] = [];
    const edgeSet = new Set<string>();

    for (const c of conns) {
      if (!nodeMap.has(c.from.id)) nodeMap.set(c.from.id, c.from);
      if (!nodeMap.has(c.to.id)) nodeMap.set(c.to.id, c.to);
      const key = [c.from.id, c.to.id].sort().join('|');
      if (!edgeSet.has(key)) {
        edgeSet.add(key);
        edgeArr.push({ from: c.from.id, to: c.to.id, relation: 'related_to', confidence: 80 });
      }
    }

    return { nodes: Array.from(nodeMap.values()), edges: edgeArr };
  }, [conns]);

  if (nodes.length === 0) return null;

  return (
    <section aria-label="Trending connections" className="py-8 sm:py-10">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg sm:text-xl font-bold text-[#F5F5F5]">Trending Connections</h2>
        <Link
          href="/graph"
          className="text-xs text-[#D4A843] hover:text-[#D4A843]/80 transition-colors"
        >
          Explore full graph &rarr;
        </Link>
      </div>
      <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl overflow-hidden">
        <ForceGraph
          nodes={nodes}
          edges={edges}
          width={900}
          height={320}
          mini
        />
      </div>
    </section>
  );
}

'use client';

import { useState, useMemo } from 'react';
import ForceGraph from './ForceGraph';
import type { GraphNode, GraphEdge } from '@/lib/graph/graphTypes';
import type { ConnectedNode } from '@/lib/graph/graphQueries';

interface GraphMiniProps {
  title?: string;
  connections: ConnectedNode[];
  centerNode?: GraphNode;
}

export default function GraphMini({ title = 'Knowledge Graph', connections: conns, centerNode }: GraphMiniProps) {
  const [highlighted, setHighlighted] = useState<string | null>(null);

  const { nodes, edges } = useMemo(() => {
    const nodeMap = new Map<string, GraphNode>();
    const edgeArr: GraphEdge[] = [];
    const edgeSet = new Set<string>();

    if (centerNode) {
      nodeMap.set(centerNode.id, centerNode);
    }

    for (const c of conns) {
      if (!nodeMap.has(c.node.id)) {
        nodeMap.set(c.node.id, c.node);
      }
      // Add edge from center to this node
      if (centerNode) {
        const key = [centerNode.id, c.node.id].sort().join('|');
        if (!edgeSet.has(key)) {
          edgeSet.add(key);
          edgeArr.push(c.edge);
        }
      }
    }

    return { nodes: Array.from(nodeMap.values()), edges: edgeArr };
  }, [conns, centerNode]);

  if (nodes.length === 0) return null;

  return (
    <section aria-label={title} className="py-6 sm:py-8">
      <h2 className="text-lg sm:text-xl font-bold text-[#F5F5F5] mb-3">
        {title}
        <span className="ml-2 text-xs text-[#D4A843] align-top">&#9733;&#9733;&#9733;</span>
      </h2>
      <p className="text-xs text-[#A1A1AA] mb-4">
        Click any node to explore. Drag to rearrange.
      </p>
      <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl overflow-hidden">
        <ForceGraph
          nodes={nodes}
          edges={edges}
          width={700}
          height={350}
          highlighted={highlighted}
          onNodeClick={(node) => {
            setHighlighted(node.id === highlighted ? null : node.id);
          }}
          mini
        />
      </div>
    </section>
  );
}

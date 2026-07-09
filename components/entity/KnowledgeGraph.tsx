import React from 'react';
import ExploreConnections from '@/components/graph/ExploreConnections';
import type { GraphNode } from '@/types/canonical';

interface KnowledgeGraphProps {
  nodes: GraphNode[];
}

export default function KnowledgeGraph({ nodes }: KnowledgeGraphProps) {
  if (nodes.length === 0) return null;
  return (
    <section aria-label="Knowledge graph" className="py-6 sm:py-8">
      <h2 className="text-lg sm:text-xl font-bold text-[#F5F5F5] mb-5">
        Knowledge Graph
        <span className="ml-2 text-xs text-[#D4A843] align-top">&#9733;&#9733;&#9733;</span>
      </h2>
      <ExploreConnections
        title="Explore Connections"
        nodes={nodes}
      />
    </section>
  );
}

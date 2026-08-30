'use client';

import React from 'react';
import { EvidenceGraph, EvidenceGraphNode } from '@/lib/graph/evidence-graph';

interface EvidenceGraphVisualizerProps {
  graph: EvidenceGraph;
  claimId?: string;
}

export function EvidenceGraphVisualizer({ graph, claimId }: EvidenceGraphVisualizerProps) {
  const stories = graph.nodes.filter(n => n.type === 'story');
  const claims = graph.nodes.filter(n => n.type === 'claim');
  const evidence = graph.nodes.filter(n => n.type === 'evidence');
  const sources = graph.nodes.filter(n => n.type === 'source');

  const getNodeColor = (node: EvidenceGraphNode) => {
    if (node.type === 'story') return 'border-purple-500 text-purple-700 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-300';
    if (node.type === 'claim') {
      if ('status' in node) {
        if (node.status === 'verified' || node.status === 'true') return 'border-emerald-500 text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-300';
        if (node.status === 'misleading' || node.status === 'false') return 'border-amber-500 text-amber-700 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-300';
      }
      return 'border-gray-500 text-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-gray-300';
    }
    if (node.type === 'evidence') return 'border-slate-500 text-slate-700 bg-slate-50 dark:bg-slate-900/20 dark:text-slate-300';
    if (node.type === 'source') return 'border-sky-500 text-sky-700 bg-sky-50 dark:bg-sky-900/20 dark:text-sky-300';
    return 'border-gray-300 text-gray-700 bg-white dark:bg-gray-800 dark:text-gray-200';
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900 overflow-x-auto">
      <h2 className="text-xl font-bold mb-4 dark:text-white">
        {claimId ? `Claim Lineage: ${claimId}` : 'Evidence Graph'}
      </h2>
      <div className="flex flex-col md:flex-row gap-8 min-w-max">
        
        {/* Stories Column */}
        <div className="flex flex-col gap-4">
          <h3 className="font-semibold text-lg dark:text-gray-300 border-b pb-2">Stories ({stories.length})</h3>
          {stories.map(node => (
            <div key={node.id} className={`p-3 border rounded shadow-sm ${getNodeColor(node)}`}>
              <div className="text-xs uppercase font-bold opacity-75 mb-1">{node.type}</div>
              <div className="text-sm">{node.label}</div>
            </div>
          ))}
        </div>

        {/* Claims Column */}
        <div className="flex flex-col gap-4">
          <h3 className="font-semibold text-lg dark:text-gray-300 border-b pb-2">Claims ({claims.length})</h3>
          {claims.map(node => (
            <div key={node.id} className={`p-3 border rounded shadow-sm max-w-xs ${getNodeColor(node)}`}>
              <div className="text-xs uppercase font-bold opacity-75 mb-1">{node.type}</div>
              <div className="text-sm">{node.label}</div>
              {'status' in node && (
                <div className="text-xs mt-2 italic capitalize opacity-75">Status: {node.status}</div>
              )}
            </div>
          ))}
        </div>

        {/* Evidence Column */}
        <div className="flex flex-col gap-4">
          <h3 className="font-semibold text-lg dark:text-gray-300 border-b pb-2">Evidence ({evidence.length})</h3>
          {evidence.map(node => (
            <div key={node.id} className={`p-3 border rounded shadow-sm max-w-xs ${getNodeColor(node)}`}>
              <div className="text-xs uppercase font-bold opacity-75 mb-1">{node.type}</div>
              <div className="text-sm line-clamp-4">{node.label}</div>
            </div>
          ))}
        </div>

        {/* Sources Column */}
        <div className="flex flex-col gap-4">
          <h3 className="font-semibold text-lg dark:text-gray-300 border-b pb-2">Sources ({sources.length})</h3>
          {sources.map(node => (
            <div key={node.id} className={`p-3 border rounded shadow-sm max-w-xs ${getNodeColor(node)}`}>
              <div className="text-xs uppercase font-bold opacity-75 mb-1">{node.type}</div>
              <div className="text-sm">{node.label}</div>
              {'url' in node && node.url && (
                <a href={node.url} className="text-xs mt-1 underline truncate block" target="_blank" rel="noreferrer">
                  {node.url}
                </a>
              )}
            </div>
          ))}
        </div>

      </div>

      <div className="mt-8 pt-4 border-t dark:border-gray-700">
        <h3 className="font-semibold text-lg mb-2 dark:text-white">Connections ({graph.edges.length})</h3>
        <div className="text-xs font-mono text-gray-600 dark:text-gray-400 max-h-48 overflow-y-auto">
          {graph.edges.map((edge, i) => (
            <div key={i} className="mb-1">
              <span className="text-blue-500">{edge.source}</span>
              <span className="mx-2 text-gray-400">-[{edge.type}]-&gt;</span>
              <span className="text-green-500">{edge.target}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

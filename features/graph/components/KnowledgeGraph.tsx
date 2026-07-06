'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import type { GraphNode, GraphEdge } from '@/types/canonical';
import { GraphCanvas } from './GraphCanvas';
import { GraphLegend } from './GraphLegend';
import { GraphFilters } from './GraphFilters';
import { GraphToolbar } from './GraphToolbar';
import { MiniMap } from './MiniMap';
import { RelationshipPanel } from './RelationshipPanel';
import type { GraphFilterState, ViewportState } from '../types';
import { createDefaultFilters } from '../types';

interface KnowledgeGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  width?: number;
  height?: number;
  showLegend?: boolean;
  showFilters?: boolean;
  showToolbar?: boolean;
  showMiniMap?: boolean;
  showPanel?: boolean;
  mini?: boolean;
}

export function KnowledgeGraph({
  nodes: allNodes, edges: allEdges,
  width = 1100, height = 650,
  showLegend = true, showFilters = true, showToolbar = true,
  showMiniMap = true, showPanel = true,
  mini = false,
}: KnowledgeGraphProps) {
  const [filters, setFilters] = useState<GraphFilterState>(createDefaultFilters());
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [viewport, setViewport] = useState<ViewportState>({ x: 0, y: 0, scale: 1 });
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const activeTypes = useMemo(() => {
    const types: string[] = [];
    for (const [type, active] of Object.entries(filters)) {
      if (active) types.push(type);
    }
    return types;
  }, [filters]);

  const filteredNodes = useMemo(() => {
    let nodes = allNodes.filter((n) => activeTypes.includes(n.type));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      nodes = nodes.filter((n) => n.title.toLowerCase().includes(q) || n.id.toLowerCase().includes(q));
    }
    return nodes;
  }, [allNodes, activeTypes, searchQuery]);

  const filteredEdges = useMemo(() => {
    const ids = new Set(filteredNodes.map((n) => n.id));
    return allEdges.filter((e) => ids.has(e.from) && ids.has(e.to));
  }, [allEdges, filteredNodes]);

  const nodeMap = useMemo(() => {
    const m = new Map<string, GraphNode>();
    for (const n of allNodes) m.set(n.id, n);
    return m;
  }, [allNodes]);

  const handleToggleFilter = useCallback((type: keyof GraphFilterState) => {
    setFilters((prev) => ({ ...prev, [type]: !prev[type] }));
  }, []);

  const handleNodeClick = useCallback((node: GraphNode) => {
    if (!showPanel || mini) {
      setHighlighted(node.id === highlighted ? null : node.id);
      return;
    }
    if (selectedNode?.id === node.id) {
      setSelectedNode(null);
      setHighlighted(null);
    } else {
      setSelectedNode(node);
      setHighlighted(node.id);
    }
  }, [highlighted, selectedNode, showPanel, mini]);

  const handleNodeHover = useCallback((node: GraphNode | null) => {
    if (node && !selectedNode) {
      setHighlighted(node.id);
    } else if (!node && !selectedNode) {
      setHighlighted(null);
    }
  }, [selectedNode]);

  const handlePanelNodeClick = useCallback((node: GraphNode) => {
    setSelectedNode(node);
    setHighlighted(node.id);
  }, []);

  const zoomIn = useCallback(() => {
    setViewport((v) => ({ ...v, scale: Math.min(4, v.scale * 1.3) }));
  }, []);

  const zoomOut = useCallback(() => {
    setViewport((v) => ({ ...v, scale: Math.max(0.2, v.scale / 1.3) }));
  }, []);

  const resetView = useCallback(() => {
    setViewport({ x: 0, y: 0, scale: 1 });
  }, []);

  const fitToScreen = useCallback(() => {
    setViewport({ x: 0, y: 0, scale: 1 });
  }, []);

  const handleMiniMapNavigate = useCallback((x: number, y: number) => {
    setViewport((v) => ({ ...v, x: -x * v.scale + width / 2, y: -y * v.scale + height / 2 }));
  }, [width, height]);

  const layoutNodes = useMemo(() => {
    return filteredNodes.map((n) => ({ id: n.id, x: 0, y: 0, vx: 0, vy: 0 }));
  }, [filteredNodes]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--color-bg-primary)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border-default)', overflow: 'hidden' }}>
      {showToolbar && (
        <GraphToolbar
          viewport={viewport}
          searchQuery={searchQuery}
          onSearch={setSearchQuery}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onReset={resetView}
          onFit={fitToScreen}
          mini={mini}
        />
      )}

      {showFilters && !mini && (
        <div style={{ padding: 'var(--spacing-2) var(--spacing-3)', borderBottom: '1px solid var(--color-border-default)' }}>
          <GraphFilters filters={filters} onToggle={handleToggleFilter} />
        </div>
      )}

      {showLegend && !mini && (
        <div style={{ padding: 'var(--spacing-1-5) var(--spacing-3)', borderBottom: '1px solid var(--color-border-default)' }}>
          <GraphLegend />
        </div>
      )}

      <div ref={containerRef} style={{ display: 'flex', flex: 1, minHeight: 0, position: 'relative' }}>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <GraphCanvas
            nodes={filteredNodes}
            edges={filteredEdges}
            width={width}
            height={height}
            highlighted={highlighted}
            mini={mini}
            onNodeClick={handleNodeClick}
            onNodeHover={handleNodeHover}
          />
        </div>

        {showPanel && !mini && selectedNode && (
          <RelationshipPanel
            node={selectedNode}
            connections={allEdges}
            nodeMap={nodeMap}
            onNodeClick={handlePanelNodeClick}
            onClose={() => { setSelectedNode(null); setHighlighted(null); }}
          />
        )}

        {showMiniMap && !mini && (
          <MiniMap
            layoutNodes={layoutNodes}
            nodeMap={nodeMap}
            viewport={viewport}
            width={width}
            height={height}
            onNavigate={handleMiniMapNavigate}
          />
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useRef, useCallback, useEffect, useMemo, memo } from 'react';
import type { GraphNode, GraphEdge } from '@/types/canonical';
import { GraphNode as GraphNodeComponent } from './GraphNode';
import { GraphEdge as GraphEdgeComponent } from './GraphEdge';
import type { ViewportState, LayoutNode } from '../types';

const NODE_RADIUS = 8;

function runForceSimulation(
  inputNodes: GraphNode[],
  inputEdges: GraphEdge[],
  width: number,
  height: number,
  mini: boolean,
): LayoutNode[] {
  const centerX = width / 2;
  const centerY = height / 2;
  const count = inputNodes.length;
  const angleStep = (2 * Math.PI) / Math.max(count, 1);
  const radius = Math.min(width, height) * 0.35;

  const nodes: LayoutNode[] = inputNodes.map((n, i) => {
    const angle = i * angleStep - Math.PI / 2;
    return {
      id: n.id,
      x: centerX + radius * Math.cos(angle) + (Math.random() - 0.5) * 50,
      y: centerY + radius * Math.sin(angle) + (Math.random() - 0.5) * 50,
      vx: 0,
      vy: 0,
    };
  });

  const maxIterations = 120;
  for (let iteration = 0; iteration < maxIterations; iteration++) {
    const repulsion = mini ? 500 : 800;
    const attraction = mini ? 0.005 : 0.008;
    const damping = 0.85;
    const centerForce = mini ? 0.01 : 0.005;

    for (const n of nodes) { n.vx = 0; n.vy = 0; }

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[j].x - nodes[i].x;
        const dy = nodes[j].y - nodes[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = repulsion / (dist * dist);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        nodes[i].vx -= fx;
        nodes[i].vy -= fy;
        nodes[j].vx += fx;
        nodes[j].vy += fy;
      }
    }

    const edgeSet = new Set<string>();
    for (const e of inputEdges) {
      const key = [e.from, e.to].sort().join('|');
      if (edgeSet.has(key)) continue;
      edgeSet.add(key);
      const si = nodes.findIndex((n) => n.id === e.from);
      const ti = nodes.findIndex((n) => n.id === e.to);
      if (si === -1 || ti === -1) continue;
      const dx = nodes[ti].x - nodes[si].x;
      const dy = nodes[ti].y - nodes[si].y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = dist * attraction;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      nodes[si].vx += fx;
      nodes[si].vy += fy;
      nodes[ti].vx -= fx;
      nodes[ti].vy -= fy;
    }

    for (const n of nodes) {
      n.vx += (centerX - n.x) * centerForce;
      n.vy += (centerY - n.y) * centerForce;
      n.vx *= damping;
      n.vy *= damping;
      n.x += n.vx;
      n.y += n.vy;
      n.x = Math.max(40, Math.min(width - 40, n.x));
      n.y = Math.max(40, Math.min(height - 40, n.y));
    }
  }

  return nodes;
}

interface GraphCanvasProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  width: number;
  height: number;
  highlighted: string | null;
  mini?: boolean;
  onNodeClick?: (node: GraphNode) => void;
  onNodeHover?: (node: GraphNode | null) => void;
}

export const GraphCanvas = memo(function GraphCanvas({
  nodes: inputNodes, edges: inputEdges,
  width, height, highlighted, mini = false,
  onNodeClick, onNodeHover,
}: GraphCanvasProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [viewport, setViewport] = useState<ViewportState>({ x: 0, y: 0, scale: 1 });
  const [dragging, setDragging] = useState(false);
  const [dragNode, setDragNode] = useState<string | null>(null);
  const [showLabels, setShowLabels] = useState(true);
  const [layoutNodes, setLayoutNodes] = useState<LayoutNode[]>([]);
  const dragStart = useRef({ x: 0, y: 0, nodeX: 0, nodeY: 0 });

  const nodeMap = useMemo(() => {
    const m = new Map<string, GraphNode>();
    for (const n of inputNodes) m.set(n.id, n);
    return m;
  }, [inputNodes]);

  const edgeMap = useMemo(() => {
    const m = new Map<string, string[]>();
    for (const e of inputEdges) {
      const from = m.get(e.from) || [];
      const to = m.get(e.to) || [];
      from.push(e.to);
      to.push(e.from);
      m.set(e.from, from);
      m.set(e.to, to);
    }
    return m;
  }, [inputEdges]);

  const connectedIds = useMemo(() => {
    if (!highlighted) return new Set<string>();
    const s = new Set<string>([highlighted]);
    const neighbors = edgeMap.get(highlighted) || [];
    for (const nid of neighbors) s.add(nid);
    return s;
  }, [highlighted, edgeMap]);

  const layoutRef = useRef<LayoutNode[]>([]);

  useEffect(() => {
    const result = runForceSimulation(inputNodes, inputEdges, width, height, mini);
    layoutRef.current = result;
    setLayoutNodes(result);
  }, [inputNodes, inputEdges, width, height, mini]);

  const handleNodeMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setDragNode(nodeId);
    const node = layoutRef.current.find((n) => n.id === nodeId);
    if (node) {
      dragStart.current = { x: e.clientX, y: e.clientY, nodeX: node.x, nodeY: node.y };
    }
  }, []);

  const handleNodeMouseUp = useCallback((_e: React.MouseEvent, nodeId: string) => {
    if (dragging || dragNode) {
      setDragNode(null);
      return;
    }
    const node = nodeMap.get(nodeId);
    if (node && onNodeClick) onNodeClick(node);
  }, [dragging, dragNode, nodeMap, onNodeClick]);

  const handleNodeEnter = useCallback((id: string) => {
    setHoveredNode(id);
    if (onNodeHover) {
      const node = nodeMap.get(id);
      if (node) onNodeHover(node);
    }
  }, [nodeMap, onNodeHover]);

  const handleNodeLeave = useCallback(() => {
    setHoveredNode(null);
    if (onNodeHover) onNodeHover(null);
  }, [onNodeHover]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const scaleBy = e.deltaY > 0 ? 0.9 : 1.1;
    setViewport((v) => ({ ...v, scale: Math.max(0.2, Math.min(4, v.scale * scaleBy)) }));
  }, []);

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, nodeX: viewport.x, nodeY: viewport.y };
  }, [viewport]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragNode) {
      const node = layoutRef.current.find((n) => n.id === dragNode);
      if (!node) return;
      const dx = (e.clientX - dragStart.current.x) / viewport.scale;
      const dy = (e.clientY - dragStart.current.y) / viewport.scale;
      node.x = dragStart.current.nodeX + dx;
      node.y = dragStart.current.nodeY + dy;
      return;
    }
    if (dragging) {
      setViewport((v) => ({
        ...v,
        x: v.x + (e.clientX - dragStart.current.x),
        y: v.y + (e.clientY - dragStart.current.y),
      }));
      dragStart.current = { x: e.clientX, y: e.clientY, nodeX: 0, nodeY: 0 };
    }
  }, [dragging, dragNode, viewport.scale]);

  const endDrag = useCallback(() => {
    setDragging(false);
    setDragNode(null);
  }, []);

  useEffect(() => {
    if (mini) return;
    setShowLabels(viewport.scale >= 0.5);
  }, [viewport.scale, mini]);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${String(width)} ${String(height)}`}
      style={{ display: 'block', background: '#0A0A0A', cursor: dragging ? 'grabbing' : 'grab', userSelect: 'none' }}
      onWheel={handleWheel}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={endDrag}
      onMouseLeave={endDrag}
    >
      <g transform={`translate(${String(viewport.x)}, ${String(viewport.y)}) scale(${String(viewport.scale)})`}>
        {inputEdges.map((edge, i) => {
          const source = layoutNodes.find((n) => n.id === edge.from);
          const target = layoutNodes.find((n) => n.id === edge.to);
          const isHighlighted = !!highlighted && (edge.from === highlighted || edge.to === highlighted);
          const isDimmed = !!highlighted && !isHighlighted;
          return (
            <GraphEdgeComponent
              key={`edge-${String(i)}`}
              edge={edge}
              sourceNode={source}
              targetNode={target}
              isHighlighted={isHighlighted}
              isDimmed={isDimmed}
              mini={mini}
            />
          );
        })}
        {layoutNodes.map((ln) => {
          const orig = nodeMap.get(ln.id);
          if (!orig) return null;
          const isHovered = hoveredNode === ln.id;
          const isHighlighted = highlighted ? connectedIds.has(ln.id) : true;
          const isDimmed = highlighted ? !isHighlighted : false;
          return (
            <GraphNodeComponent
              key={ln.id}
              node={ln}
              type={orig.type}
              title={orig.title}
              isHovered={isHovered}
              isDimmed={isDimmed}
              radius={NODE_RADIUS}
              onMouseDown={handleNodeMouseDown}
              onMouseUp={handleNodeMouseUp}
              onMouseEnter={handleNodeEnter}
              onMouseLeave={handleNodeLeave}
              mini={mini || !showLabels}
            />
          );
        })}
      </g>
    </svg>
  );
});

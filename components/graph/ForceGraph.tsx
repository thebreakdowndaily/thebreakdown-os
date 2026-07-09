'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import type { GraphNode, GraphEdge, NodeType, RelationType } from '@/lib/graph/graphTypes';

interface LayoutNode extends GraphNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface LayoutEdge extends GraphEdge {
  source: string;
  target: string;
}

const NODE_RADIUS = 8;
const LABEL_OFFSET = 14;

const TYPE_COLORS: Record<string, string> = {
  story: '#3B82F6',
  topic: '#D4A843',
  entity: '#A855F7',
  organization: '#8B5CF6',
  country: '#F43F5E',
  person: '#06B6D4',
  policy: '#22C55E',
  scheme: '#10B981',
  budget: '#F59E0B',
  report: '#6B7280',
  source: '#6366F1',
  dataset: '#EC4899',
  fix: '#14B8A6',
  event: '#F97316',
};

const TYPE_LABELS: Record<string, string> = {
  story: 'Story', topic: 'Topic', entity: 'Entity',
  organization: 'Org', country: 'Country', person: 'Person',
  policy: 'Policy', scheme: 'Scheme', budget: 'Budget',
  report: 'Report', source: 'Source', dataset: 'Dataset',
  fix: 'The Fix', event: 'Event',
};

const typeHref: Record<string, (slug: string) => string> = {
  story: (s) => `/story/${s}`, topic: (s) => `/topic/${s}`,
  entity: (s) => `/entity/${s}`, organization: (s) => `/entity/${s}`,
  country: (s) => `/entity/${s}`, person: (s) => `/entity/${s}`,
  policy: (s) => `/entity/${s}`, scheme: (s) => `/entity/${s}`,
  budget: (s) => `/entity/${s}`, report: (s) => `/entity/${s}`,
};

interface ForceGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  width?: number;
  height?: number;
  highlighted?: string | null;
  onNodeClick?: (node: GraphNode) => void;
  mini?: boolean;
}

export default function ForceGraph({
  nodes: inputNodes,
  edges: inputEdges,
  width = 800,
  height = 500,
  highlighted,
  onNodeClick,
  mini = false,
}: ForceGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const animRef = useRef<number | null>(null);
  const [layoutNodes, setLayoutNodes] = useState<LayoutNode[]>([]);
  const layoutRef = useRef<LayoutNode[]>([]);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [dragging, setDragging] = useState(false);
  const [dragNode, setDragNode] = useState<string | null>(null);
  const dragStart = useRef({ x: 0, y: 0, nodeX: 0, nodeY: 0 });

  // Edge lookup map
  const edgeMap = useMemo(() => {
    const m = new Map<string, LayoutEdge[]>();
    for (const e of inputEdges) {
      const fromKey = e.from;
      const toKey = e.to;
      if (!m.has(fromKey)) m.set(fromKey, []);
      if (!m.has(toKey)) m.set(toKey, []);
      m.get(fromKey)!.push({ ...e, source: e.from, target: e.to });
      m.get(toKey)!.push({ ...e, source: e.from, target: e.to });
    }
    return m;
  }, [inputEdges]);

  const nodeMap = useMemo(() => {
    const m = new Map<string, GraphNode>();
    for (const n of inputNodes) m.set(n.id, n);
    return m;
  }, [inputNodes]);

  // Initialize layout positions
  useEffect(() => {
    const centerX = width / 2;
    const centerY = height / 2;
    const count = inputNodes.length;
    const angleStep = (2 * Math.PI) / Math.max(count, 1);

    const initial: LayoutNode[] = inputNodes.map((n, i) => {
      // Arrange in a circle initially
      const angle = i * angleStep - Math.PI / 2;
      const radius = Math.min(width, height) * 0.35;
      return {
        ...n,
        x: centerX + radius * Math.cos(angle) + (Math.random() - 0.5) * 50,
        y: centerY + radius * Math.sin(angle) + (Math.random() - 0.5) * 50,
        vx: 0,
        vy: 0,
      };
    });
    layoutRef.current = initial;
    setLayoutNodes(initial);

    // Run force simulation
    let iteration = 0;
    const maxIterations = 120;

    function simulate() {
      if (iteration >= maxIterations) return;
      iteration++;

      const nodes = layoutRef.current;
      const repulsion = mini ? 500 : 800;
      const attraction = mini ? 0.005 : 0.008;
      const damping = 0.85;
      const centerForce = mini ? 0.01 : 0.005;

      // Reset forces
      for (const n of nodes) { n.vx = 0; n.vy = 0; }

      // Repulsion between all nodes
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

      // Attraction along edges
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

      // Center force
      for (const n of nodes) {
        n.vx += (centerX - n.x) * centerForce;
        n.vy += (centerY - n.y) * centerForce;
        n.vx *= damping;
        n.vy *= damping;
        n.x += n.vx;
        n.y += n.vy;
        // Keep in bounds
        n.x = Math.max(40, Math.min(width - 40, n.x));
        n.y = Math.max(40, Math.min(height - 40, n.y));
      }

      setLayoutNodes([...nodes]);
      animRef.current = requestAnimationFrame(simulate);
    }

    animRef.current = requestAnimationFrame(simulate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [inputNodes, inputEdges, width, height, mini]);

  // Handle SVG zoom/pan
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const scaleBy = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform((t) => ({
      ...t,
      scale: Math.max(0.2, Math.min(4, t.scale * scaleBy)),
    }));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent, nodeId?: string) => {
    if (nodeId) {
      setDragNode(nodeId);
      const node = layoutRef.current.find((n) => n.id === nodeId);
      if (node) {
        dragStart.current = { x: e.clientX, y: e.clientY, nodeX: node.x, nodeY: node.y };
      }
      return;
    }
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, nodeX: transform.x, nodeY: transform.y };
  }, [transform]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragNode) {
      const node = layoutRef.current.find((n) => n.id === dragNode);
      if (node) {
        const dx = (e.clientX - dragStart.current.x) / transform.scale;
        const dy = (e.clientY - dragStart.current.y) / transform.scale;
        node.x = dragStart.current.nodeX + dx;
        node.y = dragStart.current.nodeY + dy;
        setLayoutNodes([...layoutRef.current]);
      }
      return;
    }
    if (dragging) {
      setTransform((t) => ({
        ...t,
        x: t.x + (e.clientX - dragStart.current.x),
        y: t.y + (e.clientY - dragStart.current.y),
      }));
      dragStart.current = { x: e.clientX, y: e.clientY, nodeX: 0, nodeY: 0 };
    }
  }, [dragging, dragNode, transform.scale]);

  const handleMouseUp = useCallback(() => {
    setDragging(false);
    setDragNode(null);
  }, []);

  const handleNodeClick = useCallback((node: GraphNode) => {
    if (onNodeClick) { onNodeClick(node); return; }
    const href = typeHref[node.type]?.(node.slug) || `/entity/${node.slug}`;
    window.location.href = href;
  }, [onNodeClick]);

  // Connected node IDs for highlighting
  const connectedIds = useMemo(() => {
    if (!highlighted) return new Set<string>();
    const s = new Set<string>([highlighted]);
    const edgeList = edgeMap.get(highlighted) || [];
    for (const e of edgeList) {
      s.add(e.source === highlighted ? e.target : e.source);
    }
    return s;
  }, [highlighted, edgeMap]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-full bg-[#0A0A0A] rounded-xl cursor-grab active:cursor-grabbing select-none"
      onWheel={handleWheel}
      onMouseDown={(e) => handleMouseDown(e)}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}>
        {/* Edges */}
        {inputEdges.map((edge, i) => {
          const source = layoutNodes.find((n) => n.id === edge.from);
          const target = layoutNodes.find((n) => n.id === edge.to);
          if (!source || !target) return null;
          const isHighlighted = highlighted
            && (edge.from === highlighted || edge.to === highlighted);
          const isDimmed = highlighted && !isHighlighted;
          return (
            <g key={`edge-${i}`}>
              <line
                x1={source.x} y1={source.y}
                x2={target.x} y2={target.y}
                stroke={isHighlighted ? '#D4A843' : '#2A2A2A'}
                strokeWidth={isHighlighted ? 2 : 0.8}
                opacity={isDimmed ? 0.1 : isHighlighted ? 0.9 : 0.4}
                className="transition-all duration-300"
              />
              {!mini && isHighlighted && (
                <text
                  x={(source.x + target.x) / 2}
                  y={(source.y + target.y) / 2 - 4}
                  textAnchor="middle"
                  fill="#A1A1AA"
                  fontSize="8"
                  className="pointer-events-none"
                >
                  {edge.relation.replace(/_/g, ' ')}
                </text>
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {layoutNodes.map((node) => {
          const color = TYPE_COLORS[node.type] || '#6B7280';
          const isHovered = hoveredNode === node.id;
          const isHighlighted = highlighted ? connectedIds.has(node.id) : true;
          const isDimmed = highlighted && !isHighlighted;
          const radius = isHovered ? NODE_RADIUS + 3 : NODE_RADIUS;

          return (
            <g
              key={node.id}
              transform={`translate(${node.x}, ${node.y})`}
              onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, node.id); }}
              onMouseUp={() => { if (!dragging) handleNodeClick(node); }}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              className="cursor-pointer"
              style={{ cursor: 'pointer' }}
            >
              {/* Glow for hovered */}
              {isHovered && (
                <circle
                  r={radius + 6}
                  fill={color}
                  opacity={0.15}
                  className="animate-pulse"
                />
              )}
              {/* Node circle */}
              <circle
                r={radius}
                fill={isDimmed ? '#2A2A2A' : color}
                stroke={isHovered ? '#F5F5F5' : 'transparent'}
                strokeWidth={1.5}
                opacity={isDimmed ? 0.2 : 1}
                className="transition-all duration-200"
              />
              {/* Label */}
              {!mini && (
                <text
                  y={radius + LABEL_OFFSET}
                  textAnchor="middle"
                  fill={isDimmed ? '#2A2A2A' : isHovered ? '#F5F5F5' : '#A1A1AA'}
                  fontSize="9"
                  className="pointer-events-none transition-colors duration-200"
                  opacity={isDimmed ? 0.3 : 1}
                >
                  {node.title.length > 20 ? node.title.slice(0, 18) + '...' : node.title}
                </text>
              )}
            </g>
          );
        })}
      </g>
    </svg>
  );
}

'use client';

import type { KGNode, KGEdge } from '@/utils/dashboard-data';

interface KnowledgeGraphPanelProps {
  nodes: KGNode[];
  edges: KGEdge[];
}

const typeColors: Record<string, string> = {
  policy: 'var(--color-amber-500)',
  law: 'var(--color-rose-500)',
  organization: 'var(--color-blue-500)',
  report: 'var(--color-emerald-500)',
  event: 'var(--color-purple-500)',
  person: 'var(--color-cyan-500)',
};

// Pre-compute a simple force-directed layout
function computeLayout(nodes: KGNode[], edges: KGEdge[]) {
  const centerX = 300;
  const centerY = 180;
  const radius = 130;

  // Simple circular layout
  return nodes.map((node, i) => {
    const angle = (i / nodes.length) * 2 * Math.PI - Math.PI / 2;
    return {
      ...node,
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  });
}

export default function KnowledgeGraphPanel({ nodes, edges }: KnowledgeGraphPanelProps) {
  const layouted = computeLayout(nodes, edges);
  const nodeMap = new Map(layouted.map((n) => [n.id, n]));

  return (
    <div
      style={{
        background: 'var(--color-surface-elevated)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--color-border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
          Knowledge Graph
        </h3>
        <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
          {nodes.length} nodes · {edges.length} edges
        </span>
      </div>

      {/* SVG Canvas */}
      <div style={{ padding: '16px', display: 'flex', justifyContent: 'center' }}>
        <svg width="600" height="360" viewBox="0 0 600 360" style={{ borderRadius: '8px', background: 'var(--color-surface-secondary)' }}>
          {/* Edges */}
          {edges.map((edge, i) => {
            const source = nodeMap.get(edge.source);
            const target = nodeMap.get(edge.target);
            if (!source || !target) return null;

            return (
              <g key={`edge-${i}`}>
                <line
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  stroke="var(--color-border-subtle)"
                  strokeWidth={edge.weight}
                  strokeOpacity={0.6}
                />
                {/* Edge label at midpoint */}
                <text
                  x={(source.x + target.x) / 2}
                  y={(source.y + target.y) / 2 - 6}
                  textAnchor="middle"
                  fontSize="9"
                  fill="var(--color-text-tertiary)"
                  fontFamily="var(--font-mono)"
                >
                  {edge.label}
                </text>
              </g>
            );
          })}

          {/* Nodes */}
          {layouted.map((node) => (
            <g key={node.id}>
              {/* Glow */}
              <circle
                cx={node.x}
                cy={node.y}
                r={6 + node.size * 3}
                fill={typeColors[node.type] || 'var(--color-text-tertiary)'}
                opacity={0.1}
              />
              {/* Main circle */}
              <circle
                cx={node.x}
                cy={node.y}
                r={4 + node.size * 2.5}
                fill={typeColors[node.type] || 'var(--color-text-tertiary)'}
                stroke="var(--color-surface-elevated)"
                strokeWidth="2"
                style={{ cursor: 'pointer' }}
              />
              {/* Label */}
              <text
                x={node.x}
                y={node.y + 6 + node.size * 2.5 + 14}
                textAnchor="middle"
                fontSize={node.size >= 4 ? '11' : '10'}
                fontWeight={node.size >= 4 ? '600' : '400'}
                fill="var(--color-text-secondary)"
                style={{ pointerEvents: 'none' }}
              >
                {node.label}
              </text>
              {/* Connection count */}
              <text
                x={node.x}
                y={node.y + 1}
                textAnchor="middle"
                fontSize="10"
                fontWeight="600"
                fill="var(--color-surface-elevated)"
                style={{ pointerEvents: 'none' }}
              >
                {node.connections}
              </text>
            </g>
          ))}

          {/* Legend */}
          <g transform="translate(460, 16)">
            {Object.entries(typeColors).map(([type, color], i) => (
              <g key={type} transform={`translate(0, ${i * 18})`}>
                <circle cx="6" cy="6" r="5" fill={color} />
                <text x="16" y="10" fontSize="10" fill="var(--color-text-tertiary)" style={{ textTransform: 'capitalize' }}>
                  {type}
                </text>
              </g>
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
}

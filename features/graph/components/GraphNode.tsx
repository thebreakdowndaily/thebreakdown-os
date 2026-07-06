'use client';

import { memo } from 'react';
import { NODE_TYPE_COLORS } from '../types';
import type { LayoutNode } from '../types';

interface GraphNodeProps {
  node: LayoutNode;
  type: string;
  title: string;
  isHovered: boolean;
  isDimmed: boolean;
  radius: number;
  onMouseDown: (e: React.MouseEvent, id: string) => void;
  onMouseUp: (e: React.MouseEvent, id: string) => void;
  onMouseEnter: (id: string) => void;
  onMouseLeave: () => void;
  mini?: boolean;
}

function GraphNodeInner({
  node, type, title, isHovered, isDimmed, radius,
  onMouseDown, onMouseUp, onMouseEnter, onMouseLeave, mini,
}: GraphNodeProps) {
  const color = NODE_TYPE_COLORS[type] || '#6B7280';
  const r = isHovered ? radius + 3 : radius;
  const opacity = isDimmed ? 0.2 : 1;

  return (
    <g
      transform={`translate(${String(node.x)}, ${String(node.y)})`}
      onMouseDown={(e) => { onMouseDown(e, node.id); }}
      onMouseUp={(e) => { onMouseUp(e, node.id); }}
      onMouseEnter={() => { onMouseEnter(node.id); }}
      onMouseLeave={onMouseLeave}
      style={{ cursor: 'pointer' }}
    >
      {isHovered && (
        <circle r={r + 6} fill={color} opacity={0.15} />
      )}
      <circle
        r={r}
        fill={isDimmed ? '#2A2A2A' : color}
        stroke={isHovered ? '#F5F5F5' : 'transparent'}
        strokeWidth={1.5}
        opacity={opacity}
      />
      {!mini && (
        <text
          y={r + 14}
          textAnchor="middle"
          fill={isDimmed ? '#2A2A2A' : isHovered ? '#F5F5F5' : '#A1A1AA'}
          fontSize="9"
          opacity={isDimmed ? 0.3 : 1}
        >
          {title.length > 22 ? title.slice(0, 20) + '...' : title}
        </text>
      )}
    </g>
  );
}

export const GraphNode = memo(GraphNodeInner);

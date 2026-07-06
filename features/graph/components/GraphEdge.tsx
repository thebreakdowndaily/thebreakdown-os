'use client';

import { memo } from 'react';
import { RELATION_LABELS } from '../types';
import type { LayoutNode } from '../types';
import type { GraphEdge as GraphEdgeType } from '@/types/canonical';

interface GraphEdgeComponentProps {
  edge: GraphEdgeType;
  sourceNode?: LayoutNode;
  targetNode?: LayoutNode;
  isHighlighted: boolean;
  isDimmed: boolean;
  mini?: boolean;
}

function GraphEdgeInner({
  edge, sourceNode, targetNode, isHighlighted, isDimmed, mini,
}: GraphEdgeComponentProps) {
  if (!sourceNode || !targetNode) return null;

  const midX = (sourceNode.x + targetNode.x) / 2;
  const midY = (sourceNode.y + targetNode.y) / 2;

  return (
    <g>
      <line
        x1={sourceNode.x} y1={sourceNode.y}
        x2={targetNode.x} y2={targetNode.y}
        stroke={isHighlighted ? '#D4A843' : '#2A2A2A'}
        strokeWidth={isHighlighted ? 2 : 0.8}
        opacity={isDimmed ? 0.1 : isHighlighted ? 0.9 : 0.4}
      />
      {!mini && isHighlighted && (
        <text
          x={midX}
          y={midY - 4}
          textAnchor="middle"
          fill="#A1A1AA"
          fontSize="8"
        >
          {RELATION_LABELS[edge.relation] || edge.relation.replace(/_/g, ' ')}
        </text>
      )}
    </g>
  );
}

export const GraphEdge = memo(GraphEdgeInner);

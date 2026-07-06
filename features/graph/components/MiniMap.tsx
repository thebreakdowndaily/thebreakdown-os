'use client';

import { memo, useMemo } from 'react';
import type { LayoutNode, ViewportState } from '../types';
import type { GraphNode } from '@/types/canonical';
import { NODE_TYPE_COLORS } from '../types';

interface MiniMapProps {
  layoutNodes: LayoutNode[];
  nodeMap: Map<string, GraphNode>;
  viewport: ViewportState;
  width: number;
  height: number;
  onNavigate: (x: number, y: number) => void;
}

export const MiniMap = memo(function MiniMap({
  layoutNodes, nodeMap, viewport, width, height, onNavigate,
}: MiniMapProps) {
  const scale = 0.15;
  const mw = width * scale;
  const mh = height * scale;

  const viewRect = useMemo(() => {
    const vx = -viewport.x / viewport.scale * scale;
    const vy = -viewport.y / viewport.scale * scale;
    const vw = width / viewport.scale * scale;
    const vh = height / viewport.scale * scale;
    return { x: vx, y: vy, width: vw, height: vh };
  }, [viewport, width, height, scale]);

  const handleClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const rx = (e.clientX - rect.left) / scale;
    const ry = (e.clientY - rect.top) / scale;
    onNavigate(rx, ry);
  };

  return (
    <div style={{
      position: 'absolute', bottom: 12, right: 12,
      background: '#151515', border: '1px solid #2A2A2A',
      borderRadius: 'var(--radius-md)', overflow: 'hidden',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)', zIndex: 10,
    }}>
      <svg width={mw} height={mh} onClick={handleClick} style={{ cursor: 'pointer', display: 'block' }}>
        {layoutNodes.map((ln) => {
          const orig = nodeMap.get(ln.id);
          if (!orig) return null;
          const color = NODE_TYPE_COLORS[orig.type] || '#6B7280';
          return (
            <circle
              key={ln.id}
              cx={ln.x * scale}
              cy={ln.y * scale}
              r={2}
              fill={color}
              opacity={0.7}
            />
          );
        })}
        <rect
          x={viewRect.x}
          y={viewRect.y}
          width={viewRect.width}
          height={viewRect.height}
          fill="none"
          stroke="#D4A843"
          strokeWidth={1}
          rx={2}
        />
      </svg>
    </div>
  );
});

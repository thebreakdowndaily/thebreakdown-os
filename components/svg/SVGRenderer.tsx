'use client';

import React from 'react';
import type { SVGSpec } from '@/utils/types';

interface SVGNode {
  id: string;
  label: string;
  type?: string;
  children?: string[];
  value?: number;
}

interface SVGRendererProps {
  svg: SVGSpec;
}

/**
 * SVGRenderer — Renders editorial SVGs (org trees, flowcharts, decision trees, etc.).
 *
 * Pure SVG rendering with DS tokens via CSS variables.
 * Supports: org-tree, flowchart, decision-tree, sankey, treemap, timeline, comparison-matrix
 */
const SVGRenderer: React.FC<SVGRendererProps> = ({ svg }) => {
  const { structure, type, purpose, caption, altText } = svg;
  const nodeW = 180;
  const nodeH = 50;
  const gapX = 30;
  const gapY = 50;

  /**
   * Renders nodes as an org-tree layout (top-to-bottom).
   * Uses recursion to position children below parents.
   */
  const renderOrgTree = () => {
    const rootNode = structure.nodes.find((n) => n.type === 'root');
    if (!rootNode) return null;

    const nodeMap = new Map(structure.nodes.map((n) => [n.id, n]));
    const xOffset = 400; // center offset
    const yPos = 40;

    const renderNode = (nodeId: string, x: number, y: number): React.ReactNode[] => {
      const node = nodeMap.get(nodeId);
      if (!node) return [];

      const elements: React.ReactNode[] = [];
      const children = node.children?.map((cid) => nodeMap.get(cid)).filter((n): n is SVGNode => n != null) || [];
      const totalWidth = children.length * (nodeW + gapX) - gapX;
      const startX = x - totalWidth / 2;

      // Node rect
      elements.push(
        <g key={node.id}>
          <rect
            x={x - nodeW / 2}
            y={y - nodeH / 2}
            width={nodeW}
            height={nodeH}
            rx={8}
            fill="var(--color-bg-secondary)"
            stroke="var(--color-border-default)"
            strokeWidth={1}
          />
          <text
            x={x}
            y={y + 4}
            textAnchor="middle"
            fill="var(--color-text-primary)"
            fontSize="var(--text-sm)"
            fontFamily="var(--font-sans)"
          >
            {node.label}
          </text>
        </g>
      );

      // Children edges + nodes
      children.forEach((child, i) => {
        const cx = startX + i * (nodeW + gapX) + nodeW / 2;
        const cy = y + gapY;

        // Edge
        elements.push(
          <line
            key={`edge-${node.id}-${child.id}`}
            x1={x}
            y1={y + nodeH / 2}
            x2={cx}
            y2={cy - nodeH / 2}
            stroke="var(--color-border-hover)"
            strokeWidth={1.5}
          />
        );

        elements.push(...renderNode(child.id, cx, cy));
      });

      return elements;
    };

    return (
      <svg
        viewBox={`0 0 800 ${String((structure.levels || 3) * (nodeH + gapY) + 60)}`}
        style={{ width: '100%', height: 'auto', maxHeight: '500px' }}
        role="img"
        aria-label={altText}
      >
        {renderNode(rootNode.id, xOffset, yPos)}
      </svg>
    );
  };

  /**
   * Renders a flowchart layout with connected steps.
   */
  const renderFlowchart = () => {
    const nodes = structure.nodes;
    const stepW = 160;
    const stepH = 45;
    const totalW = nodes.length * stepW + (nodes.length - 1) * gapX;
    const startX = Math.max(50, (800 - totalW) / 2);
    const y = 100;

    return (
      <svg
        viewBox={`0 0 ${String(Math.max(800, totalW + 100))} 250`}
        style={{ width: '100%', height: 'auto', maxHeight: '300px' }}
        role="img"
        aria-label={altText}
      >
        {nodes.map((node, i) => {
          const x = startX + i * (stepW + gapX);
          return (
            <g key={node.id}>
              <rect
                x={x}
                y={y - stepH / 2}
                width={stepW}
                height={stepH}
                rx={6}
                fill="var(--color-bg-secondary)"
                stroke={i === nodes.length - 1 ? 'var(--color-brand-400)' : 'var(--color-border-default)'}
                strokeWidth={i === nodes.length - 1 ? 2 : 1}
              />
              <text
                x={x + stepW / 2}
                y={y + 4}
                textAnchor="middle"
                fill="var(--color-text-primary)"
                fontSize="var(--text-xs)"
                fontFamily="var(--font-sans)"
              >
                {node.label}
              </text>
              {i < nodes.length - 1 && (
                <>
                  <line
                    x1={x + stepW}
                    y1={y}
                    x2={x + stepW + gapX}
                    y2={y}
                    stroke="var(--color-border-hover)"
                    strokeWidth={1.5}
                  />
                  <polygon
                    points={`${String(x + stepW + gapX - 6)},${String(y - 4)} ${String(x + stepW + gapX - 6)},${String(y + 4)} ${String(x + stepW + gapX)},${String(y)}`}
                    fill="var(--color-border-hover)"
                  />
                </>
              )}
            </g>
          );
        })}
      </svg>
    );
  };

  /**
   * Renders a decision tree with branching paths.
   */
  const renderDecisionTree = () => {
    const edges = structure.edges || [];
    const nodeMap = new Map(structure.nodes.map((n) => [n.id, n]));
    const rootNode = structure.nodes.find((n) => n.type === 'root');
    if (!rootNode) return null;

    const xOffset = 400;
    const renderBranch = (nodeId: string, x: number, y: number, depth = 0): React.ReactNode[] => {
      const node = nodeMap.get(nodeId);
      if (!node) return [];

      const elements: React.ReactNode[] = [];
      const outgoingEdges = edges.filter((e) => e.from === nodeId);
      const spread = Math.max(150, 300 - depth * 30);
      const startX = x - (outgoingEdges.length - 1) * spread / 2;

      // Decision diamond for non-leaf nodes
      if (outgoingEdges.length > 0) {
        elements.push(
          <g key={node.id}>
            <polygon
              points={`${String(x)},${String(y - 20)} ${String(x + 20)},${String(y)} ${String(x)},${String(y + 20)} ${String(x - 20)},${String(y)}`}
              fill="var(--color-bg-secondary)"
              stroke="var(--color-border-default)"
              strokeWidth={1}
            />
            <text
              x={x}
              y={y + 4}
              textAnchor="middle"
              fill="var(--color-text-primary)"
              fontSize="10px"
              fontFamily="var(--font-sans)"
            >
              {node.label}
            </text>
          </g>
        );

        outgoingEdges.forEach((edge, i) => {
          const cx = startX + i * spread;
          const cy = y + 80;

          elements.push(
            <line
              key={`edge-${edge.from}-${edge.to}`}
              x1={x}
              y1={y + 20}
              x2={cx}
              y2={cy - 20}
              stroke="var(--color-border-hover)"
              strokeWidth={1.5}
            />
          );

          if (edge.label) {
            elements.push(
              <text
                key={`label-${edge.from}-${edge.to}`}
                x={(x + cx) / 2}
                y={(y + 20 + cy - 20) / 2 - 5}
                textAnchor="middle"
                fill="var(--color-text-muted)"
                fontSize="9px"
                fontFamily="var(--font-sans)"
              >
                {edge.label}
              </text>
            );
          }

          elements.push(...renderBranch(edge.to, cx, cy, depth + 1));
        });
      } else {
        // Leaf node — terminal rectangle
        elements.push(
          <g key={node.id}>
            <rect
              x={x - 60}
              y={y - 20}
              width={120}
              height={40}
              rx={20}
              fill="var(--color-bg-secondary)"
              stroke="var(--color-brand-400)"
              strokeWidth={1.5}
            />
            <text
              x={x}
              y={y + 4}
              textAnchor="middle"
              fill="var(--color-text-primary)"
              fontSize="10px"
              fontFamily="var(--font-sans)"
            >
              {node.label}
            </text>
          </g>
        );
      }

      return elements;
    };

    return (
      <svg
        viewBox="0 0 800 500"
        style={{ width: '100%', height: 'auto', maxHeight: '500px' }}
        role="img"
        aria-label={altText}
      >
        {renderBranch(rootNode.id, xOffset, 60)}
      </svg>
    );
  };

  /**
   * Renders a simple Sankey diagram showing flow between nodes.
   */
  const renderSankey = () => {
    const nodes = structure.nodes;
    const edges = structure.edges || [];
    const svgW = 800;
    const svgH = Math.max(300, nodes.length * 50);

    // Simple left-to-right layout
    const levelMap = new Map<string, number>();
    nodes.forEach((n) => {
      if (n.type === 'root') levelMap.set(n.id, 0);
    });
    // Assign levels based on edges
    let changed = true;
    while (changed) {
      changed = false;
      edges.forEach((e) => {
        const fromLevel = levelMap.get(e.from);
        const toLevel = levelMap.get(e.to);
        if (fromLevel !== undefined && (toLevel === undefined || toLevel <= fromLevel)) {
          levelMap.set(e.to, fromLevel + 1);
          changed = true;
        }
      });
    }
    nodes.forEach((n) => {
      if (!levelMap.has(n.id)) levelMap.set(n.id, 0);
    });

    const maxLevel = Math.max(...Array.from(levelMap.values()), 1);
    const colW = svgW / (maxLevel + 1);
    const levelNodes = new Map<number, typeof nodes>();
    nodes.forEach((n) => {
      const l = levelMap.get(n.id) ?? 0;
      const existing = levelNodes.get(l);
      if (existing) {
        existing.push(n);
      } else {
        levelNodes.set(l, [n]);
      }
    });

    const yPositions = new Map<string, number>();
    levelNodes.forEach((levelN) => {
      const spacing = svgH / (levelN.length + 1);
      levelN.forEach((n, i) => {
        yPositions.set(n.id, spacing * (i + 1));
      });
    });

    return (
      <svg viewBox={`0 0 ${String(svgW)} ${String(svgH)}`} style={{ width: '100%', height: 'auto', maxHeight: '400px' }} role="img" aria-label={altText}>
        {/* Edges */}
        {edges.map((edge, i) => {
          const x1 = (levelMap.get(edge.from) || 0) * colW + colW * 0.6;
          const x2 = (levelMap.get(edge.to) || 0) * colW + colW * 0.4;
          const y1 = yPositions.get(edge.from) || 0;
          const y2 = yPositions.get(edge.to) || 0;
          return (
            <path
              key={i}
              d={`M${String(x1)},${String(y1)} C${String((x1 + x2) / 2)},${String(y1)} ${String((x1 + x2) / 2)},${String(y2)} ${String(x2)},${String(y2)}`}
              fill="none"
              stroke="var(--color-brand-400)"
              strokeWidth={Math.max(2, (edge.value || 10) / 5)}
              opacity="0.4"
            />
          );
        })}
        {/* Nodes */}
        {nodes.map((node) => {
          const x = (levelMap.get(node.id) || 0) * colW + colW * 0.3;
          const y = yPositions.get(node.id) || 0;
          return (
            <g key={node.id}>
              <rect x={x - 50} y={y - 12} width={100} height={24} rx={12} fill="var(--color-bg-tertiary)" stroke="var(--color-border-default)" strokeWidth={1} />
              <text x={x} y={y + 4} textAnchor="middle" fill="var(--color-text-primary)" fontSize="11px" fontFamily="var(--font-sans)">{node.label}</text>
            </g>
          );
        })}
      </svg>
    );
  };

  /**
   * Renders a treemap with nested rectangles.
   */
  const renderTreemap = () => {
    const nodes = structure.nodes;
    const svgW = 800;
    const svgH = 450;

    if (nodes.length === 0) {
      return (
        <svg viewBox={`0 0 ${String(svgW)} ${String(svgH)}`} style={{ width: '100%', height: 'auto', maxHeight: '450px' }} role="img" aria-label={altText}>
          <text x={svgW / 2} y={svgH / 2} textAnchor="middle" fill="var(--color-text-muted)" fontSize="14px" fontFamily="var(--font-sans)">Treemap — No data</text>
        </svg>
      );
    }

    // Simple squarified treemap layout simulation
    const total = nodes.length;
    const cols = Math.ceil(Math.sqrt(total));
    const rows = Math.ceil(total / cols);
    const cellW = svgW / cols;
    const cellH = svgH / rows;

    const colors = ['var(--color-brand-400)', 'var(--color-blue-400)', 'var(--color-success)', 'var(--color-warning)', 'var(--color-error)', 'var(--color-info)'];

    return (
      <svg viewBox={`0 0 ${String(svgW)} ${String(svgH)}`} style={{ width: '100%', height: 'auto', maxHeight: '450px' }} role="img" aria-label={altText}>
        {nodes.map((node, i) => {
          const n = node as SVGNode;
          const col = i % cols;
          const row = Math.floor(i / cols);
          const x = col * cellW + 2;
          const y = row * cellH + 2;
          const w = cellW - 4;
          const h = cellH - 4;
          const color = colors[i % colors.length];
          return (
            <g key={n.id}>
              <rect x={x} y={y} width={w} height={h} rx={6} fill={color} opacity="0.3" stroke={color} strokeWidth={1} />
              <text x={x + w / 2} y={y + h / 2 - 4} textAnchor="middle" fill="var(--color-text-primary)" fontSize="12px" fontWeight="600" fontFamily="var(--font-sans)">{n.label}</text>
              {n.value !== undefined && (
                <text x={x + w / 2} y={y + h / 2 + 14} textAnchor="middle" fill="var(--color-text-muted)" fontSize="10px" fontFamily="var(--font-sans)">{n.value}</text>
              )}
            </g>
          );
        })}
      </svg>
    );
  };

  /**
   * Renders a horizontal timeline as SVG.
   */
  const renderTimelineSVG = () => {
    const nodes = structure.nodes;
    const svgW = 800;
    const svgH = 200;

    if (nodes.length === 0) return null;

    const spacing = svgW / (nodes.length + 1);

    return (
      <svg viewBox={`0 0 ${String(svgW)} ${String(svgH)}`} style={{ width: '100%', height: 'auto', maxHeight: '250px' }} role="img" aria-label={altText}>
        {/* Horizontal line */}
        <line x1={spacing * 0.5} y1={svgH / 2} x2={svgW - spacing * 0.5} y2={svgH / 2} stroke="var(--color-border-default)" strokeWidth={2} />
        {/* Nodes */}
        {nodes.map((node, i) => {
          const n = node as SVGNode;
          const x = spacing * (i + 1);
          const y = svgH / 2;
          const isLast = i === nodes.length - 1;
          return (
            <g key={n.id}>
              <circle cx={x} cy={y} r={8} fill={isLast ? 'var(--color-brand-400)' : 'var(--color-bg-secondary)'} stroke={isLast ? 'var(--color-brand-400)' : 'var(--color-border-default)'} strokeWidth={2} />
              <text x={x} y={y + 30} textAnchor="middle" fill="var(--color-text-primary)" fontSize="11px" fontWeight="500" fontFamily="var(--font-sans)">{n.label}</text>
              {n.value !== undefined && (
                <text x={x} y={y + 44} textAnchor="middle" fill="var(--color-text-muted)" fontSize="10px" fontFamily="var(--font-sans)">{n.value}</text>
              )}
            </g>
          );
        })}
      </svg>
    );
  };

  /**
   * Renders a comparison matrix — grid of items vs metrics.
   */
  const renderComparisonMatrix = () => {
    const nodes = structure.nodes;
    const edges = structure.edges || [];
    const svgW = 800;
    const svgH = Math.max(300, nodes.length * 60 + 60);

    if (nodes.length === 0) return null;

    const colW = svgW / (edges.length + 2);
    const rowH = 50;
    const startX = colW;

    return (
      <svg viewBox={`0 0 ${String(svgW)} ${String(svgH)}`} style={{ width: '100%', height: 'auto', maxHeight: '500px' }} role="img" aria-label={altText}>
        {/* Header row */}
        {edges.map((edge, i) => (
          <text key={i} x={startX + i * colW + colW / 2} y={25} textAnchor="middle" fill="var(--color-text-secondary)" fontSize="11px" fontWeight="600" fontFamily="var(--font-sans)">{edge.label || edge.from}</text>
        ))}
        {/* Divider */}
        <line x1={0} y1={35} x2={svgW} y2={35} stroke="var(--color-border-default)" strokeWidth={1} />
        {/* Data rows */}
        {nodes.map((node, row) => {
          const n = node as SVGNode;
          return (
          <g key={n.id}>
            <text x={10} y={65 + row * rowH} textAnchor="start" fill="var(--color-text-primary)" fontSize="11px" fontWeight="500" fontFamily="var(--font-sans)">{n.label}</text>
            {edges.map((edge, col) => {
              const cx = startX + col * colW + colW / 2;
              const cy = 60 + row * rowH;
              const hasValue = n.value !== undefined;
              return (
                <g key={`${n.id}-${String(col)}`}>
                  <circle cx={cx} cy={cy} r={hasValue ? 12 : 6} fill={hasValue ? 'var(--color-brand-400)' : 'var(--color-bg-tertiary)'} opacity={hasValue ? 0.8 : 0.4} />
                  {hasValue && (
                    <text x={cx} y={cy + 4} textAnchor="middle" fill="var(--color-text-inverse)" fontSize="9px" fontWeight="600" fontFamily="var(--font-sans)">{n.value}</text>
                  )}
                </g>
              );
            })}
          </g>
          );
        })}
      </svg>
    );
  };

  /**
   * Routes to the correct renderer based on SVG type.
   */
  const renderSVG = () => {
    switch (type) {
      case 'org-tree':
        return renderOrgTree();
      case 'flowchart':
        return renderFlowchart();
      case 'decision-tree':
        return renderDecisionTree();
      case 'sankey':
        return renderSankey();
      case 'treemap':
        return renderTreemap();
      case 'timeline':
        return renderTimelineSVG();
      case 'comparison-matrix':
        return renderComparisonMatrix();
      default:
        return <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>Unsupported SVG type: {type}</p>;
    }
  };

  return (
    <figure
      style={{
        width: '100%',
        backgroundColor: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-default)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--spacing-4)',
        overflow: 'hidden',
      }}
    >
      {purpose && (
        <p
          style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--color-text-secondary)',
            marginBottom: 'var(--spacing-3)',
            padding: '0 var(--spacing-2)',
          }}
        >
          {purpose}
        </p>
      )}
      {renderSVG()}
      <figcaption
        style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-muted)',
          marginTop: 'var(--spacing-3)',
          paddingTop: 'var(--spacing-3)',
          borderTop: '1px solid var(--color-border-default)',
          lineHeight: 1.5,
        }}
      >
        {caption}
      </figcaption>
    </figure>
  );
};

export default SVGRenderer;

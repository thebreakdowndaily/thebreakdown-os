import React from 'react';
// @ts-ignore
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';
import { CanonicalSankeyChartBlockData } from '@/lib/story/chart-contract';

const DEFAULT_COLORS = [
  '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'
];

function getColor(name: string, index: number) {
  // Try to preserve original colors for Partition story
  if (name.includes('Pakistan')) return '#10b981';
  if (name.includes('India')) return '#f59e0b';
  return DEFAULT_COLORS[index % DEFAULT_COLORS.length];
}

export default function PartitionSankeyBlock({ data }: { data: CanonicalSankeyChartBlockData }) {
  // Create nodes avoiding circular DAG links by appending -origin and -dest
  const origins = Array.from(new Set(data.data.map(f => f.origin)));
  const dests = Array.from(new Set(data.data.map(f => f.destination)));
  
  const rawNodes = [
    ...origins.map(name => ({ id: `${name}-origin`, name })),
    ...dests.map(name => ({ id: `${name}-dest`, name }))
  ];

  const rawLinks = data.data.map(f => {
    const originIndex = origins.indexOf(f.origin);
    return {
      source: `${f.origin}-origin`,
      target: `${f.destination}-dest`,
      value: f.volume,
      color: getColor(f.origin, originIndex)
    };
  });

  const sankeyGen = sankey()
    .nodeId((d: any) => d.id)
    .nodeWidth(16)
    .nodePadding(20)
    .extent([[2, 20], [798, 380]]);

  const graphResult = sankeyGen({
    nodes: rawNodes.map(d => ({ ...d })),
    links: rawLinks.map(d => ({ ...d }))
  });

  const nodes = graphResult.nodes;
  const links = graphResult.links;

  return (
    <figure className="my-10 p-4 sm:p-6 bg-surface-primary border border-border-primary rounded-lg shadow-sm">
      <header className="mb-6">
        <h3 className="text-xl font-bold font-serif text-text-primary mb-2">{data.title}</h3>
        {data.question && <p className="text-sm font-medium text-text-secondary mb-1">{data.question}</p>}
        {(data.period || data.unit) && (
          <p className="text-xs text-text-tertiary font-mono">
            {data.period && <span><strong>Period:</strong> {data.period}</span>}
            {data.period && data.unit && <span> &nbsp;|&nbsp; </span>}
            {data.unit && <span><strong>Unit:</strong> {data.unit}</span>}
          </p>
        )}
      </header>

      {/* Visual Chart - mobile responsive via SVG scaling */}
      <div 
        className="relative w-full aspect-[4/3] sm:aspect-[2/1] min-h-[250px] bg-surface-secondary/20 rounded border border-border-secondary overflow-hidden"
        role="img"
        aria-label={`Sankey diagram for ${data.title}. Detailed values are provided in the table below.`}
      >
        <svg viewBox="0 0 800 400" className="w-full h-full block" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
          <g>
            {/* Draw Links */}
            {links.map((link: any, i: number) => {
              const d = sankeyLinkHorizontal()(link);
              return (
                <path
                  key={`link-${i}`}
                  d={d}
                  fill="none"
                  stroke={link.color}
                  strokeOpacity={0.25}
                  strokeWidth={Math.max(1, link.width)}
                  className="hover:stroke-opacity-50 transition-opacity"
                >
                  <title>{`${link.source.name} → ${link.target.name}\n${link.value} ${data.unit || ''}`.trim()}</title>
                </path>
              );
            })}
          </g>
          <g>
            {/* Draw Nodes */}
            {nodes.map((node: any, i: number) => (
              <g key={`node-${i}`}>
                <rect
                  x={node.x0}
                  y={node.y0}
                  height={node.y1 - node.y0}
                  width={node.x1 - node.x0}
                  fill={getColor(node.name, i)}
                  stroke="rgba(0,0,0,0.2)"
                >
                  <title>{`${node.name}\nTotal: ${node.value} ${data.unit || ''}`.trim()}</title>
                </rect>
                <text
                  x={node.x0 < 400 ? node.x1 + 8 : node.x0 - 8}
                  y={(node.y0 + node.y1) / 2}
                  dy="0.35em"
                  textAnchor={node.x0 < 400 ? 'start' : 'end'}
                  className="text-sm font-semibold fill-text-primary font-sans"
                >
                  {node.name}
                </text>
                {/* Flow value on the node */}
                <text
                  x={node.x0 < 400 ? node.x1 + 8 : node.x0 - 8}
                  y={(node.y0 + node.y1) / 2 + 18}
                  dy="0.35em"
                  textAnchor={node.x0 < 400 ? 'start' : 'end'}
                  className="text-xs fill-text-secondary font-sans font-medium"
                >
                  {node.value}{data.unit?.includes('Million') ? 'M' : ''}
                </text>
              </g>
            ))}
          </g>
        </svg>
      </div>

      {/* Semantic Fallback Table */}
      <div className="mt-8 overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <caption className="sr-only">Detailed data for {data.title}</caption>
          <thead>
            <tr className="border-b border-border-primary">
              <th className="py-2 px-2 sm:px-3 font-semibold text-text-primary">Origin</th>
              <th className="py-2 px-2 sm:px-3 font-semibold text-text-primary">Destination</th>
              <th className="py-2 px-2 sm:px-3 font-semibold text-text-primary text-right whitespace-nowrap">Volume</th>
            </tr>
          </thead>
          <tbody>
            {data.data.map((flow, i) => (
              <tr key={i} className="border-b border-border-secondary/50">
                <td className="py-2 px-2 sm:px-3 text-text-secondary">{flow.origin}</td>
                <td className="py-2 px-2 sm:px-3 text-text-secondary">{flow.destination}</td>
                <td className="py-2 px-2 sm:px-3 text-text-secondary text-right font-mono">{flow.volume}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer className="mt-6 text-xs text-text-tertiary leading-relaxed space-y-2">
        {data.source && <p><strong>Source:</strong> {data.source}</p>}
        {data.limitations && <p><strong>Note:</strong> {data.limitations}</p>}
      </footer>
    </figure>
  );
}

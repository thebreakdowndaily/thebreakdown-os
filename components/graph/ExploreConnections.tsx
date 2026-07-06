import Link from 'next/link';
import type { GraphNode } from '@/lib/graph/graphTypes';

const typeHref: Record<string, (slug: string) => string> = {
  story: (s) => `/story/${s}`,
  topic: (s) => `/topic/${s}`,
  entity: (s) => `/entity/${s}`,
  organization: (s) => `/organization/${s}`,
  country: (s) => `/country/${s}`,
  person: (s) => `/entity/${s}`,
  policy: (s) => `/entity/${s}`,
  budget: (s) => `/entity/${s}`,
  report: (s) => `/entity/${s}`,
  source: () => '#',
};

const typeLabel: Record<string, string> = {
  story: 'Story',
  topic: 'Topic',
  entity: 'Entity',
  organization: 'Org',
  country: 'Country',
  person: 'Person',
  policy: 'Policy',
  budget: 'Budget',
  report: 'Report',
  source: 'Source',
};

function defaultHref(slug: string, type: string): string {
  return typeHref[type]?.(slug) || `/entity/${slug}`;
}

export default function ExploreConnections({
  title,
  nodes,
}: {
  title?: string;
  nodes: GraphNode[];
}) {
  if (nodes.length === 0) return null;

  return (
    <section aria-label="Explore connections" className="py-8 sm:py-10">
      <h2 className="text-lg sm:text-xl font-bold text-[#F5F5F5] mb-5">
        {title || 'Explore Connections'}
      </h2>
      <div className="space-y-1">
        {nodes.map((node) => (
          <Link
            key={node.id}
            href={defaultHref(node.slug, node.type)}
            className="group flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-[#151515] transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-[#D4A843] shrink-0" />
            <span className="text-sm text-[#A1A1AA] group-hover:text-[#F5F5F5] transition-colors">
              {node.title}
            </span>
            <span className="ml-auto text-[10px] font-medium text-[#A1A1AA]/40 uppercase tracking-wider">
              {typeLabel[node.type] || node.type}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function TrendingConnections({
  connections,
}: {
  connections: Array<{
    from: GraphNode;
    to: GraphNode;
  }>;
}) {
  if (connections.length === 0) return null;

  return (
    <section aria-label="Trending connections" className="py-8 sm:py-10">
      <h2 className="text-lg sm:text-xl font-bold text-[#F5F5F5] mb-5">Trending Connections</h2>
      <div className="space-y-2">
        {connections.map((c, i) => (
          <div key={i} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#151515] border border-[#2A2A2A]">
            <Link
              href={defaultHref(c.from.slug, c.from.type)}
              className="text-sm text-[#D4A843] hover:text-[#D4A843]/80 transition-colors truncate"
            >
              {c.from.title}
            </Link>
            <svg className="w-4 h-4 text-[#A1A1AA] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
            <Link
              href={defaultHref(c.to.slug, c.to.type)}
              className="text-sm text-[#A1A1AA] hover:text-[#F5F5F5] transition-colors truncate"
            >
              {c.to.title}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

export const NODE_TYPE_COLORS: Record<string, string> = {
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
  timeline: '#F97316',
  event: '#F97316',
};

export const NODE_TYPE_LABELS: Record<string, string> = {
  story: 'Story', topic: 'Topic', entity: 'Entity',
  organization: 'Org', country: 'Country', person: 'Person',
  policy: 'Policy', scheme: 'Scheme', budget: 'Budget',
  report: 'Report', source: 'Source', dataset: 'Dataset',
  fix: 'The Fix', timeline: 'Timeline', event: 'Event',
};

export const NODE_TYPE_ICONS: Record<string, string> = {
  story: '📰', topic: '🏷️', entity: '🔗',
  organization: '🏢', country: '🌍', person: '👤',
  policy: '📜', scheme: '💰', budget: '📊',
  report: '📋', source: '📎', dataset: '📦',
  fix: '🔧', timeline: '⏳', event: '🔥',
};

export const RELATION_LABELS: Record<string, string> = {
  mentions: 'Mentions', belongs_to: 'Belongs To',
  implemented_by: 'Implemented By', announced_by: 'Announced By',
  funded_by: 'Funded By', affects: 'Affects',
  related_to: 'Related To', part_of: 'Part Of',
  located_in: 'Located In', published_by: 'Published By',
  criticized_by: 'Criticized By', supports: 'Supports',
  opposes: 'Opposes', covers: 'Covers',
  analyzes: 'Analyzes', references: 'References',
};

export interface ViewportState {
  x: number;
  y: number;
  scale: number;
}

export interface LayoutNode {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface GraphFilterState {
  story: boolean;
  topic: boolean;
  entity: boolean;
  organization: boolean;
  country: boolean;
  person: boolean;
  policy: boolean;
  scheme: boolean;
  budget: boolean;
  report: boolean;
  source: boolean;
  dataset: boolean;
  fix: boolean;
  timeline: boolean;
  event: boolean;
}

export function createDefaultFilters(): GraphFilterState {
  return {
    story: true, topic: true, entity: true, organization: true,
    country: true, person: true, policy: true, scheme: true,
    budget: true, report: true, source: true, dataset: true,
    fix: true, timeline: true, event: true,
  };
}

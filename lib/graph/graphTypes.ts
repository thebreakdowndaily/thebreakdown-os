export type NodeType =
  | 'person' | 'organization' | 'policy' | 'scheme' | 'budget'
  | 'report' | 'dataset' | 'source' | 'country'
  | 'story' | 'topic' | 'timeline' | 'fix';

export type RelationType =
  | 'mentions' | 'belongs_to' | 'implemented_by' | 'announced_by'
  | 'funded_by' | 'affects' | 'related_to' | 'part_of' | 'located_in'
  | 'published_by' | 'criticized_by' | 'supports' | 'opposes'
  | 'covers' | 'analyzes' | 'references';

export interface GraphNode {
  id: string;
  type: NodeType;
  title: string;
  slug: string;
  subtitle?: string;
  image?: string;
  evidenceScore?: number;
  storyCount?: number;
}

export interface GraphEdge {
  /** The source node id */
  source?: string;
  /** The target node id */
  target?: string;
  /** Canonical "from" node id (alias for source) */
  from: string;
  /** Canonical "to" node id (alias for target) */
  to: string;
  relation: RelationType;
  confidence: number;
  label?: string;
  weight?: number;
}

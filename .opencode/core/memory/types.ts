/**
 * THE BREAKDOWN OS — Memory Engine Shared Types
 */

export interface MemoryConfig {
  storePath: string;
  maxVersions: number;
  fuzzyThreshold: number;
  lastIngest?: string;
}

export interface IndexConfig {
  storePath: string;
  fuzzyThreshold?: number;
}

export interface EntityMemory {
  id: string;
  type: string;
  name: string;
  aliases?: string[];
  roles?: string[];
  organizations?: string[];
  stories?: string[];
  timeline?: TimelineEntry[];
  sources?: string[];
  metadata?: Record<string, any>;
  tags?: string[];
  version: number;
  createdAt?: string;
  updatedAt?: string;
  active?: boolean;
  history?: VersionEntry[];
}

export interface TimelineEntry {
  date: string;
  event: string;
  source?: string;
}

export interface VersionEntry {
  version: number;
  timestamp: string;
  updatedBy: string;
  changes: string[];
}

export interface RelationshipMemory {
  from: string;
  relationship: string;
  to: string;
  confidence: number;
  sources?: string[];
  firstObserved?: string;
  lastObserved?: string;
  active?: boolean;
  version: number;
  createdAt?: string;
  updatedAt?: string;
  history?: VersionEntry[];
}

export interface FactMemory {
  id?: string;
  statement: string;
  verified: boolean;
  confidence: number;
  lastVerified?: string;
  source?: string;
  entities?: string[];
  stories?: string[];
  category?: string;
  version: number;
  createdAt?: string;
  updatedAt?: string;
  history?: VersionEntry[];
}

export interface SourceMemory {
  id?: string;
  publisher: string;
  credibility: number;
  url?: string;
  lastUsed?: string;
  stories?: string[];
  tier?: number;
  tags?: string[];
  version: number;
  createdAt?: string;
  updatedAt?: string;
  history?: VersionEntry[];
}

export interface EventMemory {
  event: string;
  date: string;
  endDate?: string;
  entities?: string[];
  sources?: string[];
  category?: string;
  significance?: number;
  version: number;
  createdAt?: string;
  updatedAt?: string;
  history?: VersionEntry[];
}

export interface StoryMemory {
  storyId: string;
  headline: string;
  summary?: string;
  url?: string;
  publishedAt?: string;
  entities: EntityMemory[];
  relationships?: RelationshipMemory[];
  facts?: FactMemory[];
  claims?: ClaimMemory[];
  sources?: SourceMemory[];
  timeline?: TimelineEntry[];
  topics?: string[];
  tags?: string[];
  related?: {
    stories: string[];
    laws: string[];
    budgets: string[];
    organizations: string[];
    people: string[];
    countries: string[];
    events: string[];
  };
}

export interface ClaimMemory {
  claim: string;
  claimant?: string;
  verified: boolean;
  verdict?: string;
  source?: string;
}

export interface SearchResult {
  id: string;
  type: string;
  category: string;
  title: string;
  snippet: string;
  score: number;
  url?: string;
  publishedAt?: string;
  entity?: EntityMemory;
}

export interface SearchOptions {
  limit?: number;
  minConfidence?: number;
  categories?: string[];
}

import type { SearchIndexEntry } from '@/types/canonical';

export interface SearchIntent {
  primaryType: 'Entity' | 'Topic' | 'Story' | 'Concept' | 'Unknown';
  confidence: number;
  matchedId?: string; // If exact match
}

export interface KnowledgeSearch {
  query: string;
  rawResults?: SearchIndexEntry[];
  intent?: SearchIntent;
  spotlight?: any; // The Direct Match entity/topic
  groupedResults?: {
    latestStories: SearchIndexEntry[];
    entities: SearchIndexEntry[];
    topics: SearchIndexEntry[];
    documents: SearchIndexEntry[];
    media: SearchIndexEntry[];
  };
  suggestions?: {
    relatedSearches: string[];
    relatedTopics: string[];
    relatedEntities: string[];
  };
  quality?: {
    exactMatch: boolean;
    confidence: number;
    coverage: number;
    reason: string;
  };
}

export interface SearchBuilder {
  build(search: KnowledgeSearch): Promise<KnowledgeSearch>;
}

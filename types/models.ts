// Domain Model Interfaces – canonical knowledge objects

export interface Story {
  id: string;
  headline: string;
  summary: string;
  claims: Claim[];
  topics: Topic[];
  createdAt: string; // ISO timestamp
  updatedAt: string;
}

export interface Entity {
  id: string;
  type: 'person' | 'organization' | 'law' | 'event' | 'concept' | string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Claim {
  id: string;
  text: string;
  evidenceIds: string[];
  sourceIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Evidence {
  id: string;
  sourceId: string;
  excerpt: string;
  confidence?: number; // 0‑1
  createdAt: string;
  updatedAt: string;
}

export interface Source {
  id: string;
  title: string;
  url: string;
  publicationDate?: string;
  authors?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Topic {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimelineEvent {
  id: string;
  date: string; // ISO or free‑form
  title: string;
  description?: string;
  relatedEntityIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  title: string;
  url: string;
  mimeType?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Organization extends Entity {}
export interface Person extends Entity {}

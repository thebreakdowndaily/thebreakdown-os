// ─── CMS Type Definitions ────────────────────────────────────────────────────
// These match the canonical types shape for API round-trip compatibility.

export type EntityType =
  | 'person' | 'organization' | 'policy' | 'scheme' | 'budget'
  | 'report' | 'dataset' | 'source' | 'country';

export interface CMSEntity {
  id: string;
  type: EntityType;
  name: string;
  slug: string;
  description: string;
  aliases: string[];
  image?: string;
  storyCount?: number;
  evidenceScore?: number;
  relatedEntityIds: string[];
  relatedStoryIds: string[];
  relatedTopicIds: string[];
  statistics: Array<{ label: string; value: string; change?: string }>;
  timeline: Array<{ date: string; title: string; description: string }>;
  faq: Array<{ question: string; answer: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface CMSTopic {
  id: string;
  name: string;
  slug: string;
  description: string;
  overview?: string;
  image?: string;
  storyIds: string[];
  relatedEntityIds: string[];
  featuredStoryIds: string[];
  countries: string[];
  faq: Array<{ question: string; answer: string }>;
  timeline: Array<{ date: string; title: string; description: string }>;
  statistics: Array<{ label: string; value: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface CMSTimeline {
  id: string;
  title: string;
  description: string;
  category: string;
  storyIds: string[];
  entityIds: string[];
  topicIds: string[];
  events: Array<{ date: string; title: string; description: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface CMSFix {
  id: string;
  title: string;
  slug: string;
  problem: string;
  rootCauses: string[];
  existingSolutions: Array<{ title: string; description: string; link?: string }>;
  globalExamples: Array<{ country: string; approach: string; outcome: string; link?: string }>;
  recommendedActions: Array<{ action: string; responsible: string; timeline: string }>;
  citizenActions: string[];
  governmentActions: string[];
  metrics: Array<{ metric: string; currentValue: string; targetValue: string; source?: string }>;
  status: 'draft' | 'review' | 'published';
  createdAt: string;
  updatedAt: string;
}

export interface CMSMediaItem {
  id: string;
  type: 'image' | 'video' | 'chart' | 'document' | 'svg' | 'map';
  src: string;
  alt: string;
  caption: string;
  tags: string[];
  credit: string;
  width?: number;
  height?: number;
  fileSize?: number;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface CMSUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'writer' | 'researcher' | 'designer';
  avatar?: string;
  createdAt: string;
}

export interface ActivityEntry {
  id: string;
  type: 'story_created' | 'story_updated' | 'story_published' | 'topic_created' | 'topic_updated' | 'entity_created' | 'entity_updated' | 'timeline_created' | 'timeline_updated' | 'fix_created' | 'fix_updated' | 'media_uploaded';
  label: string;
  timestamp: string;
  userId?: string;
  link?: string;
}

export interface StoryRevision {
  id: string;
  storyId: string;
  version: number;
  snapshot: string; // JSON
  createdAt: string;
  userId?: string;
  message: string;
}

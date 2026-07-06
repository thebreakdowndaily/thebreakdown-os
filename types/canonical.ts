// ─── The Breakdown OS — Canonical Data Models ──────────────────────────────
// Single source of truth for every content type. No other file defines these shapes.
// Everything else (services, view models, API, graph) derives from these.

// ─── Primitives ─────────────────────────────────────────────────────────────

export type EntityKind =
  | 'person' | 'organization' | 'policy' | 'scheme' | 'budget'
  | 'report' | 'dataset' | 'source' | 'country';

export type StoryStatus = 'draft' | 'review' | 'fact_check' | 'scheduled' | 'published' | 'updated';

export type RelationType =
  | 'mentions' | 'belongs_to' | 'implemented_by' | 'announced_by'
  | 'funded_by' | 'affects' | 'related_to' | 'part_of' | 'located_in'
  | 'published_by' | 'criticized_by' | 'supports' | 'opposes'
  | 'covers' | 'analyzes' | 'references';

export type ConfidenceTier = 1 | 2 | 3 | 4 | 5;

export type UserRole = 'admin' | 'editor' | 'writer' | 'researcher' | 'designer' | 'reader';

// ─── Content Models ─────────────────────────────────────────────────────────

export interface Story {
  id: string;
  title: string;
  slug: string;
  headline: string;
  summary: string;
  heroImage: string;
  author: string;
  category: string;
  status: StoryStatus;
  evidenceScore: number;
  readingTime: number;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  blocks: StoryBlock[];
  sources: Source[];
  claims: Claim[];
  timeline: TimelineEvent[];
  faq: FAQItem[];
  charts: ChartDef[];
  relatedStoryIds: string[];
  relatedEntityIds: string[];
  relatedTopicIds: string[];
  notes?: string;
  updatedBy?: string;
}

export interface Topic {
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
  faq: FAQItem[];
  timeline: TimelineEvent[];
  statistics: StatItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Entity {
  id: string;
  type: EntityKind;
  name: string;
  slug: string;
  description: string;
  aliases: string[];
  image?: string;
  storyCount: number;
  evidenceScore: number;
  relatedEntityIds: string[];
  relatedStoryIds: string[];
  relatedTopicIds: string[];
  statistics: StatItem[];
  timeline: TimelineEvent[];
  faq: FAQItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Timeline {
  id: string;
  title: string;
  description: string;
  category: string;
  storyIds: string[];
  entityIds: string[];
  topicIds: string[];
  events: TimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface Fix {
  id: string;
  title: string;
  slug: string;
  problem: string;
  rootCauses: string[];
  existingSolutions: FixSolution[];
  globalExamples: GlobalExample[];
  recommendedActions: FixAction[];
  citizenActions: string[];
  governmentActions: string[];
  metrics: FixMetric[];
  status: StoryStatus;
  createdAt: string;
  updatedAt: string;
}

export interface MediaItem {
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

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified?: boolean;
  image?: string;
  displayName?: string;
  avatarUrl?: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ReaderProfile {
  userId: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  preferences?: Record<string, unknown>;
}

export interface Bookmark {
  id: string;
  userId: string;
  storyId: string;
  storySlug: string;
  storyTitle: string;
  createdAt: string;
}

export interface ReadingHistoryEntry {
  id: string;
  userId: string;
  storyId: string;
  storySlug: string;
  storyTitle: string;
  progress: number;
  lastReadAt: string;
}

export interface Follow {
  id: string;
  userId: string;
  entityId?: string;
  entityType?: string;
  entitySlug?: string;
  entityName: string;
  createdAt: string;
}

// ─── Sub-models ─────────────────────────────────────────────────────────────

export interface StoryBlock {
  id: string;
  type: string;
  data: Record<string, unknown>;
  collapsed?: boolean;
}

export interface Source {
  title: string;
  url: string;
  accessedAt: string;
  tier: ConfidenceTier;
}

export interface Claim {
  id: string;
  claim: string;
  data: string;
  source: string;
  sourceUrl: string;
  tier: ConfidenceTier;
  confidence: number;
  status: 'verified' | 'strong' | 'moderate' | 'unverified';
}

export interface TimelineEvent {
  date: string;
  title: string;
  description: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ChartDef {
  chartType: string;
  title: string;
  data: Array<{ label: string; value: number }>;
  caption: string;
}

export interface StatItem {
  label: string;
  value: string;
  change?: string;
}

export interface FixSolution {
  title: string;
  description: string;
  link?: string;
}

export interface GlobalExample {
  country: string;
  approach: string;
  outcome: string;
  link?: string;
}

export interface FixAction {
  action: string;
  responsible: string;
  timeline: string;
}

export interface FixMetric {
  metric: string;
  currentValue: string;
  targetValue: string;
  source?: string;
}

// ─── Graph ──────────────────────────────────────────────────────────────────

export interface GraphNode {
  id: string;
  type: EntityKind | 'story' | 'topic' | 'timeline' | 'fix' | 'dataset';
  title: string;
  slug: string;
  subtitle?: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  relation: RelationType;
  confidence: number;
}

export interface Graph {
  nodes: Map<string, GraphNode>;
  edges: GraphEdge[];
}

// ─── Dataset & Intelligence Engine ───────────────────────────────────────────

export type DatasetCategory =
  | 'economy' | 'climate' | 'health' | 'education' | 'demographics'
  | 'energy' | 'trade' | 'governance' | 'technology' | 'military'
  | 'infrastructure' | 'social' | 'environment' | 'finance';

export type DatasetFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'adhoc';

export type DataType = 'number' | 'percentage' | 'currency' | 'ratio' | 'index' | 'count' | 'text';

export interface Dataset {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: DatasetCategory;
  frequency: DatasetFrequency;
  unitLabel: string;
  source: string;
  sourceUrl: string;
  methodology: string;
  tags: string[];
  versions: DatasetVersion[];
  metrics: Metric[];
  dimensions: Dimension[];
  visualizations: Visualization[];
  relatedEntityIds: string[];
  relatedStoryIds: string[];
  relatedTopicIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DatasetVersion {
  id: string;
  version: string;
  publishedAt: string;
  notes: string;
  series: Series[];
  metadata: Record<string, string>;
}

export interface Metric {
  id: string;
  name: string;
  label: string;
  description: string;
  dataType: DataType;
  unit: string;
  decimalPlaces: number;
  isPrimary: boolean;
}

export interface Dimension {
  id: string;
  name: string;
  label: string;
  values: string[];
}

export interface Series {
  id: string;
  metricId: string;
  dimensionFilters: Record<string, string>;
  observations: Observation[];
}

export interface Observation {
  period: string;
  value: number | null;
  annotation?: string;
}

export interface Visualization {
  id: string;
  title: string;
  type: 'line' | 'bar' | 'area' | 'pie' | 'table' | 'heatmap';
  metricIds: string[];
  dimensionFilter?: Record<string, string>;
  config: Record<string, unknown>;
}

// ─── Search ─────────────────────────────────────────────────────────────────

export interface SearchIndexEntry {
  id: string;
  type: 'story' | 'topic' | 'entity' | 'organization' | 'country' | 'timeline' | 'fix' | 'dataset';
  title: string;
  slug: string;
  description: string;
  tags: string[];
  content: string; // indexable text
  score: number;
  updatedAt: string;
}

// ─── Events ─────────────────────────────────────────────────────────────────

export type EventType =
  | 'story:created' | 'story:updated' | 'story:published' | 'story:deleted'
  | 'topic:created' | 'topic:updated' | 'topic:deleted'
  | 'entity:created' | 'entity:updated' | 'entity:deleted'
  | 'timeline:created' | 'timeline:updated' | 'timeline:deleted'
  | 'fix:created' | 'fix:updated' | 'fix:deleted'
  | 'dataset:created' | 'dataset:updated' | 'dataset:deleted'
  | 'media:uploaded' | 'media:updated' | 'media:deleted'
  | 'search:indexed'
  | 'graph:updated';

export interface Event {
  type: EventType;
  payload: Record<string, unknown>;
  timestamp: string;
  userId?: string;
}

// ─── ViewModels (page-level) ────────────────────────────────────────────────

export interface HomepageViewModel {
  seo: SEOData;
  sections: PageSection[];
}

export interface StoryPageViewModel {
  story: Story;
  relatedStories: Story[];
  relatedTopics: Topic[];
  relatedEntities: Entity[];
  seo: SEOData;
  breadcrumbs: Breadcrumb[];
}

export interface TopicPageViewModel {
  topic: Topic;
  stories: Story[];
  entities: Entity[];
  seo: SEOData;
  breadcrumbs: Breadcrumb[];
}

export interface EntityPageViewModel {
  entity: Entity;
  stories: Story[];
  relatedEntities: Entity[];
  relatedTopics: Topic[];
  seo: SEOData;
  breadcrumbs: Breadcrumb[];
}

export interface DatasetPageViewModel {
  dataset: Dataset;
  relatedStories: Story[];
  relatedTopics: Topic[];
  relatedEntities: Entity[];
  versions: DatasetVersion[];
  seo: SEOData;
  breadcrumbs: Breadcrumb[];
}

export interface PageSection {
  id: string;
  component: string;
  props: Record<string, unknown>;
}

export interface SEOData {
  title: string;
  description: string;
  ogImage?: string;
  canonical?: string;
}

export interface Breadcrumb {
  label: string;
  href: string;
}

// ─── API ────────────────────────────────────────────────────────────────────

export interface APIResponse<T> {
  data: T;
  meta?: {
    total: number;
    page: number;
    pageSize: number;
  };
  error?: string;
}

export interface APIListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: string;
  filter?: Record<string, string>;
}

// ─── Analytics ──────────────────────────────────────────────────────────────

export interface AnalyticsEvent {
  type: string;
  storyId?: string;
  entityId?: string;
  topicId?: string;
  userId?: string;
  sessionId?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface DashboardStats {
  totalStories: number;
  totalTopics: number;
  totalEntities: number;
  totalTimelines: number;
  totalFixes: number;
  totalMedia: number;
  totalDatasets: number;
  drafts: number;
  review: number;
  scheduled: number;
  published: number;
  recentActivity: ActivityEntry[];
  topStories: Array<{ id: string; title: string; views: number }>;
  topTopics: Array<{ id: string; name: string; count: number }>;
  searchQueries: Array<{ query: string; count: number }>;
}

export interface ActivityEntry {
  id: string;
  type: string;
  label: string;
  timestamp: string;
  userId?: string;
  link?: string;
}

/**
 * THE BREAKDOWN — Website Builder Types
 */

// ── Page Spec (output of Website Builder) ───────────────────────────────

export interface PageSpec {
  type: 'story' | 'entity' | 'topic' | 'country' | 'homepage' | 'search' | 'timeline' | 'fix';
  slug: string;
  template: string;
  layout: string;
  sections: Section[];
  seo: SEOData;
  breadcrumbs: Breadcrumb[];
  schema: Record<string, unknown>[];
  metadata: Record<string, unknown>;
  searchResults?: SearchResult[];
}

export interface Section {
  id: string;
  component: string;
  props: Record<string, unknown>;
}

export interface ComponentSpec {
  id: string;
  component: string;
  path: string;
  description: string;
  required: boolean;
  props: string[];
}

export interface LayoutSpec {
  id: string;
  component: string;
  path: string;
  description: string;
  slots: string[];
  defaultSlot: string;
}

export interface PageTemplate {
  id: string;
  description: string;
  layout: string;
  sections: string[];
  required_sections: string[];
}

// ── SEO ─────────────────────────────────────────────────────────────────

export interface SEOData {
  title: string;
  description: string;
  canonical: string;
  ogType: string;
  ogImage?: string;
  ogPublishDate?: string;
  twitterCard?: string;
  keywords?: string;
}

export interface Breadcrumb {
  label: string;
  href: string;
}

// ── Story JSON ──────────────────────────────────────────────────────────

export interface StoryJSON {
  id: string;
  slug: string;
  headline: string;
  summary: string;
  heroImage?: string;
  publishedAt: string;
  updatedAt: string;
  readingTime: number;
  wordCount?: number;
  author: Author;
  evidenceScore: number;
  category: string;
  tags: string[];
  keyPoints: string[];
  timeline: TimelineEvent[];
  facts: Fact[];
  claims: Claim[];
  sources: Source[];
  verificationScore: number;
  datasets: Dataset[];
  charts: ChartDef[];
  geoData?: GeoData;
  visuals?: {
    globes?: GlobeSpec[];
    svgs?: SVGSpec[];
    animations?: AnimationSpec[];
    infographics?: InfographicSpec[];
  };
  debate?: Debate;
  faq: FAQItem[];
  primarySources: PrimarySource[];
  relatedStories: RelatedStory[];
  relatedEntities: RelatedEntity[];
  body?: string;
}

export interface Author {
  name: string;
  avatar?: string;
  bio?: string;
  url?: string;
}

export interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  source?: string;
}

export interface Fact {
  label: string;
  value: string;
  source?: string;
}

export interface Claim {
  claim: string;
  source: string;
  verification: 'true' | 'false' | 'misleading' | 'unverifiable';
  explanation: string;
  confidence: number;
}

export interface Source {
  name: string;
  url: string;
  type: 'government' | 'research' | 'news' | 'primary' | 'expert';
  tier: 1 | 2 | 3 | 4 | 5;
  accessedAt: string;
}

export interface Dataset {
  label: string;
  description: string;
  data: Array<Record<string, unknown>>;
  source?: string;
}

export interface ChartDef {
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'table';
  title: string;
  description?: string;
  data: Array<Record<string, unknown>>;
  xKey: string;
  yKey: string;
  color?: string;
}

export interface GeoData {
  type: 'india-map' | 'world-map' | 'state-map';
  regions: Array<{
    id: string;
    name: string;
    value: number;
    color?: string;
  }>;
}

export interface Debate {
  sides: Array<{
    position: string;
    arguments: Array<{
      claim: string;
      source: string;
    }>;
  }>;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface PrimarySource {
  name: string;
  url: string;
  type: string;
  description: string;
}

export interface RelatedStory {
  slug: string;
  headline: string;
  summary: string;
  heroImage?: string;
  publishedAt: string;
  readingTime: number;
  evidenceScore: number;
  category: string;
}

export interface RelatedEntity {
  id: string;
  slug: string;
  name: string;
  type: string;
  description?: string;
  relationship?: string;
}

// ── Entity JSON ─────────────────────────────────────────────────────────

export interface EntityJSON {
  id: string;
  slug: string;
  name: string;
  type: string;
  description: string;
  image?: string;
  aliases?: string[];
  storyCount: number;
  updatedAt: string;
  evidenceScore?: number;
  overview?: string;
  timeline: TimelineEvent[];
  datasets: Dataset[];
  statistics: Record<string, number | string>;
  sources: PrimarySource[];
  relatedStories: RelatedStory[];
  relatedEntities?: RelatedEntity[];
  relatedTopics?: RelatedEntity[];
  faq: FAQItem[];
}

// ── Topic JSON ──────────────────────────────────────────────────────────

export interface TopicJSON {
  id: string;
  slug: string;
  name: string;
  description: string;
  overview?: string;
  image?: string;
  storyCount: number;
  entityCount: number;
  updatedAt: string;
  stories: RelatedStory[];
  people: RelatedEntity[];
  organizations: RelatedEntity[];
  policies: RelatedEntity[];
  budgets: RelatedEntity[];
  reports: RelatedEntity[];
  countries?: RelatedEntity[];
  charts: ChartDef[];
  timeline?: TimelineEvent[];
  faq?: FAQItem[];
  statistics?: Array<{ label: string; value: string }>;
}

// ── Country JSON ────────────────────────────────────────────────────────

export interface CountryJSON extends EntityJSON {
  type: 'country';
  population?: number;
  gdp?: number;
  capital?: string;
}

// ── Homepage JSON ───────────────────────────────────────────────────────

export interface HomepageJSON {
  topStory: RelatedStory;
  trendingAnalyses: RelatedStory[];
  latestInvestigations: RelatedStory[];
  dataStories: RelatedStory[];
  theFix: RelatedStory[];
  policyTracker: Array<{
    name: string;
    status: string;
    description: string;
  }>;
  globalWatch: RelatedStory[];
  latestUpdates: RelatedStory[];
}

// ── Search ──────────────────────────────────────────────────────────────

export interface SearchResult {
  id: string;
  type: 'story' | 'entity' | 'topic';
  title: string;
  description: string;
  url: string;
  image?: string;
  score: number;
  date?: string;
  category?: string;
}

// ── The Fix Types ─────────────────────────────────────────────────────────

export interface FixJSON {
  id: string;
  slug: string;
  storySlug: string;
  headline: string;
  summary: string;
  heroImage?: string;
  publishedAt: string;
  updatedAt: string;
  readingTime: number;
  author: Author;
  evidenceScore: number;
  tags: string[];

  problem: FixSection;
  whoIsAffected: FixSection;
  rootCauses: FixSection;
  evidence: FixSection;
  stakeholders: Stakeholder[];
  existingSolutions: ExistingSolution[];
  globalExamples: GlobalExample[];
  recommendedActions: FixAction[];
  citizenActions: FixAction[];
  governmentActions: FixAction[];
  metricsToTrack: Metric[];

  relatedStories: RelatedStory[];
  relatedEntities: RelatedEntity[];
  sources: Source[];
}

export interface FixSection {
  title: string;
  content: string;
  supportingData?: Array<{ label: string; value: string }>;
}

export interface Stakeholder {
  name: string;
  type: 'government' | 'citizen' | 'private-sector' | 'civil-society' | 'international';
  role: string;
  interest: string;
  stance?: 'supports' | 'opposes' | 'neutral' | 'mixed';
}

export interface ExistingSolution {
  name: string;
  description: string;
  status: 'active' | 'proposed' | 'expired' | 'failed';
  effectiveness?: 'high' | 'medium' | 'low' | 'unknown';
  source?: string;
}

export interface GlobalExample {
  country: string;
  policy: string;
  description: string;
  outcome: string;
  source?: string;
  applicableToIndia?: boolean;
}

export interface FixAction {
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  timeframe: 'immediate' | 'short-term' | 'medium-term' | 'long-term';
  actors: string[];
}

export interface Metric {
  name: string;
  currentValue: string;
  targetValue: string;
  dataSource: string;
  updateFrequency: string;
}

// ── Visual Intelligence Types ────────────────────────────────────────────

export type ChartType =
  | 'line' | 'bar' | 'horizontal-bar' | 'pie' | 'area' | 'scatter' | 'bubble'
  | 'treemap' | 'sankey' | 'network' | 'radar' | 'heatmap' | 'sunburst' | 'table'
  | 'waterfall' | 'histogram' | 'box-plot' | 'violin' | 'slope' | 'calendar'
  | 'dot-plot' | 'lollipop' | 'ridgeline' | 'chord';

export interface ChartSpec {
  chartId: string;
  type: ChartType;
  purpose: string;
  question?: string;
  xAxis: { label: string; field: string; type: 'category' | 'numeric' | 'time' | 'ordinal' };
  yAxis: { label: string; field: string; type: 'category' | 'numeric' | 'ordinal' };
  dataset: { source: string; fields: string[]; filters?: Record<string, unknown>; transformations?: string[] };
  colorField?: string;
  sizeField?: string;
  facetField?: string;
  interactive?: boolean;
  caption: string;
  altText: string;
  annotations?: Array<{ label: string; description: string }>;
  sortOrder?: 'ascending' | 'descending' | 'none';
  zeroBaseline?: boolean;
  theme?: string;
  responsive?: boolean;
  lazyLoad?: boolean;
}

export type MapType = 'india-state' | 'india-district' | 'world-choropleth' | 'trade-routes' | 'migration' | 'conflict' | 'infrastructure' | 'river-basin' | 'rail-network' | 'air-routes' | 'heatmap';

export interface MapSpec {
  mapId: string;
  type: MapType;
  purpose: string;
  geography: { scope: string; projection?: string; center?: [number, number]; zoom?: number };
  data?: { source?: string; valueField?: string; joinKey?: string; colorScale?: { type: 'sequential' | 'diverging' | 'categorical'; steps?: number } };
  interaction?: { hover?: string; click?: string };
  caption: string;
  altText: string;
  theme?: string;
  responsive?: boolean;
  lazyLoad?: boolean;
  accessible?: AccessibilitySpec;
}

export interface AccessibilitySpec {
  altText: string;
  longDescription?: string;
  keyboardNavigation?: boolean;
  focusable?: boolean;
  ariaLabel?: string;
  highContrast?: boolean;
  reducedMotion?: boolean;
  colorBlindSafe?: boolean;
  textZoom?: string;
}

export interface VisualPlan {
  storySlug: string;
  gateResult: 'visual_required' | 'text_only';
  gateReason?: string;
  primaryVisual?: { type: string; purpose: string; reason: string };
  secondaryVisuals?: Array<{ type: string; purpose: string; reason: string }>;
  heroVisual?: { type: 'hero'; heroImage?: string; caption?: string; altText?: string };
  charts?: ChartSpec[];
  maps?: MapSpec[];
  globes?: GlobeSpec[];
  svgs?: SVGSpec[];
  animations?: AnimationSpec[];
  infographics?: InfographicSpec[];
  cards?: CardSpec[];
  storyFlow?: Array<{ position: number; type: string; visualId: string }>;
  assets?: Array<{ id: string; type: string; lazyLoad: boolean }>;
  captions?: Array<{ visualId: string; caption: string; altText: string; longDescription?: string }>;
}

export interface GlobeSpec {
  globeId: string;
  type: string;
  purpose: string;
  features: Record<string, unknown>;
  technologies?: string[];
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  pov?: { lat: number; lng: number; altitude: number };
  caption: string;
  altText: string;
  theme?: string;
  lazyLoad?: boolean;
  accessible?: AccessibilitySpec;
}

export interface SVGSpec {
  svgId: string;
  type: 'org-tree' | 'flowchart' | 'decision-tree' | 'sankey' | 'treemap' | 'timeline' | 'comparison-matrix';
  purpose: string;
  question?: string;
  structure: {
    layout: 'top-to-bottom' | 'left-to-right' | 'radial' | 'nested';
    nodes: Array<{ id: string; label: string; type?: string; children?: string[] }>;
    edges?: Array<{ from: string; to: string; label?: string; value?: number }>;
    levels?: number;
    orientation?: 'vertical' | 'horizontal';
  };
  styling?: Record<string, string | number>;
  caption: string;
  altText: string;
  interactive?: boolean;
  responsive?: boolean;
  theme?: string;
  lazyLoad?: boolean;
  accessible?: AccessibilitySpec;
}

export interface AnimationSpec {
  animationId: string;
  type: 'cascade' | 'progressive-reveal' | 'data-animation' | 'map-animation';
  purpose: string;
  duration: number;
  steps: Array<{
    step: number; time: number; duration: number; action: string;
    target?: string; description: string; easing?: string; transition?: string;
  }>;
  controls?: { autoplay?: boolean; loop?: boolean; showTimeline?: boolean; playPauseButton?: boolean; speedControl?: number[] };
  caption: string;
  altText: string;
  theme?: string;
  lazyLoad?: boolean;
  accessible?: AccessibilitySpec;
}

export interface InfographicSpec {
  infographicId: string;
  purpose?: string;
  cards: CardSpec[];
  theme?: string;
  responsive?: boolean;
  lazyLoad?: boolean;
}

export type CardSpec =
  | FactCard | ComparisonCard | TimelineCard | StatisticsCard | CountryCard | QuoteCard | ExplainerCard;

export interface FactCard {
  cardId: string; type: 'fact'; value: string; label: string;
  context?: string; icon?: string; caption?: string; altText?: string;
}

export interface ComparisonCard {
  cardId: string; type: 'comparison'; purpose: string;
  items: Array<{ label: string; color?: string; metrics: Array<{ label: string; value: string }> }>;
  caption?: string; altText?: string;
}

export interface TimelineCard {
  cardId: string; type: 'timeline'; purpose: string;
  events: Array<{ date: string; title: string; description?: string }>;
  orientation?: 'vertical' | 'horizontal';
}

export interface StatisticsCard {
  cardId: string; type: 'statistics'; purpose: string;
  stats: Array<{ value: string; label: string; change?: string }>;
  columns?: number; caption?: string;
}

export interface CountryCard {
  cardId: string; type: 'country'; purpose: string;
  country: { name: string; iso?: string; stats?: Array<{ label: string; value: string }>; highlight?: string };
}

export interface QuoteCard {
  cardId: string; type: 'quote'; quote: string; attribution: string; source?: string;
}

export interface ExplainerCard {
  cardId: string; type: 'explainer'; purpose: string;
  steps: Array<{ number: number; title: string; description: string }>;
  showConnector?: boolean;
}

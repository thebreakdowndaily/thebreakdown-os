/**
 * THE BREAKDOWN — Analytics Engine v1.0
 *
 * Learning-centered analytics. Measures what readers learn, not page views.
 *
 * 9 Metrics:
 *   Engagement: time-on-section, scroll-completion, chart-interaction,
 *               timeline-interaction, faq-expansion
 *   Discovery:  search-terms, return-visits, shares, bookmarks
 */

// ── Event Types ───────────────────────────────────────────────────────────

export type AnalyticsEventType =
  | 'section_view'
  | 'scroll'
  | 'chart_interaction'
  | 'timeline_interaction'
  | 'faq_expansion'
  | 'search'
  | 'return_visit'
  | 'share'
  | 'bookmark';

export type ChartAction = 'hover' | 'click' | 'zoom';
export type FAQAction = 'open' | 'close';
export type ShareMedium = 'twitter' | 'linkedin' | 'whatsapp' | 'copy_link';
export type BookmarkAction = 'add' | 'remove';
export type TimelineAction = 'click';
export type ImprovementAction = 'restructure' | 'reorder' | 'shorten' | 'expand' | 'add_visual' | 'improve_headline' | 'add_faq' | 'other';
export type ImprovementPriority = 'high' | 'medium' | 'low';

// ── Event Interfaces ──────────────────────────────────────────────────────

export interface BaseAnalyticsEvent {
  type: AnalyticsEventType;
  storySlug: string;
  ts: string;
  sessionId: string;
}

export interface SectionViewEvent extends BaseAnalyticsEvent {
  type: 'section_view';
  sectionId: string;
  duration: number; // ms spent with section in viewport
}

export interface ScrollEvent extends BaseAnalyticsEvent {
  type: 'scroll';
  depth: number;     // 0.0 – 1.0
  maxDepth: number;  // 0.0 – 1.0
}

export interface ChartInteractionEvent extends BaseAnalyticsEvent {
  type: 'chart_interaction';
  chartId: string;
  action: ChartAction;
}

export interface TimelineInteractionEvent extends BaseAnalyticsEvent {
  type: 'timeline_interaction';
  eventDate: string;
  action: TimelineAction;
}

export interface FAQExpansionEvent extends BaseAnalyticsEvent {
  type: 'faq_expansion';
  questionIndex: number;
  action: FAQAction;
}

export interface SearchEvent extends BaseAnalyticsEvent {
  type: 'search';
  query: string;
  resultsCount: number;
}

export interface ReturnVisitEvent extends BaseAnalyticsEvent {
  type: 'return_visit';
  visitCount: number;
}

export interface ShareEvent extends BaseAnalyticsEvent {
  type: 'share';
  medium: ShareMedium;
}

export interface BookmarkEvent extends BaseAnalyticsEvent {
  type: 'bookmark';
  action: BookmarkAction;
}

export type AnalyticsEvent =
  | SectionViewEvent
  | ScrollEvent
  | ChartInteractionEvent
  | TimelineInteractionEvent
  | FAQExpansionEvent
  | SearchEvent
  | ReturnVisitEvent
  | ShareEvent
  | BookmarkEvent;

// ── Aggregated Analytics ───────────────────────────────────────────────────

export interface SectionEngagement {
  avgTime: number;
  totalEntries: number;
  dropoffRate: number;
}

export interface SharesPerMedium {
  twitter: number;
  linkedin: number;
  whatsapp: number;
  copyLink: number;
}

export interface AggregateStoryAnalytics {
  storySlug: string;
  period: { start: string; end: string };
  totalReaders: number;
  avgTimeOnPage: number;
  avgScrollCompletion: number;
  sectionEngagement: Record<string, SectionEngagement>;
  chartInteractions: number;
  timelineInteractions: number;
  faqExpansions: number;
  popularFAQIndices: number[];
  searchReferrals: number;
  returnVisitorRate: number;
  sharesPerMedium: SharesPerMedium;
  bookmarks: number;
  lowEngagementSections: string[];
  highDropoffPoints: number[];
  learningEffectivenessScore: number;
}

// ── Improvement Reports ────────────────────────────────────────────────────

export interface ImprovementRecommendation {
  action: ImprovementAction;
  target: string;
  reason: string;
  priority: ImprovementPriority;
}

export interface ImprovementReport {
  storySlug: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: ImprovementRecommendation[];
  compareToPrevious?: {
    scrollCompletionChange: string;
    avgTimeChange: string;
  };
}

// ── Session Management ─────────────────────────────────────────────────────

const SESSION_KEY = 'tbd_session_id';
const VISIT_KEY = 'tbd_visit_count';
const SESSION_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export function getSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 14)}`;
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

export function getVisitCount(): number {
  const raw = localStorage.getItem(VISIT_KEY);
  const count = raw ? parseInt(raw, 10) : 0;
  return count + 1;
}

export function incrementVisitCount(): void {
  const current = getVisitCount();
  localStorage.setItem(VISIT_KEY, String(current));
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(VISIT_KEY);
}

// ── Event Batching ─────────────────────────────────────────────────────────

const BATCH_INTERVAL = 5000; // 5 seconds
const MAX_BATCH_SIZE = 50;
const API_ENDPOINT = '/api/analytics';

let eventQueue: AnalyticsEvent[] = [];
let batchTimer: ReturnType<typeof setTimeout> | null = null;

function sendBatch(events: AnalyticsEvent[]): void {
  if (events.length === 0) return;

  const payload = {
    sessionId: getSessionId(),
    events: events.slice(0, MAX_BATCH_SIZE),
  };

  // Use sendBeacon for reliability on page unload
  if (navigator.sendBeacon) {
    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    navigator.sendBeacon(API_ENDPOINT, blob);
  } else {
    fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {
      // Silently drop — analytics should never break the page
    });
  }

  eventQueue = events.slice(MAX_BATCH_SIZE);
}

function flushBatch(): void {
  if (batchTimer) {
    clearTimeout(batchTimer);
    batchTimer = null;
  }
  sendBatch(eventQueue);
}

function scheduleFlush(): void {
  if (batchTimer) return;
  batchTimer = setTimeout(() => {
    batchTimer = null;
    sendBatch(eventQueue);
  }, BATCH_INTERVAL);
}

/**
 * Track a single analytics event.
 * Batches events and sends every 5 seconds.
 */
export function trackEvent(event: Omit<AnalyticsEvent, 'sessionId' | 'ts'>): void {
  try {
    const fullEvent = {
      ...event,
      sessionId: getSessionId(),
      ts: new Date().toISOString(),
    } as AnalyticsEvent;

    eventQueue.push(fullEvent);
    scheduleFlush();
  } catch {
    // Analytics should never break the page
  }
}

/**
 * Flush remaining events immediately.
 * Call on page unload or before navigation.
 */
export function flushAnalytics(): void {
  flushBatch();
}

// ── Scroll Tracking Helpers ────────────────────────────────────────────────

export function getScrollDepth(): number {
  if (typeof window === 'undefined') return 0;
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  if (docHeight <= 0) return 1;
  return Math.min(1, Math.max(0, scrollTop / docHeight));
}

// ── Storage Keys for Bookmarked Stories ────────────────────────────────────

const BOOKMARKS_KEY = 'tbd_bookmarks';

export function getBookmarkedSlugs(): string[] {
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleBookmark(slug: string): 'add' | 'remove' {
  const bookmarks = getBookmarkedSlugs();
  const idx = bookmarks.indexOf(slug);
  if (idx >= 0) {
    bookmarks.splice(idx, 1);
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    return 'remove';
  } else {
    bookmarks.push(slug);
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    return 'add';
  }
}

export function isBookmarked(slug: string): boolean {
  return getBookmarkedSlugs().includes(slug);
}

// ── Aggregation Logic (Server-Side) ────────────────────────────────────────

export interface RawEventStore {
  [storySlug: string]: AnalyticsEvent[];
}

/**
 * Aggregate raw events into per-story analytics.
 */
export function aggregateStoryAnalytics(
  events: AnalyticsEvent[],
  storySlug: string
): AggregateStoryAnalytics {
  const storyEvents = events.filter((e) => e.storySlug === storySlug);

  // Section engagement
  const sectionEvents = storyEvents.filter((e): e is SectionViewEvent => e.type === 'section_view');
  const sectionMap = new Map<string, number[]>();
  for (const se of sectionEvents) {
    const arr = sectionMap.get(se.sectionId) || [];
    arr.push(se.duration);
    sectionMap.set(se.sectionId, arr);
  }

  const sectionEngagement: Record<string, SectionEngagement> = {};
  for (const [sectionId, durations] of sectionMap) {
    const avgTime = durations.reduce((a, b) => a + b, 0) / durations.length;
    const dropoffRate = 1 - (durations.length / (sectionEvents.length || 1));
    sectionEngagement[sectionId] = {
      avgTime: Math.round(avgTime),
      totalEntries: durations.length,
      dropoffRate: Math.round(dropoffRate * 100) / 100,
    };
  }

  // Scroll
  const scrollEvents = storyEvents.filter((e): e is ScrollEvent => e.type === 'scroll');
  const maxDepths = scrollEvents.map((e) => e.maxDepth);
  const avgScrollCompletion = maxDepths.length > 0
    ? maxDepths.reduce((a, b) => a + b, 0) / maxDepths.length
    : 0;

  // Dropoff points — find depths where >10% of readers leave
  const highDropoffPoints = findDropoffPoints(scrollEvents);

  // Chart interactions
  const chartEvents = storyEvents.filter((e) => e.type === 'chart_interaction');

  // Timeline interactions
  const timelineEvents = storyEvents.filter((e) => e.type === 'timeline_interaction');

  // FAQ
  const faqOpenEvents = storyEvents.filter((e): e is FAQExpansionEvent => e.type === 'faq_expansion' && e.action === 'open');
  const faqCount = faqOpenEvents.length;
  const faqIndexFrequency = new Map<number, number>();
  for (const fe of faqOpenEvents) {
    faqIndexFrequency.set(fe.questionIndex, (faqIndexFrequency.get(fe.questionIndex) || 0) + 1);
  }
  const popularFAQIndices = [...faqIndexFrequency.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([idx]) => idx);

  // Search referrals
  const searchEvents = storyEvents.filter((e) => e.type === 'search');

  // Return visits
  const returnEvents = storyEvents.filter((e): e is ReturnVisitEvent => e.type === 'return_visit');
  const returnVisitors = returnEvents.filter((e) => e.visitCount > 1).length;
  const returnVisitorRate = returnEvents.length > 0 ? returnVisitors / returnEvents.length : 0;

  // Shares
  const shareEvents = storyEvents.filter((e): e is ShareEvent => e.type === 'share');
  const sharesPerMedium: SharesPerMedium = {
    twitter: shareEvents.filter((e) => e.medium === 'twitter').length,
    linkedin: shareEvents.filter((e) => e.medium === 'linkedin').length,
    whatsapp: shareEvents.filter((e) => e.medium === 'whatsapp').length,
    copyLink: shareEvents.filter((e) => e.medium === 'copy_link').length,
  };

  // Bookmarks
  const bookmarkAdds = storyEvents.filter((e): e is BookmarkEvent => e.type === 'bookmark' && e.action === 'add').length;

  // Total unique sessions = unique session IDs
  const uniqueSessions = new Set(storyEvents.map((e) => e.sessionId)).size;

  // Time on page — sum of all section_view durations per session
  const sessionTimes = new Map<string, number>();
  for (const se of sectionEvents) {
    sessionTimes.set(se.sessionId, (sessionTimes.get(se.sessionId) || 0) + se.duration);
  }
  const avgTimeOnPage = sessionTimes.size > 0
    ? Math.round([...sessionTimes.values()].reduce((a, b) => a + b, 0) / sessionTimes.size)
    : 0;

  // Low engagement sections — dropoffRate > 0.12
  const lowEngagementSections = Object.entries(sectionEngagement)
    .filter(([_, s]) => s.dropoffRate > 0.12)
    .map(([id]) => id);

  // Learning Effectiveness Score
  const les = computeLES({
    avgScrollCompletion,
    avgTimeOnPage,
    chartInteractions: chartEvents.length,
    timelineInteractions: timelineEvents.length,
    faqExpansions: faqCount,
    returnVisitorRate,
    shareRate: shareEvents.length / Math.max(uniqueSessions, 1),
    bookmarkRate: bookmarkAdds / Math.max(uniqueSessions, 1),
    searchReferrals: searchEvents.length,
  });

  return {
    storySlug,
    period: { start: '', end: '' }, // filled by API
    totalReaders: uniqueSessions,
    avgTimeOnPage,
    avgScrollCompletion: Math.round(avgScrollCompletion * 100) / 100,
    sectionEngagement,
    chartInteractions: chartEvents.length,
    timelineInteractions: timelineEvents.length,
    faqExpansions: faqCount,
    popularFAQIndices,
    searchReferrals: searchEvents.length,
    returnVisitorRate: Math.round(returnVisitorRate * 100) / 100,
    sharesPerMedium,
    bookmarks: bookmarkAdds,
    lowEngagementSections,
    highDropoffPoints,
    learningEffectivenessScore: les,
  };
}

// ── Dropoff Detection ──────────────────────────────────────────────────────

function findDropoffPoints(scrollEvents: ScrollEvent[]): number[] {
  if (scrollEvents.length < 10) return [];

  // Group readers by maxDepth in 10% buckets
  const buckets = new Map<number, Set<string>>();
  for (let i = 0; i < 10; i++) {
    buckets.set(i, new Set());
  }

  for (const e of scrollEvents) {
    const bucket = Math.min(9, Math.floor(e.maxDepth * 10));
    buckets.get(bucket)?.add(e.sessionId);
  }

  const dropoffs: number[] = [];
  let prevCount = buckets.get(0)?.size || 0;

  for (let i = 1; i < 10; i++) {
    const currCount = buckets.get(i)?.size || 0;
    if (prevCount > 0 && currCount < prevCount * 0.9) {
      dropoffs.push(i / 10);
    }
    prevCount = currCount;
  }

  return dropoffs;
}

// ── Learning Effectiveness Score ───────────────────────────────────────────

interface LESInput {
  avgScrollCompletion: number;
  avgTimeOnPage: number;
  chartInteractions: number;
  timelineInteractions: number;
  faqExpansions: number;
  returnVisitorRate: number;
  shareRate: number;
  bookmarkRate: number;
  searchReferrals: number;
}

function computeLES(input: LESInput): number {
  // Normalize each metric to 0–1 (using reasonable benchmarks)
  const normalized = {
    scrollCompletion: Math.min(1, input.avgScrollCompletion / 0.8),
    timeOnPage: Math.min(1, input.avgTimeOnPage / 300000),    // 5 min = full score
    chartInteractions: Math.min(1, input.chartInteractions / 5), // 5 inter. = full
    timelineInteractions: Math.min(1, input.timelineInteractions / 3),
    faqExpansions: Math.min(1, input.faqExpansions / 2),
    returnVisitorRate: Math.min(1, input.returnVisitorRate / 0.3),
    shareRate: Math.min(1, input.shareRate / 0.05),             // 5% = full
    bookmarkRate: Math.min(1, input.bookmarkRate / 0.08),       // 8% = full
    searchReferrals: Math.min(1, input.searchReferrals / 20),   // 20 = full
  };

  // Weighted score
  const score =
    normalized.scrollCompletion * 0.20 +
    normalized.timeOnPage * 0.15 +
    normalized.chartInteractions * 0.10 +
    normalized.timelineInteractions * 0.05 +
    normalized.faqExpansions * 0.05 +
    normalized.returnVisitorRate * 0.15 +
    normalized.shareRate * 0.10 +
    normalized.bookmarkRate * 0.10 +
    normalized.searchReferrals * 0.10;

  return Math.round(score * 100);
}

// ── Story Improvement Engine ───────────────────────────────────────────────

export function generateImprovementReport(
  analytics: AggregateStoryAnalytics,
  previous?: AggregateStoryAnalytics
): ImprovementReport {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: ImprovementRecommendation[] = [];

  // Analyze scroll completion
  if (analytics.avgScrollCompletion >= 0.7) {
    strengths.push(`High scroll completion (${Math.round(analytics.avgScrollCompletion * 100)}%) — readers reach the end`);
  } else if (analytics.avgScrollCompletion < 0.5) {
    weaknesses.push(`Low scroll completion (${Math.round(analytics.avgScrollCompletion * 100)}%) — readers dropping off early`);
    recommendations.push({
      action: 'restructure',
      target: 'top sections',
      reason: `${Math.round(analytics.avgScrollCompletion * 100)}% scroll completion indicates early dropoff`,
      priority: 'high',
    });
  }

  // Analyze dropoff points
  if (analytics.highDropoffPoints.length > 0) {
    const worst = analytics.highDropoffPoints[0];
    weaknesses.push(`Readers drop off at ${Math.round(worst * 100)}% scroll depth`);
    recommendations.push({
      action: 'restructure',
      target: `section at ${Math.round(worst * 100)}% depth`,
      reason: `${Math.round((1 - worst) * 100)}% of readers lost at this point`,
      priority: 'high',
    });
  }

  // Analyze section engagement
  for (const [sectionId, engagement] of Object.entries(analytics.sectionEngagement)) {
    if (engagement.dropoffRate > 0.12) {
      weaknesses.push(`"${sectionId}" section has ${Math.round(engagement.dropoffRate * 100)}% dropoff rate`);
      recommendations.push({
        action: 'shorten',
        target: sectionId,
        reason: `${Math.round(engagement.dropoffRate * 100)}% dropoff rate`,
        priority: 'medium',
      });
    } else if (engagement.avgTime > 60000 && engagement.dropoffRate < 0.05) {
      strengths.push(`"${sectionId}" section holds attention (avg ${Math.round(engagement.avgTime / 1000)}s)`);
    }
  }

  // Analyze chart interaction
  const chartPerReader = analytics.chartInteractions / Math.max(analytics.totalReaders, 1);
  if (chartPerReader >= 2) {
    strengths.push(`High chart interaction (${chartPerReader.toFixed(1)} interactions per reader)`);
  } else if (chartPerReader < 0.5) {
    weaknesses.push(`Low chart interaction (${chartPerReader.toFixed(1)} per reader)`);
    recommendations.push({
      action: 'add_visual',
      target: 'charts',
      reason: `Only ${chartPerReader.toFixed(1)} chart interactions per reader`,
      priority: 'medium',
    });
  }

  // Analyze FAQ
  if (analytics.popularFAQIndices.length > 0) {
    const topFAQ = analytics.popularFAQIndices[0];
    strengths.push(`FAQ #${topFAQ + 1} is most expanded — readers are curious about this`);
  }
  if (analytics.faqExpansions / Math.max(analytics.totalReaders, 1) < 0.3) {
    weaknesses.push('Low FAQ engagement — consider more relevant questions');
    recommendations.push({
      action: 'add_faq',
      target: 'faq',
      reason: 'FAQ expansion rate below 0.3 per reader',
      priority: 'low',
    });
  }

  // Analyze return visits
  if (analytics.returnVisitorRate >= 0.2) {
    strengths.push(`Strong return visit rate (${Math.round(analytics.returnVisitorRate * 100)}%)`);
  } else if (analytics.returnVisitorRate < 0.1) {
    weaknesses.push(`Low return visit rate (${Math.round(analytics.returnVisitorRate * 100)}%)`);
    recommendations.push({
      action: 'expand',
      target: 'story depth',
      reason: `${Math.round(analytics.returnVisitorRate * 100)}% return rate — add more depth or follow-up content`,
      priority: 'medium',
    });
  }

  // Analyze shares
  const totalShares = Object.values(analytics.sharesPerMedium).reduce((a, b) => a + b, 0);
  if (totalShares > 0) {
    const topMedium = Object.entries(analytics.sharesPerMedium).sort((a, b) => b[1] - a[1])[0];
    strengths.push(`Shared ${totalShares} times — most on ${topMedium[0]}`);
  }

  // Compare with previous period
  let compareToPrevious: ImprovementReport['compareToPrevious'] = undefined;
  if (previous) {
    const scrollChange = analytics.avgScrollCompletion - previous.avgScrollCompletion;
    const timeChange = analytics.avgTimeOnPage - previous.avgTimeOnPage;
    compareToPrevious = {
      scrollCompletionChange: `${scrollChange >= 0 ? '+' : ''}${(scrollChange * 100).toFixed(0)}%`,
      avgTimeChange: `${timeChange >= 0 ? '+' : ''}${Math.round(timeChange / 1000)}s`,
    };
  }

  return {
    storySlug: analytics.storySlug,
    score: analytics.learningEffectivenessScore,
    strengths,
    weaknesses,
    recommendations,
    compareToPrevious,
  };
}

// ── Search Query Sanitization ──────────────────────────────────────────────

export function sanitizeQuery(query: string): string {
  return query
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

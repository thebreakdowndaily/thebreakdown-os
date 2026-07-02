import { NextRequest, NextResponse } from 'next/server';
import type { AnalyticsEvent } from '@/utils/analytics';
import { aggregateStoryAnalytics } from '@/utils/analytics';

// ── In-Memory Event Store (replace with DB in production) ──────────────────

interface EventStore {
  events: AnalyticsEvent[];
}

// Global store — persists across requests in development
const globalStore = global as unknown as { __analyticsEvents?: EventStore };
if (!globalStore.__analyticsEvents) {
  globalStore.__analyticsEvents = { events: [] };
}
const store = globalStore.__analyticsEvents;

const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const MAX_EVENTS_PER_SESSION = 100; // per window

interface RateLimitEntry {
  count: number;
  resetAt: number;
}
const rateLimitMap = new Map<string, RateLimitEntry>();

function checkRateLimit(sessionId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(sessionId);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(sessionId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (entry.count >= MAX_EVENTS_PER_SESSION) {
    return false;
  }

  entry.count++;
  return true;
}

// ── Validation ─────────────────────────────────────────────────────────────

const VALID_EVENT_TYPES = [
  'section_view', 'scroll', 'chart_interaction',
  'timeline_interaction', 'faq_expansion', 'search',
  'return_visit', 'share', 'bookmark',
];

function validateEvent(event: unknown): event is AnalyticsEvent {
  if (typeof event !== 'object' || event === null) return false;
  const e = event as Record<string, unknown>;
  if (typeof e.type !== 'string' || !VALID_EVENT_TYPES.includes(e.type)) return false;
  if (typeof e.storySlug !== 'string') return false;
  if (typeof e.ts !== 'string') return false;
  return true;
}

// ── POST /api/analytics — Receive event batch ─────────────────────────────

interface EventBatch {
  events?: unknown[];
  sessionId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as EventBatch;

    if (!body.events || body.events.length === 0) {
      return NextResponse.json({ error: 'Invalid payload: events array required' }, { status: 400 });
    }

    const sessionId = body.sessionId || 'unknown';

    if (!checkRateLimit(sessionId)) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const batch = body.events.slice(0, 50);
    let validCount = 0;
    let invalidCount = 0;

    for (const event of batch) {
      if (validateEvent(event)) {
        store.events.push(event);
        validCount++;
      } else {
        invalidCount++;
      }
    }

    console.log(
      `[Analytics] Stored ${String(validCount)} events from session ${sessionId.slice(0, 12)}... ` +
      `(${String(invalidCount)} invalid dropped). Total: ${String(store.events.length)}`
    );

    return NextResponse.json({
      accepted: validCount,
      dropped: invalidCount,
      totalStored: store.events.length,
    });
  } catch (error) {
    console.error('[Analytics] Error processing event batch:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ── GET /api/analytics — Retrieve aggregated analytics ─────────────────────

export function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const storySlug = searchParams.get('story');
  const aggregate = searchParams.get('aggregate') !== 'false';

  if (store.events.length === 0) {
    return NextResponse.json({
      events: [],
      analytics: null,
      totalEvents: 0,
    });
  }

  // Filter by story slug if provided
  let filteredEvents = store.events;
  if (storySlug) {
    filteredEvents = store.events.filter((e) => e.storySlug === storySlug);
  }

  // Return aggregated analytics
  if (aggregate && storySlug) {
    const analytics = aggregateStoryAnalytics(filteredEvents, storySlug);
    analytics.period = {
      start: store.events.length > 0 ? store.events[0].ts : new Date().toISOString(),
      end: store.events.length > 0 ? store.events[store.events.length - 1].ts : new Date().toISOString(),
    };

    return NextResponse.json({
      events: filteredEvents.slice(-100), // Last 100 raw events for debugging
      analytics,
      totalEvents: filteredEvents.length,
    });
  }

  // Return summary
  const storySlugs = [...new Set(store.events.map((e) => e.storySlug))];
  const eventTypeCounts: Record<string, number> = {};
  for (const e of store.events) {
    eventTypeCounts[e.type] = (eventTypeCounts[e.type] || 0) + 1;
  }

  return NextResponse.json({
    summary: {
      totalEvents: store.events.length,
      uniqueStories: storySlugs.length,
      stories: storySlugs,
      eventTypeCounts,
      oldestEvent: store.events[0]?.ts,
      newestEvent: store.events[store.events.length - 1]?.ts,
    },
    events: filteredEvents.slice(-50),
  });
}

// ── DELETE /api/analytics — Clear events (dev only) ────────────────────────

export function DELETE() {
  const count = store.events.length;
  store.events = [];
  rateLimitMap.clear();
  return NextResponse.json({ cleared: count });
}

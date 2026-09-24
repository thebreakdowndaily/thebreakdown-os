import { NextRequest, NextResponse } from 'next/server';
import type { AnalyticsEvent } from '@/utils/analytics';
import { validateApiKeyAsync } from '@/utils/api-auth';

interface EventStore {
  events: AnalyticsEvent[];
}

// Global store — persists across requests in development and test environments
const globalStore = global as unknown as { __analyticsEvents?: EventStore };
if (!globalStore.__analyticsEvents) {
  globalStore.__analyticsEvents = { events: [] };
}
const store = globalStore.__analyticsEvents;

export function getAnalyticsEvents(): AnalyticsEvent[] {
  return store.events;
}

export function getAnalyticsStore(): EventStore {
  return store;
}

export async function requireAnalyticsAdmin(request: NextRequest): Promise<NextResponse | null> {
  const key = request.headers.get('x-api-key');
  if (!key) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

  try {
    const principal = await validateApiKeyAsync(key);
    if (!principal || principal.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
  } catch {
    return NextResponse.json({ error: 'Authentication unavailable' }, { status: 503 });
  }
  return null;
}

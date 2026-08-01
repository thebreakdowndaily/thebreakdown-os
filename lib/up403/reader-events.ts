'use client';

import { PluginAnalyticsService } from '@/services/analytics/service';
import type { AnalyticsEvent } from '@/types/canonical';

const analyticsService = new PluginAnalyticsService();

function safeTrack(event: AnalyticsEvent): void {
  try {
    analyticsService.track(event);
  } catch {
    // Fail silent — reader analytics must never break a reading session
  }
}

export function trackReaderEvent(type: string, metadata?: Record<string, unknown>): void {
  safeTrack({ type, timestamp: new Date().toISOString(), metadata });
}

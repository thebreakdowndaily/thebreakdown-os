import type { AnalyticsEvent } from '@/types/canonical';

export interface AnalyticsPlugin {
  name: string;
  track(event: AnalyticsEvent): void;
}

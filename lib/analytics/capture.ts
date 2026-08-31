/**
 * TASK-07 — Canonical core-event capture layer.
 *
 * This is the single, typed vocabulary for reader-funnel events. It forwards
 * only to GA4 (gtag) and only from the production host. It intentionally does
 * NOT share the internal learning-analytics event store (/api/analytics),
 * which is a separate, CMS-facing aggregation concern.
 *
 * Conventions (governed by TASK-07 Event Naming / Parameters):
 *  - Event names: lowercase_snake_case, no variants.
 *  - Payloads: minimal allow-list per event; unknown params are dropped.
 *  - No personal data, no full query strings, no article text, no secrets.
 */

import { isProductionAnalytics } from './environment';
import { extractDomain } from './channels';

export const CORE_EVENTS = [
  'story_opened',
  'story_completed',
  'topic_opened',
  'entity_opened',
  'evidence_expanded',
  'source_opened',
  'document_opened',
  'search_performed',
  'search_result_clicked',
  'related_story_clicked',
  'topic_link_clicked',
  'entity_link_clicked',
  'newsletter_viewed',
  'newsletter_started',
  'newsletter_submitted',
  'newsletter_subscribed',
  'newsletter_error',
  'topic_followed',
  'topic_unfollowed',
  'story_saved',
  'story_unsaved',
  'reader_dashboard_opened',
  'landing',
  'reader_returned',
  'ad_blocker_detected',
  'membership_purchased',
  'ad_slot_rendered',
  'ad_clicked',
  'paywall_viewed',
  'paywall_action_clicked',
  'dataset_download_started',
  'premium_data_viewed',
  'citation_exported',
  'license_seat_invited',
  'share_clicked',
  'claim_opened',
  'tracker_viewed',
  'chart_interacted',
  'document_preview_opened',
] as const;

export type CoreEventName = (typeof CORE_EVENTS)[number];

export const ALLOWED_PARAMS: Record<CoreEventName, readonly string[]> = {
  story_opened: ['content_id', 'content_type'],
  story_completed: ['content_id', 'content_type', 'scroll_depth_pct'],
  topic_opened: ['topic_id'],
  entity_opened: ['entity_id'],
  evidence_expanded: ['content_id', 'claim_id', 'evidence_path'],
  source_opened: ['content_id', 'source_title', 'source_domain'],
  document_opened: ['content_id', 'document_title', 'document_domain'],
  search_performed: ['search_query', 'results_count', 'search_type'],
  search_result_clicked: ['search_query', 'result_type', 'result_id', 'result_position'],
  related_story_clicked: ['source_id', 'target_id', 'position'],
  topic_link_clicked: ['source_id', 'topic_id'],
  entity_link_clicked: ['source_id', 'entity_id'],
  newsletter_viewed: ['page'],
  newsletter_started: ['page'],
  newsletter_submitted: ['page'],
  newsletter_subscribed: ['page'],
  newsletter_error: ['page'],
  topic_followed: ['topic_id'],
  topic_unfollowed: ['topic_id'],
  story_saved: ['content_id', 'content_type'],
  story_unsaved: ['content_id', 'content_type'],
  reader_dashboard_opened: ['tab'],
  landing: [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_content',
    'distribution_channel',
    'referrer_type',
    'landing_page',
  ],
  reader_returned: ['stories_read', 'days_since_last'],
  ad_blocker_detected: ['active'],
  'membership_purchased': ['plan_id'],
  'ad_slot_rendered': ['placement'],
  'ad_clicked': ['placement'],
  'paywall_viewed': ['placement', 'story_slug'],
  'paywall_action_clicked': ['placement', 'action_type'],
  'dataset_download_started': ['dataset_id', 'status'],
  'premium_data_viewed': ['dataset_id'],
  'citation_exported': ['format', 'story_slug'],
  'license_seat_invited': ['role'],
  'share_clicked': ['platform', 'story_slug'],
  'claim_opened': ['content_id', 'claim_id'],
  'tracker_viewed': ['tracker_id', 'topic'],
  'chart_interacted': ['chart_id', 'tracker_id'],
  'document_preview_opened': ['document_title', 'tracker_id'],
};

/** GA4 reserves these; our taxonomy must never emit them. */
export const RESERVED_GA4_EVENT_NAMES = new Set([
  'ad_activeview',
  'ad_click',
  'ad_exposure',
  'ad_impression',
  'ad_query',
  'adunit_exposure',
  'app_clear_data',
  'app_install',
  'app_remove',
  'app_store_refund',
  'app_store_subscription_cancel',
  'app_store_subscription_convert',
  'app_store_subscription_renew',
  'error',
  'first_open',
  'first_visit',
  'in_app_purchase',
  'notification_dismiss',
  'notification_foreground',
  'notification_open',
  'notification_receive',
  'os_update',
  'page_view',
  'screen_view',
  'scroll',
  'session_start',
  'user_engagement',
  'view_search_results',
]);

const INVALID_NAME = /[^a-zA-Z0-9_]/;
const MAX_EVENT_NAME_LENGTH = 40;
const MAX_PARAM_LENGTH = 40;
const MAX_STRING_VALUE_LENGTH = 200;

export interface CapturedParams {
  [key: string]: string | number | undefined;
}

interface GtagWindow {
  gtag?: (command: string, ...args: unknown[]) => void;
}

export function sanitizeSearchQuery(query: string): string {
  return query.slice(0, MAX_STRING_VALUE_LENGTH);
}

export function isValidEventName(name: string): boolean {
  return (
    CORE_EVENTS.includes(name as CoreEventName) &&
    name.length <= MAX_EVENT_NAME_LENGTH &&
    !INVALID_NAME.test(name) &&
    !RESERVED_GA4_EVENT_NAMES.has(name)
  );
}

/**
 * Dispatch a canonical core event to GA4.
 * Returns true when the event was actually dispatched.
 * Safe to call from any environment; it no-ops outside production.
 */
export function captureEvent(name: CoreEventName, params: CapturedParams = {}): boolean {
  try {
    if (!isProductionAnalytics()) return false;
    if (!isValidEventName(name)) return false;

    const allowed = ALLOWED_PARAMS[name];
    const payload: Record<string, string | number> = {};

    for (const key of allowed) {
      const value = params[key];
      if (value === undefined) continue;
      if (key.length > MAX_PARAM_LENGTH) continue;
      if (typeof value === 'number') {
        payload[key] = Number.isFinite(value) ? value : 0;
      } else {
        const text = value.slice(0, MAX_STRING_VALUE_LENGTH);
        if (text) payload[key] = text;
      }
    }

    const w = window as unknown as GtagWindow;
    if (typeof w.gtag !== 'function') return false;
    w.gtag('event', name, payload);
    return true;
  } catch {
    return false;
  }
}

/** Convenience builder for source/document opens with automatic domain extraction. */
export function buildOutboundParams(
  contentId: string,
  url: string,
  title: string
): { content_id: string; source_title: string; source_domain: string } {
  return {
    content_id: contentId,
    source_title: (title || url).slice(0, MAX_STRING_VALUE_LENGTH),
    source_domain: extractDomain(url),
  };
}


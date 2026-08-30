/**
 * TASK-07 — Analytics environment separation.
 *
 * First-party analytics must only reach GA4 from the production host.
 * Development and preview must not pollute production measurement.
 *
 * Governed by: TASK-07 (Analytics Access, Environment Separation).
 */

export const PRODUCTION_ANALYTICS_HOSTS = ['thebreakdown.in', 'www.thebreakdown.in'];

export function isProductionHost(hostname?: string): boolean {
  const host = (
    typeof window !== 'undefined' ? window.location.hostname : hostname
  )?.toLowerCase() ?? '';
  return PRODUCTION_ANALYTICS_HOSTS.some(
    (h) => host === h || host.endsWith(`.${h}`)
  );
}

export function isAnalyticsConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID);
}

/**
 * True only when the current runtime is a production build (NODE_ENV),
 * the GA measurement ID is configured, and the host is the production host.
 * Used client-side as the single gate for all GA4 event dispatch.
 */
export function isProductionAnalytics(hostname?: string): boolean {
  if (process.env.NODE_ENV !== 'production') return false;
  return isAnalyticsConfigured() && isProductionHost(hostname);
}
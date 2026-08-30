/**
 * TASK-07 — Canonical channel attribution model.
 *
 * Search acquisition (intent-driven) is never merged with discovery
 * acquisition (social / referral / direct). A landing is classified using
 * UTM parameters first and document.referrer only when UTM is absent.
 *
 * Governed by: TASK-07 (Channel Attribution, Search vs Discovery).
 */

export type ReferrerType =
  | 'organic_search'
  | 'social'
  | 'referral'
  | 'direct';

export type DiscoveryChannel =
  | 'social'
  | 'newsletter'
  | 'referral'
  | 'direct'
  | 'other';

const SEARCH_HOST_SUFFIXES = [
  'google.com',
  'google.co.in',
  'google.co.uk',
  'google.de',
  'google.fr',
  'google.jp',
  'google.in',
  'bing.com',
  'duckduckgo.com',
  'yahoo.com',
  'yandex.com',
  'yandex.ru',
  'ecosia.org',
  'search.brave.com',
  'brave.com',
];

const SOCIAL_HOSTS = [
  'twitter.com',
  'x.com',
  'linkedin.com',
  'facebook.com',
  'instagram.com',
  'youtube.com',
  'whatsapp.com',
  'telegram.me',
  't.me',
  'threads.net',
];

const SOCIAL_SOURCE_TOKENS = [
  'twitter',
  'x',
  'linkedin',
  'facebook',
  'fb',
  'instagram',
  'youtube',
  'whatsapp',
  'telegram',
  'threads',
  'tiktok',
  'reddit',
];

function isSearchEngineHost(host: string): boolean {
  return SEARCH_HOST_SUFFIXES.some((s) => host === s || host.endsWith(`.${s}`));
}

export function classifyReferrer(referrer: string): ReferrerType {
  if (!referrer) return 'direct';
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, '').toLowerCase();
    if (isSearchEngineHost(host)) return 'organic_search';
    if (SOCIAL_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) return 'social';
    return 'referral';
  } catch {
    return 'referral';
  }
}

export function classifyDiscoveryChannel(
  utmSource: string,
  referrer: string
): DiscoveryChannel {
  if (utmSource) {
    const source = utmSource.toLowerCase();
    if (source === 'social') return 'social';
    const tokens = source.split(/[^a-z0-9]+/).filter(Boolean);
    if (tokens.some((t) => SOCIAL_SOURCE_TOKENS.includes(t))) return 'social';
    if (tokens.some((t) => t.includes('newsletter'))) return 'newsletter';
    return 'other';
  }
  const type = classifyReferrer(referrer);
  if (type === 'social') return 'social';
  if (type === 'referral') return 'referral';
  if (type === 'organic_search') return 'other';
  return 'direct';
}

export function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}
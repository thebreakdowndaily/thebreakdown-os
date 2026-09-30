import { createHash } from 'node:crypto';
import type { SourceCandidate, DiscoveredEndpoint } from './types';
import { SourceCandidateValidator, ValidationContext } from './validation';
import type { CountryPack } from '@/data/radar/countries';
import type { RadarBeat } from '../types';

export interface DiscoveryOptions {
  countryPack: CountryPack;
  organizationName: string;
  seedUrl: string;
  state?: string;
  district?: string;
  city?: string;
  firstOrderAdmin?: string;
  secondOrderAdmin?: string;
  thirdOrderAdmin?: string;
  locality?: string;
  beatHint?: RadarBeat;
}

export class SourceDiscoveryEngine {
  private validator = new SourceCandidateValidator();

  /**
   * Discovers candidate endpoints from a seed organizational portal and validates them.
   * Produces SourceCandidates with validationStatus 'candidate' or 'validated'.
   * NEVER marks as approved or active autonomously (Section 21).
   */
  public async discoverFromPortal(
    options: DiscoveryOptions,
    validationContext: ValidationContext = {}
  ): Promise<SourceCandidate[]> {
    const { countryPack, organizationName, seedUrl } = options;
    const firstOrder = options.firstOrderAdmin || options.state || (countryPack.countryCode === 'IN' ? 'mp' : undefined);
    const secondOrder = options.secondOrderAdmin || options.district;
    const thirdOrder = options.thirdOrderAdmin;
    const loc = options.locality || options.city;
    const candidates: SourceCandidate[] = [];

    let html = '';
    let fetchedUrl = seedUrl;

    try {
      const abort = new AbortController();
      const timer = setTimeout(() => abort.abort(), 8000);
      const res = await fetch(seedUrl, {
        signal: abort.signal,
        headers: { 'User-Agent': 'TheBreakdownDiscovery/1.0', Accept: 'text/html,*/*' },
      });
      clearTimeout(timer);

      if (res.ok) {
        html = await res.text();
        fetchedUrl = res.url || seedUrl;
      }
    } catch {
      // If portal cannot be fetched directly, create base candidate for review
    }

    const endpoints = this.extractEndpointsFromHtml(html, fetchedUrl);

    // If no endpoints found, default to HTML portal
    if (endpoints.length === 0) {
      endpoints.push({
        url: fetchedUrl,
        type: 'html',
        title: organizationName,
        confidence: 0.6,
      });
    }

    const matchedBeat = options.beatHint || this.inferBeat(organizationName, html, countryPack);

    for (const ep of endpoints) {
      const id = `cand_${createHash('sha256').update(ep.url).digest('hex').substring(0, 16)}`;
      const candidate: SourceCandidate = {
        id,
        geography: {
          country: countryPack.countryCode,
          state: firstOrder,
          district: secondOrder,
          city: loc,
          firstOrderAdmin: firstOrder,
          secondOrderAdmin: secondOrder,
          thirdOrderAdmin: thirdOrder,
          locality: loc,
        },
        organizationName,
        sourceType: 'GOVERNMENT',
        url: ep.url,
        canonicalDomain: new URL(ep.url).hostname.replace(/^www\./, ''),
        discoveredFrom: seedUrl,
        feedType: ep.type,
        beat: matchedBeat,
        authorityClass: this.inferAuthority(organizationName, ep.url),
        officialStatus: 'official_primary',
        discoveryConfidence: ep.confidence,
        validationStatus: 'candidate',
        discoveredAt: new Date().toISOString(),
      };

      // Run through validation
      const validated = await this.validator.validate(candidate, validationContext);
      candidates.push(validated);
    }

    return candidates;
  }

  private extractEndpointsFromHtml(html: string, baseUrl: string): DiscoveredEndpoint[] {
    const endpoints: DiscoveredEndpoint[] = [];
    if (!html) return endpoints;

    // 1. RSS / Atom feed discovery
    const rssRegex = /<link[^>]+type=["']application\/(rss\+xml|atom\+xml)["'][^>]*href=["']([^"']+)["']/gi;
    let match: RegExpExecArray | null;
    while ((match = rssRegex.exec(html)) !== null) {
      try {
        const fullUrl = new URL(match[2], baseUrl).toString();
        endpoints.push({ url: fullUrl, type: 'rss', confidence: 0.95 });
      } catch {
        // ignore
      }
    }

    // 2. Gazette / Official PDF orders
    const pdfRegex = /<a[^>]+href=["']([^"']+\.pdf)["'][^>]*>([\s\S]*?)<\/a>/gi;
    let pdfMatch: RegExpExecArray | null;
    while ((pdfMatch = pdfRegex.exec(html)) !== null) {
      try {
        const linkText = pdfMatch[2].toLowerCase();
        if (linkText.includes('order') || linkText.includes('gazette') || linkText.includes('आदेश') || linkText.includes('notification')) {
          const fullUrl = new URL(pdfMatch[1], baseUrl).toString();
          endpoints.push({ url: fullUrl, type: 'pdf', title: pdfMatch[2].trim(), confidence: 0.85 });
        }
      } catch {
        // ignore
      }
    }

    // 3. SPA detection (Next.js / Nuxt / React hydration)
    if (html.includes('id="__NEXT_DATA__"') || html.includes('window.__INITIAL_STATE__')) {
      endpoints.push({ url: baseUrl, type: 'browser', confidence: 0.8 });
    }

    return endpoints;
  }

  private inferBeat(orgName: string, html: string, pack: CountryPack): RadarBeat {
    const combined = `${orgName} ${html.substring(0, 1000)}`.toLowerCase();
    for (const pattern of pack.discoveryPatterns) {
      for (const kw of pattern.institutionKeywords) {
        if (combined.includes(kw.toLowerCase())) {
          return pattern.beat as RadarBeat;
        }
      }
    }
    return 'government';
  }

  private inferAuthority(orgName: string, url: string): SourceCandidate['authorityClass'] {
    const lower = `${orgName} ${url}`.toLowerCase();
    if (lower.includes('court') || lower.includes('न्यायालय') || lower.includes('judiciary')) {
      return 'JUDICIAL';
    }
    if (lower.includes('.nic.in') || lower.includes('.gov.in') || lower.includes('.gov')) {
      return 'PRIMARY';
    }
    return 'HIGH_QUALITY_SECONDARY';
  }
}

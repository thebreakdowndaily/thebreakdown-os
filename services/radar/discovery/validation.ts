import { isSafeExternalUrl } from '../collectors/security';
import type { SourceCandidate, CandidateRejectionReason } from './types';
import type { RadarSourceDefinition } from '../types';

export interface ValidationContext {
  existingSources?: RadarSourceDefinition[];
  existingCandidates?: SourceCandidate[];
  timeoutMs?: number;
}

export class SourceCandidateValidator {
  /**
   * Validates a candidate against SSRF, reachability, content validity, and duplication.
   */
  public async validate(
    candidate: SourceCandidate,
    context: ValidationContext = {}
  ): Promise<SourceCandidate> {
    const errors: string[] = [];
    const timeout = context.timeoutMs || 5000;

    // 1. URL Security & SSRF Protection
    const ssrfCheck = isSafeExternalUrl(candidate.url);
    if (!ssrfCheck.safe) {
      return this.reject(candidate, 'ssrf_blocked', [`SSRF check failed: ${ssrfCheck.reason}`]);
    }

    // 2. Duplicate & Mirror Detection against active sources
    const canonicalDomain = this.extractCanonicalDomain(candidate.url);
    candidate.canonicalDomain = canonicalDomain;

    if (context.existingSources) {
      const exactMatch = context.existingSources.find(
        (s) => s.url.toLowerCase() === candidate.url.toLowerCase()
      );
      if (exactMatch) {
        return this.reject(candidate, 'duplicate_source', [
          `URL matches existing active source ID ${exactMatch.id}`,
        ]);
      }

      const domainMatch = context.existingSources.find(
        (s) => s.canonicalDomain.toLowerCase() === canonicalDomain.toLowerCase() && s.collectorType === candidate.feedType
      );
      if (domainMatch) {
        return this.reject(candidate, 'mirror_domain', [
          `Domain and collector type already monitored by source ID ${domainMatch.id}`,
        ]);
      }
    }

    if (context.existingCandidates) {
      const candidateMatch = context.existingCandidates.find(
        (c) => c.id !== candidate.id && c.url.toLowerCase() === candidate.url.toLowerCase()
      );
      if (candidateMatch) {
        return this.reject(candidate, 'duplicate_source', [
          `Candidate already queued under ID ${candidateMatch.id}`,
        ]);
      }
    }

    // 3. Network Reachability & Content-Type Verification
    try {
      const abort = new AbortController();
      const timer = setTimeout(() => abort.abort(), timeout);

      const res = await fetch(candidate.url, {
        method: 'GET',
        signal: abort.signal,
        headers: {
          'User-Agent': 'TheBreakdownDiscovery/1.0',
          Accept: '*/*',
        },
      });
      clearTimeout(timer);

      if (!res.ok) {
        return this.reject(candidate, 'unreachable', [`HTTP error ${res.status}: ${res.statusText}`]);
      }

      const contentType = (res.headers.get('content-type') || '').toLowerCase();

      // Validate collector compatibility
      if (candidate.feedType === 'pdf') {
        const isPdf = contentType.includes('pdf') || candidate.url.toLowerCase().endsWith('.pdf');
        if (!isPdf) {
          return this.reject(candidate, 'unsupported_feed_format', [
            `Expected PDF content-type, received ${contentType}`,
          ]);
        }
      } else if (candidate.feedType === 'rss') {
        const isFeed = contentType.includes('xml') || contentType.includes('rss') || contentType.includes('atom');
        if (!isFeed) {
          return this.reject(candidate, 'unsupported_feed_format', [
            `Expected RSS/XML content-type, received ${contentType}`,
          ]);
        }
      }

      // Check for content farm signatures
      const sampleText = (await res.text()).substring(0, 4000).toLowerCase();
      if (sampleText.includes('buy this domain') || sampleText.includes('domain for sale') || sampleText.includes('parked page')) {
        return this.reject(candidate, 'content_farm', ['Detected parked domain or domain-sale page']);
      }

    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return this.reject(candidate, 'unreachable', ['Request timed out during validation']);
      }
      return this.reject(candidate, 'unreachable', [err instanceof Error ? err.message : String(err)]);
    }

    // Successfully validated candidate
    return {
      ...candidate,
      validationStatus: 'validated',
      validatedAt: new Date().toISOString(),
      validationErrors: [],
    };
  }

  private reject(
    candidate: SourceCandidate,
    reason: CandidateRejectionReason,
    errors: string[]
  ): SourceCandidate {
    return {
      ...candidate,
      validationStatus: 'rejected',
      rejectionReason: reason,
      validationErrors: errors,
      validatedAt: new Date().toISOString(),
    };
  }

  private extractCanonicalDomain(urlString: string): string {
    try {
      const parsed = new URL(urlString);
      return parsed.hostname.replace(/^www\./, '').toLowerCase();
    } catch {
      return urlString.toLowerCase();
    }
  }
}

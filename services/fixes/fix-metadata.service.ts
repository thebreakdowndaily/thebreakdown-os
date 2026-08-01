// ── Fix Canonical Metadata Service (AR-13A.0 Specification) ───────────────────

import { Fix } from '../../types/canonical';

export interface OpenGraphMetadata {
  'og:type': string;
  'og:title': string;
  'og:description': string;
  'og:url': string;
  'og:site_name': string;
  'twitter:card': string;
  'twitter:title': string;
  'twitter:description': string;
  canonicalUrl: string;
}

export interface SchemaOrgLegislationJSONLD {
  '@context': string;
  '@type': string;
  '@id': string;
  url: string;
  name: string;
  headline: string;
  description: string;
  legislationType: string;
  legislationPassedBy?: {
    '@type': string;
    name: string;
  };
  datePublished?: string;
  dateModified?: string;
  publisher: {
    '@type': string;
    name: string;
    url: string;
  };
  citation?: Array<{
    '@type': string;
    name: string;
    url?: string;
  }>;
}

export class FixMetadataService {
  public static readonly DEFAULT_BASE_URL = 'https://thebreakdown.gov';

  /**
   * Generates absolute Canonical URL for a Fix.
   */
  public static toCanonicalUrl(fix: Fix, baseUrl = FixMetadataService.DEFAULT_BASE_URL): string {
    return `${baseUrl}/fix/${fix.slug}`;
  }

  /**
   * Projects a canonical Fix into Schema.org JSON-LD graph structure.
   */
  public static toJSONLD(fix: Fix, baseUrl = FixMetadataService.DEFAULT_BASE_URL): SchemaOrgLegislationJSONLD {
    const canonicalUrl = this.toCanonicalUrl(fix, baseUrl);
    const title = fix.title || fix.headline || '';
    const summary = fix.summary || fix.problemStatement || '';

    return {
      '@context': 'https://schema.org',
      '@type': 'Legislation',
      '@id': `${canonicalUrl}#fix`,
      url: canonicalUrl,
      name: title,
      headline: title,
      description: summary,
      legislationType: fix.primaryCategory || 'Administrative Reform',
      legislationPassedBy: fix.responsibleActorIds?.[0]
        ? {
            '@type': 'GovernmentOrganization',
            name: fix.responsibleActorIds[0],
          }
        : undefined,
      datePublished: fix.publishedAt || fix.lastVerified,
      dateModified: fix.updatedAt || fix.lastVerified,
      publisher: {
        '@type': 'NewsMediaOrganization',
        name: 'The Breakdown Knowledge Platform',
        url: baseUrl,
      },
      citation: fix.sources?.map((s) => ({
        '@type': 'CreativeWork',
        name: s.title,
        url: s.url,
      })),
    };
  }

  /**
   * Projects a canonical Fix into OpenGraph Protocol and Twitter Card meta tags.
   */
  public static toOpenGraph(fix: Fix, baseUrl = FixMetadataService.DEFAULT_BASE_URL): OpenGraphMetadata {
    const canonicalUrl = this.toCanonicalUrl(fix, baseUrl);
    const title = fix.title || fix.headline || '';
    const summary = fix.summary || '';

    return {
      'og:type': 'article',
      'og:title': `Fix: ${title}`,
      'og:description': summary,
      'og:url': canonicalUrl,
      'og:site_name': 'The Breakdown Knowledge Platform',
      'twitter:card': 'summary_large_image',
      'twitter:title': `Fix: ${title}`,
      'twitter:description': `Evidence Grade: ${fix.evidenceGrade || 'Moderate'} | Maturity: ${fix.maturityStatus || 'Proposed'} | Time to Impact: ${fix.timeToImpact || 'Short-Term'}`,
      canonicalUrl,
    };
  }

  /**
   * Generates RIS Bibliographic Citation format (EndNote / Zotero export).
   */
  public static toRISCitation(fix: Fix, baseUrl = FixMetadataService.DEFAULT_BASE_URL): string {
    const canonicalUrl = this.toCanonicalUrl(fix, baseUrl);
    const title = fix.title || fix.headline || '';
    const year = fix.publishedAt ? new Date(fix.publishedAt).getFullYear() : new Date().getFullYear();

    return [
      'TY  - GOVT',
      `TI  - ${title}`,
      `AU  - The Breakdown Editorial Bureau`,
      `PY  - ${year}`,
      `UR  - ${canonicalUrl}`,
      `N2  - ${fix.summary || ''}`,
      'ER  -',
    ].join('\n');
  }
}

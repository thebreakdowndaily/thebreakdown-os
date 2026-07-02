/**
 * THE BREAKDOWN — SEO Generator
 *
 * Pure functions for generating meta tags, JSON-LD, Open Graph,
 * Twitter Cards, and breadcrumb structured data.
 */

import type { SEOData, Breadcrumb } from './types';

export function generateMetaTags(seo: SEOData): Record<string, string> {
  const tags: Record<string, string> = {
    title: seo.title,
    description: seo.description,
    canonical: seo.canonical,
    'og:title': seo.title,
    'og:description': seo.description,
    'og:image': seo.ogImage || '/images/og-default.jpg',
    'og:type': seo.ogType,
    'og:url': seo.canonical,
    'twitter:card': seo.twitterCard || 'summary_large_image',
    'twitter:title': seo.title,
    'twitter:description': seo.description,
    'twitter:image': seo.ogImage || '/images/og-default.jpg',
    keywords: seo.keywords || '',
  };

  if (seo.ogPublishDate) {
    tags['article:published_time'] = seo.ogPublishDate;
  }

  return tags;
}

export function generateJsonLd(schema: Record<string, any>): string {
  const full = {
    '@context': 'https://schema.org',
    ...schema,
  };
  return JSON.stringify(full, null, 2);
}

export function generateOpenGraph(seo: SEOData): Record<string, string> {
  const og: Record<string, string> = {
    'og:title': seo.title,
    'og:description': seo.description,
    'og:image': seo.ogImage || '/images/og-default.jpg',
    'og:type': seo.ogType,
    'og:url': seo.canonical,
  };

  if (seo.ogPublishDate) {
    og['og:updated_time'] = seo.ogPublishDate;
  }

  return og;
}

export function generateTwitterCard(seo: SEOData): Record<string, string> {
  return {
    'twitter:card': seo.twitterCard || 'summary_large_image',
    'twitter:title': seo.title,
    'twitter:description': seo.description,
    'twitter:image': seo.ogImage || '/images/og-default.jpg',
  };
}

export function generateBreadcrumbJsonLd(breadcrumbs: Breadcrumb[]): Record<string, any> {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.label,
      item: crumb.href.startsWith('http')
        ? crumb.href
        : `https://thebreakdown.in${crumb.href}`,
    })),
  };
}

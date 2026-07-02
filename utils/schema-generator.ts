/**
 * THE BREAKDOWN — Schema.org Generator
 *
 * Generates structured data objects for all page types.
 */

import type { StoryJSON, EntityJSON, Breadcrumb, FAQItem } from './types';

export function articleSchema(story: StoryJSON): Record<string, any> {
  return {
    '@type': 'NewsArticle',
    headline: story.headline,
    description: story.summary,
    datePublished: story.publishedAt,
    dateModified: story.updatedAt,
    author: story.author
      ? {
          '@type': 'Person',
          name: story.author.name,
          url: story.author.url,
        }
      : undefined,
    publisher: {
      '@type': 'Organization',
      name: 'The Breakdown',
      url: 'https://thebreakdown.in',
    },
    image: story.heroImage,
    mainEntityOfPage: `https://thebreakdown.in/story/${story.slug}`,
    wordCount: story.wordCount,
    timeRequired: `PT${story.readingTime}M`,
    keywords: story.tags?.join(', '),
    articleSection: story.category,
  };
}

export function personSchema(entity: EntityJSON): Record<string, any> {
  return {
    '@type': 'Person',
    name: entity.name,
    description: entity.description,
    url: `https://thebreakdown.in/entity/${entity.slug}`,
    image: entity.image,
    ...(entity.aliases ? { additionalName: entity.aliases } : {}),
  };
}

export function organizationSchema(entity: EntityJSON): Record<string, any> {
  return {
    '@type': 'Organization',
    name: entity.name,
    description: entity.description,
    url: `https://thebreakdown.in/entity/${entity.slug}`,
    image: entity.image,
    ...(entity.aliases ? { alternateName: entity.aliases } : {}),
  };
}

export function websiteSchema(): Record<string, any> {
  return {
    '@type': 'WebSite',
    name: 'The Breakdown',
    url: 'https://thebreakdown.in',
    description: 'Independent, data-driven journalism on Indian policy, politics, and society.',
    publisher: {
      '@type': 'Organization',
      name: 'The Breakdown',
      url: 'https://thebreakdown.in',
    },
  };
}

export function breadcrumbListSchema(crumbs: Breadcrumb[]): Record<string, any> {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.label,
      item: crumb.href.startsWith('http')
        ? crumb.href
        : `https://thebreakdown.in${crumb.href}`,
    })),
  };
}

export function faqPageSchema(faqs: FAQItem[]): Record<string, any> {
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function sitelinksSearchBox(): Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'The Breakdown',
    url: 'https://thebreakdown.in',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://thebreakdown.in/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

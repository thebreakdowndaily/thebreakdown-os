import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/founding-edition',
          '/methodology',
          '/trust',
          '/editorial-constitution',
          '/series',
          '/story',
          '/stories',
          '/fix',
          '/data',
          '/datasets',
          '/country',
          '/countries',
          '/entity',
          '/entities',
          '/topic',
          '/topics',
          '/about',
          '/investigation',
          '/investigations',
          '/compare',
          '/trackers',
          '/newsletter',
          '/subscribe',
          '/timeline',
          '/transparency/corrections',
        ],
        disallow: [
          // Internal tools — must never be indexed
          '/workspace',
          '/admin',
          '/cms',
          '/editorial/',
          '/dashboard',
          '/newsroom',
          '/editor',
          '/api',
          '/settings',
          '/login',
          '/reader',
          '/search',
          '/graph',
          '/explorer',
          '/performance',
          '/operations',
          // Deprecated legacy routes
          '/problems',
          '/evolution',
          '/precedents',
          '/tracking',
          // Sub-products / experimental routes not ready for public
          '/up403',
          // Non-existent or legacy plural paths
          '/timelines',
        ],
      },
    ],
    sitemap: [
      'https://thebreakdown.in/sitemap.xml',
      'https://thebreakdown.in/news-sitemap.xml',
    ],
  };
}

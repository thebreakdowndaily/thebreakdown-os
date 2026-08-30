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
          '/problems',
          '/compare',
          '/evolution',
          '/precedents',
          '/tracking',
        ],
        disallow: [
          // Internal tools — must never be indexed
          '/workspace',
          '/admin',
          '/cms',
          '/editorial',
          '/dashboard',
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
          // Sub-products / experimental routes not ready for public
          '/up403',
          // Empty pages
          '/timelines',
          '/subscribe',
        ],
      },
    ],
    sitemap: 'https://thebreakdown.in/sitemap.xml',
  };
}

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
          '/data',
          '/datasets',
          '/country',
          '/countries',
          '/entity',
          '/entities',
          '/topic',
          '/topics',
          '/investigation',
          '/investigations',
        ],
        disallow: [
          '/workspace',
          '/admin',
          '/cms',
          '/editorial',
          '/dashboard',
          '/api',
          '/settings',
          '/subscribe',
          '/login',
          '/reader',
          '/search',
        ],
      },
    ],
    sitemap: 'https://thebreakdown.in/sitemap.xml',
  };
}

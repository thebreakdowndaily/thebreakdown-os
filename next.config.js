const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: true,
  outputFileTracingRoot: path.resolve(__dirname),

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'thebreakdown.in' },
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: '**.wikimedia.org' },
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ['d3', 'maplibre-gl', 'three'],
  },

  async headers() {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://thebreakdown.in https://www.googletagmanager.com https://static.cloudflareinsights.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https://thebreakdown.in https://placehold.co https://upload.wikimedia.org https://*.wikimedia.org https://*.supabase.co https://images.unsplash.com",
      "font-src 'self' data:",
      "connect-src 'self' https://thebreakdown.in https://www.googletagmanager.com https://www.google-analytics.com https://static.cloudflareinsights.com https://*.ingest.sentry.io https://*.supabase.co https://*.supabase.in",
      "worker-src 'self' blob:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ');

    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

const { withSentryConfig } = require('@sentry/nextjs');

nextConfig.redirects = async () => [
  {
    source: '/:path*',
    has: [{ type: 'header', key: 'x-forwarded-proto', value: 'http' }],
    destination: 'https://thebreakdown.in/:path*',
    permanent: true,
  },
  {
    source: '/global/:slug',
    destination: '/story/:slug',
    permanent: true,
  },
  {
    source: '/economy/:slug',
    destination: '/story/:slug',
    permanent: true,
  },
  {
    source: '/story/rbi-monetary-policy',
    destination: '/story/rbi-repo-rate',
    permanent: true,
  },
  {
    source: '/rss.xml',
    destination: '/api/feed',
    permanent: true,
  },
  {
    source: '/feed',
    destination: '/api/feed',
    permanent: true,
  },
  {
    source: '/chapters',
    destination: '/series',
    permanent: true,
  },
  {
    source: '/explainers',
    destination: '/stories',
    permanent: true,
  },
  {
    source: '/the-fix',
    destination: '/fix',
    permanent: true,
  },
  {
    source: '/data-stories',
    destination: '/data',
    permanent: true,
  },
  {
    source: '/policy-tracker',
    destination: '/trackers',
    permanent: true,
  },
  {
    source: '/tracking',
    destination: '/trackers',
    permanent: true,
  },
];

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withSentryConfig(withBundleAnalyzer(nextConfig), {
  org: process.env.SENTRY_ORG || '',
  project: process.env.SENTRY_PROJECT || '',
  authToken: process.env.SENTRY_AUTH_TOKEN || '',
  silent: !process.env.CI,
  widenClientFileUpload: true,
  dryRun: !process.env.SENTRY_AUTH_TOKEN,
});

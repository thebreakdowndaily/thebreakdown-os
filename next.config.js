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
      { protocol: 'https', hostname: '**' },
    ],
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ['d3', 'maplibre-gl', 'three'],
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
];

module.exports = withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG || '',
  project: process.env.SENTRY_PROJECT || '',
  authToken: process.env.SENTRY_AUTH_TOKEN || '',
  silent: !process.env.CI,
  widenClientFileUpload: true,
});

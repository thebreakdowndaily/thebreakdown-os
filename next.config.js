/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: true,
  images: {
    domains: [],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  experimental: {
    optimizePackageImports: ['d3', 'maplibre-gl', 'three'],
  },
};

module.exports = nextConfig;

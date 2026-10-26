import type { Metadata } from 'next';
import Script from 'next/script';
import localFont from 'next/font/local';
import { Navigation } from '@/components/navigation';
import Footer from '@/components/layout/Footer';
import { AuthWrapper } from '@/features/auth/components/AuthWrapper';
import { GATracker } from '@/components/analytics/GATracker';
import { LandingTracker } from '@/components/analytics/LandingTracker';
import { InteractionTracker } from '@/components/analytics/InteractionTracker';
import { isProductionAnalytics } from '@/lib/analytics/environment';
import { Suspense } from 'react';
import '@/styles/globals.css';

/**
 * Self-hosted typefaces: removes the build-time Google Fonts network dependency.
 * WOFF2 assets are the Latin subsets under app/fonts; licensing and attribution
 * are documented in docs/engineering/self-hosted-fonts.md.
 *
 * All three families use static weight faces. Disable preload for the full face
 * arrays so the browser downloads only the weight/style actually used, rather
 * than preloading every face.
 */
const inter = localFont({
  src: [
    { path: './fonts/inter/inter-latin-100-normal.woff2', weight: '100', style: 'normal' },
    { path: './fonts/inter/inter-latin-200-normal.woff2', weight: '200', style: 'normal' },
    { path: './fonts/inter/inter-latin-300-normal.woff2', weight: '300', style: 'normal' },
    { path: './fonts/inter/inter-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './fonts/inter/inter-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: './fonts/inter/inter-latin-600-normal.woff2', weight: '600', style: 'normal' },
    { path: './fonts/inter/inter-latin-700-normal.woff2', weight: '700', style: 'normal' },
    { path: './fonts/inter/inter-latin-800-normal.woff2', weight: '800', style: 'normal' },
    { path: './fonts/inter/inter-latin-900-normal.woff2', weight: '900', style: 'normal' },
    { path: './fonts/inter/inter-latin-400-italic.woff2', weight: '400', style: 'italic' },
    { path: './fonts/inter/inter-latin-700-italic.woff2', weight: '700', style: 'italic' }
  ],
  display: 'swap',
  preload: false,
  variable: '--font-inter',
});

const playfair = localFont({
  src: [
    { path: './fonts/playfair-display/playfair-display-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './fonts/playfair-display/playfair-display-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: './fonts/playfair-display/playfair-display-latin-600-normal.woff2', weight: '600', style: 'normal' },
    { path: './fonts/playfair-display/playfair-display-latin-700-normal.woff2', weight: '700', style: 'normal' },
    { path: './fonts/playfair-display/playfair-display-latin-800-normal.woff2', weight: '800', style: 'normal' },
    { path: './fonts/playfair-display/playfair-display-latin-400-italic.woff2', weight: '400', style: 'italic' },
    { path: './fonts/playfair-display/playfair-display-latin-700-italic.woff2', weight: '700', style: 'italic' }
  ],
  display: 'swap',
  preload: false,
  variable: '--font-playfair',
});

/**
 * Source Serif 4 — Dedicated long-form reading typeface.
 * Used for article body, chapter text, and sustained reading surfaces.
 * Part of The Breakdown's three-level typographic system:
 *   Display (Playfair) + Reading (Source Serif 4) + Interface (Inter)
 */
const sourceSerif = localFont({
  src: [
    { path: './fonts/source-serif-4/source-serif-4-latin-300-normal.woff2', weight: '300', style: 'normal' },
    { path: './fonts/source-serif-4/source-serif-4-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './fonts/source-serif-4/source-serif-4-latin-600-normal.woff2', weight: '600', style: 'normal' },
    { path: './fonts/source-serif-4/source-serif-4-latin-700-normal.woff2', weight: '700', style: 'normal' },
    { path: './fonts/source-serif-4/source-serif-4-latin-400-italic.woff2', weight: '400', style: 'italic' },
    { path: './fonts/source-serif-4/source-serif-4-latin-700-italic.woff2', weight: '700', style: 'italic' }
  ],
  display: 'swap',
  preload: false,
  variable: '--font-source-serif',
});

export const metadata: Metadata = {
  title: {
    default: 'The Breakdown — India Explained',
    template: '%s — The Breakdown',
  },
  description: 'Independent, data-driven journalism on Indian policy, politics, and society.',
  metadataBase: new URL('https://thebreakdown.in'),
  openGraph: {
    siteName: 'The Breakdown',
    type: 'website',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    types: {
      'application/rss+xml': 'https://thebreakdown.in/api/feed',
    },
  },
  // DNS TXT verification completed via Cloudflare
};

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'The Breakdown',
    url: 'https://thebreakdown.in',
    description: 'Independent, data-driven journalism on Indian policy, politics, and society.',
    publisher: {
      '@type': 'Organization',
      name: 'The Breakdown',
      url: 'https://thebreakdown.in',
      logo: {
        '@type': 'ImageObject',
        url: 'https://thebreakdown.in/b-mark.jpg',
        width: 1024,
        height: 1024,
      }
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://thebreakdown.in/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  // Organization entity — single canonical identity for The Breakdown.
  // publishingPrinciples / ethicsPolicy / correctionsPolicy help AI systems
  // understand the editorial standards governing every claim on this site.
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'The Breakdown',
    url: 'https://thebreakdown.in',
    logo: {
      '@type': 'ImageObject',
      url: 'https://thebreakdown.in/b-mark.jpg',
      width: 1024,
      height: 1024,
    },
    description: 'Independent, evidence-backed journalism on Indian policy, politics, and society.',
    publishingPrinciples: 'https://thebreakdown.in/editorial-constitution',
    ethicsPolicy: 'https://thebreakdown.in/methodology',
    correctionsPolicy: 'https://thebreakdown.in/trust',
  };

  return (
    <html lang="en" data-theme="dark" className={`${inter.variable} ${playfair.variable} ${sourceSerif.variable}`}>
      <head>
        <link rel="alternate" type="application/rss+xml" title="The Breakdown RSS Feed" href="https://thebreakdown.in/api/feed" />
      </head>
      <body className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] font-sans flex flex-col antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema).replace(/</g, '\\u003c'),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema).replace(/</g, '\\u003c'),
          }}
        />
        {GA_MEASUREMENT_ID && process.env.NODE_ENV === 'production' && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
            <Script id="ga-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${GA_MEASUREMENT_ID}', { page_path: window.location.pathname });`}
            </Script>
          </>
        )}
        <AuthWrapper>
          <Navigation />
          <main id="main-content" className="flex-1 pt-16 lg:pt-[72px]">{children}</main>
          <Footer />
        </AuthWrapper>
        {GA_MEASUREMENT_ID && process.env.NODE_ENV === 'production' && <Suspense><GATracker gaId={GA_MEASUREMENT_ID} /></Suspense>}
        {isProductionAnalytics() && (
          <>
            <LandingTracker />
            <InteractionTracker />
          </>
        )}
      </body>
    </html>
  );
}

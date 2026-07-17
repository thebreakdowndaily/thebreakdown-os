import type { Metadata } from 'next';
import Script from 'next/script';
import { Inter, Playfair_Display } from 'next/font/google';
import { Navigation } from '@/components/navigation';
import Footer from '@/components/layout/Footer';
import { AuthWrapper } from '@/features/auth/components/AuthWrapper';
import { GATracker } from '@/components/analytics/GATracker';
import { Suspense } from 'react';
import '@/styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
  weight: ['400', '500', '600', '700', '800'],
  style: ['normal', 'italic'],
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
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://thebreakdown.in/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'The Breakdown',
    url: 'https://thebreakdown.in',
    logo: 'https://thebreakdown.in/logo.svg',
    description: 'Independent, data-driven journalism on Indian policy, politics, and society.',
  };

  return (
    <html lang="en" data-theme="dark" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] font-sans flex flex-col antialiased">
        <Script id="schema-website" type="application/ld+json" strategy="beforeInteractive">
          {JSON.stringify(websiteSchema)}
        </Script>
        <Script id="schema-organization" type="application/ld+json" strategy="beforeInteractive">
          {JSON.stringify(organizationSchema)}
        </Script>
        {GA_MEASUREMENT_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
            <Script id="ga-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${GA_MEASUREMENT_ID}', { page_path: window.location.pathname });`}
            </Script>
          </>
        )}
        <AuthWrapper>
          <Navigation />
          <main className="flex-1 pt-16 lg:pt-[72px]">{children}</main>
          <Footer />
        </AuthWrapper>
        {GA_MEASUREMENT_ID && <Suspense><GATracker gaId={GA_MEASUREMENT_ID} /></Suspense>}
      </body>
    </html>
  );
}

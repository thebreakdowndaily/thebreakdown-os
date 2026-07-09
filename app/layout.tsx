import type { Metadata } from 'next';
import Script from 'next/script';
import { Inter } from 'next/font/google';
import { Navigation } from '@/components/navigation';
import Footer from '@/components/layout/Footer';
import { AuthWrapper } from '@/features/auth/components/AuthWrapper';
import '@/styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
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
        urlTemplate: 'https://thebreakdown.in/?q={search_term_string}',
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
    <html lang="en" data-theme="dark" className={inter.variable}>
      <body className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] font-sans flex flex-col">
        <Script id="schema-website" type="application/ld+json" strategy="beforeInteractive">
          {JSON.stringify(websiteSchema)}
        </Script>
        <Script id="schema-organization" type="application/ld+json" strategy="beforeInteractive">
          {JSON.stringify(organizationSchema)}
        </Script>
        <AuthWrapper>
          <Navigation />
          <main className="flex-1 pt-16 lg:pt-[72px]">{children}</main>
          <Footer />
        </AuthWrapper>
      </body>
    </html>
  );
}

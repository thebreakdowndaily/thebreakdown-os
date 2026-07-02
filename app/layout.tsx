import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/layout/SEOHead';
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
};

const defaultSEO = {
  title: 'The Breakdown — India Explained',
  description: 'Independent, data-driven journalism on Indian policy, politics, and society.',
  canonical: 'https://thebreakdown.in',
  ogType: 'website' as const,
  ogImage: '/images/og-home.jpg',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" className={inter.variable}>
      <head>
        <SEOHead seo={defaultSEO} />
      </head>
      <body className="min-h-screen bg-[#0B1020] text-[#F8FAFC] font-sans flex flex-col">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}

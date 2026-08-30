import type { Metadata } from 'next';
import Container from '@/components/layout/Container';
import Link from 'next/link';
import { NewsletterTracker } from '@/components/newsletter/NewsletterTracker';

export const metadata: Metadata = {
  title: 'The Breakdown Brief — The Breakdown',
  description: 'The Breakdown Brief — what changed, why it matters, and the evidence behind it. A weekly, evidence-first analysis of Indian policy and politics.',
  openGraph: { title: 'The Breakdown Brief', url: 'https://thebreakdown.in/newsletter' },
};

export default function NewsletterPage() {
  return (
    <Container>
      <div className="py-12 max-w-2xl mx-auto text-center">
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-amber-400 mb-3">The Breakdown Brief</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-amber-400 mb-4">What changed, why it matters, and the evidence behind it.</h1>
        <p className="text-gray-400 text-lg mb-6">
          One email a week. One story that matters. The documents behind it. The questions we&apos;re still asking.
          No noise. No takes. Just understanding.
        </p>
        <div className="p-8 bg-[#151515] rounded-lg border border-[#2A2A2A] mb-8 text-left">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">Each edition includes:</h2>
          <ul className="text-sm text-gray-400 space-y-2">
            <li className="flex gap-2"><span className="text-amber-400" aria-hidden="true">→</span> One deep-dive analysis of the week&apos;s most consequential story</li>
            <li className="flex gap-2"><span className="text-amber-400" aria-hidden="true">→</span> Primary documents and sources behind the reporting</li>
            <li className="flex gap-2"><span className="text-amber-400" aria-hidden="true">→</span> Key data points you can verify yourself</li>
            <li className="flex gap-2"><span className="text-amber-400" aria-hidden="true">→</span> What historians and analysts disagree about — and why</li>
          </ul>
          <div className="mt-6 text-center">
            <Link href="/subscribe" data-track-newsletter-cta className="inline-block bg-amber-500 text-black font-semibold px-6 py-2.5 rounded-lg hover:bg-amber-400 transition-colors">Subscribe Free</Link>
            <p className="text-xs text-gray-500 mt-3">Double opt-in required. Unsubscribe anytime.</p>
          </div>
        </div>
      </div>
      <NewsletterTracker />
    </Container>
  );
}
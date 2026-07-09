import type { Metadata } from 'next';
import Container from '@/components/layout/Container';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Newsletter — The Breakdown',
  description: 'The Breakdown newsletter — weekly data-driven analysis of Indian policy and politics.',
  openGraph: { title: 'Newsletter — The Breakdown', url: 'https://thebreakdown.in/newsletter' },
};

export default function NewsletterPage() {
  return (
    <Container>
      <div className="py-8 max-w-2xl mx-auto text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-amber-400 mb-4">Newsletter</h1>
        <p className="text-gray-400 text-lg mb-4">Weekly data-driven analysis of Indian policy, politics, and society — delivered every Monday.</p>
        <div className="p-8 bg-[#151515] rounded-lg border border-[#2A2A2A] mb-8">
          <p className="text-sm text-gray-400 mb-6">Each edition includes one deep-dive story, key data points, recommended reading, and our evidence tracker.</p>
          <Link href="/subscribe" className="inline-block bg-amber-500 text-black font-semibold px-6 py-2.5 rounded-lg hover:bg-amber-400 transition-colors">Subscribe Now</Link>
        </div>
      </div>
    </Container>
  );
}

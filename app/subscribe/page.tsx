import type { Metadata } from 'next';
import Container from '@/components/layout/Container';

export const metadata: Metadata = {
  title: 'Subscribe — The Breakdown',
  description: 'Subscribe to The Breakdown for independent, data-driven journalism.',
  openGraph: { title: 'Subscribe — The Breakdown', url: 'https://thebreakdown.in/subscribe' },
};

export default function SubscribePage() {
  return (
    <Container>
      <div className="py-8 max-w-2xl mx-auto text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-amber-400 mb-4">Subscribe</h1>
        <p className="text-gray-400 text-lg mb-8">Get data-driven journalism delivered to your inbox.</p>
        <div className="p-8 bg-[#151515] rounded-lg border border-[#2A2A2A]">
          <form className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm text-gray-400 text-left mb-1">Email address</label>
              <input type="email" id="email" required placeholder="you@example.com" className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-gray-100 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400" />
            </div>
            <button type="submit" className="w-full bg-amber-500 text-black font-semibold px-6 py-2.5 rounded-lg hover:bg-amber-400 transition-colors">Subscribe</button>
          </form>
          <p className="text-xs text-gray-500 mt-4">No spam. Unsubscribe anytime.</p>
        </div>
      </div>
    </Container>
  );
}

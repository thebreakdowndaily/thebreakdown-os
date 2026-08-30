import type { Metadata } from 'next';
import Container from '@/components/layout/Container';
import { SubscribeForm } from '@/components/newsletter/SubscribeForm';

export const metadata: Metadata = {
  title: 'Subscribe — The Breakdown Brief — The Breakdown',
  description: 'Subscribe to The Breakdown Brief — what changed, why it matters, and the evidence behind it. Weekly, free, evidence-first.',
  openGraph: { title: 'Subscribe — The Breakdown Brief', url: 'https://thebreakdown.in/subscribe' },
};

export default function SubscribePage() {
  return (
    <Container>
      <div className="py-12 max-w-2xl mx-auto text-center">
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-amber-400 mb-3">The Breakdown Brief</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-amber-400 mb-4">Subscribe</h1>
        <p className="text-gray-400 text-lg mb-8">
          What changed, why it matters, and the evidence behind it. One email a week. Free.
        </p>
        <div className="p-8 bg-[#151515] rounded-lg border border-[#2A2A2A]">
          <SubscribeForm />
        </div>
      </div>
    </Container>
  );
}
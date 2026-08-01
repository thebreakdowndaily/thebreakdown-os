import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/layout/Container';
import SpatialNarrativeBreadcrumb from '@/components/narrative/SpatialNarrativeBreadcrumb';

export const metadata: Metadata = {
  title: 'About — The Breakdown',
  description: 'The Breakdown is an independent, data-driven journalism platform covering Indian policy, politics, and society.',
  openGraph: { title: 'About — The Breakdown', url: 'https://thebreakdown.in/about' },
};

export default function AboutPage() {
  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <SpatialNarrativeBreadcrumb items={[
          { label: 'Home', href: '/' },
          { label: 'About Institutional Platform', href: '/about', current: true },
        ]} theme="dark" />
      </div>

    <Container>
      <div className="py-8 max-w-3xl">
        <h1 className="text-3xl sm:text-4xl font-bold text-amber-400 mb-6">About The Breakdown</h1>
        <div className="prose prose-invert prose-amber max-w-none space-y-4 text-gray-300">
          <p>The Breakdown is an independent, data-driven journalism platform that covers Indian policy, politics, and society through the lens of evidence and analysis.</p>
          <p>We believe that understanding complex policy issues requires more than opinion — it requires data, context, and rigorous verification. Every story on The Breakdown is built on a foundation of primary sources, official data, and cross-referenced claims.</p>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">Our Mission</h2>
          <p>To make Indian policy and governance intelligible to every citizen through data-driven storytelling, interactive visualizations, and rigorous fact-checking.</p>
          <h2 className="text-xl font-semibold text-white mt-8 mb-3">How We Work</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Every claim is sourced and assigned a confidence score</li>
            <li>All data is linked to its original source for verification</li>
            <li>Stories include interactive elements — timelines, charts, and evidence panels</li>
            <li>Our knowledge graph connects stories, topics, entities, and fixes</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8 mb-3">Governance & Transparency</h2>
          <p>The Breakdown operates under strict editorial governance to preserve neutrality, accuracy, and reader trust.</p>
          <div className="flex flex-wrap gap-4 mt-3 pt-2">
            <Link href="/editorial-constitution" className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-400 hover:text-amber-300 underline">
              Editorial Constitution (v1.1)
            </Link>
            <Link href="/methodology" className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-400 hover:text-amber-300 underline">
              Sourcing Methodology
            </Link>
            <Link href="/trust" className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-400 hover:text-amber-300 underline">
              Trust Dashboard
            </Link>
          </div>
        </div>
      </div>
    </Container>
    </>
  );
}

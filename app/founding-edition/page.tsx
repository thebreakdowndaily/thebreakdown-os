import type { Metadata } from 'next';
import Container from '@/components/layout/Container';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Founding Edition v1.0 — The Breakdown',
  description: 'The Breakdown Knowledge Library — Founding Edition. An evidence-first, versioned, transparent reference work. Includes Founding Monograph 001.',
  openGraph: { title: 'Founding Edition v1.0 — The Breakdown', description: 'The Breakdown Knowledge Library — Founding Edition. Evidence-first, versioned, transparent.', url: 'https://thebreakdown.in/founding-edition' },
  twitter: { card: 'summary_large_image', title: 'Founding Edition v1.0 — The Breakdown', description: 'The Breakdown Knowledge Library — Founding Edition. Evidence-first, versioned, transparent.' },
};

const included = [
  { label: 'Methodology', href: '/methodology', desc: 'Research process, evidence hierarchy, confidence scores, corrections policy, AI usage, versioning.' },
  { label: 'Editorial Constitution', href: '/editorial-constitution', desc: 'The principles governing every editorial decision — evidence standard, ethics, quality gates.' },
  { label: 'Trust Dashboard', href: '/trust', desc: 'Transparency metrics: published monographs, claims, sources, evidence, review status.' },
  { label: 'Founding Monograph 001', href: '/series/foundations-1947-1962/volume/the-nehruvian-era/chapter/indias-inheritance', desc: 'India\'s Inheritance — Partition and the Strategic Foundations of Independent India (1947). 18 claims, 31 sources, 36 evidence entries.' },
  { label: 'Corrections Policy', href: '/methodology#corrections', desc: 'Every correction is public, versioned, and triggers review of related knowledge objects.' },
  { label: 'Transparency Statement', href: '/trust', desc: 'Live dashboard, open scholarly disagreements, version history, evidence debt tracking.' },
];

const roadmap = [
  { version: 'v1.1', items: ['External peer review (Phase 1–2 of Gold Standard)', 'Licensed/archived visual assets for all RM items', 'Chapter-level Trust Score', 'Chapter 2: India\'s Strategic Inheritance'] },
  { version: 'v1.2', items: ['Reader Workspace (highlights, notes, collections)', 'Knowledge Explorer search', 'Citation export', 'Source Intelligence dashboard'] },
  { version: 'v2.0', items: ['Volume I completion (12–20 chapters)', 'Institutional Trust Index', 'Academic citation tracking', 'Living Knowledge refresh cycle'] },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Collection',
  name: 'The Breakdown Knowledge Library — Founding Edition v1.0',
  description: 'An evidence-first, versioned, transparent reference work. Includes Founding Monograph 001.',
  version: '1.0.0',
  datePublished: '2026-07',
  publisher: {
    '@type': 'Organization',
    name: 'The Breakdown',
    url: 'https://thebreakdown.in',
  },
  hasPart: [
    { '@type': 'Article', name: 'Methodology', url: 'https://thebreakdown.in/methodology' },
    { '@type': 'Article', name: 'Editorial Constitution', url: 'https://thebreakdown.in/editorial-constitution' },
    { '@type': 'Dataset', name: 'Trust Dashboard', url: 'https://thebreakdown.in/trust' },
    { '@type': 'Article', name: 'Founding Monograph 001: India\'s Inheritance — Partition and the Strategic Foundations of Independent India (1947)', url: 'https://thebreakdown.in/series/foundations-1947-1962/volume/the-nehruvian-era/chapter/indias-inheritance' },
  ],
};

export default function FoundingEditionPage() {
  return (
    <Container>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="py-8 max-w-3xl">
        <p className="text-sm text-amber-500 font-semibold uppercase tracking-wider mb-1">The Breakdown Knowledge Library</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-amber-400 mb-2">Founding Edition v1.0</h1>
        <blockquote className="border-l-4 border-amber-400 pl-4 italic text-gray-300 mb-6 text-sm">
          Evidence before conclusions. Context before certainty.
        </blockquote>

        <p className="text-gray-300 mb-6">
          The Breakdown was created because understanding complex public issues requires more than headlines.
          Our Knowledge Library is designed to explain difficult subjects with evidence, transparency, and
          competing perspectives. This Founding Edition is the first step in that mission.
        </p>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 mb-8">
          <p className="text-sm text-gray-400 mb-1">Release Date</p>
          <p className="text-white font-semibold">July 2026</p>
          <p className="text-sm text-gray-400 mt-3 mb-1">Version</p>
          <p className="text-white font-semibold">1.0.0</p>
        </div>

        <h2 className="text-xl font-semibold text-white mb-4">Included in this Edition</h2>
        <div className="space-y-3 mb-8">
          {included.map((item) => (
            <div key={item.href} className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex items-start gap-3">
              <span className="text-green-400 mt-0.5 shrink-0">✓</span>
              <div>
                <Link href={item.href} className="text-amber-400 font-medium hover:underline">
                  {item.label}
                </Link>
                <p className="text-gray-400 text-sm mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <h2 className="text-xl font-semibold text-white mb-4">Roadmap</h2>
        <div className="space-y-4 mb-8">
          {roadmap.map((r) => (
            <div key={r.version} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <h3 className="text-amber-400 font-semibold mb-2">{r.version}</h3>
              <ul className="space-y-1">
                {r.items.map((item) => (
                  <li key={item} className="text-gray-400 text-sm flex items-start gap-2">
                    <span className="text-gray-600 mt-0.5">·</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <h2 className="text-xl font-semibold text-white mb-3">How to Provide Feedback</h2>
        <p className="text-gray-300 mb-4">
          This is a Version 1.0 publication — a living document, not a finished product.
          Your feedback makes it better. You can:
        </p>
        <ul className="space-y-2 text-gray-400 mb-8">
          <li className="flex items-start gap-2">
            <span className="text-amber-400 mt-0.5">→</span>
            <span>Report an inaccuracy or missing source via the feedback section on any chapter page</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400 mt-0.5">→</span>
            <span>Suggest additional primary sources or documents we should consult</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400 mt-0.5">→</span>
            <span>Challenge a claim with counter-evidence — every correction is public and credited</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-400 mt-0.5">→</span>
            <span>Contact us at <a href="mailto:editorial@thebreakdown.in" className="text-amber-400 hover:underline">editorial@thebreakdown.in</a></span>
          </li>
        </ul>

        <div className="border-t border-gray-800 pt-6 mt-8 text-sm text-gray-500">
          <p>The Breakdown Knowledge Library — Founding Edition v1.0. This is the beginning of an editorial lifecycle, not the end of a development cycle.</p>
        </div>
      </div>
    </Container>
  );
}
import type { Metadata } from 'next';
import Container from '@/components/layout/Container';

export const metadata: Metadata = {
  title: 'Methodology — The Breakdown',
  description: 'How The Breakdown researches, verifies, and presents data-driven journalism.',
};

export default function MethodologyPage() {
  return (
    <Container>
      <div className="py-8 max-w-3xl">
        <h1 className="text-3xl sm:text-4xl font-bold text-amber-400 mb-6">Methodology</h1>
        <div className="prose prose-invert prose-amber max-w-none space-y-4 text-gray-300">
          <h2 className="text-xl font-semibold text-white mt-6 mb-3">Evidence Scoring</h2>
          <p>Every story receives an evidence score (0-100) based on the number and quality of primary sources, the verification status of claims, and the diversity of sourcing.</p>
          <h2 className="text-xl font-semibold text-white mt-6 mb-3">Claim Verification</h2>
          <p>Each claim in a story is assigned a confidence tier (1-5) and a verification status: verified, strong, moderate, or unverified. Claims are linked to their source material.</p>
          <h2 className="text-xl font-semibold text-white mt-6 mb-3">Source Tiers</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Tier 1:</strong> Official government data, court rulings, statutory reports</li>
            <li><strong>Tier 2:</strong> Reputable institutional research, parliamentary committees</li>
            <li><strong>Tier 3:</strong> Academic journals, credible media reports</li>
            <li><strong>Tier 4:</strong> Industry reports, expert commentary</li>
            <li><strong>Tier 5:</strong> Anecdotal or uncorroborated sources</li>
          </ul>
          <h2 className="text-xl font-semibold text-white mt-6 mb-3">Data Sources</h2>
          <p>Data is sourced from government publications (Union Budget, Economic Survey, RBI, MOSPI), international organizations (World Bank, IMF, UN), and institutional research.</p>
        </div>
      </div>
    </Container>
  );
}

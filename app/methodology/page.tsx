import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/layout/Container';

export const metadata: Metadata = {
  title: 'Methodology — The Breakdown',
  description: 'How The Breakdown researches, verifies, and publishes evidence-first knowledge objects — our editorial process, evidence hierarchy, and quality standards.',
  openGraph: { title: 'Methodology — The Breakdown', description: 'How The Breakdown researches, verifies, and publishes evidence-first knowledge objects.', url: 'https://thebreakdown.in/methodology' },
  twitter: { card: 'summary', title: 'Methodology — The Breakdown', description: 'How The Breakdown researches, verifies, and publishes evidence-first knowledge objects.' },
};

export default function MethodologyPage() {
  return (
    <Container>
      <div className="py-8 max-w-3xl">
        <h1 className="text-3xl sm:text-4xl font-bold text-amber-400 mb-2">Methodology</h1>
        <p className="text-gray-400 mb-4">How The Breakdown researches, verifies, and publishes knowledge.</p>
        <blockquote className="border-l-4 border-amber-400 pl-4 italic text-gray-300 mb-8">
          Evidence before conclusions. Context before certainty.
        </blockquote>

        <div className="prose prose-invert prose-amber max-w-none space-y-4 text-gray-300">

          <h2 className="text-xl font-semibold text-white mt-8 mb-3">Our Approach</h2>
          <p>The Breakdown is an evidence-first knowledge platform. We do not publish breaking news, opinion pieces, or AI-generated content. Every knowledge object — chapter, story, investigation, or data set — is built on a foundation of verified evidence, transparent sourcing, and clearly stated confidence.</p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-3">How Research Is Conducted</h2>
          <p>The Research Bureau begins every project by identifying relevant sources across the evidence hierarchy: primary documents, academic scholarship, institutional reports, high-quality journalism, books, oral testimony, and expert opinion. Sources are collected, catalogued in the Source Registry, and assessed for authority, relevance, and freshness.</p>
          <p>Claims are extracted from sources and registered in the Claim Registry with a confidence score before any writing begins. This ensures that the evidentiary foundation exists independently of the narrative.</p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-3">The Evidence Hierarchy</h2>
          <p>Evidence is classified into seven levels. Higher levels carry greater evidentiary weight:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Level 1</strong> — Primary documents (laws, treaties, court judgments, government records, diplomatic correspondence, original manuscripts)</li>
            <li><strong>Level 2</strong> — Academic scholarship (peer-reviewed papers, university press monographs, approved dissertations)</li>
            <li><strong>Level 3</strong> — Institutional reports (UN, World Bank, IMF, RBI, CAG, official histories)</li>
            <li><strong>Level 4</strong> — High-quality journalism (investigative reporting from outlets with documented editorial standards)</li>
            <li><strong>Level 5</strong> — Books (non-fiction works from established publishers, memoirs with appropriate caveats)</li>
            <li><strong>Level 6</strong> — Interviews and oral testimony (with documented methodology and known limitations)</li>
            <li><strong>Level 7</strong> — Expert opinion (commentary and analysis, clearly labelled as interpretation)</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8 mb-3">How Claims Are Verified</h2>
          <p>Every factual assertion in a Breakdown knowledge object traces to a claim in the Claim Registry. Each claim carries:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>A unique identifier and stable URL</li>
            <li>The specific evidence supporting it, with level classification</li>
            <li>Citations to specific, verifiable sources</li>
            <li>A confidence score: established, strong, moderate, weak, or contested</li>
            <li>The strongest counterargument with supporting evidence</li>
            <li>A last-verified date and named responsible editor</li>
          </ul>
          <p>Claims are verified by the Verification Bureau, which operates independently of the Editorial Bureau. No claim enters a published knowledge object without verification.</p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-3">How Confidence Scores Are Assigned</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Established</strong> — Supported by multiple independent Level 1–2 sources. No serious scholarly dispute.</li>
            <li><strong>Strong</strong> — Supported by strong evidence. Some scholarly disagreement exists but the weight of evidence supports the claim.</li>
            <li><strong>Moderate</strong> — Evidence exists but is limited, contradictory, or subject to reasonable alternative interpretation.</li>
            <li><strong>Weak</strong> — Limited evidence. Plausible but not firmly established.</li>
            <li><strong>Contested</strong> — Significant scholarly disagreement exists. The evidence does not clearly favour one position.</li>
          </ul>
          <p>Confidence scores are tracked globally in the Confidence Register and are visible to readers in the State of the Evidence block at the top of each chapter.</p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-3">Why Scholarly Disagreements Are Included</h2>
          <p>We believe that hiding disagreement damages trust. When historians or other scholars disagree on a question, we present the competing positions with their strongest arguments and strongest criticisms. The Known Disagreements Register documents these debates publicly. A chapter that acknowledges disagreement is more trustworthy — not less — than one that pretends all questions are settled.</p>

          <h2 id="corrections" className="text-xl font-semibold text-white mt-8 mb-3">How Corrections Are Handled</h2>
          <p>Corrections are a strength, not a weakness. Every correction is:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Published within the corrected knowledge object</li>
            <li>Accompanied by a summary of what changed, why, and the evidence supporting the change</li>
            <li>Logged in the Book of Record as an editorial decision</li>
            <li>Triggering a review of all related knowledge objects for similar errors</li>
          </ul>
          <p>A history of transparent corrections builds more trust than a claim of never making mistakes.</p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-3">How AI Is Used</h2>
          <p>AI tools assist with research, drafting, transcription, translation, and data analysis. They are never the final author of any knowledge object. Every AI-assisted output is reviewed, verified, and edited by a human subject-matter expert before publication. AI usage in the creation of any knowledge object is disclosed. AI-generated images are prohibited in historical reporting; they may be used for illustrative diagrams only when no authentic visual exists, and must be clearly labelled as AI-generated.</p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-3">How Chapters Evolve</h2>
          <p>Published chapters are not final products. They are the current best version. Each chapter has a version number (semantic — MAJOR.MINOR.PATCH) and a changelog. Major versions represent substantive rewriting or reinterpretation. Minor versions represent addition of new evidence or correction of errors. Patch versions represent typographical or formatting updates. Chapters are reviewed on a scheduled cycle — flagship chapters every six months, standard chapters annually. Previous versions remain accessible.</p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-3">Founding Edition v1.0 — Publication Status</h2>
          <p><strong>Founding Monograph 001</strong> is the first publication of The Breakdown Knowledge Library — Founding Edition. It is a Version 1.0 publication: a living document, not a finished product. Every chapter carries:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>A version number (semantic MAJOR.MINOR.PATCH)</li>
            <li>A clear status indicator (Gold Standard, Published, Draft, etc.)</li>
            <li>A Living Knowledge banner — this chapter evolves.</li>
            <li>Feedback links — readers are encouraged to report issues, suggest sources, or challenge claims.</li>
          </ul>
          <p>We publish Version 1.0 with transparent limitations. Some visual assets remain under rights review and may be replaced as licensing is secured. The Three-Layer Claim structure — documented fact, historical interpretation, editorial synthesis — is the institutional signature and will be refined across subsequent versions.</p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-3">The Three-Layer Claim Structure</h2>
          <p>Every major claim in Founding Monograph 001 is presented across three layers, visually distinguished:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Documented Fact</strong> (emerald) — What the evidence establishes. The floor of historical knowledge.</li>
            <li><strong>Historical Interpretation</strong> (amber) — Where scholars disagree. Named schools and counterarguments are presented transparently.</li>
            <li><strong>Editorial Synthesis</strong> (violet) — Our most defensible position, stated with transparent language: "The evidence shows…" rather than false certainty.</li>
          </ul>
          <p>This structure ensures readers can always distinguish between established fact, scholarly debate, and editorial judgment. It is the most important editorial innovation of the platform.</p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-3">How Visual Assets Are Selected</h2>
          <p>Every visual asset — photograph, map, chart, document reproduction — must meet the Visual Constitution standards: verified provenance, confirmed license or copyright status, an editorial caption explaining historical significance, a stated pedagogical purpose (if it does not teach something, it is not included), links to specific claims in the Claim Registry, and alt text meeting accessibility requirements. Visuals are evidence, not decoration.</p>
        </div>

        <div className="border-t border-gray-800 pt-6 mt-8 flex gap-4 text-sm">
          <Link href="/editorial-constitution" className="text-amber-400 hover:underline">Editorial Constitution</Link>
          <Link href="/trust" className="text-amber-400 hover:underline">Trust Dashboard</Link>
          <Link href="/founding-edition" className="text-amber-400 hover:underline">Founding Edition</Link>
        </div>
      </div>
    </Container>
  );
}

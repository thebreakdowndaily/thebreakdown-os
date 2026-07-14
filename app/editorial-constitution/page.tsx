import type { Metadata } from 'next';
import Container from '@/components/layout/Container';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Editorial Constitution — The Breakdown',
  description: 'The governing principles of The Breakdown Knowledge Platform: evidence standard, editorial ethics, evidence hierarchy, and quality gates.',
  openGraph: { title: 'Editorial Constitution — The Breakdown', description: 'The governing principles of The Breakdown: evidence standard, ethics, evidence hierarchy, quality gates.', url: 'https://thebreakdown.in/editorial-constitution' },
  twitter: { card: 'summary', title: 'Editorial Constitution — The Breakdown', description: 'The governing principles of The Breakdown: evidence standard, ethics, evidence hierarchy, quality gates.' },
};

export default function EditorialConstitutionPage() {
  return (
    <Container>
      <div className="py-8 max-w-3xl">
        <p className="text-sm text-amber-500 font-semibold uppercase tracking-wider mb-1">The Breakdown</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-amber-400 mb-2">Editorial Constitution</h1>
        <p className="text-gray-400 mb-1">Version 1.1 — Evidence Standard (Locked)</p>
        <p className="text-gray-500 text-sm mb-6">Ratified July 2026. The supreme governing document for all editorial decisions.</p>

        <blockquote className="border-l-4 border-amber-400 pl-4 italic text-gray-300 mb-8">
          Evidence before conclusions. Context before certainty.
        </blockquote>

        <div className="prose prose-invert prose-amber max-w-none space-y-4 text-gray-300">

          <h2 className="text-xl font-semibold text-white mt-8 mb-3">Preamble — Why We Exist</h2>
          <p>The Breakdown exists to build the world's most trusted, continuously updated, evidence-first digital knowledge institution.</p>
          <p>We are not a news website, a blog, an AI summary generator, or a Wikipedia mirror. We are a <strong>Knowledge Operating System</strong> — an institution dedicated to transforming information into understanding through disciplined, transparent, evidence-based editorial practice.</p>

          <h3 className="text-lg font-semibold text-white mt-6 mb-2">The Evidence Standard</h3>
          <p>Nothing enters The Breakdown because it is interesting. It enters because it is <strong>evidence-backed, context-rich, transparently sourced, and capable of surviving informed criticism.</strong></p>
          <p>Every paragraph must answer: <strong>&ldquo;How do we know this?&rdquo;</strong></p>

          <h3 className="text-lg font-semibold text-white mt-6 mb-2">The Cultural Principle</h3>
          <p>We are not in the business of being first. We are in the business of being trusted.</p>

          <h2 className="text-xl font-semibold text-white mt-8 mb-3">Core Principles</h2>
          <p>These principles define the character of the institution:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Truth over speed.</strong> We would rather be late and right than first and wrong.</li>
            <li><strong>Evidence over opinion.</strong> Every claim must be supported by evidence. Editorial analysis and interpretation shall be clearly labelled as such.</li>
            <li><strong>Context over virality.</strong> We optimise for understanding, retention, and verifiability — not clicks or engagement.</li>
            <li><strong>Transparency over certainty.</strong> We are honest about what we know, what we do not know, and where scholars disagree.</li>
            <li><strong>Revision over ego.</strong> Corrections are not admissions of failure. They are evidence of a functioning editorial system.</li>
            <li><strong>Multiple perspectives over single narratives.</strong> Every significant question has multiple legitimate interpretations. We present them fairly.</li>
            <li><strong>Knowledge is never finished.</strong> A published chapter is the current best version. It will be reviewed and improved on a regular cycle.</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8 mb-3">Evidence Hierarchy</h2>
          <p>Evidence is classified into seven levels. Higher levels carry greater weight:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Level 1</strong> — Primary documents (laws, treaties, court judgments, government records, diplomatic correspondence, original manuscripts)</li>
            <li><strong>Level 2</strong> — Academic scholarship (peer-reviewed papers, university press monographs, approved dissertations)</li>
            <li><strong>Level 3</strong> — Institutional reports (UN, World Bank, IMF, RBI, CAG, official histories)</li>
            <li><strong>Level 4</strong> — High-quality journalism (investigative reporting from outlets with documented editorial standards)</li>
            <li><strong>Level 5</strong> — Books (non-fiction works from established publishers, memoirs with appropriate caveats)</li>
            <li><strong>Level 6</strong> — Interviews and oral testimony (with documented methodology and known limitations)</li>
            <li><strong>Level 7</strong> — Expert opinion (commentary and analysis, clearly labelled as interpretation)</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8 mb-3">Confidence Scores</h2>
          <p>Every claim published by The Breakdown carries a confidence score:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Established</strong> — Supported by multiple independent Level 1–2 sources. No serious scholarly dispute.</li>
            <li><strong>Strong</strong> — Supported by strong evidence. Some scholarly disagreement exists but the weight of evidence supports the claim.</li>
            <li><strong>Moderate</strong> — Evidence exists but is limited, contradictory, or subject to reasonable alternative interpretation.</li>
            <li><strong>Weak</strong> — Limited evidence. Plausible but not firmly established.</li>
            <li><strong>Contested</strong> — Significant scholarly disagreement exists. The evidence does not clearly favour one position.</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8 mb-3">Editorial Ethics</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Conflicts of interest</strong> — Every editor and contributor shall disclose any relationship that could reasonably be perceived to influence their work.</li>
            <li><strong>Corrections</strong> — Every correction is published promptly, logged in the change log, and triggers review of related knowledge objects.</li>
            <li><strong>Anonymous sources</strong> — Not used as primary evidence. Exceptional cases require editor-in-chief approval.</li>
            <li><strong>Sponsored content</strong> — The Breakdown does not publish sponsored content, paid placements, or material influenced by financial considerations.</li>
            <li><strong>AI usage</strong> — AI tools assist research and drafting but are never the final author. Every AI-assisted output is reviewed by a human subject-matter expert. AI usage is disclosed.</li>
            <li><strong>Plagiarism</strong> — Plagiarism in any form is grounds for immediate removal from the editorial team.</li>
            <li><strong>Image manipulation</strong> — Images shall not be manipulated in any way that alters their factual content. AI enhancement is disclosed.</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8 mb-3">Language Rules</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>No false certainty.</strong> Prohibited language includes "clearly", "obviously", "undoubtedly", "of course", "naturally", "inevitably", "no question", "surely", "without doubt", "plainly", "everyone knows", "as everyone knows".</li>
            <li><strong>Attribution required.</strong> Weasel words ("some say", "critics argue", "it is believed") are replaced with specific attributions.</li>
            <li><strong>Distinguish the four layers:</strong> What happened / What the evidence shows / Where historians disagree / Why it matters.</li>
            <li><strong>Transparent editorial judgment.</strong> Editorial synthesis uses phrases like "The evidence shows…" or "The most defensible position is…" — never "The truth is…".</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8 mb-3">Quality Gates</h2>
          <p>Before any knowledge object transitions from Editorial Review to Published, it must pass the Gold Standard Review:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Phase 1</strong> — Expert Review: subject-matter experts review for accuracy, fairness, and completeness.</li>
            <li><strong>Phase 2</strong> — Reader Review: four reader profiles test for clarity and confusion.</li>
            <li><strong>Phase 3</strong> — Evidence Audit: every claim independently verified against cited sources.</li>
            <li><strong>Phase 4</strong> — Bias Audit: systematic review for nationalist bias, presentism, hindsight bias, and selection bias.</li>
            <li><strong>Phase 5</strong> — Visual Audit: every visual reviewed for provenance, license, and pedagogical purpose.</li>
            <li><strong>Phase 6</strong> — Knowledge Density Audit: automated check against evidence targets.</li>
            <li><strong>Phase 7</strong> — Defensibility Audit: "Could we defend this?" for every major interpretive claim.</li>
          </ul>
          <p className="mt-4">The full internal text of the Editorial Constitution is maintained at <code className="text-amber-400 text-sm">docs/editorial/editorial-constitution.md</code> and includes articles on historiography, knowledge objects, workflow, transparency, and institutional memory.</p>
        </div>

        <div className="border-t border-gray-800 pt-6 mt-8 flex gap-4 text-sm">
          <Link href="/methodology" className="text-amber-400 hover:underline">Methodology</Link>
          <Link href="/trust" className="text-amber-400 hover:underline">Trust Dashboard</Link>
          <Link href="/founding-edition" className="text-amber-400 hover:underline">Founding Edition</Link>
        </div>
      </div>
    </Container>
  );
}
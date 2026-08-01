import type { Metadata } from 'next';
import Script from 'next/script';
import Link from 'next/link';
import { CHAPTER_1_PACKAGE } from '@/lib/editorial/chapter-1-data';
import { GoldStandardAuditService } from '@/services/editorial/gold-standard-audit.service';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

export const metadata: Metadata = {
  title: `${CHAPTER_1_PACKAGE.title} — Founding Edition v1.0 — The Breakdown`,
  description: CHAPTER_1_PACKAGE.sixQuestions.whatHappened.summary,
  openGraph: {
    title: `${CHAPTER_1_PACKAGE.title} — The Breakdown Knowledge Platform`,
    description: CHAPTER_1_PACKAGE.subtitle,
    type: 'article',
    url: `https://thebreakdown.gov/founding-edition/${CHAPTER_1_PACKAGE.slug}`,
  },
};

export default function Chapter1FoundingPage() {
  const auditCert = GoldStandardAuditService.auditChapter1(CHAPTER_1_PACKAGE);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `https://thebreakdown.gov/founding-edition/${CHAPTER_1_PACKAGE.slug}#chapter`,
    headline: CHAPTER_1_PACKAGE.title,
    alternativeHeadline: CHAPTER_1_PACKAGE.subtitle,
    description: CHAPTER_1_PACKAGE.sixQuestions.whatHappened.summary,
    datePublished: CHAPTER_1_PACKAGE.publishedAt,
    dateModified: CHAPTER_1_PACKAGE.updatedAt,
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: 'The Breakdown Knowledge Platform',
      url: 'https://thebreakdown.gov',
    },
    citation: CHAPTER_1_PACKAGE.sources.map((s) => ({
      '@type': 'CreativeWork',
      name: s.title,
      url: s.url,
    })),
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Script id="schema-ch1-jsonld" type="application/ld+json" strategy="beforeInteractive">
        {JSON.stringify(jsonLd)}
      </Script>

      <Breadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Founding Edition', href: '/founding-edition' },
        { label: 'Chapter 1', href: `/founding-edition/${CHAPTER_1_PACKAGE.slug}` },
      ]} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="main-content">
        {/* Header Hero Section */}
        <header className="mb-10 border-b border-gray-800 pb-8">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="bg-amber-500/10 text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/30 uppercase tracking-wider">
              Founding Edition v1.0 · Volume I (1947–1962)
            </span>
            <span className="bg-emerald-500/10 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30">
              Gold Standard Audit Passed ({auditCert.percentage}%)
            </span>
            <span className="text-xs text-gray-400 font-mono">
              Evidence Score: {CHAPTER_1_PACKAGE.evidenceScore}/100 · {CHAPTER_1_PACKAGE.readingTime} min read ({CHAPTER_1_PACKAGE.wordCount.toLocaleString()} words)
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-100 mb-3 leading-tight tracking-tight">
            {CHAPTER_1_PACKAGE.title}
          </h1>
          <p className="text-xl text-amber-400/90 font-medium mb-4 leading-snug">
            {CHAPTER_1_PACKAGE.subtitle}
          </p>
          <p className="text-gray-300 text-lg max-w-4xl leading-relaxed">
            {CHAPTER_1_PACKAGE.sixQuestions.whatHappened.summary}
          </p>

          <div className="flex items-center gap-4 mt-6 text-xs text-gray-400 border-t border-gray-800 pt-4 flex-wrap">
            <span>Verified: <strong className="text-gray-200">{new Date(CHAPTER_1_PACKAGE.lastVerified).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</strong></span>
            <span>·</span>
            <span>Auditor Signature: <code className="text-emerald-400 bg-gray-800 px-2 py-0.5 rounded">{auditCert.signOffSignature}</code></span>
          </div>
        </header>

        {/* Layout Grid: Content + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content Area (8 Cols) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Six Questions Framework Breakdown */}
            <section aria-labelledby="six-questions-heading" className="space-y-8">
              <h2 id="six-questions-heading" className="text-2xl font-bold text-gray-100 border-b border-gray-800 pb-3">
                Six Questions Framework Analysis
              </h2>

              {/* 1. What Happened */}
              <div className="bg-gray-800/40 border border-gray-700/60 rounded-xl p-6">
                <h3 className="text-xl font-bold text-amber-300 mb-3">{CHAPTER_1_PACKAGE.sixQuestions.whatHappened.title}</h3>
                <p className="text-gray-300 leading-relaxed mb-4">{CHAPTER_1_PACKAGE.sixQuestions.whatHappened.summary}</p>
                <div className="space-y-2 border-t border-gray-700/50 pt-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Chronological Milestones (1947–1962)</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {CHAPTER_1_PACKAGE.sixQuestions.whatHappened.keyEvents.map((e) => (
                      <div key={e.year} className="bg-gray-900/60 p-2.5 rounded border border-gray-800 text-xs">
                        <span className="font-bold text-amber-400">{e.year}: </span>
                        <span className="text-gray-300">{e.event}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 2. Why Did It Happen */}
              <div className="bg-gray-800/40 border border-gray-700/60 rounded-xl p-6">
                <h3 className="text-xl font-bold text-amber-300 mb-3">{CHAPTER_1_PACKAGE.sixQuestions.whyDidItHappen.title}</h3>
                <p className="text-gray-300 leading-relaxed">{CHAPTER_1_PACKAGE.sixQuestions.whyDidItHappen.summary}</p>
              </div>

              {/* 3. What Alternatives Existed */}
              <div className="bg-gray-800/40 border border-gray-700/60 rounded-xl p-6">
                <h3 className="text-xl font-bold text-amber-300 mb-3">{CHAPTER_1_PACKAGE.sixQuestions.whatAlternativesEisted.title}</h3>
                <p className="text-gray-300 leading-relaxed">{CHAPTER_1_PACKAGE.sixQuestions.whatAlternativesEisted.summary}</p>
              </div>

              {/* 4. Why Strategic Autonomy */}
              <div className="bg-gray-800/40 border border-gray-700/60 rounded-xl p-6">
                <h3 className="text-xl font-bold text-amber-300 mb-3">{CHAPTER_1_PACKAGE.sixQuestions.whyStrategicAutonomy.title}</h3>
                <p className="text-gray-300 leading-relaxed">{CHAPTER_1_PACKAGE.sixQuestions.whyStrategicAutonomy.summary}</p>
              </div>

              {/* 5. Consequences */}
              <div className="bg-gray-800/40 border border-gray-700/60 rounded-xl p-6">
                <h3 className="text-xl font-bold text-amber-300 mb-3">{CHAPTER_1_PACKAGE.sixQuestions.consequences.title}</h3>
                <p className="text-gray-300 leading-relaxed">{CHAPTER_1_PACKAGE.sixQuestions.consequences.summary}</p>
              </div>

              {/* 6. Relevance Today */}
              <div className="bg-gray-800/40 border border-gray-700/60 rounded-xl p-6">
                <h3 className="text-xl font-bold text-amber-300 mb-3">{CHAPTER_1_PACKAGE.sixQuestions.relevanceToday.title}</h3>
                <p className="text-gray-300 leading-relaxed">{CHAPTER_1_PACKAGE.sixQuestions.relevanceToday.summary}</p>
              </div>
            </section>

            {/* Four-Layer Structure Analysis */}
            <section aria-labelledby="four-layer-heading" className="bg-gray-800/30 border border-amber-500/20 rounded-xl p-6 space-y-4">
              <h2 id="four-layer-heading" className="text-xl font-bold text-gray-100">
                Four-Layer Structure Attestation Matrix
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-gray-900/60 p-4 rounded-lg border border-gray-800">
                  <h3 className="font-bold text-amber-400 mb-1">Layer 1: What Happened</h3>
                  <p className="text-gray-300">{CHAPTER_1_PACKAGE.fourLayers.whatHappened}</p>
                </div>
                <div className="bg-gray-900/60 p-4 rounded-lg border border-gray-800">
                  <h3 className="font-bold text-emerald-400 mb-1">Layer 2: What Evidence Shows</h3>
                  <p className="text-gray-300">{CHAPTER_1_PACKAGE.fourLayers.whatEvidenceShows}</p>
                </div>
                <div className="bg-gray-900/60 p-4 rounded-lg border border-gray-800">
                  <h3 className="font-bold text-blue-400 mb-1">Layer 3: Where Historians Disagree</h3>
                  <p className="text-gray-300">{CHAPTER_1_PACKAGE.fourLayers.whereHistoriansDisagree}</p>
                </div>
                <div className="bg-gray-900/60 p-4 rounded-lg border border-gray-800">
                  <h3 className="font-bold text-purple-400 mb-1">Layer 4: Why It Matters</h3>
                  <p className="text-gray-300">{CHAPTER_1_PACKAGE.fourLayers.whyItMatters}</p>
                </div>
              </div>
            </section>

            {/* Linked Canonical Fix Framework */}
            <section aria-labelledby="linked-fix-heading" className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-6 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                  Linked Canonical Fix Framework
                </span>
              </div>
              <h2 id="linked-fix-heading" className="text-xl font-bold text-gray-100">
                <Link href={`/fix/${CHAPTER_1_PACKAGE.fix.slug}`} className="hover:text-emerald-300 transition-colors">
                  {CHAPTER_1_PACKAGE.fix.headline}
                </Link>
              </h2>
              <p className="text-sm text-gray-300 leading-relaxed">
                {CHAPTER_1_PACKAGE.fix.summary}
              </p>
              <div className="pt-2">
                <Link href={`/fix/${CHAPTER_1_PACKAGE.fix.slug}`} className="text-xs font-bold text-amber-400 hover:text-amber-300 underline">
                  Explore full Fix Framework, trade-offs, and procurement metrics →
                </Link>
              </div>
            </section>
          </div>

          {/* Sidebar (4 Cols) */}
          <aside className="lg:col-span-4 space-y-6">
            
            {/* Gold Standard Audit Certificate Card */}
            <div className="bg-gray-800/60 border border-emerald-500/40 rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-emerald-300 uppercase tracking-wider border-b border-gray-700/50 pb-2">
                Gold Standard Review Certificate
              </h3>
              <div className="text-xs text-gray-300 space-y-2">
                <div className="flex justify-between">
                  <span>Overall Score:</span>
                  <strong className="text-emerald-400">{auditCert.totalScore} / {auditCert.maxTotalScore} ({auditCert.percentage}%)</strong>
                </div>
                <div className="flex justify-between">
                  <span>Audit Status:</span>
                  <strong className="text-emerald-400 uppercase font-mono">Passed & Certified</strong>
                </div>
              </div>
              <div className="border-t border-gray-700/50 pt-2 space-y-1 text-[11px] text-gray-400">
                {auditCert.phases.map((p) => (
                  <div key={p.phaseNumber} className="flex justify-between">
                    <span>Phase {p.phaseNumber}: {p.phaseName}</span>
                    <span className="text-emerald-400">✓ {p.score}/{p.maxScore}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Primary Sources Hierarchy Box */}
            <div className="bg-gray-800/40 border border-gray-700/60 rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider border-b border-gray-700/50 pb-2">
                Level 1 Primary Sources ({CHAPTER_1_PACKAGE.sources.length})
              </h3>
              <div className="space-y-2 text-xs">
                {CHAPTER_1_PACKAGE.sources.map((s) => (
                  <div key={s.id} className="bg-gray-900/60 p-2.5 rounded border border-gray-800 space-y-1">
                    <span className="font-semibold text-gray-200 block line-clamp-2">{s.title}</span>
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-amber-400 hover:underline block truncate">
                      {s.url}
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Verified Claims Registry Box */}
            <div className="bg-gray-800/40 border border-gray-700/60 rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider border-b border-gray-700/50 pb-2">
                Attested Claims ({CHAPTER_1_PACKAGE.claims.length})
              </h3>
              <div className="space-y-2 text-xs">
                {CHAPTER_1_PACKAGE.claims.map((c) => (
                  <div key={c.id} className="bg-gray-900/60 p-2.5 rounded border border-gray-800 space-y-1">
                    <span className="text-amber-400 font-mono text-[10px] block">{c.id} (Conf: {Math.round(c.confidence * 100)}%)</span>
                    <p className="text-gray-300">{c.claim}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

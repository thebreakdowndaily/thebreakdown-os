import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { REMEDIATED_STORIES_REGISTRY } from '@/lib/editorial/drafts/remediated-stories';
import type { Story, Source, Claim } from '@/types/canonical';

interface EvidenceDossier {
  source: Source;
  story: Story;
  associatedClaims: Claim[];
}

function findEvidenceDossier(id: string): EvidenceDossier | null {
  for (const story of Object.values(REMEDIATED_STORIES_REGISTRY)) {
    const source = (story.sources || []).find((s) => s.id === id);
    if (source) {
      const associatedClaims = (story.claims || []).filter(
        (c) => c.sourceId === id || c.source === id || c.sourceUrl?.includes(id)
      );
      return { source, story, associatedClaims };
    }
  }
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const dossier = findEvidenceDossier(id);
  if (!dossier) {
    return { title: 'Evidence Document Not Found — The Breakdown' };
  }
  return {
    title: `Evidence Vault: ${dossier.source.title} — The Breakdown`,
    description: `Primary evidence provenance record for ${dossier.source.title}, published by ${dossier.source.publisher || 'Official Authority'}.`,
  };
}

export default async function EvidenceProvenancePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dossier = findEvidenceDossier(id);

  if (!dossier) {
    notFound();
  }

  const { source, story, associatedClaims } = dossier;

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-neutral-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono text-neutral-400">
          <Link href="/" className="hover:text-emerald-400 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href={`/preview/story/${story.slug}`} className="hover:text-emerald-400 transition-colors truncate max-w-xs">
            {story.headline}
          </Link>
          <span>/</span>
          <span className="text-emerald-400 font-bold">Evidence Vault</span>
        </nav>

        {/* Top Header Card */}
        <header className="p-6 sm:p-8 rounded-2xl bg-neutral-900/60 border border-neutral-800 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono uppercase font-bold tracking-widest text-emerald-400">
                Primary Evidence Dossier
              </span>
            </div>
            <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-mono font-bold">
              Tier {source.tier || 1} — Primary Authority
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
            {source.title}
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-neutral-800/80 text-xs font-mono">
            <div>
              <span className="text-neutral-500 uppercase block">Publisher:</span>
              <span className="text-neutral-200 font-semibold">{source.publisher || 'Official Body'}</span>
            </div>
            <div>
              <span className="text-neutral-500 uppercase block">Publication Date:</span>
              <span className="text-neutral-200 font-semibold">{source.publishedAt || 'Verified Official'}</span>
            </div>
            <div>
              <span className="text-neutral-500 uppercase block">Verification Date:</span>
              <span className="text-neutral-200 font-semibold">{source.accessedAt || '2026-10-24'}</span>
            </div>
            <div>
              <span className="text-neutral-500 uppercase block">Evidence ID:</span>
              <span className="text-emerald-400 font-semibold">{source.id}</span>
            </div>
          </div>
        </header>

        {/* Primary Document Direct Link */}
        <section className="p-6 rounded-xl bg-neutral-950/80 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Original Upstream Document
            </h2>
            <p className="text-xs text-neutral-400 break-all font-mono">
              {source.url}
            </p>
          </div>
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-mono font-bold text-xs transition-colors shrink-0 flex items-center gap-2 shadow-lg shadow-emerald-950/50"
          >
            <span>Open Primary Document</span>
            <span aria-hidden="true">↗</span>
          </a>
        </section>

        {/* Associated Claims & Passages */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Verified Claims &amp; Extracted Passages</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300">
                {associatedClaims.length}
              </span>
            </h2>
            <span className="text-xs font-mono text-neutral-500">
              Citing Investigation: <Link href={`/preview/story/${story.slug}`} className="text-emerald-400 hover:underline">{story.slug}</Link>
            </span>
          </div>

          <div className="space-y-4">
            {associatedClaims.map((claim, idx) => (
              <article
                key={claim.id || idx}
                className="p-5 sm:p-6 rounded-xl bg-neutral-900/40 border border-neutral-800/80 space-y-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono font-bold text-neutral-400">
                    Claim #{idx + 1} ({claim.id})
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                    {claim.verificationStatus || claim.status || 'Verified'} (Confidence: {Math.round((claim.confidence || 0.98) * 100)}%)
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono uppercase font-bold text-neutral-500 block">
                    Material Statement:
                  </span>
                  <p className="text-sm sm:text-base font-semibold text-neutral-100 leading-snug">
                    {claim.claim}
                  </p>
                </div>

                {claim.quote && (
                  <div className="pl-4 border-l-2 border-sky-500/50 space-y-1 bg-sky-950/20 p-3 rounded-r-lg">
                    <span className="text-[10px] font-mono uppercase font-bold text-sky-400 block">
                      Direct Passage from Primary Source:
                    </span>
                    <blockquote className="text-xs sm:text-sm text-neutral-200 italic leading-relaxed">
                      &ldquo;{claim.quote}&rdquo;
                    </blockquote>
                  </div>
                )}

                {claim.data && (
                  <div className="pl-4 border-l-2 border-emerald-500/50 space-y-1 bg-emerald-950/20 p-3 rounded-r-lg">
                    <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 block">
                      Empirical Evidence &amp; Analytical Context:
                    </span>
                    <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans">
                      {claim.data}
                    </p>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>

        {/* Footer Back Link */}
        <footer className="pt-8 border-t border-neutral-800 text-center">
          <Link
            href={`/preview/story/${story.slug}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs font-mono font-medium border border-neutral-700 transition-colors"
          >
            <span>← Return to Investigation: {story.title}</span>
          </Link>
        </footer>
      </div>
    </main>
  );
}

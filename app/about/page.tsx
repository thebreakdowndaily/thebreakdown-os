import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/layout/Container';

/**
 * About page — Institutional identity surface
 * Governance: docs/rxs/ · Editorial Constitution v1.1 · AGENTS.md Platform Beta
 *
 * Earth-inspired design: editorial institution page.
 * This page communicates: who we are, how we work, why we can be trusted.
 *
 * Not a marketing page. An editorial institution declaration.
 */

export const metadata: Metadata = {
  title:       'About — The Breakdown',
  description: 'The Breakdown is an independent, evidence-first knowledge platform covering India through primary sources, verified claims, and transparent methodology.',
  alternates: {
    canonical: 'https://thebreakdown.in/about',
  },
  openGraph: {
    title:       'About — The Breakdown',
    description: 'An independent, evidence-first knowledge platform.',
    url:         'https://thebreakdown.in/about',
  },
};

// ── Sub-components ────────────────────────────────────────────────────────────

function Principle({
  number,
  title,
  body,
}: {
  number: string;
  title: string;
  body: string;
}) {
  return (
    <div className="flex gap-6 py-6" style={{ borderBottom: '1px solid var(--color-border-default)' }}>
      <span
        className="text-3xl font-bold leading-none shrink-0 select-none"
        style={{
          fontFamily: 'var(--font-playfair), Georgia, serif',
          color:      'var(--color-border-hover)',
        }}
        aria-hidden="true"
      >
        {number}
      </span>
      <div className="space-y-2">
        <h3
          className="text-base font-semibold"
          style={{
            fontFamily: 'var(--font-playfair), Georgia, serif',
            color:      'var(--color-text-primary)',
          }}
        >
          {title}
        </h3>
        <p
          className="text-sm leading-relaxed"
          style={{
            color:      'var(--color-text-muted)',
            fontFamily: 'var(--font-reading), Georgia, serif',
          }}
        >
          {body}
        </p>
      </div>
    </div>
  );
}

function InstitutionLink({ href, label, description }: { href: string; label: string; description: string }) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-1 py-4 border-b transition-colors duration-150"
      style={{ borderColor: 'var(--color-border-default)', textDecoration: 'none' }}
    >
      <span
        className="text-sm font-semibold transition-colors duration-150 group-hover:text-[var(--color-brand-400)]"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {label} →
      </span>
      <span
        className="text-xs"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {description}
      </span>
    </Link>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <main id="main-content">
      <div className="py-16 lg:py-20">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-16 max-w-6xl">

            {/* ── Left: main content ── */}
            <div>
              {/* Section label */}
              <div className="flex items-center gap-4 mb-8">
                <div
                  className="h-px w-10 shrink-0"
                  style={{ backgroundColor: 'var(--color-earth-ochre)', opacity: 0.5 }}
                  aria-hidden="true"
                />
                <span
                  className="text-[11px] font-mono uppercase tracking-[0.22em]"
                  style={{ color: 'var(--color-earth-ochre)' }}
                >
                  Institution
                </span>
              </div>

              {/* Mission — display headline */}
              <h1
                className="text-4xl sm:text-5xl font-bold leading-tight mb-6"
                style={{
                  fontFamily: 'var(--font-playfair), Georgia, serif',
                  color:      'var(--color-text-primary)',
                  maxWidth:   '20ch',
                }}
              >
                Transform information into understanding.
              </h1>

              <p
                className="text-lg leading-relaxed mb-10"
                style={{
                  color:      'var(--color-text-secondary)',
                  fontFamily: 'var(--font-reading), Georgia, serif',
                  maxWidth:   '52ch',
                }}
              >
                The Breakdown is an independent knowledge platform that explains India —
                its history, policy, geopolitics, and society — through the lens of evidence,
                primary sources, and transparent reasoning.
              </p>

              {/* Product promise */}
              <blockquote
                className="pl-5 py-4 mb-10"
                style={{ borderLeft: '3px solid var(--color-earth-ochre)' }}
              >
                <p
                  className="text-base leading-relaxed italic"
                  style={{
                    color:      'var(--color-text-primary)',
                    fontFamily: 'var(--font-playfair), Georgia, serif',
                  }}
                >
                  "Read it like a newspaper. Understand it like an explainer. Verify it like a researcher."
                </p>
              </blockquote>

              {/* How we work */}
              <h2
                className="text-xl font-bold mb-2"
                style={{
                  fontFamily: 'var(--font-playfair), Georgia, serif',
                  color:      'var(--color-text-primary)',
                }}
              >
                How we work
              </h2>
              <p
                className="text-sm leading-relaxed mb-6"
                style={{
                  color:      'var(--color-text-muted)',
                  fontFamily: 'var(--font-reading), Georgia, serif',
                }}
              >
                We believe understanding complex policy requires more than opinion — it requires
                data, context, and rigorous verification. Every piece we publish is built on
                a foundation of primary sources and registered, verifiable claims.
              </p>

              <div className="space-y-0 mb-10">
                <Principle
                  number="01"
                  title="Evidence before conclusions"
                  body="Every claim is sourced, registered, and verified before publication. We build the evidence base first — then we write."
                />
                <Principle
                  number="02"
                  title="Uncertainty always visible"
                  body="Where historians disagree, we say so. Where evidence is incomplete or contested, we mark it. We do not pretend to certainty we do not have."
                />
                <Principle
                  number="03"
                  title="Reasoning always shown"
                  body="We show our work. Claim → Evidence → Source → Document. Any reader can verify every step independently. That is the promise."
                />
                <Principle
                  number="04"
                  title="Independence, always"
                  body="The Breakdown does not accept advertising or political funding. Our editorial independence is the product."
                />
              </div>
            </div>

            {/* ── Right: institution links ── */}
            <div className="lg:pt-[88px]">
              <div
                className="p-6 rounded mb-6"
                style={{
                  backgroundColor: 'var(--color-bg-secondary)',
                  border:          '1px solid var(--color-border-default)',
                }}
              >
                <p
                  className="text-[11px] font-mono uppercase tracking-[0.2em] mb-4"
                  style={{ color: 'var(--color-earth-ochre)' }}
                >
                  Governance & Transparency
                </p>
                <div className="space-y-0">
                  <InstitutionLink
                    href="/editorial-constitution"
                    label="Editorial Constitution v1.1"
                    description="The supreme editorial governance document. All publishing decisions flow from this."
                  />
                  <InstitutionLink
                    href="/methodology"
                    label="Methodology & Sources"
                    description="How we source, verify, and publish. Our evidence hierarchy and claim standards."
                  />
                  <InstitutionLink
                    href="/trust"
                    label="Trust Dashboard"
                    description="Live platform metrics: chapters reviewed, claims registered, sources cited."
                  />
                </div>
              </div>

              {/* Start reading */}
              <div
                className="p-6 rounded"
                style={{
                  backgroundColor: 'var(--color-bg-secondary)',
                  border:          '1px solid var(--color-border-default)',
                }}
              >
                <p
                  className="text-[11px] font-mono uppercase tracking-[0.2em] mb-4"
                  style={{ color: 'var(--color-earth-ochre)' }}
                >
                  Start Reading
                </p>
                <p
                  className="text-sm leading-relaxed mb-4"
                  style={{
                    color:      'var(--color-text-muted)',
                    fontFamily: 'var(--font-reading), Georgia, serif',
                  }}
                >
                  Volume I of India & The World covers 1947–1962.
                  The founding chapter is available now.
                </p>
                <Link
                  href="/series"
                  className="inline-flex items-center gap-2 text-sm font-semibold transition-colors duration-150"
                  style={{ color: 'var(--color-earth-ochre)', textDecoration: 'none' }}
                >
                  Browse the Knowledge Library →
                </Link>
              </div>
            </div>

          </div>
        </Container>
      </div>
    </main>
  );
}

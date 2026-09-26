import type { Metadata } from 'next';
import Link from 'next/link';
import { bootstrapServices } from '@/lib/bootstrap';
import Container from '@/components/layout/Container';

/**
 * Investigations page — Editorial landing surface
 * Governance: docs/rxs/screens/investigation.md · AGENTS.md Platform Beta
 *
 * Earth-inspired design: Dark Discovery base, atmosphere blue accent
 * for investigations (conveys depth, seriousness, documentary weight).
 *
 * Layout: full-width featured investigation + list grid below.
 * Empty state: editorial, not generic — signals editorial intent.
 */

export const metadata: Metadata = {
  title:       'Investigations — The Breakdown',
  description: 'In-depth, evidence-driven investigations into Indian policy, governance, geopolitics, and society. Every claim sourced. Every source linked.',
  alternates: {
    canonical: 'https://thebreakdown.in/investigations',
  },
  openGraph: {
    title:       'Investigations — The Breakdown',
    description: 'In-depth evidence-driven investigations.',
    url:         'https://thebreakdown.in/investigations',
  },
};

// ── Sub-components ─────────────────────────────────────────────────────────────

function SectionHeader() {
  return (
    <div className="mb-14">
      <div className="flex items-center gap-4 mb-3">
        <div
          className="h-px w-10 shrink-0"
          style={{ backgroundColor: 'var(--color-earth-atmosphere)', opacity: 0.7 }}
          aria-hidden="true"
        />
        <span
          className="text-[11px] font-mono uppercase tracking-[0.22em]"
          style={{ color: 'var(--color-earth-atmosphere)' }}
        >
          Investigations
        </span>
      </div>
      <h1
        className="text-4xl sm:text-5xl font-bold leading-tight mb-4"
        style={{
          fontFamily: 'var(--font-playfair), Georgia, serif',
          color:      'var(--color-text-primary)',
          maxWidth:   '22ch',
        }}
      >
        Evidence-driven reporting on India
      </h1>
      <p
        className="text-base leading-relaxed"
        style={{
          color:      'var(--color-text-secondary)',
          fontFamily: 'var(--font-reading), Georgia, serif',
          maxWidth:   '52ch',
        }}
      >
        Every investigation starts with a question, builds a claim registry,
        and ends with sources any reader can verify. Not opinion. Evidence.
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      className="rounded border py-16 px-8"
      style={{
        backgroundColor: 'var(--color-bg-secondary)',
        borderColor:     'var(--color-border-default)',
      }}
    >
      {/* Atmosphere blue accent line */}
      <div
        className="h-px mb-8"
        style={{
          background: 'linear-gradient(90deg, var(--color-earth-atmosphere) 0%, transparent 60%)',
        }}
        aria-hidden="true"
      />

      <div className="max-w-lg">
        <p
          className="text-[11px] font-mono uppercase tracking-[0.2em] mb-3"
          style={{ color: 'var(--color-earth-atmosphere)' }}
        >
          In Progress
        </p>
        <h2
          className="text-2xl font-bold leading-snug mb-4"
          style={{
            fontFamily: 'var(--font-playfair), Georgia, serif',
            color:      'var(--color-text-primary)',
          }}
        >
          Volume I investigations are in active research
        </h2>
        <p
          className="text-sm leading-relaxed mb-6"
          style={{
            color:      'var(--color-text-muted)',
            fontFamily: 'var(--font-reading), Georgia, serif',
          }}
        >
          The Breakdown's investigations follow the same evidence standard as our chapters:
          every claim registered, every source cited, every document linked.
          We publish when the evidence is complete — not before.
        </p>

        {/* Editorial commitment */}
        <div className="space-y-2">
          {[
            "India's Non-Alignment: The Strategic Calculation",
            'The Kashmir Plebiscite: What the Documents Show',
            '1962: Intelligence Failures and Political Choices',
          ].map((title) => (
            <div
              key={title}
              className="flex items-center gap-3 py-2"
              style={{ borderBottom: '1px solid var(--color-border-default)' }}
            >
              <span
                className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded"
                style={{
                  backgroundColor: 'var(--color-bg-tertiary)',
                  color:           'var(--color-earth-dust)',
                  border:          '1px solid var(--color-border-default)',
                }}
              >
                In Research
              </span>
              <span
                className="text-sm"
                style={{
                  color:      'var(--color-text-secondary)',
                  fontFamily: 'var(--font-playfair), Georgia, serif',
                }}
              >
                {title}
              </span>
            </div>
          ))}
        </div>

        <p
          className="mt-6 text-xs font-mono"
          style={{ color: 'var(--color-earth-dust)' }}
        >
          Check back monthly · Founding chapter now available in the{' '}
          <Link
            href="/series"
            style={{ color: 'var(--color-earth-ochre)', textDecoration: 'none' }}
          >
            Knowledge Library →
          </Link>
        </p>
      </div>
    </div>
  );
}

interface Investigation {
  slug: string;
  title: string;
  subtitle?: string;
  summary?: string;
  chapters: unknown[];
  publishedAt: string;
}

function InvestigationCard({ inv }: { inv: Investigation }) {
  return (
    <Link
      href={`/investigation/${inv.slug}`}
      className="group flex flex-col rounded border transition-colors duration-150"
      style={{
        backgroundColor: 'var(--color-bg-secondary)',
        borderColor:     'var(--color-border-default)',
        textDecoration:  'none',
      }}
    >
      {/* Atmosphere blue top line on hover */}
      <div
        className="h-px shrink-0 transition-all duration-150"
        style={{ background: 'var(--color-earth-atmosphere)', opacity: 0 }}
        aria-hidden="true"
      />

      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-mono uppercase tracking-[0.18em] px-2 py-0.5 rounded"
            style={{
              backgroundColor: 'var(--color-earth-atmosphere)',
              color:           'var(--color-text-primary)',
              opacity:         0.8,
            }}
          >
            Investigation
          </span>
        </div>
        <h2
          className="text-lg font-semibold leading-snug transition-colors duration-150 group-hover:text-[var(--color-brand-400)]"
          style={{
            fontFamily: 'var(--font-playfair), Georgia, serif',
            color:      'var(--color-text-primary)',
          }}
        >
          {inv.title}
        </h2>
        {inv.subtitle && (
          <p className="text-sm" style={{ color: 'var(--color-earth-ochre)', opacity: 0.8 }}>
            {inv.subtitle}
          </p>
        )}
        {inv.summary && (
          <p
            className="text-sm leading-relaxed line-clamp-2"
            style={{
              color:      'var(--color-text-muted)',
              fontFamily: 'var(--font-reading), Georgia, serif',
            }}
          >
            {inv.summary}
          </p>
        )}
        <div
          className="flex items-center gap-4 text-xs font-mono pt-2"
          style={{
            color:        'var(--color-earth-dust)',
            borderTop:    '1px solid var(--color-border-default)',
            paddingTop:   '0.75rem',
          }}
        >
          <span>{inv.chapters.length} chapters</span>
          <span aria-hidden="true">·</span>
          <span>
            {new Date(inv.publishedAt).toLocaleDateString('en-IN', {
              year: 'numeric', month: 'short', day: 'numeric',
            })}
          </span>
        </div>
      </div>
    </Link>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function InvestigationsPage() {
  const services = bootstrapServices({ publicOnly: true });
  const { data: investigations } = await services.investigations.getInvestigations();

  return (
    <main id="main-content">
      <div
        style={{ borderBottom: '1px solid var(--color-border-default)' }}
        className="py-16 lg:py-20"
      >
        <Container>
          <SectionHeader />

          {investigations.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {investigations.map((inv) => (
                <InvestigationCard key={inv.slug} inv={inv} />
              ))}
            </div>
          )}
        </Container>
      </div>
    </main>
  );
}

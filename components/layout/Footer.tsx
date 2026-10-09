/**
 * Footer — Global Site Footer
 * Governance: docs/rxs/screens/homepage.md · AGENTS.md Platform Beta
 *
 * Earth-inspired design: warm ochre accent, mineral stone separators,
 * editorial typography. The footer communicates institutional legitimacy
 * and makes The Breakdown's product architecture discoverable.
 *
 * Structure:
 *   Brand column — wordmark + mission statement + social
 *   Explore      — primary content sections
 *   Institution  — editorial governance + trust
 *   Legal        — privacy, terms, contact
 */

import React from 'react';
import Link from 'next/link';

// ── Footer link data ─────────────────────────────────────────────────────────

const exploreLinks = [
  { label: 'Monographs & Series', href: '/series' },
  { label: 'Investigations',    href: '/investigations' },
  { label: 'Explainers',        href: '/fix' },
  { label: 'Topics',            href: '/topics' },
  { label: 'Data & Evidence',   href: '/data' },
  { label: 'The Brief',         href: '/newsletter' },
];

const institutionLinks = [
  { label: 'About The Breakdown',       href: '/about' },
  { label: 'Editorial Constitution',    href: '/editorial-constitution' },
  { label: 'Methodology & Sources',     href: '/methodology' },
  { label: 'Standards & Methodology',   href: '/trust' },
  { label: 'Corrections & Errata',      href: '/transparency/corrections' },
];

const legalLinks = [
  { label: 'Privacy',    href: '/about' },
  { label: 'Terms',      href: '/about' },
  { label: 'Contact',    href: '/about/contact' },
  { label: 'RSS Feed',   href: '/rss' },
];



// ── Sub-components ───────────────────────────────────────────────────────────

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <h4
      className="text-xs font-mono uppercase tracking-[0.18em] mb-4"
      style={{ color: 'var(--color-earth-ochre)' }}
    >
      {children}
    </h4>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  const isExternal = href.startsWith('http');
  if (isExternal) {
    return (
      <li>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="footer-link text-sm leading-relaxed transition-colors duration-150"
          style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}
        >
          {children}
        </a>
      </li>
    );
  }
  return (
    <li>
      <Link
        href={href}
        className="footer-link text-sm leading-relaxed transition-colors duration-150"
        style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}
      >
        {children}
      </Link>
    </li>
  );
}

// ── Footer ───────────────────────────────────────────────────────────────────

const Footer: React.FC = () => (
  <footer
    style={{
      backgroundColor: 'var(--color-bg-secondary)',
      borderTop: '1px solid var(--color-border-default)',
    }}
    role="contentinfo"
  >
    {/* Ochre top accent line */}
    <div
      style={{
        height: '1px',
        background: 'linear-gradient(90deg, var(--color-earth-ochre) 0%, transparent 60%)',
      }}
      aria-hidden="true"
    />

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

      {/* Main footer grid */}
      <div className="footer-grid grid gap-12">

        {/* ── Brand column ── */}
        <div>
          {/* Wordmark */}
          <Link
            href="/"
            className="inline-flex flex-col leading-none group mb-4"
            aria-label="The Breakdown — Home"
          >
            <span
              className="text-[10px] font-mono uppercase tracking-[0.22em]"
              style={{ color: 'var(--color-earth-dust)' }}
            >
              The
            </span>
            <span
              className="text-2xl font-bold tracking-tight"
              style={{
                fontFamily: 'var(--font-playfair), Georgia, serif',
                color: 'var(--color-text-primary)',
                lineHeight: '1.1',
              }}
            >
              Breakdown
            </span>
          </Link>

          {/* Mission statement */}
          <p
            className="text-sm leading-relaxed mb-2"
            style={{ color: 'var(--color-text-muted)', maxWidth: '28ch' }}
          >
            Transform information into understanding.
          </p>
          <p
            className="text-xs font-mono leading-relaxed mb-6"
            style={{ color: 'var(--color-earth-dust)', maxWidth: '32ch' }}
          >
            Read it like a newspaper. Understand it like an explainer. Verify it like a researcher.
          </p>
        </div>

        {/* ── Explore ── */}
        <nav aria-label="Explore content sections">
          <FooterHeading>Explore</FooterHeading>
          <ul className="space-y-2 list-none p-0 m-0">
            {exploreLinks.map((link) => (
              <FooterLink key={link.href} href={link.href}>{link.label}</FooterLink>
            ))}
          </ul>
        </nav>

        {/* ── Institution ── */}
        <nav aria-label="Institution and governance links">
          <FooterHeading>Institution</FooterHeading>
          <ul className="space-y-2 list-none p-0 m-0">
            {institutionLinks.map((link) => (
              <FooterLink key={link.href} href={link.href}>{link.label}</FooterLink>
            ))}
          </ul>
        </nav>

        {/* ── Legal + Brief ── */}
        <div>
          <nav aria-label="Legal links">
            <FooterHeading>Legal & Contact</FooterHeading>
            <ul className="space-y-2 list-none p-0 m-0 mb-8">
              {legalLinks.map((link) => (
                <FooterLink key={link.href} href={link.href}>{link.label}</FooterLink>
              ))}
            </ul>
          </nav>

          {/* Newsletter CTA */}
          <div>
            <p
              className="text-xs font-mono uppercase tracking-[0.14em] mb-2"
              style={{ color: 'var(--color-earth-ochre)' }}
            >
              The Breakdown Brief
            </p>
            <p
              className="text-xs leading-relaxed mb-3"
              style={{ color: 'var(--color-text-muted)' }}
            >
              One email a week. No noise. Just understanding.
            </p>
            <Link
              href="/newsletter"
              className="inline-block text-xs font-semibold tracking-wide px-4 py-2 rounded transition-colors duration-150"
              style={{
                backgroundColor: 'var(--color-earth-ochre)',
                color: 'var(--color-text-inverse)',
              }}
            >
              Subscribe free →
            </Link>
          </div>
        </div>

      </div>

      {/* ── Bottom bar ── */}
      <div
        className="footer-bottom mt-12 pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{ borderTop: '1px solid var(--color-border-default)' }}
      >
        <p
          className="text-xs font-mono"
          style={{ color: 'var(--color-earth-dust)' }}
        >
          © {new Date().getFullYear()} The Breakdown. Evidence-first journalism on India.
        </p>
        <p
          className="text-xs font-mono"
          style={{ color: 'var(--color-earth-dust)', opacity: 0.6 }}
        >
          Every claim sourced. Every source linked.
        </p>
      </div>

    </div>

    {/* Responsive grid + hover styles */}
    <style>{`
      .footer-grid {
        grid-template-columns: 1fr;
      }
      @media (min-width: 640px) {
        .footer-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }
      @media (min-width: 1024px) {
        .footer-grid {
          grid-template-columns: 1.4fr 1fr 1fr 1fr;
        }
      }
      .footer-link:hover,
      .footer-link:focus-visible {
        color: var(--color-brand-400) !important;
      }
      .social-icon:hover {
        color: var(--color-brand-400) !important;
      }
    `}</style>
  </footer>
);

export default Footer;

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
  { label: 'Knowledge Library', href: '/series' },
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
  { label: 'Trust Dashboard',           href: '/trust' },
  { label: 'Corrections & Errata',      href: '/transparency/corrections' },
];

const legalLinks = [
  { label: 'Privacy',    href: '/about' },
  { label: 'Terms',      href: '/about' },
  { label: 'Contact',    href: '/about/contact' },
  { label: 'RSS Feed',   href: '/rss' },
];

const socialLinks = [
  {
    label: 'X (Twitter)',
    href: 'https://twitter.com/thebreakdown',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com/thebreakdown',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 016.11 2.525c.636-.247 1.363-.416 2.427-.465C8.88 2.013 9.235 2 11.667 2h.63zm-.08 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
      </svg>
    ),
  },
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
  return (
    <li>
      <a
        href={href}
        {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        className="footer-link text-sm leading-relaxed transition-colors duration-150"
        style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}
      >
        {children}
      </a>
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

          {/* Social links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon transition-colors duration-150"
                style={{ color: 'var(--color-earth-dust)' }}
                aria-label={link.label}
              >
                {link.icon}
              </a>
            ))}
          </div>
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

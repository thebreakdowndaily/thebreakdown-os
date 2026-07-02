import React from 'react';
import Link from 'next/link';

const footerSections = [
  {
    title: 'Sections',
    links: [
      { label: 'Investigations', href: '/story?category=investigation' },
      { label: 'Data Stories', href: '/data' },
      { label: 'Policy Tracker', href: '/topic/policy' },
      { label: 'The Fix', href: '/fix' },
    ],
  },
  {
    title: 'Topics',
    links: [
      { label: 'Economy', href: '/topic/economy' },
      { label: 'Policy', href: '/topic/policy' },
      { label: 'Technology', href: '/topic/technology' },
      { label: 'Environment', href: '/topic/environment' },
    ],
  },
  {
    title: 'About',
    links: [
      { label: 'Mission', href: '/about' },
      { label: 'Methodology', href: '/about/methodology' },
      { label: 'Team', href: '/about/team' },
      { label: 'Contact', href: '/about/contact' },
    ],
  },
];

const socialLinks = [
  {
    label: 'Twitter / X',
    href: 'https://twitter.com/thebreakdown',
    icon: (
      <svg
        style={{ width: 'var(--spacing-5)', height: 'var(--spacing-5)' }}
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com/thebreakdown',
    icon: (
      <svg
        style={{ width: 'var(--spacing-5)', height: 'var(--spacing-5)' }}
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 016.11 2.525c.636-.247 1.363-.416 2.427-.465C8.88 2.013 9.235 2 11.667 2h.63zm-.08 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
      </svg>
    ),
  },
];

/* ── Shared link style ──────────────────────────────────────────────────── */
const linkStyle: React.CSSProperties = {
  fontSize: 'var(--text-sm)',
  color: 'var(--color-text-muted)',
  textDecoration: 'none',
};

const Footer: React.FC = () => (
  <footer
    style={{
      backgroundColor: 'var(--color-bg-primary)',
      borderTop: '1px solid var(--color-border-default)',
    }}
    role="contentinfo"
  >
    <div
      style={{
        maxWidth: '80rem',
        margin: '0 auto',
        padding: 'var(--spacing-12) var(--spacing-4)',
      }}
    >
      {/* Grid: 1 col mobile, 2 col tablet, 4 col desktop */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 'var(--spacing-8)',
        }}
        className="footer-grid"
      >
        {/* Brand column */}
        <div>
          <Link
            href="/"
            style={{
              fontSize: 'var(--text-xl)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--color-brand-400)',
              textDecoration: 'none',
            }}
          >
            The Breakdown
          </Link>
          <p style={{ marginTop: 'var(--spacing-2)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
            India Explained
          </p>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-3)',
              marginTop: 'var(--spacing-4)',
            }}
          >
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...linkStyle, color: 'var(--color-text-muted)' }}
                className="social-icon"
                aria-label={link.label}
              >
                {link.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Link sections */}
        {footerSections.map((section) => (
          <div key={section.title}>
            <h4
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-text-primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: 'var(--spacing-3)',
              }}
            >
              {section.title}
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
              {section.links.map((link) => (
                <li key={link.href}>
                  <a href={link.href} style={linkStyle} className="footer-link">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div
        style={{
          marginTop: 'var(--spacing-10)',
          paddingTop: 'var(--spacing-8)',
          borderTop: '1px solid var(--color-border-default)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--spacing-4)',
        }}
        className="footer-bottom"
      >
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          &copy; {new Date().getFullYear()} The Breakdown. All rights reserved.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)' }}>
          <a href="/rss" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textDecoration: 'none' }} className="footer-link">
            RSS Feed
          </a>
          <a href="/newsletter" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textDecoration: 'none' }} className="footer-link">
            Newsletter
          </a>
        </div>
      </div>
    </div>

    {/* Responsive + hover styles */}
    <style>{`
      @media (min-width: 640px) {
        .footer-grid { grid-template-columns: repeat(2, 1fr) !important; }
        .footer-bottom { flex-direction: row !important; }
      }
      @media (min-width: 1024px) {
        .footer-grid { grid-template-columns: repeat(4, 1fr) !important; }
      }
      .footer-link:hover,
      .footer-link:focus-visible {
        color: var(--color-brand-400) !important;
        transition: color var(--duration-fast) var(--easing-out);
      }
      .social-icon:hover {
        color: var(--color-brand-400) !important;
        transition: color var(--duration-fast) var(--easing-out);
      }
    `}</style>
  </footer>
);

export default Footer;

/**
 * ReadingContainer — Warm Reading Environment Wrapper
 * Governance: docs/rxs/screens/story.md · AGENTS.md Platform Beta
 *
 * Applies the Warm Reading visual environment for article/chapter surfaces.
 * Distinct from the homepage's Dark Discovery environment:
 *   - Slightly warmer near-black (#141210)
 *   - Warm ivory text (#EDE7DC)
 *   - Source Serif 4 body type
 *   - More generous line heights for sustained reading
 *
 * Use wrapping article/chapter/investigation body content.
 * Do NOT use on homepage sections or navigation.
 *
 * Three environments:
 *   [data-env="discovery"] → Homepage/nav (default dark charcoal)
 *   [data-env="reading"]   → This component (warm near-black)
 *   [data-env="research"]  → Evidence/documents (near-black research)
 */

import React from 'react';

interface ReadingContainerProps {
  children: React.ReactNode;
  /** Constrain reading width to optimal character count (default: true) */
  constrain?: boolean;
  className?: string;
}

export default function ReadingContainer({
  children,
  constrain = true,
  className = '',
}: ReadingContainerProps) {
  return (
    <div
      data-env="reading"
      className={`reading-env ${constrain ? 'reading-constrained' : ''} ${className}`}
      style={{ backgroundColor: 'var(--color-bg-reading)' }}
    >
      {children}
      <style>{`
        .reading-env {
          color: var(--color-text-reading);
        }
        .reading-env p,
        .reading-env li {
          font-family: var(--font-reading), Georgia, serif;
          line-height: 1.8;
          color: var(--color-text-reading);
        }
        .reading-env h1,
        .reading-env h2,
        .reading-env h3,
        .reading-env h4 {
          font-family: var(--font-playfair), Georgia, serif;
          color: var(--color-text-reading);
        }
        .reading-env .dim,
        .reading-env figcaption,
        .reading-env cite {
          color: var(--color-text-reading-dim);
          font-size: 0.875rem;
        }
        .reading-env a {
          color: var(--color-earth-ochre);
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .reading-env a:hover {
          color: var(--color-brand-300);
        }
        .reading-env blockquote {
          border-left: 3px solid var(--color-earth-ochre);
          padding-left: 1.25rem;
          margin-left: 0;
          font-style: italic;
          color: var(--color-text-reading);
        }
        .reading-env hr {
          border: none;
          border-top: 1px solid var(--color-border-reading);
          margin: 2rem 0;
        }
        .reading-constrained {
          max-width: 72ch;
          margin-left: auto;
          margin-right: auto;
          padding-left: 1rem;
          padding-right: 1rem;
        }
        @media (min-width: 640px) {
          .reading-constrained {
            padding-left: 1.5rem;
            padding-right: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}

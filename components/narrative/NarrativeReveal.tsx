'use client';

/**
 * NarrativeReveal — IntersectionObserver Reveal Controller
 * Governance: ERD-NAV-001 | NOS-CERT-v1.0 | docs/philosophy/narrative-operating-system.md
 *
 * Attaches a single IntersectionObserver on mount that adds `.narrative-revealed`
 * to every element with [data-narrative-reveal] when it enters the viewport.
 * CSS in globals.css handles the actual fade+translate transition.
 *
 * No React state. Pure DOM + CSS. Respects prefers-reduced-motion via CSS.
 * Renders nothing to the DOM — side-effect only.
 */

import { useEffect } from 'react';

const REVEAL_CLASS = 'narrative-revealed';
const OBSERVE_SELECTOR = '[data-narrative-reveal]';
const THRESHOLD = 0.12; // 12% of element must be visible to trigger

export default function NarrativeReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add(REVEAL_CLASS);
            // Unobserve after reveal — each section reveals once only.
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: THRESHOLD }
    );

    const elements = document.querySelectorAll(OBSERVE_SELECTOR);
    for (const el of elements) {
      observer.observe(el);
    }

    return () => { observer.disconnect(); };
  }, []);

  // Renders nothing — side-effect component only.
  return null;
}

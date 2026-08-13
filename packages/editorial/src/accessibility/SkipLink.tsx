import React from 'react';

/**
 * SkipLink component for keyboard accessibility.
 * Allows users to bypass global navigation and jump directly to main content.
 */
export default function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#D4A843] focus:text-[#09090b] focus:font-semibold focus:rounded focus:outline-none focus:ring-2 focus:ring-[#D4A843] focus:ring-offset-2 transition-all"
    >
      Skip to main content
    </a>
  );
}

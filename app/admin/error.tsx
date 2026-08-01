'use client';

/**
 * ─── Administration Console Domain Error Boundary ────────────────────────────
 * Handles rendering failures within the authenticated Admin Console.
 */

import { useEffect } from 'react';

export default function AdminErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log exception silently to telemetry service
  }, [error]);

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', maxWidth: '600px', margin: '4rem auto', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #fee2e2' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#991b1b', marginBottom: '0.5rem' }}>
        Administration Console System Error
      </h2>
      <p style={{ fontSize: '0.875rem', color: '#7f1d1d', marginBottom: '1.5rem' }}>
        A system-level error occurred within the administration control plane.
      </p>
      <button
        onClick={() => reset()}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#991b1b',
          color: '#ffffff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '0.875rem',
        }}
      >
        Retry System Operation
      </button>
    </div>
  );
}

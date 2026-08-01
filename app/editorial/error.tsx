'use client';

/**
 * ─── Editorial Studio Domain Error Boundary ──────────────────────────────────
 * Handles rendering failures within the authenticated Editorial Studio.
 */

import { useEffect } from 'react';

export default function EditorialErrorBoundary({
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
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', maxWidth: '600px', margin: '4rem auto', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.5rem' }}>
        Editorial Studio Error
      </h2>
      <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem' }}>
        An unexpected error occurred while loading this editorial workbench session.
      </p>
      <button
        onClick={() => reset()}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '0.875rem',
        }}
      >
        Reload Workbench
      </button>
    </div>
  );
}

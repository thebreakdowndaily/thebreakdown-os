'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16">
      <h1 className="text-4xl sm:text-5xl font-bold text-amber-400 mb-4">Something went wrong</h1>
      <p className="text-gray-400 mb-2 text-center max-w-md">
        An unexpected error occurred. Please try again.
      </p>
      {error.digest && (
        <p className="text-xs text-gray-500 mb-8 font-mono">Error ID: {error.digest}</p>
      )}
      <div className="flex items-center gap-4">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-6 py-3 bg-amber-400 text-gray-900 font-semibold rounded-lg hover:bg-amber-300 transition-colors"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 text-gray-300 font-semibold rounded-lg hover:bg-gray-700 transition-colors"
        >
          &larr; Back to Home
        </Link>
      </div>
    </div>
  );
}

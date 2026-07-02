import type { Metadata } from 'next';
import Link from 'next/link';
import SearchBar from '@/components/ui/SearchBar';

export const metadata: Metadata = {
  title: 'Page Not Found — The Breakdown',
};

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16">
      <h1 className="text-6xl sm:text-8xl font-bold text-amber-400 mb-4">404</h1>
      <p className="text-xl sm:text-2xl text-gray-300 mb-2">Page not found</p>
      <p className="text-gray-400 mb-8 text-center max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="w-full max-w-md mb-8">
        <SearchBar />
      </div>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3 bg-amber-400 text-gray-900 font-semibold rounded-lg hover:bg-amber-300 transition-colors"
      >
        &larr; Back to Home
      </Link>
    </div>
  );
}

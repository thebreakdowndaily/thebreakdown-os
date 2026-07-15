import Link from 'next/link';

interface TrustBarProps {
  chaptersPublished: number;
  claimsRegistered: number;
  primarySources: number;
  lastVerified: string;
}

export function TrustBar({ chaptersPublished, claimsRegistered, primarySources, lastVerified }: TrustBarProps) {
  return (
    <section className="bg-gray-50 border-y" aria-label="Trust signals">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" aria-hidden="true" />
            <span className="font-semibold text-emerald-700">
              {chaptersPublished} {chaptersPublished === 1 ? 'Chapter' : 'Chapters'} Published
            </span>
          </div>
          <span className="text-gray-300" aria-hidden="true">·</span>
          <span>{claimsRegistered} Claims Registered</span>
          <span className="text-gray-300" aria-hidden="true">·</span>
          <span>{primarySources} Primary Sources Cited</span>
          <span className="text-gray-300" aria-hidden="true">·</span>
          <span>Last verified: {lastVerified}</span>
          <Link href="/trust" className="text-blue-600 hover:underline ml-1">
            Trust Dashboard ↗
          </Link>
        </div>
      </div>
    </section>
  );
}

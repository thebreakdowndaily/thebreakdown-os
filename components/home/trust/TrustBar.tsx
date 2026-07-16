import Link from 'next/link';

interface TrustBarProps {
  chaptersPublished: number;
  claimsRegistered: number;
  primarySources: number;
  lastVerified: string;
}

export function TrustBar({
  chaptersPublished,
  claimsRegistered,
  primarySources,
  lastVerified,
}: TrustBarProps) {
  return (
    <section className="bg-gray-50 border-y" aria-label="Trust signals">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-gray-600 text-center">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 shrink-0" aria-hidden="true" />
              <span className="font-semibold text-emerald-700">Editorially Reviewed</span>
            </div>
            <span className="text-xs text-gray-400 font-mono mt-0.5">{chaptersPublished} Chapters</span>
          </div>
          <span className="text-gray-300 hidden sm:inline" aria-hidden="true">·</span>
          
          <div className="flex flex-col items-center">
            <span className="font-medium text-gray-700">Evidence-based Research</span>
            <span className="text-xs text-gray-400 font-mono mt-0.5">{claimsRegistered} Claims</span>
          </div>
          <span className="text-gray-300 hidden sm:inline" aria-hidden="true">·</span>
          
          <div className="flex flex-col items-center">
            <span className="font-medium text-gray-700">Transparent Methodology</span>
            <span className="text-xs text-gray-400 font-mono mt-0.5">{primarySources} Primary Sources</span>
          </div>
          <span className="text-gray-300 hidden sm:inline" aria-hidden="true">·</span>
          
          <div className="flex flex-col items-center">
            <span className="font-medium text-gray-700">Corrections on Record</span>
            <span className="text-xs text-gray-400 font-mono mt-0.5">Last Review: {lastVerified}</span>
          </div>
          <span className="text-gray-300 hidden sm:inline" aria-hidden="true">·</span>
          
          <Link href="/trust" className="text-blue-600 hover:underline font-medium">
            Trust ↗
          </Link>
        </div>
      </div>
    </section>
  );
}

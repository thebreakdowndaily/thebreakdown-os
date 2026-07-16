import Link from 'next/link';

interface TrustBarProps {
  chaptersPublished: number;
  claimsRegistered: number;
  primarySources: number;
  lastVerified: string;
}

export function TrustBar({ lastVerified }: TrustBarProps) {
  return (
    <section className="bg-gray-50 border-y" aria-label="Trust signals">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 shrink-0" aria-hidden="true" />
            <span className="font-semibold text-emerald-700">Editorially Reviewed</span>
          </div>
          <span className="text-gray-300" aria-hidden="true">·</span>
          <span>Evidence-based Research</span>
          <span className="text-gray-300" aria-hidden="true">·</span>
          <span>Transparent Methodology</span>
          <span className="text-gray-300" aria-hidden="true">·</span>
          <span>Corrections on Record</span>
          <span className="text-gray-300" aria-hidden="true">·</span>
          <span>Last Review: {lastVerified}</span>
          <Link href="/trust" className="text-blue-600 hover:underline ml-1 font-medium">
            Trust ↗
          </Link>
        </div>
      </div>
    </section>
  );
}

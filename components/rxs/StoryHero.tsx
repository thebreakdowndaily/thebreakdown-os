import Link from 'next/link';
import type { Chapter } from '@/types/canonical';

export function StoryHero({
  chapter,
  collectionSlug,
  volumeSlug,
}: {
  chapter: Chapter;
  collectionSlug: string;
  volumeSlug: string;
}) {
  const versionStr = `${chapter.version.major}.${chapter.version.minor}.${chapter.version.patch}`;

  return (
    <header className="mb-10">
      <Link
        href={`/series/${collectionSlug}/volume/${volumeSlug}`}
        className="text-sm text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Back to Volume
      </Link>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {(chapter.metadata as any)?.classification && (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 uppercase tracking-wider">
            {String((chapter.metadata as any).classification)}
          </span>
        )}
        {!(chapter.metadata as any)?.classification && (chapter.metadata as any)?.type && (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 uppercase tracking-wider">
            {String((chapter.metadata as any).type)}
          </span>
        )}
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
          The Breakdown · Founding Monograph 001
        </span>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
          chapter.status === 'published' ? 'bg-green-100 text-green-700' :
          chapter.status === 'verified' ? 'bg-blue-100 text-blue-700' :
          'bg-gray-100 text-gray-500'
        }`}>
          {chapter.status}
        </span>
        <span className="text-xs text-gray-400 font-mono">v{versionStr}</span>
        {chapter.lastVerifiedAt && (
          <span className="text-xs text-gray-500">
            Verified {new Date(chapter.lastVerifiedAt).toLocaleDateString('en-IN')}
          </span>
        )}
      </div>

      <h1 className="text-4xl font-bold tracking-tight mb-3">{chapter.title}</h1>
      <p className="text-lg text-gray-600 leading-relaxed mb-4">{chapter.summary}</p>

      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Read: {chapter.readingTime.explorer} min
        </span>
        {chapter.studyTime && (
          <span>Study: {chapter.studyTime.explorer} min</span>
        )}
        <span>
          Difficulty: {'★'.repeat(chapter.difficulty)}{'☆'.repeat(5 - chapter.difficulty)}
        </span>
      </div>
    </header>
  );
}

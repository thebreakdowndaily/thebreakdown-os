import Link from 'next/link';
import type { Chapter } from '@/types/canonical';

export function LearningFooter({
  chapter,
  collectionSlug,
  volumeSlug,
}: {
  chapter: Chapter;
  collectionSlug: string;
  volumeSlug: string;
}) {
  return (
    <footer className="mt-16 border-t border-gray-200 pt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Continue Learning</h4>
          <ul className="space-y-2">
            {chapter.recommendedNext.length > 0 && (
              <li>
                <Link href={`/series/${collectionSlug}/volume/${volumeSlug}`} className="text-sm text-blue-600 hover:underline">
                  Next chapter →
                </Link>
              </li>
            )}
            <li>
              <Link href={`/series/${collectionSlug}/volume/${volumeSlug}`} className="text-sm text-blue-600 hover:underline">
                All chapters in this volume
              </Link>
            </li>
            <li>
              <Link href={`/series/${collectionSlug}`} className="text-sm text-blue-600 hover:underline">
                Browse collection
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Explore</h4>
          <ul className="space-y-2">
            <li>
              <Link href={`/series/${collectionSlug}/volume/${volumeSlug}/chapter/${chapter.slug}#timeline`} className="text-sm text-blue-600 hover:underline">
                Timeline
              </Link>
            </li>
            <li>
              <Link href={`/series/${collectionSlug}/volume/${volumeSlug}/chapter/${chapter.slug}#documents`} className="text-sm text-blue-600 hover:underline">
                Primary Documents
              </Link>
            </li>
            <li>
              <Link href="/series" className="text-sm text-blue-600 hover:underline">
                Knowledge Library
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Help & Feedback</h4>
          <ul className="space-y-2">
            <li>
              <a href="/methodology#corrections" className="text-sm text-blue-600 hover:underline">
                Report a correction
              </a>
            </li>
            <li>
              <a href="/methodology" className="text-sm text-blue-600 hover:underline">
                View methodology
              </a>
            </li>
            <li>
              <a href="/trust" className="text-sm text-blue-600 hover:underline">
                Trust Dashboard
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap justify-between text-sm text-gray-400">
        <Link href={`/series/${collectionSlug}/volume/${volumeSlug}`} className="hover:text-blue-600">
          ← Back to Volume
        </Link>
        <span className="font-mono text-xs">
          v{chapter.version.major}.{chapter.version.minor}.{chapter.version.patch}
        </span>
      </div>
    </footer>
  );
}

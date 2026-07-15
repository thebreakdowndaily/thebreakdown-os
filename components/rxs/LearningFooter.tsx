import Link from 'next/link';
import type { Chapter } from '@/types/canonical';

function ReviewSection({ chapter }: { chapter: Chapter }) {
  if (!chapter.keyQuestions || chapter.keyQuestions.length === 0) return null;
  return (
    <section className="mb-10">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Review Your Understanding</h3>
      <p className="text-sm text-gray-600 mb-4">Before moving on, check that you can answer these questions:</p>
      <div className="space-y-3">
        {chapter.keyQuestions.map((kq, i) => (
          <details key={i} className="bg-gray-50 rounded-lg p-4">
            <summary className="font-medium cursor-pointer text-sm">{kq.question}</summary>
            <div className="mt-2 pl-4 border-l-2 border-blue-300">
              <p className="text-sm text-gray-700">{kq.answer}</p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

function FeedbackSection() {
  return (
    <section className="bg-amber-50 rounded-lg p-5 mb-10">
      <h3 className="text-sm font-semibold text-amber-800 mb-2">Help us improve</h3>
      <p className="text-sm text-amber-700 mb-3">
        Did you find an error? Is something unclear? Do you have a source that challenges an interpretation?
        Your feedback helps this chapter evolve.
      </p>
      <div className="flex flex-wrap gap-2">
        <a href="/methodology#corrections" className="text-xs px-3 py-1.5 rounded bg-amber-200 text-amber-900 hover:bg-amber-300">
          Report a correction
        </a>
        <a href="/methodology" className="text-xs px-3 py-1.5 rounded bg-amber-200 text-amber-900 hover:bg-amber-300">
          View methodology
        </a>
      </div>
    </section>
  );
}

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
      <ReviewSection chapter={chapter} />
      <FeedbackSection />

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
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Transparency</h4>
          <ul className="space-y-2">
            <li>
              <Link href="/methodology" className="text-sm text-blue-600 hover:underline">
                Methodology
              </Link>
            </li>
            <li>
              <Link href="/editorial-constitution" className="text-sm text-blue-600 hover:underline">
                Editorial Constitution
              </Link>
            </li>
            <li>
              <Link href="/trust" className="text-sm text-blue-600 hover:underline">
                Trust Dashboard
              </Link>
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

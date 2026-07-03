interface StoryMetadataProps {
  evidenceScore: number;
  readingTime: number;
  publishedAt: string;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function StoryMetadata({ evidenceScore, readingTime, publishedAt }: StoryMetadataProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
      <span className="text-amber-500 font-semibold tabular-nums">{evidenceScore}</span>
      <span className="text-gray-600" aria-hidden="true">/</span>
      <span>{readingTime} min</span>
      <span className="text-gray-600" aria-hidden="true">·</span>
      <span>{formatDate(publishedAt)}</span>
    </div>
  );
}

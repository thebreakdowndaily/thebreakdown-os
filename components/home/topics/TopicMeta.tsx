interface TopicMetaProps {
  storyCount: number;
  updatedAt: string;
  latestHeadline?: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return String(hours) + 'h ago';
  const days = Math.floor(hours / 24);
  return String(days) + 'd ago';
}

export default function TopicMeta({ storyCount, updatedAt, latestHeadline }: TopicMetaProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <span className="font-semibold text-gray-200">{storyCount} {storyCount === 1 ? 'Story' : 'Stories'}</span>
        <span aria-hidden="true">·</span>
        <span>Updated {timeAgo(updatedAt)}</span>
      </div>
      {latestHeadline && (
        <p className="text-xs text-gray-500 line-clamp-1">Latest: {latestHeadline}</p>
      )}
    </div>
  );
}

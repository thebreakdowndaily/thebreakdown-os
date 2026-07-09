interface TopicMetaProps {
  storyCount: number;
  entityCount: number;
  updatedAt: string;
  latestHeadline?: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function TopicMeta({ storyCount, entityCount, updatedAt, latestHeadline }: TopicMetaProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center gap-2 text-xs text-[#A1A1AA]">
        <span className="font-semibold text-[#A1A1AA]">{storyCount} {storyCount === 1 ? 'Story' : 'Stories'}</span>
        <span aria-hidden="true">·</span>
        <span className="font-semibold text-[#A1A1AA]">{entityCount} {entityCount === 1 ? 'Entity' : 'Entities'}</span>
        <span aria-hidden="true">·</span>
        <span>Updated {timeAgo(updatedAt)}</span>
      </div>
      {latestHeadline && (
        <p className="text-xs text-[#A1A1AA] line-clamp-1">Latest: {latestHeadline}</p>
      )}
    </div>
  );
}
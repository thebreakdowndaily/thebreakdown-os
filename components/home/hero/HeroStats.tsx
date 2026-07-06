interface HeroStatsProps {
  evidenceScore: number;
  sourcesCount: number;
  updatedAt: string;
  readingTime: number;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return String(hours) + ' hour' + (hours > 1 ? 's' : '') + ' ago';
  const days = Math.floor(hours / 24);
  return String(days) + ' day' + (days > 1 ? 's' : '') + ' ago';
}

export default function HeroStats({ evidenceScore, sourcesCount, updatedAt, readingTime }: HeroStatsProps) {
  return (
    <div className="flex flex-wrap items-center gap-5">
      <div className="flex items-center gap-2">
        <span className="text-xs text-[#A1A1AA] uppercase tracking-wider">Evidence</span>
        <span className="text-lg font-bold text-[#D4A843] tabular-nums">{evidenceScore}</span>
      </div>
      <div className="w-px h-5 bg-[#2A2A2A]" />
      <div className="flex items-center gap-2">
        <span className="text-xs text-[#A1A1AA] uppercase tracking-wider">Sources</span>
        <span className="text-sm font-semibold text-[#A1A1AA]">{sourcesCount}</span>
      </div>
      <div className="w-px h-5 bg-[#2A2A2A]" />
      <div className="flex items-center gap-2">
        <span className="text-xs text-[#A1A1AA] uppercase tracking-wider">Updated</span>
        <span className="text-sm text-[#A1A1AA]">{timeAgo(updatedAt)}</span>
      </div>
      <div className="w-px h-5 bg-[#2A2A2A]" />
      <div className="flex items-center gap-2">
        <span className="text-xs text-[#A1A1AA] uppercase tracking-wider">Read</span>
        <span className="text-sm text-[#A1A1AA]">{readingTime} min</span>
      </div>
    </div>
  );
}

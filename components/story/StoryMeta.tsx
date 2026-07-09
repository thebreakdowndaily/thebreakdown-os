import Badge from '@/components/ui/Badge';
import Image from 'next/image';

interface StoryMetaProps {
  author: { name: string; avatar?: string; bio?: string };
  publishedAt: string;
  updatedAt: string;
  readingTime: number;
  evidenceScore: number;
  category: string;
  sourcesCount: number;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return String(hours) + ' hour' + (hours > 1 ? 's' : '') + ' ago';
  const days = Math.floor(hours / 24);
  return String(days) + ' day' + (days > 1 ? 's' : '') + ' ago';
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function StoryMeta({
  author, publishedAt, updatedAt, readingTime, evidenceScore, category, sourcesCount,
}: StoryMetaProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm">
      <div className="flex items-center gap-3">
        {author.avatar ? (
          <Image src={author.avatar} alt={author.name} width={36} height={36} className="rounded-full object-cover" />
        ) : (
          <span className="w-9 h-9 rounded-full bg-[#D4A843] text-black flex items-center justify-center font-bold text-sm">
            {author.name.charAt(0)}
          </span>
        )}
        <div>
          <span className="font-medium text-[#F5F5F5]">{author.name}</span>
          {author.bio && <p className="text-xs text-[#A1A1AA]">{author.bio}</p>}
        </div>
      </div>

      <div className="hidden sm:block w-px h-8 bg-[#2A2A2A]" aria-hidden="true" />

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#A1A1AA]">
        <Badge variant="evidence">{evidenceScore}</Badge>
        <span>{sourcesCount} {sourcesCount === 1 ? 'Source' : 'Sources'}</span>
        <span className="text-[#2A2A2A]" aria-hidden="true">|</span>
        <span>{readingTime} min read</span>
        <span className="text-[#2A2A2A]" aria-hidden="true">|</span>
        <span>Updated {timeAgo(updatedAt)}</span>
        <span className="text-[#2A2A2A]" aria-hidden="true">|</span>
        <span>Published {formatDate(publishedAt)}</span>
        <span className="text-[#2A2A2A]" aria-hidden="true">|</span>
        <span className="uppercase tracking-wider text-[#A1A1AA]/60">{category}</span>
      </div>
    </div>
  );
}

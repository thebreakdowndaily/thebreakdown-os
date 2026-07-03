import Link from 'next/link';
import type { APITopic } from '@/utils/data-layer/types';
import TopicIcon from './TopicIcon';
import TopicMeta from './TopicMeta';

interface TopicCardProps {
  topic: APITopic;
}

export default function TopicCard({ topic }: TopicCardProps) {
  const latestStory = topic.stories.at(0);

  return (
    <Link
      href={'/topic/' + topic.slug}
      className="group flex flex-col gap-3 rounded-xl bg-[#151515] border border-gray-800 p-5 hover:border-amber-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-500/5"
    >
      <div className="flex items-start gap-3">
        <TopicIcon slug={topic.slug} />
        <div className="min-w-0">
          <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors duration-200">
            {topic.name}
          </h3>
          <p className="text-sm text-gray-400 mt-0.5 line-clamp-2">{topic.description}</p>
        </div>
      </div>

      <TopicMeta
        storyCount={topic.storyCount}
        updatedAt={topic.updatedAt}
        latestHeadline={latestStory?.headline}
      />

      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-auto">
        View Intelligence
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </span>
    </Link>
  );
}

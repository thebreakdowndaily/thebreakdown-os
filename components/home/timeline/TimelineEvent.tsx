import type { TimelineEventData } from './types';

interface TimelineEventProps {
  event: TimelineEventData;
  index: number;
  total: number;
  isActive: boolean;
  onClick: () => void;
}

export default function TimelineEvent({ event, index, total, isActive, onClick }: TimelineEventProps) {
  const year = event.date.slice(0, 4);
  const monthDay = new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  return (
    <div className="relative flex items-start gap-4 group">
      {/* Desktop: vertical connecting line */}
      {index < total - 1 && (
        <div className="hidden lg:block absolute left-[11px] top-5 bottom-0 w-px bg-[#2A2A2A] group-hover:bg-[#D4A843]/30 transition-colors duration-200" aria-hidden="true" />
      )}

      {/* Dot */}
      <button
        type="button"
        onClick={onClick}
        className={`relative z-10 shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 mt-1 ${
          isActive
            ? 'border-[#D4A843] bg-[#D4A843]'
            : 'border-[#2A2A2A] bg-[#151515] group-hover:border-[#D4A843]/50'
        }`}
        aria-label={`View event: ${event.title}`}
      >
        <span className={`w-2 h-2 rounded-full transition-colors duration-200 ${isActive ? 'bg-black' : 'bg-[#A1A1AA]'}`} />
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0 pb-8">
        <button
          type="button"
          onClick={onClick}
          className="text-left w-full"
        >
          <div className="flex items-center gap-2 mb-1">
            <time className="text-xs font-medium text-[#D4A843] tabular-nums">{year}</time>
            <span className="text-[10px] text-[#A1A1AA]/60">{monthDay}</span>
          </div>
          <h3 className={`text-sm font-semibold leading-snug transition-colors duration-200 ${
            isActive ? 'text-[#D4A843]' : 'text-[#F5F5F5] group-hover:text-[#D4A843]'
          }`}>
            {event.title}
          </h3>
        </button>

        {/* Preview when active */}
        {isActive && (
          <div className="mt-3 p-4 rounded-xl bg-[#151515] border border-[#2A2A2A] animate-fade-in">
            <p className="text-sm text-[#A1A1AA] leading-relaxed mb-3">
              {event.summary}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#A1A1AA]">
              <span className="text-[#D4A843] font-semibold tabular-nums">
                Evidence {event.evidenceScore}
              </span>
              <span>{event.relatedStoriesCount} {event.relatedStoriesCount === 1 ? 'Story' : 'Stories'}</span>
              <span>{event.relatedTopicsCount} {event.relatedTopicsCount === 1 ? 'Topic' : 'Topics'}</span>
              <span>{event.relatedEntitiesCount} {event.relatedEntitiesCount === 1 ? 'Entity' : 'Entities'}</span>
            </div>
            <a
              href={`/story/${event.storySlug}`}
              className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-[#D4A843] hover:text-[#D4A843]/80 transition-colors"
            >
              Read Breakdown
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

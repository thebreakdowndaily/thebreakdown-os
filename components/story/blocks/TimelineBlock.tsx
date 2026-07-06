import type { TimelineData } from './types';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function TimelineBlock({ events }: TimelineData) {
  if (events.length === 0) return null;

  return (
    <section id="timeline" aria-label="Timeline" className="py-8 sm:py-10">
      <h2 className="text-lg sm:text-xl font-bold text-[#F5F5F5] mb-5">Timeline</h2>
      <div className="relative pl-8 sm:pl-10">
        <div className="absolute left-[11px] sm:left-[13px] top-2 bottom-0 w-px bg-[#2A2A2A]" aria-hidden="true" />
        {events.map((event, i) => (
          <div key={i} className="relative pb-8 last:pb-0">
            <div className="absolute left-[-21px] sm:left-[-25px] top-1 w-[22px] sm:w-[26px] flex items-center justify-center" aria-hidden="true">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D4A843] border-2 border-[#0A0A0A]" />
            </div>
            <div className="flex flex-col gap-1">
              <time dateTime={event.date} className="text-xs font-semibold text-[#D4A843] tabular-nums">
                {formatDate(event.date)}
              </time>
              <h3 className="text-sm font-semibold text-[#F5F5F5]">{event.title}</h3>
              <p className="text-sm text-[#A1A1AA] leading-relaxed">{event.description}</p>
              {event.source && (
                <span className="text-[10px] text-[#A1A1AA]/40">{event.source}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

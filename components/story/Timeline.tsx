import React from 'react';

interface TimelineProps {
  events: Array<{ date: string; title: string; description: string; source?: string }>;
}

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(iso));

const Timeline: React.FC<TimelineProps> = ({ events }) => {
  if (!events || events.length === 0) return null;

  return (
    <section aria-label="Timeline" className="max-w-[720px] mx-auto px-4 sm:px-6 mb-16">
      <h2 className="text-xs font-semibold tracking-widest uppercase text-amber-400/80 mb-8">
        Timeline
      </h2>
      <div className="relative">
        {/* Stem */}
        <div className="absolute left-[39px] sm:left-[119px] top-2 bottom-2 w-px bg-neutral-800" aria-hidden="true" />
        
        <ul className="space-y-8">
          {events.map((event, i) => (
            <li key={i} className="relative flex flex-col sm:flex-row gap-6 sm:gap-8 group">
              <div className="flex-shrink-0 w-[80px] sm:w-[100px] pt-1">
                <time dateTime={event.date} className="text-sm font-medium text-neutral-400 group-hover:text-amber-400/80 transition-colors">
                  {formatDate(event.date)}
                </time>
              </div>
              <div className="relative flex-1 bg-neutral-900/50 border border-neutral-800/60 rounded-xl p-5 hover:border-neutral-700 transition-colors">
                {/* Node */}
                <div className="absolute -left-[30px] sm:-left-[39px] top-6 w-2 h-2 rounded-full bg-neutral-800 border-2 border-neutral-950 group-hover:bg-amber-400 group-hover:border-amber-400/20 transition-colors" aria-hidden="true" />
                
                <h3 className="font-semibold text-neutral-200 mb-2 leading-snug">{event.title}</h3>
                <p className="text-[15px] text-neutral-400 leading-relaxed mb-4">{event.description}</p>
                {event.source && (
                  <a
                    href={event.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-xs font-medium text-amber-400/70 hover:text-amber-400 transition-colors"
                  >
                    View Source &rarr;
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Timeline;

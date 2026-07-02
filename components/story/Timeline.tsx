import React from 'react';

interface TimelineProps {
  events: Array<{ date: string; title: string; description: string; source?: string }>;
}

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(iso));

const Timeline: React.FC<TimelineProps> = ({ events }) => (
  <section aria-label="Timeline" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h2 className="text-xl sm:text-2xl font-bold text-gray-100 mb-8">Timeline</h2>
    <div className="relative">
      <div className="absolute left-[23px] sm:left-[123px] top-0 bottom-0 w-0.5 bg-gray-700" aria-hidden="true" />
      <ul className="space-y-8">
        {events.map((event, i) => (
          <li key={i} className="relative flex flex-col sm:flex-row gap-4 sm:gap-0">
            <div className="flex-shrink-0 w-[48px] sm:w-[120px] text-left sm:text-right">
              <time dateTime={event.date} className="text-sm font-semibold text-amber-400">
                {formatDate(event.date)}
              </time>
            </div>
            <div className="relative flex items-start gap-4">
              <span className="relative z-10 mt-1 w-3 h-3 rounded-full bg-amber-400 border-2 border-gray-900 flex-shrink-0" aria-hidden="true" />
              <div className="flex-1 bg-gray-800 border border-gray-700 rounded-xl p-4 sm:p-5">
                <h3 className="font-semibold text-gray-100 mb-1">{event.title}</h3>
                <p className="text-sm text-gray-300 leading-relaxed">{event.description}</p>
                {event.source && (
                  <a
                    href={event.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-xs text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    Source &rarr;
                  </a>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default Timeline;

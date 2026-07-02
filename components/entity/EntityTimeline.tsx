import React from 'react';

interface EntityTimelineProps {
  events: Array<{
    date: string;
    title: string;
    description: string;
    source?: string;
  }>;
}

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(iso));

const EntityTimeline: React.FC<EntityTimelineProps> = ({ events }) => {
  if (events.length === 0) return null;

  return (
    <section aria-label="Entity timeline" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-100 mb-6">Timeline</h2>
      <div className="relative">
        <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-700" aria-hidden="true" />
        <ul className="space-y-8">
          {events.map((event, i) => (
            <li key={i} className="relative pl-10">
              <span
                className="absolute left-2.5 top-1.5 w-3 h-3 rounded-full bg-amber-400 border-2 border-gray-900"
                aria-hidden="true"
              />
              <time className="text-sm text-amber-400 font-medium" dateTime={event.date}>
                {formatDate(event.date)}
              </time>
              <h3 className="text-lg font-semibold text-gray-100 mt-1">{event.title}</h3>
              <p className="text-gray-300 mt-1 leading-relaxed">{event.description}</p>
              {event.source && (
                <a
                  href={event.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-sm text-amber-400 hover:text-amber-300 transition-colors"
                >
                  Source &rarr;
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default EntityTimeline;

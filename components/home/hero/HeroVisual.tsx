import Image from 'next/image';
import type { APITimelineEvent, APIChart, APIGeoData } from '@/utils/data-layer/types';

interface HeroVisualProps {
  heroImage?: string;
  headline: string;
  timeline?: APITimelineEvent[];
  charts?: APIChart[];
  geoData?: APIGeoData;
}

export default function HeroVisual({ heroImage, headline, timeline }: HeroVisualProps) {
  const showTimeline = timeline && timeline.length > 0;

  return (
    <div className="relative aspect-[4/3] lg:aspect-auto lg:h-full min-h-[320px] rounded-xl overflow-hidden bg-gray-900 border border-gray-800 group">
      {heroImage ? (
        <Image
          src={heroImage}
          alt={headline}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          priority
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />

      {/* Timeline overlay */}
      {showTimeline && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-900/90 to-transparent">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs font-medium text-gray-300">Timeline</span>
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-thin pb-1">
            {timeline.slice(0, 3).map((event, i) => (
              <div key={i} className="shrink-0 bg-gray-800/80 backdrop-blur-sm rounded-lg p-2.5 min-w-[140px] border border-gray-700/50">
                <span className="text-[10px] text-amber-400/80 font-medium">{event.date}</span>
                <p className="text-xs text-gray-300 mt-0.5 line-clamp-2">{event.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

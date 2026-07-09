'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import type { APITimelineEvent, APIChart, APIGeoData } from '@/utils/data-layer/types';

// ChartRenderer is a heavy D3 client component — dynamic import per Rule 23
const ChartRenderer = dynamic(() => import('@/components/charts/ChartRenderer'), {
  ssr: false,
});

interface HeroVisualProps {
  heroImage?: string;
  charts?: APIChart[];
  geoData?: APIGeoData;
  timeline?: APITimelineEvent[];
  headline: string;
}

export default function HeroVisual({ heroImage, charts, geoData, timeline, headline }: HeroVisualProps) {
  // 1. If we have a hero image, show it
  if (heroImage) {
    return (
      <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[500px] bg-neutral-900 overflow-hidden">
        <Image
          src={heroImage}
          alt={headline}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover transition-transform duration-700 ease-out hover:scale-[1.02]"
        />
        <div className="absolute inset-0 border border-neutral-800/50 pointer-events-none" />
      </div>
    );
  }

  // 2. If we have charts, show the primary chart
  if (charts && charts.length > 0) {
    const primaryChart = charts[0];
    return (
      <div className="w-full h-full min-h-[300px] lg:min-h-[400px] bg-neutral-950 flex flex-col p-6 sm:p-8 border-b border-neutral-900">
        <div className="mb-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400 mb-1">
            Data Visualization
          </h3>
          <p className="text-lg font-medium text-neutral-100">{primaryChart.title}</p>
        </div>
        <div className="flex-1 w-full relative">
          <ChartRenderer chart={primaryChart as any} />
        </div>
      </div>
    );
  }

  // 3. (Map fallback would go here, omitting for brevity)

  // 4. (Timeline fallback would go here, omitting for brevity)

  // 5. Fallback Label
  return (
    <div className="w-full h-full min-h-[240px] bg-neutral-950 flex flex-col items-center justify-center border-b border-neutral-900 p-8 text-center">
      <div className="w-12 h-1 bg-amber-400/80 mb-6" aria-hidden="true" />
      <h2 className="text-2xl sm:text-3xl font-bold text-neutral-300 max-w-lg leading-tight" style={{ fontFamily: 'var(--font-editorial)' }}>
        {headline}
      </h2>
      <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-600 mt-6">
        No visual data available
      </p>
    </div>
  );
}

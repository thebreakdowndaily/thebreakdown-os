'use client';

import React, { useEffect } from 'react';
import type { CrossStoryRecommendation } from '@/services/graph/crossStoryResolver';
import { PluginAnalyticsService } from '@/services/analytics/service';

interface ExploreConnectionsProps {
  recommendations: CrossStoryRecommendation[];
  readingMode?: 'quick' | 'standard' | 'deep';
  storySlug?: string;
}

const analyticsService = new PluginAnalyticsService();

export const ExploreConnections: React.FC<ExploreConnectionsProps> = ({
  recommendations,
  readingMode = 'standard',
  storySlug = '',
}) => {
  if (!recommendations || recommendations.length === 0) return null;

  // Instrument impressions
  useEffect(() => {
    try {
      analyticsService.track({
        type: 'connections_impression',
        storyId: storySlug,
        timestamp: new Date().toISOString(),
        metadata: {
          reading_mode: readingMode,
          total_connections: recommendations.length,
          connection_types: recommendations.map(r => r.sharedClaimIds.length > 0 ? 'claim' : r.sharedEntityIds.length > 0 ? 'entity' : 'topic'),
        },
      });
    } catch {
      // Fail silent privacy preservation
    }
  }, [recommendations, readingMode, storySlug]);

  const handleDestinationClick = (rec: CrossStoryRecommendation, rankPosition: number) => {
    try {
      const connectionType = rec.sharedClaimIds.length > 0 ? 'claim' : rec.sharedEntityIds.length > 0 ? 'entity' : 'topic';
      analyticsService.track({
        type: 'connections_destination_click',
        storyId: storySlug,
        timestamp: new Date().toISOString(),
        metadata: {
          target_story_slug: rec.targetStorySlug,
          rank_position: rankPosition,
          connection_type: connectionType,
          reading_mode: readingMode,
          ranking_confidence_score: rec.score,
          quality_rating: rec.qualityRating,
          // qualified_continuation is omitted at click time and tracked after destination engagement
        },
      });
    } catch {
      // Fail silent
    }
  };

  return (
    <section aria-label="Explore Knowledge Connections" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-neutral-800/80">
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400">Knowledge Graph Intelligence</span>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">Explore Connected Stories</h2>
        </div>
        <span className="text-xs font-mono text-neutral-400 bg-neutral-900 border border-neutral-800 px-3 py-1 rounded-full">
          {recommendations.length} Verified Links
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.map((rec, index) => (
          <a
            key={rec.targetStorySlug}
            href={`/story/${rec.targetStorySlug}`}
            onClick={() => handleDestinationClick(rec, index + 1)}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-canvas)] group bg-neutral-900/70 border border-neutral-800/80 rounded-xl p-5 hover:border-emerald-500/50 transition-all flex flex-col justify-between backdrop-blur-sm hover:shadow-lg hover:shadow-emerald-950/20"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-300 text-[10px] font-mono font-bold uppercase tracking-wider">
                  {rec.targetStoryCategory}
                </span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider ${
                  rec.qualityRating === 'STRONG'
                    ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50'
                    : 'bg-neutral-800/80 text-neutral-400 border border-neutral-700/50'
                }`}>
                  {rec.qualityRating} Connection
                </span>
              </div>

              <h3 className="font-bold text-base text-white group-hover:text-emerald-400 transition-colors leading-snug mb-2">
                {rec.targetStoryTitle}
              </h3>

              <div className="text-xs text-emerald-400 font-mono mb-2 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span>{rec.relationshipBasis}</span>
              </div>

              <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed italic">
                "{rec.explanation}"
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-800/50 flex items-center justify-between text-xs text-neutral-400 font-mono">
              <span>View Evidence Link</span>
              <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};

export default ExploreConnections;

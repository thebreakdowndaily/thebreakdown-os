import React from 'react';
import type { RadarSourceDefinition, RadarSourceHealth } from '@/services/radar/types';
import { GEO_NODES } from '@/data/radar/geo-india';
import type { CoverageState } from '@/services/radar/coverage/types';

interface CoverageMapProps {
  sources: RadarSourceDefinition[];
  healthMap: Map<string, RadarSourceHealth>;
}

interface GeoHubStat {
  nodeId: string;
  name: string;
  nameHi?: string;
  level: string;
  latitude?: number;
  longitude?: number;
  sourceCount: number;
  healthyCount: number;
  primaryCount: number;
  coverageState: CoverageState;
  beats: string[];
}

export function CoverageMap({ sources, healthMap }: CoverageMapProps) {
  const hubs: GeoHubStat[] = [
    { nodeId: 'rewa-district', name: 'Rewa', nameHi: 'रीवा', level: 'Vindhya Anchor' },
    { nodeId: 'bhopal-district', name: 'Bhopal', nameHi: 'भोपाल', level: 'State Capital & Gazette' },
    { nodeId: 'indore-district', name: 'Indore', nameHi: 'इंदौर', level: 'Commercial & Urban' },
    { nodeId: 'jabalpur-district', name: 'Jabalpur', nameHi: 'जबलपुर', level: 'High Court Seat' },
    { nodeId: 'gwalior-district', name: 'Gwalior', nameHi: 'ग्वालियर', level: 'Gird & Chambal' },
    { nodeId: 'sagar-district', name: 'Sagar', nameHi: 'सागर', level: 'Bundelkhand Hub' },
    { nodeId: 'satna-district', name: 'Satna', nameHi: 'सतना', level: 'Industrial Belt' },
  ].map((hub) => {
    const geo = GEO_NODES[hub.nodeId];
    const hubSources = sources.filter(
      (s) => s.district === hub.nodeId || s.geographies?.includes(hub.name.toUpperCase())
    );
    const healthySources = hubSources.filter((s) => healthMap.get(s.id)?.status === 'healthy');
    const primarySources = hubSources.filter((s) => s.primarySource || s.authorityClass === 'PRIMARY' || s.authorityClass === 'JUDICIAL');
    const uniqueBeats = Array.from(new Set(hubSources.map((s) => s.beat)));

    let coverageState: CoverageState = 'BLIND';
    if (primarySources.length >= 2 && healthySources.length >= 2 && uniqueBeats.length >= 3) {
      coverageState = 'STRONG';
    } else if (primarySources.length >= 1 && healthySources.length >= 1) {
      coverageState = 'ACTIVE';
    } else if (hubSources.length > 0) {
      coverageState = 'PARTIAL';
    }

    return {
      ...hub,
      latitude: geo?.latitude,
      longitude: geo?.longitude,
      sourceCount: hubSources.length,
      healthyCount: healthySources.length,
      primaryCount: primarySources.length,
      coverageState,
      beats: uniqueBeats,
    };
  });

  return (
    <section className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800 mb-8 shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Geographic Coverage Matrix — Madhya Pradesh
          </h2>
          <p className="text-xs text-gray-500">
            Decentralized sensing nodes covering Rewa, Bhopal, Indore, Jabalpur, Gwalior, Sagar &amp; Satna
          </p>
        </div>
        <span className="text-xs font-mono px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-gray-600 dark:text-gray-300">
          7 Divisions · 17 Monitored Sensors
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {hubs.map((hub) => (
          <div
            key={hub.nodeId}
            className="p-3.5 rounded border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/40 hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                {hub.name} <span className="text-xs text-gray-400 font-normal">({hub.nameHi})</span>
              </span>
              <span
                className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                  hub.coverageState === 'STRONG'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : hub.coverageState === 'ACTIVE'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    : hub.coverageState === 'PARTIAL'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                }`}
              >
                {hub.coverageState}
              </span>
            </div>
            <div className="text-xs text-gray-500 mb-2">{hub.level}</div>
            <div className="flex items-baseline justify-between text-xs pt-1 border-t border-gray-200 dark:border-gray-800/60">
              <span className="text-gray-600 dark:text-gray-400">
                Sensors: <strong className="text-gray-900 dark:text-gray-200">{hub.sourceCount}</strong>
                {hub.primaryCount > 0 && (
                  <span className="text-emerald-600 dark:text-emerald-400 ml-1">({hub.primaryCount} pri)</span>
                )}
              </span>
              {hub.latitude && hub.longitude && (
                <span className="font-mono text-[10px] text-gray-400">
                  {hub.latitude.toFixed(2)}°N, {hub.longitude.toFixed(2)}°E
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

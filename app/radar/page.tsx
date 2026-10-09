import React from 'react';
import { newsroomIntelligenceCore } from '@/services/intelligence/newsroom';
import { MP_RADAR_SOURCES } from '@/data/radar/sources-mp';
import type { NewsroomSignal } from '@/types/newsroom-intelligence';
import { createRadarPersistenceRepository } from '@/services/radar/persistence';
import type { RadarSourceHealth, RadarPipelineRunRecord } from '@/services/radar/types';
import { SourceScheduler } from '@/services/radar/source-scheduler';
import { CoverageMatrixEngine } from '@/services/radar/coverage/matrix';
import { INDIA_COUNTRY_PACK } from '@/data/radar/countries';
import { ProactiveDiscoveryQueue } from '@/services/radar/discovery/queue';
import { MetricCards } from '@/components/radar/MetricCards';
import { CoverageScorecard } from '@/components/radar/CoverageScorecard';
import { DiscoveryQueueView } from '@/components/radar/DiscoveryQueueView';
import { CoverageMap } from '@/components/radar/CoverageMap';
import { SensorTable } from '@/components/radar/SensorTable';
import { SignalTable } from '@/components/radar/SignalTable';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'News Radar | The Breakdown',
  description: 'Newsroom early event detection dashboard — persistent operational telemetry',
};

export default async function RadarPage() {
  let signals: NewsroomSignal[] = [];
  let healthMap = new Map<string, RadarSourceHealth>();
  let latestRun: RadarPipelineRunRecord | null = null;

  try {
    const repository = createRadarPersistenceRepository();
    const [hMap, run] = await Promise.all([
      repository.loadSourceHealth().catch(() => new Map<string, RadarSourceHealth>()),
      repository.getLatestPipelineRun().catch(() => null),
    ]);
    healthMap = hMap;
    latestRun = run;

    await newsroomIntelligenceCore.ensureLoaded();
    signals = newsroomIntelligenceCore.getSignals().slice(0, 20);
  } catch (err) {
    console.warn('[RadarPage] Persistent state or newsroom core load warning:', err);
  }

  // Calculate schedule stats
  const now = new Date();
  const activeSources = MP_RADAR_SOURCES.filter((s) => s.enabled);
  const { dueSources, evaluatedStates } = SourceScheduler.getDueSources(
    activeSources,
    healthMap,
    now
  );

  const totalSources = MP_RADAR_SOURCES.length;
  const healthyCount = Array.from(healthMap.values()).filter((h) => h.status === 'healthy').length;
  const failingCount = Array.from(healthMap.values()).filter(
    (h) => h.status === 'failing' || h.status === 'degraded'
  ).length;

  // Evaluate coverage matrix and proactive discovery queue
  const coverageEngine = new CoverageMatrixEngine();
  const coverageReport = coverageEngine.generateReport(INDIA_COUNTRY_PACK, MP_RADAR_SOURCES, healthMap);

  const discoveryQueue = new ProactiveDiscoveryQueue();
  discoveryQueue.generateTasksFromGaps(coverageReport.detectedGaps, INDIA_COUNTRY_PACK);
  const discoveryTasks = discoveryQueue.getTasks();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 p-8 font-sans">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1 tracking-tight">Newsroom Radar</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Continuous Event Sensing &amp; Verification OS — Madhya Pradesh Sensor Array
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
            Loop Active (Vercel Cron 30m)
          </span>
        </div>
      </header>

      {/* Top Level Metric Cards & Pipeline Telemetry */}
      <MetricCards
        totalSources={totalSources}
        healthyCount={healthyCount}
        failingCount={failingCount}
        dueCount={dueSources.length}
        activeSourcesCount={activeSources.length}
        signalCount={signals.length}
        latestRun={latestRun}
      />

      {/* Multi-Dimensional Coverage Scorecard & Blind Spots */}
      <CoverageScorecard report={coverageReport} />

      {/* Autonomous Discovery Queue & Human Editorial Gate */}
      <DiscoveryQueueView tasks={discoveryTasks} />

      {/* Geographic Coverage Matrix */}
      <CoverageMap sources={MP_RADAR_SOURCES} healthMap={healthMap} />

      {/* Monitored Sensors and Signals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SensorTable
          sources={MP_RADAR_SOURCES}
          healthMap={healthMap}
          evaluatedStates={evaluatedStates}
        />
        <SignalTable signals={signals} />
      </div>
    </div>
  );
}

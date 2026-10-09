/**
 * ─── City Sensor Profiles & Economic Cost Engine ──────────────────────────────
 *
 * Governing document: AGENTS.md (Platform Beta)
 * Phase 6: Global Sensor Deployment & Real-World Benchmarking
 *
 * Models city-level sensing profiles (Bhopal, Rewa, Los Angeles, London, Munich)
 * and measures the economics of the sensing architecture (cost per source/day,
 * cost per detected event, cost per verified event).
 */

import type { RadarSourceDefinition, RadarSourceHealth } from '../types';

export interface CitySensorProfile {
  city: string;
  country: string;
  primarySensorsCount: number;
  secondarySensorsCount: number;
  healthySensorsCount: number;
  failingSensorsCount: number;
  criticalBeatsCovered: string[];
  missingBeats: string[];
  medianDetectionLatencyMinutes: number | null;
  recallRate: number;
  knownBlindSpots: string[];
}

export interface OperatingCostReport {
  sourcesMonitored: number;
  requestsPerDay: number;
  databaseWritesPerDay: number;
  aiCallsPerDay: number;
  browserExecutionsPerDay: number;
  computeCostUsdPerDay: number;
  aiCostUsdPerDay: number;
  totalCostUsdPerDay: number;
  costPerSourcePerDayUsd: number;
  costPerDetectedEventUsd: number;
  costPerVerifiedEventUsd: number;
}

export class CityProfileEngine {
  /**
   * Generates an operational city sensor profile.
   */
  public generateProfile(
    city: string,
    country: string,
    sources: RadarSourceDefinition[],
    healthMap: Map<string, RadarSourceHealth>,
    cityEventsDetected = 0,
    cityTotalEvents = 0,
    medianLatency: number | null = null,
    knownBlindSpots: string[] = []
  ): CitySensorProfile {
    const citySources = sources.filter(
      (s) =>
        s.city?.toLowerCase() === city.toLowerCase() ||
        s.district?.toLowerCase().includes(city.toLowerCase()) ||
        s.name.toLowerCase().includes(city.toLowerCase())
    );

    const primaryList = citySources.filter(
      (s) => s.officialStatus === 'official_primary' || s.authorityClass === 'PRIMARY' || s.authorityClass === 'JUDICIAL'
    );
    const secondaryList = citySources.filter((s) => !primaryList.includes(s));

    const healthyList = citySources.filter((s) => healthMap.get(s.id)?.status === 'healthy');
    const failingList = citySources.filter(
      (s) => healthMap.get(s.id)?.status === 'failing' || (healthMap.get(s.id)?.consecutiveFailures || 0) >= 3
    );

    const criticalBeats = ['government', 'public_safety', 'courts'];
    const coveredBeats = Array.from(new Set(citySources.map((s) => s.beat)));
    const missingBeats = criticalBeats.filter((b) => !coveredBeats.includes(b as any));

    const recallRate =
      cityTotalEvents > 0 ? Math.round((cityEventsDetected / cityTotalEvents) * 100) / 100 : 0;

    return {
      city,
      country,
      primarySensorsCount: primaryList.length,
      secondarySensorsCount: secondaryList.length,
      healthySensorsCount: healthyList.length,
      failingSensorsCount: failingList.length,
      criticalBeatsCovered: coveredBeats,
      missingBeats,
      medianDetectionLatencyMinutes: medianLatency,
      recallRate,
      knownBlindSpots,
    };
  }

  /**
   * Calculates daily operational economics per source and detected/verified events.
   */
  public calculateOperatingCost(
    sourcesCount: number,
    detectedEventsPerDay = 10,
    verifiedEventsPerDay = 5
  ): OperatingCostReport {
    // Standard serverless / compute rates
    const averagePollsPerHourPerSource = 2; // ~30m interval
    const requestsPerDay = sourcesCount * averagePollsPerHourPerSource * 24;
    const databaseWritesPerDay = requestsPerDay + detectedEventsPerDay * 5; // polling logs + signal records
    const browserExecutionsPerDay = Math.round(sourcesCount * 0.1 * 24); // ~10% browser collectors
    const aiCallsPerDay = detectedEventsPerDay * 2; // entity / extraction verification

    // Unit costs (Vercel Serverless + Supabase PG + Gemini Flash tokens)
    const computeCostUsdPerDay = (requestsPerDay * 0.000002) + (browserExecutionsPerDay * 0.0005);
    const aiCostUsdPerDay = aiCallsPerDay * 0.00025; // ~1k tokens per call
    const storageCostUsdPerDay = (databaseWritesPerDay * 0.000001);
    const totalCostUsdPerDay = Math.round((computeCostUsdPerDay + aiCostUsdPerDay + storageCostUsdPerDay) * 1000) / 1000;

    const costPerSourcePerDayUsd = sourcesCount > 0 ? Math.round((totalCostUsdPerDay / sourcesCount) * 1000) / 1000 : 0;
    const costPerDetectedEventUsd =
      detectedEventsPerDay > 0 ? Math.round((totalCostUsdPerDay / detectedEventsPerDay) * 10000) / 10000 : 0;
    const costPerVerifiedEventUsd =
      verifiedEventsPerDay > 0 ? Math.round((totalCostUsdPerDay / verifiedEventsPerDay) * 10000) / 10000 : 0;

    return {
      sourcesMonitored: sourcesCount,
      requestsPerDay,
      databaseWritesPerDay,
      aiCallsPerDay,
      browserExecutionsPerDay,
      computeCostUsdPerDay: Math.round(computeCostUsdPerDay * 1000) / 1000,
      aiCostUsdPerDay: Math.round(aiCostUsdPerDay * 1000) / 1000,
      totalCostUsdPerDay,
      costPerSourcePerDayUsd,
      costPerDetectedEventUsd,
      costPerVerifiedEventUsd,
    };
  }
}

import type { CountryPack } from '@/data/radar/countries';
import type { RadarSourceDefinition, RadarSourceHealth } from '../types';
import type { SourceCandidate } from '../discovery/types';
import type {
  GeographicUnitCoverage,
  GeographicCoverageReport,
  CoverageGap,
  CoverageState,
} from './types';

const CRITICAL_BEATS = ['government', 'public_safety', 'courts'];

export class CoverageMatrixEngine {
  /**
   * Evaluates geographic coverage state and detects coverage blind spots across a CountryPack.
   */
  public generateReport(
    countryPack: CountryPack,
    activeSources: RadarSourceDefinition[],
    healthMap: Map<string, RadarSourceHealth>,
    candidates: SourceCandidate[] = []
  ): GeographicCoverageReport {
    const units: GeographicUnitCoverage[] = [];
    const detectedGaps: CoverageGap[] = [];

    let strongCount = 0;
    let activeCount = 0;
    let partialCount = 0;
    let blindCount = 0;

    for (const [nodeId, node] of Object.entries(countryPack.nodes)) {
      if (node.level === 'country') continue; // Assess administrative sub-units

      // Match sources to this node
      const matchingSources = activeSources.filter(
        (s) =>
          s.district === nodeId ||
          s.state === nodeId ||
          s.city === nodeId ||
          s.geographies?.includes(node.name.toUpperCase())
      );

      const matchingCandidates = candidates.filter(
        (c) =>
          c.geography.district === nodeId ||
          c.geography.state === nodeId ||
          c.geography.city === nodeId
      );

      const activeList = matchingSources.filter((s) => s.enabled);
      const primaryList = activeList.filter((s) => s.primarySource || s.authorityClass === 'PRIMARY' || s.authorityClass === 'JUDICIAL');
      const secondaryList = activeList.filter((s) => !primaryList.includes(s));

      const healthyList = activeList.filter((s) => healthMap.get(s.id)?.status === 'healthy');
      const staleList = activeList.filter((s) => healthMap.get(s.id)?.scheduleState === 'STALE');
      const failingList = activeList.filter(
        (s) => (healthMap.get(s.id)?.consecutiveFailures || 0) >= 3 || healthMap.get(s.id)?.status === 'failing'
      );

      const coveredBeats = Array.from(new Set(activeList.map((s) => s.beat)));
      const missingBeats = CRITICAL_BEATS.filter((b) => !coveredBeats.includes(b as any));

      const coverageState = this.determineState(
        activeList.length,
        primaryList.length,
        healthyList.length,
        coveredBeats.length,
        failingList.length,
        matchingCandidates.length
      );

      if (coverageState === 'STRONG') strongCount++;
      else if (coverageState === 'ACTIVE') activeCount++;
      else if (coverageState === 'PARTIAL') partialCount++;
      else if (coverageState === 'BLIND' || coverageState === 'NONE') blindCount++;

      const unit: GeographicUnitCoverage = {
        nodeId,
        name: node.name,
        level: node.level,
        totalCandidates: matchingCandidates.length,
        approvedSources: matchingSources.length,
        activeSources: activeList.length,
        healthySources: healthyList.length,
        staleSources: staleList.length,
        failingSources: failingList.length,
        primarySources: primaryList.length,
        secondarySources: secondaryList.length,
        coveredBeats,
        missingBeats,
        coverageState,
      };

      units.push(unit);

      // Detect automated gaps
      this.detectGapsForUnit(unit, detectedGaps);
    }

    return {
      timestamp: new Date().toISOString(),
      countryCode: countryPack.countryCode,
      totalGeographicUnits: units.length,
      strongCoverageCount: strongCount,
      activeCoverageCount: activeCount,
      partialCoverageCount: partialCount,
      blindCoverageCount: blindCount,
      units,
      detectedGaps,
    };
  }

  private determineState(
    activeCount: number,
    primaryCount: number,
    healthyCount: number,
    beatCount: number,
    failingCount: number,
    candidateCount: number
  ): CoverageState {
    if (activeCount === 0) {
      return candidateCount > 0 ? 'CANDIDATE' : 'BLIND';
    }

    if (failingCount === activeCount && activeCount > 0) {
      return 'BLIND';
    }

    if (primaryCount >= 2 && healthyCount >= 2 && beatCount >= 3) {
      return 'STRONG';
    }

    if (primaryCount >= 1 && healthyCount >= 1) {
      return 'ACTIVE';
    }

    return 'PARTIAL';
  }

  private detectGapsForUnit(unit: GeographicUnitCoverage, gaps: CoverageGap[]): void {
    if (unit.coverageState === 'BLIND') {
      gaps.push({
        geographyId: unit.nodeId,
        geographyName: unit.name,
        gapType: 'BLIND_SPOT',
        details: `Zero active or healthy sensors currently operational for ${unit.name}`,
        severity: 'CRITICAL',
        remedyRecommendation: `Initiate automated candidate discovery on ${unit.name} administrative domains.`,
      });
      return;
    }

    if (unit.primarySources === 0 && unit.activeSources > 0) {
      gaps.push({
        geographyId: unit.nodeId,
        geographyName: unit.name,
        gapType: 'NO_PRIMARY_SOURCE',
        details: `${unit.name} is monitored only by secondary media with zero official primary sources.`,
        severity: 'CRITICAL',
        remedyRecommendation: 'Onboard district administration portal, collectorate, or police feed.',
      });
    }

    if (unit.failingSources > 0 && unit.failingSources === unit.activeSources) {
      gaps.push({
        geographyId: unit.nodeId,
        geographyName: unit.name,
        gapType: 'ALL_SOURCES_FAILING',
        details: `All ${unit.activeSources} sources for ${unit.name} are failing or unreachable.`,
        severity: 'CRITICAL',
        remedyRecommendation: 'Check source endpoint status, collector compatibility, or backoff timeout.',
      });
    }

    for (const beat of unit.missingBeats) {
      gaps.push({
        geographyId: unit.nodeId,
        geographyName: unit.name,
        gapType: 'UNCOVERED_BEAT',
        details: `Critical newsroom beat "${beat}" has zero coverage in ${unit.name}.`,
        severity: 'WARNING',
        remedyRecommendation: `Discover and onboard ${beat} institutions for ${unit.name}.`,
      });
    }
  }
}

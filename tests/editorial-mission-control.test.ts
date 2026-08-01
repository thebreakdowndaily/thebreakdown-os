import { describe, it, expect } from 'vitest';
import { EditorialDashboardProjection } from '../services/intelligence/editorial-dashboard.service';
import { ResearchSupportService } from '../services/intelligence/research-support.service';
import { GoldStandardAuditService } from '../services/editorial/gold-standard-audit.service';
import { CHAPTER_1_PACKAGE, CHAPTER_1_FIX } from '../lib/editorial/chapter-1-data';

describe('TEST-MISSION-CONTROL: Editorial Mission Control Dashboard (Phase 15B)', () => {
  it('TEST-MC-01: Projects Real-Time Operational Health & Metric Summary', () => {
    const fixes = [CHAPTER_1_FIX];
    const data = EditorialDashboardProjection.projectDashboard(fixes);

    expect(data.reviewQueueCount).toBeGreaterThanOrEqual(0);
    expect(data.verificationBacklogCount).toBeGreaterThanOrEqual(0);
    expect(data.evidenceHealthIndex).toBeGreaterThan(0);
    expect(data.publicationReadinessScore).toBeGreaterThan(0);
    expect(data.topInsights).toBeDefined();
    expect(data.topGaps).toBeDefined();
    expect(data.topConflicts).toBeDefined();
  });

  it('TEST-MC-02: Graceful Projection Handling for Empty Fix Repository', () => {
    const emptyData = EditorialDashboardProjection.projectDashboard([]);
    expect(emptyData.reviewQueueCount).toBe(0);
    expect(emptyData.verificationBacklogCount).toBe(0);
    expect(emptyData.evidenceHealthIndex).toBe(0);
    expect(emptyData.publicationReadinessScore).toBe(0);
    expect(emptyData.topInsights).toEqual([]);
    expect(emptyData.topGaps).toEqual([]);
    expect(emptyData.topConflicts).toEqual([]);
  });

  it('TEST-MC-03: Gold Standard Audit Integration & Drill-Down Link Resolution', () => {
    const cert = GoldStandardAuditService.auditChapter1(CHAPTER_1_PACKAGE);
    expect(cert.overallPassed).toBe(true);
    expect(cert.percentage).toBe(100);
    expect(cert.chapterSlug).toBe('foundations-of-strategic-autonomy-1947-1962');
  });

  it('TEST-MC-04: Research Copilot Recommendations Engine Integration', () => {
    const recs = ResearchSupportService.generateRecommendations(CHAPTER_1_FIX, [CHAPTER_1_FIX]);
    expect(recs.length).toBeGreaterThan(0);
    expect(recs[0].id).toBeDefined();
    expect(recs[0].category).toBeDefined();
    expect(recs[0].title).toBeDefined();
  });

  it('TEST-MC-05: Non-Mutation Guarantee for Inputs During Dashboard Projection', () => {
    const originalJson = JSON.stringify(CHAPTER_1_FIX);
    EditorialDashboardProjection.projectDashboard([CHAPTER_1_FIX]);
    ResearchSupportService.generateRecommendations(CHAPTER_1_FIX, [CHAPTER_1_FIX]);
    expect(JSON.stringify(CHAPTER_1_FIX)).toBe(originalJson);
  });
});

/**
 * ─── Newsroom Scorecard Baseline Loader ──────────────────────────────────────
 *
 * Loads the frozen News Intelligence Baseline 1.2 reference (coverage recall,
 * intelligence recall, silent losses, false-positive gaps) from the immutable
 * data artifact so the live scorecard can display the frozen holdout baseline
 * alongside measured operating telemetry.
 *
 * Governing document: docs/newsroom/NEWS_INTELLIGENCE_V1_2_COVERAGE_RECOVERY_REPORT.md
 * (Baseline 1.2 freeze).
 */

import * as fs from 'fs';
import * as path from 'path';
import { NewsroomScorecardBaselineReference } from '@/types/newsroom-intelligence';

const BASELINE_FILE = path.join(process.cwd(), 'data', 'newsroom-advantage-v1.2-baseline.json');

export interface BaselineRecord {
  baseline_tag: string;
  baseline_version: string;
  status: string;
  metrics: {
    coverage_recall: number;
    intelligence_recall: number;
    silent_losses: number;
    false_positive_gaps: number;
  };
}

export function loadNewsroomScorecardBaseline(): NewsroomScorecardBaselineReference {
  const raw = fs.readFileSync(BASELINE_FILE, 'utf8');
  const record = JSON.parse(raw) as BaselineRecord;
  return {
    tag: record.baseline_tag,
    version: record.baseline_version,
    coverageRecall: record.metrics.coverage_recall,
    intelligenceRecall: record.metrics.intelligence_recall,
    silentLosses: record.metrics.silent_losses,
    falsePositiveGaps: record.metrics.false_positive_gaps,
    sourceArtifact: 'data/newsroom-advantage-v1.2-baseline.json',
  };
}

import { writeFileSync } from 'fs';
import { aggregate } from './aggregator';
import { AuditResult } from '../plugins/types/AuditResult';

export function writeReport(results: AuditResult[], outputPath: string = 'audit-report.json') {
  const report = aggregate(results);
  const json = JSON.stringify(report, null, 2);
  writeFileSync(outputPath, json, { encoding: 'utf-8' });
  console.log(`Audit report written to ${outputPath}`);
}

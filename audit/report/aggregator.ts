import { AuditResult } from '../plugins/types/AuditResult';

export function aggregate(results: AuditResult[]) {
  const frameworkVersion = '1.0.0';
  const sdkVersion = '1.0.0';
  const schemaVersion = '2.0';
  const timestamp = new Date().toISOString();
  const nodeVersion = process.version;
  const os = process.platform;

  return {
    frameworkVersion,
    sdkVersion,
    schemaVersion,
    timestamp,
    nodeVersion,
    os,
    results,
  };
}

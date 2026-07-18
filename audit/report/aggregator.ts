import { AuditResult } from '../plugins/types/AuditResult';

export function aggregate(results: AuditResult[]) {
  const frameworkVersion = '1.0.0';
  const sdkVersion = '1.0.0';
  const schemaVersion = '2.0';
  const reportVersion = '1.0';
  const policyVersion = '1.0';
  const generatedAt = new Date().toISOString();
  const nodeVersion = process.version;
  const os = process.platform;

  let totalScore = 0;
  let scoreCount = 0;
  let totalCoverage = 0;
  let coverageCount = 0;
  
  let successfulPlugins = 0;
  let failedPlugins = 0;
  let skippedPlugins = 0; // Not fully implemented yet, but keeping field
  
  let totalDurationMs = 0;

  for (const result of results) {
    if (result.state === 'PASSED') {
      successfulPlugins++;
    } else if (result.state === 'FAILED') {
      failedPlugins++;
    }

    if (result.execution && result.execution.durationMs) {
      totalDurationMs += result.execution.durationMs;
    }

    // Exclude mock plugins from platform health score
    if (!result.pluginName.startsWith('mock-')) {
      if (typeof result.data?.score === 'number') {
        totalScore += result.data.score;
        scoreCount++;
      }
      if (typeof result.data?.coverage === 'number') {
        totalCoverage += result.data.coverage;
        coverageCount++;
      }
    }
  }

  const platformHealthScore = scoreCount > 0 ? (totalScore / scoreCount) : 0;
  const weightedPlatformHealthScore = platformHealthScore; // Will be configurable in v2
  const coverage = coverageCount > 0 ? (totalCoverage / coverageCount) : 0;

  return {
    frameworkVersion,
    schemaVersion,
    reportVersion,
    policyVersion,
    
    platformHealthScore,
    weightedPlatformHealthScore,
    coverage,
    
    pluginCount: results.length,
    successfulPlugins,
    failedPlugins,
    skippedPlugins,

    execution: {
      totalDurationMs,
      generatedAt,
      nodeVersion,
      os
    },

    results,
  };
}

import * as fs from 'fs';
import * as path from 'path';
import { AuditContext } from '../types/AuditContext';
import { AuditResult } from '../types/AuditResult';
import { LifecycleState } from '../types/LifecycleState';

export const name = 'performance-audit';
export const description = 'Verifies performance readiness through repository configuration';

type Severity = 'critical' | 'high' | 'medium' | 'low' | 'informational';

interface Finding {
  severity: Severity;
  message: string;
}

export async function run(context: AuditContext): Promise<AuditResult> {
  const { repoRoot } = context;
  const policyPath = path.join(repoRoot, 'audit/plugins/performance-audit/policy.json');
  let policy: any = {};
  if (fs.existsSync(policyPath)) {
    policy = JSON.parse(fs.readFileSync(policyPath, 'utf8'));
  }

  const findings: Finding[] = [];
  
  let lighthousePassed = 1;
  let lighthouseTotal = 1;
  
  let bundlePassed = 1;
  let bundleTotal = 1;
  
  let nextConfigPassed = 1;
  let nextConfigTotal = 1;

  const pkgPath = path.join(repoRoot, 'package.json');
  let pkgData: any = null;
  if (fs.existsSync(pkgPath)) {
    try {
      pkgData = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    } catch (e) {
      // Handled by operations plugin
    }
  }

  const perfPolicy = policy.performance || {};

  // 1. Lighthouse config
  if (perfPolicy.lighthouse && perfPolicy.lighthouse.required) {
    const configFiles = perfPolicy.lighthouse.files || [];
    let hasLighthouse = false;
    
    for (const file of configFiles) {
      if (fs.existsSync(path.join(repoRoot, file))) {
        hasLighthouse = true;
        break;
      }
    }
    
    if (!hasLighthouse) {
      // Also check package.json for @lhci/cli
      if (pkgData) {
        const deps = { ...(pkgData.dependencies || {}), ...(pkgData.devDependencies || {}) };
        if (deps['@lhci/cli']) {
          hasLighthouse = true;
        }
      }
    }

    if (!hasLighthouse) {
      findings.push({ 
        severity: perfPolicy.lighthouse.severity, 
        message: `Missing lighthouse configuration file (e.g. ${configFiles.join(', ')}) or @lhci/cli dependency` 
      });
      lighthousePassed = 0;
    }
  }

  // 2. Bundle Analyzer
  if (perfPolicy.bundleAnalyzer && perfPolicy.bundleAnalyzer.required) {
    const plugin = perfPolicy.bundleAnalyzer.plugin;
    let hasBundleAnalyzer = false;
    
    if (pkgData) {
      const deps = { ...(pkgData.dependencies || {}), ...(pkgData.devDependencies || {}) };
      hasBundleAnalyzer = Object.keys(deps).includes(plugin);
    }

    if (!hasBundleAnalyzer) {
      findings.push({
        severity: perfPolicy.bundleAnalyzer.severity,
        message: `Missing bundle analyzer dependency: ${plugin} in package.json`
      });
      bundlePassed = 0;
    }
  }

  // 3. Next.js Image Optimization
  if (perfPolicy.nextConfig && perfPolicy.nextConfig.imageOptimization && perfPolicy.nextConfig.imageOptimization.required) {
    // Check if next.config.js has image configuration
    const nextConfigFiles = ['next.config.js', 'next.config.mjs', 'next.config.ts'];
    let hasImageOpt = false;
    let nextConfigFound = false;

    for (const file of nextConfigFiles) {
      const configPath = path.join(repoRoot, file);
      if (fs.existsSync(configPath)) {
        nextConfigFound = true;
        const content = fs.readFileSync(configPath, 'utf8');
        // Very basic heuristic
        if (content.includes('images: {') || content.includes('remotePatterns')) {
          hasImageOpt = true;
        }
        break;
      }
    }

    if (nextConfigFound && !hasImageOpt) {
      findings.push({
        severity: perfPolicy.nextConfig.imageOptimization.severity,
        message: 'No evidence of image optimization configuration in next.config'
      });
      nextConfigPassed = 0;
    }
    // If next config is not found, we don't penalize here since it might be a different setup, 
    // or architecture plugin handles missing files.
  }

  const lighthouseScore = (lighthousePassed / lighthouseTotal) * 100;
  const bundleScore = (bundlePassed / bundleTotal) * 100;
  const nextConfigScore = (nextConfigPassed / nextConfigTotal) * 100;

  // Compute Performance Readiness Score (PRS)
  const perfReadinessScore = (lighthouseScore * 40 + bundleScore * 40 + nextConfigScore * 20) / 100;

  const hasCriticalOrHigh = findings.some(f => f.severity === 'critical' || f.severity === 'high');

  return {
    pluginName: name,
    state: hasCriticalOrHigh ? LifecycleState.FAILED : LifecycleState.PASSED,
    data: {
      score: perfReadinessScore,
      coverage: 100,
      findings,
      metrics: {
        lighthouseScore,
        bundleScore,
        nextConfigScore,
        performanceReadinessScore: perfReadinessScore
      }
    }
  };
}

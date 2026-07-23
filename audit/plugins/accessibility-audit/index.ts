import * as fs from 'fs';
import * as path from 'path';
import { AuditContext } from '../types/AuditContext';
import { AuditResult } from '../types/AuditResult';
import { LifecycleState } from '../types/LifecycleState';

export const name = 'accessibility-audit';
export const description = 'Verifies accessibility readiness through repository configuration';

type Severity = 'critical' | 'high' | 'medium' | 'low' | 'informational';

interface Finding {
  severity: Severity;
  message: string;
}

export async function run(context: AuditContext): Promise<AuditResult> {
  const { repoRoot } = context;
  const policyPath = path.join(repoRoot, 'audit/plugins/accessibility-audit/policy.json');
  let policy: any = {};
  if (fs.existsSync(policyPath)) {
    policy = JSON.parse(fs.readFileSync(policyPath, 'utf8'));
  }

  const findings: Finding[] = [];
  
  let lintingPassed = 1;
  let lintingTotal = 1;
  
  let automationPassed = 1;
  let automationTotal = 1;
  
  let stylingPassed = 1;
  let stylingTotal = 1;

  const pkgPath = path.join(repoRoot, 'package.json');
  let pkgData: any = null;
  if (fs.existsSync(pkgPath)) {
    try {
      pkgData = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    } catch (e) {
      // Handled by operations plugin
    }
  }

  const a11yPolicy = policy.accessibility || {};

  // 1. Linting
  if (a11yPolicy.linting) {
    if (a11yPolicy.linting.eslint && a11yPolicy.linting.eslint.plugins) {
      const plugins = a11yPolicy.linting.eslint.plugins;
      let hasA11yPlugin = false;
      
      if (pkgData) {
        const deps = { ...(pkgData.dependencies || {}), ...(pkgData.devDependencies || {}) };
        hasA11yPlugin = plugins.some((p: string) => Object.keys(deps).includes(p));
      }

      if (!hasA11yPlugin) {
        findings.push({ 
          severity: a11yPolicy.linting.eslint.severity, 
          message: `Missing accessibility linting plugin (e.g. ${plugins.join(' or ')}) in package.json` 
        });
        lintingPassed = 0;
      }
    }
  }

  // 2. Automated Tests
  if (a11yPolicy.automatedTests && a11yPolicy.automatedTests.tools) {
    const tools = a11yPolicy.automatedTests.tools;
    let hasAxe = false;
    
    if (pkgData) {
      const deps = { ...(pkgData.dependencies || {}), ...(pkgData.devDependencies || {}) };
      hasAxe = tools.some((t: string) => Object.keys(deps).includes(t));
    }

    if (!hasAxe) {
      findings.push({
        severity: a11yPolicy.automatedTests.severity,
        message: `Missing automated accessibility testing tool (e.g. ${tools.join(' or ')}) in package.json`
      });
      automationPassed = 0;
    }
  }

  // 3. Styling / focus-visible
  if (a11yPolicy.styling && a11yPolicy.styling.focusVisible && a11yPolicy.styling.focusVisible.required) {
    // A simple heuristic: check if tailwind config or a global css file contains "focus-visible"
    // To keep it fast, we can check a few common files.
    const commonStylingFiles = [
      'tailwind.config.ts',
      'tailwind.config.js',
      'app/globals.css',
      'styles/globals.css',
      'styles/index.css'
    ];
    let hasFocusVisible = false;
    for (const file of commonStylingFiles) {
      const filePath = path.join(repoRoot, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('focus-visible') || content.includes('focus-within')) {
          hasFocusVisible = true;
          break;
        }
      }
    }

    if (!hasFocusVisible) {
      findings.push({
        severity: a11yPolicy.styling.focusVisible.severity,
        message: 'No evidence of focus-visible or focus-within configuration in common styling files'
      });
      stylingPassed = 0;
    }
  }

  const lintingScore = (lintingPassed / lintingTotal) * 100;
  const automationScore = (automationPassed / automationTotal) * 100;
  const stylingScore = (stylingPassed / stylingTotal) * 100;

  // Compute Accessibility Readiness Score (A11Y)
  const a11yReadinessScore = (lintingScore * 40 + automationScore * 40 + stylingScore * 20) / 100;

  const hasCriticalOrHigh = findings.some(f => f.severity === 'critical' || f.severity === 'high');

  return {
    pluginName: name,
    state: hasCriticalOrHigh ? LifecycleState.FAILED : LifecycleState.PASSED,
    data: {
      score: a11yReadinessScore,
      coverage: 100, // Evaluated all structural files requested by policy
      findings,
      metrics: {
        lintingScore,
        automationScore,
        stylingScore,
        accessibilityReadinessScore: a11yReadinessScore
      }
    }
  };
}

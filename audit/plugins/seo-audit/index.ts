import * as fs from 'fs';
import * as path from 'path';
import { AuditContext } from '../types/AuditContext';
import { AuditResult } from '../types/AuditResult';
import { LifecycleState } from '../types/LifecycleState';

export const name = 'seo-audit';
export const description = 'Verifies structural SEO readiness';

type Severity = 'critical' | 'high' | 'medium' | 'low' | 'informational';

interface Finding {
  severity: Severity;
  message: string;
}

export async function run(context: AuditContext): Promise<AuditResult> {
  const { repoRoot } = context;
  const policyPath = path.join(repoRoot, 'audit/plugins/seo-audit/policy.json');
  let policy: any = {};
  if (fs.existsSync(policyPath)) {
    policy = JSON.parse(fs.readFileSync(policyPath, 'utf8'));
  }

  const findings: Finding[] = [];
  
  let robotsPassed = 1;
  let robotsTotal = 1;
  
  let sitemapPassed = 1;
  let sitemapTotal = 1;
  
  let metadataPassed = 1;
  let metadataTotal = 1;

  const seoPolicy = policy.seo || {};

  // 1. Robots.txt
  if (seoPolicy.robots && seoPolicy.robots.required) {
    const configFiles = seoPolicy.robots.files || [];
    let hasRobots = false;
    
    for (const file of configFiles) {
      if (fs.existsSync(path.join(repoRoot, file))) {
        hasRobots = true;
        break;
      }
    }

    if (!hasRobots) {
      findings.push({ 
        severity: seoPolicy.robots.severity, 
        message: `Missing robots configuration (e.g. ${configFiles.join(', ')})` 
      });
      robotsPassed = 0;
    }
  }

  // 2. Sitemap
  if (seoPolicy.sitemap && seoPolicy.sitemap.required) {
    const configFiles = seoPolicy.sitemap.files || [];
    let hasSitemap = false;
    
    for (const file of configFiles) {
      if (fs.existsSync(path.join(repoRoot, file))) {
        hasSitemap = true;
        break;
      }
    }

    if (!hasSitemap) {
      findings.push({ 
        severity: seoPolicy.sitemap.severity, 
        message: `Missing sitemap configuration (e.g. ${configFiles.join(', ')})` 
      });
      sitemapPassed = 0;
    }
  }

  // 3. Metadata (Root Layout)
  if (seoPolicy.metadata && seoPolicy.metadata.required) {
    const layoutFiles = seoPolicy.metadata.rootLayout || [];
    let hasMetadata = false;
    
    for (const file of layoutFiles) {
      const layoutPath = path.join(repoRoot, file);
      if (fs.existsSync(layoutPath)) {
        const content = fs.readFileSync(layoutPath, 'utf8');
        // Check for Next.js metadata API usage or standard metadata tags
        if (content.includes('export const metadata') || content.includes('<title>') || content.includes('generateMetadata')) {
          hasMetadata = true;
          // Also check canonical URLs in metadata if required
          if (!content.includes('alternates') && !content.includes('canonical')) {
            findings.push({
              severity: 'low',
              message: `Root layout ${file} does not appear to configure canonical URLs`
            });
          }
          break;
        }
      }
    }

    if (!hasMetadata) {
      findings.push({
        severity: seoPolicy.metadata.severity,
        message: `Missing metadata configuration in root layout (e.g. ${layoutFiles.join(', ')})`
      });
      metadataPassed = 0;
    }
  }

  const robotsScore = (robotsPassed / robotsTotal) * 100;
  const sitemapScore = (sitemapPassed / sitemapTotal) * 100;
  const metadataScore = (metadataPassed / metadataTotal) * 100;

  // Compute SEO Readiness Score (SES)
  const seoReadinessScore = (robotsScore * 30 + sitemapScore * 30 + metadataScore * 40) / 100;

  const hasCriticalOrHigh = findings.some(f => f.severity === 'critical' || f.severity === 'high');

  return {
    pluginName: name,
    state: hasCriticalOrHigh ? LifecycleState.FAILED : LifecycleState.PASSED,
    data: {
      score: seoReadinessScore,
      coverage: 100, // Evaluated all structural SEO files requested
      findings,
      metrics: {
        robotsScore,
        sitemapScore,
        metadataScore,
        seoReadinessScore
      }
    }
  };
}

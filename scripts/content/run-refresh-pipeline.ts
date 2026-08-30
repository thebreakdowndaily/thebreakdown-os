import * as fs from 'fs';
import * as path from 'path';
import { getStore } from '../../utils/data-layer/store';
import { ContentRefreshPipeline } from '../../lib/content-scale/refresh-pipeline';

function ensureDirectory(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function main() {
  const store = getStore();
  const pipeline = new ContentRefreshPipeline();

  const auditDir = path.join(process.cwd(), 'audit', 'task-13');
  ensureDirectory(auditDir);

  // 1. Run pipeline and generate 01-refresh-backlog.csv
  const stories = Array.from(store.stories.values());
  const results = stories.map(s => pipeline.analyzeStory(s));

  let backlogCsv = 'slug,title,status,lastVerified,ageDays,severity,reasons,recommendedAction\n';
  for (const r of results) {
    const reasonsStr = r.reasons.join('; ');
    backlogCsv += `${r.slug},"${r.title.replace(/"/g, '""')}",${r.status},${r.lastVerified},${r.ageDays},${r.severity},"${reasonsStr}","${r.recommendedAction}"\n`;
  }
  fs.writeFileSync(path.join(auditDir, '01-refresh-backlog.csv'), backlogCsv);

  // 2. Topical Authority Mapping
  const topics = Array.from(store.topics.values());
  let topicalCsv = 'topicSlug,topicName,cornerstones,supportingArticles,hasEligibleCornerstone\n';
  
  for (const topic of topics) {
    const topicStories = stories.filter(s => s.relatedTopicIds?.includes(topic.slug) || s.relatedTopicIds?.includes(topic.id));
    const cornerstones = topicStories.filter(s => s.storyType === 'explainer' || (s.evidenceScore && s.evidenceScore >= 90) || s.tags?.includes('cornerstone'));
    const supporting = topicStories.filter(s => !cornerstones.includes(s));
    
    const hasEligible = cornerstones.length > 0;
    
    topicalCsv += `${topic.slug},"${topic.name}",${cornerstones.length},${supporting.length},${hasEligible}\n`;
  }
  fs.writeFileSync(path.join(auditDir, '02-topical-authority-mapping.csv'), topicalCsv);

  // 3. Content Production Briefs
  const briefsMd = `# Content Production Briefs
## 1. Universal Basic Income: A Viable Path for India?
- **Intent**: Informational, exploring the feasibility of UBI in India.
- **Target Audience**: Policy enthusiasts, economists.
- **Key Angles**: Fiscal impact, comparison with existing schemes (like MGNREGA).
- **Primary Sources Needed**: Economic Survey data, pilot study results.

## 2. The Future of AI Regulation in India
- **Intent**: Navigational & Informational, understanding upcoming tech laws.
- **Target Audience**: Tech industry professionals, legal experts.
- **Key Angles**: DPDP Act implications, comparison with EU AI Act.
- **Primary Sources Needed**: Ministry of Electronics and IT drafts.

## 3. Renewable Energy Transition: India's 2030 Goals
- **Intent**: Informational, tracking progress on climate commitments.
- **Target Audience**: Environmental researchers, investors.
- **Key Angles**: Solar vs. Wind growth, financing the transition.
- **Primary Sources Needed**: MNRE reports, COP29 commitments.
`;
  fs.writeFileSync(path.join(auditDir, '03-content-production-briefs.md'), briefsMd);

  // 4. Internal Link Scaling
  const linksCsv = 'sourceSlug,targetSlug,recommendationReason\n' +
    'digital-payments-boom,semiconductor-pli,Connect tech infrastructure to hardware production.\n' +
    'mgnrega-reform,climate-finance,Link rural employment to climate resilience projects.\n';
  fs.writeFileSync(path.join(auditDir, '04-internal-link-scaling.csv'), linksCsv);

  // 5. Task 13 Report
  const reportMd = `# TASK-13 REPORT: Content & SEO Scale

## Architecture
The \`ContentRefreshPipeline\` evaluates stories based on:
1. Tags and Claims (outdated/repealed).
2. Freshness (age > 180 days).
3. Missing sources.
4. Low evidence density.

## Analysis Results
- Total Stories Evaluated: ${results.length}
- Stories Needing Update: ${results.filter(r => r.status === 'NEEDS_UPDATE').length}
- Outdated Stories: ${results.filter(r => r.status === 'OUTDATED').length}

## Scale Strategies
- Focus on creating cornerstone explainers for topics lacking them.
- Automate freshness checks using this pipeline in CI/CD.
- Implement robust internal linking between cornerstones and supporting articles.
`;
  fs.writeFileSync(path.join(auditDir, '05-TASK-13-REPORT.md'), reportMd);

  console.log('Task 13 scripts executed successfully. Outputs generated in audit/task-13/');
}

main().catch(console.error);

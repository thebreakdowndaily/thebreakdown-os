/**
 * scripts/audit-entity-graph.ts
 * Forensic Graph Audit: Author -> Story -> Entity -> Related Story -> Chapter -> Citation -> Source
 *
 * Governing documents:
 *   - docs/aeo-geo/architecture.md
 *   - Editorial Constitution §IX (Knowledge Object Governance) & §XIII (Transparency)
 */

import fs from 'fs';
import path from 'path';
import { getPublicStories, getEntities } from '../utils/data-layer/store';
import { getEntityIndex, getEntityById } from '../utils/data-layer/entity-index';
import { getKnowledgeLibrarySeedData } from '../utils/data-layer/knowledge-library-data';
import { AUTHORS, getAuthorByName } from '../lib/seo/author-registry';
import { isSafePublicUrl, extractAuthorName, isOrgAuthor } from '../lib/seo/jsonld';

console.log('🔍 [audit-entity-graph] Building and analyzing author-entity-story knowledge graph...');

const stories = getPublicStories({ pageSize: 200 }).data;
const entities = getEntities({ pageSize: 200 }).data;
const library = getKnowledgeLibrarySeedData();

interface GraphStats {
  totalStories: number;
  totalEntities: number;
  totalChapters: number;
  totalAuthors: number;
  totalSources: number;
  orphanEntities: string[];
  storiesWithoutEntities: string[];
  storiesWithoutSources: string[];
  unresolvedEntityReferences: Array<{ storySlug: string; entityRef: string }>;
  authorDistribution: Record<string, number>;
  entityStoryCoverage: Record<string, number>;
  sourceTypeDistribution: Record<string, number>;
  unsafeSourceUrls: Array<{ storySlug: string; url: string }>;
}

const stats: GraphStats = {
  totalStories: stories.length,
  totalEntities: entities.length,
  totalChapters: 0,
  totalAuthors: AUTHORS.length,
  totalSources: 0,
  orphanEntities: [],
  storiesWithoutEntities: [],
  storiesWithoutSources: [],
  unresolvedEntityReferences: [],
  authorDistribution: {},
  entityStoryCoverage: {},
  sourceTypeDistribution: {},
  unsafeSourceUrls: [],
};

// Count chapters
for (const lib of library) {
  for (const col of lib.collections) {
    for (const vol of col.volumes) {
      stats.totalChapters += vol.chapters.length;
    }
  }
}

// 1. Audit Stories
for (const story of stories) {
  const authorName = extractAuthorName(story.author) || 'The Breakdown';
  stats.authorDistribution[authorName] = (stats.authorDistribution[authorName] || 0) + 1;

  // Check entities
  const entityRefs: string[] = [
    ...((story as any).relatedEntities ?? []).map((re: any) => re.id || re.slug || ''),
    ...((story as any).relatedEntityIds ?? []),
  ].filter(Boolean);

  if (entityRefs.length === 0) {
    stats.storiesWithoutEntities.push(story.slug);
  } else {
    for (const ref of entityRefs) {
      const resolved = getEntityById(ref);
      if (!resolved) {
        stats.unresolvedEntityReferences.push({ storySlug: story.slug, entityRef: ref });
      } else {
        stats.entityStoryCoverage[resolved.slug] = (stats.entityStoryCoverage[resolved.slug] || 0) + 1;
      }
    }
  }

  // Check sources
  const storySources = story.sources ?? [];
  if (storySources.length === 0) {
    stats.storiesWithoutSources.push(story.slug);
  } else {
    stats.totalSources += storySources.length;
    for (const src of storySources) {
      const st = (src as any).sourceType || 'unclassified';
      stats.sourceTypeDistribution[st] = (stats.sourceTypeDistribution[st] || 0) + 1;
      if (!isSafePublicUrl(src.url)) {
        stats.unsafeSourceUrls.push({ storySlug: story.slug, url: src.url });
      }
    }
  }
}

// 2. Audit Entities for orphans
for (const entity of entities) {
  const mentionsCount = stats.entityStoryCoverage[entity.slug] || 0;
  const legacyRelated = (entity as any).relatedStories?.length || 0;
  if (mentionsCount === 0 && legacyRelated === 0) {
    stats.orphanEntities.push(entity.slug);
  }
}

// Generate Markdown Audit Report
const markdown = `# Author / Entity / Citation Graph Forensic Audit

**Audit Date:** 2026-09-29  
**Target:** Knowledge Graph Topography & Citation Traceability  
**Scope:** ${stats.totalStories} Public Stories · ${stats.totalEntities} Entities · ${stats.totalChapters} Chapters · ${stats.totalSources} Sourced Citations

---

## 1. Graph Macro Topography

| Dimension | Count | Health State |
|---|---|---|
| **Public Stories** | ${stats.totalStories} | Verified in store |
| **Entities in Registry** | ${stats.totalEntities} | Registered |
| **Chapters (Knowledge Library)** | ${stats.totalChapters} | Structured knowledge objects |
| **Authors in Registry** | ${stats.totalAuthors} | Canonical byline profiles |
| **Total Source Citations** | ${stats.totalSources} | Attached across stories |
| **Orphan Entities** (0 linked stories) | ${stats.orphanEntities.length} | ${stats.orphanEntities.length === 0 ? '✅ 0 orphans' : '⚠️ Review list below'} |
| **Stories without Entities** | ${stats.storiesWithoutEntities.length} | ${stats.storiesWithoutEntities.length === 0 ? '✅ 100% entity-linked' : '⚠️ Missing links'} |
| **Stories without Sources** | ${stats.storiesWithoutSources.length} | ${stats.storiesWithoutSources.length === 0 ? '✅ 100% sourced' : '❌ Critical gap'} |
| **Unsafe Source URLs** | ${stats.unsafeSourceUrls.length} | ${stats.unsafeSourceUrls.length === 0 ? '✅ 100% safe public URLs' : '❌ Malformed URLs found'} |

---

## 2. Author Distribution

Every byline must either map to an official newsroom entity or a registered journalist profile with verified URL.

\`\`\`json
${JSON.stringify(stats.authorDistribution, null, 2)}
\`\`\`

---

## 3. Entity Coverage & Prominence

Top covered entities by story frequency:

| Entity Slug | Story Count |
|---|---|
${Object.entries(stats.entityStoryCoverage)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 15)
  .map(([slug, count]) => `| \`${slug}\` | ${count} |`)
  .join('\n')}

---

## 4. Citation & Source Type Classification

Breakdown of primary vs secondary source evidence:

\`\`\`json
${JSON.stringify(stats.sourceTypeDistribution, null, 2)}
\`\`\`

---

## 5. Graph Discrepancies & Findings

### A. Stories without attached entities (${stats.storiesWithoutEntities.length})
${stats.storiesWithoutEntities.length === 0 ? '_None. All public stories are linked to entities._' : stats.storiesWithoutEntities.map((s) => `- \`${s}\``).join('\n')}

### B. Unresolved entity references (${stats.unresolvedEntityReferences.length})
${stats.unresolvedEntityReferences.length === 0 ? '_None. Every referenced entity ID/slug resolves in the index or store._' : stats.unresolvedEntityReferences.map((u) => `- Story \`${u.storySlug}\` references missing entity \`${u.entityRef}\``).join('\n')}

### C. Orphan entities (${stats.orphanEntities.length})
${stats.orphanEntities.length === 0 ? '_None. Every entity has active story coverage._' : stats.orphanEntities.map((e) => `- \`${e}\``).join('\n')}

### D. Unsafe / Malformed Source URLs (${stats.unsafeSourceUrls.length})
${stats.unsafeSourceUrls.length === 0 ? '_None. All source URLs pass protocol and host safety assertions._' : stats.unsafeSourceUrls.map((u) => `- Story \`${u.storySlug}\`: \`${u.url}\``).join('\n')}
`;

const outputPath = path.resolve(__dirname, '../docs/aeo-geo/entity-graph-audit.md');
fs.writeFileSync(outputPath, markdown, 'utf-8');
console.log(`✅ [audit-entity-graph] Report written to ${outputPath}`);
console.log(`Summary: ${stats.totalStories} stories, ${stats.totalEntities} entities, ${stats.orphanEntities.length} orphan entities, ${stats.unresolvedEntityReferences.length} unresolved entity refs.`);

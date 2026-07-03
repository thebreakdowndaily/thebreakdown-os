/**
 * World Bank Plugin — World Bank India Tracker
 *
 * Monitors World Bank-funded projects in India, loan agreements,
 * economic reports, and key development indicators.
 */

import type { PluginManifest, PluginImplementation, PluginOutput, PluginItem } from '../sdk/types';
import { buildPluginOutput, parseRSS, pluginFetch } from '../sdk/loader';

interface WBProject {
  id: string;
  project_name: string;
  project_abstract: string;
  country_name: string;
  region_name: string;
  sector_name: string[];
  total_commitment: number;
  project_status: string;
  approval_date: string;
  borrower: string;
  implementing_agency: string[];
  env_category: string;
  url: string;
}

export function createPlugin(manifest: PluginManifest): PluginImplementation {
  return {
    manifest,

    async fetch(): Promise<PluginOutput> {
      const start = Date.now();
      const allItems: PluginItem[] = [];
      let lastError: string | undefined;

      // Fetch active projects for India
      try {
        const projectsUrl = `https://api.worldbank.org/v2/country/IN/projects?format=json&status=Active`;
        const data = await pluginFetch<any[]>({
          url: projectsUrl,
          method: 'GET',
          timeout: 30000,
          retries: 2,
        });

        // World Bank API returns [metadata, projects[]]
        const projects: WBProject[] = Array.isArray(data) && data.length > 1 ? data[1] : [];

        for (const proj of projects.slice(0, 50)) {
          allItems.push({
            id: `wb-project-${proj.id}`,
            title: proj.project_name,
            summary: proj.project_abstract?.slice(0, 500) || 'World Bank project in India',
            url: `https://projects.worldbank.org/en/projects-operations/project-detail/${proj.id}`,
            publishedAt: new Date(proj.approval_date).toISOString(),
            source: 'World Bank',
            category: proj.sector_name?.[0] || 'development',
            tags: [
              'world-bank',
              'project',
              proj.project_status?.toLowerCase() || 'active',
              ...(proj.sector_name || []).map((s) => s.toLowerCase().replace(/\s+/g, '-')),
            ],
            trust_tier: 1,
            metadata: {
              projectId: proj.id,
              region: proj.region_name,
              commitmentAmount: proj.total_commitment,
              status: proj.project_status?.toLowerCase(),
              approvalDate: proj.approval_date,
              environmentalCategory: proj.env_category,
              borrower: proj.borrower,
              implementingAgency: proj.implementing_agency,
              sectors: proj.sector_name,
            },
          });
        }
      } catch (err: any) {
        lastError = err.message;
        console.warn(`[WorldBank Plugin] Error fetching projects:`, err.message);
      }

      // Also fetch India news from World Bank RSS
      try {
        const rssSource = manifest.sources.find((s) => s.type === 'rss');
        if (rssSource) {
          const xml = await pluginFetch<string>({
            url: rssSource.url,
            method: 'GET',
            parser: 'text',
            timeout: 15000,
          });

          const rssItems = parseRSS(xml);
          for (const rss of rssItems) {
            if (rss.title.toLowerCase().includes('india')) {
              allItems.push({
                id: rss.guid || rss.link,
                title: rss.title,
                summary: rss.description.replace(/<[^>]*>/g, '').slice(0, 500),
                url: rss.link,
                publishedAt: new Date(rss.pubDate).toISOString(),
                source: 'World Bank',
                category: 'world-bank-news',
                tags: ['world-bank', 'news', 'india', 'south-asia'],
                trust_tier: 1,
              });
            }
          }
        }
      } catch (err: any) {
        console.warn(`[WorldBank Plugin] Error fetching RSS:`, err.message);
      }

      return buildPluginOutput(
        manifest.id,
        manifest.version,
        allItems,
        'World Bank API + RSS',
        allItems.length > 0 ? 'success' : lastError ? 'error' : 'no_data',
        lastError,
        Date.now() - start
      );
    },
  };
}

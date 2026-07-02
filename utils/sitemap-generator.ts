/**
 * THE BREAKDOWN — Sitemap Generator
 *
 * Generates XML sitemaps, sitemap indexes, and robots.txt.
 */

export const SITEMAP_CONFIG = {
  changefreq: {
    homepage: 'hourly' as const,
    story: 'weekly' as const,
    entity: 'weekly' as const,
    topic: 'daily' as const,
    static: 'monthly' as const,
  },
  priority: {
    homepage: 1.0,
    story: 0.9,
    entity: 0.8,
    topic: 0.7,
    static: 0.5,
  },
};

export function generateSitemap(
  pages: Array<{
    url: string;
    lastModified: string;
    changeFreq?: string;
    priority?: number;
  }>
): string {
  const urls = pages
    .map((page) => {
      const freq = page.changeFreq || 'weekly';
      const pri = page.priority !== undefined ? page.priority : 0.5;
      return `  <url>
    <loc>${escapeXml(page.url)}</loc>
    <lastmod>${formatDate(page.lastModified)}</lastmod>
    <changefreq>${freq}</changefreq>
    <priority>${pri.toFixed(1)}</priority>
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

export function generateSitemapIndex(
  sitemaps: Array<{ url: string; lastModified: string }>
): string {
  const items = sitemaps
    .map(
      (s) => `  <sitemap>
    <loc>${escapeXml(s.url)}</loc>
    <lastmod>${formatDate(s.lastModified)}</lastmod>
  </sitemap>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items}
</sitemapindex>`;
}

export function generateRobotsTxt(sitemapUrl: string): string {
  return `User-agent: *
Allow: /

Sitemap: ${sitemapUrl}
`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toISOString().split('T')[0];
}

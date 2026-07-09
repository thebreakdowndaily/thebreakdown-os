const fs = require('fs');
const path = require('path');

const siteUrl = 'https://thebreakdown.in';

// Keep in sync with all stories, entities, topics, and fixes in utils/data-layer/store.ts
const stories = [
  { slug: 'mgnrega-reform', updatedAt: '2026-06-22T10:00:00Z' },
  { slug: 'digital-payments-boom', updatedAt: '2026-06-20T08:30:00Z' },
  { slug: 'pm-fasal-bima-claims', updatedAt: '2026-06-18T12:00:00Z' },
  { slug: 'supply-chain-shift', updatedAt: '2026-06-25T09:00:00Z' },
  { slug: 'semiconductor-pli', updatedAt: '2026-06-24T14:00:00Z' },
  { slug: 'state-budget-analysis', updatedAt: '2026-06-23T11:00:00Z' },
  { slug: 'federalism-trends', updatedAt: '2026-06-21T10:00:00Z' },
  { slug: 'direct-benefit-transfers', updatedAt: '2026-06-19T09:30:00Z' },
  { slug: 'cag-reports', updatedAt: '2026-06-17T08:00:00Z' },
  { slug: 'manufacturing-pmi', updatedAt: '2026-06-16T07:00:00Z' },
  { slug: 'startup-india', updatedAt: '2026-06-15T06:00:00Z' },
  { slug: 'export-trends', updatedAt: '2026-06-14T05:00:00Z' },
  { slug: 'food-inflation', updatedAt: '2026-06-13T04:00:00Z' },
  { slug: 'gst-collection', updatedAt: '2026-06-12T03:00:00Z' },
  { slug: 'employment-data', updatedAt: '2026-06-11T02:00:00Z' },
  { slug: 'india-us-relations', updatedAt: '2026-07-01T10:00:00Z' },
  { slug: 'india-indonesia-relations', updatedAt: '2026-07-01T10:00:00Z' },
  { slug: 'india-china-relations', updatedAt: '2026-07-01T10:00:00Z' },
  { slug: 'india-europe-relations', updatedAt: '2026-07-01T10:00:00Z' },
  { slug: 'india-uk-relations', updatedAt: '2026-07-01T10:00:00Z' },
  { slug: 'india-russia-relations', updatedAt: '2026-07-01T10:00:00Z' },
  { slug: 'us-iran-relations', updatedAt: '2026-07-18T06:00:00Z' },
  { slug: 'indian-education-crisis', updatedAt: '2026-07-22T06:00:00Z' },
  { slug: 'income-inequality-india', updatedAt: '2026-07-25T06:00:00Z' },
  { slug: 'india-china-border-tensions', updatedAt: '2026-07-30T06:00:00Z' },
  { slug: 'indias-foreign-policy', updatedAt: '2026-08-05T06:00:00Z' },
  { slug: '81-crore-data-breach', updatedAt: '2026-07-09T08:00:00Z' },
  { slug: 'bjp-mission-360', updatedAt: '2026-07-10T08:00:00Z' },
  { slug: 'electoral-bonds', updatedAt: '2026-08-14T06:00:00Z' },
];

const entities = [
  { slug: 'ministry-of-rural-development', updatedAt: '2026-06-01T00:00:00Z' },
  { slug: 'ministry-of-agriculture', updatedAt: '2026-06-01T00:00:00Z' },
  { slug: 'rbi', updatedAt: '2026-06-01T00:00:00Z' },
  { slug: 'npci', updatedAt: '2026-06-01T00:00:00Z' },
  { slug: 'cag', updatedAt: '2026-06-01T00:00:00Z' },
  { slug: 'icmr', updatedAt: '2026-07-09T08:00:00Z' },
  { slug: 'cert-in', updatedAt: '2026-07-09T08:00:00Z' },
  { slug: 'uidai', updatedAt: '2026-07-09T08:00:00Z' },
  { slug: 'resecurity', updatedAt: '2026-07-09T08:00:00Z' },
  { slug: 'un', updatedAt: '2026-07-01T00:00:00Z' },
  { slug: 'wto', updatedAt: '2026-07-01T00:00:00Z' },
  { slug: 'imf', updatedAt: '2026-07-01T00:00:00Z' },
  { slug: 'world-bank', updatedAt: '2026-07-01T00:00:00Z' },
  { slug: 'who', updatedAt: '2026-07-01T00:00:00Z' },
  { slug: 'ilo', updatedAt: '2026-07-01T00:00:00Z' },
  { slug: 'brics', updatedAt: '2026-07-01T00:00:00Z' },
  { slug: 'sco', updatedAt: '2026-07-01T00:00:00Z' },
  { slug: 'g20', updatedAt: '2026-07-01T00:00:00Z' },
  { slug: 'saarc', updatedAt: '2026-07-01T00:00:00Z' },
  { slug: 'commonwealth', updatedAt: '2026-07-01T00:00:00Z' },
  { slug: 'adb', updatedAt: '2026-07-01T00:00:00Z' },
  { slug: 'aiib', updatedAt: '2026-07-01T00:00:00Z' },
  { slug: 'bimstec', updatedAt: '2026-07-01T00:00:00Z' },
  { slug: 'quad', updatedAt: '2026-07-01T00:00:00Z' },
  { slug: 'isa', updatedAt: '2026-07-01T00:00:00Z' },
  { slug: 'fatf', updatedAt: '2026-07-01T00:00:00Z' },
  { slug: 'nam', updatedAt: '2026-07-01T00:00:00Z' },
  { slug: 'g77', updatedAt: '2026-07-01T00:00:00Z' },
  { slug: 'iora', updatedAt: '2026-07-01T00:00:00Z' },
  { slug: 'cdri', updatedAt: '2026-07-01T00:00:00Z' },
  { slug: 'india', updatedAt: '2026-06-01T00:00:00Z' },
  { slug: 'bihar', updatedAt: '2026-06-01T00:00:00Z' },
];

const topics = [
  { slug: 'economy', updatedAt: '2026-06-01T00:00:00Z' },
  { slug: 'technology', updatedAt: '2026-06-01T00:00:00Z' },
  { slug: 'policy', updatedAt: '2026-06-01T00:00:00Z' },
  { slug: 'agriculture', updatedAt: '2026-06-01T00:00:00Z' },
  { slug: 'employment', updatedAt: '2026-06-01T00:00:00Z' },
  { slug: 'digital-payments', updatedAt: '2026-06-01T00:00:00Z' },
  { slug: 'geopolitics', updatedAt: '2026-07-01T00:00:00Z' },
  { slug: 'health', updatedAt: '2026-06-01T00:00:00Z' },
  { slug: 'education', updatedAt: '2026-06-01T00:00:00Z' },
  { slug: 'infrastructure', updatedAt: '2026-06-01T00:00:00Z' },
  { slug: 'defence', updatedAt: '2026-06-01T00:00:00Z' },
  { slug: 'climate', updatedAt: '2026-06-01T00:00:00Z' },
  { slug: 'cybersecurity', updatedAt: '2026-07-09T08:00:00Z' },
];

const fixes = [
  { slug: 'fix-mgnrega-reform', updatedAt: '2026-06-01T00:00:00Z' },
  { slug: 'fix-pmfby-claims', updatedAt: '2026-06-01T00:00:00Z' },
  { slug: 'fix-air-pollution', updatedAt: '2026-06-01T00:00:00Z' },
  { slug: 'fix-npa-crisis', updatedAt: '2026-06-01T00:00:00Z' },
  { slug: 'fix-employment-data', updatedAt: '2026-06-01T00:00:00Z' },
  { slug: 'fix-water-scarcity', updatedAt: '2026-06-01T00:00:00Z' },
];

const staticPages = [
  { url: siteUrl, lastmod: '2026-07-10', changefreq: 'daily', priority: '1.0' },
  { url: `${siteUrl}/stories`, lastmod: '2026-07-10', changefreq: 'daily', priority: '0.8' },
  { url: `${siteUrl}/topics`, lastmod: '2026-07-10', changefreq: 'weekly', priority: '0.6' },
  { url: `${siteUrl}/entities`, lastmod: '2026-07-10', changefreq: 'weekly', priority: '0.6' },
  { url: `${siteUrl}/organizations`, lastmod: '2026-07-10', changefreq: 'weekly', priority: '0.5' },
  { url: `${siteUrl}/countries`, lastmod: '2026-07-10', changefreq: 'weekly', priority: '0.5' },
  { url: `${siteUrl}/data`, lastmod: '2026-07-10', changefreq: 'weekly', priority: '0.6' },
  { url: `${siteUrl}/investigations`, lastmod: '2026-07-10', changefreq: 'daily', priority: '0.8' },
  { url: `${siteUrl}/fix`, lastmod: '2026-07-10', changefreq: 'weekly', priority: '0.7' },
  { url: `${siteUrl}/timeline`, lastmod: '2026-07-10', changefreq: 'weekly', priority: '0.4' },
  { url: `${siteUrl}/newsletter`, lastmod: '2026-07-10', changefreq: 'weekly', priority: '0.4' },
  { url: `${siteUrl}/about`, lastmod: '2026-07-10', changefreq: 'monthly', priority: '0.4' },
  { url: `${siteUrl}/about/contact`, lastmod: '2026-07-10', changefreq: 'monthly', priority: '0.3' },
  { url: `${siteUrl}/about/methodology`, lastmod: '2026-07-10', changefreq: 'monthly', priority: '0.3' },
  { url: `${siteUrl}/about/team`, lastmod: '2026-07-10', changefreq: 'monthly', priority: '0.3' },
  { url: `${siteUrl}/graph`, lastmod: '2026-07-10', changefreq: 'weekly', priority: '0.3' },
  { url: `${siteUrl}/workspace`, lastmod: '2026-07-10', changefreq: 'weekly', priority: '0.3' },
];

const countries = [
  { slug: 'india', updatedAt: '2026-06-01T00:00:00Z' },
  { slug: 'bihar', updatedAt: '2026-06-01T00:00:00Z' },
];

const organizations = [
  { slug: 'ministry-of-rural-development', updatedAt: '2026-06-01T00:00:00Z' },
  { slug: 'ministry-of-agriculture', updatedAt: '2026-06-01T00:00:00Z' },
  { slug: 'rbi', updatedAt: '2026-06-01T00:00:00Z' },
  { slug: 'npci', updatedAt: '2026-06-01T00:00:00Z' },
  { slug: 'cag', updatedAt: '2026-06-01T00:00:00Z' },
  { slug: 'icmr', updatedAt: '2026-07-09T08:00:00Z' },
  { slug: 'cert-in', updatedAt: '2026-07-09T08:00:00Z' },
  { slug: 'uidai', updatedAt: '2026-07-09T08:00:00Z' },
  { slug: 'resecurity', updatedAt: '2026-07-09T08:00:00Z' },
];

const datasets = [
  { slug: 'gdp-growth', updatedAt: '2026-06-01T00:00:00Z' },
  { slug: 'inflation-cpi', updatedAt: '2026-06-01T00:00:00Z' },
  { slug: 'trade-deficit', updatedAt: '2026-06-01T00:00:00Z' },
  { slug: 'fiscal-deficit', updatedAt: '2026-06-01T00:00:00Z' },
  { slug: 'employment-rate', updatedAt: '2026-06-01T00:00:00Z' },
];

const urls = [
  ...staticPages,
  ...stories.map(s => ({ url: `${siteUrl}/story/${s.slug}`, lastmod: s.updatedAt, changefreq: 'daily', priority: '0.9' })),
  ...entities.map(e => ({ url: `${siteUrl}/entity/${e.slug}`, lastmod: e.updatedAt, changefreq: 'weekly', priority: '0.7' })),
  ...topics.map(t => ({ url: `${siteUrl}/topic/${t.slug}`, lastmod: t.updatedAt, changefreq: 'weekly', priority: '0.8' })),
  ...fixes.map(f => ({ url: `${siteUrl}/fix/${f.slug}`, lastmod: f.updatedAt, changefreq: 'weekly', priority: '0.8' })),
  ...countries.map(c => ({ url: `${siteUrl}/country/${c.slug}`, lastmod: c.updatedAt, changefreq: 'weekly', priority: '0.5' })),
  ...organizations.map(o => ({ url: `${siteUrl}/organization/${o.slug}`, lastmod: o.updatedAt, changefreq: 'weekly', priority: '0.5' })),
  ...datasets.map(d => ({ url: `${siteUrl}/dataset/${d.slug}`, lastmod: d.updatedAt, changefreq: 'weekly', priority: '0.6' })),
  ...datasets.map(d => ({ url: `${siteUrl}/datasets/${d.slug}`, lastmod: d.updatedAt, changefreq: 'weekly', priority: '0.6' })),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.url}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

const outPath = path.resolve(__dirname, '..', 'public', 'sitemap.xml');
fs.writeFileSync(outPath, xml, 'utf-8');
console.log(`Generated sitemap.xml with ${urls.length} URLs → public/sitemap.xml`);

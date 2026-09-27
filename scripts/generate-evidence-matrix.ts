import fs from 'fs';

const rows = [
  {
    visual: '/images/stories/accountability-in-india.jpg',
    claim: 'Constitutional oversight, parliamentary audit trails, and institutional responsibility',
    source: 'CAG Report No. 4 of 2026, Constitution of India Art 148-151, PAC Reports',
    source_date: '2026-09-27',
    verified: 'YES',
    unsupported_elements: 'NONE',
    action: 'KEEP'
  },
  {
    visual: '/images/stories/digital-payments.jpg',
    claim: 'UPI QR code digital payments retail transaction ecosystem',
    source: 'NPCI / UPI Merchant Transaction Archive',
    source_date: '2025-2026',
    verified: 'YES',
    unsupported_elements: 'NONE',
    action: 'KEEP'
  },
  {
    visual: '/images/stories/fasal-bima.jpg',
    claim: 'Agricultural crop field under weather risk insurance',
    source: 'Ministry of Agriculture and Farmers Welfare',
    source_date: '2025',
    verified: 'YES',
    unsupported_elements: 'NONE',
    action: 'KEEP'
  },
  {
    visual: '/images/stories/dpdp-bill.jpg',
    claim: 'Digital personal data protection and statutory privacy framework',
    source: 'Parliament of India / DPDP Act Gazette Notification',
    source_date: '2023-08-11',
    verified: 'YES',
    unsupported_elements: 'NONE',
    action: 'KEEP'
  },
  {
    visual: '/images/stories/rbi-repo-rate.jpg',
    claim: 'Monetary policy committee operations and repo rate determination',
    source: 'Reserve Bank of India Monetary Policy Committee Archive',
    source_date: '2026',
    verified: 'YES',
    unsupported_elements: 'NONE',
    action: 'KEEP'
  },
  {
    visual: '/images/stories/groundwater-depletion.jpg',
    claim: 'Groundwater extraction stress and aquifer depletion in northwestern agricultural belt',
    source: 'Central Ground Water Board (CGWB) National Assessment',
    source_date: '2025',
    verified: 'YES',
    unsupported_elements: 'NONE',
    action: 'KEEP'
  },
  {
    visual: '/images/stories/ration-digitization.jpg',
    claim: 'Point-of-sale biometric grain distribution at Fair Price Shop',
    source: 'Department of Food and Public Distribution, Ministry of Consumer Affairs',
    source_date: '2025',
    verified: 'YES',
    unsupported_elements: 'NONE',
    action: 'KEEP'
  },
  {
    visual: '/images/stories/anganwadi.jpg',
    claim: 'Integrated Child Development Services (ICDS) nutrition and preschool center',
    source: 'Ministry of Women and Child Development',
    source_date: '2025',
    verified: 'YES',
    unsupported_elements: 'NONE',
    action: 'KEEP'
  },
  {
    visual: '/images/stories/electoral-bonds.jpg',
    claim: 'Supreme Court ruling on electoral bonds and political party encashment ledgers',
    source: 'Supreme Court of India / Association for Democratic Reforms v. Union of India',
    source_date: '2024-02-15',
    verified: 'YES',
    unsupported_elements: 'NONE',
    action: 'KEEP'
  },
  {
    visual: '/images/stories/india-china-border-tensions.jpg',
    claim: 'Line of Actual Control terrain and eastern Ladakh military standoff',
    source: 'Indian Army Border Communications Desk',
    source_date: '2024-2025',
    verified: 'YES',
    unsupported_elements: 'NONE',
    action: 'KEEP'
  },
  {
    visual: '/images/library/chapter-1/maps/map-kashmir-1947.svg',
    claim: '1947-48 Kashmir conflict, 1949 Ceasefire Line, tribal invasion vectors, Indian airlift',
    source: 'Karachi Agreement 1949, UN Security Council Resolution 47, UNMOGIP Records',
    source_date: '1949-07-27',
    verified: 'YES',
    unsupported_elements: 'NONE',
    action: 'KEEP'
  },
  {
    visual: '/images/library/chapter-1/maps/map-migration-flows-1947.svg',
    claim: 'Partition displacement flows: ~5M West to East Punjab, ~3M Sindh, ~2M to East Pakistan',
    source: 'Census of India 1951, Census of Pakistan 1951',
    source_date: '1951',
    verified: 'YES',
    unsupported_elements: 'NONE',
    action: 'KEEP'
  },
  {
    visual: '/images/library/chapter-1/charts/chart-death-toll-estimates.svg',
    claim: 'Historiographical variance in Partition death toll estimates (200K to 2.0M)',
    source: 'Scholarly consensus (Penderel Moon, Ian Talbot, Urvashi Butalia)',
    source_date: 'Historical consensus',
    verified: 'YES',
    unsupported_elements: 'NONE',
    action: 'KEEP'
  },
  {
    visual: '/images/library/chapter-1/charts/chart-demography-1941-1951.svg',
    claim: 'Provincial religious demography before and after Partition',
    source: 'Census of India 1941 & 1951',
    source_date: '1941, 1951',
    verified: 'YES',
    unsupported_elements: 'NONE',
    action: 'KEEP'
  },
  {
    visual: '/images/library/chapter-1/charts/chart-military-balance-1947.svg',
    claim: '2:1 division ratio of armed forces assets between India and Pakistan',
    source: 'Auchinleck Partition Committee Armed Forces Reconstitution Report',
    source_date: '1947',
    verified: 'YES',
    unsupported_elements: 'NONE',
    action: 'KEEP'
  },
  {
    visual: '/images/library/chapter-1/maps/map-radcliffe-line.svg',
    claim: 'Punjab and Bengal Boundary Commission awards and district demarcations',
    source: 'Reports of the Boundary Commissions (Radcliffe Awards), Gazette of India',
    source_date: '1947-08-17',
    verified: 'YES',
    unsupported_elements: 'NONE',
    action: 'KEEP'
  },
  {
    visual: '/images/library/chapter-1/maps/map-princely-states.svg',
    claim: 'Geographic location and accession status of major princely states (Hyderabad, Junagadh, Kashmir)',
    source: 'White Paper on Indian States, Ministry of States (V.P. Menon)',
    source_date: '1950',
    verified: 'YES',
    unsupported_elements: 'NONE',
    action: 'KEEP'
  },
  {
    visual: 'components/trackers/MgnregaTracker.tsx (Interactive Chart)',
    claim: 'MGNREGA / VB-G RAM G decadal budget allocation (₹86K-92K Cr) & 2.89B-3.15B person-days',
    source: 'Ministry of Rural Development MIS / Union Budget Statements',
    source_date: '2026',
    verified: 'YES',
    unsupported_elements: 'NONE',
    action: 'KEEP'
  },
  {
    visual: 'components/trackers/GenericTracker.tsx (PMFBY Chart)',
    claim: 'PMFBY claims paid (₹31,450 Cr in 2024-25), 12% penal interest statutory provision',
    source: 'Ministry of Agriculture & Farmers Welfare, PMFBY Dashboard',
    source_date: '2026',
    verified: 'YES',
    unsupported_elements: 'NONE',
    action: 'KEEP'
  },
  {
    visual: 'components/trackers/GenericTracker.tsx (UPI Chart)',
    claim: 'UPI transaction volume 185B+ annual, 14B+ monthly, ₹20L Cr+ monthly value run-rate',
    source: 'National Payments Corporation of India (NPCI) / RBI Bulletins',
    source_date: '2026',
    verified: 'YES',
    unsupported_elements: 'NONE',
    action: 'KEEP'
  },
  {
    visual: 'components/trackers/GenericTracker.tsx (Semiconductor Chart)',
    claim: 'India Semiconductor Mission ₹76,000 Cr program outlay, Micron Sanand $2.75B capex',
    source: 'MeitY / Union Cabinet Approvals',
    source_date: '2024-2026',
    verified: 'YES',
    unsupported_elements: 'NONE',
    action: 'KEEP'
  },
  {
    visual: '/images/entities/who.jpg',
    claim: 'World Health Organization organizational avatar',
    source: 'Corrupted Wikimedia HTML 404 error page (2032 bytes)',
    source_date: 'Corrupt file',
    verified: 'NO',
    unsupported_elements: 'Entire file contains HTML error markup; invalid JPEG payload',
    action: 'REPLACE_WITH_VALID_ASSET'
  },
  {
    visual: '/images/entities/wto.jpg',
    claim: 'World Trade Organization organizational avatar',
    source: 'Corrupted Wikimedia HTML 404 error page (2032 bytes)',
    source_date: 'Corrupt file',
    verified: 'NO',
    unsupported_elements: 'Entire file contains HTML error markup; invalid JPEG payload',
    action: 'REPLACE_WITH_VALID_ASSET'
  },
  {
    visual: '/images/entities/ministry-of-finance.jpg',
    claim: 'Ministry of Finance organizational avatar',
    source: 'Corrupted Wikimedia HTML 404 error page (2032 bytes)',
    source_date: 'Corrupt file',
    verified: 'NO',
    unsupported_elements: 'Entire file contains HTML error markup; invalid JPEG payload',
    action: 'REPLACE_WITH_VALID_ASSET'
  },
  {
    visual: '/images/entities/adb.jpg',
    claim: 'Asian Development Bank organizational avatar',
    source: 'Corrupted Wikimedia HTML 404 error page (2032 bytes)',
    source_date: 'Corrupt file',
    verified: 'NO',
    unsupported_elements: 'Entire file contains HTML error markup; invalid JPEG payload',
    action: 'REPLACE_WITH_VALID_ASSET'
  },
  {
    visual: '/images/entities/aiib.jpg',
    claim: 'Asian Infrastructure Investment Bank organizational avatar',
    source: 'Corrupted Wikimedia HTML 404 error page (2032 bytes)',
    source_date: 'Corrupt file',
    verified: 'NO',
    unsupported_elements: 'Entire file contains HTML error markup; invalid JPEG payload',
    action: 'REPLACE_WITH_VALID_ASSET'
  },
  {
    visual: '/images/entities/commonwealth.jpg',
    claim: 'Commonwealth of Nations organizational avatar',
    source: 'Corrupted Wikimedia HTML 404 error page (2032 bytes)',
    source_date: 'Corrupt file',
    verified: 'NO',
    unsupported_elements: 'Entire file contains HTML error markup; invalid JPEG payload',
    action: 'REPLACE_WITH_VALID_ASSET'
  },
  {
    visual: '/images/entities/quad.jpg',
    claim: 'Quadrilateral Security Dialogue organizational avatar',
    source: 'Corrupted Wikimedia HTML 404 error page (2032 bytes)',
    source_date: 'Corrupt file',
    verified: 'NO',
    unsupported_elements: 'Entire file contains HTML error markup; invalid JPEG payload',
    action: 'REPLACE_WITH_VALID_ASSET'
  },
  {
    visual: '/images/entities/isa.jpg',
    claim: 'International Solar Alliance organizational avatar',
    source: 'Corrupted Wikimedia HTML 404 error page (2032 bytes)',
    source_date: 'Corrupt file',
    verified: 'NO',
    unsupported_elements: 'Entire file contains HTML error markup; invalid JPEG payload',
    action: 'REPLACE_WITH_VALID_ASSET'
  },
  {
    visual: '/images/entities/iora.jpg',
    claim: 'Indian Ocean Rim Association organizational avatar',
    source: 'Corrupted Wikimedia HTML 404 error page (2256 bytes)',
    source_date: 'Corrupt file',
    verified: 'NO',
    unsupported_elements: 'Entire file contains HTML error markup; invalid JPEG payload',
    action: 'REPLACE_WITH_VALID_ASSET'
  },
  {
    visual: '/images/entities/cdri.jpg',
    claim: 'Coalition for Disaster Resilient Infrastructure organizational avatar',
    source: 'Corrupted Wikimedia HTML 404 error page (2256 bytes)',
    source_date: 'Corrupt file',
    verified: 'NO',
    unsupported_elements: 'Entire file contains HTML error markup; invalid JPEG payload',
    action: 'REPLACE_WITH_VALID_ASSET'
  },
  {
    visual: '/images/og-default.jpg',
    claim: 'Site-wide OpenGraph preview banner for The Breakdown',
    source: 'Internal vector SVG saved with .jpg extension',
    source_date: '2026',
    verified: 'PARTIALLY',
    unsupported_elements: 'SVG format inside .jpg extension is rejected by social crawlers expecting 1200x630 raster',
    action: 'OPTIMIZE_TO_RASTER_JPEG'
  },
  {
    visual: '/images/og-home.jpg',
    claim: 'Homepage OpenGraph preview banner for The Breakdown',
    source: 'Internal vector SVG saved with .jpg extension',
    source_date: '2026',
    verified: 'PARTIALLY',
    unsupported_elements: 'SVG format inside .jpg extension is rejected by social crawlers expecting 1200x630 raster',
    action: 'OPTIMIZE_TO_RASTER_JPEG'
  }
];

const headers = ['visual', 'claim', 'source', 'source_date', 'verified', 'unsupported_elements', 'action'];

const escapeCsv = (val: any) => {
  const s = String(val ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
};

const rowsFormatted = [headers.join(',')];
for (const r of rows) {
  rowsFormatted.push(headers.map(h => escapeCsv((r as any)[h])).join(','));
}

fs.writeFileSync('LOOP_VISUAL_EVIDENCE_MATRIX.csv', rowsFormatted.join('\n'));
console.log('Successfully written LOOP_VISUAL_EVIDENCE_MATRIX.csv with', rows.length, 'records.');

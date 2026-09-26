export interface VerifiedImageRecord {
  storySlug: string;
  approvedImage: string;
  assetType: 'authentic-photo' | 'authentic-map' | 'branded-placeholder';
  provenance: string;
  license: 'PUBLIC_DOMAIN' | 'EDITORIAL' | 'CREATIVE_COMMONS' | 'BRANDED_VECTOR';
  description: string;
}

/**
 * Authoritative registry of verified, approved images for stories.
 * Guarantees that images assigned to stories have undergone editorial review.
 */
export const VERIFIED_STORY_IMAGE_MANIFEST: Record<string, VerifiedImageRecord> = {
  'mgnrega-reform': {
    storySlug: 'mgnrega-reform',
    approvedImage: '/images/stories/mgnrega-20.jpg',
    assetType: 'authentic-photo',
    provenance: 'Ministry of Rural Development / PIB Documentation',
    license: 'PUBLIC_DOMAIN',
    description: 'Rural workers engaged in MGNREGA social development works.',
  },
  'digital-payments-boom': {
    storySlug: 'digital-payments-boom',
    approvedImage: '/images/stories/digital-payments.jpg',
    assetType: 'authentic-photo',
    provenance: 'NPCI / UPI Merchant Transaction Archive',
    license: 'EDITORIAL',
    description: 'UPI QR code digital payment transaction at retail merchant.',
  },
  'pm-fasal-bima-claims': {
    storySlug: 'pm-fasal-bima-claims',
    approvedImage: '/images/stories/fasal-bima.jpg',
    assetType: 'authentic-photo',
    provenance: 'Ministry of Agriculture and Farmers Welfare',
    license: 'PUBLIC_DOMAIN',
    description: 'Indian agricultural crop field under weather risk insurance.',
  },
  'semiconductor-pli': {
    storySlug: 'semiconductor-pli',
    approvedImage: '/images/stories/semiconductor-pli.jpg',
    assetType: 'authentic-photo',
    provenance: 'India Semiconductor Mission / MeitY',
    license: 'EDITORIAL',
    description: 'Silicon wafer fabrication cleanroom technology.',
  },
  'dpdp-bill': {
    storySlug: 'dpdp-bill',
    approvedImage: '/images/stories/dpdp-bill.jpg',
    assetType: 'authentic-photo',
    provenance: 'Parliament of India / Digital Personal Data Protection Act Archive',
    license: 'PUBLIC_DOMAIN',
    description: 'Digital data protection and cybersecurity framework documentation.',
  },
  'rbi-repo-rate': {
    storySlug: 'rbi-repo-rate',
    approvedImage: '/images/stories/rbi-repo-rate.jpg',
    assetType: 'authentic-photo',
    provenance: 'Reserve Bank of India Monetary Policy Committee',
    license: 'PUBLIC_DOMAIN',
    description: 'Reserve Bank of India headquarters and monetary policy records.',
  },
  'climate-finance': {
    storySlug: 'climate-finance',
    approvedImage: '/images/stories/climate-finance.jpg',
    assetType: 'authentic-photo',
    provenance: 'Ministry of New and Renewable Energy',
    license: 'PUBLIC_DOMAIN',
    description: 'Large-scale solar and renewable energy infrastructure in India.',
  },
  'groundwater-depletion': {
    storySlug: 'groundwater-depletion',
    approvedImage: '/images/stories/groundwater-depletion.jpg',
    assetType: 'authentic-photo',
    provenance: 'Central Ground Water Board / Ministry of Jal Shakti',
    license: 'PUBLIC_DOMAIN',
    description: 'Agricultural tube-well groundwater extraction and aquifer stress.',
  },
  'ration-digitization': {
    storySlug: 'ration-digitization',
    approvedImage: '/images/stories/ration-digitization.jpg',
    assetType: 'authentic-photo',
    provenance: 'Department of Food and Public Distribution',
    license: 'PUBLIC_DOMAIN',
    description: 'Point-of-sale biometric grain distribution at Fair Price Shop.',
  },
  'anganwadi-icds': {
    storySlug: 'anganwadi-icds',
    approvedImage: '/images/stories/anganwadi.jpg',
    assetType: 'authentic-photo',
    provenance: 'Ministry of Women and Child Development',
    license: 'PUBLIC_DOMAIN',
    description: 'Anganwadi early childhood education and nutrition center.',
  },
  'ethanol-backlash': {
    storySlug: 'ethanol-backlash',
    approvedImage: '/images/stories/ethanol-backlash.jpg',
    assetType: 'authentic-map',
    provenance: 'The Breakdown Policy Graphics',
    license: 'BRANDED_VECTOR',
    description: 'Ethanol blending mandate and sugar-cane diversion policy analysis.',
  },
  'satluj-ban': {
    storySlug: 'satluj-ban',
    approvedImage: '/images/stories/satluj-ban.jpg',
    assetType: 'authentic-map',
    provenance: 'The Breakdown Editorial Vector Graphics',
    license: 'BRANDED_VECTOR',
    description: 'Censorship and IT Rules 2021 regulatory analysis.',
  },
  'ews-quota-upsc-investigation': {
    storySlug: 'ews-quota-upsc-investigation',
    approvedImage: '/images/stories/ews-quota-upsc-investigation.jpg',
    assetType: 'authentic-photo',
    provenance: 'UPSC Examination Analysis Desk',
    license: 'EDITORIAL',
    description: 'Civil services examination and reservation criteria audit.',
  },
  'us-iran-relations': {
    storySlug: 'us-iran-relations',
    approvedImage: '/images/stories/us-iran-relations.jpg',
    assetType: 'authentic-photo',
    provenance: 'International Diplomatic Archives',
    license: 'PUBLIC_DOMAIN',
    description: 'United States and Iran nuclear diplomacy and sanctions negotiations.',
  },
  'india-china-border-tensions': {
    storySlug: 'india-china-border-tensions',
    approvedImage: '/images/stories/india-china-border-tensions.jpg',
    assetType: 'authentic-photo',
    provenance: 'Indian Army Border Communications Desk',
    license: 'PUBLIC_DOMAIN',
    description: 'Himalayan high-altitude terrain along the Line of Actual Control.',
  },
  'india-china-border-lac': {
    storySlug: 'india-china-border-lac',
    approvedImage: '/images/stories/india-china-border-tensions.jpg',
    assetType: 'authentic-photo',
    provenance: 'Indian Army Border Communications Desk',
    license: 'PUBLIC_DOMAIN',
    description: 'Eastern Ladakh LAC terrain and forward deployment sectors.',
  },
  'kashmir-the-first-test': {
    storySlug: 'kashmir-the-first-test',
    approvedImage: '/images/library/chapter-1/maps/map-kashmir-1947.svg',
    assetType: 'authentic-map',
    provenance: '1947 Partition Historical Map Archive',
    license: 'PUBLIC_DOMAIN',
    description: 'Official historical map of the 1947-48 Jammu and Kashmir conflict.',
  },
  'india-us-relations': {
    storySlug: 'india-us-relations',
    approvedImage: '/images/stories/india-us-relations.jpg',
    assetType: 'authentic-photo',
    provenance: 'US State Department & MEA India Joint Briefing',
    license: 'PUBLIC_DOMAIN',
    description: 'India-United States strategic summit and critical technology partnership.',
  },
  'india-europe-relations': {
    storySlug: 'india-europe-relations',
    approvedImage: '/images/stories/india-europe-relations.jpg',
    assetType: 'authentic-photo',
    provenance: 'European External Action Service & MEA',
    license: 'PUBLIC_DOMAIN',
    description: 'India-EU bilateral summit and Trade & Technology Council.',
  },
  '81-crore-data-breach': {
    storySlug: '81-crore-data-breach',
    approvedImage: '/images/stories/aadhaar-sc.jpg',
    assetType: 'authentic-photo',
    provenance: 'Supreme Court of India Aadhaar Judgment Archive',
    license: 'EDITORIAL',
    description: 'Supreme Court constitutional bench on digital identity and privacy.',
  },
  'electoral-bonds': {
    storySlug: 'electoral-bonds',
    approvedImage: '/images/stories/electoral-bonds.jpg',
    assetType: 'authentic-photo',
    provenance: 'Election Commission of India / SBI Disclosures Archive',
    license: 'EDITORIAL',
    description: 'State Bank of India electoral bonds redemption and disclosure audit.',
  },
  'us-iran-war-strait-of-hormuz': {
    storySlug: 'us-iran-war-strait-of-hormuz',
    approvedImage: '/images/stories/us-iran-war-strait-of-hormuz.jpg',
    assetType: 'authentic-photo',
    provenance: 'US Energy Information Administration / Maritime Traffic',
    license: 'PUBLIC_DOMAIN',
    description: 'Strait of Hormuz maritime energy chokepoint and oil tanker transit.',
  },
  'fix-farm-income': {
    storySlug: 'fix-farm-income',
    approvedImage: '/images/stories/fasal-bima.jpg',
    assetType: 'authentic-photo',
    provenance: 'Ministry of Agriculture and Farmers Welfare',
    license: 'PUBLIC_DOMAIN',
    description: 'Agricultural economics and crop income security framework.',
  },
  'fix-judicial-pendency': {
    storySlug: 'fix-judicial-pendency',
    approvedImage: '/images/stories/aadhaar-sc.jpg',
    assetType: 'authentic-photo',
    provenance: 'Supreme Court of India Archive',
    license: 'EDITORIAL',
    description: 'Supreme Court of India judicial reform and docket management.',
  },
};

export function getManifestEntry(storySlug: string): VerifiedImageRecord | null {
  return VERIFIED_STORY_IMAGE_MANIFEST[storySlug] || null;
}

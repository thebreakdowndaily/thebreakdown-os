export interface VerifiedImageRecord {
  storySlug: string;
  approvedImage: string;
  assetType: 'authentic-photo' | 'authentic-map' | 'official-document' | 'original-editorial-graphic' | 'illustrative-image' | 'branded-placeholder';
  provenance: string;
  license: 'PUBLIC_DOMAIN' | 'EDITORIAL' | 'CREATIVE_COMMONS' | 'BRANDED_VECTOR' | 'OWNED_WORK';
  description: string;
  assetId?: string;
  sourceUrl?: string;
  creator?: string;
  rightsBasis?: string;
  altText?: string;
  caption?: string;
  relevanceRationale?: string;
  width?: number;
  height?: number;
  format?: 'jpeg' | 'png' | 'webp' | 'svg' | 'pdf' | 'unknown';
  evidenceSourceUrls?: string[];
  approvalStatus?: 'approved' | 'pending' | 'rejected';
  /** Why a previously considered candidate cannot be used for this story. */
  rejectionReason?: string;
  approvalTimestamp?: string;
  authorizedStorySlugs?: string[];
  expectedDigest?: string;
  approvedDigest?: string;
  reviewedBy?: string;
  reviewerRole?: string;
  sourceDataProvenance?: string;
}

/**
 * Authoritative registry of verified, approved images for stories.
 * Guarantees that images assigned to stories have undergone editorial review.
 */
export const VERIFIED_STORY_IMAGE_MANIFEST: Record<string, VerifiedImageRecord> = {
  'mgnrega-reform': {
    storySlug: 'mgnrega-reform',
    approvalStatus: 'pending',
    approvedImage: '/images/placeholders/economy-placeholder.svg',
    assetType: 'branded-placeholder',
    provenance: 'The Breakdown Editorial Graphics',
    license: 'BRANDED_VECTOR',
    description: 'Rural employment guarantee and economic policy vector.',
  },
  'digital-payments-boom': {
    storySlug: 'digital-payments-boom',
    approvalStatus: 'pending',
    approvedImage: '/images/stories/digital-payments.jpg',
    assetType: 'authentic-photo',
    provenance: 'NPCI / UPI Merchant Transaction Archive',
    license: 'EDITORIAL',
    description: 'UPI QR code digital payment transaction at retail merchant.',
  },
  'pm-fasal-bima-claims': {
    storySlug: 'pm-fasal-bima-claims',
    approvalStatus: 'pending',
    approvedImage: '/images/stories/fasal-bima.jpg',
    assetType: 'authentic-photo',
    provenance: 'Ministry of Agriculture and Farmers Welfare',
    license: 'PUBLIC_DOMAIN',
    description: 'Indian agricultural crop field under weather risk insurance.',
  },
  'semiconductor-pli': {
    storySlug: 'semiconductor-pli',
    approvalStatus: 'pending',
    approvedImage: '/images/placeholders/technology-placeholder.svg',
    assetType: 'branded-placeholder',
    provenance: 'The Breakdown Editorial Graphics',
    license: 'BRANDED_VECTOR',
    description: 'Semiconductor manufacturing and technology policy vector.',
  },
  'dpdp-bill': {
    storySlug: 'dpdp-bill',
    approvalStatus: 'pending',
    approvedImage: '/images/stories/dpdp-bill.jpg',
    assetType: 'authentic-photo',
    provenance: 'Parliament of India / Digital Personal Data Protection Act Archive',
    license: 'PUBLIC_DOMAIN',
    description: 'Digital data protection and cybersecurity framework documentation.',
  },
  'rbi-repo-rate': {
    storySlug: 'rbi-repo-rate',
    approvalStatus: 'pending',
    approvedImage: '/images/stories/rbi-repo-rate.jpg',
    assetType: 'authentic-photo',
    provenance: 'Reserve Bank of India Monetary Policy Committee',
    license: 'PUBLIC_DOMAIN',
    description: 'Reserve Bank of India headquarters and monetary policy records.',
  },
  'climate-finance': {
    storySlug: 'climate-finance',
    approvalStatus: 'pending',
    approvedImage: '/images/stories/climate-finance.jpg',
    assetType: 'authentic-photo',
    provenance: 'Ministry of New and Renewable Energy',
    license: 'PUBLIC_DOMAIN',
    description: 'Large-scale solar and renewable energy infrastructure in India.',
  },
  'groundwater-depletion': {
    storySlug: 'groundwater-depletion',
    approvalStatus: 'pending',
    approvedImage: '/images/stories/groundwater-depletion.jpg',
    assetType: 'authentic-photo',
    provenance: 'Central Ground Water Board / Ministry of Jal Shakti',
    license: 'PUBLIC_DOMAIN',
    description: 'Agricultural tube-well groundwater extraction and aquifer stress.',
  },
  'ration-digitization': {
    storySlug: 'ration-digitization',
    approvalStatus: 'pending',
    approvedImage: '/images/stories/ration-digitization.jpg',
    assetType: 'authentic-photo',
    provenance: 'Department of Food and Public Distribution',
    license: 'PUBLIC_DOMAIN',
    description: 'Point-of-sale biometric grain distribution at Fair Price Shop.',
  },
  'anganwadi-icds': {
    storySlug: 'anganwadi-icds',
    approvalStatus: 'pending',
    approvedImage: '/images/stories/anganwadi.jpg',
    assetType: 'authentic-photo',
    provenance: 'Ministry of Women and Child Development',
    license: 'PUBLIC_DOMAIN',
    description: 'Anganwadi early childhood education and nutrition center.',
  },
  'ethanol-backlash': {
    storySlug: 'ethanol-backlash',
    approvalStatus: 'pending',
    approvedImage: '/images/stories/ethanol-backlash.jpg',
    assetType: 'authentic-map',
    provenance: 'The Breakdown Policy Graphics',
    license: 'BRANDED_VECTOR',
    description: 'Ethanol blending mandate and sugar-cane diversion policy analysis.',
  },
  'satluj-ban': {
    storySlug: 'satluj-ban',
    approvalStatus: 'pending',
    approvedImage: '/images/stories/satluj-ban.jpg',
    assetType: 'authentic-map',
    provenance: 'The Breakdown Editorial Vector Graphics',
    license: 'BRANDED_VECTOR',
    description: 'Censorship and IT Rules 2021 regulatory analysis.',
  },
  'ews-quota-upsc-investigation': {
    storySlug: 'ews-quota-upsc-investigation',
    approvalStatus: 'pending',
    approvedImage: '/images/stories/ews-quota-upsc-investigation.jpg',
    assetType: 'authentic-photo',
    provenance: 'UPSC Examination Analysis Desk',
    license: 'EDITORIAL',
    description: 'Civil services examination and reservation criteria audit.',
  },
  'us-iran-relations': {
    storySlug: 'us-iran-relations',
    approvalStatus: 'pending',
    approvedImage: '/images/stories/us-iran-relations.jpg',
    assetType: 'authentic-photo',
    provenance: 'International Diplomatic Archives',
    license: 'PUBLIC_DOMAIN',
    description: 'United States and Iran nuclear diplomacy and sanctions negotiations.',
  },
  'india-china-border-tensions': {
    storySlug: 'india-china-border-tensions',
    approvalStatus: 'rejected',
    rejectionReason: "The recorded bytes depict an India–Europe diplomatic event, not the China border.",
    approvedImage: '/images/stories/india-china-border-tensions.jpg',
    assetType: 'authentic-photo',
    provenance: 'Indian Army Border Communications Desk',
    license: 'PUBLIC_DOMAIN',
    description: 'Himalayan high-altitude terrain along the Line of Actual Control.',
  },
  'india-china-border-lac': {
    storySlug: 'india-china-border-lac',
    approvalStatus: 'rejected',
    rejectionReason: "The recorded bytes depict an India–Europe diplomatic event, not the Line of Actual Control.",
    approvedImage: '/images/stories/india-china-border-tensions.jpg',
    assetType: 'authentic-photo',
    provenance: 'Indian Army Border Communications Desk',
    license: 'PUBLIC_DOMAIN',
    description: 'Eastern Ladakh LAC terrain and forward deployment sectors.',
  },
  'kashmir-the-first-test': {
    storySlug: 'kashmir-the-first-test',
    approvalStatus: 'pending',
    approvedImage: '/images/library/chapter-1/maps/map-kashmir-1947.svg',
    assetType: 'authentic-map',
    provenance: '1947 Partition Historical Map Archive',
    license: 'PUBLIC_DOMAIN',
    description: 'Official historical map of the 1947-48 Jammu and Kashmir conflict.',
  },
  'india-us-relations': {
    storySlug: 'india-us-relations',
    approvalStatus: 'rejected',
    rejectionReason: "The recorded bytes depict an India–Europe diplomatic event, not India–US relations.",
    approvedImage: '/images/stories/india-us-relations.jpg',
    assetType: 'authentic-photo',
    provenance: 'US State Department & MEA India Joint Briefing',
    license: 'PUBLIC_DOMAIN',
    description: 'India-United States strategic summit and critical technology partnership.',
  },
  'india-europe-relations': {
    storySlug: 'india-europe-relations',
    approvalStatus: 'rejected',
    rejectionReason: "The recorded bytes depict an India–Russia map and are not a verified visual for this India–EU story.",
    approvedImage: '/images/stories/india-europe-relations.jpg',
    assetType: 'authentic-photo',
    provenance: 'European External Action Service & MEA',
    license: 'PUBLIC_DOMAIN',
    description: 'India-EU bilateral summit and Trade & Technology Council.',
  },
  '81-crore-data-breach': {
    storySlug: '81-crore-data-breach',
    approvalStatus: 'pending',
    approvedImage: '/images/stories/aadhaar-sc.jpg',
    assetType: 'authentic-photo',
    provenance: 'Supreme Court of India Aadhaar Judgment Archive',
    license: 'EDITORIAL',
    description: 'Supreme Court constitutional bench on digital identity and privacy.',
  },
  'electoral-bonds': {
    storySlug: 'electoral-bonds',
    approvalStatus: 'pending',
    approvedImage: '/images/stories/electoral-bonds.jpg',
    assetType: 'authentic-photo',
    provenance: 'Election Commission of India / SBI Disclosures Archive',
    license: 'EDITORIAL',
    description: 'State Bank of India electoral bonds redemption and disclosure audit.',
  },
  'us-iran-war-strait-of-hormuz': {
    storySlug: 'us-iran-war-strait-of-hormuz',
    approvalStatus: 'pending',
    approvedImage: '/images/stories/us-iran-war-strait-of-hormuz.jpg',
    assetType: 'authentic-photo',
    provenance: 'US Energy Information Administration / Maritime Traffic',
    license: 'PUBLIC_DOMAIN',
    description: 'Strait of Hormuz maritime energy chokepoint and oil tanker transit.',
  },
  'fix-farm-income': {
    storySlug: 'fix-farm-income',
    approvalStatus: 'pending',
    approvedImage: '/images/stories/fasal-bima.jpg',
    assetType: 'authentic-photo',
    provenance: 'Ministry of Agriculture and Farmers Welfare',
    license: 'PUBLIC_DOMAIN',
    description: 'Agricultural economics and crop income security framework.',
  },
  'fix-judicial-pendency': {
    storySlug: 'fix-judicial-pendency',
    approvalStatus: 'pending',
    approvedImage: '/images/stories/aadhaar-sc.jpg',
    assetType: 'authentic-photo',
    provenance: 'Supreme Court of India Archive',
    license: 'EDITORIAL',
    description: 'Supreme Court of India judicial reform and docket management.',
  },
  'accountability-in-india': {
    storySlug: 'accountability-in-india',
    approvedImage: '/images/stories/accountability-in-india.jpg',
    assetType: 'authentic-photo',
    provenance: 'The Breakdown Editorial Graphics',
    license: 'EDITORIAL',
    description: 'The Machinery of Public Accountability in India: Constitutional oversight, parliamentary audit trails, and institutional responsibility.',
    assetId: 'tb-accountability-in-india-hero-v1',
    sourceUrl: '/images/stories/accountability-in-india.jpg',
    creator: 'The Breakdown Editorial Graphics',
    rightsBasis: 'Commissioned bespoke visual package for The Breakdown flagship investigation; all rights owned and verified.',
    altText: 'The Machinery of Public Accountability in India: Constitutional oversight, parliamentary audit trails, and institutional responsibility.',
    caption: 'The Machinery of Public Accountability in India: Constitutional oversight and audit trails.',
    relevanceRationale: 'Bespoke editorial photography and composite visual created specifically for the flagship investigation on constitutional oversight, Comptroller and Auditor General audits, and public accountability.',
    width: 1920,
    height: 1080,
    format: 'jpeg',
    evidenceSourceUrls: [
      'https://cag.gov.in',
      'https://thebreakdown.in/evidence/cag-audit-mp-mgnrega'
    ],
    approvalStatus: 'approved',
    approvalTimestamp: '2026-09-27T10:00:00.000Z',
    approvedDigest: 'sha256:1797961054daf84a0f6fdde3192dc936c1e2ad474e8786b579b5edfe5bbc136f',
    reviewedBy: 'Editorial Visual Desk',
    reviewerRole: 'Photo Editor',
  },
  'indias-foreign-policy': {
    storySlug: 'indias-foreign-policy',
    approvalStatus: 'pending',
    approvedImage: '/images/library/chapter-1/photos/a-07-nehru-unga-1948.jpg',
    assetType: 'authentic-photo',
    provenance: 'United Nations Photo Archive / Ministry of External Affairs Historical Division',
    license: 'PUBLIC_DOMAIN',
    description: 'Prime Minister Jawaharlal Nehru addressing the UN General Assembly in 1948, establishing the foundations of India\'s Non-Aligned foreign policy.',
  },
  'namami-gange': {
    storySlug: 'namami-gange',
    approvalStatus: 'pending',
    approvedImage: '/images/stories/groundwater-depletion.jpg',
    assetType: 'authentic-photo',
    provenance: 'Central Ground Water Board / Ministry of Jal Shakti Archive',
    license: 'PUBLIC_DOMAIN',
    description: 'River basin hydrology, environmental degradation, and water quality monitoring in the Ganga basin.',
  },
  'india-ev-paradox': {
    storySlug: 'india-ev-paradox',
    approvalStatus: 'pending',
    approvedImage: '/images/stories/climate-finance.jpg',
    assetType: 'authentic-photo',
    provenance: 'Ministry of Heavy Industries / Climate Finance Archive',
    license: 'PUBLIC_DOMAIN',
    description: 'Electric vehicle manufacturing transition and environmental finance economics.',
  },
  'ng-ch-01-the-promise': {
    storySlug: 'ng-ch-01-the-promise',
    approvalStatus: 'pending',
    approvedImage: '/images/stories/groundwater-depletion.jpg',
    assetType: 'authentic-photo',
    provenance: 'Ministry of Jal Shakti / National Mission for Clean Ganga Archive',
    license: 'PUBLIC_DOMAIN',
    description: 'Namami Gange river basin hydrology and clean water initiative.',
  },
  'ng-ch-02-follow-the-money': {
    storySlug: 'ng-ch-02-follow-the-money',
    approvalStatus: 'pending',
    approvedImage: '/images/stories/groundwater-depletion.jpg',
    assetType: 'authentic-photo',
    provenance: 'Ministry of Jal Shakti / National Mission for Clean Ganga Archive',
    license: 'PUBLIC_DOMAIN',
    description: 'Namami Gange budget allocations and expenditure audit.',
  },
  'ng-ch-03-the-sewage-problem': {
    storySlug: 'ng-ch-03-the-sewage-problem',
    approvalStatus: 'pending',
    approvedImage: '/images/stories/groundwater-depletion.jpg',
    assetType: 'authentic-photo',
    provenance: 'Ministry of Jal Shakti / National Mission for Clean Ganga Archive',
    license: 'PUBLIC_DOMAIN',
    description: 'Namami Gange sewage discharge and treatment deficit.',
  },
  'ng-ch-04-the-audit-trail': {
    storySlug: 'ng-ch-04-the-audit-trail',
    approvalStatus: 'pending',
    approvedImage: '/images/stories/groundwater-depletion.jpg',
    assetType: 'authentic-photo',
    provenance: 'Comptroller and Auditor General of India / NMCG',
    license: 'PUBLIC_DOMAIN',
    description: 'CAG performance audit findings on Ganga river cleanup.',
  },
  'ng-ch-05-procurement-and-accountability': {
    storySlug: 'ng-ch-05-procurement-and-accountability',
    approvalStatus: 'pending',
    approvedImage: '/images/stories/groundwater-depletion.jpg',
    assetType: 'authentic-photo',
    provenance: 'Central Vigilance Commission / Ministry of Jal Shakti',
    license: 'PUBLIC_DOMAIN',
    description: 'Procurement oversight and accountability mechanisms.',
  },
  'ng-ch-06-why-stps-dont-work': {
    storySlug: 'ng-ch-06-why-stps-dont-work',
    approvalStatus: 'pending',
    approvedImage: '/images/stories/groundwater-depletion.jpg',
    assetType: 'authentic-photo',
    provenance: 'Central Pollution Control Board / NMCG',
    license: 'PUBLIC_DOMAIN',
    description: 'Sewage treatment plant operational capacity and design constraints.',
  },
  'ng-ch-07-water-quality': {
    storySlug: 'ng-ch-07-water-quality',
    approvalStatus: 'pending',
    approvedImage: '/images/stories/groundwater-depletion.jpg',
    assetType: 'authentic-photo',
    provenance: 'Central Pollution Control Board Water Quality Monitoring Network',
    license: 'PUBLIC_DOMAIN',
    description: 'BOD, DO, and faecal coliform testing across Ganga monitoring stations.',
  },
  'ng-ch-08-city-report-cards': {
    storySlug: 'ng-ch-08-city-report-cards',
    approvalStatus: 'pending',
    approvedImage: '/images/stories/groundwater-depletion.jpg',
    assetType: 'authentic-photo',
    provenance: 'State Pollution Control Boards / Urban Local Bodies',
    license: 'PUBLIC_DOMAIN',
    description: 'City-by-city assessment of urban river stretch pollution.',
  },
  'ng-ch-09-contractors': {
    storySlug: 'ng-ch-09-contractors',
    approvalStatus: 'pending',
    approvedImage: '/images/stories/groundwater-depletion.jpg',
    assetType: 'authentic-photo',
    provenance: 'National Mission for Clean Ganga EPC Contract Database',
    license: 'PUBLIC_DOMAIN',
    description: 'Engineering and infrastructure contractor execution timelines.',
  },
  'ng-ch-10-timeline-of-delays': {
    storySlug: 'ng-ch-10-timeline-of-delays',
    approvalStatus: 'pending',
    approvedImage: '/images/stories/groundwater-depletion.jpg',
    assetType: 'authentic-photo',
    provenance: 'Ministry of Jal Shakti Project Monitoring Group',
    license: 'PUBLIC_DOMAIN',
    description: 'Commissioning timeline and operational delays across river projects.',
  },
  'ng-ch-11-ecology': {
    storySlug: 'ng-ch-11-ecology',
    approvalStatus: 'pending',
    approvedImage: '/images/stories/groundwater-depletion.jpg',
    assetType: 'authentic-photo',
    provenance: 'Wildlife Institute of India / Biodiversity Board',
    license: 'PUBLIC_DOMAIN',
    description: 'Ganga river dolphin and aquatic biodiversity survey.',
  },
  'ng-ch-12-voices-from-the-river': {
    storySlug: 'ng-ch-12-voices-from-the-river',
    approvalStatus: 'pending',
    approvedImage: '/images/stories/groundwater-depletion.jpg',
    assetType: 'authentic-photo',
    provenance: 'The Breakdown Field Reporting Archive',
    license: 'EDITORIAL',
    description: 'Local stakeholder and community perspectives along river basin.',
  },
  'ng-ch-13-government-response': {
    storySlug: 'ng-ch-13-government-response',
    approvalStatus: 'pending',
    approvedImage: '/images/stories/groundwater-depletion.jpg',
    assetType: 'authentic-photo',
    provenance: 'Press Information Bureau / Ministry of Jal Shakti',
    license: 'PUBLIC_DOMAIN',
    description: 'Official government filings, cabinet statements, and rejoinders.',
  },
  'ng-ch-14-what-worked': {
    storySlug: 'ng-ch-14-what-worked',
    approvalStatus: 'pending',
    approvedImage: '/images/stories/groundwater-depletion.jpg',
    assetType: 'authentic-photo',
    provenance: 'National Mission for Clean Ganga Success Documentation',
    license: 'PUBLIC_DOMAIN',
    description: 'Successful interception drains and functional treatment facilities.',
  },
  'ng-ch-15-recommendations': {
    storySlug: 'ng-ch-15-recommendations',
    approvalStatus: 'pending',
    approvedImage: '/images/stories/groundwater-depletion.jpg',
    assetType: 'authentic-photo',
    provenance: 'The Breakdown Policy Analysis Desk',
    license: 'EDITORIAL',
    description: 'Policy reform blueprint for river basin governance and urban sanitation.',
  },
  'ai-literacy-india-students-verify-ai': {
    storySlug: 'ai-literacy-india-students-verify-ai',
    authorizedStorySlugs: ['ai-literacy-india-students-verify-ai'],
    approvedImage: '/images/stories/ai-literacy-india-students.jpg',
    assetType: 'authentic-photo',
    assetId: 'tb-ai-literacy-students-photo-v1',
    sourceUrl: '/images/stories/ai-literacy-india-students.jpg',
    creator: 'Ministry of Education / Digital India Classroom Archive',
    provenance: 'Ministry of Education / Digital India Classroom Archive',
    license: 'EDITORIAL',
    rightsBasis: 'Documented archive photograph from Ministry of Education / Digital India Classroom Archive under Government Open Data License (GODL-India) / Editorial Use.',
    description: 'Indian school students engaging with digital tablets and educational technology in a classroom environment.',
    altText: 'Indian school students in a classroom engaging with digital tablets and learning interfaces.',
    caption: 'School students interacting with digital learning interfaces in an Indian classroom. Ministry of Education Archive.',
    relevanceRationale: 'Authentic classroom photo illustrating student engagement with digital devices at the core of the AI literacy reporting.',
    width: 1280,
    height: 853,
    format: 'jpeg',
    expectedDigest: 'sha256:8fd5be70fbd1b7645ec218eca2ec259980b7b2a3d84fe2dfcc99a710c18991b1',
    approvedDigest: 'sha256:8fd5be70fbd1b7645ec218eca2ec259980b7b2a3d84fe2dfcc99a710c18991b1',
    approvalStatus: 'rejected',
    rejectionReason: "The recorded bytes depict an office building, not students or classroom learning.",
  },
  'ai-literacy-verification-path': {
    storySlug: 'ai-literacy-india-students-verify-ai',
    authorizedStorySlugs: ['ai-literacy-india-students-verify-ai'],
    expectedDigest: 'sha256:2e7e6f2e6191dff58f6f16d93ffeea1c8e1bd74090f024240969d9d9aa382393',
    approvedDigest: 'sha256:2e7e6f2e6191dff58f6f16d93ffeea1c8e1bd74090f024240969d9d9aa382393',
    approvedImage: '/images/editorial/ai-literacy-verification-path.svg',
    assetType: 'original-editorial-graphic',
    provenance: 'The Breakdown Editorial Graphics',
    license: 'OWNED_WORK',
    description: 'A five-step AI answer verification routine for schoolwork: identify, trace, open, compare, and record.',
    assetId: 'tb-ai-literacy-verification-path-v1',
    sourceUrl: '/images/editorial/ai-literacy-verification-path.svg',
    creator: 'The Breakdown Editorial Graphics',
    rightsBasis: 'Original vector graphic created for The Breakdown; based on CBSE Circulars Acad-15/2026 and Acad-18/2026 and UNESCO 2023 guidelines.',
    altText: 'A five-step AI answer verification routine: identify a claim, locate the cited source, open the primary record, compare the evidence, and record what remains uncertain.',
    caption: 'A five-step verification routine for AI-assisted schoolwork based on CBSE curriculum guidance. Original diagram by The Breakdown.',
    relevanceRationale: 'Illustrates the core pedagogical shift from passive AI adoption to active cognitive verification in Classes III–VIII.',
    width: 1200,
    height: 630,
    format: 'svg',
    evidenceSourceUrls: [
      'https://cbseacademic.nic.in',
      'https://unesdoc.unesco.org/ark:/48223/pf0000385723'
    ],
    sourceDataProvenance: 'CBSE Circulars Acad-15/2026 and Acad-18/2026; UNESCO Guidance for Generative AI in Education and Research (2023).',
    approvalStatus: 'pending',
  },
  'india-semiconductor-mission-fab-reality': {
    storySlug: 'india-semiconductor-mission-fab-reality',
    approvedImage: '/images/stories/semiconductor-pli.jpg',
    assetType: 'authentic-photo',
    provenance: 'Ministry of Electronics and Information Technology (MeitY) / ISM Archive (flagged: on-disk file depicts deer; requires authentic replacement)',
    license: 'PUBLIC_DOMAIN',
    rightsBasis: 'Legacy repository asset flagged during Phase 4 visual integrity audit: physical file depicts a deer in a field and does not match semiconductor cleanroom subject matter.',
    description: 'Flagged hero asset pending replacement with authentic documented semiconductor fabrication photograph.',
    assetId: 'tb-semiconductor-cleanroom-photo-v1',
    sourceUrl: '/images/stories/semiconductor-pli.jpg',
    creator: 'MeitY / ISM Archive',
    altText: 'Semiconductor cleanroom technician inspecting silicon wafer processing equipment under high-purity cleanroom conditions.',
    caption: 'Semiconductor cleanroom wafer processing. Asset flagged for replacement during visual integrity audit.',
    relevanceRationale: 'Target subject is cleanroom wafer processing; current on-disk asset failed visual verification and is held pending authentic replacement.',
    width: 1200,
    height: 800,
    format: 'jpeg',
    expectedDigest: 'sha256:3e44978e35a749bdc920961e3a07d27c747136f197f1b29d07018b33cce663a7',
    approvedDigest: 'sha256:3e44978e35a749bdc920961e3a07d27c747136f197f1b29d07018b33cce663a7',
    authorizedStorySlugs: ['india-semiconductor-mission-fab-reality'],
    approvalStatus: 'rejected',
    rejectionReason: "The recorded bytes depict a deer and are unrelated to semiconductor manufacturing.",
  },
  'semiconductor-project-status': {
    storySlug: 'india-semiconductor-mission-fab-reality',
    authorizedStorySlugs: ['india-semiconductor-mission-fab-reality'],
    expectedDigest: 'sha256:da7d5a31230f4ca8dbb119e4dca97393539fb1c05211d101ebf0bc462307530b',
    approvedDigest: 'sha256:da7d5a31230f4ca8dbb119e4dca97393539fb1c05211d101ebf0bc462307530b',
    approvedImage: '/images/editorial/semiconductor-project-status.svg',
    assetType: 'original-editorial-graphic',
    provenance: 'The Breakdown Editorial Graphics',
    license: 'OWNED_WORK',
    description: 'India semiconductor programme status as of September 2026: 12 approved units, over 1.64 lakh crore rupees in cumulative planned investment, and five units reported in commercial production.',
    assetId: 'tb-semiconductor-status-graphic-v1',
    sourceUrl: '/images/editorial/semiconductor-project-status.svg',
    creator: 'The Breakdown Editorial Graphics',
    rightsBasis: 'Original vector graphic created for The Breakdown; based on official Press Information Bureau releases.',
    altText: 'India semiconductor programme status as of September 2026: 12 approved units, over 1.64 lakh crore rupees in cumulative planned investment, and five units reported in commercial production.',
    caption: 'India semiconductor programme status: 12 approved units and five operational plants reported in official September 2026 releases. Original graphic by The Breakdown.',
    relevanceRationale: 'PIB releases dated 17–18 September 2026 (NoteId 160020 and PRID 2311726) separating project approvals from operational commercial production.',
    width: 1200,
    height: 630,
    format: 'svg',
    evidenceSourceUrls: [
      'https://www.pib.gov.in/PressNoteDetails.aspx?ModuleId=3&NoteId=160020',
      'https://www.pib.gov.in/PressReleasePage.aspx?PRID=2311726',
    ],
    sourceDataProvenance: 'PIB Press Note 160020 and Press Release PRID 2311726 (17–18 September 2026).',
    approvalStatus: 'pending',
  },
  'bcci-domestic-mandate-ranji-economics': {
    storySlug: 'bcci-domestic-mandate-ranji-economics',
    approvedImage: '/images/stories/bcci-ranji-trophy.jpg',
    assetType: 'authentic-photo',
    provenance: 'Wikimedia Commons / Contributor: Shyamearth',
    license: 'PUBLIC_DOMAIN',
    rightsBasis: 'The author released the original work into the public domain on Wikimedia Commons (File:Ranji_trophy.jpg). The local site asset is resized for a 16:9 presentation; the original Commons file is 576 × 288 pixels.',
    description: 'The Ranji Trophy championship trophy, illustrating the domestic first-class competition at the centre of this story.',
    assetId: 'tb-bcci-ranji-trophy-photo-v1',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Ranji_trophy.jpg',
    creator: 'Shyamearth',
    altText: 'The Ranji Trophy championship trophy displayed against a red backdrop.',
    caption: 'The Ranji Trophy, the prize at the centre of India’s domestic first-class cricket championship. Photograph by Shyamearth; released into the public domain on Wikimedia Commons.',
    relevanceRationale: 'Authentic photograph of the Ranji Trophy, directly illustrating the red-ball domestic first-class cricket championship at the core of the BCCI mandate and player economics investigation.',
    width: 1200,
    height: 675,
    format: 'jpeg',
    evidenceSourceUrls: [
      'https://www.bcci.tv/news/article/update-9th-apex-council-meeting',
      'https://www.bcci.tv/news/article/bcci-announces-test-cricket-incentive-scheme-for-senior-men',
    ],
    expectedDigest: 'sha256:0e40c006907a6dd1c3457cf219ed472d04e2d68137f87fe29070f9b42e6c1d70',
    authorizedStorySlugs: ['bcci-domestic-mandate-ranji-economics'],
    approvalStatus: 'pending',
    approvalTimestamp: '2026-10-24T18:00:00.000Z',
  },
  'bcci-domestic-fees': {
    storySlug: 'bcci-domestic-mandate-ranji-economics',
    authorizedStorySlugs: ['bcci-domestic-mandate-ranji-economics'],
    // On-disk Windows checkout digest (CRLF: 2,825 bytes).
    // Canonical Git blob and production CDN digest (LF: 2,814 bytes): sha256:58285b107afc09664aca8319b9ff0197635947a6488f2f77ba96dd7eb7c6f38f
    expectedDigest: 'sha256:58285b107afc09664aca8319b9ff0197635947a6488f2f77ba96dd7eb7c6f38f',
    approvedDigest: 'sha256:58285b107afc09664aca8319b9ff0197635947a6488f2f77ba96dd7eb7c6f38f',
    approvedImage: '/images/editorial/bcci-domestic-fees.svg',
    assetType: 'original-editorial-graphic',
    provenance: 'The Breakdown Editorial Graphics',
    license: 'OWNED_WORK',
    description: "BCCI senior men's domestic daily fee tiers by match-count band; the original 2021 rate table is still quoted in 2026 reporting",
    assetId: 'tb-bcci-domestic-mandate-ranji-economics-graphic-v1',
    sourceUrl: '/images/editorial/bcci-domestic-fees.svg',
    creator: 'The Breakdown Editorial Graphics',
    rightsBasis: 'Original vector graphic created for The Breakdown; no third-party photograph incorporated.',
    altText: 'Three senior men’s domestic daily fee tiers: ₹40,000, ₹50,000 and ₹60,000 across BCCI-published match-count bands; reserve fees are separate.',
    caption: "BCCI's 20 September 2021 senior men's domestic daily fee table. It is a rate card, not annual salary; The New Indian Express reported the same tiers in May 2026.",
    relevanceRationale: 'BCCI Update—9th Apex Council Meeting, 20 September 2021; dated schedule separating daily fees by appearance tiers.',
    width: 1200,
    height: 630,
    format: 'svg',
    evidenceSourceUrls: [
      'https://www.bcci.tv/news/article/update-9th-apex-council-meeting',
      'https://www.newindianexpress.com/sport/cricket/2026/May/20/bccis-domestic-outlook-focus-on-t20s',
    ],
    sourceDataProvenance: "BCCI Update—9th Apex Council Meeting (20 September 2021); senior men's domestic daily fee table.",
    approvalStatus: 'approved',
    approvalTimestamp: '2026-10-26T18:55:00.000Z',
    reviewedBy: 'Editorial Visual Desk',
    reviewerRole: 'Senior Visual Editor',
  },
};

export function getManifestEntry(storySlug: string): VerifiedImageRecord | null {
  return VERIFIED_STORY_IMAGE_MANIFEST[storySlug] || null;
}

/**
 * Checks whether an asset explicitly authorizes usage by a given story slug.
 * Supports legitimate shared assets only via explicit, auditable authorization.
 */
export function isAssetAuthorizedForStory(record: VerifiedImageRecord, storySlug: string): boolean {
  if (record.storySlug === storySlug) return true;
  if (Array.isArray(record.authorizedStorySlugs) && record.authorizedStorySlugs.includes(storySlug)) {
    return true;
  }
  return false;
}

/**
 * Resolves an approved image URL against the manifest and checks whether
 * the requesting story is authorized to use it.
 */
export function findRegisteredAssetForStory(
  src: string,
  storySlug: string
): { record: VerifiedImageRecord | null; isAuthorized: boolean } {
  const record =
    Object.values(VERIFIED_STORY_IMAGE_MANIFEST).find(
      (candidate) => candidate.approvedImage === src
    ) || null;

  if (!record) {
    return { record: null, isAuthorized: false };
  }

  const isAuthorized = isAssetAuthorizedForStory(record, storySlug);
  return { record, isAuthorized };
}

export const IMAGE_INTELLIGENCE_MANIFEST = VERIFIED_STORY_IMAGE_MANIFEST;

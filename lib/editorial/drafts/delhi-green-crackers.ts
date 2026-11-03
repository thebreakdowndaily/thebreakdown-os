import type { Story } from '@/types/canonical';

/**
 * ─── The Breakdown OS — Canonical Explainer Draft ─────────────────────────────
 * Story: Delhi's Green-Cracker Test Is Now an Enforcement Test
 * Slug:  delhi-green-cracker-enforcement-diwali-2026
 *
 * Governing Documents:
 *   - Level 1 Editorial Constitution v1.1 (Articles I, III, IV, XI, XIII)
 *   - AGENTS.md (Editorial Accountability, Fail-Closed Gates)
 *   - Mission TB-INV-2026-11-03-GREEN-CRACKERS
 */

export const DELHI_GREEN_CRACKER_STORY: Story = {
  id: 'd9999999-9999-4999-8999-999999999999',
  slug: 'delhi-green-cracker-enforcement-diwali-2026',
  title: "Delhi's Green-Cracker Test Is Now an Enforcement Test",
  headline: "Delhi's Green-Cracker Test Is Now an Enforcement Test",
  summary:
    "The Supreme Court has permitted a strictly limited sale and bursting window for certified green crackers in Delhi-NCR for Diwali 2026. But following the Court's observation that authorities failed to provide satisfactory implementation data from the previous year's relaxation, and fresh allegations of unapproved market sales, the central test is whether regulatory agencies can verify products, police prohibited sales, and produce scientifically credible environmental and public-health evidence.",
  category: 'Environment & Public Health',
  status: 'review',
  publicationStatus: 'scheduled',
  storyType: 'explainer',
  author: 'The Breakdown Research Desk',
  readingTime: 13,
  evidenceScore: 96,
  heroImage: '/images/editorial/delhi-green-crackers-enforcement-framework.svg',
  heroImageAlt:
    'Infographic showing the Supreme Court regulatory windows for green crackers in Delhi-NCR for Diwali 2026: manufacture November 2 to 6, sale November 4 to 6, bursting November 7 to 8 (6-7 am and 8-10 pm), full ban restored November 9; plus verification gates including non-transferable batch QR codes, 300-metre sensitive buffer zones, police patrols, and CPCB air quality and hospital monitoring.',
  publishedAt: '',
  scheduledAt: '2026-11-03T20:00:00Z',
  createdAt: '2026-11-03T18:00:00Z',
  updatedAt: '2026-11-03T20:00:00Z',
  tags: [
    'Delhi Pollution',
    'Green Crackers',
    'Supreme Court',
    'Air Quality',
    'Environmental Governance',
    'Diwali 2026',
    'Public Health',
    'Regulatory Enforcement',
  ],
  primaryEntityId: 'supreme-court-of-india',
  relatedEntityIds: ['supreme-court-of-india', 'csir-neeri', 'cpcb', 'delhi-police'],
  relatedTopicIds: ['environment', 'public-health', 'governance', 'judiciary', 'delhi-pollution'],
  takeaway:
    'The true test of the green-cracker framework is not the announcement of strict rules, but whether authorities can prove on the public record that retail stock was verified, prohibited sales interdicted, and pollution outcomes scientifically measured.',
  whoIsAffected:
    'Over 33 million residents of the National Capital Region exposed to severe seasonal particulate pollution, respiratory patients, licensed pyrotechnic traders, and law enforcement agencies.',
  impactLevel: 'high',
  location: 'Delhi-NCR, India',
  legislation:
    'Supreme Court Order in Arjun Gopal v. Union of India (2026 INSC 1181); Environment (Protection) Act, 1986; Explosives Act, 1884',
  answerSummary:
    'The Supreme Court permitted certified green firecrackers in Delhi-NCR under tight temporal windows: manufacture Nov 2–6, sale Nov 4–6, bursting Nov 7–8 (6–7 am and 8–10 pm), with a complete ban restored Nov 9. Permitted crackers require CSIR-NEERI and PESO certification and batch-specific QR codes. Market enforcement faces scrutiny following attributed reports of unapproved stock, active police seizures (>6,000 kg), and acknowledged patrol constraints in residential areas.',
  whatIsUnknown:
    'The public record does not yet disclose the complete list of notified retail sales locations across NCR districts. The digital resolver process for verifying batch-level QR codes in retail shops remains untested. Post-Diwali air quality and hospital admission impacts cannot be determined until physical monitoring data is published following the 7–8 November window.',
  reportingType: 'document_analysis',
  faq: [
    {
      question: 'What makes a firecracker "green"?',
      answer:
        'Under CSIR-NEERI criteria, green crackers are formulations that achieve at least a 30% reduction in particulate matter (or 20% PM + 10% gaseous emissions) relative to conventional formulations in the same category. They eliminate barium salts and use alternative oxidizers and dust suppressants, but they still emit PM2.5, SO2, and NOx during combustion.',
    },
    {
      question: 'When and where is bursting permitted in Delhi-NCR for Diwali 2026?',
      answer:
        'Bursting is permitted strictly on 7 and 8 November 2026 between 6:00–7:00 am and 8:00–10:00 pm. Bursting is completely prohibited within 300 metres of hospitals, nursing homes, schools, and notified silence zones. Complete prohibition across NCR resumes on 9 November 2026.',
    },
    {
      question: 'Can firecrackers be purchased online or delivered into Delhi-NCR?',
      answer:
        'No. The Supreme Court order explicitly prohibits all online sales, e-commerce deliveries, and transport of firecrackers into Delhi-NCR from outside the region.',
    },
    {
      question: 'How can a consumer verify if a green cracker box is authentic?',
      answer:
        'The packaging must be sealed, display CSIR-NEERI green logo and PESO license details, and carry a product- and batch-specific non-transferable QR code. However, the institutional hand-off for field verification relies on regulators, as NEERI does not print retail packaging codes.',
    },
    {
      question: 'What happens after Diwali 2026 regarding enforcement oversight?',
      answer:
        'Authorities must submit comprehensive compliance affidavits and monitoring reports (including CPCB daily AQI and hospital admission data) to the Supreme Court by 14 December 2026, ahead of the next hearing on 16 December 2026.',
    },
  ],
  charts: [
    {
      type: 'bar',
      title: 'Delhi-NCR Green-Cracker Regulatory Calendar (November 2026)',
      xKey: 'label',
      yKey: 'days',
      data: [
        { label: 'Manufacture (Approved Only)', days: 5, start: '2 Nov', end: '6 Nov' },
        { label: 'Licensed Retail Sale (Designated Sites)', days: 3, start: '4 Nov', end: '6 Nov' },
        { label: 'Bursting Window (3 hrs/day total)', days: 2, start: '7 Nov', end: '8 Nov' },
        { label: 'Prohibition Reinstated', days: 22, start: '9 Nov', end: '30 Nov' },
      ],
      caption:
        'Segmented operational windows mandated by Supreme Court order 2026 INSC 1181. Infographic: The Breakdown.',
    },
  ],
  relatedStoryIds: [],
  sources: [
    {
      id: 'src-sc-order-2026',
      title: 'Supreme Court of India, Order in Arjun Gopal v. Union of India (2026 INSC 1181) [IndiaKanoon Legal Database Reproduction]',
      url: 'https://indiankanoon.org/doc/113136598/',
      publisher: 'IndiaKanoon (reproducing Supreme Court of India)',
      sourceType: 'court',
      tier: 1,
      accessedAt: '2026-11-03T17:30:00Z',
      publishedAt: '2026-10-29T00:00:00Z',
    },
    {
      id: 'src-neeri-portal',
      title: 'CSIR-NEERI Green Firecrackers National Centre of Excellence Technical Guidance',
      url: 'https://neeri.res.in/contents/details/green-firecrackers-national-centre-of-excellence',
      publisher: 'CSIR-NEERI',
      sourceType: 'government',
      tier: 1,
      accessedAt: '2026-11-03T18:00:00Z',
      publishedAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'src-neeri-pr2025',
      title: 'CSIR-NEERI Press Release on Green Firecrackers Registration and QR Protocols',
      url: 'https://www.neeri.res.in/file_homes/35509814_Press%20Release_Green%20firecrackers.pdf',
      publisher: 'CSIR-NEERI',
      sourceType: 'government',
      tier: 1,
      accessedAt: '2026-11-03T18:15:00Z',
      publishedAt: '2025-10-16T00:00:00Z',
    },
    {
      id: 'src-dp-portal-index',
      title: 'Delhi Police Public Press Release Portal Index (October 2026 Seizure Entries)',
      url: 'https://kpkb.delhipolice.gov.in/newpressrelease',
      publisher: 'Delhi Police',
      sourceType: 'government',
      tier: 1,
      accessedAt: '2026-11-03T18:30:00Z',
      publishedAt: '2026-10-15T00:00:00Z',
    },
    {
      id: 'src-cpcb-ccr',
      title: 'Central Pollution Control Board Central Control Room for Air Quality Management',
      url: 'https://app.cpcbccr.com/ccr',
      publisher: 'Central Pollution Control Board',
      sourceType: 'government',
      tier: 1,
      accessedAt: '2026-11-03T18:45:00Z',
      publishedAt: '2026-11-03T00:00:00Z',
    },
    {
      id: 'src-delhi-aqi-method',
      title: 'Delhi Government Air Quality Index Explainer and Station Averaging Protocol',
      url: 'https://aqi.delhi.gov.in/about',
      publisher: 'Government of NCT Delhi',
      sourceType: 'government',
      tier: 1,
      accessedAt: '2026-11-03T19:00:00Z',
      publishedAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'src-ht-market-rep',
      title: "Hindustan Times: 'Everything available': Firecrackers sold openly in Delhi",
      url: 'https://www.hindustantimes.com/cities/delhi-news/everything-available-firecrackers-sold-openly-in-delhi-101793644696771.html',
      publisher: 'Hindustan Times',
      sourceType: 'news',
      tier: 4,
      accessedAt: '2026-11-03T19:15:00Z',
      publishedAt: '2026-11-03T00:00:00Z',
    },
    {
      id: 'src-ht-sc-take-note',
      title: 'Hindustan Times: Supreme Court takes note of HT report on sale of firecrackers in Delhi-NCR',
      url: 'https://www.hindustantimes.com/india-news/supreme-court-takes-note-of-ht-report-on-sale-firecrackers-delhi-ncr-qr-no-qr-everything-available-sc-101793686859170.html',
      publisher: 'Hindustan Times',
      sourceType: 'news',
      tier: 4,
      accessedAt: '2026-11-03T19:30:00Z',
      publishedAt: '2026-11-03T00:00:00Z',
    },
    {
      id: 'src-ht-police-enforce',
      title: 'Hindustan Times: Firecrackers enforcement in residential areas not feasible: Delhi Police',
      url: 'https://www.hindustantimes.com/cities/delhi-news/firecrackers-enforcement-in-residential-areas-not-feasible-delhi-police-101793644748345.html',
      publisher: 'Hindustan Times',
      sourceType: 'news',
      tier: 4,
      accessedAt: '2026-11-03T19:45:00Z',
      publishedAt: '2026-11-03T00:00:00Z',
    },
    {
      id: 'src-ie-legal-explainer',
      title: "The Indian Express: Supreme Court relaxes Delhi fireworks ban for Diwali, designates time for 'green crackers'",
      url: 'https://indianexpress.com/article/legal-news/supreme-court-green-crackers-delhi-ncr-diwali-timings-sale-rules-10948099/',
      publisher: 'The Indian Express',
      sourceType: 'news',
      tier: 4,
      accessedAt: '2026-11-03T20:00:00Z',
      publishedAt: '2026-11-03T00:00:00Z',
    },
    {
      id: 'src-bb-sc-hearing',
      title: 'Bar & Bench: Supreme Court expresses concern after report flags unrestricted sale of firecrackers in Delhi',
      url: 'https://www.barandbench.com/amp/story/news/litigation/supreme-court-expresses-concern-after-report-flags-unrestricted-sale-of-firecrackers-in-delhi',
      publisher: 'Bar & Bench',
      sourceType: 'news',
      tier: 4,
      accessedAt: '2026-11-03T20:15:00Z',
      publishedAt: '2026-11-03T00:00:00Z',
    },
    {
      id: 'src-ll-sc-lackdata',
      title: 'LiveLaw: Supreme Court Questions Lack Of Data On Enforcing Firecracker Restrictions During Diwali In Delhi NCR',
      url: 'https://www.livelaw.in/amp/top-stories/supreme-court-questions-lack-of-data-on-enforcing-firecracker-restrictions-during-diwali-in-delhi-ncr-556533',
      publisher: 'LiveLaw',
      sourceType: 'news',
      tier: 4,
      accessedAt: '2026-11-03T20:30:00Z',
      publishedAt: '2026-10-29T00:00:00Z',
    },
  ],
  claims: [
    {
      id: 'clm-dgc-01',
      claim: 'The Supreme Court permitted certified green crackers in Delhi-NCR under order dated 29 October 2026.',
      data: 'Supreme Court order in Arjun Gopal v. Union of India (2026 INSC 1181) delivered on 29 October 2026.',
      source: 'src-sc-order-2026',
      sourceId: 'src-sc-order-2026',
      sourceUrl: 'https://indiankanoon.org/doc/113136598/',
      tier: 1,
      status: 'verified',
      verificationStatus: 'verified',
      confidence: 1.0,
      isLegacy: true,
    },
    {
      id: 'clm-dgc-02',
      claim: 'Manufacture of approved green crackers was permitted strictly from 2 to 6 November 2026.',
      data: 'Direction C of Supreme Court order 2026 INSC 1181.',
      source: 'src-sc-order-2026',
      sourceId: 'src-sc-order-2026',
      sourceUrl: 'https://indiankanoon.org/doc/113136598/',
      tier: 1,
      status: 'verified',
      verificationStatus: 'verified',
      confidence: 1.0,
      isLegacy: true,
    },
    {
      id: 'clm-dgc-03',
      claim: 'Sale of approved green crackers by licensed traders was permitted strictly from 4 to 6 November 2026.',
      data: 'Direction G of Supreme Court order 2026 INSC 1181.',
      source: 'src-sc-order-2026',
      sourceId: 'src-sc-order-2026',
      sourceUrl: 'https://indiankanoon.org/doc/113136598/',
      tier: 1,
      status: 'verified',
      verificationStatus: 'verified',
      confidence: 1.0,
      isLegacy: true,
    },
    {
      id: 'clm-dgc-04',
      claim: 'Bursting of green crackers was permitted strictly on 7 and 8 November 2026 (6–7 am and 8–10 pm).',
      data: 'Direction A of Supreme Court order 2026 INSC 1181 restricts bursting to two daily time slots.',
      source: 'src-sc-order-2026',
      sourceId: 'src-sc-order-2026',
      sourceUrl: 'https://indiankanoon.org/doc/113136598/',
      tier: 1,
      status: 'verified',
      verificationStatus: 'verified',
      confidence: 1.0,
      isLegacy: true,
    },
    {
      id: 'clm-dgc-05',
      claim: 'A complete prohibition on all firecrackers in Delhi-NCR is restored effective 9 November 2026.',
      data: 'Direction A of Supreme Court order 2026 INSC 1181.',
      source: 'src-sc-order-2026',
      sourceId: 'src-sc-order-2026',
      sourceUrl: 'https://indiankanoon.org/doc/113136598/',
      tier: 1,
      status: 'verified',
      verificationStatus: 'verified',
      confidence: 1.0,
      isLegacy: true,
    },
    {
      id: 'clm-dgc-06',
      claim: 'Bursting is prohibited within 300 metres of hospitals, health centres, nursing homes, and schools.',
      data: 'Supreme Court order 2026 INSC 1181 sensitive buffer zone directions.',
      source: 'src-sc-order-2026',
      sourceId: 'src-sc-order-2026',
      sourceUrl: 'https://indiankanoon.org/doc/113136598/',
      tier: 1,
      status: 'verified',
      verificationStatus: 'verified',
      confidence: 1.0,
      isLegacy: true,
    },
    {
      id: 'clm-dgc-07',
      claim: 'Green firecrackers must carry product-specific and batch-specific non-transferable QR codes.',
      data: 'Direction F of Supreme Court order 2026 INSC 1181.',
      source: 'src-sc-order-2026',
      sourceId: 'src-sc-order-2026',
      sourceUrl: 'https://indiankanoon.org/doc/113136598/',
      tier: 1,
      status: 'verified',
      verificationStatus: 'verified',
      confidence: 1.0,
      isLegacy: true,
    },
    {
      id: 'clm-dgc-08',
      claim: 'Barium salts, joined-series crackers, unapproved products, and online e-commerce sales are banned.',
      data: 'Operative clauses of Supreme Court order 2026 INSC 1181.',
      source: 'src-sc-order-2026',
      sourceId: 'src-sc-order-2026',
      sourceUrl: 'https://indiankanoon.org/doc/113136598/',
      tier: 1,
      status: 'verified',
      verificationStatus: 'verified',
      confidence: 1.0,
      isLegacy: true,
    },
    {
      id: 'clm-dgc-09',
      claim: 'The Supreme Court observed that authorities failed to provide satisfactory data from the 2025 relaxation.',
      data: 'Paragraph 4 of Supreme Court order 2026 INSC 1181.',
      source: 'src-sc-order-2026',
      sourceId: 'src-sc-order-2026',
      sourceUrl: 'https://indiankanoon.org/doc/113136598/',
      tier: 1,
      status: 'verified',
      verificationStatus: 'verified',
      confidence: 1.0,
      isLegacy: true,
    },
    {
      id: 'clm-dgc-10',
      claim: 'The Supreme Court took note on 3 November of an HT report alleging open market sales and directed action.',
      data: 'Supreme Court proceedings of 3 November 2026 reported in national media.',
      source: 'src-ht-sc-take-note',
      sourceId: 'src-ht-sc-take-note',
      sourceUrl: 'https://www.hindustantimes.com/india-news/supreme-court-takes-note-of-ht-report-on-sale-firecrackers-delhi-ncr-qr-no-qr-everything-available-sc-101793686859170.html',
      tier: 4,
      status: 'verified',
      verificationStatus: 'verified',
      confidence: 0.95,
      isLegacy: true,
    },
    {
      id: 'clm-dgc-11',
      claim: 'Hindustan Times reported market visits to five Delhi retail hubs documenting pre-window sales and QR issues.',
      data: 'Hindustan Times investigative report published on 3 November 2026.',
      source: 'src-ht-market-rep',
      sourceId: 'src-ht-market-rep',
      sourceUrl: 'https://www.hindustantimes.com/cities/delhi-news/everything-available-firecrackers-sold-openly-in-delhi-101793644696771.html',
      tier: 4,
      status: 'verified',
      verificationStatus: 'verified',
      confidence: 0.92,
      isLegacy: true,
    },
    {
      id: 'clm-dgc-12',
      claim: 'Delhi Police officers reported district-level seizures across North, Outer North, and East districts.',
      data: 'Hindustan Times report quoting DCPs of North, Outer North, and East districts.',
      source: 'src-ht-police-enforce',
      sourceId: 'src-ht-police-enforce',
      sourceUrl: 'https://www.hindustantimes.com/cities/delhi-news/firecrackers-enforcement-in-residential-areas-not-feasible-delhi-police-101793644748345.html',
      tier: 4,
      status: 'verified',
      verificationStatus: 'verified',
      confidence: 0.95,
      isLegacy: true,
    },
    {
      id: 'clm-dgc-13',
      claim: 'Delhi Police stated that continuous patrols in residential areas to detect bursting were not feasible.',
      data: 'Attributed Delhi Police statements in Hindustan Times report of 3 November 2026.',
      source: 'src-ht-police-enforce',
      sourceId: 'src-ht-police-enforce',
      sourceUrl: 'https://www.hindustantimes.com/cities/delhi-news/firecrackers-enforcement-in-residential-areas-not-feasible-delhi-police-101793644748345.html',
      tier: 4,
      status: 'verified',
      verificationStatus: 'verified',
      confidence: 0.95,
      isLegacy: true,
    },
    {
      id: 'clm-dgc-14',
      claim: 'Delhi Police public index lists 15 October recoveries by Crime Branch (2,260 kg) and Outer North (338.5 kg).',
      data: 'Delhi Police public press-release portal index entries dated 15 October 2026.',
      source: 'src-dp-portal-index',
      sourceId: 'src-dp-portal-index',
      sourceUrl: 'https://kpkb.delhipolice.gov.in/newpressrelease',
      tier: 1,
      status: 'verified',
      verificationStatus: 'verified',
      confidence: 1.0,
      isLegacy: true,
    },
    {
      id: 'clm-dgc-15',
      claim: 'CSIR-NEERI defines green crackers as achieving at least 30% PM reduction (or 20% PM + 10% gas reduction).',
      data: 'CSIR-NEERI National Centre of Excellence technical criteria.',
      source: 'src-neeri-portal',
      sourceId: 'src-neeri-portal',
      sourceUrl: 'https://neeri.res.in/contents/details/green-firecrackers-national-centre-of-excellence',
      tier: 1,
      status: 'verified',
      verificationStatus: 'verified',
      confidence: 1.0,
      isLegacy: true,
    },
    {
      id: 'clm-dgc-16',
      claim: 'CSIR-NEERI stated in 2025 that manufacturers generate QR codes while regulators perform field verification.',
      data: 'CSIR-NEERI official press release dated 16 October 2025.',
      source: 'src-neeri-pr2025',
      sourceId: 'src-neeri-pr2025',
      sourceUrl: 'https://www.neeri.res.in/file_homes/35509814_Press%20Release_Green%20firecrackers.pdf',
      tier: 1,
      status: 'verified',
      verificationStatus: 'verified',
      confidence: 1.0,
      isLegacy: true,
    },
    {
      id: 'clm-dgc-17',
      claim: 'Delhi AQI averages reporting stations, excludes stations missing for 2 hours, and readings are provisional.',
      data: 'Delhi Government Department of Environment AQI methodology.',
      source: 'src-delhi-aqi-method',
      sourceId: 'src-delhi-aqi-method',
      sourceUrl: 'https://aqi.delhi.gov.in/about',
      tier: 1,
      status: 'verified',
      verificationStatus: 'verified',
      confidence: 1.0,
      isLegacy: true,
    },
    {
      id: 'clm-dgc-18',
      claim: 'CPCB is directed to issue daily AQI reports across three periods and test soil, sand, and water samples.',
      data: 'Directions J and K of Supreme Court order 2026 INSC 1181.',
      source: 'src-sc-order-2026',
      sourceId: 'src-sc-order-2026',
      sourceUrl: 'https://indiankanoon.org/doc/113136598/',
      tier: 1,
      status: 'verified',
      verificationStatus: 'verified',
      confidence: 1.0,
      isLegacy: true,
    },
    {
      id: 'clm-dgc-19',
      claim: 'Compliance affidavits from authorities are due by 14 December 2026 ahead of the 16 December hearing.',
      data: 'Concluding procedural directions of Supreme Court order 2026 INSC 1181.',
      source: 'src-sc-order-2026',
      sourceId: 'src-sc-order-2026',
      sourceUrl: 'https://indiankanoon.org/doc/113136598/',
      tier: 1,
      status: 'verified',
      verificationStatus: 'verified',
      confidence: 1.0,
      isLegacy: true,
    },
    {
      id: 'clm-dgc-20',
      claim: 'Hospital admission and emergency department attendance data through 30 November 2026 must be submitted.',
      data: 'Supreme Court order 2026 INSC 1181 public health reporting mandate.',
      source: 'src-sc-order-2026',
      sourceId: 'src-sc-order-2026',
      sourceUrl: 'https://indiankanoon.org/doc/113136598/',
      tier: 1,
      status: 'verified',
      verificationStatus: 'verified',
      confidence: 1.0,
      isLegacy: true,
    },
  ],
  timeline: [
    {
      date: '15 October 2025',
      title: 'Supreme Court 2025 Relaxation Experiment',
      description:
        'The Supreme Court granted a temporary relaxation for green firecrackers in Delhi-NCR to assess regulatory manageability and air quality impact.',
    },
    {
      date: '16 October 2025',
      title: 'CSIR-NEERI Issues Regulatory Protocol',
      description:
        'NEERI clarified that it certifies formulations while manufacturers apply QR codes and regulators perform market verification.',
    },
    {
      date: '15 October 2026',
      title: 'Delhi Police Intercept Illegal Stock',
      description:
        'Delhi Police Crime Branch recovered 2,260 kg and Outer North AATS recovered 338.5 kg of illegal firecrackers.',
    },
    {
      date: '29 October 2026',
      title: 'Supreme Court Delivers 2026 Framework Order',
      description:
        'The Supreme Court issued directions in 2026 INSC 1181 setting tightly defined manufacture, sale, and bursting windows and strict safeguards.',
    },
    {
      date: '2 November 2026',
      title: 'Manufacture Window Opens',
      description:
        'Permitted manufacture period commenced (2–6 Nov); Supreme Court order formally signed and released.',
    },
    {
      date: '3 November 2026',
      title: 'Supreme Court Takes Note of Market Reports',
      description:
        'The Court directed authorities to look into Hindustan Times field reporting alleging unapproved retail sales and QR code anomalies.',
    },
    {
      date: '4 November 2026',
      title: 'Permitted Retail Sale Window Commences',
      description:
        'Licensed sales opened at designated sales locations (4–6 Nov); online and unnotified sales prohibited.',
    },
    {
      date: '7 November 2026',
      title: 'Permitted Bursting Window Opens',
      description:
        'Bursting restricted strictly to 7 and 8 November across two daily slots: 6:00–7:00 am and 8:00–10:00 pm.',
    },
    {
      date: '9 November 2026',
      title: 'Complete Prohibition Restored',
      description:
        'Complete legal ban on all firecrackers resumed across Delhi-NCR; daily CPCB post-Diwali monitoring continues through 30 Nov.',
    },
    {
      date: '14 December 2026',
      title: 'Compliance Affidavits Due',
      description:
        'Government and regulatory agencies must submit monitoring and enforcement affidavits ahead of the 16 December hearing.',
    },
  ],
  blocks: [
    {
      id: 'blk-dgc-hero',
      type: 'hero',
      region: 'hero',
      data: {
        headline: "Delhi's Green-Cracker Test Is Now an Enforcement Test",
        summary:
          "The Supreme Court has permitted a limited sale and bursting window for certified green crackers in Delhi-NCR. But after the Court questioned the lack of implementation data from the previous experiment and took note of fresh market-sale allegations, the central test is whether authorities can verify products, police prohibited sales, and publish credible scientific data.",
        heroImage: '/images/editorial/delhi-green-crackers-enforcement-framework.svg',
        caption:
          'The Supreme Court regulatory framework for green crackers in Delhi-NCR for Diwali 2026, showing mandated operational windows, verification gates, buffer zones, and monitoring requirements. Infographic: The Breakdown.',
        altText:
          'Infographic showing the Supreme Court regulatory windows for green crackers in Delhi-NCR for Diwali 2026: manufacture November 2 to 6, sale November 4 to 6, bursting November 7 to 8 (6-7 am and 8-10 pm), full ban restored November 9; plus verification gates including non-transferable batch QR codes, 300-metre sensitive buffer zones, police patrols, and CPCB air quality and hospital monitoring.',
        category: 'Environment & Public Health',
        author: 'The Breakdown Research Desk',
        publishedAt: '2026-11-03T20:00:00Z',
      },
    },
    {
      id: 'blk-dgc-numbers',
      type: 'key-numbers',
      region: 'main',
      data: {
        items: [
          { value: '3 Hours/Day', label: 'Permitted Bursting Slot', context: '6–7 AM & 8–10 PM only on 7–8 Nov' },
          { value: '300 Metres', label: 'Buffer Zone', context: 'Around hospitals, schools & silence zones' },
          { value: '30% Min.', label: 'Particulate Reduction', context: 'Required for CSIR-NEERI green certification' },
          { value: '14 Dec 2026', label: 'Compliance Deadline', context: 'Affidavits due before Supreme Court' },
        ],
      },
    },
    {
      id: 'blk-dgc-comparison',
      type: 'comparison',
      region: 'main',
      data: {
        metric: 'Green-Cracker Compliance: Mandated Safeguards vs Implementation Visibility',
        before: {
          value: 'Order Mandates',
          label: 'Batch QRs, designated sites, hospital buffer zones, random sampling & border checks',
        },
        after: {
          value: 'Public Evidence',
          label: 'Active police raids (>6,000 kg seized) alongside unnotified site lists and residential patrol limits',
        },
        description:
          'Evaluating the gap between judicial safeguards prescribed by the Supreme Court and empirical compliance verified on the ground.',
      },
    },
    {
      id: 'blk-dgc-img1',
      type: 'image',
      region: 'main',
      data: {
        src: '/images/editorial/delhi-green-crackers-enforcement-framework.svg',
        alt: 'Infographic showing the Supreme Court regulatory windows for green crackers in Delhi-NCR for Diwali 2026: manufacture November 2 to 6, sale November 4 to 6, bursting November 7 to 8 (6-7 am and 8-10 pm), full ban restored November 9; plus verification gates including non-transferable batch QR codes, 300-metre sensitive buffer zones, police patrols, and CPCB air quality and hospital monitoring.',
        caption:
          'The Supreme Court regulatory framework for green crackers in Delhi-NCR for Diwali 2026, showing mandated operational windows, verification gates, buffer zones, and monitoring requirements. Infographic: The Breakdown.',
      },
    },
    {
      id: 'blk-dgc-ch1',
      type: 'chapter-heading',
      region: 'main',
      data: {
        title: 'Chapter 1: The Core Question: Can Authorities Verify What Is Sold?',
        anchorId: 'chapter-1',
      },
    },
    {
      id: 'blk-dgc-p1',
      type: 'paragraph',
      region: 'main',
      data: {
        text: `<p>Delhi-NCR's latest regulatory experiment with green firecrackers is facing its decisive test before the first permitted firework is ignited. The immediate policy question is not merely whether certified products exist in laboratories or factory warehouses. It is whether regulatory authorities and police can demonstrate that the products sold on city streets match approved formulations, that strict territorial and temporal limits are enforced, and that the environmental and public-health consequences of the relaxation are measured transparently.</p>
<p>On 29 October 2026, the Supreme Court of India delivered a detailed order in Arjun Gopal and Others v. Union of India and Others (2026 INSC 1181), permitting a temporary, conditional return of certified green crackers across the National Capital Region. The order carefully segments the regulatory calendar: manufacture of approved products is permitted strictly from 2 November to 6 November 2026; retail sale by eligible traders is permitted strictly from 4 November to 6 November at designated locations; bursting of approved crackers is permitted strictly on 7 November and 8 November across two specific daily time slots (6:00 to 7:00 am and 8:00 to 10:00 pm); and complete prohibition is restored automatically across Delhi-NCR from 9 November onwards.</p>
<p>The distinction between these dates is not an administrative formality. The manufacturing window is entirely separate from the retail sale window, and neither window permits the premature ignition of fireworks. Furthermore, the Court established strict buffer zones, completely prohibiting the bursting of firecrackers within 300 metres of hospitals, primary health centres, nursing homes, old age homes, notified silence zones, and educational institutions.</p>
<p>The Court's prescribed safeguards are exacting. Every permitted firework must be certified jointly by the Council of Scientific and Industrial Research–National Environmental Engineering Research Institute (CSIR-NEERI) and the Petroleum and Explosives Safety Organisation (PESO). Products must appear on NEERI's registered manufacturer schedule, be sold exclusively in tamper-evident sealed packaging, and carry a product-specific, batch-specific, non-transferable Quick Response (QR) code. That QR code is mandated to expose the manufacturer's identity, NEERI registration number, PESO or District Magistrate license details, chemical formulation type, and laboratory test certificate. All firecrackers containing barium salts, unapproved chemical compositions, and joined-series firecrackers—commonly known as "ladis"—remain strictly banned. Online sales and interstate courier deliveries into Delhi-NCR are completely prohibited. Yet, as regulatory history in the National Capital Region has repeatedly demonstrated, the issuance of a comprehensive judicial order does not automatically translate into verified compliance on the ground.</p>`,
      },
    },
    {
      id: 'blk-dgc-ch2',
      type: 'chapter-heading',
      region: 'main',
      data: {
        title: 'Chapter 2: What Field Reporting Has Documented—and What It Cannot Prove',
        anchorId: 'chapter-2',
      },
    },
    {
      id: 'blk-dgc-p2',
      type: 'paragraph',
      region: 'main',
      data: {
        text: `<p>On 3 November 2026, the implementation challenge moved directly into the courtroom. The Supreme Court took formal judicial notice of an investigative report published by the Hindustan Times, which alleged that conventional and unauthorized firecrackers were being displayed and sold openly across several major commercial markets in Delhi ahead of the permitted retail window. The newspaper reported that its journalists visited five prominent retail hubs—Chandni Chowk, Sadar Bazaar, Shastri Nagar, Sarojini Nagar, and New Friends Colony—on 22 October and 2 November.</p>
<p>According to the Hindustan Times reporting, vendors were observed displaying firecracker boxes prior to the 4 November retail opening. Several packaging boxes reportedly carried QR codes that could not be resolved by smartphone cameras or redirected users to general manufacturer promotional websites rather than specific NEERI and PESO certification test sheets. The report further alleged that certain traders offered conventional firecrackers on request and accepted advance reservations for banned stock. Following these submissions, the Supreme Court asked the Union Government, the Government of National Capital Territory of Delhi, and the Delhi Police to look into the reported sales.</p>
<p>These allegations require careful evidentiary contextualization. The market observations and vendor conversations are third-party journalistic findings reported by the Hindustan Times; The Breakdown has not independently replicated those undercover market visits, purchased retail products, or scanned packaging in those markets. Crucially, the Supreme Court's decision to ask authorities to look into a media report constitutes judicial notice of an urgent regulatory concern; it is not a judicial finding of fact that every vendor in those markets violated the law. Nevertheless, the allegations highlight the central structural vulnerability of the green-cracker framework: can ordinary consumers, licensed traders, and beat police officers independently establish whether a sealed cardboard box on a shop counter corresponds to an authentic, authorized chemical batch?</p>`,
      },
    },
    {
      id: 'blk-dgc-ch3',
      type: 'chapter-heading',
      region: 'main',
      data: {
        title: 'Chapter 3: The Enforcement Dilemma: Police Seizures and Practical Realities',
        anchorId: 'chapter-3',
      },
    },
    {
      id: 'blk-dgc-p3',
      type: 'paragraph',
      region: 'main',
      data: {
        text: `<p>The public record does not show complete administrative inaction. Rather, it reveals substantial operational police activity operating alongside acknowledged physical limits. In a companion report published on 3 November, the Hindustan Times quoted senior Delhi Police officers outlining extensive enforcement measures across several police districts: the DCP for North District reported registering more than 13 FIRs and seizing approximately 1,200 kilograms of illegal firecrackers over the preceding 12 days; the DCP for Outer North District reported the seizure of 2,878 kilograms between 1 October and 2 November, resulting in four cases and eight arrests; and the DCP for East District cited seven cases and more than 1,700 kilograms recovered.</p>
<p>Delhi Police's public press-release portal further corroborates active interdiction operations. The portal's official index lists two major seizures dated 15 October 2026: a Crime Branch operation recovering 2,260 kilograms of illegal firecrackers, and an Outer North District Anti-Auto Theft Squad operation recovering 338.5 kilograms. These figures establish that police units have conducted targeted raids and intercepted substantial quantities of prohibited fireworks. However, these district-level figures cannot simply be aggregated into a single Delhi-wide enforcement total. The reporting windows vary widely—spanning from a single day's operation to a 12-day window or a full calendar month—and the operational jurisdictions between specialized units like the Crime Branch and local police districts may overlap. Combining them without reconciled incident registers risks double-counting and creates an illusion of false mathematical precision.</p>
<p>More fundamentally, seizure quantities alone cannot answer the question of enforcement efficacy. When police seize 6,000 kilograms of firecrackers, does that represent ten percent of the illegal contraband circulating within the metropolitan area, or eighty percent? Without knowing the total volume of illegal stock entering the capital across its dozens of porous regional borders, raw seizure weights cannot establish deterrence. Furthermore, senior police officials highlighted a significant operational limitation to the Hindustan Times: while police can inspect designated markets, check commercial transport vehicles, and respond to public telephone complaints, conducting continuous foot patrols inside dense, labyrinthine residential neighbourhoods to identify individual households bursting crackers during prohibited hours is practically impossible. Enforcement in residential colonies must inevitably rely on post-facto response rather than continuous physical prevention.</p>`,
      },
    },
    {
      id: 'blk-dgc-ch4',
      type: 'chapter-heading',
      region: 'main',
      data: {
        title: 'Chapter 4: The Verification Chain: From NEERI Formulations to the Retail Box',
        anchorId: 'chapter-4',
      },
    },
    {
      id: 'blk-dgc-p4',
      type: 'paragraph',
      region: 'main',
      data: {
        text: `<p>The integrity of the green-cracker policy depends upon an unbroken verification chain linking three distinct institutional actors: scientific institutions, manufacturing enterprises, and regulatory enforcement agencies. CSIR-NEERI operates the National Centre of Excellence for Green Firecrackers. On its official institutional portal, NEERI emphasizes that only registration certificates and test reports issued through its official online portal are authentic and legally valid. NEERI's regulatory mandate is product-specific: it evaluates chemical formulations submitted by manufacturers holding valid explosive licenses from PESO or District Magistrates, conducts laboratory emissions testing, and issues formal approval certificates.</p>
<p>However, the institutional hand-off between formulation approval and retail packaging verification has historically created regulatory ambiguity. In an official press note issued on 16 October 2025, CSIR-NEERI explicitly clarified the division of responsibilities: NEERI develops green cracker formulations, conducts laboratory emission tests, and issues registration letters to manufacturers; it does not print, issue, or physically affix barcodes or QR codes onto retail packages. Instead, manufacturers are responsible for developing product-specific QR codes, while regulatory authorities—including PESO, the Central Pollution Control Board (CPCB), State Pollution Control Boards, and police—are tasked with verifying those codes in the market.</p>
<p>Under the Supreme Court's 2026 framework, this verification requirement has become substantially more demanding. The Court's order mandates not merely a product-level QR code, but a batch-specific, non-transferable QR code that binds a particular physical consignment to its specific manufacturing date, licensed facility, and laboratory test report. This requirement introduces an untested technical question: what digital resolver system exists for field verification? If a QR code simply encodes an alphanumeric string that directs a smartphone browser to a manufacturer's public website, it does not prevent an unscrupulous operator from copying a genuine QR code from an approved batch and printing thousands of duplicate stickers onto boxes containing banned barium fireworks.</p>
<p>Authentic verification requires a secure, tamper-resistant system where scanning the code queries an authoritative central registry hosted by NEERI or PESO, displays the specific authorized batch number, and provides enforcement officers with a cryptographic means of confirming that the physical consignment in front of them is legitimate. Whether such a real-time digital verification system is fully operational across NCR retail markets ahead of Diwali remains an unanswered question on the public record.</p>`,
      },
    },
    {
      id: 'blk-dgc-ch5',
      type: 'chapter-heading',
      region: 'main',
      data: {
        title: 'Chapter 5: The 2025 Evidence Failure and Judicial Skepticism',
        anchorId: 'chapter-5',
      },
    },
    {
      id: 'blk-dgc-p5',
      type: 'paragraph',
      region: 'main',
      data: {
        text: `<p>The Supreme Court's rigorous oversight of the 2026 Diwali framework must be understood in the context of the regulatory failure that preceded it. The 2026 order explicitly recounts the history of the previous year's intervention. In October 2025, the Supreme Court granted a similar temporary relaxation permitting green crackers, intended in significant part to allow state authorities and environmental regulators to gather empirical data on whether green crackers could be managed effectively and how permitted use impacted ambient air quality.</p>
<p>In paragraph 4 of the 29 October 2026 order, the Court recorded an unequivocal finding: authorities had failed to place satisfactory material before the Court demonstrating that the 2025 relaxation was effectively regulated or that comprehensive scientific monitoring was executed. This judicial finding is crucial. It demonstrates that the 2026 experiment is not being conducted on a clean slate; it is being conducted against an official judicial record showing that the previous year's regulatory trial failed to generate the verifiable evidence the judiciary demanded.</p>
<p>The Court also reiterated its deep concern that conventional, highly polluting firecrackers continued to be manufactured, trafficked, and sold under the guise of green crackers despite an ostensible total ban. This persistent regulatory leakage was precisely why the Court opted for a tightly regulated, time-bound legal window accompanied by heavy oversight obligations, rather than relying exclusively on an unmonitored blanket prohibition that had proven unenforceable in practice.</p>`,
      },
    },
    {
      id: 'blk-dgc-ch6',
      type: 'chapter-heading',
      region: 'main',
      data: {
        title: 'Chapter 6: Why "Green" Does Not Mean Non-Polluting',
        anchorId: 'chapter-6',
      },
    },
    {
      id: 'blk-dgc-p6',
      type: 'paragraph',
      region: 'main',
      data: {
        text: `<p>Public discourse frequently conflates the regulatory classification "green firecracker" with an environmental claim that the products are clean, harmless, or non-polluting. This is a scientific fallacy. According to CSIR-NEERI's published technical criteria, green firecrackers are defined by comparative emission reductions achieved under controlled laboratory testing relative to conventional formulations in the same product category: a minimum particulate matter reduction of 30 percent, or a minimum particulate matter reduction of 20 percent combined with a minimum 10 percent reduction in gaseous emissions such as sulfur dioxide and nitrogen oxides.</p>
<p>These benchmarks represent significant chemical engineering achievements, primarily realized by eliminating potassium nitrate and sulfur, substituting barium compounds with alternative oxidizers, and incorporating chemical additives that act as dust suppressants. However, a 30 percent reduction against a highly toxic conventional baseline is not zero pollution. Green firecrackers are pyrotechnic devices that function through rapid exothermic oxidation. When detonated, they inevitably discharge fine particulate matter (PM2.5 and PM10), carbon monoxide, sulfur dioxide, nitrogen oxides, and aerosolized trace metals into the lower atmosphere.</p>
<p>When tens of thousands of households burst green crackers simultaneously across a metropolitan area within a compressed two-hour window, the aggregate chemical loading on the ambient airshed remains massive. Classifying a product as "green" establishes that it meets a comparative manufacturing standard; it does not confer ambient environmental harmlessness.</p>`,
      },
    },
    {
      id: 'blk-dgc-ch7',
      type: 'chapter-heading',
      region: 'main',
      data: {
        title: 'Chapter 7: Air Quality Monitoring: Transparent Methodology vs. Simplistic Assumptions',
        anchorId: 'chapter-7',
      },
    },
    {
      id: 'blk-dgc-p7',
      type: 'paragraph',
      region: 'main',
      data: {
        text: `<p>To ensure that the 2026 experiment generates the empirical data that was missing in 2025, the Supreme Court directed the Central Pollution Control Board, in active coordination with the State Pollution Control Boards of Delhi, Haryana, Uttar Pradesh, and Rajasthan, to publish daily Air Quality Index reports across three mandatory temporal windows: the pre-Diwali baseline window from 2 to 6 November 2026, the permitted Diwali window on 7 and 8 November, and the post-Diwali observation window from 9 to 30 November. In addition to continuous gaseous and particulate monitoring, the Court ordered specialized environmental sampling of soil, sand, and surface water across designated locations in Delhi-NCR to test for chemical residue and heavy metal deposition.</p>
<p>However, interpreting ambient air quality data requires scientific discipline. A common journalistic error is to observe an AQI of 320 on the morning of Diwali and an AQI of 450 the following morning, and attribute the entire numerical surge to firecrackers. Atmospheric chemistry in Delhi-NCR during early November is an extraordinarily complex, multi-variable system governed by seasonal meteorological transitions. As documented in official technical explainers by the Delhi Government and CPCB, the composite city-wide AQI is an arithmetic average calculated from reporting Continuous Ambient Air Quality Monitoring Stations; monitoring stations that fail to transmit data or suffer technical dropouts in the preceding two hours are automatically excluded from the calculation, and real-time hourly numbers remain provisional pending manual validation by CPCB scientists.</p>
<p>During early November, north-westerly surface winds frequently transport intense plumes of agricultural residue smoke from stubble burning in Punjab and Haryana into the Delhi bowl. Concurrently, post-monsoon seasonal cooling creates sharp atmospheric temperature inversions and collapses the planetary boundary layer mixing height from over 1,500 metres during the day to below 200 metres at night, trapping local emissions from vehicular traffic, road dust, and industrial units close to ground level regardless of fireworks.</p>
<p>Isolating the specific marginal contribution of green firecrackers requires far more than comparing two daily headline AQI numbers. A scientifically defensible analysis demands high-frequency station-level data completeness, chemical speciation of collected particulates (such as measuring specific tracer elements like barium, strontium, and potassium), and rigorous meteorological normalization modeling. Headline figures that ignore weather conditions and baseline emission sources produce advocacy, not evidence. Furthermore, as of 3 November 2026, the permitted bursting window and the post-Diwali observation period have not occurred. Any definitive claim regarding the post-Diwali environmental impact of the 2026 relaxation is scientifically impossible at this juncture because the physical data does not yet exist.</p>`,
      },
    },
    {
      id: 'blk-dgc-ch8',
      type: 'chapter-heading',
      region: 'main',
      data: {
        title: 'Chapter 8: Monitoring & Accountability: Air Quality, Health Data, and 14 December',
        anchorId: 'chapter-8',
      },
    },
    {
      id: 'blk-dgc-p8',
      type: 'paragraph',
      region: 'main',
      data: {
        text: `<p>A parallel accountability mandate in the Supreme Court's order requires health authorities to compile and submit aggregate hospital admission and emergency department attendance data for respiratory illnesses, burn trauma, and ocular injuries across Delhi-NCR through 30 November 2026. Tracking healthcare utilization provides vital public health visibility. However, drawing direct causal inferences between firecracker emissions and aggregate hospital admissions requires extreme methodological caution.</p>
<p>Emergency room presentations for acute bronchial asthma, chronic obstructive pulmonary disease exacerbations, and pediatric respiratory infections predictably surge across Northern India every autumn. This seasonal illness pattern is driven by cold weather transitions, circulating viral pathogens, and baseline regional smog. Determining whether an observed increase in hospital admissions during early November was caused specifically by green cracker smoke requires a consistent institutional coverage network across government and private tertiary hospitals, standardized clinical case definitions distinguishing blast trauma from chronic respiratory complaints, comparison against a rigorous multi-year epidemiological baseline, and statistical adjustment for temperature drops and background PM2.5 exposure.</p>
<p>Health data covering the full monitoring period through 30 November is not yet available. Responsible journalism must report the existence of the judicial health-reporting mandate while making it explicit that empirical outcome data is pending and that causal conclusions cannot be drawn prematurely. The Supreme Court has directed all participating regulatory and enforcement agencies to submit their comprehensive compliance affidavits and monitoring reports by 14 December 2026, ahead of the next formal compliance hearing listed for 16 December.</p>
<p>Before that judicial review takes place, the public is entitled to examine the primary documentary evidence supporting each stage of the regulatory framework. A transparent accounting requires clear answers to fundamental administrative questions: where are the formal district notifications and public maps identifying designated sales sites; how many temporary retail licenses were approved in each NCR district; how many retail inspections and QR code checks were conducted; how many product samples were confiscated and referred to PESO laboratories; what are the reconciled, consolidated figures for seizures, FIRs, and forfeited security deposits; which CAAQMS stations maintained complete data uptime throughout the Diwali period; and what standardized reporting methodology was employed across healthcare facilities?</p>
<p>These inquiries are not bureaucratic footnotes. They represent the precise evidentiary standard that separates an enforceable regulatory system from a symbolic paper exercise. The ultimate test of Delhi-NCR's green-cracker experiment is not whether an attractive green label is pasted onto a cardboard box, nor whether a court issues a finely balanced order. The real test is whether public authorities can prove that the rules were enforced in the markets, that unauthorized products were intercepted, and that the environmental and public-health consequences are measured with uncompromising scientific rigor. Until those compliance records, laboratory reports, and complete datasets are placed on the public record and subjected to independent scrutiny, neither effective regulatory enforcement nor the environmental safety of the experiment can be assumed.</p>`,
      },
    },
  ],
};

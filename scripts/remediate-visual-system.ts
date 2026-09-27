import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

interface EntityInsignia {
  filename: string;
  name: string;
  shortName: string;
  category: string;
  accentColor: string;
  symbolText: string;
}

const ENTITIES_TO_REMEDIATE: EntityInsignia[] = [
  {
    filename: 'who.jpg',
    name: 'World Health Organization',
    shortName: 'WHO',
    category: 'UNITED NATIONS SPECIALIZED AGENCY • GLOBAL PUBLIC HEALTH',
    accentColor: '#0284c7', // Sky Blue
    symbolText: 'WHO'
  },
  {
    filename: 'wto.jpg',
    name: 'World Trade Organization',
    shortName: 'WTO',
    category: 'MULTILATERAL TRADE REGULATOR • GENEVA CONVENTIONS',
    accentColor: '#059669', // Emerald
    symbolText: 'WTO'
  },
  {
    filename: 'ministry-of-finance.jpg',
    name: 'Ministry of Finance',
    shortName: 'FINMIN',
    category: 'GOVERNMENT OF INDIA • NORTH BLOCK, NEW DELHI',
    accentColor: '#d97706', // Amber Gold
    symbolText: 'DEA'
  },
  {
    filename: 'adb.jpg',
    name: 'Asian Development Bank',
    shortName: 'ADB',
    category: 'REGIONAL DEVELOPMENT BANK • MANILA, PHILIPPINES',
    accentColor: '#2563eb', // Royal Blue
    symbolText: 'ADB'
  },
  {
    filename: 'aiib.jpg',
    name: 'Asian Infrastructure Investment Bank',
    shortName: 'AIIB',
    category: 'MULTILATERAL DEVELOPMENT BANK • BEIJING, CHINA',
    accentColor: '#0891b2', // Cyan
    symbolText: 'AIIB'
  },
  {
    filename: 'commonwealth.jpg',
    name: 'Commonwealth of Nations',
    shortName: 'COMMONWEALTH',
    category: 'VOLUNTARY ASSOCIATION OF 56 MEMBER NATIONS',
    accentColor: '#4f46e5', // Indigo
    symbolText: 'CW'
  },
  {
    filename: 'quad.jpg',
    name: 'Quadrilateral Security Dialogue',
    shortName: 'QUAD',
    category: 'STRATEGIC DIPLOMATIC FORUM • INDO-PACIFIC COALITION',
    accentColor: '#eab308', // Yellow
    symbolText: 'QUAD'
  },
  {
    filename: 'isa.jpg',
    name: 'International Solar Alliance',
    shortName: 'ISA',
    category: 'INTERGOVERNMENTAL TREATY-BASED SOLAR UNION • GURUGRAM',
    accentColor: '#ea580c', // Orange
    symbolText: 'ISA'
  },
  {
    filename: 'iora.jpg',
    name: 'Indian Ocean Rim Association',
    shortName: 'IORA',
    category: 'REGIONAL MARITIME COOPERATION FORUM • EBÈNE, MAURITIUS',
    accentColor: '#0d9488', // Teal
    symbolText: 'IORA'
  },
  {
    filename: 'cdri.jpg',
    name: 'Coalition for Disaster Resilient Infrastructure',
    shortName: 'CDRI',
    category: 'GLOBAL PARTNERSHIP FOR RESILIENT INFRASTRUCTURE • NEW DELHI',
    accentColor: '#65a30d', // Lime
    symbolText: 'CDRI'
  }
];

function generateInsigniaSvg(entity: EntityInsignia): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="50%" stop-color="#111827"/>
      <stop offset="100%" stop-color="#030712"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="40%" r="50%">
      <stop offset="0%" stop-color="${entity.accentColor}" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="800" height="450" fill="url(#bg)"/>
  <rect width="800" height="450" fill="url(#glow)"/>

  <!-- Border & Frame -->
  <rect x="24" y="24" width="752" height="402" rx="12" fill="none" stroke="#1e293b" stroke-width="1.5"/>
  <rect x="32" y="32" width="736" height="386" rx="8" fill="none" stroke="${entity.accentColor}" stroke-width="1" stroke-opacity="0.25"/>

  <!-- Central Seal Shield -->
  <circle cx="400" cy="180" r="72" fill="#1e293b" stroke="${entity.accentColor}" stroke-width="2.5" stroke-opacity="0.8"/>
  <circle cx="400" cy="180" r="62" fill="none" stroke="#334155" stroke-width="1" stroke-dasharray="4 3"/>

  <!-- Inner Seal Monogram -->
  <text x="400" y="191" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="28" fill="#f8fafc" text-anchor="middle" letter-spacing="2">${entity.symbolText}</text>

  <!-- Title & Metadata -->
  <text x="400" y="295" font-family="Georgia, serif" font-weight="600" font-size="26" fill="#f8fafc" text-anchor="middle" letter-spacing="0.5">${entity.name}</text>
  <text x="400" y="328" font-family="system-ui, -apple-system, sans-serif" font-weight="600" font-size="11" fill="${entity.accentColor}" text-anchor="middle" letter-spacing="2">${entity.category}</text>

  <!-- Institutional Watermark -->
  <text x="400" y="380" font-family="system-ui, -apple-system, sans-serif" font-size="10" fill="#64748b" text-anchor="middle" letter-spacing="3">THE BREAKDOWN • CANONICAL KNOWLEDGE OBJECT</text>
</svg>`;
}

function generateSiteOgSvg(title: string, subtitle: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="ogbg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#09090b"/>
      <stop offset="60%" stop-color="#141416"/>
      <stop offset="100%" stop-color="#050506"/>
    </linearGradient>
    <radialGradient id="ogglow" cx="25%" cy="30%" r="60%">
      <stop offset="0%" stop-color="#d97706" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#ogbg)"/>
  <rect width="1200" height="630" fill="url(#ogglow)"/>

  <!-- Border Frame -->
  <rect x="40" y="40" width="1120" height="550" rx="16" fill="none" stroke="#27272a" stroke-width="1.5"/>

  <!-- Brand Mark -->
  <rect x="90" y="90" width="14" height="42" fill="#d97706"/>
  <text x="120" y="122" font-family="Georgia, serif" font-weight="800" font-size="34" fill="#fafafa" letter-spacing="1">THE BREAKDOWN</text>
  <text x="455" y="122" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="14" fill="#a1a1aa" letter-spacing="4">PLATFORM BETA</text>

  <!-- Main Headline -->
  <text x="90" y="270" font-family="Georgia, serif" font-weight="700" font-size="52" fill="#ffffff" letter-spacing="-0.5">${title}</text>
  <text x="90" y="340" font-family="system-ui, -apple-system, sans-serif" font-weight="400" font-size="24" fill="#a1a1aa" letter-spacing="0.2">${subtitle}</text>

  <!-- Tag Pills -->
  <rect x="90" y="460" width="220" height="38" rx="6" fill="#18181b" stroke="#3f3f46" stroke-width="1"/>
  <text x="200" y="484" font-family="system-ui, -apple-system, sans-serif" font-weight="600" font-size="12" fill="#fbbf24" text-anchor="middle" letter-spacing="1.5">PUBLICATIONS &amp; DATA</text>

  <rect x="330" y="460" width="240" height="38" rx="6" fill="#18181b" stroke="#3f3f46" stroke-width="1"/>
  <text x="450" y="484" font-family="system-ui, -apple-system, sans-serif" font-weight="600" font-size="12" fill="#38bdf8" text-anchor="middle" letter-spacing="1.5">EVIDENCE-FIRST KNOWLEDGE</text>

  <text x="1100" y="540" font-family="system-ui, -apple-system, sans-serif" font-size="14" fill="#71717a" text-anchor="end" letter-spacing="2">THEBREAKDOWN.IN</text>
</svg>`;
}

async function run() {
  console.log('=== EXECUTING TARGETED REMEDIATIONS ===');

  // Remediation 1: Replace 10 corrupt HTML files in public/images/entities/
  console.log('\n--- Remediation 1: 10 Corrupted Entity Insignias ---');
  for (const entity of ENTITIES_TO_REMEDIATE) {
    const destPath = path.join(process.cwd(), 'public/images/entities', entity.filename);
    const svgStr = generateInsigniaSvg(entity);
    const jpegBuffer = await sharp(Buffer.from(svgStr))
      .jpeg({ quality: 85, progressive: true })
      .toBuffer();
    fs.writeFileSync(destPath, jpegBuffer);
    console.log(`✓ Replaced corrupt ${entity.filename} with valid 800x450 MozJPEG (${jpegBuffer.length} bytes)`);
  }

  // Remediation 2: Replace OpenGraph SVGs with genuine 1200x630 MozJPEGs
  console.log('\n--- Remediation 2: OpenGraph 1200x630 Raster Previews ---');
  const ogDefaultSvg = generateSiteOgSvg('Transforming Information into Understanding', 'Deep investigative reporting, statutory audit trails, and policy analysis.');
  const ogDefaultBuf = await sharp(Buffer.from(ogDefaultSvg))
    .jpeg({ quality: 85, progressive: true })
    .toBuffer();
  fs.writeFileSync('public/images/og-default.jpg', ogDefaultBuf);
  console.log(`✓ Replaced og-default.jpg with valid 1200x630 MozJPEG (${ogDefaultBuf.length} bytes)`);

  const ogHomeSvg = generateSiteOgSvg('The Knowledge Operating System', 'Primary sources, verified claims, and systemic investigations for India.');
  const ogHomeBuf = await sharp(Buffer.from(ogHomeSvg))
    .jpeg({ quality: 85, progressive: true })
    .toBuffer();
  fs.writeFileSync('public/images/og-home.jpg', ogHomeBuf);
  console.log(`✓ Replaced og-home.jpg with valid 1200x630 MozJPEG (${ogHomeBuf.length} bytes)`);

  // Remediation 3: MIME type mismatches
  console.log('\n--- Remediation 3: MIME Type Mismatches & Oversized Images ---');
  
  // semiconductor-capacity.png (was JPEG inside .png)
  const scBuf = fs.readFileSync('public/images/charts/semiconductor-capacity.png');
  const scPngBuf = await sharp(scBuf).png().toBuffer();
  fs.writeFileSync('public/images/charts/semiconductor-capacity.png', scPngBuf);
  console.log(`✓ Re-encoded semiconductor-capacity.png to valid PNG (${scPngBuf.length} bytes)`);

  // Convert SVG-in-JPG story heroes to real MozJPEG
  const storySvgsToJpeg = [
    'public/images/stories/ethanol-backlash.jpg',
    'public/images/stories/ews-quota-upsc.jpg',
    'public/images/stories/satluj-ban.jpg'
  ];
  for (const sPath of storySvgsToJpeg) {
    const raw = fs.readFileSync(sPath);
    const converted = await sharp(raw).jpeg({ quality: 85, progressive: true }).toBuffer();
    fs.writeFileSync(sPath, converted);
    console.log(`✓ Re-encoded ${path.basename(sPath)} to valid MozJPEG (${converted.length} bytes)`);
  }

  // Convert PNG-in-JPG entities to real MozJPEG and compress oversized sco.jpg
  const pngsInJpg = [
    'public/images/entities/sco.jpg',
    'public/images/entities/bimstec.jpg',
    'public/images/entities/brics.jpg',
    'public/images/entities/cag.jpg',
    'public/images/entities/election-commission.jpg',
    'public/images/entities/imf.jpg',
    'public/images/entities/india.jpg',
    'public/images/entities/un.jpg',
    'public/images/entities/rbi.jpg',
    'public/images/entities/ministry-of-agriculture.jpg',
    'public/images/entities/ministry-of-rural-development.jpg',
    'public/images/entities/ministry-of-women-and-child-development.jpg',
    'public/images/entities/nam.jpg',
    'public/images/entities/saarc.jpg',
    'public/images/stories/electoral-bonds.jpg',
    'public/images/stories/india-europe-relations.jpg',
    'public/images/stories/us-iran-relations.jpg'
  ];
  for (const pPath of pngsInJpg) {
    const raw = fs.readFileSync(pPath);
    const beforeSize = raw.length;
    const converted = await sharp(raw).jpeg({ quality: 82, progressive: true }).toBuffer();
    fs.writeFileSync(pPath, converted);
    console.log(`✓ Re-encoded ${path.basename(pPath)} from PNG to MozJPEG (${Math.round(beforeSize/1024)}KB -> ${Math.round(converted.length/1024)}KB)`);
  }

  console.log('\nAll targeted remediations executed successfully.');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});

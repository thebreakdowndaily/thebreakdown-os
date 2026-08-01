// scripts/audit/editorial/executePhase125bBaselineGate.ts
// Phase 12.5B — Batch 0: Computational Baseline Gate
// READ-ONLY. Produces verified baselines for all subsequent mutation batches.

import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'fs';
import { join, extname } from 'path';

// ── WCAG 2.1 Relative Luminance & Contrast ────────────────────────────────────

function srgbToLinear(c: number): number {
  const n = c / 255;
  return n <= 0.04045 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
}

function relativeLuminance(r: number, g: number, b: number): number {
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return [r, g, b];
}

function contrastRatio(hex1: string, hex2: string): number {
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);
  const L1 = relativeLuminance(r1, g1, b1);
  const L2 = relativeLuminance(r2, g2, b2);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Porter-Duff source-over alpha compositing
function compositeAlphaHex(fg: string, alpha: number, bg: string): string {
  const [fr, fg2, fb] = hexToRgb(fg);
  const [br, bg2, bb] = hexToRgb(bg);
  const r = Math.round(alpha * fr + (1 - alpha) * br);
  const g = Math.round(alpha * fg2 + (1 - alpha) * bg2);
  const b = Math.round(alpha * fb + (1 - alpha) * bb);
  return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('');
}

// ── File Walker ───────────────────────────────────────────────────────────────

function walkDir(dir: string, exts: string[], results: string[] = []): string[] {
  let entries: string[] = [];
  try { entries = readdirSync(dir); } catch { return results; }
  for (const entry of entries) {
    if (entry.startsWith('.') || entry === 'node_modules' || entry === '.next') continue;
    const full = join(dir, entry);
    let stat;
    try { stat = statSync(full); } catch { continue; }
    if (stat.isDirectory()) {
      walkDir(full, exts, results);
    } else if (exts.includes(extname(entry))) {
      results.push(full);
    }
  }
  return results;
}

// ── Main Audit ────────────────────────────────────────────────────────────────

interface ContrastResult {
  label: string;
  fgHex: string;
  bgHex: string;
  bgNote?: string;
  effectiveBgHex: string;
  ratio: number;
  aaPass: boolean;
  aaaPass: boolean;
  aaLargePass: boolean;
}

interface HardcodedToken {
  file: string;
  line: number;
  value: string;
  context: string;
}

async function main() {
  console.log('=======================================================================');
  console.log('  PHASE 12.5B — BATCH 0: COMPUTATIONAL BASELINE GATE');
  console.log('=======================================================================\n');

  const root = process.cwd();
  const outDir = join(root, 'audit_reports', 'editorial');
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  // ── Step 1: Verified WCAG Contrast Pairs ──────────────────────────────────
  console.log('--- STEP 1: Computing WCAG 2.1 Contrast Ratios (Machine-Verified) ---\n');

  const CANVAS = '#0a0a0a';  // StoryShell editorial canvas
  const BG_PRIMARY = '#18181b';  // --color-bg-primary (neutral-900)
  const NEUTRAL_900_70_OVER_CANVAS = compositeAlphaHex('#27272a', 0.70, CANVAS);
  const NEUTRAL_900_70_OVER_PRIMARY = compositeAlphaHex('#27272a', 0.70, BG_PRIMARY);

  const pairs: ContrastResult[] = [
    // ── Core text on canvas ────────────────────────────────────────────────
    {
      label: 'Primary prose text (white) on editorial canvas',
      fgHex: '#ffffff',
      bgHex: CANVAS,
      effectiveBgHex: CANVAS,
      ratio: contrastRatio('#ffffff', CANVAS),
      aaPass: contrastRatio('#ffffff', CANVAS) >= 4.5,
      aaaPass: contrastRatio('#ffffff', CANVAS) >= 7.0,
      aaLargePass: contrastRatio('#ffffff', CANVAS) >= 3.0,
    },
    {
      label: 'neutral-100 (#f4f4f5) on editorial canvas',
      fgHex: '#f4f4f5',
      bgHex: CANVAS,
      effectiveBgHex: CANVAS,
      ratio: contrastRatio('#f4f4f5', CANVAS),
      aaPass: contrastRatio('#f4f4f5', CANVAS) >= 4.5,
      aaaPass: contrastRatio('#f4f4f5', CANVAS) >= 7.0,
      aaLargePass: contrastRatio('#f4f4f5', CANVAS) >= 3.0,
    },
    {
      label: 'neutral-200 (#e4e4e7) prose on editorial canvas',
      fgHex: '#e4e4e7',
      bgHex: CANVAS,
      effectiveBgHex: CANVAS,
      ratio: contrastRatio('#e4e4e7', CANVAS),
      aaPass: contrastRatio('#e4e4e7', CANVAS) >= 4.5,
      aaaPass: contrastRatio('#e4e4e7', CANVAS) >= 7.0,
      aaLargePass: contrastRatio('#e4e4e7', CANVAS) >= 3.0,
    },
    {
      label: 'neutral-400 (#a1a1aa) muted text on editorial canvas',
      fgHex: '#a1a1aa',
      bgHex: CANVAS,
      effectiveBgHex: CANVAS,
      ratio: contrastRatio('#a1a1aa', CANVAS),
      aaPass: contrastRatio('#a1a1aa', CANVAS) >= 4.5,
      aaaPass: contrastRatio('#a1a1aa', CANVAS) >= 7.0,
      aaLargePass: contrastRatio('#a1a1aa', CANVAS) >= 3.0,
    },
    {
      label: 'neutral-500 (#71717a) muted metadata on bg-primary [PHASE 12.5A STATED FAIL]',
      fgHex: '#71717a',
      bgHex: BG_PRIMARY,
      effectiveBgHex: BG_PRIMARY,
      ratio: contrastRatio('#71717a', BG_PRIMARY),
      aaPass: contrastRatio('#71717a', BG_PRIMARY) >= 4.5,
      aaaPass: contrastRatio('#71717a', BG_PRIMARY) >= 7.0,
      aaLargePass: contrastRatio('#71717a', BG_PRIMARY) >= 3.0,
    },
    {
      label: 'neutral-500 (#71717a) muted metadata on editorial canvas',
      fgHex: '#71717a',
      bgHex: CANVAS,
      effectiveBgHex: CANVAS,
      ratio: contrastRatio('#71717a', CANVAS),
      aaPass: contrastRatio('#71717a', CANVAS) >= 4.5,
      aaaPass: contrastRatio('#71717a', CANVAS) >= 7.0,
      aaLargePass: contrastRatio('#71717a', CANVAS) >= 3.0,
    },
    // ── Translucent card surfaces ──────────────────────────────────────────
    {
      label: 'neutral-400 text on neutral-900/70 card COMPOSITED over canvas',
      fgHex: '#a1a1aa',
      bgHex: '#27272a',
      bgNote: `bg-neutral-900/70 composited over ${CANVAS} → ${NEUTRAL_900_70_OVER_CANVAS}`,
      effectiveBgHex: NEUTRAL_900_70_OVER_CANVAS,
      ratio: contrastRatio('#a1a1aa', NEUTRAL_900_70_OVER_CANVAS),
      aaPass: contrastRatio('#a1a1aa', NEUTRAL_900_70_OVER_CANVAS) >= 4.5,
      aaaPass: contrastRatio('#a1a1aa', NEUTRAL_900_70_OVER_CANVAS) >= 7.0,
      aaLargePass: contrastRatio('#a1a1aa', NEUTRAL_900_70_OVER_CANVAS) >= 3.0,
    },
    {
      label: 'neutral-500 text on neutral-900/70 card COMPOSITED over canvas [ExploreConnections L112]',
      fgHex: '#71717a',
      bgHex: '#27272a',
      bgNote: `bg-neutral-900/70 composited over ${CANVAS} → ${NEUTRAL_900_70_OVER_CANVAS}`,
      effectiveBgHex: NEUTRAL_900_70_OVER_CANVAS,
      ratio: contrastRatio('#71717a', NEUTRAL_900_70_OVER_CANVAS),
      aaPass: contrastRatio('#71717a', NEUTRAL_900_70_OVER_CANVAS) >= 4.5,
      aaaPass: contrastRatio('#71717a', NEUTRAL_900_70_OVER_CANVAS) >= 7.0,
      aaLargePass: contrastRatio('#71717a', NEUTRAL_900_70_OVER_CANVAS) >= 3.0,
    },
    {
      label: 'neutral-400 italic text on card COMPOSITED [ExploreConnections L107]',
      fgHex: '#a1a1aa',
      bgHex: '#27272a',
      bgNote: `bg-neutral-900/70 composited over ${CANVAS} → ${NEUTRAL_900_70_OVER_CANVAS}`,
      effectiveBgHex: NEUTRAL_900_70_OVER_CANVAS,
      ratio: contrastRatio('#a1a1aa', NEUTRAL_900_70_OVER_CANVAS),
      aaPass: contrastRatio('#a1a1aa', NEUTRAL_900_70_OVER_CANVAS) >= 4.5,
      aaaPass: contrastRatio('#a1a1aa', NEUTRAL_900_70_OVER_CANVAS) >= 7.0,
      aaLargePass: contrastRatio('#a1a1aa', NEUTRAL_900_70_OVER_CANVAS) >= 3.0,
    },
    // ── Accent / badge text ────────────────────────────────────────────────
    {
      label: 'emerald-400 (#34d399) badge text on emerald-950 (#022c22)',
      fgHex: '#34d399',
      bgHex: '#022c22',
      effectiveBgHex: '#022c22',
      ratio: contrastRatio('#34d399', '#022c22'),
      aaPass: contrastRatio('#34d399', '#022c22') >= 4.5,
      aaaPass: contrastRatio('#34d399', '#022c22') >= 7.0,
      aaLargePass: contrastRatio('#34d399', '#022c22') >= 3.0,
    },
    {
      label: 'Mode switcher active: neutral-950 (#0a0a0a) on emerald-500 (#10b981) [StoryShell L82]',
      fgHex: '#0a0a0a',
      bgHex: '#10b981',
      effectiveBgHex: '#10b981',
      ratio: contrastRatio('#0a0a0a', '#10b981'),
      aaPass: contrastRatio('#0a0a0a', '#10b981') >= 4.5,
      aaaPass: contrastRatio('#0a0a0a', '#10b981') >= 7.0,
      aaLargePass: contrastRatio('#0a0a0a', '#10b981') >= 3.0,
    },
    {
      label: 'amber focus ring (#f59e0b) on editorial canvas — visibility check',
      fgHex: '#f59e0b',
      bgHex: CANVAS,
      effectiveBgHex: CANVAS,
      ratio: contrastRatio('#f59e0b', CANVAS),
      aaPass: contrastRatio('#f59e0b', CANVAS) >= 3.0, // focus indicators use 3:1 threshold (WCAG 1.4.11)
      aaaPass: contrastRatio('#f59e0b', CANVAS) >= 4.5,
      aaLargePass: contrastRatio('#f59e0b', CANVAS) >= 3.0,
    },
    {
      label: 'emerald focus ring (#34d399) on editorial canvas — visibility check',
      fgHex: '#34d399',
      bgHex: CANVAS,
      effectiveBgHex: CANVAS,
      ratio: contrastRatio('#34d399', CANVAS),
      aaPass: contrastRatio('#34d399', CANVAS) >= 3.0,
      aaaPass: contrastRatio('#34d399', CANVAS) >= 4.5,
      aaLargePass: contrastRatio('#34d399', CANVAS) >= 3.0,
    },
  ];

  pairs.forEach(p => {
    const status = p.aaPass ? '✅ PASS' : '❌ FAIL';
    console.log(`  ${status} ${p.ratio.toFixed(2)}:1 — ${p.label}`);
    if (p.bgNote) console.log(`         ↳ ${p.bgNote}`);
  });

  const failures = pairs.filter(p => !p.aaPass);
  console.log(`\n  AA Failures: ${failures.length} / ${pairs.length}`);
  failures.forEach(f => console.log(`  ❌ ${f.label} (${f.ratio.toFixed(2)}:1)`));

  // ── Step 2: Full Hardcoded-Value Inventory ─────────────────────────────────
  console.log('\n--- STEP 2: Full Hardcoded Hex Value Inventory ---\n');
  const searchDirs = [
    join(root, 'components'),
    join(root, 'app'),
    join(root, 'styles'),
  ];

  const hexPattern = /(?:bg|text|border|from|to|via|ring|shadow|fill|stroke)-\[#[0-9a-fA-F]{3,8}\]/g;
  const hardcodedTokens: HardcodedToken[] = [];

  for (const dir of searchDirs) {
    const files = walkDir(dir, ['.tsx', '.ts', '.css', '.jsx']);
    for (const file of files) {
      let content: string;
      try { content = readFileSync(file, 'utf-8'); } catch { continue; }
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        const matches = line.match(hexPattern);
        if (matches) {
          matches.forEach(m => {
            hardcodedTokens.push({
              file: file.replace(root, '').replace(/\\/g, '/'),
              line: idx + 1,
              value: m,
              context: line.trim().substring(0, 120),
            });
          });
        }
      });
    }
  }

  // Group by file
  const byFile = new Map<string, HardcodedToken[]>();
  hardcodedTokens.forEach(t => {
    if (!byFile.has(t.file)) byFile.set(t.file, []);
    byFile.get(t.file)!.push(t);
  });

  console.log(`  Total hardcoded hex utility classes: ${hardcodedTokens.length}`);
  console.log(`  Files affected: ${byFile.size}`);

  // ── Step 3: Focus-Visible Coverage in Story Path ───────────────────────────
  console.log('\n--- STEP 3: Focus-Visible Coverage in Story Reader Path ---\n');
  const storyFiles = walkDir(join(root, 'components', 'story'), ['.tsx']);
  const rxsFiles = walkDir(join(root, 'components', 'rxs'), ['.tsx']);
  const storyPathFiles = [...storyFiles, ...rxsFiles];

  let interactiveElements = 0;
  let withFocusVisible = 0;

  for (const file of storyPathFiles) {
    let content: string;
    try { content = readFileSync(file, 'utf-8'); } catch { continue; }
    const interactiveMatches = content.match(/<(a|button|input|select|textarea)[\s>]/g) || [];
    interactiveElements += interactiveMatches.length;
    if (content.includes('focus-visible')) withFocusVisible++;
  }

  const coveragePct = storyPathFiles.length > 0 ? (withFocusVisible / storyPathFiles.length * 100).toFixed(1) : '0';
  console.log(`  Story-path component files: ${storyPathFiles.length}`);
  console.log(`  Files with focus-visible rule: ${withFocusVisible} / ${storyPathFiles.length} (${coveragePct}%)`);
  console.log(`  Interactive element tags found: ${interactiveElements}`);

  // Files with interactive elements but no focus-visible
  const filesWithGap: string[] = [];
  for (const file of storyPathFiles) {
    let content: string;
    try { content = readFileSync(file, 'utf-8'); } catch { continue; }
    const hasInteractive = /<(a|button|input|select|textarea)[\s>]/.test(content);
    const hasFocusVisible = content.includes('focus-visible');
    if (hasInteractive && !hasFocusVisible) {
      filesWithGap.push(file.replace(root, '').replace(/\\/g, '/'));
    }
  }
  console.log(`\n  Story-path files with interactive elements but NO focus-visible rule:`);
  filesWithGap.forEach(f => console.log(`    ⚠️  ${f}`));

  // ── Step 4: Token Existence Check ─────────────────────────────────────────
  console.log('\n--- STEP 4: Token Existence in tailwind.config.ts ---\n');
  const twConfig = readFileSync(join(root, 'tailwind.config.ts'), 'utf-8');
  const checks = [
    { name: 'surface.primary', pattern: "primary: 'var(--color-bg-primary)'" },
    { name: 'surface.secondary', pattern: "secondary: 'var(--color-bg-secondary)'" },
    { name: 'surface.canvas', pattern: "canvas:" },
    { name: '--color-bg-canvas (tokens.css)', pattern: '--color-bg-canvas' },
    { name: '--color-focus-ring (tokens.css)', pattern: '--color-focus-ring' },
  ];
  const tokensCss = readFileSync(join(root, 'design-system', 'tokens.css'), 'utf-8');
  checks.forEach(c => {
    const src = c.name.includes('tokens.css') ? tokensCss : twConfig;
    const exists = src.includes(c.pattern);
    console.log(`  ${exists ? '✅' : '❌ MISSING'} ${c.name}`);
  });

  // ── Step 5: Save Report ────────────────────────────────────────────────────
  console.log('\n--- STEP 5: Saving Baseline Report ---\n');

  const report = {
    timestamp: new Date().toISOString(),
    resolvedOpenQuestions: {
      OQ1_focusRing: 'OPTION_C — --color-focus-ring token (amber default); knowledge surfaces may override with emerald',
      OQ2_canvasIntent: 'OPTION_A — #0a0a0a is intentional editorial canvas; promote to --color-bg-canvas token',
    },
    contrastPairs: pairs.map(p => ({
      label: p.label,
      fgHex: p.fgHex,
      bgHex: p.bgHex,
      bgNote: p.bgNote,
      effectiveBgHex: p.effectiveBgHex,
      ratio: parseFloat(p.ratio.toFixed(2)),
      aaPass: p.aaPass,
      aaaPass: p.aaaPass,
    })),
    aaFailures: failures.map(f => f.label),
    hardcodedInventory: {
      totalInstances: hardcodedTokens.length,
      filesAffected: byFile.size,
      tokens: hardcodedTokens,
    },
    focusCoverage: {
      storyPathFiles: storyPathFiles.length,
      filesWithFocusVisible: withFocusVisible,
      coveragePercent: parseFloat(coveragePct),
      gapFiles: filesWithGap,
    },
    tokenExistenceGaps: checks
      .filter(c => {
        const src = c.name.includes('tokens.css') ? tokensCss : twConfig;
        return !src.includes(c.pattern);
      })
      .map(c => c.name),
  };

  const jsonPath = join(outDir, 'phase12_5b_baseline.json');
  const mdPath = join(outDir, 'phase12_5b_baseline_report.md');
  writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf-8');

  // Markdown
  let md = `# Phase 12.5B — Batch 0: Computational Baseline Gate\n\n`;
  md += `**Timestamp**: ${report.timestamp}\n`;
  md += `**OQ-1 (Focus Ring)**: ${report.resolvedOpenQuestions.OQ1_focusRing}\n`;
  md += `**OQ-2 (Canvas Intent)**: ${report.resolvedOpenQuestions.OQ2_canvasIntent}\n\n`;

  md += `## WCAG 2.1 Contrast Pairs (Machine-Verified)\n\n`;
  md += `| Pair | FG | Effective BG | Ratio | AA | AAA |\n|---|---|---|---|---|---|\n`;
  pairs.forEach(p => {
    md += `| ${p.label} | \`${p.fgHex}\` | \`${p.effectiveBgHex}\`${p.bgNote ? ` *(${p.bgNote})*` : ''} | **${p.ratio.toFixed(2)}:1** | ${p.aaPass ? '✅' : '❌'} | ${p.aaaPass ? '✅' : '❌'} |\n`;
  });

  md += `\n### AA Failures\n\n`;
  if (failures.length === 0) {
    md += `No AA failures found.\n\n`;
  } else {
    failures.forEach(f => md += `- ❌ **${f.label}** (${f.ratio.toFixed(2)}:1)\n`);
    md += '\n';
  }

  md += `## Hardcoded Hex Value Inventory\n\n`;
  md += `- **Total instances**: ${hardcodedTokens.length}\n`;
  md += `- **Files affected**: ${byFile.size}\n\n`;
  md += `### By File\n\n`;
  byFile.forEach((tokens, file) => {
    md += `**${file}** (${tokens.length} instances)\n`;
    tokens.slice(0, 3).forEach(t => md += `- L${t.line}: \`${t.value}\`\n`);
    if (tokens.length > 3) md += `- …and ${tokens.length - 3} more\n`;
    md += '\n';
  });

  md += `## Focus-Visible Coverage\n\n`;
  md += `- Story-path files: **${storyPathFiles.length}**\n`;
  md += `- Files with focus-visible: **${withFocusVisible}** (${coveragePct}%)\n\n`;
  if (filesWithGap.length > 0) {
    md += `### Files with interactive elements but no focus-visible rule\n\n`;
    filesWithGap.forEach(f => md += `- \`${f}\`\n`);
    md += '\n';
  }

  md += `## Token Existence Gaps\n\n`;
  if (report.tokenExistenceGaps.length === 0) {
    md += `All required tokens exist.\n\n`;
  } else {
    report.tokenExistenceGaps.forEach(t => md += `- ❌ **MISSING**: \`${t}\`\n`);
    md += '\n';
  }

  writeFileSync(mdPath, md, 'utf-8');
  console.log(`  Baseline saved: audit_reports/editorial/phase12_5b_baseline.json`);
  console.log(`  Baseline saved: audit_reports/editorial/phase12_5b_baseline_report.md`);
  console.log(`\n✅ Phase 12.5B Batch 0 complete. Ready for Batch 1.\n`);
}

main().catch(console.error);

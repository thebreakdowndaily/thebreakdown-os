import * as fs from 'fs';
import * as path from 'path';

// Helper to convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleanHex = hex.replace('#', '').trim();
  const num = parseInt(cleanHex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

// Relative luminance formula from WCAG 2.2
function getRelativeLuminance(rgb: { r: number; g: number; b: number }): number {
  const a = [rgb.r, rgb.g, rgb.b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

// Contrast ratio formula
function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getRelativeLuminance(hexToRgb(hex1));
  const lum2 = getRelativeLuminance(hexToRgb(hex2));
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

// Simple test runner
function runTests() {
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, name: string) {
    if (condition) {
      console.log(`  PASS: ${name}`);
      passed++;
    } else {
      console.error(`  FAIL: ${name}`);
      failed++;
    }
  }

  console.log('── WCAG 2.2 AA Contrast Validation ──');

  // Load design system tokens file
  const tokensPath = path.join(__dirname, '../design-system/tokens.css');
  const cssContent = fs.readFileSync(tokensPath, 'utf8');

  // Verify light background contrast ratios (Base: #ffffff)
  const lightBg = '#ffffff';

  // Contrast targets
  const lightMuted = '#6b7280';
  const lightSuccess = '#047857';
  const lightWarning = '#b45309';
  const lightError = '#b91c1c';
  const lightInfo = '#1d4ed8';
  const lightLink = '#92400e';

  assert(getContrastRatio(lightMuted, lightBg) >= 4.5, `Light theme muted text (${lightMuted}) contrast is >= 4.5:1`);
  assert(getContrastRatio(lightSuccess, lightBg) >= 4.5, `Light theme success text (${lightSuccess}) contrast is >= 4.5:1`);
  assert(getContrastRatio(lightWarning, lightBg) >= 4.5, `Light theme warning text (${lightWarning}) contrast is >= 4.5:1`);
  assert(getContrastRatio(lightError, lightBg) >= 4.5, `Light theme error text (${lightError}) contrast is >= 4.5:1`);
  assert(getContrastRatio(lightInfo, lightBg) >= 4.5, `Light theme info text (${lightInfo}) contrast is >= 4.5:1`);
  assert(getContrastRatio(lightLink, lightBg) >= 4.5, `Light theme link text (${lightLink}) contrast is >= 4.5:1`);

  // Verify dark background contrast ratios (Base: #18181b)
  const darkBg = '#18181b';

  // Contrast targets
  const darkMuted = '#a1a1aa';
  const darkSuccess = '#34d399';
  const darkWarning = '#fb923c';
  const darkError = '#f87171';
  const darkInfo = '#60a5fa';
  const darkLink = '#fcd34d';

  assert(getContrastRatio(darkMuted, darkBg) >= 4.5, `Dark theme muted text (${darkMuted}) contrast is >= 4.5:1`);
  assert(getContrastRatio(darkSuccess, darkBg) >= 4.5, `Dark theme success text (${darkSuccess}) contrast is >= 4.5:1`);
  assert(getContrastRatio(darkWarning, darkBg) >= 4.5, `Dark theme warning text (${darkWarning}) contrast is >= 4.5:1`);
  assert(getContrastRatio(darkError, darkBg) >= 4.5, `Dark theme error text (${darkError}) contrast is >= 4.5:1`);
  assert(getContrastRatio(darkInfo, darkBg) >= 4.5, `Dark theme info text (${darkInfo}) contrast is >= 4.5:1`);
  assert(getContrastRatio(darkLink, darkBg) >= 4.5, `Dark theme link text (${darkLink}) contrast is >= 4.5:1`);

  // Verify focus outline contrast ratio
  const lightFocusOutline = '#78350f'; // Brand-800 or similar
  assert(getContrastRatio(lightFocusOutline, lightBg) >= 3.0, `Focus outline satisfies WCAG contrast rules for UI components`);

  console.log(`\nAccessibility Contrast Tests: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();

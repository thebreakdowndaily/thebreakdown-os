/**
 * ─── Canonical Table Value Normalizer (Phase 4B-3B) ───────────────────────────
 *
 * Governing documents:
 *   - Level 1 Editorial Constitution v1.1
 *   - AGENTS.md (Verification & Idempotency)
 *   - .planning/PHASE-4B-3A-STRUCTURED-MUTATION-DESIGN.md
 *
 * Provides deterministic parsing of numbers, units, periods, and denominators
 * from raw cell text while preserving the original string verbatim.
 */

import type { CanonicalDataType, CanonicalCell } from '@/types/canonical-table';

const DEVANAGARI_DIGITS: Record<string, string> = {
  '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
  '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
};

export function convertDevanagariDigits(str: string): string {
  return str.replace(/[०-९]/g, (d) => DEVANAGARI_DIGITS[d] || d);
}

export function normalizeColumnKey(label: string, existingKeys: Set<string> = new Set()): string {
  const converted = convertDevanagariDigits(label);
  let baseKey = converted
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, ' ')
    .replace(/[\s_-]+/g, '_')
    .replace(/^_+|_+$/g, '');

  if (!baseKey) {
    baseKey = 'col';
  }

  let finalKey = baseKey;
  let counter = 2;
  while (existingKeys.has(finalKey)) {
    finalKey = `${baseKey}_${counter}`;
    counter++;
  }
  existingKeys.add(finalKey);
  return finalKey;
}

export function parseCellContent(
  raw: string,
  inheritedUnit?: string,
  inheritedPeriod?: string,
  inheritedDenominator?: string
): CanonicalCell & { dataType: CanonicalDataType } {
  const flags: string[] = [];
  const trimmed = raw.trim();

  // Null/Empty value representations
  if (
    !trimmed ||
    trimmed === '-' ||
    trimmed === '–' ||
    trimmed === '—' ||
    trimmed === 'N/A' ||
    trimmed === 'n/a' ||
    trimmed === 'NA' ||
    trimmed === 'nil' ||
    trimmed === 'NIL' ||
    trimmed === 'null' ||
    trimmed === '.'
  ) {
    return {
      raw,
      valueNumeric: null,
      valueFormatted: undefined,
      unit: inheritedUnit,
      period: inheritedPeriod,
      denominator: inheritedDenominator,
      flags: trimmed && trimmed !== '' ? ['empty_placeholder'] : undefined,
      dataType: 'text',
    };
  }

  let working = convertDevanagariDigits(trimmed);

  // Check for footnotes / annotations attached to value (e.g. "1217.05*", "1217.05#", "1217.05(P)")
  if (/[*#†‡]$/.test(working)) {
    flags.push('footnote');
    working = working.replace(/[*#†‡]+$/, '').trim();
  }
  if (/\([pPeErRaAbBcCdD]\)$/.test(working)) {
    flags.push('provisional');
    working = working.replace(/\([pPeErRaAbBcCdD]\)$/, '').trim();
  }

  // Detect and extract Unit
  let detectedUnit = inheritedUnit;
  if (/(\bcrore\b|\bcr\.?\b|करोड़)/i.test(working)) {
    detectedUnit = 'crore';
    working = working.replace(/(\bcrore\b|\bcr\.?\b|करोड़)/gi, '').trim();
  } else if (/(\blakh\b|\blk\.?\b|लाख)/i.test(working)) {
    detectedUnit = 'lakh';
    working = working.replace(/(\blakh\b|\blk\.?\b|लाख)/gi, '').trim();
  } else if (/(\bbillion\b|\bbn\.?\b)/i.test(working)) {
    detectedUnit = 'billion';
    working = working.replace(/(\bbillion\b|\bbn\.?\b)/gi, '').trim();
  } else if (/(\bmillion\b|\bmn\.?\b)/i.test(working)) {
    detectedUnit = 'million';
    working = working.replace(/(\bmillion\b|\bmn\.?\b)/gi, '').trim();
  } else if (/(\bthousand\b|हज़ार)/i.test(working)) {
    detectedUnit = 'thousand';
    working = working.replace(/(\bthousand\b|हज़ार)/gi, '').trim();
  } else if (/(\bmt\b|\bmetric\s+tonnes?\b)/i.test(working)) {
    detectedUnit = 'metric_tonnes';
    working = working.replace(/(\bmt\b|\bmetric\s+tonnes?\b)/gi, '').trim();
  } else if (/(\bquintals?\b)/i.test(working)) {
    detectedUnit = 'quintal';
    working = working.replace(/(\bquintals?\b)/gi, '').trim();
  } else if (/(\bkg\b|\bkilograms?\b)/i.test(working)) {
    detectedUnit = 'kg';
    working = working.replace(/(\bkg\b|\bkilograms?\b)/gi, '').trim();
  }

  // Detect and extract Currency
  let isCurrency = false;
  if (/(₹|rs\.?|inr|\$|\busd\b)/i.test(working)) {
    isCurrency = true;
    if (/(₹|rs\.?|inr)/i.test(working)) {
      if (!detectedUnit || detectedUnit === 'crore' || detectedUnit === 'lakh') {
        detectedUnit = detectedUnit ? `${detectedUnit}_inr` : 'inr';
      }
    } else if (/(\$|\busd\b)/i.test(working)) {
      detectedUnit = detectedUnit ? `${detectedUnit}_usd` : 'usd';
    }
    working = working.replace(/(₹|rs\.?|inr|\$|\busd\b)/gi, '').trim();
  }

  // Detect Percentage
  let isPercentage = false;
  if (/%|\bpercent\b|\bpct\b/i.test(working)) {
    isPercentage = true;
    detectedUnit = '%';
    working = working.replace(/(%|\bpercent\b|\bpct\b)/gi, '').trim();
  }

  // Detect and extract Period
  let detectedPeriod = inheritedPeriod;
  const periodMatch = working.match(/\b(FY\s*\d{2,4}(?:-\d{2,4})?|\d{4}-\d{2,4}|Q[1-4]\s*(?:FY)?\d{2,4}|\b(?:19|20)\d{2}\b)/i);
  if (periodMatch && periodMatch[0]) {
    detectedPeriod = periodMatch[0].replace(/\s+/g, '');
  }

  // Detect Denominator
  let detectedDenominator = inheritedDenominator;
  if (/per\s+capita/i.test(working)) {
    detectedDenominator = 'per_capita';
  } else if (/per\s+lakh/i.test(working)) {
    detectedDenominator = 'per_lakh';
  } else if (/per\s+1,?000/i.test(working)) {
    detectedDenominator = 'per_1000';
  } else if (/% of\s+gsdp/i.test(working)) {
    detectedDenominator = 'pct_gsdp';
  } else if (/% of\s+gdp/i.test(working)) {
    detectedDenominator = 'pct_gdp';
  }

  // Handle accounting parentheses for negative numbers e.g. "(120.5)" -> -120.5
  let isNegative = false;
  if (/^\((.+)\)$/.test(working)) {
    isNegative = true;
    working = working.replace(/^\((.+)\)$/, '$1').trim();
  } else if (/^[-−]/.test(working)) {
    isNegative = true;
    working = working.replace(/^[-−]/, '').trim();
  } else if (/^\+/.test(working)) {
    working = working.replace(/^\+/, '').trim();
  }

  // Remove commas used as thousand separators (both standard 123,456 and Indian 1,23,456)
  const cleanNumberCandidate = working.replace(/,/g, '').trim();

  // Validate strict numerical representation
  if (/^\d+(?:\.\d+)?$/.test(cleanNumberCandidate)) {
    const rawVal = parseFloat(cleanNumberCandidate);
    if (!isNaN(rawVal)) {
      const finalVal = isNegative ? -rawVal : rawVal;
      let dataType: CanonicalDataType = 'numeric';
      if (isPercentage) dataType = 'percentage';
      else if (isCurrency) dataType = 'currency';

      return {
        raw,
        valueNumeric: finalVal,
        valueFormatted: String(finalVal),
        unit: detectedUnit,
        period: detectedPeriod,
        denominator: detectedDenominator,
        flags: flags.length > 0 ? flags : undefined,
        dataType,
      };
    }
  }

  // Non-numeric text
  return {
    raw,
    valueNumeric: null,
    valueFormatted: undefined,
    unit: detectedUnit,
    period: detectedPeriod,
    denominator: detectedDenominator,
    flags: flags.length > 0 ? flags : undefined,
    dataType: 'text',
  };
}

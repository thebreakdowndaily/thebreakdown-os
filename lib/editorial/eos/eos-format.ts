/**
 * ─── The Breakdown OS — EOS format helpers ─────────────────────────────────────
 * Safe string coercion for template literals and display: primitives only,
 * never invokes default Object stringification.
 */

export function s(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (typeof value === 'boolean') return String(value);
  return '';
}

/**
 * Deterministic parse for normalized intake DECIMAL scalars (positive pay amounts only).
 */
export function parseStrictPositiveDecimal(raw: string): number | null {
  const s = raw.trim();
  if (!/^\d+(\.\d+)?$/.test(s)) return null;
  const n = Number(s);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

export function roundPercentValue(value: number): number {
  return Math.round(value * 1e6) / 1e6;
}

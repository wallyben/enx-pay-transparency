export function mean(values: readonly number[]): number {
  if (values.length === 0) return 0;
  let sum = 0;
  for (const v of values) sum += v;
  return sum / values.length;
}

export function medianSorted(sortedAsc: readonly number[]): number {
  const n = sortedAsc.length;
  if (n === 0) {
    throw new Error('medianSorted: empty array');
  }
  const mid = Math.floor(n / 2);
  if (n % 2 === 1) {
    return sortedAsc[mid]!;
  }
  return (sortedAsc[mid - 1]! + sortedAsc[mid]!) / 2;
}

/**
 * Equal-frequency quartile band in {1,2,3,4} for position i in sorted order (0-based), n items.
 */
export function payQuartileBand(i: number, n: number): 1 | 2 | 3 | 4 {
  if (n <= 0) throw new Error('payQuartileBand: n must be positive');
  if (i < 0 || i >= n) throw new Error('payQuartileBand: i out of range');
  const q = Math.floor((4 * i) / n) + 1;
  return (q > 4 ? 4 : q) as 1 | 2 | 3 | 4;
}

/**
 * EU-style gender pay gap percentage:
 * (maleAggregate − femaleAggregate) / maleAggregate × 100
 */
export function genderGapPercent(maleAggregate: number, femaleAggregate: number): number {
  if (maleAggregate === 0) {
    throw new Error('genderGapPercent: male aggregate must be non-zero');
  }
  return ((maleAggregate - femaleAggregate) / maleAggregate) * 100;
}

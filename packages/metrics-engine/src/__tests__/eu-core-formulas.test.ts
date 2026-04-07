import { genderGapPercent, mean, medianSorted, payQuartileBand } from '../eu-core/statistics';

describe('eu-core statistics helpers', () => {
  it('computes mean', () => {
    expect(mean([100, 100])).toBe(100);
    expect(mean([80, 100])).toBe(90);
  });

  it('computes median for odd and even lengths', () => {
    expect(medianSorted([1, 2, 3])).toBe(2);
    expect(medianSorted([1, 2, 3, 4])).toBe(2.5);
  });

  it('computes EU-style gender gap percent', () => {
    const pct = genderGapPercent(100, 80);
    expect(pct).toBeCloseTo(20, 6);
  });

  it('assigns deterministic quartile bands', () => {
    expect(payQuartileBand(0, 4)).toBe(1);
    expect(payQuartileBand(3, 4)).toBe(4);
    expect(payQuartileBand(0, 5)).toBe(1);
    expect(payQuartileBand(1, 5)).toBe(1);
    expect(payQuartileBand(4, 5)).toBe(4);
  });
});

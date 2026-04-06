import { EffectiveDateRangeSchema, isActiveOn } from '../effective-date';

describe('EffectiveDateRangeSchema', () => {
  it('accepts a valid open-ended range', () => {
    const result = EffectiveDateRangeSchema.safeParse({
      effectiveFrom: new Date('2024-01-01'),
      effectiveTo: null,
    });
    expect(result.success).toBe(true);
  });

  it('accepts a valid closed range', () => {
    const result = EffectiveDateRangeSchema.safeParse({
      effectiveFrom: new Date('2024-01-01'),
      effectiveTo: new Date('2024-12-31'),
    });
    expect(result.success).toBe(true);
  });

  it('rejects effectiveTo before effectiveFrom', () => {
    const result = EffectiveDateRangeSchema.safeParse({
      effectiveFrom: new Date('2024-06-01'),
      effectiveTo: new Date('2024-01-01'),
    });
    expect(result.success).toBe(false);
  });

  it('rejects effectiveTo equal to effectiveFrom', () => {
    const d = new Date('2024-01-01');
    const result = EffectiveDateRangeSchema.safeParse({
      effectiveFrom: d,
      effectiveTo: d,
    });
    expect(result.success).toBe(false);
  });
});

describe('isActiveOn', () => {
  const range = {
    effectiveFrom: new Date('2024-01-01'),
    effectiveTo: new Date('2024-12-31'),
  };

  it('returns true for a date within the range', () => {
    expect(isActiveOn(range, new Date('2024-06-15'))).toBe(true);
  });

  it('returns true on effectiveFrom (inclusive)', () => {
    expect(isActiveOn(range, new Date('2024-01-01'))).toBe(true);
  });

  it('returns false on effectiveTo (exclusive)', () => {
    expect(isActiveOn(range, new Date('2024-12-31'))).toBe(false);
  });

  it('returns false before effectiveFrom', () => {
    expect(isActiveOn(range, new Date('2023-12-31'))).toBe(false);
  });

  it('returns true for an open-ended range with date after effectiveFrom', () => {
    const openRange = { effectiveFrom: new Date('2024-01-01'), effectiveTo: null };
    expect(isActiveOn(openRange, new Date('2099-01-01'))).toBe(true);
  });
});

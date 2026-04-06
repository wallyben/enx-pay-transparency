import { normalizeGradeOrLevelRaw } from '../normalize-grade';

describe('normalizeGradeOrLevelRaw', () => {
  it('parses L-prefixed levels', () => {
    expect(normalizeGradeOrLevelRaw('l3')).toEqual({ kind: 'ok', value: 'L3' });
  });

  it('parses LEVEL tokens', () => {
    expect(normalizeGradeOrLevelRaw('level 2')).toEqual({ kind: 'ok', value: 'L2' });
  });

  it('flags slash-separated values as ambiguous', () => {
    expect(normalizeGradeOrLevelRaw('L1/L2').kind).toBe('ambiguous');
  });

  it('returns unmapped for unknown numeric-only tokens', () => {
    expect(normalizeGradeOrLevelRaw('42').kind).toBe('unmapped');
  });
});

import { normalizeJobTitle } from '../normalize-title';

describe('normalizeJobTitle', () => {
  it('collapses whitespace and uppercases deterministically', () => {
    expect(normalizeJobTitle('  software   engineer ')).toBe('SOFTWARE ENGINEER');
  });

  it('returns null for empty input', () => {
    expect(normalizeJobTitle('')).toBeNull();
    expect(normalizeJobTitle('   ')).toBeNull();
  });
});

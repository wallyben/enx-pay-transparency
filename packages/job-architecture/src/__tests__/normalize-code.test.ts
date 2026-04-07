import { normalizeJobHierarchyCode } from '../normalize-code';

describe('normalizeJobHierarchyCode', () => {
  it('normalizes alphanumerics to stable underscore codes', () => {
    expect(normalizeJobHierarchyCode('  eng / data ')).toEqual({ ok: true, value: 'ENG_DATA' });
  });

  it('rejects empty and invalid shapes', () => {
    expect(normalizeJobHierarchyCode('')).toEqual({ ok: false });
    expect(normalizeJobHierarchyCode('@@@')).toEqual({ ok: false });
  });
});

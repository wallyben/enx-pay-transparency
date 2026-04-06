import { deterministicCategoryId } from '../deterministic-category-id';

describe('deterministicCategoryId', () => {
  it('is stable for identical inputs', () => {
    const a = deterministicCategoryId({
      categoryEngineRulesVersion: 'category-engine-rules.v1',
      basis: 'EXACT',
      keyPayload: {
        titleNormalized: 'engineer',
        familyCodeNormalized: 'f1',
        subfamilyCodeNormalized: 's1',
        gradeOrLevelNormalized: 'l3',
      },
    });
    const b = deterministicCategoryId({
      categoryEngineRulesVersion: 'category-engine-rules.v1',
      basis: 'EXACT',
      keyPayload: {
        titleNormalized: 'engineer',
        familyCodeNormalized: 'f1',
        subfamilyCodeNormalized: 's1',
        gradeOrLevelNormalized: 'l3',
      },
    });
    expect(a).toBe(b);
    expect(a.startsWith('cat_')).toBe(true);
  });

  it('differs when basis differs', () => {
    const exact = deterministicCategoryId({
      categoryEngineRulesVersion: 'category-engine-rules.v1',
      basis: 'EXACT',
      keyPayload: {
        titleNormalized: 'engineer',
        familyCodeNormalized: 'f1',
        subfamilyCodeNormalized: 's1',
        gradeOrLevelNormalized: 'l3',
      },
    });
    const ne = deterministicCategoryId({
      categoryEngineRulesVersion: 'category-engine-rules.v1',
      basis: 'NORMALIZED_EQUIVALENT',
      keyPayload: {
        familyCodeNormalized: 'f1',
        subfamilyCodeNormalized: 's1',
        gradeOrLevelNormalized: 'l3',
      },
    });
    expect(exact).not.toBe(ne);
  });
});

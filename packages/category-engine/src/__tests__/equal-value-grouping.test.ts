import type { EqualValueRuleset, JobNormalizationRowResult } from '@enx/contracts';
import {
  CategoryAssignmentBasis,
  CategoryAssignmentStatus,
  JobNormalizationIssueCode,
} from '@enx/contracts';
import { assignCategoryToJobNormalizationRow } from '../assign-category-row';
import { findEqualValueGroupKey, tryEqualValueCategoryAssignment } from '../equal-value-grouping';

function titleOnlyRow(title: string): JobNormalizationRowResult {
  return {
    rowIndex: 0,
    workerExternalId: 'w1',
    issues: [],
    descriptor: {
      jobNormalizationRulesVersion: 'jn.v1',
      raw: {},
      normalized: {
        titleNormalized: title,
        familyCodeNormalized: null,
        subfamilyCodeNormalized: null,
        gradeOrLevelNormalized: null,
      },
    },
  };
}

describe('findEqualValueGroupKey', () => {
  const ruleset: EqualValueRuleset = {
    methodologyVersion: 'evm-1',
    rulesVersion: 'evr-1',
    groups: [
      {
        groupKey: 'z-second',
        members: [{ titleNormalized: 'z' }],
      },
      {
        groupKey: 'a-first',
        members: [{ titleNormalized: 'a' }, { familyCodeNormalized: 'f', subfamilyCodeNormalized: 's', gradeOrLevelNormalized: 'g' }],
      },
    ],
  };

  it('returns first deterministic match (group key order, then member order)', () => {
    const g = findEqualValueGroupKey(
      {
        titleNormalized: 'a',
        familyCodeNormalized: null,
        subfamilyCodeNormalized: null,
        gradeOrLevelNormalized: null,
      },
      ruleset,
    );
    expect(g).toBe('a-first');
  });

  it('returns null when nothing matches', () => {
    expect(
      findEqualValueGroupKey(
        {
          titleNormalized: 'other',
          familyCodeNormalized: null,
          subfamilyCodeNormalized: null,
          gradeOrLevelNormalized: null,
        },
        ruleset,
      ),
    ).toBeNull();
  });
});

describe('tryEqualValueCategoryAssignment', () => {
  const versions = { methodologyVersion: 'm-v1', rulePackVersion: 'r-v1' };

  it('assigns EQUAL_VALUE when explicit member matches a title-only row that S09 could not assign', () => {
    const row = titleOnlyRow('senior analyst');
    const base = assignCategoryToJobNormalizationRow({ row, ...versions });
    expect(base.status).toBe(CategoryAssignmentStatus.REVIEW_REQUIRED);

    const ruleset: EqualValueRuleset = {
      methodologyVersion: 'evm-1',
      rulesVersion: 'evr-1',
      groups: [{ groupKey: 'analyst-ev', members: [{ titleNormalized: 'senior analyst' }] }],
    };

    const eq = tryEqualValueCategoryAssignment({
      row,
      base,
      equalValueRuleset: ruleset,
      categoryEngineRulesVersion: 'category-engine-rules.v1',
    });
    expect(eq).not.toBeNull();
    expect(eq!.status).toBe(CategoryAssignmentStatus.ASSIGNED);
    expect(eq!.basis).toBe(CategoryAssignmentBasis.EQUAL_VALUE);
    expect(eq!.equalValueGroupKey).toBe('analyst-ev');
    expect(eq!.traceability.equalValueMethodologyVersion).toBe('evm-1');
    expect(eq!.traceability.equalValueRulesVersion).toBe('evr-1');
    expect(eq!.categoryId).toMatch(/^cat_[a-f0-9]{64}$/);
    expect(eq!.metricsCalculationBlocked).toBe(false);
  });

  it('returns null when base is already ASSIGNED (S09 wins)', () => {
    const row: JobNormalizationRowResult = {
      ...titleOnlyRow('x'),
      descriptor: {
        jobNormalizationRulesVersion: 'jn.v1',
        raw: {},
        normalized: {
          titleNormalized: 't',
          familyCodeNormalized: 'f',
          subfamilyCodeNormalized: 's',
          gradeOrLevelNormalized: 'g',
        },
      },
    };
    const base = assignCategoryToJobNormalizationRow({ row, ...versions });
    expect(base.status).toBe(CategoryAssignmentStatus.ASSIGNED);

    const ruleset: EqualValueRuleset = {
      methodologyVersion: 'evm-1',
      rulesVersion: 'evr-1',
      groups: [{ groupKey: 'g', members: [{ titleNormalized: 't' }] }],
    };

    expect(
      tryEqualValueCategoryAssignment({
        row,
        base,
        equalValueRuleset: ruleset,
        categoryEngineRulesVersion: 'category-engine-rules.v1',
      }),
    ).toBeNull();
  });

  it('returns null when job normalization has issues (no silent equal-value on dirty rows)', () => {
    const row = {
      ...titleOnlyRow('senior analyst'),
      issues: [{ code: JobNormalizationIssueCode.JOB_NORM_MISSING_JOB_TITLE, rowIndex: 0 }],
    };
    const base = assignCategoryToJobNormalizationRow({ row, ...versions });
    const ruleset: EqualValueRuleset = {
      methodologyVersion: 'evm-1',
      rulesVersion: 'evr-1',
      groups: [{ groupKey: 'analyst-ev', members: [{ titleNormalized: 'senior analyst' }] }],
    };
    expect(
      tryEqualValueCategoryAssignment({
        row,
        base,
        equalValueRuleset: ruleset,
        categoryEngineRulesVersion: 'category-engine-rules.v1',
      }),
    ).toBeNull();
  });
});

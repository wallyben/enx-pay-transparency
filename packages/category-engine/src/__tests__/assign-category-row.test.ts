import {
  CategoryAssignmentBasis,
  CategoryAssignmentIssueCode,
  CategoryAssignmentStatus,
  JobNormalizationIssueCode,
  type JobNormalizationRowResult,
} from '@enx/contracts';
import { assignCategoryToJobNormalizationRow } from '../assign-category-row';

function baseRow(partial: Partial<JobNormalizationRowResult>): JobNormalizationRowResult {
  return {
    rowIndex: 0,
    workerExternalId: 'w1',
    issues: [],
    descriptor: {
      jobNormalizationRulesVersion: 'jn.v1',
      raw: {},
      normalized: {
        titleNormalized: null,
        familyCodeNormalized: null,
        subfamilyCodeNormalized: null,
        gradeOrLevelNormalized: null,
      },
    },
    ...partial,
  } as JobNormalizationRowResult;
}

describe('assignCategoryToJobNormalizationRow', () => {
  const versions = { methodologyVersion: 'm-v1', rulePackVersion: 'r-v1' };

  it('assigns EXACT when all normalized dimensions are present and job norm is clean', () => {
    const row = baseRow({
      descriptor: {
        jobNormalizationRulesVersion: 'jn.v1',
        raw: {},
        normalized: {
          titleNormalized: 'software engineer',
          familyCodeNormalized: 'eng',
          subfamilyCodeNormalized: 'backend',
          gradeOrLevelNormalized: 'l3',
        },
      },
    });
    const out = assignCategoryToJobNormalizationRow({ row, ...versions });
    expect(out.status).toBe(CategoryAssignmentStatus.ASSIGNED);
    expect(out.basis).toBe(CategoryAssignmentBasis.EXACT);
    expect(out.categoryId).toMatch(/^cat_[a-f0-9]{64}$/);
    expect(out.issues).toHaveLength(0);
    expect(out.traceability.methodologyVersion).toBe('m-v1');
    expect(out.traceability.rulePackVersion).toBe('r-v1');
    expect(out.traceability.jobNormalizationRulesVersion).toBe('jn.v1');
    expect(out.traceability.categoryEngineRulesVersion).toBe('category-engine-rules.v1');
    expect(out.metricsCalculationBlocked).toBe(false);
    expect(out.equalValueGroupKey).toBeNull();
  });

  it('assigns NORMALIZED_EQUIVALENT when hierarchy+grade are present, title absent, and job norm is clean', () => {
    const row = baseRow({
      descriptor: {
        jobNormalizationRulesVersion: 'jn.v1',
        raw: {},
        normalized: {
          titleNormalized: null,
          familyCodeNormalized: 'eng',
          subfamilyCodeNormalized: 'backend',
          gradeOrLevelNormalized: 'l3',
        },
      },
    });
    const out = assignCategoryToJobNormalizationRow({ row, ...versions });
    expect(out.status).toBe(CategoryAssignmentStatus.ASSIGNED);
    expect(out.basis).toBe(CategoryAssignmentBasis.NORMALIZED_EQUIVALENT);
    expect(out.categoryId).toMatch(/^cat_[a-f0-9]{64}$/);
    expect(out.metricsCalculationBlocked).toBe(false);
  });

  it('uses REVIEW_REQUIRED when job normalization reported issues', () => {
    const row = baseRow({
      issues: [
        {
          code: JobNormalizationIssueCode.JOB_NORM_MISSING_JOB_TITLE,
          rowIndex: 0,
        },
      ],
      descriptor: {
        jobNormalizationRulesVersion: 'jn.v1',
        raw: {},
        normalized: {
          titleNormalized: null,
          familyCodeNormalized: 'eng',
          subfamilyCodeNormalized: 'backend',
          gradeOrLevelNormalized: 'l3',
        },
      },
    });
    const out = assignCategoryToJobNormalizationRow({ row, ...versions });
    expect(out.status).toBe(CategoryAssignmentStatus.REVIEW_REQUIRED);
    expect(out.categoryId).toBeNull();
    expect(out.basis).toBeNull();
    expect(out.issues[0]?.code).toBe(
      CategoryAssignmentIssueCode.CAT_ASN_JOB_NORMALIZATION_ISSUES_PRESENT,
    );
    expect(out.jobNormalizationIssueCodes).toEqual([
      JobNormalizationIssueCode.JOB_NORM_MISSING_JOB_TITLE,
    ]);
    expect(out.metricsCalculationBlocked).toBe(true);
  });

  it('marks UNASSIGNED when descriptor is empty', () => {
    const row = baseRow({});
    const out = assignCategoryToJobNormalizationRow({ row, ...versions });
    expect(out.status).toBe(CategoryAssignmentStatus.UNASSIGNED);
    expect(out.categoryId).toBeNull();
    expect(out.issues[0]?.code).toBe(CategoryAssignmentIssueCode.CAT_ASN_DESCRIPTOR_EMPTY);
    expect(out.metricsCalculationBlocked).toBe(true);
  });

  it('marks REVIEW_REQUIRED when descriptor is incomplete (no assignable key)', () => {
    const row = baseRow({
      descriptor: {
        jobNormalizationRulesVersion: 'jn.v1',
        raw: {},
        normalized: {
          titleNormalized: 'only title',
          familyCodeNormalized: null,
          subfamilyCodeNormalized: null,
          gradeOrLevelNormalized: null,
        },
      },
    });
    const out = assignCategoryToJobNormalizationRow({ row, ...versions });
    expect(out.status).toBe(CategoryAssignmentStatus.REVIEW_REQUIRED);
    expect(out.issues[0]?.code).toBe(
      CategoryAssignmentIssueCode.CAT_ASN_INSUFFICIENT_JOB_DESCRIPTOR,
    );
    expect(out.metricsCalculationBlocked).toBe(true);
  });

  it('produces different EXACT category ids for different titles with same hierarchy', () => {
    const a = assignCategoryToJobNormalizationRow({
      row: baseRow({
        rowIndex: 0,
        descriptor: {
          jobNormalizationRulesVersion: 'jn.v1',
          raw: {},
          normalized: {
            titleNormalized: 'role a',
            familyCodeNormalized: 'eng',
            subfamilyCodeNormalized: 'backend',
            gradeOrLevelNormalized: 'l3',
          },
        },
      }),
      ...versions,
    });
    const b = assignCategoryToJobNormalizationRow({
      row: baseRow({
        rowIndex: 1,
        descriptor: {
          jobNormalizationRulesVersion: 'jn.v1',
          raw: {},
          normalized: {
            titleNormalized: 'role b',
            familyCodeNormalized: 'eng',
            subfamilyCodeNormalized: 'backend',
            gradeOrLevelNormalized: 'l3',
          },
        },
      }),
      ...versions,
    });
    expect(a.categoryId).not.toBe(b.categoryId);
  });
});

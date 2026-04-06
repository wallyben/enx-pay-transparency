import {
  CategoryAssignmentBasis,
  CategoryAssignmentIssueCode,
  CategoryAssignmentStatus,
  JobNormalizationIssueCode,
} from '../enums';
import { CategoryOverrideStatus } from '../enums';
import {
  CategoryAssignmentRowResultSchema,
  CategoryAssignmentSnapshotResultSchema,
  CategoryOverrideRecordSchema,
  EqualValueMemberKeySchema,
  EqualValueRulesetSchema,
} from '../schemas/category-assignment';

describe('category-assignment schemas', () => {
  const traceability = {
    methodologyVersion: 'm1',
    rulePackVersion: 'r1',
    jobNormalizationRulesVersion: 'jn1',
    categoryEngineRulesVersion: 'ce1',
  };

  const s10 = {
    metricsCalculationBlocked: false,
    equalValueGroupKey: null,
    governedOverrideId: null,
    governedOverrideStatus: null,
  };

  it('parses assigned row', () => {
    const row = {
      rowIndex: 0,
      workerExternalId: 'w1',
      status: CategoryAssignmentStatus.ASSIGNED,
      traceability,
      categoryId: 'cat_abc',
      basis: CategoryAssignmentBasis.EXACT,
      issues: [],
      jobNormalizationIssueCodes: [],
      ...s10,
    };
    expect(() => CategoryAssignmentRowResultSchema.parse(row)).not.toThrow();
  });

  it('parses review-required row with job norm codes', () => {
    const row = {
      rowIndex: 1,
      workerExternalId: null,
      status: CategoryAssignmentStatus.REVIEW_REQUIRED,
      traceability,
      categoryId: null,
      basis: null,
      issues: [
        {
          code: CategoryAssignmentIssueCode.CAT_ASN_JOB_NORMALIZATION_ISSUES_PRESENT,
          detail: 'JOB_NORM_MISSING_JOB_TITLE',
        },
      ],
      jobNormalizationIssueCodes: [JobNormalizationIssueCode.JOB_NORM_MISSING_JOB_TITLE],
      ...s10,
      metricsCalculationBlocked: true,
    };
    expect(() => CategoryAssignmentRowResultSchema.parse(row)).not.toThrow();
  });

  it('parses snapshot result', () => {
    const snap = {
      snapshotId: 'snp_x',
      traceability,
      rows: [
        {
          rowIndex: 0,
          workerExternalId: 'w1',
          status: CategoryAssignmentStatus.UNASSIGNED,
          traceability,
          categoryId: null,
          basis: null,
          issues: [{ code: CategoryAssignmentIssueCode.CAT_ASN_DESCRIPTOR_EMPTY }],
          jobNormalizationIssueCodes: [],
          ...s10,
          metricsCalculationBlocked: true,
        },
      ],
      assignedCount: 0,
      reviewRequiredCount: 0,
      unassignedCount: 1,
      metricsCalculationBlockedCount: 1,
    };
    expect(() => CategoryAssignmentSnapshotResultSchema.parse(snap)).not.toThrow();
  });

  it('parses row with equal-value traceability and group key', () => {
    const row = {
      rowIndex: 0,
      workerExternalId: 'w1',
      status: CategoryAssignmentStatus.ASSIGNED,
      traceability: {
        ...traceability,
        equalValueMethodologyVersion: 'evm-1',
        equalValueRulesVersion: 'evr-1',
      },
      categoryId: 'cat_x',
      basis: CategoryAssignmentBasis.EQUAL_VALUE,
      issues: [],
      jobNormalizationIssueCodes: [],
      metricsCalculationBlocked: false,
      equalValueGroupKey: 'grp-a',
      governedOverrideId: null,
      governedOverrideStatus: null,
    };
    expect(() => CategoryAssignmentRowResultSchema.parse(row)).not.toThrow();
  });

  it('rejects EqualValueMemberKey with no dimensions', () => {
    expect(() => EqualValueMemberKeySchema.parse({})).toThrow();
  });

  it('parses EqualValueRuleset', () => {
    const rs = {
      methodologyVersion: 'evm',
      rulesVersion: 'evr',
      groups: [
        {
          groupKey: 'g1',
          members: [{ titleNormalized: 'analyst' }],
        },
      ],
    };
    expect(() => EqualValueRulesetSchema.parse(rs)).not.toThrow();
  });

  it('parses CategoryOverrideRecord', () => {
    const rec = {
      overrideId: 'ovr_1',
      rowIndex: 0,
      proposedCategoryId: 'cat_manual',
      status: CategoryOverrideStatus.PENDING,
      proposedAtIso: '2026-04-07T12:00:00.000Z',
    };
    expect(() => CategoryOverrideRecordSchema.parse(rec)).not.toThrow();
  });
});

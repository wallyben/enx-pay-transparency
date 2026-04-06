import {
  CategoryAssignmentBasis,
  CategoryAssignmentIssueCode,
  CategoryAssignmentStatus,
  JobNormalizationIssueCode,
} from '../enums';
import {
  CategoryAssignmentRowResultSchema,
  CategoryAssignmentSnapshotResultSchema,
} from '../schemas/category-assignment';

describe('category-assignment schemas', () => {
  const traceability = {
    methodologyVersion: 'm1',
    rulePackVersion: 'r1',
    jobNormalizationRulesVersion: 'jn1',
    categoryEngineRulesVersion: 'ce1',
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
        },
      ],
      assignedCount: 0,
      reviewRequiredCount: 0,
      unassignedCount: 1,
    };
    expect(() => CategoryAssignmentSnapshotResultSchema.parse(snap)).not.toThrow();
  });
});

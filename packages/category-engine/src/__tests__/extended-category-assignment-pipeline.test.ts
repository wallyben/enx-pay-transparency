import type { CategoryOverrideRecord, JobNormalizationSnapshotResult } from '@enx/contracts';
import {
  CategoryAssignmentBasis,
  CategoryAssignmentIssueCode,
  CategoryAssignmentStatus,
  CategoryOverrideStatus,
  JobNormalizationIssueCode,
} from '@enx/contracts';
import { runExtendedCategoryAssignmentOnJobNormalization } from '../extended-category-assignment-pipeline';

function snapshot(rows: JobNormalizationSnapshotResult['rows']): JobNormalizationSnapshotResult {
  return {
    snapshotId: 'snp_s10',
    jobNormalizationRulesVersion: 'jn.v1',
    rowIssueCount: 0,
    ok: true,
    rows,
  };
}

describe('runExtendedCategoryAssignmentOnJobNormalization', () => {
  const versions = {
    methodologyVersion: 'm-v1',
    rulePackVersion: 'r-v1',
  };

  it('assigns via equal-value when ruleset matches a title-only row', () => {
    const jobNormalization = snapshot([
      {
        rowIndex: 0,
        workerExternalId: 'w1',
        issues: [],
        descriptor: {
          jobNormalizationRulesVersion: 'jn.v1',
          raw: {},
          normalized: {
            titleNormalized: 'lead analyst',
            familyCodeNormalized: null,
            subfamilyCodeNormalized: null,
            gradeOrLevelNormalized: null,
          },
        },
      },
    ]);

    const result = runExtendedCategoryAssignmentOnJobNormalization({
      jobNormalization,
      ...versions,
      equalValueRuleset: {
        methodologyVersion: 'evm-1',
        rulesVersion: 'evr-1',
        groups: [{ groupKey: 'g1', members: [{ titleNormalized: 'lead analyst' }] }],
      },
    });

    const row = result.rows[0]!;
    expect(row.status).toBe(CategoryAssignmentStatus.ASSIGNED);
    expect(row.basis).toBe(CategoryAssignmentBasis.EQUAL_VALUE);
    expect(row.metricsCalculationBlocked).toBe(false);
    expect(result.metricsCalculationBlockedCount).toBe(0);
  });

  it('adds equal-value review issue when ruleset is provided but no member matches', () => {
    const jobNormalization = snapshot([
      {
        rowIndex: 0,
        workerExternalId: 'w1',
        issues: [],
        descriptor: {
          jobNormalizationRulesVersion: 'jn.v1',
          raw: {},
          normalized: {
            titleNormalized: 'orphan title',
            familyCodeNormalized: null,
            subfamilyCodeNormalized: null,
            gradeOrLevelNormalized: null,
          },
        },
      },
    ]);

    const result = runExtendedCategoryAssignmentOnJobNormalization({
      jobNormalization,
      ...versions,
      equalValueRuleset: {
        methodologyVersion: 'evm-1',
        rulesVersion: 'evr-1',
        groups: [{ groupKey: 'g1', members: [{ titleNormalized: 'other' }] }],
      },
    });

    const row = result.rows[0]!;
    expect(row.status).toBe(CategoryAssignmentStatus.REVIEW_REQUIRED);
    expect(row.issues.some((i) => i.code === CategoryAssignmentIssueCode.CAT_ASN_EQUAL_VALUE_NO_DECLARED_GROUP)).toBe(
      true,
    );
    expect(row.metricsCalculationBlocked).toBe(true);
    expect(result.metricsCalculationBlockedCount).toBe(1);
  });

  it('throws on duplicate governed overrides for the same row', () => {
    const jobNormalization = snapshot([
      {
        rowIndex: 0,
        workerExternalId: 'w1',
        issues: [],
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
      },
    ]);

    const overrides: CategoryOverrideRecord[] = [
      {
        overrideId: 'ovr_b',
        rowIndex: 0,
        proposedCategoryId: 'c1',
        status: CategoryOverrideStatus.PENDING,
        proposedAtIso: '2026-04-07T10:00:00.000Z',
      },
      {
        overrideId: 'ovr_a',
        rowIndex: 0,
        proposedCategoryId: 'c2',
        status: CategoryOverrideStatus.PENDING,
        proposedAtIso: '2026-04-07T10:00:00.000Z',
      },
    ];

    expect(() =>
      runExtendedCategoryAssignmentOnJobNormalization({
        jobNormalization,
        ...versions,
        governedOverrides: overrides,
      }),
    ).toThrow(/duplicate rowIndex/);
  });

  it('does not run equal-value when job normalization issues are present', () => {
    const jobNormalization = snapshot([
      {
        rowIndex: 0,
        workerExternalId: 'w1',
        issues: [{ code: JobNormalizationIssueCode.JOB_NORM_MISSING_JOB_TITLE, rowIndex: 0 }],
        descriptor: {
          jobNormalizationRulesVersion: 'jn.v1',
          raw: {},
          normalized: {
            titleNormalized: 'lead analyst',
            familyCodeNormalized: null,
            subfamilyCodeNormalized: null,
            gradeOrLevelNormalized: null,
          },
        },
      },
    ]);

    const result = runExtendedCategoryAssignmentOnJobNormalization({
      jobNormalization,
      ...versions,
      equalValueRuleset: {
        methodologyVersion: 'evm-1',
        rulesVersion: 'evr-1',
        groups: [{ groupKey: 'g1', members: [{ titleNormalized: 'lead analyst' }] }],
      },
    });

    const row = result.rows[0]!;
    expect(row.issues.some((i) => i.code === CategoryAssignmentIssueCode.CAT_ASN_EQUAL_VALUE_NO_DECLARED_GROUP)).toBe(
      false,
    );
    expect(row.status).toBe(CategoryAssignmentStatus.REVIEW_REQUIRED);
  });

  it('end-to-end: APPROVED override assigns; PENDING blocks prior assignment', () => {
    const rows: JobNormalizationSnapshotResult['rows'] = [
      {
        rowIndex: 0,
        workerExternalId: 'w0',
        issues: [],
        descriptor: {
          jobNormalizationRulesVersion: 'jn.v1',
          raw: {},
          normalized: {
            titleNormalized: 't0',
            familyCodeNormalized: 'f',
            subfamilyCodeNormalized: 's',
            gradeOrLevelNormalized: 'g',
          },
        },
      },
      {
        rowIndex: 1,
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
      },
    ];
    const jobNormalization = snapshot(rows);

    const withPending = runExtendedCategoryAssignmentOnJobNormalization({
      jobNormalization,
      ...versions,
      governedOverrides: [
        {
          overrideId: 'ovr_p',
          rowIndex: 0,
          proposedCategoryId: 'cat_new',
          status: CategoryOverrideStatus.PENDING,
          proposedAtIso: '2026-04-07T10:00:00.000Z',
        },
      ],
    });
    expect(withPending.rows[0]!.metricsCalculationBlocked).toBe(true);
    expect(withPending.rows[0]!.categoryId).toBeNull();

    const withApproved = runExtendedCategoryAssignmentOnJobNormalization({
      jobNormalization,
      ...versions,
      governedOverrides: [
        {
          overrideId: 'ovr_a',
          rowIndex: 1,
          proposedCategoryId: 'cat_manual',
          status: CategoryOverrideStatus.APPROVED,
          proposedAtIso: '2026-04-07T10:00:00.000Z',
          decidedAtIso: '2026-04-07T11:00:00.000Z',
          reviewerActorId: 'rev-1',
        },
      ],
    });
    expect(withApproved.rows[1]!.status).toBe(CategoryAssignmentStatus.ASSIGNED);
    expect(withApproved.rows[1]!.basis).toBe(CategoryAssignmentBasis.OVERRIDE);
    expect(withApproved.rows[1]!.categoryId).toBe('cat_manual');
    expect(withApproved.rows[1]!.metricsCalculationBlocked).toBe(false);
  });
});

import {
  CategoryAssignmentStatus,
  type JobNormalizationSnapshotResult,
} from '@enx/contracts';
import { runCategoryAssignmentOnJobNormalization } from '../category-assignment-pipeline';

describe('runCategoryAssignmentOnJobNormalization', () => {
  it('orders rows deterministically by rowIndex', () => {
    const jobNormalization: JobNormalizationSnapshotResult = {
      snapshotId: 'snp_test',
      jobNormalizationRulesVersion: 'jn.v1',
      rowIssueCount: 0,
      ok: true,
      rows: [
        {
          rowIndex: 2,
          workerExternalId: 'w2',
          issues: [],
          descriptor: {
            jobNormalizationRulesVersion: 'jn.v1',
            raw: {},
            normalized: {
              titleNormalized: 't2',
              familyCodeNormalized: 'f',
              subfamilyCodeNormalized: 's',
              gradeOrLevelNormalized: 'g',
            },
          },
        },
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
      ],
    };

    const result = runCategoryAssignmentOnJobNormalization({
      jobNormalization,
      methodologyVersion: 'm1',
      rulePackVersion: 'r1',
    });

    expect(result.rows.map((r) => r.rowIndex)).toEqual([0, 2]);
    expect(result.assignedCount).toBe(2);
    expect(result.reviewRequiredCount).toBe(0);
    expect(result.unassignedCount).toBe(0);
    expect(result.metricsCalculationBlockedCount).toBe(0);
    expect(result.rows.every((r) => r.status === CategoryAssignmentStatus.ASSIGNED)).toBe(true);
    expect(result.rows.every((r) => r.metricsCalculationBlocked === false)).toBe(true);
  });
});

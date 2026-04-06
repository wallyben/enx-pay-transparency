import type { CategoryAssignmentSnapshotResult, JobNormalizationSnapshotResult } from '@enx/contracts';
import { CategoryAssignmentStatus } from '@enx/contracts';
import { assignCategoryToJobNormalizationRow } from './assign-category-row';
import { DEFAULT_CATEGORY_ENGINE_RULES_VERSION } from './category-assignment-rules-version';

export function runCategoryAssignmentOnJobNormalization(input: {
  readonly jobNormalization: JobNormalizationSnapshotResult;
  readonly methodologyVersion: string;
  readonly rulePackVersion: string;
  readonly categoryEngineRulesVersion?: string;
}): CategoryAssignmentSnapshotResult {
  const categoryEngineRulesVersion =
    input.categoryEngineRulesVersion ?? DEFAULT_CATEGORY_ENGINE_RULES_VERSION;
  const sortedRows = [...input.jobNormalization.rows].sort((a, b) => a.rowIndex - b.rowIndex);
  const rows = sortedRows.map((row) =>
    assignCategoryToJobNormalizationRow({
      row,
      methodologyVersion: input.methodologyVersion,
      rulePackVersion: input.rulePackVersion,
      categoryEngineRulesVersion,
    }),
  );

  let assignedCount = 0;
  let reviewRequiredCount = 0;
  let unassignedCount = 0;
  for (const r of rows) {
    if (r.status === CategoryAssignmentStatus.ASSIGNED) assignedCount += 1;
    else if (r.status === CategoryAssignmentStatus.REVIEW_REQUIRED) reviewRequiredCount += 1;
    else if (r.status === CategoryAssignmentStatus.UNASSIGNED) unassignedCount += 1;
  }

  return {
    snapshotId: input.jobNormalization.snapshotId,
    traceability: {
      methodologyVersion: input.methodologyVersion,
      rulePackVersion: input.rulePackVersion,
      jobNormalizationRulesVersion: input.jobNormalization.jobNormalizationRulesVersion,
      categoryEngineRulesVersion,
    },
    rows,
    assignedCount,
    reviewRequiredCount,
    unassignedCount,
  };
}

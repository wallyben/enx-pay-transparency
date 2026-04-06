import type {
  CategoryAssignmentSnapshotResult,
  CategoryOverrideRecord,
  EqualValueRuleset,
  JobNormalizationSnapshotResult,
} from '@enx/contracts';
import {
  CategoryAssignmentIssueCode,
  CategoryAssignmentStatus,
} from '@enx/contracts';
import { assignCategoryToJobNormalizationRow } from './assign-category-row';
import { DEFAULT_CATEGORY_ENGINE_RULES_VERSION } from './category-assignment-rules-version';
import { tryEqualValueCategoryAssignment } from './equal-value-grouping';
import { applyGovernedCategoryOverride } from './governed-override';

function buildOverrideByRowIndex(
  overrides: readonly CategoryOverrideRecord[] | undefined,
): Map<number, CategoryOverrideRecord> {
  const map = new Map<number, CategoryOverrideRecord>();
  if (!overrides?.length) return map;
  const sorted = [...overrides].sort((a, b) => a.overrideId.localeCompare(b.overrideId));
  for (const o of sorted) {
    if (map.has(o.rowIndex)) {
      throw new Error(
        `Governed category override conflict: duplicate rowIndex=${o.rowIndex} after deterministic ordering`,
      );
    }
    map.set(o.rowIndex, o);
  }
  return map;
}

/**
 * S09 assignment, optional S10 equal-value grouping (explicit ruleset), then governed overrides.
 * Equal-value is attempted only for rows with clean job normalization that S09 did not assign.
 */
export function runExtendedCategoryAssignmentOnJobNormalization(input: {
  readonly jobNormalization: JobNormalizationSnapshotResult;
  readonly methodologyVersion: string;
  readonly rulePackVersion: string;
  readonly categoryEngineRulesVersion?: string;
  readonly equalValueRuleset?: EqualValueRuleset | null;
  readonly governedOverrides?: readonly CategoryOverrideRecord[] | null;
}): CategoryAssignmentSnapshotResult {
  const categoryEngineRulesVersion =
    input.categoryEngineRulesVersion ?? DEFAULT_CATEGORY_ENGINE_RULES_VERSION;
  const sortedRows = [...input.jobNormalization.rows].sort((a, b) => a.rowIndex - b.rowIndex);
  const overrideByRow = buildOverrideByRowIndex(input.governedOverrides ?? undefined);

  const rows = sortedRows.map((row) => {
    let rowResult = assignCategoryToJobNormalizationRow({
      row,
      methodologyVersion: input.methodologyVersion,
      rulePackVersion: input.rulePackVersion,
      categoryEngineRulesVersion,
    });

    if (
      input.equalValueRuleset &&
      row.issues.length === 0 &&
      rowResult.status !== CategoryAssignmentStatus.ASSIGNED
    ) {
      const eq = tryEqualValueCategoryAssignment({
        row,
        base: rowResult,
        equalValueRuleset: input.equalValueRuleset,
        categoryEngineRulesVersion,
      });
      if (eq) {
        rowResult = eq;
      } else {
        rowResult = {
          ...rowResult,
          status: CategoryAssignmentStatus.REVIEW_REQUIRED,
          categoryId: null,
          basis: null,
          metricsCalculationBlocked: true,
          issues: [
            ...rowResult.issues,
            { code: CategoryAssignmentIssueCode.CAT_ASN_EQUAL_VALUE_NO_DECLARED_GROUP },
          ],
        };
      }
    }

    const ovr = overrideByRow.get(row.rowIndex);
    if (ovr) {
      rowResult = applyGovernedCategoryOverride({
        rowIndex: row.rowIndex,
        baseRowResult: rowResult,
        override: ovr,
      });
    }

    return rowResult;
  });

  let assignedCount = 0;
  let reviewRequiredCount = 0;
  let unassignedCount = 0;
  let metricsCalculationBlockedCount = 0;
  for (const r of rows) {
    if (r.status === CategoryAssignmentStatus.ASSIGNED) assignedCount += 1;
    else if (r.status === CategoryAssignmentStatus.REVIEW_REQUIRED) reviewRequiredCount += 1;
    else if (r.status === CategoryAssignmentStatus.UNASSIGNED) unassignedCount += 1;
    if (r.metricsCalculationBlocked) metricsCalculationBlockedCount += 1;
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
    metricsCalculationBlockedCount,
  };
}

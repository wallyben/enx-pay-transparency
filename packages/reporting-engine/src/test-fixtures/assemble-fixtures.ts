import type { CategoryAssignmentRowResult, CategoryAssignmentSnapshotResult } from '@enx/contracts';
import type { EuCoreMetricsRunResult } from '@enx/contracts';
import {
  CategoryAssignmentBasis,
  CategoryAssignmentStatus,
  EuCoreMetricId,
  EuCoreMetricResultStatus,
} from '@enx/contracts';

export function baseCategoryTraceability() {
  return {
    methodologyVersion: 'meth-v1',
    rulePackVersion: 'rules-v1',
    jobNormalizationRulesVersion: 'job-v1',
    categoryEngineRulesVersion: 'cat-v1',
  };
}

export function assignedRow(
  rowIndex: number,
  opts?: { metricsCalculationBlocked?: boolean; categoryId?: string },
): CategoryAssignmentRowResult {
  return {
    rowIndex,
    workerExternalId: `w${rowIndex}`,
    status: CategoryAssignmentStatus.ASSIGNED,
    traceability: baseCategoryTraceability(),
    categoryId: opts?.categoryId ?? 'cat-a',
    basis: CategoryAssignmentBasis.EXACT,
    issues: [],
    jobNormalizationIssueCodes: [],
    metricsCalculationBlocked: opts?.metricsCalculationBlocked ?? false,
    equalValueGroupKey: null,
    governedOverrideId: null,
    governedOverrideStatus: null,
  };
}

export function categorySnapshotFor(
  snapshotId: string,
  rows: CategoryAssignmentRowResult[],
): CategoryAssignmentSnapshotResult {
  const assignedCount = rows.filter((r) => r.status === CategoryAssignmentStatus.ASSIGNED).length;
  const reviewRequiredCount = rows.filter(
    (r) => r.status === CategoryAssignmentStatus.REVIEW_REQUIRED,
  ).length;
  const unassignedCount = rows.filter((r) => r.status === CategoryAssignmentStatus.UNASSIGNED).length;
  const metricsCalculationBlockedCount = rows.filter((r) => r.metricsCalculationBlocked).length;
  return {
    snapshotId,
    traceability: baseCategoryTraceability(),
    rows,
    assignedCount,
    reviewRequiredCount,
    unassignedCount,
    metricsCalculationBlockedCount,
  };
}

export function minimalComputedEuCore(snapshotId: string): EuCoreMetricsRunResult {
  return {
    traceability: {
      snapshotId,
      methodologyVersion: 'meth-v1',
      rulePackVersion: 'rules-v1',
      categoryEngineRulesVersion: 'cat-v1',
      jobNormalizationRulesVersion: 'job-v1',
    },
    runGateBlocked: false,
    inclusion: {
      totalCategoryRows: 4,
      classificationIncomplete: false,
      excludedNotAssigned: 0,
      excludedMetricsCalculationBlocked: 0,
      excludedMissingIntakeRow: 0,
      excludedMissingBasePay: 0,
      excludedInvalidBasePay: 0,
      excludedMissingGender: 0,
      excludedNonBinaryGender: 0,
      eligibleForPayGapCount: 4,
      eligibleMaleCount: 2,
      eligibleFemaleCount: 2,
      eligibleWithVariablePayCount: 0,
      eligibleMaleWithVariablePayCount: 0,
      eligibleFemaleWithVariablePayCount: 0,
    },
    meanGenderPayGap: {
      metricId: EuCoreMetricId.MeanGenderPayGapPct,
      status: EuCoreMetricResultStatus.Computed,
      valuePercent: 10,
      issues: [],
    },
    medianGenderPayGap: {
      metricId: EuCoreMetricId.MedianGenderPayGapPct,
      status: EuCoreMetricResultStatus.Computed,
      valuePercent: 10,
      issues: [],
    },
    meanVariablePayGap: {
      metricId: EuCoreMetricId.MeanVariablePayGapPct,
      status: EuCoreMetricResultStatus.NoVariablePayInput,
      issues: [{ code: 'NO_VARIABLE_PAY_INPUT' }],
    },
    payQuartileDistribution: {
      metricId: EuCoreMetricId.PayQuartileDistributionByGender,
      status: EuCoreMetricResultStatus.Computed,
      bands: [
        { quartile: 1, maleCount: 0, femaleCount: 1 },
        { quartile: 2, maleCount: 1, femaleCount: 0 },
        { quartile: 3, maleCount: 0, femaleCount: 1 },
        { quartile: 4, maleCount: 1, femaleCount: 0 },
      ],
      issues: [],
    },
  };
}

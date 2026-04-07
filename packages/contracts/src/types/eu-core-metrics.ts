import type { EuCoreMetricId } from '../enums/eu-core-metric-id';
import type { EuCoreMetricResultStatus } from '../enums/eu-core-metric-result-status';
import type { CategoryAssignmentSnapshotResult } from './category-assignment';
import type { NormalizedIntakeRowResult } from './mapping-normalization';

/**
 * Traceability bundle carried on every metrics run (S11).
 * Aligns with category assignment / snapshot methodology fields without implying country-specific law.
 */
export interface EuCoreMetricsTraceability {
  readonly snapshotId: string;
  readonly methodologyVersion: string;
  readonly rulePackVersion: string;
  readonly categoryEngineRulesVersion: string;
  readonly jobNormalizationRulesVersion: string;
}

export interface EuCoreVariablePayRowInput {
  readonly rowIndex: number;
  readonly variablePayDecimal: string;
}

/**
 * Accepted upstream inputs for EU core metrics (S11): sealed intake normalization + accepted classification.
 * Variable pay is optional supplemental keyed by row index when the deployment captures it outside LOGICAL fields.
 */
export interface EuCoreMetricsRunInput {
  readonly snapshotId: string;
  readonly methodologyVersion: string;
  readonly rulePackVersion: string;
  readonly categoryAssignment: CategoryAssignmentSnapshotResult;
  readonly normalizedIntakeRows: readonly NormalizedIntakeRowResult[];
  readonly variablePayRows?: readonly EuCoreVariablePayRowInput[] | null;
}

export interface EuCoreMetricsInclusionExclusionSummary {
  readonly totalCategoryRows: number;
  readonly classificationIncomplete: boolean;
  readonly excludedNotAssigned: number;
  readonly excludedMetricsCalculationBlocked: number;
  readonly excludedMissingIntakeRow: number;
  readonly excludedMissingBasePay: number;
  readonly excludedInvalidBasePay: number;
  readonly excludedMissingGender: number;
  readonly excludedNonBinaryGender: number;
  readonly eligibleForPayGapCount: number;
  readonly eligibleMaleCount: number;
  readonly eligibleFemaleCount: number;
  readonly eligibleWithVariablePayCount: number;
  readonly eligibleMaleWithVariablePayCount: number;
  readonly eligibleFemaleWithVariablePayCount: number;
}

export interface EuCoreMetricIssue {
  readonly code: string;
  readonly detail?: string;
}

export interface EuCoreScalarMetricResult {
  readonly metricId: EuCoreMetricId;
  readonly status: EuCoreMetricResultStatus;
  /**
   * Gender pay gap style: (male aggregate − female aggregate) / male aggregate × 100.
   * Present only when status is Computed.
   */
  readonly valuePercent?: number;
  readonly issues: readonly EuCoreMetricIssue[];
}

export type PayQuartileBand = 1 | 2 | 3 | 4;

export interface EuCorePayQuartileBandCounts {
  readonly quartile: PayQuartileBand;
  readonly maleCount: number;
  readonly femaleCount: number;
}

export interface EuCoreQuartileDistributionResult {
  readonly metricId: EuCoreMetricId;
  readonly status: EuCoreMetricResultStatus;
  readonly bands?: readonly EuCorePayQuartileBandCounts[];
  readonly issues: readonly EuCoreMetricIssue[];
}

export interface EuCoreMetricsRunResult {
  readonly traceability: EuCoreMetricsTraceability;
  readonly runGateBlocked: boolean;
  readonly inclusion: EuCoreMetricsInclusionExclusionSummary;
  readonly meanGenderPayGap: EuCoreScalarMetricResult;
  readonly medianGenderPayGap: EuCoreScalarMetricResult;
  readonly meanVariablePayGap: EuCoreScalarMetricResult;
  readonly payQuartileDistribution: EuCoreQuartileDistributionResult;
}

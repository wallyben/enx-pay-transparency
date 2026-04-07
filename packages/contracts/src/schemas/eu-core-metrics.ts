import { z } from 'zod';
import { EuCoreMetricIdSchema, EuCoreMetricResultStatusSchema } from './enums';

export const EuCoreVariablePayRowInputSchema = z.object({
  rowIndex: z.number().int().nonnegative(),
  variablePayDecimal: z.string().min(1),
});

export const EuCoreMetricIssueSchema = z.object({
  code: z.string(),
  detail: z.string().optional(),
});

export const EuCoreScalarMetricResultSchema = z.object({
  metricId: EuCoreMetricIdSchema,
  status: EuCoreMetricResultStatusSchema,
  valuePercent: z.number().finite().optional(),
  issues: z.array(EuCoreMetricIssueSchema),
});

export const EuCorePayQuartileBandCountsSchema = z.object({
  quartile: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  maleCount: z.number().int().nonnegative(),
  femaleCount: z.number().int().nonnegative(),
});

export const EuCoreQuartileDistributionResultSchema = z.object({
  metricId: EuCoreMetricIdSchema,
  status: EuCoreMetricResultStatusSchema,
  bands: z.array(EuCorePayQuartileBandCountsSchema).optional(),
  issues: z.array(EuCoreMetricIssueSchema),
});

export const EuCoreMetricsInclusionExclusionSummarySchema = z.object({
  totalCategoryRows: z.number().int().nonnegative(),
  classificationIncomplete: z.boolean(),
  excludedNotAssigned: z.number().int().nonnegative(),
  excludedMetricsCalculationBlocked: z.number().int().nonnegative(),
  excludedMissingIntakeRow: z.number().int().nonnegative(),
  excludedMissingBasePay: z.number().int().nonnegative(),
  excludedInvalidBasePay: z.number().int().nonnegative(),
  excludedMissingGender: z.number().int().nonnegative(),
  excludedNonBinaryGender: z.number().int().nonnegative(),
  eligibleForPayGapCount: z.number().int().nonnegative(),
  eligibleMaleCount: z.number().int().nonnegative(),
  eligibleFemaleCount: z.number().int().nonnegative(),
  eligibleWithVariablePayCount: z.number().int().nonnegative(),
  eligibleMaleWithVariablePayCount: z.number().int().nonnegative(),
  eligibleFemaleWithVariablePayCount: z.number().int().nonnegative(),
});

export const EuCoreMetricsTraceabilitySchema = z.object({
  snapshotId: z.string().min(1),
  methodologyVersion: z.string().min(1),
  rulePackVersion: z.string().min(1),
  categoryEngineRulesVersion: z.string().min(1),
  jobNormalizationRulesVersion: z.string().min(1),
});

export const EuCoreMetricsRunResultSchema = z.object({
  traceability: EuCoreMetricsTraceabilitySchema,
  runGateBlocked: z.boolean(),
  inclusion: EuCoreMetricsInclusionExclusionSummarySchema,
  meanGenderPayGap: EuCoreScalarMetricResultSchema,
  medianGenderPayGap: EuCoreScalarMetricResultSchema,
  meanVariablePayGap: EuCoreScalarMetricResultSchema,
  payQuartileDistribution: EuCoreQuartileDistributionResultSchema,
});

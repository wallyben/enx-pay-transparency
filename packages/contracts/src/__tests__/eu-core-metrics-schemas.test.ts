import {
  EuCoreMetricsRunResultSchema,
  EuCoreVariablePayRowInputSchema,
} from '../schemas/eu-core-metrics';
import { EuCoreMetricId } from '../enums/eu-core-metric-id';
import { EuCoreMetricResultStatus } from '../enums/eu-core-metric-result-status';

describe('eu-core-metrics schemas', () => {
  it('parses variable pay supplemental row', () => {
    const parsed = EuCoreVariablePayRowInputSchema.parse({
      rowIndex: 2,
      variablePayDecimal: '1500.50',
    });
    expect(parsed.rowIndex).toBe(2);
  });

  it('parses a full run result envelope', () => {
    const parsed = EuCoreMetricsRunResultSchema.parse({
      traceability: {
        snapshotId: 'snap-1',
        methodologyVersion: 'm1',
        rulePackVersion: 'r1',
        categoryEngineRulesVersion: 'c1',
        jobNormalizationRulesVersion: 'j1',
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
        valuePercent: 12.5,
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
    });
    expect(parsed.runGateBlocked).toBe(false);
  });
});

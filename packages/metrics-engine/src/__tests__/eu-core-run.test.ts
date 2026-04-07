import type { CategoryAssignmentRowResult, NormalizedIntakeRowResult } from '@enx/contracts';
import {
  CategoryAssignmentBasis,
  CategoryAssignmentStatus,
  EuCoreMetricResultStatus,
  Gender,
  LogicalIntakeField,
} from '@enx/contracts';
import { runEuCoreMetrics } from '../eu-core/run-eu-core-metrics';

function baseTraceability() {
  return {
    methodologyVersion: 'meth-v1',
    rulePackVersion: 'rules-v1',
    jobNormalizationRulesVersion: 'job-v1',
    categoryEngineRulesVersion: 'cat-v1',
  };
}

function assignedRow(
  rowIndex: number,
  opts?: { metricsCalculationBlocked?: boolean },
): CategoryAssignmentRowResult {
  return {
    rowIndex,
    workerExternalId: `w${rowIndex}`,
    status: CategoryAssignmentStatus.ASSIGNED,
    traceability: baseTraceability(),
    categoryId: 'cat-a',
    basis: CategoryAssignmentBasis.EXACT,
    issues: [],
    jobNormalizationIssueCodes: [],
    metricsCalculationBlocked: opts?.metricsCalculationBlocked ?? false,
    equalValueGroupKey: null,
    governedOverrideId: null,
    governedOverrideStatus: null,
  };
}

function intakeRow(
  rowIndex: number,
  gender: Gender,
  basePay: string,
): NormalizedIntakeRowResult {
  return {
    rowIndex,
    values: {
      [LogicalIntakeField.GENDER]: { kind: 'GENDER', value: gender },
      [LogicalIntakeField.BASE_PAY_AMOUNT]: { kind: 'DECIMAL', value: basePay },
    },
    issues: [],
  };
}

describe('runEuCoreMetrics', () => {
  it('computes mean gender pay gap with explicit expected percentage', () => {
    const rows = [assignedRow(0), assignedRow(1), assignedRow(2), assignedRow(3)];
    const intake = [
      intakeRow(0, Gender.Male, '100'),
      intakeRow(1, Gender.Male, '100'),
      intakeRow(2, Gender.Female, '80'),
      intakeRow(3, Gender.Female, '80'),
    ];
    const result = runEuCoreMetrics({
      snapshotId: 'snap-mean',
      methodologyVersion: 'meth-v1',
      rulePackVersion: 'rules-v1',
      categoryAssignment: {
        snapshotId: 'snap-mean',
        traceability: baseTraceability(),
        rows,
        assignedCount: 4,
        reviewRequiredCount: 0,
        unassignedCount: 0,
        metricsCalculationBlockedCount: 0,
      },
      normalizedIntakeRows: intake,
    });
    expect(result.runGateBlocked).toBe(false);
    expect(result.meanGenderPayGap.status).toBe(EuCoreMetricResultStatus.Computed);
    expect(result.meanGenderPayGap.valuePercent).toBe(20);
  });

  it('computes median gender pay gap with explicit expected percentage', () => {
    const rows = [assignedRow(0), assignedRow(1), assignedRow(2), assignedRow(3)];
    const intake = [
      intakeRow(0, Gender.Male, '50'),
      intakeRow(1, Gender.Male, '150'),
      intakeRow(2, Gender.Female, '70'),
      intakeRow(3, Gender.Female, '90'),
    ];
    const result = runEuCoreMetrics({
      snapshotId: 'snap-med',
      methodologyVersion: 'meth-v1',
      rulePackVersion: 'rules-v1',
      categoryAssignment: {
        snapshotId: 'snap-med',
        traceability: baseTraceability(),
        rows,
        assignedCount: 4,
        reviewRequiredCount: 0,
        unassignedCount: 0,
        metricsCalculationBlockedCount: 0,
      },
      normalizedIntakeRows: intake,
    });
    expect(result.medianGenderPayGap.status).toBe(EuCoreMetricResultStatus.Computed);
    expect(result.medianGenderPayGap.valuePercent).toBe(20);
  });

  it('blocks all headline metrics when classification is incomplete', () => {
    const rows: CategoryAssignmentRowResult[] = [
      assignedRow(0),
      {
        ...assignedRow(1),
        status: CategoryAssignmentStatus.REVIEW_REQUIRED,
        categoryId: null,
        basis: null,
      },
    ];
    const intake = [intakeRow(0, Gender.Male, '100'), intakeRow(1, Gender.Female, '80')];
    const result = runEuCoreMetrics({
      snapshotId: 'snap-block',
      methodologyVersion: 'meth-v1',
      rulePackVersion: 'rules-v1',
      categoryAssignment: {
        snapshotId: 'snap-block',
        traceability: baseTraceability(),
        rows,
        assignedCount: 1,
        reviewRequiredCount: 1,
        unassignedCount: 0,
        metricsCalculationBlockedCount: 0,
      },
      normalizedIntakeRows: intake,
    });
    expect(result.runGateBlocked).toBe(true);
    expect(result.meanGenderPayGap.status).toBe(
      EuCoreMetricResultStatus.BlockedClassificationIncomplete,
    );
    expect(result.payQuartileDistribution.status).toBe(
      EuCoreMetricResultStatus.BlockedClassificationIncomplete,
    );
  });

  it('excludes metrics-calculation-blocked assigned rows without silently blending them', () => {
    const rows = [
      assignedRow(0),
      assignedRow(1, { metricsCalculationBlocked: true }),
      assignedRow(2),
      assignedRow(3),
    ];
    const intake = [
      intakeRow(0, Gender.Male, '100'),
      intakeRow(1, Gender.Male, '9999'),
      intakeRow(2, Gender.Female, '80'),
      intakeRow(3, Gender.Female, '80'),
    ];
    const result = runEuCoreMetrics({
      snapshotId: 'snap-mb',
      methodologyVersion: 'meth-v1',
      rulePackVersion: 'rules-v1',
      categoryAssignment: {
        snapshotId: 'snap-mb',
        traceability: baseTraceability(),
        rows,
        assignedCount: 4,
        reviewRequiredCount: 0,
        unassignedCount: 0,
        metricsCalculationBlockedCount: 1,
      },
      normalizedIntakeRows: intake,
    });
    expect(result.inclusion.excludedMetricsCalculationBlocked).toBe(1);
    expect(result.meanGenderPayGap.valuePercent).toBe(20);
  });

  it('returns insufficient data when binary gender sample is incomplete', () => {
    const rows = [assignedRow(0), assignedRow(1)];
    const intake = [intakeRow(0, Gender.Male, '100'), intakeRow(1, Gender.Male, '120')];
    const result = runEuCoreMetrics({
      snapshotId: 'snap-insuf',
      methodologyVersion: 'meth-v1',
      rulePackVersion: 'rules-v1',
      categoryAssignment: {
        snapshotId: 'snap-insuf',
        traceability: baseTraceability(),
        rows,
        assignedCount: 2,
        reviewRequiredCount: 0,
        unassignedCount: 0,
        metricsCalculationBlockedCount: 0,
      },
      normalizedIntakeRows: intake,
    });
    expect(result.meanGenderPayGap.status).toBe(EuCoreMetricResultStatus.InsufficientEligibleData);
    expect(result.payQuartileDistribution.status).toBe(
      EuCoreMetricResultStatus.InsufficientEligibleData,
    );
  });

  it('computes quartile distribution when enough eligible rows exist', () => {
    const rows = [assignedRow(0), assignedRow(1), assignedRow(2), assignedRow(3)];
    const intake = [
      intakeRow(0, Gender.Female, '10'),
      intakeRow(1, Gender.Male, '20'),
      intakeRow(2, Gender.Female, '30'),
      intakeRow(3, Gender.Male, '40'),
    ];
    const result = runEuCoreMetrics({
      snapshotId: 'snap-q',
      methodologyVersion: 'meth-v1',
      rulePackVersion: 'rules-v1',
      categoryAssignment: {
        snapshotId: 'snap-q',
        traceability: baseTraceability(),
        rows,
        assignedCount: 4,
        reviewRequiredCount: 0,
        unassignedCount: 0,
        metricsCalculationBlockedCount: 0,
      },
      normalizedIntakeRows: intake,
    });
    expect(result.payQuartileDistribution.status).toBe(EuCoreMetricResultStatus.Computed);
    expect(result.payQuartileDistribution.bands).toEqual([
      { quartile: 1, maleCount: 0, femaleCount: 1 },
      { quartile: 2, maleCount: 1, femaleCount: 0 },
      { quartile: 3, maleCount: 0, femaleCount: 1 },
      { quartile: 4, maleCount: 1, femaleCount: 0 },
    ]);
  });

  it('computes mean variable pay gap when supplemental variable pay is supplied', () => {
    const rows = [assignedRow(0), assignedRow(1), assignedRow(2), assignedRow(3)];
    const intake = [
      intakeRow(0, Gender.Male, '100'),
      intakeRow(1, Gender.Male, '100'),
      intakeRow(2, Gender.Female, '80'),
      intakeRow(3, Gender.Female, '80'),
    ];
    const result = runEuCoreMetrics({
      snapshotId: 'snap-var',
      methodologyVersion: 'meth-v1',
      rulePackVersion: 'rules-v1',
      categoryAssignment: {
        snapshotId: 'snap-var',
        traceability: baseTraceability(),
        rows,
        assignedCount: 4,
        reviewRequiredCount: 0,
        unassignedCount: 0,
        metricsCalculationBlockedCount: 0,
      },
      normalizedIntakeRows: intake,
      variablePayRows: [
        { rowIndex: 0, variablePayDecimal: '50' },
        { rowIndex: 1, variablePayDecimal: '50' },
        { rowIndex: 2, variablePayDecimal: '40' },
        { rowIndex: 3, variablePayDecimal: '40' },
      ],
    });
    expect(result.meanVariablePayGap.status).toBe(EuCoreMetricResultStatus.Computed);
    expect(result.meanVariablePayGap.valuePercent).toBe(20);
  });

  it('surfaces no-variable-pay-input when supplemental track is absent', () => {
    const rows = [assignedRow(0), assignedRow(1), assignedRow(2), assignedRow(3)];
    const intake = [
      intakeRow(0, Gender.Male, '100'),
      intakeRow(1, Gender.Male, '100'),
      intakeRow(2, Gender.Female, '80'),
      intakeRow(3, Gender.Female, '80'),
    ];
    const result = runEuCoreMetrics({
      snapshotId: 'snap-novar',
      methodologyVersion: 'meth-v1',
      rulePackVersion: 'rules-v1',
      categoryAssignment: {
        snapshotId: 'snap-novar',
        traceability: baseTraceability(),
        rows,
        assignedCount: 4,
        reviewRequiredCount: 0,
        unassignedCount: 0,
        metricsCalculationBlockedCount: 0,
      },
      normalizedIntakeRows: intake,
    });
    expect(result.meanVariablePayGap.status).toBe(EuCoreMetricResultStatus.NoVariablePayInput);
  });
});

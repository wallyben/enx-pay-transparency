import type {
  EuCoreMetricsInclusionExclusionSummary,
  EuCoreMetricsRunInput,
  EuCoreMetricsRunResult,
  EuCoreMetricsTraceability,
  EuCorePayQuartileBandCounts,
  EuCoreQuartileDistributionResult,
  EuCoreScalarMetricResult,
} from '@enx/contracts';
import {
  CategoryAssignmentStatus,
  EuCoreMetricId,
  EuCoreMetricResultStatus,
  Gender,
  LogicalIntakeField,
} from '@enx/contracts';
import { parseStrictPositiveDecimal, roundPercentValue } from './decimal-parse';
import { genderGapPercent, mean, medianSorted, payQuartileBand } from './statistics';

const ISSUE = {
  CLASSIFICATION_INCOMPLETE: 'CLASSIFICATION_INCOMPLETE',
  INSUFFICIENT_BINARY_GENDER_SAMPLE: 'INSUFFICIENT_BINARY_GENDER_SAMPLE',
  ZERO_MALE_MEAN_PAY: 'ZERO_MALE_MEAN_PAY',
  ZERO_MALE_MEDIAN_PAY: 'ZERO_MALE_MEDIAN_PAY',
  INSUFFICIENT_QUARTILE_SAMPLE: 'INSUFFICIENT_QUARTILE_SAMPLE',
  NO_VARIABLE_PAY_INPUT: 'NO_VARIABLE_PAY_INPUT',
  INSUFFICIENT_VARIABLE_PAY_SAMPLE: 'INSUFFICIENT_VARIABLE_PAY_SAMPLE',
  ZERO_MALE_MEAN_VARIABLE: 'ZERO_MALE_MEAN_VARIABLE',
} as const;

interface EligiblePayRow {
  readonly rowIndex: number;
  readonly gender: Gender.Male | Gender.Female;
  readonly basePay: number;
  readonly variablePay?: number;
}

function blockedScalar(metricId: EuCoreMetricId): EuCoreScalarMetricResult {
  return {
    metricId,
    status: EuCoreMetricResultStatus.BlockedClassificationIncomplete,
    issues: [{ code: ISSUE.CLASSIFICATION_INCOMPLETE }],
  };
}

function blockedQuartiles(): EuCoreQuartileDistributionResult {
  return {
    metricId: EuCoreMetricId.PayQuartileDistributionByGender,
    status: EuCoreMetricResultStatus.BlockedClassificationIncomplete,
    issues: [{ code: ISSUE.CLASSIFICATION_INCOMPLETE }],
  };
}

function buildTraceability(input: EuCoreMetricsRunInput): EuCoreMetricsTraceability {
  return {
    snapshotId: input.snapshotId,
    methodologyVersion: input.methodologyVersion,
    rulePackVersion: input.rulePackVersion,
    categoryEngineRulesVersion: input.categoryAssignment.traceability.categoryEngineRulesVersion,
    jobNormalizationRulesVersion: input.categoryAssignment.traceability.jobNormalizationRulesVersion,
  };
}

export function runEuCoreMetrics(input: EuCoreMetricsRunInput): EuCoreMetricsRunResult {
  const traceability = buildTraceability(input);
  const sortedCategoryRows = [...input.categoryAssignment.rows].sort((a, b) => a.rowIndex - b.rowIndex);
  const intakeByRow = new Map(
    [...input.normalizedIntakeRows].sort((a, b) => a.rowIndex - b.rowIndex).map((r) => [r.rowIndex, r]),
  );

  const variableByRow = new Map<number, string>();
  const variableRows = input.variablePayRows ?? [];
  const sortedVar = [...variableRows].sort((a, b) => a.rowIndex - b.rowIndex);
  for (const v of sortedVar) {
    if (!variableByRow.has(v.rowIndex)) {
      variableByRow.set(v.rowIndex, v.variablePayDecimal);
    }
  }

  const classificationIncomplete =
    input.categoryAssignment.unassignedCount > 0 || input.categoryAssignment.reviewRequiredCount > 0;

  let excludedNotAssigned = 0;
  let excludedMetricsCalculationBlocked = 0;
  let excludedMissingIntakeRow = 0;
  let excludedMissingBasePay = 0;
  let excludedInvalidBasePay = 0;
  let excludedMissingGender = 0;
  let excludedNonBinaryGender = 0;

  const eligible: EligiblePayRow[] = [];

  for (const row of sortedCategoryRows) {
    if (row.status !== CategoryAssignmentStatus.ASSIGNED) {
      excludedNotAssigned += 1;
      continue;
    }
    if (row.metricsCalculationBlocked) {
      excludedMetricsCalculationBlocked += 1;
      continue;
    }

    const intake = intakeByRow.get(row.rowIndex);
    if (!intake) {
      excludedMissingIntakeRow += 1;
      continue;
    }

    const genderScalar = intake.values[LogicalIntakeField.GENDER];
    if (!genderScalar || genderScalar.kind !== 'GENDER') {
      excludedMissingGender += 1;
      continue;
    }
    if (genderScalar.value !== Gender.Male && genderScalar.value !== Gender.Female) {
      excludedNonBinaryGender += 1;
      continue;
    }

    const payScalar = intake.values[LogicalIntakeField.BASE_PAY_AMOUNT];
    if (!payScalar || payScalar.kind !== 'DECIMAL') {
      excludedMissingBasePay += 1;
      continue;
    }
    const basePay = parseStrictPositiveDecimal(payScalar.value);
    if (basePay === null) {
      excludedInvalidBasePay += 1;
      continue;
    }

    let variablePay: number | undefined;
    const rawVar = variableByRow.get(row.rowIndex);
    if (rawVar !== undefined) {
      const parsed = parseStrictPositiveDecimal(rawVar);
      if (parsed !== null) {
        variablePay = parsed;
      }
    }

    eligible.push({
      rowIndex: row.rowIndex,
      gender: genderScalar.value,
      basePay,
      variablePay,
    });
  }

  const eligibleMale = eligible.filter((e) => e.gender === Gender.Male);
  const eligibleFemale = eligible.filter((e) => e.gender === Gender.Female);

  const eligibleWithVar = eligible.filter((e) => e.variablePay !== undefined);
  const eligibleMaleVar = eligibleWithVar.filter((e) => e.gender === Gender.Male);
  const eligibleFemaleVar = eligibleWithVar.filter((e) => e.gender === Gender.Female);

  const inclusion: EuCoreMetricsInclusionExclusionSummary = {
    totalCategoryRows: sortedCategoryRows.length,
    classificationIncomplete,
    excludedNotAssigned,
    excludedMetricsCalculationBlocked,
    excludedMissingIntakeRow,
    excludedMissingBasePay,
    excludedInvalidBasePay,
    excludedMissingGender,
    excludedNonBinaryGender,
    eligibleForPayGapCount: eligible.length,
    eligibleMaleCount: eligibleMale.length,
    eligibleFemaleCount: eligibleFemale.length,
    eligibleWithVariablePayCount: eligibleWithVar.length,
    eligibleMaleWithVariablePayCount: eligibleMaleVar.length,
    eligibleFemaleWithVariablePayCount: eligibleFemaleVar.length,
  };

  const runGateBlocked = classificationIncomplete;

  if (runGateBlocked) {
    return {
      traceability,
      runGateBlocked,
      inclusion,
      meanGenderPayGap: blockedScalar(EuCoreMetricId.MeanGenderPayGapPct),
      medianGenderPayGap: blockedScalar(EuCoreMetricId.MedianGenderPayGapPct),
      meanVariablePayGap: blockedScalar(EuCoreMetricId.MeanVariablePayGapPct),
      payQuartileDistribution: blockedQuartiles(),
    };
  }

  const meanGenderPayGap = computeMeanGap(eligibleMale, eligibleFemale);
  const medianGenderPayGap = computeMedianGap(eligibleMale, eligibleFemale);
  const meanVariablePayGap = computeMeanVariableGap(input, eligibleMaleVar, eligibleFemaleVar);
  const payQuartileDistribution = computeQuartiles(eligible);

  return {
    traceability,
    runGateBlocked,
    inclusion,
    meanGenderPayGap,
    medianGenderPayGap,
    meanVariablePayGap,
    payQuartileDistribution,
  };
}

function computeMeanGap(
  eligibleMale: readonly EligiblePayRow[],
  eligibleFemale: readonly EligiblePayRow[],
): EuCoreScalarMetricResult {
  const metricId = EuCoreMetricId.MeanGenderPayGapPct;
  if (eligibleMale.length < 1 || eligibleFemale.length < 1) {
    return {
      metricId,
      status: EuCoreMetricResultStatus.InsufficientEligibleData,
      issues: [{ code: ISSUE.INSUFFICIENT_BINARY_GENDER_SAMPLE }],
    };
  }
  const meanM = mean(eligibleMale.map((e) => e.basePay));
  const meanF = mean(eligibleFemale.map((e) => e.basePay));
  if (meanM === 0) {
    return {
      metricId,
      status: EuCoreMetricResultStatus.NotComputable,
      issues: [{ code: ISSUE.ZERO_MALE_MEAN_PAY }],
    };
  }
  const raw = genderGapPercent(meanM, meanF);
  return {
    metricId,
    status: EuCoreMetricResultStatus.Computed,
    valuePercent: roundPercentValue(raw),
    issues: [],
  };
}

function computeMedianGap(
  eligibleMale: readonly EligiblePayRow[],
  eligibleFemale: readonly EligiblePayRow[],
): EuCoreScalarMetricResult {
  const metricId = EuCoreMetricId.MedianGenderPayGapPct;
  if (eligibleMale.length < 1 || eligibleFemale.length < 1) {
    return {
      metricId,
      status: EuCoreMetricResultStatus.InsufficientEligibleData,
      issues: [{ code: ISSUE.INSUFFICIENT_BINARY_GENDER_SAMPLE }],
    };
  }
  const malePays = eligibleMale.map((e) => e.basePay).sort((a, b) => a - b || 0);
  const femalePays = eligibleFemale.map((e) => e.basePay).sort((a, b) => a - b || 0);
  const medM = medianSorted(malePays);
  const medF = medianSorted(femalePays);
  if (medM === 0) {
    return {
      metricId,
      status: EuCoreMetricResultStatus.NotComputable,
      issues: [{ code: ISSUE.ZERO_MALE_MEDIAN_PAY }],
    };
  }
  const raw = genderGapPercent(medM, medF);
  return {
    metricId,
    status: EuCoreMetricResultStatus.Computed,
    valuePercent: roundPercentValue(raw),
    issues: [],
  };
}

function computeMeanVariableGap(
  input: EuCoreMetricsRunInput,
  eligibleMaleVar: readonly EligiblePayRow[],
  eligibleFemaleVar: readonly EligiblePayRow[],
): EuCoreScalarMetricResult {
  const metricId = EuCoreMetricId.MeanVariablePayGapPct;
  const hasInput = (input.variablePayRows?.length ?? 0) > 0;
  if (!hasInput) {
    return {
      metricId,
      status: EuCoreMetricResultStatus.NoVariablePayInput,
      issues: [{ code: ISSUE.NO_VARIABLE_PAY_INPUT }],
    };
  }
  if (eligibleMaleVar.length < 1 || eligibleFemaleVar.length < 1) {
    return {
      metricId,
      status: EuCoreMetricResultStatus.InsufficientEligibleData,
      issues: [{ code: ISSUE.INSUFFICIENT_VARIABLE_PAY_SAMPLE }],
    };
  }
  const meanM = mean(eligibleMaleVar.map((e) => e.variablePay!));
  const meanF = mean(eligibleFemaleVar.map((e) => e.variablePay!));
  if (meanM === 0) {
    return {
      metricId,
      status: EuCoreMetricResultStatus.NotComputable,
      issues: [{ code: ISSUE.ZERO_MALE_MEAN_VARIABLE }],
    };
  }
  const raw = genderGapPercent(meanM, meanF);
  return {
    metricId,
    status: EuCoreMetricResultStatus.Computed,
    valuePercent: roundPercentValue(raw),
    issues: [],
  };
}

function computeQuartiles(eligible: readonly EligiblePayRow[]): EuCoreQuartileDistributionResult {
  const metricId = EuCoreMetricId.PayQuartileDistributionByGender;
  if (eligible.length < 4) {
    return {
      metricId,
      status: EuCoreMetricResultStatus.InsufficientEligibleData,
      issues: [{ code: ISSUE.INSUFFICIENT_QUARTILE_SAMPLE }],
    };
  }

  const sorted = [...eligible].sort((a, b) => a.basePay - b.basePay || a.rowIndex - b.rowIndex);
  const n = sorted.length;

  const buckets: Array<{ quartile: 1 | 2 | 3 | 4; maleCount: number; femaleCount: number }> = [
    { quartile: 1, maleCount: 0, femaleCount: 0 },
    { quartile: 2, maleCount: 0, femaleCount: 0 },
    { quartile: 3, maleCount: 0, femaleCount: 0 },
    { quartile: 4, maleCount: 0, femaleCount: 0 },
  ];

  for (let i = 0; i < n; i += 1) {
    const row = sorted[i]!;
    const band = payQuartileBand(i, n);
    const cell = buckets[band - 1]!;
    if (row.gender === Gender.Male) {
      cell.maleCount += 1;
    } else {
      cell.femaleCount += 1;
    }
  }

  const bands: readonly EuCorePayQuartileBandCounts[] = buckets;

  return {
    metricId,
    status: EuCoreMetricResultStatus.Computed,
    bands,
    issues: [],
  };
}

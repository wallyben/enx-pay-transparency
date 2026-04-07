import type { EuCoreMetricsRunResult } from '@enx/contracts';
import type { ReportingDataQualityNote } from '@enx/contracts';

function pushMetricIssues(
  notes: ReportingDataQualityNote[],
  prefix: string,
  issues: readonly { readonly code: string; readonly detail?: string }[],
): void {
  for (const issue of issues) {
    notes.push({
      code: `${prefix}:${issue.code}`,
      detail: issue.detail,
    });
  }
}

export function buildReportingDataQualityNotes(
  euCoreMetrics: EuCoreMetricsRunResult,
): readonly ReportingDataQualityNote[] {
  const notes: ReportingDataQualityNote[] = [];
  const inc = euCoreMetrics.inclusion;

  if (inc.classificationIncomplete) {
    notes.push({ code: 'CLASSIFICATION_INCOMPLETE' });
  }
  if (inc.excludedNotAssigned > 0) {
    notes.push({ code: 'EXCLUDED_NOT_ASSIGNED', detail: String(inc.excludedNotAssigned) });
  }
  if (inc.excludedMetricsCalculationBlocked > 0) {
    notes.push({
      code: 'EXCLUDED_METRICS_CALCULATION_BLOCKED',
      detail: String(inc.excludedMetricsCalculationBlocked),
    });
  }
  if (inc.excludedMissingIntakeRow > 0) {
    notes.push({ code: 'EXCLUDED_MISSING_INTAKE_ROW', detail: String(inc.excludedMissingIntakeRow) });
  }
  if (inc.excludedMissingBasePay > 0) {
    notes.push({ code: 'EXCLUDED_MISSING_BASE_PAY', detail: String(inc.excludedMissingBasePay) });
  }
  if (inc.excludedInvalidBasePay > 0) {
    notes.push({ code: 'EXCLUDED_INVALID_BASE_PAY', detail: String(inc.excludedInvalidBasePay) });
  }
  if (inc.excludedMissingGender > 0) {
    notes.push({ code: 'EXCLUDED_MISSING_GENDER', detail: String(inc.excludedMissingGender) });
  }
  if (inc.excludedNonBinaryGender > 0) {
    notes.push({ code: 'EXCLUDED_NON_BINARY_GENDER', detail: String(inc.excludedNonBinaryGender) });
  }

  pushMetricIssues(notes, 'MEAN_GENDER_PAY_GAP', euCoreMetrics.meanGenderPayGap.issues);
  pushMetricIssues(notes, 'MEDIAN_GENDER_PAY_GAP', euCoreMetrics.medianGenderPayGap.issues);
  pushMetricIssues(notes, 'MEAN_VARIABLE_PAY_GAP', euCoreMetrics.meanVariablePayGap.issues);
  pushMetricIssues(notes, 'PAY_QUARTILES', euCoreMetrics.payQuartileDistribution.issues);

  return notes.sort((a, b) => {
    const c = a.code.localeCompare(b.code);
    if (c !== 0) {
      return c;
    }
    return (a.detail ?? '').localeCompare(b.detail ?? '');
  });
}

import { EuCoreMetricId, EuCoreMetricResultStatus, ReportingPackExportBlockedReason } from '@enx/contracts';
import { evaluateReportingPackExportBlockers } from '../pack-completeness';
import {
  assignedRow,
  categorySnapshotFor,
  minimalComputedEuCore,
} from '../test-fixtures/assemble-fixtures';

describe('evaluateReportingPackExportBlockers', () => {
  it('returns sorted unique reasons', () => {
    const rows = [assignedRow(0), assignedRow(1), assignedRow(2), assignedRow(3)];
    const cat = categorySnapshotFor('z', rows);
    const eu = minimalComputedEuCore('z');
    const reasons = evaluateReportingPackExportBlockers(eu, cat);
    expect(reasons).toEqual([]);
    const sorted = [...reasons].sort((a, b) => a.localeCompare(b));
    expect(reasons).toEqual(sorted);
  });

  it('flags quartile headline when not computed even if gate is open', () => {
    const rows = [assignedRow(0), assignedRow(1), assignedRow(2), assignedRow(3)];
    const cat = categorySnapshotFor('snap-q', rows);
    const base = minimalComputedEuCore('snap-q');
    const eu = {
      ...base,
      payQuartileDistribution: {
        ...base.payQuartileDistribution,
        status: EuCoreMetricResultStatus.InsufficientEligibleData,
        bands: undefined,
        issues: [{ code: 'INSUFFICIENT_QUARTILE_SAMPLE' }],
      },
    };
    const reasons = evaluateReportingPackExportBlockers(eu, cat);
    expect(reasons).toContain(ReportingPackExportBlockedReason.PayQuartileDistributionNotComputed);
    expect(reasons).not.toContain(ReportingPackExportBlockedReason.MetricsRunGateBlocked);
  });

  it('does not add not-computed reasons when the run gate already blocked the metrics run', () => {
    const rows = [assignedRow(0), assignedRow(1), assignedRow(2), assignedRow(3)];
    const cat = categorySnapshotFor('snap-g', rows);
    const base = minimalComputedEuCore('snap-g');
    const eu = {
      ...base,
      runGateBlocked: true,
      inclusion: { ...base.inclusion, classificationIncomplete: true },
      meanGenderPayGap: {
        metricId: EuCoreMetricId.MeanGenderPayGapPct,
        status: EuCoreMetricResultStatus.BlockedClassificationIncomplete,
        issues: [],
      },
      medianGenderPayGap: {
        metricId: EuCoreMetricId.MedianGenderPayGapPct,
        status: EuCoreMetricResultStatus.BlockedClassificationIncomplete,
        issues: [],
      },
      meanVariablePayGap: {
        metricId: EuCoreMetricId.MeanVariablePayGapPct,
        status: EuCoreMetricResultStatus.BlockedClassificationIncomplete,
        issues: [],
      },
      payQuartileDistribution: {
        metricId: EuCoreMetricId.PayQuartileDistributionByGender,
        status: EuCoreMetricResultStatus.BlockedClassificationIncomplete,
        issues: [],
      },
    };
    const reasons = evaluateReportingPackExportBlockers(eu, cat);
    expect(reasons).toEqual([ReportingPackExportBlockedReason.MetricsRunGateBlocked]);
  });
});

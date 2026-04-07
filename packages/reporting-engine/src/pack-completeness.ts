import type { CategoryAssignmentSnapshotResult } from '@enx/contracts';
import type { EuCoreMetricsRunResult } from '@enx/contracts';
import { EuCoreMetricResultStatus } from '@enx/contracts';
import { ReportingPackExportBlockedReason } from '@enx/contracts';

function uniqueSortedReasons(
  reasons: readonly ReportingPackExportBlockedReason[],
): ReportingPackExportBlockedReason[] {
  return [...new Set(reasons)].sort((a, b) => a.localeCompare(b));
}

export function evaluateReportingPackExportBlockers(
  euCoreMetrics: EuCoreMetricsRunResult,
  categoryAssignment: CategoryAssignmentSnapshotResult,
): ReportingPackExportBlockedReason[] {
  const reasons: ReportingPackExportBlockedReason[] = [];

  if (euCoreMetrics.traceability.snapshotId !== categoryAssignment.snapshotId) {
    reasons.push(ReportingPackExportBlockedReason.SnapshotReferenceMismatch);
  }

  if (euCoreMetrics.runGateBlocked) {
    reasons.push(ReportingPackExportBlockedReason.MetricsRunGateBlocked);
  }

  if (!euCoreMetrics.runGateBlocked) {
    if (euCoreMetrics.meanGenderPayGap.status !== EuCoreMetricResultStatus.Computed) {
      reasons.push(ReportingPackExportBlockedReason.MeanGenderPayGapNotComputed);
    }
    if (euCoreMetrics.medianGenderPayGap.status !== EuCoreMetricResultStatus.Computed) {
      reasons.push(ReportingPackExportBlockedReason.MedianGenderPayGapNotComputed);
    }
    if (euCoreMetrics.payQuartileDistribution.status !== EuCoreMetricResultStatus.Computed) {
      reasons.push(ReportingPackExportBlockedReason.PayQuartileDistributionNotComputed);
    }
  }

  return uniqueSortedReasons(reasons);
}

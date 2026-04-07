export enum ReportingPackExportBlockedReason {
  /** EU core metrics run was snapshot-gated (classification not complete). */
  MetricsRunGateBlocked = 'METRICS_RUN_GATE_BLOCKED',
  /** Category assignment snapshot id does not match metrics traceability snapshot id. */
  SnapshotReferenceMismatch = 'SNAPSHOT_REFERENCE_MISMATCH',
  MeanGenderPayGapNotComputed = 'MEAN_GENDER_PAY_GAP_NOT_COMPUTED',
  MedianGenderPayGapNotComputed = 'MEDIAN_GENDER_PAY_GAP_NOT_COMPUTED',
  PayQuartileDistributionNotComputed = 'PAY_QUARTILE_DISTRIBUTION_NOT_COMPUTED',
}

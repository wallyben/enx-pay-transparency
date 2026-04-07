import {
  CategoryAssignmentStatus,
  EuCoreMetricId,
  EuCoreMetricResultStatus,
  ReportingEvidencePackSchema,
  ReportingPackCompletenessStatus,
  ReportingPackExportBlockedReason,
} from '@enx/contracts';
import { assembleReportingPack, assertReportingPackExportable } from '../assemble-reporting-pack';
import {
  assignedRow,
  categorySnapshotFor,
  minimalComputedEuCore,
} from '../test-fixtures/assemble-fixtures';

describe('assembleReportingPack', () => {
  it('assembles a complete pack with traceability and attestation shell', () => {
    const rows = [assignedRow(0), assignedRow(1), assignedRow(2), assignedRow(3)];
    const category = categorySnapshotFor('snap-pack', rows);
    const metrics = minimalComputedEuCore('snap-pack');

    const pack = assembleReportingPack({
      assembledAtIso: '2026-04-07T15:00:00.000Z',
      euCoreMetrics: metrics,
      categoryAssignment: category,
      intakeSnapshotRef: { intakeFileId: 'file-1', contentSha256Hex: 'a'.repeat(64) },
    });

    expect(pack.manifest.completeness.status).toBe(ReportingPackCompletenessStatus.Complete);
    expect(pack.manifest.completeness.exportBlockedReasons).toEqual([]);
    expect(pack.manifest.traceability.euCoreMetricsTraceability.snapshotId).toBe('snap-pack');
    expect(pack.manifest.traceability.categoryAssignmentSnapshotId).toBe('snap-pack');
    expect(pack.manifest.traceability.intakeSnapshotRef?.intakeFileId).toBe('file-1');
    expect(pack.evidence.snapshotSummary.snapshotId).toBe('snap-pack');
    expect(pack.evidence.categorySummary.distinctAssignedCategoryCount).toBe(1);
    expect(pack.attestation.reviewer.status).toBe('PENDING');
    expect(pack.attestation.management.actorId).toBeNull();
    expect(pack.manifest.rendering.pdf.productionStatus).toBe('NOT_PRODUCED');

    const parsed = ReportingEvidencePackSchema.parse(pack);
    expect(parsed.manifest.run.reportRunId).toMatch(/^rpr_[a-f0-9]{64}$/);

    assertReportingPackExportable(pack);
  });

  it('is deterministic for identical upstream payloads and ref', () => {
    const rows = [assignedRow(0), assignedRow(1, { categoryId: 'b' }), assignedRow(2), assignedRow(3)];
    const category = categorySnapshotFor('snap-d', rows);
    const metrics = minimalComputedEuCore('snap-d');
    const input = {
      assembledAtIso: '2026-04-07T16:00:00.000Z',
      euCoreMetrics: metrics,
      categoryAssignment: category,
    };
    const a = assembleReportingPack(input);
    const b = assembleReportingPack(input);
    expect(a.manifest.run.contentDigestSha256Hex).toBe(b.manifest.run.contentDigestSha256Hex);
    expect(a.manifest.run.reportRunId).toBe(b.manifest.run.reportRunId);
  });

  it('marks incomplete and blocks export when metrics run gate is blocked', () => {
    const rows: ReturnType<typeof assignedRow>[] = [
      assignedRow(0),
      {
        ...assignedRow(1),
        status: CategoryAssignmentStatus.REVIEW_REQUIRED,
        categoryId: null,
        basis: null,
      },
    ];
    const category = categorySnapshotFor('snap-blk', rows);
    const base = minimalComputedEuCore('snap-blk');
    const metrics = {
      ...base,
      runGateBlocked: true,
      inclusion: {
        ...base.inclusion,
        totalCategoryRows: 2,
        classificationIncomplete: true,
        eligibleForPayGapCount: 0,
        eligibleMaleCount: 0,
        eligibleFemaleCount: 0,
      },
      meanGenderPayGap: {
        metricId: EuCoreMetricId.MeanGenderPayGapPct,
        status: EuCoreMetricResultStatus.BlockedClassificationIncomplete,
        issues: [{ code: 'CLASSIFICATION_INCOMPLETE' }],
      },
      medianGenderPayGap: {
        metricId: EuCoreMetricId.MedianGenderPayGapPct,
        status: EuCoreMetricResultStatus.BlockedClassificationIncomplete,
        issues: [{ code: 'CLASSIFICATION_INCOMPLETE' }],
      },
      meanVariablePayGap: {
        metricId: EuCoreMetricId.MeanVariablePayGapPct,
        status: EuCoreMetricResultStatus.BlockedClassificationIncomplete,
        issues: [{ code: 'CLASSIFICATION_INCOMPLETE' }],
      },
      payQuartileDistribution: {
        metricId: EuCoreMetricId.PayQuartileDistributionByGender,
        status: EuCoreMetricResultStatus.BlockedClassificationIncomplete,
        issues: [{ code: 'CLASSIFICATION_INCOMPLETE' }],
      },
    };

    const pack = assembleReportingPack({
      assembledAtIso: '2026-04-07T17:00:00.000Z',
      euCoreMetrics: metrics,
      categoryAssignment: category,
    });

    expect(pack.manifest.completeness.status).toBe(ReportingPackCompletenessStatus.Incomplete);
    expect(pack.manifest.completeness.exportBlockedReasons).toContain(
      ReportingPackExportBlockedReason.MetricsRunGateBlocked,
    );
    expect(() => assertReportingPackExportable(pack)).toThrow(/export blocked/);
  });

  it('records snapshot reference mismatch as a first-class blocker', () => {
    const rows = [assignedRow(0), assignedRow(1), assignedRow(2), assignedRow(3)];
    const category = categorySnapshotFor('snap-cat', rows);
    const metrics = minimalComputedEuCore('snap-metrics');

    const pack = assembleReportingPack({
      assembledAtIso: '2026-04-07T18:00:00.000Z',
      euCoreMetrics: metrics,
      categoryAssignment: category,
    });

    expect(pack.manifest.completeness.exportBlockedReasons).toContain(
      ReportingPackExportBlockedReason.SnapshotReferenceMismatch,
    );
  });

  it('includes sorted data quality notes derived from inclusion and metric issues', () => {
    const rows = [assignedRow(0), assignedRow(1), assignedRow(2), assignedRow(3)];
    const category = categorySnapshotFor('snap-dq', rows);
    const metrics = minimalComputedEuCore('snap-dq');
    const pack = assembleReportingPack({
      assembledAtIso: '2026-04-07T19:00:00.000Z',
      euCoreMetrics: metrics,
      categoryAssignment: category,
    });
    const codes = pack.evidence.dataQualityNotes.map((n) => n.code);
    const sorted = [...codes].sort((a, b) => a.localeCompare(b));
    expect(codes).toEqual(sorted);
    expect(codes.some((c) => c.startsWith('MEAN_VARIABLE_PAY_GAP:'))).toBe(true);
  });
});

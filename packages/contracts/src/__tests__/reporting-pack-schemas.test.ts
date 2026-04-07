import { EuCoreMetricId } from '../enums/eu-core-metric-id';
import { EuCoreMetricResultStatus } from '../enums/eu-core-metric-result-status';
import { ReportingPackCompletenessStatus } from '../enums/reporting-pack-completeness-status';
import { ReportingPackExportBlockedReason } from '../enums/reporting-pack-export-blocked-reason';
import { ReportingEvidencePackSchema } from '../schemas/reporting-pack';

describe('reporting-pack schemas', () => {
  it('parses a complete evidence pack envelope', () => {
    const eu = {
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
    };

    const parsed = ReportingEvidencePackSchema.parse({
      schemaId: 'enx.reporting_evidence_pack.v1',
      manifest: {
        schemaId: 'enx.reporting_evidence_pack.manifest.v1',
        run: {
          reportRunId: 'rpr_test',
          contentDigestSha256Hex: 'a'.repeat(64),
          assembledAtIso: '2026-04-07T12:00:00.000Z',
        },
        completeness: {
          status: ReportingPackCompletenessStatus.Complete,
          exportBlockedReasons: [],
        },
        traceability: {
          snapshotId: 'snap-1',
          methodologyReferences: {
            methodologyVersion: 'm1',
            rulePackVersion: 'r1',
            categoryEngineRulesVersion: 'c1',
            jobNormalizationRulesVersion: 'j1',
          },
          euCoreMetricsTraceability: eu.traceability,
          categoryAssignmentSnapshotId: 'snap-1',
        },
        rendering: {
          primaryStructuredEvidence: { format: 'application/json', role: 'EVIDENCE' },
          pdf: {
            format: 'application/pdf',
            productionStatus: 'NOT_PRODUCED',
            note: 'S12 placeholder only',
          },
        },
      },
      evidence: {
        snapshotSummary: {
          snapshotId: 'snap-1',
          methodologyVersion: 'm1',
          rulePackVersion: 'r1',
        },
        euCoreMetricsRun: eu,
        categorySummary: {
          snapshotId: 'snap-1',
          assignedCount: 4,
          reviewRequiredCount: 0,
          unassignedCount: 0,
          metricsCalculationBlockedCount: 0,
          distinctAssignedCategoryCount: 1,
        },
        dataQualityNotes: [{ code: 'SAMPLE', detail: 'ok' }],
      },
      attestation: {
        reviewer: {
          status: 'PENDING',
          actorId: null,
          attestedAtIso: null,
          statement: null,
        },
        management: {
          status: 'PENDING',
          actorId: null,
          attestedAtIso: null,
          statement: null,
        },
      },
    });

    expect(parsed.manifest.completeness.status).toBe(ReportingPackCompletenessStatus.Complete);
    expect(parsed.evidence.euCoreMetricsRun.meanGenderPayGap.status).toBe(EuCoreMetricResultStatus.Computed);
  });

  it('parses an incomplete manifest with blocked reasons', () => {
    const parsed = ReportingEvidencePackSchema.parse({
      schemaId: 'enx.reporting_evidence_pack.v1',
      manifest: {
        schemaId: 'enx.reporting_evidence_pack.manifest.v1',
        run: {
          reportRunId: 'rpr_inc',
          contentDigestSha256Hex: 'b'.repeat(64),
          assembledAtIso: '2026-04-07T12:00:00.000Z',
        },
        completeness: {
          status: ReportingPackCompletenessStatus.Incomplete,
          exportBlockedReasons: [ReportingPackExportBlockedReason.MetricsRunGateBlocked],
        },
        traceability: {
          snapshotId: 'snap-1',
          methodologyReferences: {
            methodologyVersion: 'm1',
            rulePackVersion: 'r1',
            categoryEngineRulesVersion: 'c1',
            jobNormalizationRulesVersion: 'j1',
          },
          euCoreMetricsTraceability: {
            snapshotId: 'snap-1',
            methodologyVersion: 'm1',
            rulePackVersion: 'r1',
            categoryEngineRulesVersion: 'c1',
            jobNormalizationRulesVersion: 'j1',
          },
          categoryAssignmentSnapshotId: 'snap-1',
        },
        rendering: {
          primaryStructuredEvidence: { format: 'application/json', role: 'EVIDENCE' },
          pdf: {
            format: 'application/pdf',
            productionStatus: 'NOT_PRODUCED',
            note: 'S12 placeholder only',
          },
        },
      },
      evidence: {
        snapshotSummary: {
          snapshotId: 'snap-1',
          methodologyVersion: 'm1',
          rulePackVersion: 'r1',
        },
        euCoreMetricsRun: {
          traceability: {
            snapshotId: 'snap-1',
            methodologyVersion: 'm1',
            rulePackVersion: 'r1',
            categoryEngineRulesVersion: 'c1',
            jobNormalizationRulesVersion: 'j1',
          },
          runGateBlocked: true,
          inclusion: {
            totalCategoryRows: 2,
            classificationIncomplete: true,
            excludedNotAssigned: 0,
            excludedMetricsCalculationBlocked: 0,
            excludedMissingIntakeRow: 0,
            excludedMissingBasePay: 0,
            excludedInvalidBasePay: 0,
            excludedMissingGender: 0,
            excludedNonBinaryGender: 0,
            eligibleForPayGapCount: 0,
            eligibleMaleCount: 0,
            eligibleFemaleCount: 0,
            eligibleWithVariablePayCount: 0,
            eligibleMaleWithVariablePayCount: 0,
            eligibleFemaleWithVariablePayCount: 0,
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
        },
        categorySummary: {
          snapshotId: 'snap-1',
          assignedCount: 1,
          reviewRequiredCount: 1,
          unassignedCount: 0,
          metricsCalculationBlockedCount: 0,
          distinctAssignedCategoryCount: 1,
        },
        dataQualityNotes: [],
      },
      attestation: {
        reviewer: {
          status: 'PENDING',
          actorId: null,
          attestedAtIso: null,
          statement: null,
        },
        management: {
          status: 'PENDING',
          actorId: null,
          attestedAtIso: null,
          statement: null,
        },
      },
    });

    expect(parsed.manifest.completeness.exportBlockedReasons).toContain(
      ReportingPackExportBlockedReason.MetricsRunGateBlocked,
    );
  });
});

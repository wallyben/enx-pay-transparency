import { ActorType, AuditOutcome, InMemoryAuditWriter } from '@enx/audit';
import { EuCoreMetricId, EuCoreMetricResultStatus } from '@enx/contracts';
import { writeEuCoreMetricsRunAudit } from '../eu-core/metrics-audit';

describe('writeEuCoreMetricsRunAudit', () => {
  it('writes a DATA audit row with snapshot and methodology linkage', async () => {
    const writer = new InMemoryAuditWriter();
    const result = {
      traceability: {
        snapshotId: 'snap-audit',
        methodologyVersion: 'meth-v1',
        rulePackVersion: 'rules-v1',
        categoryEngineRulesVersion: 'cat-v1',
        jobNormalizationRulesVersion: 'job-v1',
      },
      runGateBlocked: false,
      inclusion: {
        totalCategoryRows: 2,
        classificationIncomplete: false,
        excludedNotAssigned: 0,
        excludedMetricsCalculationBlocked: 0,
        excludedMissingIntakeRow: 0,
        excludedMissingBasePay: 0,
        excludedInvalidBasePay: 0,
        excludedMissingGender: 0,
        excludedNonBinaryGender: 0,
        eligibleForPayGapCount: 2,
        eligibleMaleCount: 1,
        eligibleFemaleCount: 1,
        eligibleWithVariablePayCount: 0,
        eligibleMaleWithVariablePayCount: 0,
        eligibleFemaleWithVariablePayCount: 0,
      },
      meanGenderPayGap: {
        metricId: EuCoreMetricId.MeanGenderPayGapPct,
        status: EuCoreMetricResultStatus.Computed,
        valuePercent: 5,
        issues: [],
      },
      medianGenderPayGap: {
        metricId: EuCoreMetricId.MedianGenderPayGapPct,
        status: EuCoreMetricResultStatus.Computed,
        valuePercent: 5,
        issues: [],
      },
      meanVariablePayGap: {
        metricId: EuCoreMetricId.MeanVariablePayGapPct,
        status: EuCoreMetricResultStatus.NoVariablePayInput,
        issues: [],
      },
      payQuartileDistribution: {
        metricId: EuCoreMetricId.PayQuartileDistributionByGender,
        status: EuCoreMetricResultStatus.InsufficientEligibleData,
        issues: [],
      },
    };

    await writeEuCoreMetricsRunAudit(writer, {
      actor: {
        actorId: 'actor-1',
        actorType: ActorType.SYSTEM,
        displayName: 'Metrics runner',
      },
      result,
    });

    const events = writer.snapshot();
    expect(events).toHaveLength(1);
    const e = events[0]!;
    expect(e.snapshotId).toBe('snap-audit');
    expect(e.methodologyVersion).toBe('meth-v1');
    expect(e.outcome).toBe(AuditOutcome.SUCCESS);
    expect(e.metadata['meanGapPct']).toBe('5');
  });
});

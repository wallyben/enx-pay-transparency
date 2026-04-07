import type { ActorIdentity, AuditEvent, AuditEventInput, AuditWriter } from '@enx/audit';
import { AuditAction, AuditEventCategory, AuditOutcome } from '@enx/audit';
import type { EuCoreMetricsRunResult } from '@enx/contracts';

export function buildEuCoreMetricsRunAuditInput(input: {
  readonly actor: ActorIdentity;
  readonly result: EuCoreMetricsRunResult;
  readonly correlationId?: string;
}): AuditEventInput {
  const { result } = input;
  const meta: Record<string, string> = {
    runGateBlocked: String(result.runGateBlocked),
    classificationIncomplete: String(result.inclusion.classificationIncomplete),
    eligibleForPayGapCount: String(result.inclusion.eligibleForPayGapCount),
    excludedMetricsCalculationBlocked: String(result.inclusion.excludedMetricsCalculationBlocked),
    meanGapStatus: result.meanGenderPayGap.status,
    medianGapStatus: result.medianGenderPayGap.status,
    variableGapStatus: result.meanVariablePayGap.status,
    quartileStatus: result.payQuartileDistribution.status,
  };
  if (result.meanGenderPayGap.valuePercent !== undefined) {
    meta['meanGapPct'] = String(result.meanGenderPayGap.valuePercent);
  }
  return {
    correlationId: input.correlationId,
    category: AuditEventCategory.DATA,
    action: AuditAction.READ,
    actor: input.actor,
    targetEntityType: 'EU_CORE_METRICS_RUN',
    targetEntityId: result.traceability.snapshotId,
    outcome: result.runGateBlocked ? AuditOutcome.PARTIAL : AuditOutcome.SUCCESS,
    metadata: meta,
    snapshotId: result.traceability.snapshotId,
    methodologyVersion: result.traceability.methodologyVersion,
  };
}

export async function writeEuCoreMetricsRunAudit(
  writer: AuditWriter,
  input: {
    readonly actor: ActorIdentity;
    readonly result: EuCoreMetricsRunResult;
    readonly correlationId?: string;
  },
): Promise<AuditEvent> {
  return writer.write(buildEuCoreMetricsRunAuditInput(input));
}

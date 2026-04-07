import type { ActorIdentity, AuditEvent, AuditEventInput, AuditWriter } from '@enx/audit';
import { AuditAction, AuditEventCategory, AuditOutcome } from '@enx/audit';
import type { ReportingEvidencePack } from '@enx/contracts';
import { ReportingPackCompletenessStatus } from '@enx/contracts';

export function buildReportingPackAssemblyAuditInput(input: {
  readonly actor: ActorIdentity;
  readonly pack: ReportingEvidencePack;
  readonly correlationId?: string;
}): AuditEventInput {
  const { pack } = input;
  const blocked = pack.manifest.completeness.exportBlockedReasons;
  const meta: Record<string, string> = {
    completeness: pack.manifest.completeness.status,
    exportBlockedCount: String(blocked.length),
    exportBlockedReasons: blocked.join('|'),
    contentDigestSha256Hex: pack.manifest.run.contentDigestSha256Hex,
    reportRunId: pack.manifest.run.reportRunId,
    snapshotId: pack.manifest.traceability.snapshotId,
  };
  return {
    correlationId: input.correlationId,
    category: AuditEventCategory.DATA,
    action: AuditAction.CREATE,
    actor: input.actor,
    targetEntityType: 'REPORTING_PACK_RUN',
    targetEntityId: pack.manifest.run.reportRunId,
    outcome:
      pack.manifest.completeness.status === ReportingPackCompletenessStatus.Complete
        ? AuditOutcome.SUCCESS
        : AuditOutcome.PARTIAL,
    metadata: meta,
    snapshotId: pack.manifest.traceability.snapshotId,
    methodologyVersion: pack.manifest.traceability.methodologyReferences.methodologyVersion,
  };
}

export async function writeReportingPackAssemblyAudit(
  writer: AuditWriter,
  input: {
    readonly actor: ActorIdentity;
    readonly pack: ReportingEvidencePack;
    readonly correlationId?: string;
  },
): Promise<AuditEvent> {
  return writer.write(buildReportingPackAssemblyAuditInput(input));
}

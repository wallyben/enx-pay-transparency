import type { IntakeSealedSnapshot } from '@enx/canonical-model';
import {
  AuditAction,
  AuditEventCategory,
  AuditOutcome,
  type ActorIdentity,
  type AuditWriter,
} from '@enx/audit';
import type { JobNormalizationSnapshotResult } from '@enx/contracts';
import { DEFAULT_JOB_NORMALIZATION_RULES_VERSION } from './job-normalization-rules-version';
import { runJobNormalizationOnSealedSnapshot } from './job-normalization-pipeline';

export async function runJobNormalizationWithAudit(input: {
  readonly snapshot: IntakeSealedSnapshot;
  readonly actor: ActorIdentity;
  readonly auditWriter: AuditWriter;
  readonly jobNormalizationRulesVersion?: string;
}): Promise<JobNormalizationSnapshotResult> {
  const jobNormalizationRulesVersion =
    input.jobNormalizationRulesVersion ?? DEFAULT_JOB_NORMALIZATION_RULES_VERSION;
  const result = runJobNormalizationOnSealedSnapshot(input.snapshot, jobNormalizationRulesVersion);

  await input.auditWriter.write({
    category: AuditEventCategory.DATA,
    action: AuditAction.UPDATE,
    actor: input.actor,
    targetEntityType: 'JOB_NORMALIZATION_RUN',
    targetEntityId: input.snapshot.snapshotId,
    outcome: result.ok ? AuditOutcome.SUCCESS : AuditOutcome.PARTIAL,
    metadata: {
      jobNormalizationRulesVersion: result.jobNormalizationRulesVersion,
      rowCount: String(result.rows.length),
      rowIssueCount: String(result.rowIssueCount),
      ok: String(result.ok),
    },
    snapshotId: input.snapshot.snapshotId,
    methodologyVersion: input.snapshot.lineage.methodologyVersion,
  });

  return result;
}

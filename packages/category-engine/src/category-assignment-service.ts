import {
  AuditAction,
  AuditEventCategory,
  AuditOutcome,
  type ActorIdentity,
  type AuditWriter,
} from '@enx/audit';
import type { JobNormalizationSnapshotResult } from '@enx/contracts';
import { CategoryAssignmentStatus } from '@enx/contracts';
import { DEFAULT_CATEGORY_ENGINE_RULES_VERSION } from './category-assignment-rules-version';
import { runCategoryAssignmentOnJobNormalization } from './category-assignment-pipeline';

export async function runCategoryAssignmentWithAudit(input: {
  readonly jobNormalization: JobNormalizationSnapshotResult;
  readonly methodologyVersion: string;
  readonly rulePackVersion: string;
  readonly actor: ActorIdentity;
  readonly auditWriter: AuditWriter;
  readonly categoryEngineRulesVersion?: string;
}): Promise<ReturnType<typeof runCategoryAssignmentOnJobNormalization>> {
  const categoryEngineRulesVersion =
    input.categoryEngineRulesVersion ?? DEFAULT_CATEGORY_ENGINE_RULES_VERSION;
  const result = runCategoryAssignmentOnJobNormalization({
    jobNormalization: input.jobNormalization,
    methodologyVersion: input.methodologyVersion,
    rulePackVersion: input.rulePackVersion,
    categoryEngineRulesVersion,
  });

  const allAssigned = result.rows.every((r) => r.status === CategoryAssignmentStatus.ASSIGNED);
  const outcome = allAssigned ? AuditOutcome.SUCCESS : AuditOutcome.PARTIAL;

  await input.auditWriter.write({
    category: AuditEventCategory.DATA,
    action: AuditAction.UPDATE,
    actor: input.actor,
    targetEntityType: 'CATEGORY_ASSIGNMENT_RUN',
    targetEntityId: result.snapshotId,
    outcome,
    metadata: {
      categoryEngineRulesVersion: result.traceability.categoryEngineRulesVersion,
      rowCount: String(result.rows.length),
      assignedCount: String(result.assignedCount),
      reviewRequiredCount: String(result.reviewRequiredCount),
      unassignedCount: String(result.unassignedCount),
    },
    snapshotId: result.snapshotId,
    methodologyVersion: input.methodologyVersion,
  });

  return result;
}

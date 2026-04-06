import {
  AuditAction,
  AuditEventCategory,
  AuditOutcome,
  type ActorIdentity,
  type AuditWriter,
} from '@enx/audit';
import type {
  CategoryOverrideRecord,
  EqualValueRuleset,
  JobNormalizationSnapshotResult,
} from '@enx/contracts';
import { CategoryAssignmentStatus } from '@enx/contracts';
import { DEFAULT_CATEGORY_ENGINE_RULES_VERSION } from './category-assignment-rules-version';
import { runExtendedCategoryAssignmentOnJobNormalization } from './extended-category-assignment-pipeline';

export async function runExtendedCategoryAssignmentWithAudit(input: {
  readonly jobNormalization: JobNormalizationSnapshotResult;
  readonly methodologyVersion: string;
  readonly rulePackVersion: string;
  readonly actor: ActorIdentity;
  readonly auditWriter: AuditWriter;
  readonly categoryEngineRulesVersion?: string;
  readonly equalValueRuleset?: EqualValueRuleset | null;
  readonly governedOverrides?: readonly CategoryOverrideRecord[] | null;
}): Promise<ReturnType<typeof runExtendedCategoryAssignmentOnJobNormalization>> {
  const categoryEngineRulesVersion =
    input.categoryEngineRulesVersion ?? DEFAULT_CATEGORY_ENGINE_RULES_VERSION;
  const result = runExtendedCategoryAssignmentOnJobNormalization({
    jobNormalization: input.jobNormalization,
    methodologyVersion: input.methodologyVersion,
    rulePackVersion: input.rulePackVersion,
    categoryEngineRulesVersion,
    equalValueRuleset: input.equalValueRuleset ?? null,
    governedOverrides: input.governedOverrides ?? null,
  });

  const allAssigned = result.rows.every((r) => r.status === CategoryAssignmentStatus.ASSIGNED);
  const noneBlocked = result.metricsCalculationBlockedCount === 0;
  const outcome =
    allAssigned && noneBlocked ? AuditOutcome.SUCCESS : AuditOutcome.PARTIAL;

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
      metricsCalculationBlockedCount: String(result.metricsCalculationBlockedCount),
      extendedPipeline: 'S10',
    },
    snapshotId: result.snapshotId,
    methodologyVersion: input.methodologyVersion,
  });

  return result;
}

import {
  AuditAction,
  AuditEventCategory,
  AuditOutcome,
  type ActorIdentity,
  type AuditWriter,
} from '@enx/audit';

/**
 * Minimal audit emission when a governed override is approved or rejected (S10).
 * Caller supplies reviewer identity and timestamps already reflected on the override record.
 */
export async function writeCategoryOverrideDecisionAudit(input: {
  readonly auditWriter: AuditWriter;
  readonly actor: ActorIdentity;
  readonly snapshotId: string;
  readonly methodologyVersion: string;
  readonly overrideId: string;
  readonly rowIndex: number;
  readonly decision: 'APPROVED' | 'REJECTED';
  readonly decidedAtIso: string;
  readonly reviewerActorId: string;
}): Promise<void> {
  const action =
    input.decision === 'APPROVED' ? AuditAction.APPROVE : AuditAction.REJECT;

  await input.auditWriter.write({
    category: AuditEventCategory.GOVERNANCE,
    action,
    actor: input.actor,
    targetEntityType: 'CATEGORY_OVERRIDE_RECORD',
    targetEntityId: input.overrideId,
    outcome: AuditOutcome.SUCCESS,
    metadata: {
      rowIndex: String(input.rowIndex),
      decision: input.decision,
      decidedAtIso: input.decidedAtIso,
      reviewerActorId: input.reviewerActorId,
    },
    snapshotId: input.snapshotId,
    methodologyVersion: input.methodologyVersion,
  });
}

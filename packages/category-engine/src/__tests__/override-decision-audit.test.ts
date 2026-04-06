import { ActorType, AuditAction, AuditEventCategory, InMemoryAuditWriter } from '@enx/audit';
import { writeCategoryOverrideDecisionAudit } from '../override-decision-audit';

describe('writeCategoryOverrideDecisionAudit', () => {
  it('writes APPROVE governance audit with reviewer metadata', async () => {
    const w = new InMemoryAuditWriter();
    await writeCategoryOverrideDecisionAudit({
      auditWriter: w,
      actor: { actorId: 'rev-1', actorType: ActorType.USER, displayName: 'Reviewer' },
      snapshotId: 'snp_1',
      methodologyVersion: 'm1',
      overrideId: 'ovr_1',
      rowIndex: 2,
      decision: 'APPROVED',
      decidedAtIso: '2026-04-07T15:00:00.000Z',
      reviewerActorId: 'rev-1',
    });
    const events = w.snapshot();
    expect(events).toHaveLength(1);
    expect(events[0]!.category).toBe(AuditEventCategory.GOVERNANCE);
    expect(events[0]!.action).toBe(AuditAction.APPROVE);
    expect(events[0]!.targetEntityType).toBe('CATEGORY_OVERRIDE_RECORD');
    expect(events[0]!.metadata.decidedAtIso).toBe('2026-04-07T15:00:00.000Z');
    expect(events[0]!.metadata.reviewerActorId).toBe('rev-1');
  });

  it('writes REJECT for rejection path', async () => {
    const w = new InMemoryAuditWriter();
    await writeCategoryOverrideDecisionAudit({
      auditWriter: w,
      actor: { actorId: 'rev-2', actorType: ActorType.USER, displayName: 'Reviewer 2' },
      snapshotId: 'snp_1',
      methodologyVersion: 'm1',
      overrideId: 'ovr_2',
      rowIndex: 0,
      decision: 'REJECTED',
      decidedAtIso: '2026-04-07T16:00:00.000Z',
      reviewerActorId: 'rev-2',
    });
    expect(w.snapshot()[0]!.action).toBe(AuditAction.REJECT);
  });
});

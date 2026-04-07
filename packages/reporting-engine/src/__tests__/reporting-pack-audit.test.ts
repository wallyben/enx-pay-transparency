import { ActorType, AuditAction, AuditOutcome, InMemoryAuditWriter } from '@enx/audit';
import { ReportingPackCompletenessStatus } from '@enx/contracts';
import { assembleReportingPack } from '../assemble-reporting-pack';
import { writeReportingPackAssemblyAudit } from '../reporting-pack-audit';
import {
  assignedRow,
  categorySnapshotFor,
  minimalComputedEuCore,
} from '../test-fixtures/assemble-fixtures';

describe('writeReportingPackAssemblyAudit', () => {
  it('writes CREATE with SUCCESS when pack is complete', async () => {
    const rows = [assignedRow(0), assignedRow(1), assignedRow(2), assignedRow(3)];
    const category = categorySnapshotFor('snap-audit-ok', rows);
    const pack = assembleReportingPack({
      assembledAtIso: '2026-04-07T20:00:00.000Z',
      euCoreMetrics: minimalComputedEuCore('snap-audit-ok'),
      categoryAssignment: category,
    });

    const writer = new InMemoryAuditWriter();
    await writeReportingPackAssemblyAudit(writer, {
      actor: { actorId: 'a1', actorType: ActorType.SYSTEM, displayName: 'Reporter' },
      pack,
    });

    const events = writer.snapshot();
    expect(events).toHaveLength(1);
    const e = events[0]!;
    expect(e.action).toBe(AuditAction.CREATE);
    expect(e.targetEntityType).toBe('REPORTING_PACK_RUN');
    expect(e.targetEntityId).toBe(pack.manifest.run.reportRunId);
    expect(e.outcome).toBe(AuditOutcome.SUCCESS);
    expect(e.metadata['completeness']).toBe(ReportingPackCompletenessStatus.Complete);
  });

  it('writes PARTIAL when pack completeness is incomplete', async () => {
    const category = categorySnapshotFor('snap-audit-bad', [assignedRow(0)]);
    const metrics = minimalComputedEuCore('other');
    const pack = assembleReportingPack({
      assembledAtIso: '2026-04-07T21:00:00.000Z',
      euCoreMetrics: metrics,
      categoryAssignment: category,
    });

    const writer = new InMemoryAuditWriter();
    await writeReportingPackAssemblyAudit(writer, {
      actor: { actorId: 'a2', actorType: ActorType.SYSTEM, displayName: 'Reporter' },
      pack,
    });

    const e = writer.snapshot()[0]!;
    expect(e.outcome).toBe(AuditOutcome.PARTIAL);
    expect(Number(e.metadata['exportBlockedCount'])).toBeGreaterThan(0);
  });
});

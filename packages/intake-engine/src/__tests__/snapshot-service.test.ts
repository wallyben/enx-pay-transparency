import { InMemoryAuditWriter, AuditAction, AuditOutcome } from '@enx/audit';
import { ActorType, type ActorIdentity } from '@enx/audit';
import { IntakeFileStatus, IntakeSnapshotBlockedReason } from '@enx/contracts';
import { registerIntakeFile } from '../intake-service';
import { InMemoryIntakeFileStore } from '../memory-store';
import { InMemorySealedIntakeSnapshotStore } from '../snapshot-store';
import { runStoredIntakeSnapshotCreation } from '../snapshot-service';

const actor: ActorIdentity = {
  actorId: 'test-actor',
  actorType: ActorType.USER,
  displayName: 'Test',
};

describe('runStoredIntakeSnapshotCreation', () => {
  it('creates a sealed snapshot and audits success', async () => {
    const auditWriter = new InMemoryAuditWriter();
    const intakeStore = new InMemoryIntakeFileStore();
    const sealedSnapshotStore = new InMemorySealedIntakeSnapshotStore();

    const record = await registerIntakeFile({
      bytes: Buffer.from('worker_id,base_pay,gender\nw1,50000,MALE\n', 'utf8'),
      originalFilename: 'ok.csv',
      contentType: 'text/csv',
      actor,
      auditWriter,
      store: intakeStore,
    });

    const result = await runStoredIntakeSnapshotCreation({
      intakeFileId: record.intakeFileId,
      store: intakeStore,
      sealedSnapshotStore,
      auditWriter,
      actor,
      methodologyVersion: 'meth-1',
      rulePackVersion: 'rules-1',
      sealedAt: '2026-04-07T12:00:00.000Z',
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.lineage.intakeFileId).toBe(record.intakeFileId);
    expect(result.value.lineage.methodologyVersion).toBe('meth-1');
    expect(result.value.snapshotId.startsWith('snp_')).toBe(true);

    const stored = await sealedSnapshotStore.get(result.value.snapshotId);
    expect(stored?.snapshotId).toBe(result.value.snapshotId);

    const events = auditWriter.snapshot();
    const sealOk = events.find(
      (e) => e.action === AuditAction.SEAL && e.outcome === AuditOutcome.SUCCESS,
    );
    expect(sealOk).toBeDefined();
    expect(sealOk?.targetEntityId).toBe(result.value.snapshotId);
    expect(sealOk?.metadata['manifestDigest']).toBe(result.value.manifestDigest);
  });

  it('returns structured failure and audits when mapping is gated', async () => {
    const auditWriter = new InMemoryAuditWriter();
    const intakeStore = new InMemoryIntakeFileStore();
    const sealedSnapshotStore = new InMemorySealedIntakeSnapshotStore();

    const record = await registerIntakeFile({
      bytes: Buffer.from('worker_id,base_pay,gender\nw1,oops,MALE\n', 'utf8'),
      originalFilename: 'bad.csv',
      contentType: 'text/csv',
      actor,
      auditWriter,
      store: intakeStore,
    });

    expect(record.status).toBe(IntakeFileStatus.QUARANTINED);

    const result = await runStoredIntakeSnapshotCreation({
      intakeFileId: record.intakeFileId,
      store: intakeStore,
      sealedSnapshotStore,
      auditWriter,
      actor,
      methodologyVersion: 'meth-1',
      rulePackVersion: 'rules-1',
    });

    expect(result.ok).toBe(false);
    if (result.ok !== false) return;
    expect(result.error.blockedReasons).toContain(IntakeSnapshotBlockedReason.MAPPING_GATED);

    const events = auditWriter.snapshot();
    const sealFail = events.filter(
      (e) => e.action === AuditAction.SEAL && e.outcome === AuditOutcome.FAILURE,
    );
    expect(sealFail.length).toBeGreaterThanOrEqual(1);
    expect(sealFail[sealFail.length - 1]?.targetEntityId).toBe(record.intakeFileId);
  });
});

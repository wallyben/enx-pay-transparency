import { InMemoryAuditWriter, ActorType, AuditAction, AuditOutcome } from '@enx/audit';
import { IntakeFileStatus } from '@enx/contracts';
import {
  InMemoryIntakeFileStore,
  IntakeFileNotFoundError,
  registerIntakeFile,
  runStoredIntakeMapping,
} from '../index';

const actor = {
  actorId: 'actor-map-1',
  actorType: ActorType.USER,
  displayName: 'Mapping Actor',
};

describe('runStoredIntakeMapping', () => {
  it('writes an audit event with mapping metadata', async () => {
    const audit = new InMemoryAuditWriter();
    const store = new InMemoryIntakeFileStore();
    const csv = Buffer.from('worker_id,base_pay,gender\nw1,50000,MALE\n', 'utf8');
    const record = await registerIntakeFile({
      bytes: csv,
      originalFilename: 'ok.csv',
      contentType: 'text/csv',
      actor,
      auditWriter: audit,
      store,
    });
    expect(record.status).toBe(IntakeFileStatus.STRUCTURALLY_VALID);

    const result = await runStoredIntakeMapping({
      intakeFileId: record.intakeFileId,
      store,
      auditWriter: audit,
      actor,
    });

    expect(result.ok).toBe(true);
    const events = audit.snapshot();
    const mappingEvent = events.find((e) => e.action === AuditAction.UPDATE);
    expect(mappingEvent).toBeDefined();
    expect(mappingEvent?.outcome).toBe(AuditOutcome.SUCCESS);
    expect(mappingEvent?.metadata['mappingProfileId']).toBe('default_csv_v1');
    expect(mappingEvent?.metadata['mappingOk']).toBe('true');
    expect(mappingEvent?.metadata['mappingGated']).toBe('false');
  });

  it('throws when the intake file is missing', async () => {
    const audit = new InMemoryAuditWriter();
    const store = new InMemoryIntakeFileStore();
    await expect(
      runStoredIntakeMapping({
        intakeFileId: '550e8400-e29b-41d4-a716-446655440099',
        store,
        auditWriter: audit,
        actor,
      }),
    ).rejects.toBeInstanceOf(IntakeFileNotFoundError);
  });
});

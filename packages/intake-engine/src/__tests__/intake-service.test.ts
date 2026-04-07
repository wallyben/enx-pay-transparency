import { InMemoryAuditWriter, ActorType, AuditAction, AuditOutcome } from '@enx/audit';
import { IntakeFileStatus, StructuralIssueCode, IntakeFileRecordSchema } from '@enx/contracts';
import {
  DEFAULT_INTAKE_LAYOUT,
  InMemoryIntakeFileStore,
  registerIntakeFile,
} from '../index';

const actor = {
  actorId: 'actor-test-1',
  actorType: ActorType.USER,
  displayName: 'Test Actor',
};

describe('registerIntakeFile', () => {
  it('accepts a structurally valid CSV and stores bytes', async () => {
    const audit = new InMemoryAuditWriter();
    const store = new InMemoryIntakeFileStore();
    const csv = Buffer.from('worker_id,base_pay,gender\nw1,50000,MALE\n', 'utf8');

    const record = await registerIntakeFile({
      bytes: csv,
      originalFilename: 'workers.csv',
      contentType: 'text/csv',
      actor,
      auditWriter: audit,
      store,
    });

    expect(record.status).toBe(IntakeFileStatus.STRUCTURALLY_VALID);
    expect(record.validation.ok).toBe(true);
    IntakeFileRecordSchema.parse(record);

    const stored = await store.get(record.intakeFileId);
    expect(stored?.bytes.equals(csv)).toBe(true);

    const events = audit.snapshot();
    expect(events).toHaveLength(2);
    const uploadEvent = events[0];
    const validationEvent = events[1];
    expect(uploadEvent).toBeDefined();
    expect(validationEvent).toBeDefined();
    expect(uploadEvent?.action).toBe(AuditAction.UPLOAD);
    expect(uploadEvent?.outcome).toBe(AuditOutcome.SUCCESS);
    expect(validationEvent?.action).toBe(AuditAction.SUBMIT);
    expect(validationEvent?.outcome).toBe(AuditOutcome.SUCCESS);
    expect(validationEvent?.metadata['intakeStatus']).toBe(IntakeFileStatus.STRUCTURALLY_VALID);
  });

  it('quarantines invalid structure and still persists the file', async () => {
    const audit = new InMemoryAuditWriter();
    const store = new InMemoryIntakeFileStore();
    const csv = Buffer.from('worker_id,base_pay,gender\nw1,not-a-number,MALE\n', 'utf8');

    const record = await registerIntakeFile({
      bytes: csv,
      originalFilename: 'bad.csv',
      contentType: 'text/csv',
      actor,
      auditWriter: audit,
      store,
    });

    expect(record.status).toBe(IntakeFileStatus.QUARANTINED);
    expect(record.validation.ok).toBe(false);
    expect(record.validation.issues.some((i) => i.code === StructuralIssueCode.TYPE_MISMATCH)).toBe(
      true,
    );

    const stored = await store.get(record.intakeFileId);
    expect(stored).toBeDefined();

    const events = audit.snapshot();
    const validationEvent = events[1];
    expect(validationEvent).toBeDefined();
    expect(validationEvent?.outcome).toBe(AuditOutcome.FAILURE);
    expect(validationEvent?.metadata['intakeStatus']).toBe(IntakeFileStatus.QUARANTINED);
  });

  it('quarantines when a required column is missing', async () => {
    const audit = new InMemoryAuditWriter();
    const store = new InMemoryIntakeFileStore();
    const csv = Buffer.from('worker_id,base_pay\nw1,100\n', 'utf8');

    const record = await registerIntakeFile({
      bytes: csv,
      originalFilename: 'missing-gender.csv',
      contentType: 'text/csv',
      actor,
      auditWriter: audit,
      store,
      layout: DEFAULT_INTAKE_LAYOUT,
    });

    expect(record.status).toBe(IntakeFileStatus.QUARANTINED);
    expect(
      record.validation.issues.some((i) => i.code === StructuralIssueCode.MISSING_REQUIRED_COLUMN),
    ).toBe(true);
  });
});

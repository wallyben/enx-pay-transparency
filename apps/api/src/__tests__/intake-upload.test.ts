import { InMemoryAuditWriter, AuditAction, AuditOutcome } from '@enx/audit';
import { IntakeFileStatus, StructuralIssueCode } from '@enx/contracts';
import { InMemoryIntakeFileStore } from '@enx/intake-engine';
import request from 'supertest';
import { createApiApp } from '../app';

describe('POST /v1/intake/files', () => {
  it('returns 201 and structurally valid status for a good CSV', async () => {
    const auditWriter = new InMemoryAuditWriter();
    const intakeStore = new InMemoryIntakeFileStore();
    const app = createApiApp({ auditWriter, intakeStore });

    const res = await request(app)
      .post('/v1/intake/files')
      .attach('file', Buffer.from('worker_id,base_pay,gender\nw1,50000,MALE\n', 'utf8'), 'ok.csv')
      .expect(201);

    expect(res.body.status).toBe(IntakeFileStatus.STRUCTURALLY_VALID);
    expect(res.body.validation.ok).toBe(true);
    expect(typeof res.body.intakeFileId).toBe('string');

    const stored = await intakeStore.get(res.body.intakeFileId);
    expect(stored).toBeDefined();

    const events = auditWriter.snapshot();
    expect(events.map((e) => e.action)).toEqual([AuditAction.UPLOAD, AuditAction.SUBMIT]);
    const uploadEvent = events[0];
    const validationEvent = events[1];
    expect(uploadEvent).toBeDefined();
    expect(validationEvent).toBeDefined();
    expect(uploadEvent?.outcome).toBe(AuditOutcome.SUCCESS);
    expect(validationEvent?.outcome).toBe(AuditOutcome.SUCCESS);
  });

  it('returns 201 with quarantined status when structure fails', async () => {
    const auditWriter = new InMemoryAuditWriter();
    const intakeStore = new InMemoryIntakeFileStore();
    const app = createApiApp({ auditWriter, intakeStore });

    const res = await request(app)
      .post('/v1/intake/files')
      .attach('file', Buffer.from('worker_id,base_pay,gender\nw1,oops,MALE\n', 'utf8'), 'bad.csv')
      .expect(201);

    expect(res.body.status).toBe(IntakeFileStatus.QUARANTINED);
    expect(res.body.validation.ok).toBe(false);
    expect(
      res.body.validation.issues.some((i: { code: string }) => i.code === StructuralIssueCode.TYPE_MISMATCH),
    ).toBe(true);

    const stored = await intakeStore.get(res.body.intakeFileId);
    expect(stored).toBeDefined();

    const events = auditWriter.snapshot();
    const validationEvent = events[1];
    expect(validationEvent).toBeDefined();
    expect(validationEvent?.outcome).toBe(AuditOutcome.FAILURE);
  });

  it('returns 400 when file is missing', async () => {
    const auditWriter = new InMemoryAuditWriter();
    const intakeStore = new InMemoryIntakeFileStore();
    const app = createApiApp({ auditWriter, intakeStore });

    await request(app).post('/v1/intake/files').expect(400);
  });
});

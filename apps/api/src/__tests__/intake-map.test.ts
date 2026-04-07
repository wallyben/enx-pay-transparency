import { InMemoryAuditWriter, AuditAction } from '@enx/audit';
import { IntakeFileStatus, MappingNormalizationIssueCode } from '@enx/contracts';
import { InMemoryIntakeFileStore } from '@enx/intake-engine';
import request from 'supertest';
import { createApiApp } from '../app';

describe('POST /v1/intake/files/:intakeFileId/map', () => {
  it('maps a structurally valid file and returns normalized rows', async () => {
    const auditWriter = new InMemoryAuditWriter();
    const intakeStore = new InMemoryIntakeFileStore();
    const app = createApiApp({ auditWriter, intakeStore });

    const upload = await request(app)
      .post('/v1/intake/files')
      .attach('file', Buffer.from('worker_id,base_pay,gender\nw1,50000,MALE\n', 'utf8'), 'ok.csv')
      .expect(201);

    const intakeFileId = upload.body.intakeFileId as string;

    const res = await request(app).post(`/v1/intake/files/${intakeFileId}/map`).expect(200);

    expect(res.body.gated).toBe(false);
    expect(res.body.ok).toBe(true);
    expect(res.body.rows).toHaveLength(1);

    const events = auditWriter.snapshot();
    expect(events.some((e) => e.action === AuditAction.UPDATE)).toBe(true);
  });

  it('returns gated mapping result for a quarantined file without throwing', async () => {
    const auditWriter = new InMemoryAuditWriter();
    const intakeStore = new InMemoryIntakeFileStore();
    const app = createApiApp({ auditWriter, intakeStore });

    const upload = await request(app)
      .post('/v1/intake/files')
      .attach('file', Buffer.from('worker_id,base_pay,gender\nw1,oops,MALE\n', 'utf8'), 'bad.csv')
      .expect(201);

    expect(upload.body.status).toBe(IntakeFileStatus.QUARANTINED);

    const intakeFileId = upload.body.intakeFileId as string;
    const res = await request(app).post(`/v1/intake/files/${intakeFileId}/map`).expect(200);

    expect(res.body.gated).toBe(true);
    expect(res.body.rows).toHaveLength(0);
    expect(res.body.fileIssues[0]?.code).toBe(
      MappingNormalizationIssueCode.GATING_FILE_NOT_STRUCTURALLY_VALID,
    );
  });

  it('returns 404 when the intake file does not exist', async () => {
    const auditWriter = new InMemoryAuditWriter();
    const intakeStore = new InMemoryIntakeFileStore();
    const app = createApiApp({ auditWriter, intakeStore });

    await request(app)
      .post('/v1/intake/files/550e8400-e29b-41d4-a716-446655440099/map')
      .expect(404);
  });
});

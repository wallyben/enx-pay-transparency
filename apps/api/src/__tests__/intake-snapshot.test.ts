import { InMemoryAuditWriter, AuditAction, AuditOutcome } from '@enx/audit';
import { IntakeSnapshotBlockedReason } from '@enx/contracts';
import { InMemoryIntakeFileStore, InMemorySealedIntakeSnapshotStore } from '@enx/intake-engine';
import request from 'supertest';
import { createApiApp } from '../app';

describe('POST /v1/intake/files/:intakeFileId/snapshots', () => {
  it('creates a sealed snapshot end-to-end from upload', async () => {
    const auditWriter = new InMemoryAuditWriter();
    const intakeStore = new InMemoryIntakeFileStore();
    const sealedSnapshotStore = new InMemorySealedIntakeSnapshotStore();
    const app = createApiApp({ auditWriter, intakeStore, sealedSnapshotStore });

    const upload = await request(app)
      .post('/v1/intake/files')
      .attach('file', Buffer.from('worker_id,base_pay,gender\nw1,50000,MALE\n', 'utf8'), 'ok.csv')
      .expect(201);

    const intakeFileId = upload.body.intakeFileId as string;

    const res = await request(app)
      .post(`/v1/intake/files/${intakeFileId}/snapshots`)
      .send({ methodologyVersion: 'meth-1', rulePackVersion: 'rules-1' })
      .expect(201);

    expect(res.body.snapshotId).toMatch(/^snp_[a-f0-9]{64}$/);
    expect(res.body.lineage.intakeFileId).toBe(intakeFileId);
    expect(res.body.lineage.methodologyVersion).toBe('meth-1');
    expect(res.body.normalizedRows).toHaveLength(1);

    const stored = await sealedSnapshotStore.get(res.body.snapshotId as string);
    expect(stored?.snapshotId).toBe(res.body.snapshotId);

    const events = auditWriter.snapshot();
    expect(
      events.some(
        (e) => e.action === AuditAction.SEAL && e.outcome === AuditOutcome.SUCCESS && e.snapshotId === res.body.snapshotId,
      ),
    ).toBe(true);
  });

  it('returns 422 when intake is not eligible for snapshot', async () => {
    const auditWriter = new InMemoryAuditWriter();
    const intakeStore = new InMemoryIntakeFileStore();
    const app = createApiApp({ auditWriter, intakeStore });

    const upload = await request(app)
      .post('/v1/intake/files')
      .attach('file', Buffer.from('worker_id,base_pay,gender\nw1,oops,MALE\n', 'utf8'), 'bad.csv')
      .expect(201);

    const intakeFileId = upload.body.intakeFileId as string;

    const res = await request(app)
      .post(`/v1/intake/files/${intakeFileId}/snapshots`)
      .send({ methodologyVersion: 'meth-1', rulePackVersion: 'rules-1' })
      .expect(422);

    expect(res.body.error).toBe('snapshot_blocked');
    expect(res.body.blockedReasons).toContain(IntakeSnapshotBlockedReason.MAPPING_GATED);

    const events = auditWriter.snapshot();
    expect(events.some((e) => e.action === AuditAction.SEAL && e.outcome === AuditOutcome.FAILURE)).toBe(
      true,
    );
  });

  it('returns 404 when intake file is unknown', async () => {
    const auditWriter = new InMemoryAuditWriter();
    const intakeStore = new InMemoryIntakeFileStore();
    const app = createApiApp({ auditWriter, intakeStore });

    await request(app)
      .post('/v1/intake/files/550e8400-e29b-41d4-a716-446655440099/snapshots')
      .send({ methodologyVersion: 'meth-1', rulePackVersion: 'rules-1' })
      .expect(404);
  });
});

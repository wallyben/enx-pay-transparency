import { Gender, LogicalIntakeField, SnapshotStatus } from '@enx/contracts';
import type { IntakeSealedSnapshot } from '@enx/canonical-model';
import { ActorType, InMemoryAuditWriter } from '@enx/audit';
import { runJobNormalizationWithAudit } from '../job-normalization-service';

describe('runJobNormalizationWithAudit', () => {
  it('writes an audit event with snapshot and issue metadata', async () => {
    const auditWriter = new InMemoryAuditWriter();
    const snap: IntakeSealedSnapshot = {
      snapshotId: 'snp_audit',
      status: SnapshotStatus.Sealed,
      sealedAt: '2026-04-07T00:00:00.000Z',
      sealedByActorId: 'actor',
      manifestDigest: 'x',
      manifestCanonicalJson: '{}',
      lineage: {
        intakeFileId: '11111111-1111-4111-8111-111111111111',
        intakeContentSha256: 'bb'.repeat(32),
        intakeOriginalFilename: 'f.csv',
        intakeFileCreatedAt: '2026-01-01T00:00:00.000Z',
        intakeFileStatusAtSeal: 'STRUCTURALLY_VALID',
        mappingProfileId: 'p',
        mappingProfileVersion: '1',
        methodologyVersion: 'm1',
        rulePackVersion: 'r1',
      },
      normalizedRows: [
        {
          rowIndex: 0,
          values: {
            [LogicalIntakeField.WORKER_EXTERNAL_ID]: { kind: 'STRING', value: 'w' },
            [LogicalIntakeField.BASE_PAY_AMOUNT]: { kind: 'DECIMAL', value: '1' },
            [LogicalIntakeField.GENDER]: { kind: 'GENDER', value: Gender.Male },
          },
          issues: [],
        },
      ],
    };

    await runJobNormalizationWithAudit({
      snapshot: snap,
      auditWriter,
      actor: {
        actorId: 'svc-1',
        actorType: ActorType.SERVICE,
        displayName: 'Job normalization',
      },
    });

    const events = auditWriter.snapshot();
    expect(events).toHaveLength(1);
    expect(events[0]?.targetEntityType).toBe('JOB_NORMALIZATION_RUN');
    expect(events[0]?.snapshotId).toBe('snp_audit');
    expect(events[0]?.metadata.rowIssueCount).toBeTruthy();
  });
});

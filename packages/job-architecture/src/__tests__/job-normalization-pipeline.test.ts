import { Gender, LogicalIntakeField, SnapshotStatus } from '@enx/contracts';
import type { IntakeSealedSnapshot } from '@enx/canonical-model';
import { runJobNormalizationOnSealedSnapshot } from '../job-normalization-pipeline';
import { DEFAULT_JOB_NORMALIZATION_RULES_VERSION } from '../job-normalization-rules-version';

describe('runJobNormalizationOnSealedSnapshot', () => {
  it('is deterministic for the same sealed snapshot rows', () => {
    const snap: IntakeSealedSnapshot = {
      snapshotId: 'snp_test',
      status: SnapshotStatus.Sealed,
      sealedAt: '2026-04-07T00:00:00.000Z',
      sealedByActorId: 'actor',
      manifestDigest: 'x',
      manifestCanonicalJson: '{}',
      lineage: {
        intakeFileId: '11111111-1111-4111-8111-111111111111',
        intakeContentSha256: 'aa'.repeat(32),
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
          rowIndex: 1,
          values: {
            [LogicalIntakeField.WORKER_EXTERNAL_ID]: { kind: 'STRING', value: 'a' },
            [LogicalIntakeField.BASE_PAY_AMOUNT]: { kind: 'DECIMAL', value: '1' },
            [LogicalIntakeField.GENDER]: { kind: 'GENDER', value: Gender.Male },
            [LogicalIntakeField.JOB_TITLE]: { kind: 'STRING', value: 'Role B' },
          },
          issues: [],
        },
        {
          rowIndex: 0,
          values: {
            [LogicalIntakeField.WORKER_EXTERNAL_ID]: { kind: 'STRING', value: 'b' },
            [LogicalIntakeField.BASE_PAY_AMOUNT]: { kind: 'DECIMAL', value: '2' },
            [LogicalIntakeField.GENDER]: { kind: 'GENDER', value: Gender.Female },
            [LogicalIntakeField.JOB_TITLE]: { kind: 'STRING', value: 'Role A' },
          },
          issues: [],
        },
      ],
    };

    const a = runJobNormalizationOnSealedSnapshot(snap, DEFAULT_JOB_NORMALIZATION_RULES_VERSION);
    const b = runJobNormalizationOnSealedSnapshot(snap, DEFAULT_JOB_NORMALIZATION_RULES_VERSION);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    expect(a.rows.map((r) => r.rowIndex)).toEqual([0, 1]);
    expect(a.ok).toBe(true);
    expect(a.rows[0]?.descriptor.normalized.titleNormalized).toBe('ROLE A');
  });
});

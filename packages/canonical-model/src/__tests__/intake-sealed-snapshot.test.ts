import { Gender, LogicalIntakeField, SnapshotStatus } from '@enx/contracts';
import {
  buildIntakeSealedSnapshotManifestPayload,
  digestIntakeSealedSnapshotManifest,
  sealIntakeSnapshot,
} from '../intake-sealed-snapshot';

describe('intake sealed snapshot', () => {
  const lineage = {
    intakeFileId: '11111111-1111-4111-8111-111111111111',
    intakeContentSha256: 'aa'.repeat(32),
    intakeOriginalFilename: 'data.csv',
    intakeFileCreatedAt: '2026-01-01T00:00:00.000Z',
    intakeFileStatusAtSeal: 'STRUCTURALLY_VALID',
    mappingProfileId: 'default',
    mappingProfileVersion: '1',
    methodologyVersion: 'meth-1',
    rulePackVersion: 'rules-1',
  };

  const normalizedRows = [
    {
      rowIndex: 0,
      values: {
        [LogicalIntakeField.WORKER_EXTERNAL_ID]: { kind: 'STRING' as const, value: 'w1' },
        [LogicalIntakeField.BASE_PAY_AMOUNT]: { kind: 'DECIMAL' as const, value: '50000' },
        [LogicalIntakeField.GENDER]: { kind: 'GENDER' as const, value: Gender.Male },
      },
      issues: [] as const,
    },
  ];

  it('produces the same snapshot id and digest for identical manifest inputs', () => {
    const payload = buildIntakeSealedSnapshotManifestPayload({
      schemaVersion: 'intake-sealed-snapshot.v1',
      intakeFileId: lineage.intakeFileId,
      intakeContentSha256: lineage.intakeContentSha256,
      mappingProfileId: lineage.mappingProfileId,
      mappingProfileVersion: lineage.mappingProfileVersion,
      methodologyVersion: lineage.methodologyVersion,
      rulePackVersion: lineage.rulePackVersion,
      rows: normalizedRows,
    });
    const a = digestIntakeSealedSnapshotManifest(payload);
    const b = digestIntakeSealedSnapshotManifest(
      buildIntakeSealedSnapshotManifestPayload({
        schemaVersion: 'intake-sealed-snapshot.v1',
        intakeFileId: lineage.intakeFileId,
        intakeContentSha256: lineage.intakeContentSha256,
        mappingProfileId: lineage.mappingProfileId,
        mappingProfileVersion: lineage.mappingProfileVersion,
        methodologyVersion: lineage.methodologyVersion,
        rulePackVersion: lineage.rulePackVersion,
        rows: normalizedRows,
      }),
    );
    expect(a.snapshotId).toBe(b.snapshotId);
    expect(a.manifestDigest).toBe(b.manifestDigest);
  });

  it('seals with frozen objects that reject mutation', () => {
    const snap = sealIntakeSnapshot({
      sealedAt: '2026-04-07T12:00:00.000Z',
      sealedByActorId: 'actor-1',
      lineage,
      normalizedRows,
    });

    expect(snap.status).toBe(SnapshotStatus.Sealed);
    expect(Object.isFrozen(snap)).toBe(true);
    expect(Object.isFrozen(snap.lineage)).toBe(true);
    expect(Object.isFrozen(snap.normalizedRows)).toBe(true);

    expect(() => {
      (snap as { snapshotId?: string }).snapshotId = 'x';
    }).toThrow();
  });

  it('records lineage fields on the sealed snapshot', () => {
    const snap = sealIntakeSnapshot({
      sealedAt: '2026-04-07T12:00:00.000Z',
      sealedByActorId: 'actor-1',
      lineage,
      normalizedRows,
    });

    expect(snap.lineage.intakeFileId).toBe(lineage.intakeFileId);
    expect(snap.lineage.mappingProfileId).toBe('default');
    expect(snap.lineage.methodologyVersion).toBe('meth-1');
    expect(snap.lineage.intakeContentSha256).toBe(lineage.intakeContentSha256);
  });
});

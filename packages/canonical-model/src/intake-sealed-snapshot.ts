import { createHash } from 'crypto';
import { SnapshotStatus } from '@enx/contracts';
import type { LogicalIntakeField, NormalizedIntakeRowResult, NormalizedScalar } from '@enx/contracts';

export interface IntakeSnapshotLineage {
  readonly intakeFileId: string;
  readonly intakeContentSha256: string;
  readonly intakeOriginalFilename: string;
  readonly intakeFileCreatedAt: string;
  readonly intakeFileStatusAtSeal: string;
  readonly mappingProfileId: string;
  readonly mappingProfileVersion: string;
  readonly methodologyVersion: string;
  readonly rulePackVersion: string;
}

export interface IntakeSealedSnapshot {
  readonly snapshotId: string;
  readonly status: SnapshotStatus.Sealed;
  readonly sealedAt: string;
  readonly sealedByActorId: string;
  readonly manifestDigest: string;
  readonly manifestCanonicalJson: string;
  readonly lineage: IntakeSnapshotLineage;
  readonly normalizedRows: readonly Readonly<NormalizedIntakeRowResult>[];
}

export function deepFreeze<T>(value: T): Readonly<T> {
  if (value === null || typeof value !== 'object') {
    return value as Readonly<T>;
  }
  Object.freeze(value);
  if (Array.isArray(value)) {
    for (const item of value) {
      deepFreeze(item);
    }
    return value as Readonly<T>;
  }
  for (const key of Object.keys(value as object)) {
    const child = (value as Record<string, unknown>)[key];
    if (child !== null && typeof child === 'object') {
      deepFreeze(child);
    }
  }
  return value as Readonly<T>;
}

function canonicalJsonStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return '[' + value.map((item) => canonicalJsonStringify(item)).join(',') + ']';
  }
  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).sort();
  return '{' + keys.map((k) => JSON.stringify(k) + ':' + canonicalJsonStringify(record[k])).join(',') + '}';
}

function scalarToJson(s: NormalizedScalar): { k: string; v: string } {
  switch (s.kind) {
    case 'STRING':
      return { k: 'STRING', v: s.value };
    case 'DECIMAL':
      return { k: 'DECIMAL', v: s.value };
    case 'GENDER':
      return { k: 'GENDER', v: s.value };
    default: {
      const _exhaustive: never = s;
      return _exhaustive;
    }
  }
}

export function buildIntakeSealedSnapshotManifestPayload(input: {
  readonly schemaVersion: 'intake-sealed-snapshot.v1';
  readonly intakeFileId: string;
  readonly intakeContentSha256: string;
  readonly mappingProfileId: string;
  readonly mappingProfileVersion: string;
  readonly methodologyVersion: string;
  readonly rulePackVersion: string;
  readonly rows: readonly NormalizedIntakeRowResult[];
}): Record<string, unknown> {
  const rowPayloads = [...input.rows]
    .sort((a, b) => a.rowIndex - b.rowIndex)
    .map((row) => {
      const keys = Object.keys(row.values).sort() as LogicalIntakeField[];
      const values: Record<string, unknown> = {};
      for (const k of keys) {
        const scalar = row.values[k];
        if (scalar !== undefined) {
          values[k] = scalarToJson(scalar);
        }
      }
      return { rowIndex: row.rowIndex, values };
    });

  return {
    schemaVersion: input.schemaVersion,
    intakeFileId: input.intakeFileId,
    intakeContentSha256: input.intakeContentSha256,
    mappingProfileId: input.mappingProfileId,
    mappingProfileVersion: input.mappingProfileVersion,
    methodologyVersion: input.methodologyVersion,
    rulePackVersion: input.rulePackVersion,
    rows: rowPayloads,
  };
}

export function digestIntakeSealedSnapshotManifest(manifestPayload: Record<string, unknown>): {
  readonly manifestCanonicalJson: string;
  readonly manifestDigest: string;
  readonly snapshotId: string;
} {
  const manifestCanonicalJson = canonicalJsonStringify(manifestPayload);
  const manifestDigest = createHash('sha256').update(manifestCanonicalJson, 'utf8').digest('hex');
  const snapshotId = `snp_${manifestDigest}`;
  return { manifestCanonicalJson, manifestDigest, snapshotId };
}

export function sealIntakeSnapshot(input: {
  readonly sealedAt: string;
  readonly sealedByActorId: string;
  readonly lineage: IntakeSnapshotLineage;
  readonly normalizedRows: readonly NormalizedIntakeRowResult[];
}): IntakeSealedSnapshot {
  const manifestPayload = buildIntakeSealedSnapshotManifestPayload({
    schemaVersion: 'intake-sealed-snapshot.v1',
    intakeFileId: input.lineage.intakeFileId,
    intakeContentSha256: input.lineage.intakeContentSha256,
    mappingProfileId: input.lineage.mappingProfileId,
    mappingProfileVersion: input.lineage.mappingProfileVersion,
    methodologyVersion: input.lineage.methodologyVersion,
    rulePackVersion: input.lineage.rulePackVersion,
    rows: input.normalizedRows,
  });
  const { manifestCanonicalJson, manifestDigest, snapshotId } =
    digestIntakeSealedSnapshotManifest(manifestPayload);

  const normalizedRows: NormalizedIntakeRowResult[] = input.normalizedRows.map((row) => ({
    rowIndex: row.rowIndex,
    values: { ...row.values },
    issues: [...row.issues],
  }));

  const snapshot: IntakeSealedSnapshot = {
    snapshotId,
    status: SnapshotStatus.Sealed,
    sealedAt: input.sealedAt,
    sealedByActorId: input.sealedByActorId,
    manifestDigest,
    manifestCanonicalJson,
    lineage: { ...input.lineage },
    normalizedRows,
  };

  return deepFreeze(snapshot);
}

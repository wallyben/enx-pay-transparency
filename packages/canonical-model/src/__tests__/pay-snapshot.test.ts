import { z } from 'zod';
import { PaySnapshotSchema, PaySnapshotBaseSchema, SnapshotManifestSchema } from '../pay-snapshot';
import { SnapshotStatus } from '@enx/contracts';

type SnapshotInput = z.input<typeof PaySnapshotSchema>;
type ManifestInput = z.input<typeof SnapshotManifestSchema>;

const BASE_SNAPSHOT: SnapshotInput = {
  id: '523e4567-e89b-12d3-a456-426614174004',
  legalEntityId: '123e4567-e89b-12d3-a456-426614174000',
  periodCode: '2024-ANNUAL',
  periodStart: new Date('2024-01-01'),
  periodEnd: new Date('2024-12-31'),
  methodologyVersion: 'v1.0.0',
  rulePackVersion: 'v1.0.0',
  status: SnapshotStatus.DRAFT,
  createdBy: 'system',
  sealedAt: null,
  createdAt: new Date('2025-01-10'),
  updatedAt: new Date('2025-01-10'),
};

function overrideSnapshot(fields: Partial<SnapshotInput>): SnapshotInput {
  return Object.assign({}, BASE_SNAPSHOT, fields);
}

describe('PaySnapshotSchema', () => {
  it('accepts a valid DRAFT snapshot', () => {
    expect(PaySnapshotSchema.safeParse(BASE_SNAPSHOT).success).toBe(true);
  });

  it('accepts a SEALED snapshot with sealedAt set', () => {
    expect(
      PaySnapshotSchema.safeParse(
        overrideSnapshot({ status: SnapshotStatus.SEALED, sealedAt: new Date('2025-01-15') }),
      ).success,
    ).toBe(true);
  });

  it('accepts an ARCHIVED snapshot with sealedAt retained', () => {
    expect(
      PaySnapshotSchema.safeParse(
        overrideSnapshot({ status: SnapshotStatus.ARCHIVED, sealedAt: new Date('2025-01-15') }),
      ).success,
    ).toBe(true);
  });

  it('rejects periodEnd before periodStart', () => {
    expect(
      PaySnapshotSchema.safeParse(
        overrideSnapshot({ periodStart: new Date('2024-12-31'), periodEnd: new Date('2024-01-01') }),
      ).success,
    ).toBe(false);
  });

  it('rejects an invalid status value', () => {
    expect(
      PaySnapshotSchema.safeParse(overrideSnapshot({ status: 'PUBLISHED' as SnapshotStatus })).success,
    ).toBe(false);
  });

  it('accepts all SnapshotStatus values with correct sealedAt', () => {
    const cases: Array<Partial<SnapshotInput>> = [
      { status: SnapshotStatus.DRAFT, sealedAt: null },
      { status: SnapshotStatus.SEALED, sealedAt: new Date('2025-01-15') },
      { status: SnapshotStatus.ARCHIVED, sealedAt: new Date('2025-01-15') },
    ];
    for (const c of cases) {
      expect(PaySnapshotSchema.safeParse(overrideSnapshot(c)).success).toBe(true);
    }
  });

  it('does not contain country-specific fields', () => {
    const keys = Object.keys(PaySnapshotBaseSchema.shape);
    const leaked = keys.filter((k) =>
      /countr|jurisdiction|locale/i.test(k),
    );
    expect(leaked).toHaveLength(0);
  });
});

describe('SnapshotManifestSchema', () => {
  const BASE_MANIFEST: ManifestInput = {
    id: '623e4567-e89b-12d3-a456-426614174005',
    snapshotId: '523e4567-e89b-12d3-a456-426614174004',
    workerCount: 120,
    payComponentCount: 360,
    checksumAlgorithm: 'SHA-256',
    checksum: 'abc123def456',
    generatedAt: new Date('2025-01-15'),
  };

  function overrideManifest(fields: Partial<ManifestInput>): ManifestInput {
    return Object.assign({}, BASE_MANIFEST, fields);
  }

  it('accepts a valid manifest', () => {
    expect(SnapshotManifestSchema.safeParse(BASE_MANIFEST).success).toBe(true);
  });

  it('rejects negative workerCount', () => {
    expect(SnapshotManifestSchema.safeParse(overrideManifest({ workerCount: -1 })).success).toBe(false);
  });

  it('does not carry a sourceRef field (source traceability is in source_lineage_refs)', () => {
    const keys = Object.keys(SnapshotManifestSchema.shape);
    expect(keys).not.toContain('sourceRef');
  });
});

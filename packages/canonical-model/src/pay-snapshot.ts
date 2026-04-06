import { z } from 'zod';
import { SnapshotStatus } from '@enx/contracts';

/**
 * PaySnapshot is the central immutable record of a reporting population
 * at a point in time. It ties together:
 * - a legal entity
 * - a reference reporting period
 * - the methodology and rule pack versions used
 * - provenance: who created it, when, and from what source
 *
 * Once a snapshot transitions to SEALED status, its pay component records
 * cannot be modified. This immutability is the foundation of audit reproducibility.
 *
 * Snapshot status transitions:
 *   DRAFT → SEALED (requires all workers mapped, no blocking data quality issues)
 *   SEALED → ARCHIVED (administrative; does not affect downstream outputs)
 *
 * The snapshot itself does not contain worker or pay data inline.
 * Worker and pay data reference the snapshot via snapshotId foreign keys.
 */
export interface PaySnapshot {
  /** UUID — primary key */
  id: string;
  /** FK to LegalEntity */
  legalEntityId: string;
  /**
   * Human-readable reference period code (e.g. "2024-ANNUAL", "2024-H1").
   * Used for display and grouping. Not parsed programmatically.
   */
  periodCode: string;
  periodStart: Date;
  periodEnd: Date;
  /**
   * Version identifier for the methodology document used to calculate metrics.
   * Recorded at snapshot creation time so outputs are reproducible.
   */
  methodologyVersion: string;
  /**
   * Version identifier for the rule pack (classification rules, thresholds)
   * active at snapshot creation time.
   */
  rulePackVersion: string;
  status: SnapshotStatus;
  /** Identity of the user or system process that created the snapshot */
  createdBy: string;
  /** Timestamp when the snapshot was transitioned to SEALED; null if still DRAFT */
  sealedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Base object schema — exposed so that tests and tools can inspect .shape
 * without unwrapping ZodEffects.
 */
export const PaySnapshotBaseSchema = z.object({
  id: z.string().uuid(),
  legalEntityId: z.string().uuid(),
  periodCode: z.string().min(1).max(32),
  periodStart: z.date(),
  periodEnd: z.date(),
  methodologyVersion: z.string().min(1).max(64),
  rulePackVersion: z.string().min(1).max(64),
  status: z.nativeEnum(SnapshotStatus),
  createdBy: z.string().min(1).max(256),
  sealedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const PaySnapshotSchema = PaySnapshotBaseSchema.refine(
  (val) => val.periodEnd > val.periodStart,
  {
    message: 'periodEnd must be after periodStart',
    path: ['periodEnd'],
  },
);

export type PaySnapshotInput = z.input<typeof PaySnapshotSchema>;
export type PaySnapshotOutput = z.output<typeof PaySnapshotSchema>;

/**
 * SnapshotManifest records aggregate counts and integrity metadata for a sealed snapshot.
 * It is generated at seal time and is immutable thereafter.
 * Stored separately from the snapshot header to keep the header lean.
 */
export interface SnapshotManifest {
  /** UUID — primary key */
  id: string;
  /** FK to PaySnapshot (1:1) */
  snapshotId: string;
  workerCount: number;
  payComponentCount: number;
  /** Hash algorithm used for the integrity checksum (e.g. "SHA-256") */
  checksumAlgorithm: string;
  /** Hex-encoded checksum of the canonical snapshot content at seal time */
  checksum: string;
  generatedAt: Date;
}

export const SnapshotManifestSchema = z.object({
  id: z.string().uuid(),
  snapshotId: z.string().uuid(),
  workerCount: z.number().int().nonnegative(),
  payComponentCount: z.number().int().nonnegative(),
  checksumAlgorithm: z.string().min(1).max(32),
  checksum: z.string().min(1).max(128),
  generatedAt: z.date(),
});

export type SnapshotManifestInput = z.input<typeof SnapshotManifestSchema>;
export type SnapshotManifestOutput = z.output<typeof SnapshotManifestSchema>;

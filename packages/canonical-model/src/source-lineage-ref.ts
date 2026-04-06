import { z } from 'zod';

/**
 * SourceLineageRef records the traceability link from a snapshot back to
 * the source data file and mapping version that produced it.
 *
 * A snapshot may be built from more than one source file
 * (e.g. payroll extract + HRIS export), so this is a 1:N relationship.
 *
 * This record supports audit queries of the form:
 *   "Which source file and which mapping version produced this snapshot?"
 *
 * The lineage ref is written during snapshot creation and is immutable.
 * No workflow logic belongs here — this is a structural traceability record only.
 */
export interface SourceLineageRef {
  /** UUID — primary key */
  id: string;
  /** FK to PaySnapshot */
  snapshotId: string;
  /**
   * Opaque reference to the source file or data batch.
   * Format is determined by the intake layer; canonical model treats it as a string.
   */
  sourceRef: string;
  /**
   * Version of the field mapping configuration used when normalising this source.
   * Corresponds to a version record in the policy registry (S18).
   */
  mappingVersion: string;
  /** Number of records ingested from this source into the snapshot */
  recordCount: number;
  createdAt: Date;
}

export const SourceLineageRefSchema = z.object({
  id: z.string().uuid(),
  snapshotId: z.string().uuid(),
  sourceRef: z.string().min(1).max(512),
  mappingVersion: z.string().min(1).max(64),
  recordCount: z.number().int().nonnegative(),
  createdAt: z.date(),
});

export type SourceLineageRefInput = z.input<typeof SourceLineageRefSchema>;
export type SourceLineageRefOutput = z.output<typeof SourceLineageRefSchema>;

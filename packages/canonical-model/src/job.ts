import { z } from 'zod';

/**
 * Job represents a normalised job definition within the internal job architecture.
 * Source job titles and codes are mapped to a Job record during the intake process.
 *
 * Jobs are versioned through effectiveFrom/effectiveTo. When a job's level or family
 * changes, a new record is created rather than mutating the existing one.
 * This ensures that historical snapshots remain traceable to the job definition
 * that was active at the time of snapshot creation.
 */
export interface Job {
  /** UUID — primary key */
  id: string;
  /** Stable normalised job code (e.g. "ENG-L3") — unique within a given effective period */
  code: string;
  /** Normalised job title */
  title: string;
  /** Job family code (e.g. "ENGINEERING", "FINANCE") — nullable if not yet classified */
  familyCode: string | null;
  /** Job function code within the family (e.g. "SOFTWARE", "DATA") */
  functionCode: string | null;
  /** Grade or level code within the hierarchy (e.g. "L1", "L2", "VP") */
  levelCode: string | null;
  isActive: boolean;
  effectiveFrom: Date;
  effectiveTo: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export const JobSchema = z.object({
  id: z.string().uuid(),
  code: z.string().min(1).max(64),
  title: z.string().min(1).max(256),
  familyCode: z.string().min(1).max(64).nullable(),
  functionCode: z.string().min(1).max(64).nullable(),
  levelCode: z.string().min(1).max(32).nullable(),
  isActive: z.boolean(),
  effectiveFrom: z.date(),
  effectiveTo: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type JobInput = z.input<typeof JobSchema>;
export type JobOutput = z.output<typeof JobSchema>;

import { z } from 'zod';
import {
  EmploymentType,
  ContractType,
  Gender,
  WorkerStatus,
} from '@enx/contracts';

/**
 * Worker represents a canonical, normalised person record.
 * Source system records from payroll, HRIS, or other upstream systems are mapped
 * to this structure during the intake normalisation phase.
 *
 * Workers are effective-dated: if a worker's employment type, FTE fraction,
 * or job assignment changes, a new effective period is created.
 *
 * PII fields (e.g. gender) are tagged at the security layer (S04) for masking
 * and access control. The canonical model defines structure; security overlays
 * define access rules.
 */
export interface Worker {
  /** UUID — primary key */
  id: string;
  /** Identifier from the source system (e.g. employee number, HR system ID) */
  externalId: string;
  /** FK to LegalEntity */
  legalEntityId: string;
  /** FK to Job (the normalised job for this worker in this effective period) */
  jobId: string;
  employmentType: EmploymentType;
  contractType: ContractType;
  /**
   * Gender — used only for statistical aggregation in pay gap calculations.
   * NOT_DISCLOSED is used when the worker has not provided a value or has opted out.
   */
  gender: Gender;
  /**
   * Full-time equivalent fraction. 1.0 = full time. 0.5 = half time.
   * Must be in the range (0, 1].
   */
  fteFraction: number;
  hireDate: Date;
  terminationDate: Date | null;
  /**
   * Normalised seniority level code from the internal job architecture.
   * Nullable until the worker's job has been fully normalised.
   */
  seniorityLevelCode: string | null;
  /** Cost centre code from the source system */
  costCenterCode: string | null;
  /** Work location code (office, remote, hybrid) — not a country identifier */
  workLocationCode: string | null;
  status: WorkerStatus;
  effectiveFrom: Date;
  effectiveTo: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export const WorkerSchema = z.object({
  id: z.string().uuid(),
  externalId: z.string().min(1).max(128),
  legalEntityId: z.string().uuid(),
  jobId: z.string().uuid(),
  employmentType: z.nativeEnum(EmploymentType),
  contractType: z.nativeEnum(ContractType),
  gender: z.nativeEnum(Gender),
  fteFraction: z.number().gt(0).lte(1),
  hireDate: z.date(),
  terminationDate: z.date().nullable(),
  seniorityLevelCode: z.string().min(1).max(32).nullable(),
  costCenterCode: z.string().min(1).max(64).nullable(),
  workLocationCode: z.string().min(1).max(64).nullable(),
  status: z.nativeEnum(WorkerStatus),
  effectiveFrom: z.date(),
  effectiveTo: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type WorkerInput = z.input<typeof WorkerSchema>;
export type WorkerOutput = z.output<typeof WorkerSchema>;

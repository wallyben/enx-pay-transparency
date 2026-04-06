import { z } from 'zod';
import { PayComponentType, PayPeriodCode } from '@enx/contracts';
import { CurrencyCodeSchema } from './currency-amount';

/**
 * PayComponent represents a single typed pay element for a worker
 * within a specific snapshot reporting period.
 *
 * Pay is decomposed into typed components rather than stored as a single total.
 * This supports the EU Pay Transparency Directive requirement to report on
 * base pay, variable pay, and supplementary components separately.
 *
 * Components are immutable once a snapshot is sealed. Any correction requires
 * a new snapshot with a corrected source.
 */
export interface PayComponent {
  /** UUID — primary key */
  id: string;
  /** FK to Worker */
  workerId: string;
  /** FK to PaySnapshot */
  snapshotId: string;
  componentType: PayComponentType;
  /**
   * Human-readable label from the source system (e.g. "Monthly Base Salary").
   * Used for traceability and audit display only.
   */
  sourceLabel: string;
  /** Raw amount as received from the source, before any normalisation */
  rawAmount: number;
  currencyCode: string;
  /**
   * The period basis of the raw amount (e.g. MONTHLY means the amount is per month).
   * The metrics engine uses this to annualise the value.
   */
  periodCode: PayPeriodCode;
  /**
   * Whether this component should be scaled by the worker's FTE fraction
   * when annualising. True for salary; false for one-off bonuses.
   */
  isFteProratable: boolean;
  effectiveFrom: Date;
  effectiveTo: Date | null;
  createdAt: Date;
}

export const PayComponentSchema = z.object({
  id: z.string().uuid(),
  workerId: z.string().uuid(),
  snapshotId: z.string().uuid(),
  componentType: z.nativeEnum(PayComponentType),
  sourceLabel: z.string().min(1).max(256),
  rawAmount: z.number().finite(),
  currencyCode: CurrencyCodeSchema,
  periodCode: z.nativeEnum(PayPeriodCode),
  isFteProratable: z.boolean(),
  effectiveFrom: z.date(),
  effectiveTo: z.date().nullable(),
  createdAt: z.date(),
});

export type PayComponentInput = z.input<typeof PayComponentSchema>;
export type PayComponentOutput = z.output<typeof PayComponentSchema>;

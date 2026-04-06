import { z } from 'zod';
import { CurrencyCodeSchema } from './currency-amount';

/**
 * LegalEntity represents an organisational unit (company, subsidiary, branch)
 * that employs workers and is subject to pay transparency reporting obligations.
 *
 * Fields are structural only. Country-specific reporting thresholds and rules
 * belong in country overlay packs, not here.
 */
export interface LegalEntity {
  /** UUID — primary key */
  id: string;
  /** Short stable code used in references (e.g. "ENX-IE-001") */
  code: string;
  /** Full legal name */
  name: string;
  /** ISO 3166-1 alpha-2 country code — structural field, not country logic */
  registeredCountryCode: string;
  /** Primary reporting currency for this entity */
  reportingCurrencyCode: string;
  effectiveFrom: Date;
  effectiveTo: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export const LegalEntitySchema = z
  .object({
    id: z.string().uuid(),
    code: z.string().min(1).max(64),
    name: z.string().min(1).max(256),
    registeredCountryCode: z
      .string()
      .length(2)
      .regex(/^[A-Z]{2}$/, 'Must be ISO 3166-1 alpha-2 (two uppercase letters)'),
    reportingCurrencyCode: CurrencyCodeSchema,
    effectiveFrom: z.date(),
    effectiveTo: z.date().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .refine(
    (val) => val.effectiveTo === null || val.effectiveTo > val.effectiveFrom,
    {
      message: 'effectiveTo must be strictly after effectiveFrom',
      path: ['effectiveTo'],
    },
  );

export type LegalEntityInput = z.input<typeof LegalEntitySchema>;
export type LegalEntityOutput = z.output<typeof LegalEntitySchema>;

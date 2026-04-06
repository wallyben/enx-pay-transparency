import { z } from 'zod';

/**
 * ISO 4217 currency codes supported by the platform.
 * This is a value-level list; country packs may not extend it without a schema change.
 */
export const SUPPORTED_CURRENCY_CODES = [
  'EUR', 'GBP', 'DKK', 'NOK', 'SEK', 'CHF', 'PLN', 'HUF', 'CZK', 'USD',
] as const;

export type CurrencyCode = (typeof SUPPORTED_CURRENCY_CODES)[number];

export const CurrencyCodeSchema = z.enum(SUPPORTED_CURRENCY_CODES);

/**
 * CurrencyAmount is a value object — it has no identity of its own.
 * It is embedded within pay component records rather than stored as a separate entity.
 */
export interface CurrencyAmount {
  amount: number;
  currencyCode: CurrencyCode;
}

export const CurrencyAmountSchema = z.object({
  amount: z.number().finite(),
  currencyCode: CurrencyCodeSchema,
});

import { z } from 'zod';

/**
 * EffectiveDateRange represents a period during which a record is considered active.
 * effectiveTo = null means the record has no end date (currently active).
 *
 * Rules:
 * - effectiveFrom is always required
 * - effectiveTo must be strictly after effectiveFrom when present
 * - Overlapping ranges for the same entity key are a data integrity violation (enforced at DB level)
 */
export interface EffectiveDateRange {
  effectiveFrom: Date;
  effectiveTo: Date | null;
}

export const EffectiveDateRangeSchema = z
  .object({
    effectiveFrom: z.date(),
    effectiveTo: z.date().nullable(),
  })
  .refine(
    (val) =>
      val.effectiveTo === null || val.effectiveTo > val.effectiveFrom,
    {
      message: 'effectiveTo must be strictly after effectiveFrom',
      path: ['effectiveTo'],
    },
  );

/**
 * Returns true if the record is active on the given reference date.
 */
export function isActiveOn(range: EffectiveDateRange, referenceDate: Date): boolean {
  if (referenceDate < range.effectiveFrom) return false;
  if (range.effectiveTo !== null && referenceDate >= range.effectiveTo) return false;
  return true;
}

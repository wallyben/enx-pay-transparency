/**
 * country-leakage.test.ts
 *
 * Verifies that no country-specific logic, names, or thresholds are embedded
 * in the canonical model schemas. This is a structural compliance test.
 *
 * Rule: Core packages must not reference country names in field names,
 * enum values, or validation logic (per CLAUDE.md §10 and §3.4).
 *
 * Country names may appear in: test fixture labels, documentation, ADR context.
 * They must NOT appear in: schema shapes, enum keys/values, validator logic.
 */
import { z } from 'zod';
import {
  LegalEntitySchema,
  JobSchema,
  WorkerSchema,
  PayComponentSchema,
  PaySnapshotBaseSchema,
  SnapshotManifestSchema,
  SourceLineageRefSchema,
} from '../index';

const COUNTRY_NAMES = [
  'ireland', 'uk', 'unitedkingdom', 'france', 'germany', 'belgium',
  'netherlands', 'norway', 'sweden', 'denmark', 'portugal', 'spain', 'italy',
];

type AnyZodObject = z.ZodObject<z.ZodRawShape>;

function getShape(schema: AnyZodObject): string[] {
  return Object.keys(schema.shape).map((k) => k.toLowerCase());
}

function containsCountryName(keys: string[]): string[] {
  return keys.filter((k) => COUNTRY_NAMES.some((c) => k.includes(c)));
}

describe('Country leakage — canonical model schemas', () => {
  const schemas: Array<{ name: string; schema: AnyZodObject }> = [
    { name: 'LegalEntitySchema', schema: LegalEntitySchema._def.schema },
    { name: 'WorkerSchema', schema: WorkerSchema },
    { name: 'JobSchema', schema: JobSchema },
    { name: 'PayComponentSchema', schema: PayComponentSchema },
    { name: 'PaySnapshotBaseSchema', schema: PaySnapshotBaseSchema },
    { name: 'SnapshotManifestSchema', schema: SnapshotManifestSchema },
    { name: 'SourceLineageRefSchema', schema: SourceLineageRefSchema },
  ];

  for (const { name, schema } of schemas) {
    it(`${name} has no country-specific field names`, () => {
      const keys = getShape(schema);
      const leaked = containsCountryName(keys);
      expect(leaked).toHaveLength(0);
    });
  }
});

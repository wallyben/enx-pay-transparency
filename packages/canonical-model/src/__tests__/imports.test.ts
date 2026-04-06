/**
 * imports.test.ts
 *
 * Verifies that the canonical-model package index exports all expected symbols
 * and that the package can be cleanly imported.
 */
import * as canonicalModel from '../index';

describe('canonical-model package exports', () => {
  const EXPECTED_EXPORTS = [
    // Value objects
    'CurrencyCodeSchema',
    'SUPPORTED_CURRENCY_CODES',
    'EffectiveDateRangeSchema',
    'isActiveOn',
    // Schemas
    'LegalEntitySchema',
    'JobSchema',
    'WorkerSchema',
    'PayComponentSchema',
    'PaySnapshotBaseSchema',
    'PaySnapshotSchema',
    'SnapshotManifestSchema',
    'SourceLineageRefSchema',
  ];

  for (const name of EXPECTED_EXPORTS) {
    it(`exports ${name}`, () => {
      expect(canonicalModel).toHaveProperty(name);
    });
  }

  it('does not export undefined values for any named export', () => {
    for (const [key, value] of Object.entries(canonicalModel)) {
      expect(value).not.toBeUndefined();
      expect(key).toBeTruthy();
    }
  });
});

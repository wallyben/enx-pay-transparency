import { z } from 'zod';
import { LegalEntitySchema } from '../legal-entity';

type Input = z.input<typeof LegalEntitySchema>;

const BASE: Input = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  code: 'ENX-XX-001',
  name: 'Euronext Test Limited',
  registeredCountryCode: 'NL',
  reportingCurrencyCode: 'EUR',
  effectiveFrom: new Date('2020-01-01'),
  effectiveTo: null,
  createdAt: new Date('2020-01-01'),
  updatedAt: new Date('2020-01-01'),
};

function override(fields: Partial<Input>): Input {
  return Object.assign({}, BASE, fields);
}

describe('LegalEntitySchema', () => {
  it('accepts a valid legal entity', () => {
    expect(LegalEntitySchema.safeParse(BASE).success).toBe(true);
  });

  it('rejects a non-UUID id', () => {
    expect(LegalEntitySchema.safeParse(override({ id: 'not-a-uuid' })).success).toBe(false);
  });

  it('rejects a country code that is not two uppercase letters', () => {
    expect(LegalEntitySchema.safeParse(override({ registeredCountryCode: 'nl' })).success).toBe(false);
    expect(LegalEntitySchema.safeParse(override({ registeredCountryCode: 'NLD' })).success).toBe(false);
  });

  it('rejects an unsupported currency code', () => {
    expect(LegalEntitySchema.safeParse(override({ reportingCurrencyCode: 'XYZ' as 'EUR' })).success).toBe(false);
  });

  it('rejects effectiveTo before effectiveFrom', () => {
    expect(
      LegalEntitySchema.safeParse(
        override({ effectiveFrom: new Date('2024-01-01'), effectiveTo: new Date('2023-01-01') }),
      ).success,
    ).toBe(false);
  });

  it('accepts effectiveTo null (open-ended)', () => {
    expect(LegalEntitySchema.safeParse(override({ effectiveTo: null })).success).toBe(true);
  });

  it('accepts a valid effectiveTo after effectiveFrom', () => {
    expect(
      LegalEntitySchema.safeParse(
        override({ effectiveTo: new Date('2030-01-01') }),
      ).success,
    ).toBe(true);
  });

  it('does not contain country-specific field names', () => {
    const keys = Object.keys(LegalEntitySchema._def.schema.shape);
    const leaked = keys.filter((k) =>
      /ireland|france|germany|belgium|netherlands|norway|sweden|denmark|portugal|spain|italy/i.test(k),
    );
    expect(leaked).toHaveLength(0);
  });
});

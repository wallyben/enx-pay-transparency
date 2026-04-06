import { z } from 'zod';
import { PayComponentSchema } from '../pay-component';
import { PayComponentType, PayPeriodCode } from '@enx/contracts';

type Input = z.input<typeof PayComponentSchema>;

const BASE: Input = {
  id: '423e4567-e89b-12d3-a456-426614174003',
  workerId: '323e4567-e89b-12d3-a456-426614174002',
  snapshotId: '523e4567-e89b-12d3-a456-426614174004',
  componentType: PayComponentType.BASE_SALARY,
  sourceLabel: 'Monthly Base Salary',
  rawAmount: 6000,
  currencyCode: 'EUR',
  periodCode: PayPeriodCode.MONTHLY,
  isFteProratable: true,
  createdAt: new Date('2024-01-15'),
};

function override(fields: Partial<Input>): Input {
  return Object.assign({}, BASE, fields);
}

describe('PayComponentSchema', () => {
  it('accepts a valid pay component', () => {
    expect(PayComponentSchema.safeParse(BASE).success).toBe(true);
  });

  it('accepts all PayComponentType values', () => {
    for (const t of Object.values(PayComponentType)) {
      expect(PayComponentSchema.safeParse(override({ componentType: t })).success).toBe(true);
    }
  });

  it('accepts all PayPeriodCode values', () => {
    for (const p of Object.values(PayPeriodCode)) {
      expect(PayComponentSchema.safeParse(override({ periodCode: p })).success).toBe(true);
    }
  });

  it('rejects an unsupported currency code', () => {
    expect(PayComponentSchema.safeParse(override({ currencyCode: 'ZZZ' as 'EUR' })).success).toBe(false);
  });

  it('rejects a non-finite rawAmount', () => {
    expect(PayComponentSchema.safeParse(override({ rawAmount: Infinity })).success).toBe(false);
  });

  it('accepts negative rawAmount (e.g. clawback)', () => {
    expect(PayComponentSchema.safeParse(override({ rawAmount: -500 })).success).toBe(true);
  });

  it('accepts isFteProratable = false for one-off bonus', () => {
    expect(
      PayComponentSchema.safeParse(
        override({
          componentType: PayComponentType.BONUS,
          periodCode: PayPeriodCode.ONE_OFF,
          isFteProratable: false,
        }),
      ).success,
    ).toBe(true);
  });

  it('does not carry sub-period effective dating fields', () => {
    const keys = Object.keys(PayComponentSchema.shape);
    expect(keys).not.toContain('effectiveFrom');
    expect(keys).not.toContain('effectiveTo');
  });
});

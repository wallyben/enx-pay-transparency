import { z } from 'zod';
import { WorkerSchema } from '../worker';
import { EmploymentType, ContractType, Gender, WorkerStatus } from '@enx/contracts';

type Input = z.input<typeof WorkerSchema>;

const BASE: Input = {
  id: '323e4567-e89b-12d3-a456-426614174002',
  externalId: 'EMP-00123',
  legalEntityId: '123e4567-e89b-12d3-a456-426614174000',
  jobId: '223e4567-e89b-12d3-a456-426614174001',
  employmentType: EmploymentType.FULL_TIME,
  contractType: ContractType.PERMANENT,
  gender: Gender.NOT_DISCLOSED,
  fteFraction: 1.0,
  hireDate: new Date('2019-03-01'),
  terminationDate: null,
  costCenterCode: 'CC-TECH-01',
  workLocationCode: 'HYBRID',
  status: WorkerStatus.ACTIVE,
  effectiveFrom: new Date('2019-03-01'),
  effectiveTo: null,
  createdAt: new Date('2019-03-01'),
  updatedAt: new Date('2019-03-01'),
};

function override(fields: Partial<Input>): Input {
  return Object.assign({}, BASE, fields);
}

describe('WorkerSchema', () => {
  it('accepts a valid worker', () => {
    expect(WorkerSchema.safeParse(BASE).success).toBe(true);
  });

  it('rejects fteFraction of 0', () => {
    expect(WorkerSchema.safeParse(override({ fteFraction: 0 })).success).toBe(false);
  });

  it('rejects fteFraction greater than 1', () => {
    expect(WorkerSchema.safeParse(override({ fteFraction: 1.5 })).success).toBe(false);
  });

  it('accepts fteFraction of exactly 1', () => {
    expect(WorkerSchema.safeParse(override({ fteFraction: 1 })).success).toBe(true);
  });

  it('accepts fteFraction of 0.5', () => {
    expect(WorkerSchema.safeParse(override({ fteFraction: 0.5 })).success).toBe(true);
  });

  it('rejects an invalid employmentType value', () => {
    expect(
      WorkerSchema.safeParse(override({ employmentType: 'FREELANCE' as EmploymentType })).success,
    ).toBe(false);
  });

  it('rejects an invalid gender value', () => {
    expect(
      WorkerSchema.safeParse(override({ gender: 'UNKNOWN' as Gender })).success,
    ).toBe(false);
  });

  it('accepts all valid Gender enum values', () => {
    for (const g of Object.values(Gender)) {
      expect(WorkerSchema.safeParse(override({ gender: g })).success).toBe(true);
    }
  });

  it('accepts nullable optional fields', () => {
    expect(
      WorkerSchema.safeParse(
        override({
          terminationDate: null,
          costCenterCode: null,
          workLocationCode: null,
        }),
      ).success,
    ).toBe(true);
  });

  it('does not carry a seniorityLevelCode field (level is on Job via jobId)', () => {
    const keys = Object.keys(WorkerSchema.shape);
    expect(keys).not.toContain('seniorityLevelCode');
  });

  it('does not contain country-specific fields', () => {
    const keys = Object.keys(WorkerSchema.shape);
    const leaked = keys.filter((k) =>
      /countr|jurisdiction|locale|nationality/i.test(k),
    );
    expect(leaked).toHaveLength(0);
  });
});

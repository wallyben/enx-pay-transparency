import { z } from 'zod';
import { JobSchema } from '../job';

type Input = z.input<typeof JobSchema>;

const BASE: Input = {
  id: '223e4567-e89b-12d3-a456-426614174001',
  code: 'ENG-L3',
  title: 'Senior Software Engineer',
  familyCode: 'ENGINEERING',
  functionCode: 'SOFTWARE',
  levelCode: 'L3',
  isActive: true,
  effectiveFrom: new Date('2022-01-01'),
  effectiveTo: null,
  createdAt: new Date('2022-01-01'),
  updatedAt: new Date('2022-01-01'),
};

function override(fields: Partial<Input>): Input {
  return Object.assign({}, BASE, fields);
}

describe('JobSchema', () => {
  it('accepts a valid job', () => {
    expect(JobSchema.safeParse(BASE).success).toBe(true);
  });

  it('accepts nullable familyCode, functionCode, levelCode', () => {
    expect(
      JobSchema.safeParse(
        override({ familyCode: null, functionCode: null, levelCode: null }),
      ).success,
    ).toBe(true);
  });

  it('rejects an empty title', () => {
    expect(JobSchema.safeParse(override({ title: '' })).success).toBe(false);
  });

  it('rejects an empty code', () => {
    expect(JobSchema.safeParse(override({ code: '' })).success).toBe(false);
  });

  it('does not contain any country-specific fields', () => {
    const keys = Object.keys(JobSchema.shape);
    const leaked = keys.filter((k) =>
      /countr|jurisdiction|locale|region/i.test(k),
    );
    expect(leaked).toHaveLength(0);
  });
});

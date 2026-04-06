import { CreateIntakeSnapshotRequestSchema } from '../schemas';

describe('intake snapshot schemas', () => {
  it('accepts a valid create snapshot request', () => {
    const parsed = CreateIntakeSnapshotRequestSchema.parse({
      methodologyVersion: 'meth-1',
      rulePackVersion: 'rules-1',
    });
    expect(parsed.methodologyVersion).toBe('meth-1');
  });

  it('rejects empty methodology version', () => {
    const result = CreateIntakeSnapshotRequestSchema.safeParse({
      methodologyVersion: '',
      rulePackVersion: 'rules-1',
    });
    expect(result.success).toBe(false);
  });
});

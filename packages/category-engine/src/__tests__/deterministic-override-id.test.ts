import { deterministicCategoryOverrideId } from '../deterministic-override-id';

describe('deterministicCategoryOverrideId', () => {
  it('is stable for the same inputs', () => {
    const input = {
      snapshotId: 's1',
      rowIndex: 3,
      proposedCategoryId: 'cat_x',
      proposedAtIso: '2026-04-07T12:00:00.000Z',
    };
    expect(deterministicCategoryOverrideId(input)).toBe(deterministicCategoryOverrideId(input));
  });

  it('changes when proposed category changes', () => {
    const a = deterministicCategoryOverrideId({
      snapshotId: 's1',
      rowIndex: 0,
      proposedCategoryId: 'cat_a',
      proposedAtIso: '2026-04-07T12:00:00.000Z',
    });
    const b = deterministicCategoryOverrideId({
      snapshotId: 's1',
      rowIndex: 0,
      proposedCategoryId: 'cat_b',
      proposedAtIso: '2026-04-07T12:00:00.000Z',
    });
    expect(a).not.toBe(b);
    expect(a.startsWith('ovr_')).toBe(true);
  });
});

import {
  AccessReason,
  ALL_ACCESS_REASONS,
  buildAccessReasonRecord,
  isValidAccessReason,
  isValidAccessReasonRecord,
} from '../access-reason';
import type { AccessReasonInput } from '../access-reason';

function makeInput(overrides: Partial<AccessReasonInput> = {}): AccessReasonInput {
  return {
    actorId: 'user-001',
    targetEntityType: 'Worker',
    targetEntityId: 'worker-001',
    reason: AccessReason.COMPLIANCE_REVIEW,
    justification: 'Annual pay gap review',
    ...overrides,
  };
}

describe('AccessReason enum', () => {
  it('exports required access reasons', () => {
    const reasons = Object.values(AccessReason);
    expect(reasons).toContain('COMPLIANCE_REVIEW');
    expect(reasons).toContain('REGULATORY_REQUEST');
    expect(reasons).toContain('AUDIT');
    expect(reasons).toContain('CASEWORK_HANDLING');
    expect(reasons).toContain('ADMINISTRATION');
  });

  it('contains no country-specific reason names', () => {
    const allNames = Object.values(AccessReason).join(' ').toLowerCase();
    const countryNames = [
      'ireland', 'uk', 'france', 'germany', 'belgium',
      'netherlands', 'norway', 'sweden', 'denmark', 'portugal', 'spain', 'italy',
    ];
    for (const country of countryNames) {
      expect(allNames).not.toContain(country);
    }
  });

  it('ALL_ACCESS_REASONS contains every AccessReason value', () => {
    for (const r of Object.values(AccessReason)) {
      expect(ALL_ACCESS_REASONS).toContain(r);
    }
  });
});

describe('isValidAccessReason', () => {
  it('accepts all known reasons', () => {
    for (const r of Object.values(AccessReason)) {
      expect(isValidAccessReason(r)).toBe(true);
    }
  });

  it('rejects unknown string', () => {
    expect(isValidAccessReason('UNKNOWN')).toBe(false);
  });

  it('rejects null', () => {
    expect(isValidAccessReason(null)).toBe(false);
  });
});

describe('buildAccessReasonRecord', () => {
  it('assigns a unique reasonId and recordedAt', () => {
    const r1 = buildAccessReasonRecord(makeInput());
    const r2 = buildAccessReasonRecord(makeInput());
    expect(r1.reasonId).not.toBe(r2.reasonId);
    expect(r1.recordedAt).toBeTruthy();
  });

  it('preserves input fields', () => {
    const record = buildAccessReasonRecord(
      makeInput({ reason: AccessReason.AUDIT, justification: 'Regulatory inspection' }),
    );
    expect(record.reason).toBe(AccessReason.AUDIT);
    expect(record.justification).toBe('Regulatory inspection');
    expect(record.actorId).toBe('user-001');
  });
});

describe('isValidAccessReasonRecord', () => {
  it('accepts a fully built record', () => {
    const record = buildAccessReasonRecord(makeInput());
    expect(isValidAccessReasonRecord(record)).toBe(true);
  });

  it('rejects null', () => {
    expect(isValidAccessReasonRecord(null)).toBe(false);
  });

  it('rejects a record missing justification', () => {
    const record = buildAccessReasonRecord(makeInput());
    const rest = { ...record, justification: '' };
    expect(isValidAccessReasonRecord(rest)).toBe(false);
  });

  it('rejects a record with an invalid reason', () => {
    const record = buildAccessReasonRecord(makeInput());
    expect(isValidAccessReasonRecord({ ...record, reason: 'UNKNOWN' })).toBe(false);
  });
});

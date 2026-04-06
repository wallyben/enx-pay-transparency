import * as SecurityPackage from '../index';

describe('security package exports', () => {
  it('exports Role enum', () => {
    expect(SecurityPackage.Role).toBeDefined();
    expect(SecurityPackage.Role.COMPLIANCE_OFFICER).toBe('COMPLIANCE_OFFICER');
  });

  it('exports ALL_ROLES array', () => {
    expect(Array.isArray(SecurityPackage.ALL_ROLES)).toBe(true);
    expect(SecurityPackage.ALL_ROLES.length).toBeGreaterThan(0);
  });

  it('exports AccessReason enum', () => {
    expect(SecurityPackage.AccessReason).toBeDefined();
    expect(SecurityPackage.AccessReason.AUDIT).toBe('AUDIT');
  });

  it('exports ALL_ACCESS_REASONS array', () => {
    expect(Array.isArray(SecurityPackage.ALL_ACCESS_REASONS)).toBe(true);
  });

  it('exports buildAccessReasonRecord function', () => {
    expect(typeof SecurityPackage.buildAccessReasonRecord).toBe('function');
  });

  it('exports PII tagging utilities', () => {
    expect(typeof SecurityPackage.tagAsPii).toBe('function');
    expect(typeof SecurityPackage.tagAsSensitive).toBe('function');
    expect(typeof SecurityPackage.tagAsPiiAndSensitive).toBe('function');
    expect(typeof SecurityPackage.isPiiField).toBe('function');
    expect(typeof SecurityPackage.maskPiiField).toBe('function');
    expect(typeof SecurityPackage.maskPiiString).toBe('function');
    expect(typeof SecurityPackage.maskAllPiiFields).toBe('function');
    expect(typeof SecurityPackage.extractPiiFieldKeys).toBe('function');
  });

  it('exports EncryptionAlgorithm enum', () => {
    expect(SecurityPackage.EncryptionAlgorithm).toBeDefined();
    expect(SecurityPackage.EncryptionAlgorithm.STUB).toBe('STUB');
  });

  it('exports encrypt and decrypt functions', () => {
    expect(typeof SecurityPackage.encrypt).toBe('function');
    expect(typeof SecurityPackage.decrypt).toBe('function');
    expect(typeof SecurityPackage.encryptRoundTrip).toBe('function');
  });

  it('exports validation helpers', () => {
    expect(typeof SecurityPackage.isValidRole).toBe('function');
    expect(typeof SecurityPackage.isValidRoleAssignment).toBe('function');
    expect(typeof SecurityPackage.isValidAccessReason).toBe('function');
    expect(typeof SecurityPackage.isValidAccessReasonRecord).toBe('function');
  });
});

import {
  Role,
  ALL_ROLES,
  isValidRole,
  isValidRoleAssignment,
} from '../roles';
import type { RoleAssignment } from '../roles';

function makeAssignment(overrides: Partial<RoleAssignment> = {}): RoleAssignment {
  return {
    assignmentId: 'assign-001',
    actorId: 'user-001',
    role: Role.COMPLIANCE_OFFICER,
    assignedAt: '2026-04-06T00:00:00.000Z',
    assignedBy: 'admin-001',
    ...overrides,
  };
}

describe('Role enum', () => {
  it('exports the required baseline roles', () => {
    const roles = Object.values(Role);
    expect(roles).toContain('PLATFORM_ADMIN');
    expect(roles).toContain('COMPLIANCE_OFFICER');
    expect(roles).toContain('DATA_STEWARD');
    expect(roles).toContain('ANALYST');
    expect(roles).toContain('AUDITOR');
    expect(roles).toContain('CASEWORK_HANDLER');
    expect(roles).toContain('READ_ONLY');
  });

  it('contains no country-specific role names', () => {
    const allRoleNames = Object.values(Role).join(' ').toLowerCase();
    const countryNames = [
      'ireland', 'uk', 'france', 'germany', 'belgium',
      'netherlands', 'norway', 'sweden', 'denmark', 'portugal', 'spain', 'italy',
    ];
    for (const country of countryNames) {
      expect(allRoleNames).not.toContain(country);
    }
  });

  it('ALL_ROLES contains every Role value', () => {
    for (const role of Object.values(Role)) {
      expect(ALL_ROLES).toContain(role);
    }
  });
});

describe('isValidRole', () => {
  it('accepts a known role string', () => {
    expect(isValidRole(Role.AUDITOR)).toBe(true);
  });

  it('accepts all Role enum values', () => {
    for (const role of Object.values(Role)) {
      expect(isValidRole(role)).toBe(true);
    }
  });

  it('rejects an unknown string', () => {
    expect(isValidRole('SUPERUSER')).toBe(false);
  });

  it('rejects null', () => {
    expect(isValidRole(null)).toBe(false);
  });

  it('rejects a number', () => {
    expect(isValidRole(42)).toBe(false);
  });
});

describe('isValidRoleAssignment', () => {
  it('accepts a valid assignment', () => {
    expect(isValidRoleAssignment(makeAssignment())).toBe(true);
  });

  it('rejects null', () => {
    expect(isValidRoleAssignment(null)).toBe(false);
  });

  it('rejects an assignment with a missing actorId', () => {
    const rest = { ...makeAssignment(), actorId: '' };
    expect(isValidRoleAssignment(rest)).toBe(false);
  });

  it('rejects an assignment with an invalid role', () => {
    expect(isValidRoleAssignment({ ...makeAssignment(), role: 'GODMODE' })).toBe(false);
  });

  it('accepts optional scopeEntityType and scopeEntityId', () => {
    expect(
      isValidRoleAssignment(
        makeAssignment({ scopeEntityType: 'Entity', scopeEntityId: 'ent-001' }),
      ),
    ).toBe(true);
  });
});
